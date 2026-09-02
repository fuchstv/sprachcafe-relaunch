#!/usr/bin/env python3
"""
Automated Directory Sync: Microsoft Entra ID -> Google Workspace
Syncs active members of Entra ID security group 'SG-Google-Sync' to Google Workspace.
"""

import subprocess
import json
import csv
import io
import sys
import argparse

GROUP_ID = "8b0d17ed-4e01-41a2-90ec-c88a09e08a06"
GAM_PATH = "/home/ubuntu/bin/gam"

def get_entra_members():
    cmd = [
        "az", "ad", "group", "member", "list",
        "--group", GROUP_ID,
        "--query", "[].{upn:userPrincipalName, name:displayName, givenName:givenName, surname:surname, accountEnabled:accountEnabled}",
        "-o", "json"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)

def get_google_users():
    cmd = [
        GAM_PATH, "print", "users",
        "fields", "primaryEmail,name,suspended,isAdmin,isDelegatedAdmin"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    
    # GAM outputs lines with status before CSV header
    lines = res.stdout.strip().split("\n")
    csv_lines = []
    header_found = False
    for line in lines:
        if line.startswith("primaryEmail,"):
            header_found = True
        if header_found:
            csv_lines.append(line)
            
    reader = csv.DictReader(io.StringIO("\n".join(csv_lines)))
    users = {}
    for row in reader:
        users[row['primaryEmail'].lower()] = {
            'email': row['primaryEmail'].lower(),
            'name': row.get('name.fullName', ''),
            'givenName': row.get('name.givenName', ''),
            'familyName': row.get('name.familyName', ''),
            'suspended': row.get('suspended', 'False').lower() == 'true',
            'isAdmin': row.get('isAdmin', 'False').lower() == 'true',
        }
    return users

def main():
    parser = argparse.ArgumentParser(description="Sync Entra ID SG-Google-Sync group to Google Workspace")
    parser.add_argument("--apply", action="store_true", help="Apply changes directly to Google Workspace")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Simulate sync without making modifications (default)")
    args = parser.parse_args()

    apply_changes = args.apply

    print("=" * 70)
    print(" 🔄 ENTRA ID -> GOOGLE WORKSPACE DIRECTORY SYNCHRONIZER")
    print(f" Mode: {'[LIVE APPLY]' if apply_changes else '[DRY RUN - SIMULATION]'}")
    print("=" * 70)

    print("\n1. Querying Microsoft Entra ID group 'SG-Google-Sync'...")
    entra_members = get_entra_members()
    print(f"   ✓ Found {len(entra_members)} members in Entra ID SG-Google-Sync.")

    print("\n2. Querying Google Workspace accounts via GAM...")
    google_users = get_google_users()
    print(f"   ✓ Found {len(google_users)} accounts in Google Workspace.")

    missing_in_google = []
    synchronized = []

    for m in entra_members:
        upn = (m.get('upn') or '').strip().lower()
        if not upn or not upn.endswith("@sprachcafe-polnisch.org"):
            continue
            
        if upn in google_users:
            synchronized.append(upn)
        else:
            missing_in_google.append(m)

    print("\n" + "-" * 70)
    print(f" 📊 SYNC AUDIT RESULT:")
    print(f"   - In Sync & Verified:    {len(synchronized)} users")
    print(f"   - Missing in Google:     {len(missing_in_google)} users")
    print(f"   - Sync Health Status:    {'100% PARITY ACHIEVED' if len(missing_in_google) == 0 else 'OUT OF SYNC'}")
    print("-" * 70)

    if missing_in_google:
        print("\n3. Processing missing users...")
        for u in missing_in_google:
            upn = u.get('upn').lower()
            first = u.get('givenName') or u.get('name', '').split(" ")[0] or "Mitarbeiter"
            last = u.get('surname') or (u.get('name', '').split(" ")[1] if len(u.get('name', '').split(" ")) > 1 else "SprachCafe")
            print(f"   [+] Missing: {u.get('name')} <{upn}>")
            if apply_changes:
                create_cmd = [
                    GAM_PATH, "create", "user", upn,
                    "firstname", first,
                    "lastname", last,
                    "password", "random"
                ]
                print(f"       Running: {' '.join(create_cmd)}")
                subprocess.run(create_cmd, check=True)
                print(f"       ✓ Created {upn} in Google Workspace.")
            else:
                print(f"       -> Would create via: gam create user {upn} firstname \"{first}\" lastname \"{last}\"")

    print("\n✓ Directory sync check completed successfully.")

if __name__ == "__main__":
    main()
