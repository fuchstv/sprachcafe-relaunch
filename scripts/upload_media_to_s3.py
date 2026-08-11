#!/usr/bin/env python3
"""
Media Upload Utility for SprachCafé Polnisch Content Collections
Uploads images/PDFs directly to AWS S3 bucket 'sprachcafe-media-storage' and outputs
the exact HTTPS URLs and YAML snippets for use in Astro Content Collections.
"""

import os
import sys
import mimetypes
import argparse
import boto3
from botocore.exceptions import BotoCoreError, ClientError

S3_BUCKET = os.getenv("S3_BUCKET_NAME", "sprachcafe-media-storage")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "eu-central-1")

def upload_file_to_s3(file_path: str, folder: str = "uploads") -> dict:
    """Uploads a local file to S3 and returns the public HTTPS URL."""
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    filename = os.path.basename(file_path)
    s3_key = f"{folder.strip('/')}/{filename}"
    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = "application/octet-stream"

    s3_client = boto3.client("s3", region_name=AWS_REGION)

    print(f"📦 Uploading '{filename}' to s3://{S3_BUCKET}/{s3_key}...")
    s3_client.upload_file(
        file_path,
        S3_BUCKET,
        s3_key,
        ExtraArgs={
            "ContentType": content_type,
        }
    )

    s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
    return {
        "filename": filename,
        "s3_key": s3_key,
        "url": s3_url,
        "content_type": content_type
    }

def main():
    parser = argparse.ArgumentParser(description="Upload media (images, PDFs) to S3 for Astro Content Collections.")
    parser.add_argument("files", nargs="+", help="Path(s) to local file(s) to upload")
    parser.add_argument("--folder", "-f", default="uploads", help="Target folder prefix in S3 (e.g. events, team, downloads, exhibitions)")

    args = parser.parse_args()

    results = []
    for f in args.files:
        try:
            res = upload_file_to_s3(f, folder=args.folder)
            results.append(res)
        except Exception as e:
            print(f"❌ Error uploading '{f}': {e}", file=sys.stderr)

    if results:
        print("\n✅ Upload Complete! Resulting S3 URLs:")
        for r in results:
            print(f"\n📄 File: {r['filename']}")
            print(f"🔗 S3 URL: {r['url']}")
            print(f"📋 YAML Snippet:")
            print(f"  src: \"{r['url']}\"")

if __name__ == "__main__":
    main()
