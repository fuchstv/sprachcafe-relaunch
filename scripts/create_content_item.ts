#!/usr/bin/env npx tsx
/**
 * CLI Content Item Generator & PR Creator (Phase R3.1)
 * SprachCafé Relaunch Monorepo
 *
 * Allows team members/developers to create new Content Collection items via CLI.
 * Automatically generates Markdown file, creates git branch `content/<type>-<date>`,
 * commits the file, and pushes the branch to origin.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const FRONTEND_CONTENT_DIR = path.resolve(scriptDir, '../frontend/src/content');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...valParts] = arg.substring(2).split('=');
      params[key] = valParts.join('=');
    }
  }
  return params;
}

function printUsage() {
  console.log(`
🛠️ SPRACHCAFÉ CONTENT CREATOR CLI

Usage:
  npm run create:content -- --type=team --name="Maria Nowak" --role="Pädagogin" --photo="https://..."
  npm run create:content -- --type=exhibition --title="Kunst in Pankow" --artist="Jan Kowalski" --startDate="2026-09-01" --endDate="2026-10-30" --image="https://..."
  npm run create:content -- --type=shop --name="SprachCafé Beutel" --price="10,00 €" --image="https://..."

Supported Types:
  - team
  - exhibition
  - shop
`);
}

async function main() {
  const params = parseArgs();
  const type = params.type;

  if (!type || !['team', 'exhibition', 'shop'].includes(type)) {
    printUsage();
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  let fileName = '';
  let targetDir = '';
  let markdownContent = '';
  let itemTitle = '';

  if (type === 'team') {
    const name = params.name || 'Neues Team-Mitglied';
    itemTitle = name;
    const roleDe = params.role || params.roleDe || 'Pädagogin';
    const rolePl = params.rolePl || roleDe;
    const roleEn = params.roleEn || roleDe;
    const email = params.email || 'kontakt@sprachcafe-polnisch.org';
    const phone = params.phone || '';
    const photo = params.photo || 'https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/team/placeholder.jpg';
    const bioDe = params.bio || params.bioDe || `Team-Mitglied beim SprachCafé Polnisch.`;

    const slug = slugify(name);
    fileName = `${slug}.md`;
    targetDir = path.join(FRONTEND_CONTENT_DIR, 'team');

    markdownContent = `---
name: "${name}"
role:
  de: "${roleDe}"
  pl: "${rolePl}"
  en: "${roleEn}"
contact:
  email: "${email}"
  phone: "${phone}"
photo: "${photo}"
bio:
  de: "${bioDe}"
  pl: "${bioDe}"
  en: "${bioDe}"
order: 10
---
`;
  } else if (type === 'exhibition') {
    const title = params.title || params.titleDe || 'Neue Ausstellung';
    itemTitle = title;
    const artist = params.artist || 'Künstler:in';
    const startDate = params.startDate ? new Date(params.startDate).toISOString() : new Date().toISOString();
    const endDate = params.endDate ? new Date(params.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();
    const desc = params.desc || params.description || `Ausstellung ${title} von ${artist}.`;
    const image = params.image || params.imageUrl || 'https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/exhibitions/placeholder.jpg';

    const slug = slugify(title);
    fileName = `${slug}.md`;
    targetDir = path.join(FRONTEND_CONTENT_DIR, 'exhibitions');

    markdownContent = `---
title:
  de: "${title}"
  pl: "${title}"
  en: "${title}"
artist: "${artist}"
startDate: ${startDate}
endDate: ${endDate}
description:
  de: "${desc}"
  pl: "${desc}"
  en: "${desc}"
gallery:
  - url: "${image}"
    caption:
      de: "${title}"
      pl: "${title}"
      en: "${title}"
    alt:
      de: "${title}"
      pl: "${title}"
      en: "${title}"
---
`;
  } else if (type === 'shop') {
    const name = params.name || params.nameDe || 'Neuer Artikel';
    itemTitle = name;
    const price = params.price || params.priceDisplay || '10,00 € Spendenbeitrag';
    const desc = params.desc || params.description || `SprachCafé Artikel ${name}.`;
    const image = params.image || params.imageUrl || 'https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/shop/placeholder.jpg';
    const availability = params.availability || 'in_stock';

    const slug = slugify(name);
    fileName = `${slug}.md`;
    targetDir = path.join(FRONTEND_CONTENT_DIR, 'shopItems');

    markdownContent = `---
name:
  de: "${name}"
  pl: "${name}"
  en: "${name}"
description:
  de: "${desc}"
  pl: "${desc}"
  en: "${desc}"
priceDisplay:
  de: "${price}"
  pl: "${price}"
  en: "${price}"
image: "${image}"
availability: "${availability}"
orderLink: "https://sprachcafe-polnisch.org/kontakt/"
---
`;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  fs.writeFileSync(filePath, markdownContent, 'utf-8');
  console.log(`✅ File created at: ${filePath}`);

  const branchName = `content/${type}-${timestamp}`;
  console.log(`🌿 Creating Git branch: ${branchName}...`);

  try {
    const cwd = path.resolve(scriptDir, '..');
    execSync(`git checkout -b ${branchName}`, { cwd, stdio: 'inherit' });
    execSync(`git add "${filePath}"`, { cwd, stdio: 'inherit' });
    execSync(`git commit -m "feat(content): add ${type} item '${itemTitle}'"`, { cwd, stdio: 'inherit' });
    console.log(`🚀 Pushing branch ${branchName} to origin...`);
    execSync(`git push origin ${branchName}`, { cwd, stdio: 'inherit' });
    execSync(`git checkout main`, { cwd, stdio: 'inherit' });
    console.log(`
🎉 CONTENT PR BRANCH CREATED & PUSHED!
------------------------------------------------
Branch: ${branchName}
File:   frontend/src/content/${type}/${fileName}

You can now open a Pull Request against 'beta' at:
https://github.com/fuchstv/sprachcafe-relaunch/compare/beta...${branchName}?expand=1
`);
  } catch (err: any) {
    console.error('❌ Git operation error:', err.message);
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
