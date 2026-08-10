#!/usr/bin/env python3
"""
Download self-hosted WOFF2 fonts for Open Sans & Montserrat from Google Fonts CDN
and save clean unique WOFF2 files to frontend/public/fonts/ with font-display: swap.
"""

import os
import re
import requests

FONTS_DIR = "/home/ubuntu/sprachcafe-relaunch/frontend/public/fonts"
CSS_OUT = "/home/ubuntu/sprachcafe-relaunch/frontend/src/styles/fonts.css"

os.makedirs(FONTS_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CSS_OUT), exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Fetch Google Fonts CSS for Open Sans & Montserrat
GF_URL = "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;600;700&display=swap"

print(f"Fetching Google Fonts definitions from {GF_URL}...")
resp = requests.get(GF_URL, headers=HEADERS, timeout=10)
css_content = resp.text

# Extract all font-face blocks
font_blocks = re.findall(r'/\* ([^*]+) \*/\s*@font-face\s*\{([^}]+)\}', css_content)

new_css_blocks = []
count = 0

for subset, block in font_blocks:
    subset_clean = subset.strip().replace(' ', '-')
    url_match = re.search(r'url\((https://fonts.gstatic.com/[^)]+)\)', block)
    if not url_match:
        continue
    
    url = url_match.group(1)
    
    # Determine font family and weight
    family = "montserrat" if "Montserrat" in block else "open-sans"
    weight_match = re.search(r'font-weight:\s*(\d+)', block)
    weight = weight_match.group(1) if weight_match else "400"
    
    count += 1
    filename = f"{family}-{subset_clean}-{weight}.woff2"
    local_path = os.path.join(FONTS_DIR, filename)
    
    # Download file
    font_resp = requests.get(url, headers=HEADERS, timeout=10)
    with open(local_path, "wb") as f:
        f.write(font_resp.content)
    
    print(f"  ✓ Downloaded {filename} ({len(font_resp.content)} bytes)")
    
    # Update block with local path and font-display: swap
    new_block = block.replace(url, f"/fonts/{filename}")
    if "font-display:" not in new_block:
        new_block += "\n  font-display: swap;"
    
    new_css_blocks.append(f"/* {subset} */\n@font-face {{{new_block}\n}}")

# Write clean fonts.css
with open(CSS_OUT, "w", encoding="utf-8") as f:
    f.write("/* Self-Hosted WOFF2 Fonts for SprachCafé Polnisch (Zero External Requests, DSGVO Compliant) */\n\n" + "\n\n".join(new_css_blocks))

print(f"\n✅ Successfully downloaded {count} WOFF2 font files to {FONTS_DIR}")
print(f"✅ Generated {CSS_OUT} with font-display: swap definitions.")
