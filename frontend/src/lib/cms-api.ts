import type { EventItem, PostItem, BookItem, TeamPartnerItem, PageItem } from '../types/cms';

// Mock Data Provider for CMS Collections

export const mockEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Polnisch-Deutscher Sprachabend in Pankow',
    slug: 'sprachabend-pankow-september',
    date_start: '2026-09-15T18:00:00Z',
    date_end: '2026-09-15T20:30:00Z',
    location: 'Pankow',
    target_group: 'Alle',
    language: 'Bilingual',
    description: 'Ein gemütlicher Abend für alle, die Polnisch und Deutsch in ungezwungener Atmosphäre üben möchten. Eintritt frei!',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
    max_participants: 25
  },
  {
    id: 'evt-2',
    title: 'Polnischer Filmklub: Dokumentarfilm & Diskussion',
    slug: 'filmklub-schoeneberg',
    date_start: '2026-09-22T19:00:00Z',
    date_end: '2026-09-22T21:30:00Z',
    location: 'Schöneberg',
    target_group: 'Erwachsene',
    language: 'PL',
    description: 'Gemeinsames Anschauen eines preisgekrönten polnischer Dokus mit anschließender Diskussion bei Tee und Gebäck.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop',
    max_participants: 30
  },
  {
    id: 'evt-3',
    title: 'Autorenlesung & Buchvorstellung Hausbibliothek',
    slug: 'lesung-koepenick',
    date_start: '2026-10-05T17:30:00Z',
    location: 'Köpenick',
    target_group: 'Alle',
    language: 'DE',
    description: 'Präsentation von Neuerscheinungen der zeitgenössischen polnischen Literatur in deutscher Übersetzung.',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop',
    max_participants: 40
  }
];

export const mockPosts: PostItem[] = [
  {
    id: 'post-1',
    title: 'Erfolgreicher Relaunch des SprachCafé Webportals',
    slug: 'erfolgreicher-relaunch-webportal',
    date: '2026-08-10',
    category: 'Neuigkeiten',
    location_tag: 'Global',
    content: 'Wir freuen uns, unsere neue barrierefreie Plattform mit Astro, Headless CMS und digitaler Hausbibliothek vorzustellen.',
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    author: 'Vorstand SprachCafé'
  },
  {
    id: 'post-2',
    title: 'Neue Buchbestände in der Hausbibliothek Köpenick',
    slug: 'neue-buchbestaende-koepenick',
    date: '2026-08-01',
    category: 'Kultur',
    location_tag: 'Köpenick',
    content: 'Dank einer großzügigen Spende wurden über 50 neue zweisprachige Kinder- und Jugendbücher in unseren Katalog aufgenommen.',
    featured_image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop',
    author: 'Bibliotheksteam'
  }
];

export const mockBooks: BookItem[] = [
  {
    id: 'book-1',
    title: 'Bieguni (Unrast)',
    author: 'Olga Tokarczuk',
    isbn: '978-3455002287',
    language: 'PL',
    category: 'Belletristik',
    location: 'Pankow',
    status: 'verfuegbar',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
    description: 'Powieść o współczesnych nomadach, podróży i poszukiwaniu sensu we współczesnym świecie.'
  },
  {
    id: 'book-2',
    title: 'Der Zauberberg',
    author: 'Thomas Mann',
    isbn: '978-3596904006',
    language: 'DE',
    category: 'Klassiker',
    location: 'Pankow',
    status: 'verfuegbar',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop',
    description: 'Klassischer Bildungsroman über Hans Castorp im Sanatorium in den Schweizer Alpen.'
  },
  {
    id: 'book-3',
    title: 'Solaris',
    author: 'Stanisław Lem',
    isbn: '978-8308064436',
    language: 'PL',
    category: 'Science Fiction',
    location: 'Pankow',
    status: 'ausgeliehen',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop',
    description: 'Słynna powieść fantastycznonaukowa o próbach kontaktu z obcą inteligencją.'
  },
  {
    id: 'book-4',
    title: 'The Witcher: Last Wish',
    author: 'Andrzej Sapkowski',
    isbn: '978-0316029186',
    language: 'EN',
    category: 'Fantasy',
    location: 'Pankow',
    status: 'reserviert',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop',
    description: 'Geralt the Witcher encounters monsters and magic in this famous fantasy saga.'
  },
  {
    id: 'book-5',
    title: 'Kobzar (Кобзар)',
    author: 'Taras Schewtschenko',
    isbn: '978-9660378040',
    language: 'UKR',
    category: 'Poesie',
    location: 'Pankow',
    status: 'verfuegbar',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop',
    description: 'Zbiór poezji Tarasa Szewczenki - klasyka literatury ukraińskiej.'
  }
];

import staticBooks from '../data/books.json';

export async function getEvents(): Promise<EventItem[]> {
  return mockEvents;
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  return mockEvents.find(e => e.slug === slug);
}

export async function getPosts(): Promise<PostItem[]> {
  return mockPosts;
}

export async function getPostBySlug(slug: string): Promise<PostItem | undefined> {
  return mockPosts.find(p => p.slug === slug);
}

export async function getBooks(): Promise<BookItem[]> {
  if (Array.isArray(staticBooks) && staticBooks.length > 0) {
    return staticBooks as BookItem[];
  }
  return mockBooks;
}

export async function getBookById(id: string): Promise<BookItem | undefined> {
  const books = await getBooks();
  return books.find(b => b.id === id);
}

