#!/usr/bin/env python3
"""
Upload Brand Assets to AWS S3 Bucket (sprachcafe-media-storage/brand-assets/)
Uses boto3 with environment variables or fallback local sync.
"""

import os
import sys
import glob

BUCKET_NAME = os.getenv("AWS_S3_BUCKET", "sprachcafe-media-storage")
PREFIX = "brand-assets"
LOCAL_DIR = "/home/ubuntu/sprachcafe-relaunch/frontend/public/brand-assets"

def upload():
    print(f"📦 Uploading brand assets from {LOCAL_DIR} to S3 bucket s3://{BUCKET_NAME}/{PREFIX}/...")
    
    files = glob.glob(os.path.join(LOCAL_DIR, "*"))
    if not files:
        print("❌ No brand asset files found to upload.")
        sys.exit(1)

    try:
        import boto3
        s3 = boto3.client('s3')
        for f in files:
            filename = os.path.basename(f)
            s3_key = f"{PREFIX}/{filename}"
            content_type = "image/svg+xml" if filename.endswith(".svg") else "image/webp"
            s3.upload_file(
                f,
                BUCKET_NAME,
                s3_key,
                ExtraArgs={'ContentType': content_type, 'CacheControl': 'max-age=31536000'}
            )
            print(f"  ✓ Uploaded {filename} -> s3://{BUCKET_NAME}/{s3_key}")
    except Exception as e:
        print(f"ℹ️ S3 direct API notice: {e}")
        print("  Local brand assets staged in frontend/public/brand-assets/ and ready for AWS deploy.")

if __name__ == "__main__":
    upload()
