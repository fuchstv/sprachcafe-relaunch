# Marken-Assets & S3 Media Sync (`brand-assets/`)

Dieses Dokument beschreibt die Extraktion, Optimierung, S3-Synchronisation und Astro-Einbindung aller markenrelevanten Vektor- und Bild-Assets des SprachCafé Polnisch.

---

## 🎨 1. Ubersicht der Marken-Assets

| Asset Dateiname | Typ | Auflösung / Format | Verwendungszweck | Pfad in Frontend | S3 Bucket Pfad |
|-----------------|-----|--------------------|------------------|------------------|----------------|
| `logo.svg` | SVG | Vektor (Responsive) | Hauptlogo im Header Navigation | `/brand-assets/logo.svg` | `s3://sprachcafe-media-storage/brand-assets/logo.svg` |
| `favicon.svg` | SVG | Vektor (64x64) | Favicon in Browser-Tabs | `/brand-assets/favicon.svg` | `s3://sprachcafe-media-storage/brand-assets/favicon.svg` |
| `heart-donation.svg` | SVG | Vektor (Gradient) | Herz-Grafik für Spenden & Newsletter | `/brand-assets/heart-donation.svg` | `s3://sprachcafe-media-storage/brand-assets/heart-donation.svg` |
| `icon-fediverse.svg` | SVG | Vektor (Mono) | Fediverse / Mastodon Social Icon | `/brand-assets/icon-fediverse.svg` | `s3://sprachcafe-media-storage/brand-assets/icon-fediverse.svg` |
| `icon-facebook.svg` | SVG | Vektor (Mono) | Facebook Social Icon | `/brand-assets/icon-facebook.svg` | `s3://sprachcafe-media-storage/brand-assets/icon-facebook.svg` |
| `icon-instagram.svg` | SVG | Vektor (Mono) | Instagram Social Icon | `/brand-assets/icon-instagram.svg` | `s3://sprachcafe-media-storage/brand-assets/icon-instagram.svg` |

---

## 🚀 2. Automatisierte Skripte

1. **Extraktion & Optimierung**:
   - Skript: [`scripts/fetch_and_optimize_brand_assets.py`](../scripts/fetch_and_optimize_brand_assets.py)
   - Extrahiert Marken-Assets aus der WordPress-Medienbibliothek, optimiert sie als skalierbare SVGs / WebP und legt sie lokal ab.
2. **S3 Deployment**:
   - Skript: [`scripts/upload_brand_assets_s3.py`](../scripts/upload_brand_assets_s3.py)
   - Synchronisiert den lokalen Ordner `frontend/public/brand-assets/` mit dem S3-Bucket `sprachcafe-media-storage` unter dem Präfix `brand-assets/`.

---

## ⚙️ 3. Einbindung im Astro-Layout ([`Layout.astro`](../frontend/src/layouts/Layout.astro))

- **Favicon**:
  ```html
  <link rel="icon" type="image/svg+xml" href="/brand-assets/favicon.svg" />
  ```
- **Logo**:
  ```html
  <img src="/brand-assets/logo.svg" alt="SprachCafé Polnisch Logo" class="h-10 w-auto" />
  ```
- **Footer Social & Spenden Icons**:
  ```html
  <img src="/brand-assets/heart-donation.svg" alt="Spenden Herz-Icon" class="w-6 h-6" />
  <img src="/brand-assets/icon-fediverse.svg" alt="Fediverse Icon" class="w-5 h-5" />
  ```
