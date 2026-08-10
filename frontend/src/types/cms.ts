// TypeScript Types matching Headless CMS Collections for SprachCafé Relaunch

export type LocationTag = 'Pankow' | 'Schöneberg' | 'Köpenick' | 'Global';
export type EventLanguage = 'DE' | 'PL' | 'EN' | 'Bilingual';
export type BookLanguage = 'DE' | 'PL' | 'EN' | 'UKR';
export type LoanStatus = 'verfuegbar' | 'ausgeliehen' | 'reserviert';
export type PostCategory = 'Neuigkeiten' | 'Kultur' | 'SprachCafé' | 'Verein';

export interface I18nText {
  de: string;
  pl: string;
  en: string;
}

// 1. Events Model
export interface EventItem {
  id: string;
  title: string;
  slug: string;
  date_start: string; // ISO String: e.g. "2026-09-15T18:00:00Z"
  date_end?: string;
  location: LocationTag;
  target_group: 'Erwachsene' | 'Familien' | 'Jugendliche' | 'Senioren' | 'Alle';
  language: EventLanguage;
  description: string;
  image?: string;
  max_participants?: number;
}

// 2. Posts (News / Blog) Model
export interface PostItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: PostCategory;
  location_tag?: LocationTag;
  content: string;
  featured_image?: string;
  author?: string;
}

// 3. Books Model (Hausbibliothek)
export interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  language: BookLanguage;
  category: string;
  location: LocationTag;
  status: LoanStatus;
  cover?: string;
  description?: string;
}

// 4. Team & Partner Model
export interface TeamPartnerItem {
  id: string;
  name: string;
  role: string;
  type: 'team' | 'partner';
  bio?: string;
  image?: string;
  website?: string;
  email?: string;
}

// 5. Flexible Layout Blocks for Pages
export type BlockType = 'hero' | 'text' | 'cards' | 'call_to_action';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  background_image?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  heading?: string;
  body: string;
}

export interface CardsBlock extends BaseBlock {
  type: 'cards';
  heading?: string;
  items: Array<{
    title: string;
    description: string;
    icon?: string;
    link?: string;
  }>;
}

export interface CallToActionBlock extends BaseBlock {
  type: 'call_to_action';
  title: string;
  description: string;
  button_label: string;
  button_url: string;
}

export type LayoutBlock = HeroBlock | TextBlock | CardsBlock | CallToActionBlock;

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  blocks: LayoutBlock[];
}
