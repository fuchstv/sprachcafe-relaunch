# ADR 0003: Retirement of Heavy Directus CMS in Favor of Lightweight Node.js Express API & SQLite

- **Status**: Accepted
- **Date**: 2026-08-11
- **Deciders**: SprachCafé Polnisch Engineering Team

---

## Context

During the deployment optimization phase of the SprachCafé Polnisch website relaunch, a heavy Directus Headless CMS container (with PostgreSQL database and OAuth 2.0 / Entra ID integrations) was evaluated for content and catalog management.

However, operating a full-fledged Directus CMS stack presented significant drawbacks for this project:
1. **High Memory Overhead**: Directus + PostgreSQL consumed over 400 MB of RAM, conflicting with strict memory limits on the 2 GB AWS Lightsail instance.
2. **Authentication Complexity**: OAuth 2.0 / Entra ID SSO configurations introduced complex redirect URIs, strict CORS/CSP header requirements, and runtime session dependencies.
3. **Redundancy**: The core project already featured a robust, zero-overhead Node.js Express API server (`cms/server.js`) with embedded SQLite database, handling content publishing, events, blog posts, and book loan synchronization.

---

## Decision

We decided to **discard and retire the heavy Directus CMS stack** and standardize on the lightweight Node.js Express API server (`cms/server.js`) backed by SQLite.

---

## Consequences

- **Performance & Footprint**: Saved ~400 MB of system RAM, ensuring fast boot times and maximum memory headroom for Caddy and Astro SSR.
- **Maintenance**: Zero complex OAuth 2.0 redirect rules or multi-container DB maintenance.
- **Data Integrity**: Unified SQLite WAL database storing events, posts, pages, and books catalog with automated atomic backups.
- **Operational Simplicity**: Re-instated simple, fast deployment workflows via standard Docker Compose and Caddy reverse proxy rules.
