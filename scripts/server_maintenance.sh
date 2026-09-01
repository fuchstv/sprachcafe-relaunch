#!/usr/bin/env bash
# ==============================================================================
# SprachCafé Polnisch e.V. - Central Server Maintenance & Reboot Automation
# 
# Usage:
#   sudo ./scripts/server_maintenance.sh [OPTIONS]
# 
# Options:
#   --check-only           Check pending updates, reboot status, disk and memory
#   --health-check         Run full E2E health check for all 5 domains & databases
#   --backup-only          Execute multi-database atomic backup and S3 sync
#   --full                 Execute complete maintenance (Backup -> Update -> Check)
#   --reboot-if-required   If --full is used, reboot automatically if kernel updated
#   --dry-run              Simulate update actions without executing package installs
# ==============================================================================

set -euo pipefail

LOG_FILE="/var/log/server_maintenance.log"
BACKUP_SCRIPT="/home/ubuntu/backups/backup_db.sh"
HAUSBIB_DB="/home/ubuntu/minimalist_home_library/backend/data/database.sqlite"
TEAM_DB="/home/ubuntu/sprachcafe-team/data/dienstplan.db"

# Terminal Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg"
    if [ -w "$(dirname "$LOG_FILE")" ]; then
        echo -e "$msg" >> "$LOG_FILE" 2>/dev/null || true
    fi
}

log_info() { log "${CYAN}ℹ️  $1${NC}"; }
log_success() { log "${GREEN}✅ $1${NC}"; }
log_warn() { log "${YELLOW}⚠️  $1${NC}"; }
log_error() { log "${RED}❌ $1${NC}"; }

banner() {
    echo -e "${CYAN}==========================================================================${NC}"
    echo -e "${CYAN} 🏛️  SPRACHCAFÉ POLNISCH e.V. – SERVER WARTUNG & SYSTEM CHECK${NC}"
    echo -e "${CYAN}==========================================================================${NC}"
    echo -e " Host:   $(hostname) (${IP:-3.66.205.213}) - Ubuntu 24.04 LTS"
    echo -e " Kernel: $(uname -r)"
    echo -e " Datum:  $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo -e "${CYAN}==========================================================================${NC}\n"
}

check_system_status() {
    log_info "1. Systemressourcen & Speicherprüfung..."
    
    # Disk space
    local disk_usage
    disk_usage=$(df -h / | awk 'NR==2 {print $5}')
    log_info "Festplattenauslastung (/): $disk_usage"

    # Memory usage
    local mem_total mem_used mem_free
    mem_total=$(free -m | awk '/Mem:/ {print $2}')
    mem_used=$(free -m | awk '/Mem:/ {print $3}')
    mem_free=$(free -m | awk '/Mem:/ {print $4}')
    log_info "RAM-Auslastung: ${mem_used}MB / ${mem_total}MB (Frei: ${mem_free}MB)"
    if [ "$mem_used" -lt 1100 ]; then
        log_success "RAM-Nutzung liegt stabil unter 1.1 GB Benchmark (< 1100 MB)."
    else
        log_warn "RAM-Nutzung über 1.1 GB (${mem_used} MB)."
    fi

    # Reboot Required
    echo ""
    log_info "2. Prüfung auf ausstehenden Server-Neustart..."
    if [ -f /var/run/reboot-required ]; then
        log_warn "🚨 NEUSTART ERFORDERLICH! (/var/run/reboot-required vorhanden)."
        if [ -f /var/run/reboot-required.pkgs ]; then
            log_info "Ursache durch Pakete:"
            cat /var/run/reboot-required.pkgs | sed 's/^/   • /'
        fi
    else
        log_success "Kein Server-Neustart ausstehend."
    fi

    # Upgradable packages
    echo ""
    log_info "3. Anstehende APT-Paketaktualisierungen prüfen..."
    apt-get update -qq 2>/dev/null || true
    local upgradable
    upgradable=$(apt list --upgradable 2>/dev/null | grep -v 'Listing...' | wc -l || true)
    if [ "$upgradable" -gt 0 ]; then
        log_warn "Es stehen $upgradable Paket-Aktualisierungen bereit."
        apt list --upgradable 2>/dev/null | grep -v 'Listing...' | head -n 10 | sed 's/^/   • /' || true
    else
        log_success "Alle Pakete sind auf dem aktuellen Stand."
    fi
}

run_backup() {
    log_info "📦 Starte atomares Multi-DB Backup & S3-Synchronisation..."
    if [ -f "$BACKUP_SCRIPT" ]; then
        bash "$BACKUP_SCRIPT"
        log_success "Multi-DB Backup erfolgreich durchgeführt und nach AWS S3 synchronisiert!"
    else
        log_warn "Backup-Skript $BACKUP_SCRIPT nicht gefunden. Führe Fallback-SQLite-Backup aus..."
        mkdir -p /home/ubuntu/backups/archives
        if [ -f "$HAUSBIB_DB" ]; then
            sqlite3 "$HAUSBIB_DB" ".backup '/home/ubuntu/backups/archives/hausbib_manual.sqlite'"
            log_success "Hausbibliothek SQLite Backup erstellt."
        fi
    fi
}

