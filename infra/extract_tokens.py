#!/usr/bin/env python3
"""
Extract Design Tokens from https://sprachcafe-polnisch.org/
Parses colors, font families, font sizes, border-radii, and mark text highlights.
"""

import re
import requests

URL = "https://sprachcafe-polnisch.org/"

def extract():
    print(f"Fetching {URL}...")
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}
    resp = requests.get(URL, headers=headers, timeout=10)
    html = resp.text

    css_links = re.findall(r'href=["\']([^"\']+\.css[^"\']*)["\']', html)
    print(f"Found {len(css_links)} CSS stylesheets.")

    colors = set(re.findall(r'#(?:[0-9a-fA-F]{3,4}){1,2}\b', html))
    font_families = set(re.findall(r'font-family\s*:\s*([^;\}]+)', html, re.IGNORECASE))
    mark_styles = re.findall(r'mark\s*\{([^\}]+)\}', html, re.IGNORECASE)

    all_css_text = html
    for link in css_links:
        if not link.startswith("http"):
            full_url = "https://sprachcafe-polnisch.org" + (link if link.startswith("/") else "/" + link)
        else:
            full_url = link
        try:
            r = requests.get(full_url, headers=headers, timeout=10)
            all_css_text += "\n" + r.text
            colors.update(re.findall(r'#(?:[0-9a-fA-F]{3,4}){1,2}\b', r.text))
            font_families.update(re.findall(r'font-family\s*:\s*([^;\}]+)', r.text, re.IGNORECASE))
            ms = re.findall(r'mark\s*\{([^\}]+)\}', r.text, re.IGNORECASE)
            if ms:
                mark_styles.extend(ms)
        except Exception as e:
            print(f"Error fetching {full_url}: {e}")

    print("\n=== EXTRACTED COLORS ===")
    for c in sorted(list(colors)):
        print(f"  {c}")

    print("\n=== EXTRACTED FONT FAMILIES ===")
    for f in sorted(list(font_families)):
        print(f"  {f.strip()}")

    print("\n=== MARK HIGHLIGHT STYLES ===")
    for m in mark_styles:
        print(f"  mark {{ {m.strip()} }}")

if __name__ == "__main__":
    extract()
