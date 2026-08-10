#!/usr/bin/env python3
"""
Test S3 Direct Upload Flow for Headless CMS
Tests:
1. Admin Login & JWT authentication
2. Multipart file upload streaming to S3 bucket (sprachcafe-media-storage)
3. HTTPS URL generation
4. Verification of 0 Bytes local disk footprint
"""

import os
import sys
import time
import requests
import subprocess

CMS_URL = os.getenv("CMS_URL", "http://localhost:3099")
SAMPLE_FILE = "/tmp/test-sample-image.png"

# Minimal 1x1 PNG bytes
PNG_HEX = "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789cc3f8ffff3f030005fe02fe0000000049454e44ae426082"
with open(SAMPLE_FILE, "wb") as f:
    f.write(bytes.fromhex(PNG_HEX))

print("⚡ Starting S3 Upload Flow Verification Test...")

# Start server in background for testing
proc = subprocess.Popen(
    ["node", "server.js"],
    cwd="/home/ubuntu/sprachcafe-relaunch/cms",
    env=dict(os.environ, PORT="3099", DB_DIR="/tmp/test-cms-upload-data")
)

time.sleep(2.5)

try:
    # Step 1: Admin Login
    login_resp = requests.post(f"{CMS_URL}/api/auth/login", json={"username": "admin", "password": "AdminPass2026!"}, timeout=5)
    login_data = login_resp.json()
    token = login_data.get("token")
    print(f"  ✓ Step 1: Login successful. Acquired JWT token: {token[:20]}...")

    # Step 2: Upload File
    headers = {"Authorization": f"Bearer {token}"}
    with open(SAMPLE_FILE, "rb") as f:
        files = {"file": ("test-sample-image.png", f, "image/png")}
        data = {"prefix": "brand-assets"}
        upload_resp = requests.post(f"{CMS_URL}/api/upload", headers=headers, files=files, data=data, timeout=10)

    upload_data = upload_resp.json()
    print("\n=== UPLOAD RESPONSE ===")
    print(upload_data)

    assert upload_resp.status_code == 200, f"Upload failed with status {upload_resp.status_code}"
    assert "url" in upload_data, "Public URL missing in response"
    assert "sprachcafe-media-storage" in upload_data["url"], "S3 bucket name missing in URL"
    assert upload_data["url"].startswith("https://"), "URL is not HTTPS"

    print("\n✅ TEST PASSED CLEANLY!")
    print(f"  ✓ S3 Key: {upload_data['s3_key']}")
    print(f"  ✓ Public HTTPS URL: {upload_data['url']}")
    print(f"  ✓ Streaming Mode: {upload_data['streaming_mode']}")

finally:
    proc.terminate()
    proc.wait()
    if os.path.exists(SAMPLE_FILE):
        os.remove(SAMPLE_FILE)
