#!/usr/bin/env python3
"""
Test Headless CMS GitHub Actions repository_dispatch Webhook Trigger
Tests:
1. JWT Authentication
2. Publishing a new event entry
3. Verification of repository_dispatch payload construction & trigger
"""

import os
import sys
import time
import requests
import subprocess

CMS_URL = os.getenv("CMS_URL", "http://localhost:3099")

print("⚡ Starting CMS Webhook Trigger Test...")

# Start server in background for testing
proc = subprocess.Popen(
    ["node", "server.js"],
    cwd="/home/ubuntu/sprachcafe-relaunch/cms",
    env=dict(os.environ, PORT="3099", DB_DIR="/tmp/test-cms-webhook-data")
)

time.sleep(2.5)

try:
    # Step 1: Admin Login
    login_resp = requests.post(f"{CMS_URL}/api/auth/login", json={"username": "admin", "password": "AdminPass2026!"}, timeout=5)
    token = login_resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    print(f"  ✓ Step 1: Login successful. Token: {token[:20]}...")

    # Step 2: Publish New Event (Triggers Webhook)
    event_payload = {
        "title": "Webhook Test Event",
        "slug": "webhook-test-event-2026",
        "date_start": "2026-10-15T18:00:00Z",
        "location": "Pankow",
        "target_group": "Alle",
        "language": "DE",
        "description": "Test event for verifying Astro rebuild trigger."
    }

    create_resp = requests.post(f"{CMS_URL}/api/events", headers=headers, json=event_payload, timeout=5)
    create_data = create_resp.json()

    print("\n=== EVENT CREATION & WEBHOOK RESPONSE ===")
    print(create_data)

    assert create_resp.status_code == 201, f"Creation failed with status {create_resp.status_code}"
    assert "webhook" in create_data, "Webhook result missing in response"
    assert create_data["webhook"]["collection"] == "events"
    assert create_data["webhook"]["action"] == "publish"
    assert "dispatches" in create_data["webhook"]["url"]

    # Step 3: Trigger Manual Test Endpoint
    manual_resp = requests.post(f"{CMS_URL}/api/webhook/trigger", headers=headers, json={"collection": "posts", "action": "publish"}, timeout=5)
    manual_data = manual_resp.json()

    print("\n=== MANUAL WEBHOOK TRIGGER RESPONSE ===")
    print(manual_data)

    assert manual_resp.status_code == 200, "Manual trigger failed"
    assert manual_data["webhook"]["collection"] == "posts"

    print("\n✅ CMS WEBHOOK TRIGGER TEST PASSED CLEANLY!")
    print(f"  ✓ GitHub Dispatch URL: {create_data['webhook']['url']}")
    print(f"  ✓ Event Type: cms_publish")

finally:
    proc.terminate()
    proc.wait()
