import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const rawPages = await getCollection('pages');

    const formattedPages = rawPages.map((entry) => {
      const data = entry.data;
      const slug = entry.slug;

      // Extract legal or text_section block content
      const legalBlock = data.blocks?.find(b => b.type === 'legal' || b.type === 'text_section');

      let contentDe = '';
      let contentPl = '';
      let contentEn = '';

      if (legalBlock) {
        if (legalBlock.type === 'legal') {
          contentDe = legalBlock.content.de;
          contentPl = legalBlock.content.pl;
          contentEn = legalBlock.content.en;
        } else if (legalBlock.type === 'text_section') {
          contentDe = legalBlock.body.de;
          contentPl = legalBlock.body.pl;
          contentEn = legalBlock.body.en;
        }
      }

      return {
        slug,
        title_de: data.title.de,
        title_pl: data.title.pl,
        title_en: data.title.en,
        content_de: contentDe,
        content_pl: contentPl,
        content_en: contentEn,
        source: 'Astro Content Collections (Headless CMS)'
      };
    });

    return new Response(JSON.stringify(formattedPages, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to export pages collection', message: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
