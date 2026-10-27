import { register } from 'node:module';
import { mock, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

register('data:text/javascript,' + encodeURIComponent(`
export function resolve(specifier, context, nextResolve) {
  if (specifier === 'astro:content') {
    return {
      shortCircuit: true,
      url: 'data:text/javascript,export function getCollection() {}',
    };
  }
  return nextResolve(specifier, context);
}
`), import.meta.url);

let mockGetCollectionImpl: (collection: string) => Promise<any[]> = async () => [];

mock.module('astro:content', {
  namedExports: {
    getCollection: (collection: string) => mockGetCollectionImpl(collection)
  }
});

describe('pages.json.ts GET handler', () => {
  beforeEach(() => {
    mockGetCollectionImpl = async () => [];
  });

  it('returns 200 and formatted pages when legal block is present', async () => {
    mockGetCollectionImpl = async (collection: string) => {
      assert.equal(collection, 'pages');
      return [
        {
          slug: 'impressum',
          data: {
            title: { de: 'Impressum DE', pl: 'Impressum PL', en: 'Impressum EN' },
            blocks: [
              {
                type: 'legal',
                content: {
                  de: 'Legal Content DE',
                  pl: 'Legal Content PL',
                  en: 'Legal Content EN'
                }
              }
            ]
          }
        }
      ];
    };

    const { GET } = await import('../pages/export/pages.json.js');
    const response = await GET({} as any);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
    assert.equal(response.headers.get('Cache-Control'), 'public, max-age=300, s-maxage=600');

    const data = await response.json();
    assert.deepEqual(data, [
      {
        slug: 'impressum',
        title_de: 'Impressum DE',
        title_pl: 'Impressum PL',
        title_en: 'Impressum EN',
        content_de: 'Legal Content DE',
        content_pl: 'Legal Content PL',
        content_en: 'Legal Content EN',
        source: 'Astro Content Collections (Headless CMS)'
      }
    ]);
  });

  it('returns 200 and formatted pages when text_section block is present', async () => {
    mockGetCollectionImpl = async (collection: string) => {
      return [
        {
          slug: 'about',
          data: {
            title: { de: 'Über Uns', pl: 'O nas', en: 'About Us' },
            blocks: [
              {
                type: 'text_section',
                body: {
                  de: 'Text DE',
                  pl: 'Text PL',
                  en: 'Text EN'
                }
              }
            ]
          }
        }
      ];
    };

    const { GET } = await import('../pages/export/pages.json.js');
    const response = await GET({} as any);

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(data, [
      {
        slug: 'about',
        title_de: 'Über Uns',
        title_pl: 'O nas',
        title_en: 'About Us',
        content_de: 'Text DE',
        content_pl: 'Text PL',
        content_en: 'Text EN',
        source: 'Astro Content Collections (Headless CMS)'
      }
    ]);
  });

  it('returns 200 with empty content when no legal or text_section block is present', async () => {
    mockGetCollectionImpl = async () => [
      {
        slug: 'empty-blocks',
        data: {
          title: { de: 'Titel', pl: 'Tytuł', en: 'Title' },
          blocks: [{ type: 'other' }]
        }
      }
    ];

    const { GET } = await import('../pages/export/pages.json.js');
    const response = await GET({} as any);

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data[0].content_de, '');
    assert.equal(data[0].content_pl, '');
    assert.equal(data[0].content_en, '');
  });

  it('returns 500 and structured error response when getCollection fails', async () => {
    const errorMessage = 'Failed to load content collection database';
    mockGetCollectionImpl = async () => {
      throw new Error(errorMessage);
    };

    const { GET } = await import('../pages/export/pages.json.js');
    const response = await GET({} as any);

    assert.equal(response.status, 500);
    assert.equal(response.headers.get('Content-Type'), 'application/json');

    const data = await response.json();
    assert.deepEqual(data, {
      error: 'Failed to export pages collection',
      message: errorMessage
    });
  });
});
