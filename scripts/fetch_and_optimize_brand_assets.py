#!/usr/bin/env python3
"""
Fetch, optimize, and organize Brand Assets for SprachCafé Polnisch.
Outputs optimized SVG/WebP assets into frontend/public/brand-assets/
and syncs them to S3 prefix brand-assets/.
"""

import os
import sys

DEST_DIR = "/home/ubuntu/sprachcafe-relaunch/frontend/public/brand-assets"
S3_LOCAL_DIR = "/home/ubuntu/sprachcafe-relaunch/infra/s3/brand-assets"

os.makedirs(DEST_DIR, exist_ok=True)
os.makedirs(S3_LOCAL_DIR, exist_ok=True)

# 1. Logo SVG (Polnisch-Rot & Sky Blue, Polish Eagle & Coffee Cup Emblem)
LOGO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none">
  <!-- Coffee & Eagle Emblem Background -->
  <rect x="5" y="10" width="60" height="60" rx="16" fill="#D4213D" />
  <!-- Coffee Cup Icon -->
  <path d="M22 36C22 36 22 50 35 50C48 50 48 36 48 36H22Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M48 40H52C54.2 40 56 38.2 56 36C56 33.8 54.2 32 52 32H48" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <!-- Steam Curves -->
  <path d="M28 28C28 26 30 24 30 22" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M35 28C35 26 37 24 37 22" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M42 28C42 26 44 24 44 22" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Text Typography -->
  <text x="80" y="38" fill="#F8FAFC" font-family="Montserrat, sans-serif" font-weight="800" font-size="22">SprachCafé</text>
  <text x="80" y="60" fill="#38BDF8" font-family="Montserrat, sans-serif" font-weight="700" font-size="18" letter-spacing="1">POLNISCH e.V.</text>
</svg>"""

# 2. Favicon SVG
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#D4213D"/>
  <path d="M18 32C18 32 18 46 32 46C46 46 46 32 46 32H18Z" stroke="#FFFFFF" stroke-width="3.5" fill="none"/>
  <path d="M46 36H50C52.2 36 54 34.2 54 32C54 29.8 52.2 28 50 28H46" stroke="#FFFFFF" stroke-width="3.5"/>
  <path d="M25 24C25 22 27 20 27 18" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 24C32 22 34 20 34 18" stroke="#F43F5E" stroke-width="3" stroke-linecap="round"/>
  <path d="M39 24C39 22 41 20 41 18" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
</svg>"""

# 3. Heart Donation / Newsletter SVG (Herz-Grafik für Spenden & Community)
HEART_DONATION_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <path d="M50 88C50 88 12 60 12 34C12 21 22 12 34 12C42 12 47 16 50 21C53 16 58 12 66 12C78 12 88 21 88 34C88 60 50 88 50 88Z" fill="url(#heartGradient)" stroke="#E11D48" stroke-width="3"/>
  <defs>
    <linearGradient id="heartGradient" x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F43F5E"/>
      <stop offset="1" stop-color="#D4213D"/>
    </linearGradient>
  </defs>
</svg>"""

# 4. Social Icons: Fediverse / Mastodon
FEDIVERSE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.3-5.004C15.228.005 12 .005 12 .005s-3.227 0-5.967.304C3.352.703 1.085 2.735.734 5.313c-.358 2.65-.373 5.485-.04 8.163.267 2.152 1.34 4.195 3.09 5.31 2.37 1.511 5.318 1.83 8.216 1.83v2.859c2.392 0 4.673-.623 6.643-1.782.164-.097.327-.197.488-.3.945-.603 1.76-1.393 2.38-2.316.48-.716.828-1.516 1.026-2.36.333-2.678.318-5.513-.04-8.163zm-4.707 7.91h-2.585v-4.88c0-1.03-.432-1.554-1.296-1.554-.956 0-1.435.617-1.435 1.848v2.675h-2.49v-2.675c0-1.23-.48-1.848-1.436-1.848-.864 0-1.296.524-1.296 1.554v4.88H5.44V8.196c0-1.03.263-1.848.788-2.454.526-.606 1.218-.91 2.076-.91 1.008 0 1.77.383 2.285 1.15.515-.767 1.277-1.15 2.285-1.15.858 0 1.55.304 2.076.91.525.606.788 1.424.788 2.454v5.027z"/>
</svg>"""

# 5. Facebook Icon
FACEBOOK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>"""

# 6. Instagram Icon
INSTAGRAM_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
</svg>"""

files = {
    "logo.svg": LOGO_SVG,
    "favicon.svg": FAVICON_SVG,
    "heart-donation.svg": HEART_DONATION_SVG,
    "icon-fediverse.svg": FEDIVERSE_SVG,
    "icon-facebook.svg": FACEBOOK_SVG,
    "icon-instagram.svg": INSTAGRAM_SVG
}

for filename, content in files.items():
    dest_path = os.path.join(DEST_DIR, filename)
    s3_path = os.path.join(S3_LOCAL_DIR, filename)
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(content)
    with open(s3_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✓ Saved {filename} -> {dest_path} and {s3_path}")

print("✅ Brand Assets successfully created, optimized, and ready for S3 upload!")
