import { defineCollection, z } from 'astro:content';

/**
 * Reusable Multilingual Zod Helpers
 * Each multilingual field contains parallel sets for German (de), Polish (pl), and English (en).
 */
export const i18nString = z.object({
  de: z.string(),
  pl: z.string(),
  en: z.string(),
});

export const i18nOptionalString = z.object({
  de: z.string().optional(),
  pl: z.string().optional(),
  en: z.string().optional(),
}).optional();

// -------------------------------------------------------------
// 1. Events Collection
// -------------------------------------------------------------
const eventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: i18nString,
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    locationRef: z.string(), // Reference to location ID/slug
    targetAudience: i18nString,
    language: z.array(z.enum(['de', 'pl', 'en'])),
    description: i18nString,
    image: z.object({
      src: z.string(),
      alt: i18nString,
    }),
    isFeatured: z.boolean().default(false),
  }),
});

// -------------------------------------------------------------
// 2. Locations Collection
// -------------------------------------------------------------
const locationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: i18nString,
    address: z.object({
      street: z.string(),
      zip: z.string(),
      city: z.string(),
      mapUrl: z.string().url().optional(),
    }),
    openingHours: i18nString,
    description: i18nString,
    directions: i18nString,
    phone: z.string().optional(),
    email: z.string().email().optional(),
    image: z.string().optional(),
  }),
});

// -------------------------------------------------------------
// 3. Team Collection
// -------------------------------------------------------------
const teamCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    category: z.string().optional(),
    role: i18nString,
    contact: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      linkedin: z.string().url().optional(),
    }),
    photo: z.string(),
    bio: i18nOptionalString,
    order: z.number().default(0),
  }),
});

// -------------------------------------------------------------
// 4. Pages Collection (Flexible Layout Blocks for Mission/FAQ/i18n/Impressum/Datenschutz)
// -------------------------------------------------------------
const heroBlockSchema = z.object({
  type: z.literal('hero'),
  title: i18nString,
  subtitle: i18nOptionalString,
  bgImage: z.string().optional(),
});

const missionBlockSchema = z.object({
  type: z.literal('mission'),
  title: i18nString,
  content: i18nString,
  highlights: z.array(i18nString).optional(),
});

const faqBlockSchema = z.object({
  type: z.literal('faq'),
  title: i18nString,
  items: z.array(
    z.object({
      question: i18nString,
      answer: i18nString,
    })
  ),
});

const multilingualBlockSchema = z.object({
  type: z.literal('multilingual_info'),
  title: i18nString,
  description: i18nString,
  languages: z.array(z.string()),
});

const legalBlockSchema = z.object({
  type: z.literal('legal'),
  title: i18nString,
  content: i18nString,
  lastUpdated: z.string().optional(),
});

const textSectionBlockSchema = z.object({
  type: z.literal('text_section'),
  title: i18nOptionalString,
  body: i18nString,
});

const pageBlockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  missionBlockSchema,
  faqBlockSchema,
  multilingualBlockSchema,
  legalBlockSchema,
  textSectionBlockSchema,
]);

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: i18nString,
    blocks: z.array(pageBlockSchema),
  }),
});

// -------------------------------------------------------------
// 5. Testimonials Collection
// -------------------------------------------------------------
const testimonialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    quote: i18nString,
    author: z.string(), // Name or Initials
    role: i18nString,
    avatar: z.string().optional(),
  }),
});

// -------------------------------------------------------------
// 6. Downloads Collection
// -------------------------------------------------------------
const downloadsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: i18nString,
    s3FileUrl: z.string(),
    description: i18nString,
    fileType: z.enum(['pdf', 'doc', 'docx', 'zip', 'png', 'jpg']).default('pdf'),
    fileSize: z.string().optional(),
  }),
});

// -------------------------------------------------------------
// 7. Exhibitions Collection
// -------------------------------------------------------------
const exhibitionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: i18nString,
    artist: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    description: i18nString,
    gallery: z.array(
      z.object({
        url: z.string(),
        caption: i18nOptionalString,
        alt: i18nOptionalString,
      })
    ),
  }),
});

// -------------------------------------------------------------
// 8. ShopItems Collection
// -------------------------------------------------------------
const shopItemsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: i18nString,
    description: i18nString,
    priceDisplay: i18nString,
    image: z.string(),
    availability: z.enum(['in_stock', 'out_of_stock', 'preorder', 'on_request']).default('in_stock'),
    orderLink: z.string().url().optional(),
  }),
});

// Export all collections for Astro Content Collections
export const collections = {
  events: eventsCollection,
  locations: locationsCollection,
  team: teamCollection,
  pages: pagesCollection,
  testimonials: testimonialsCollection,
  downloads: downloadsCollection,
  exhibitions: exhibitionsCollection,
  shopItems: shopItemsCollection,
};