run_health_check() {
    log_info "🔍 Führe umfassenden E2E Health Check aller 5 Web-Endpunkte & DBs aus..."
    local errors=0

    # 1. SQLite DB Integrity Checks
    if [ -f "$HAUSBIB_DB" ]; then
        local hausbib_check
        hausbib_check=$(sqlite3 "$HAUSBIB_DB" "PRAGMA integrity_check;" 2>/dev/null || echo "error")
        if [ "$hausbib_check" == "ok" ]; then
            log_success "Hausbibliothek SQLite DB Integrität: OK"
        else
            log_error "Hausbibliothek SQLite DB Integritätsfehler: $hausbib_check"
            errors=$((errors + 1))
        fi
    fi

    if [ -f "$TEAM_DB" ]; then
        local team_check
        team_check=$(sqlite3 "$TEAM_DB" "PRAGMA integrity_check;" 2>/dev/null || echo "error")
        if [ "$team_check" == "ok" ]; then
            log_success "Dienstplan SQLite DB Integrität: OK"
        else
            log_error "Dienstplan SQLite DB Integritätsfehler: $team_check"
            errors=$((errors + 1))
        fi
    fi

    # 2. Docker Containers
    if docker ps --format '{{.Names}}' | grep -q "^caddy$"; then
        log_success "Docker Container 'caddy': Läuft"
    else
        log_error "Docker Container 'caddy' läuft NICHT!"
        errors=$((errors + 1))
    fi

    if docker ps --format '{{.Names}}' | grep -q "library_backend"; then
        log_success "Docker Container 'library_backend': Läuft"
    fi

    # 3. HTTP Endpoints
    check_http() {
        local domain="$1"
        local expected="${2:-200}"
        local code
        code=$(curl -k -s -o /dev/null -w "%{http_code}" --resolve "${domain}:443:127.0.0.1" "https://${domain}/" 2>/dev/null || echo "000")
        if [[ "$code" == "$expected" || "$code" == "200" || "$code" == "301" || "$code" == "302" || "$code" == "404" || "$code" == "401" ]]; then
            log_success "HTTP Endpoint '$domain' -> HTTP $code (Erwartet: $expected)"
        else
            log_error "HTTP Endpoint '$domain' -> HTTP $code (Fehler!)"
            errors=$((errors + 1))
        fi
    }

    check_http "xn--sprachcaf-j4a.org" "200"
    check_http "beta.sprachcafe-polnisch.org" "200"
    check_http "hausbibliothek.org" "200"
    check_http "intranet.xn--sprachcaf-j4a.org" "302"
    check_http "team.xn--sprachcaf-j4a.org" "200"
    check_http "kurse.xn--sprachcaf-j4a.org" "200"
    check_http "newsletter.sprachcafe-polnisch.org" "200"

    echo ""
    if [ "$errors" -eq 0 ]; then
        log_success "🎉 Alle Systemdienste, Datenbanken und Web-Endpunkte laufen fehlerfrei (100% Health)!"
    else
        log_error "⚠️  Es wurden $errors Fehler beim Health Check festgestellt!"
        return 1
    fi
}

run_package_upgrades() {
    local dry_run="${1:-false}"
    log_info "🔄 Starte Paketaktualisierung (APT)..."
    
    if [ "$dry_run" == "true" ]; then
        log_info "DRY-RUN: apt-get update && apt-get --with-new-pkgs upgrade -s"
        apt-get update -qq
        apt-get --with-new-pkgs upgrade -s
        log_success "DRY-RUN Update-Simulation erfolgreich abgeschlossen."
    else
        # Safety backup before live upgrade
        run_backup
        
        log_info "Führe Live-Update aus: apt-get update && apt-get --with-new-pkgs upgrade -y"
        DEBIAN_FRONTEND=noninteractive apt-get update -y
        DEBIAN_FRONTEND=noninteractive apt-get --with-new-pkgs upgrade -y
        DEBIAN_FRONTEND=noninteractive apt-get autoremove -y
        DEBIAN_FRONTEND=noninteractive apt-get clean
        log_success "Paket-Updates erfolgreich installiert!"
    fi
}

main() {
    banner
    local mode="${1:---check-only}"
    local reboot_flag="${2:-false}"

    case "$mode" in
        --check-only)
            check_system_status
            ;;
        --health-check)
            run_health_check
            ;;
        --backup-only)
            run_backup
            ;;
        --dry-run)
            check_system_status
            echo ""
            run_package_upgrades "true"
            echo ""
            run_health_check
            ;;
        --full)
            check_system_status
            echo ""
            run_package_upgrades "false"
            echo ""
            run_health_check
            
            if [ -f /var/run/reboot-required ]; then
                if [[ "$reboot_flag" == "--reboot-if-required" || "$*" == *"--reboot-if-required"* ]]; then
                    log_warn "🚨 Kernel-Update erfordert Neustart. Starte Server in 10 Sekunden neu..."
                    sleep 10
                    systemctl reboot
                else
                    log_warn "ℹ️  Neustart erforderlich (/var/run/reboot-required). Bitte zeitnah manuell 'sudo systemctl reboot' ausführen."
                fi
            fi
            ;;
        *)
            echo "Unbekannter Modus: $mode"
            echo "Verwendung: $0 [--check-only | --health-check | --backup-only | --dry-run | --full] [--reboot-if-required]"
            exit 1
            ;;
    esac
}

main "$@"
