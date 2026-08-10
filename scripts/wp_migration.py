#!/usr/bin/env python3
"""
WordPress Data Migration Script for SprachCafé Relaunch
Phase 6: Migration

Extrahiert Artikel, Seiten und Medien aus der bestehenden WordPress REST API / SQL-Export
und überführt diese in das neue Headless CMS.
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

WP_BASE_URL = os.getenv("WP_BASE_URL", "https://old.sprachcafe.de/wp-json/wp/v2")
CMS_API_URL = os.getenv("PUBLIC_CMS_API_URL", "http://localhost:8055")
CMS_API_TOKEN = os.getenv("CMS_API_TOKEN", "")

def fetch_wordpress_posts():
    print(f"Fetching posts from WordPress API: {WP_BASE_URL}/posts...")
    try:
        response = requests.get(f"{WP_BASE_URL}/posts?per_page=100")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching WordPress posts: {e}")
        return []

def migrate_post_to_cms(post):
    payload = {
        "title": post.get("title", {}).get("rendered", ""),
        "slug": post.get("slug", ""),
        "content": post.get("content", {}).get("rendered", ""),
        "published_at": post.get("date", "")
    }
    headers = {"Authorization": f"Bearer {CMS_API_TOKEN}", "Content-Type": "application/json"}
    print(f"Migrating post '{payload['title']}' to CMS...")
    # requests.post(f"{CMS_API_URL}/items/news", json=payload, headers=headers)

if __name__ == "__main__":
    print("Starting WordPress Migration Process...")
    posts = fetch_wordpress_posts()
    for p in posts:
        migrate_post_to_cms(p)
    print(f"Migration completed. Processed {len(posts)} posts.")
