import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEvents,
  getEventBySlug,
  mockEvents,
  getPosts,
  getPostBySlug,
  mockPosts,
  getBooks,
  getBookById
} from './cms-api';

describe('CMS API', () => {
  describe('getEvents', () => {
    it('returns all mock events', async () => {
      const events = await getEvents();
      assert.deepEqual(events, mockEvents);
      assert.ok(events.length > 0);
    });
  });

  describe('getEventBySlug', () => {
    it('returns the correct event when matching slug exists (hit scenario)', async () => {
      const event = await getEventBySlug('sprachabend-pankow-september');
      assert.ok(event !== undefined);
      assert.equal(event?.id, 'evt-1');
      assert.equal(event?.title, 'Polnisch-Deutscher Sprachabend in Pankow');
      assert.equal(event?.slug, 'sprachabend-pankow-september');
    });

    it('returns the correct event for another valid slug', async () => {
      const event = await getEventBySlug('filmklub-schoeneberg');
      assert.ok(event !== undefined);
      assert.equal(event?.id, 'evt-2');
      assert.equal(event?.title, 'Polnischer Filmklub: Dokumentarfilm & Diskussion');
    });

    it('returns undefined when slug is not found (miss scenario)', async () => {
      const event = await getEventBySlug('non-existent-event-slug');
      assert.equal(event, undefined);
    });

    it('returns undefined for empty string or whitespace slug', async () => {
      const emptyEvent = await getEventBySlug('');
      assert.equal(emptyEvent, undefined);

      const whitespaceEvent = await getEventBySlug('   ');
      assert.equal(whitespaceEvent, undefined);
    });

    it('is case-sensitive when looking up event slugs', async () => {
      const uppercaseEvent = await getEventBySlug('SPRACHABEND-PANKOW-SEPTEMBER');
      assert.equal(uppercaseEvent, undefined);
    });
  });

  describe('getPosts', () => {
    it('returns all mock posts', async () => {
      const posts = await getPosts();
      assert.deepEqual(posts, mockPosts);
      assert.ok(posts.length > 0);
    });
  });

  describe('getPostBySlug', () => {
    it('returns the correct post when matching slug exists', async () => {
      const post = await getPostBySlug('erfolgreicher-relaunch-webportal');
      assert.ok(post !== undefined);
      assert.equal(post?.id, 'post-1');
    });

    it('returns undefined when post slug is not found', async () => {
      const post = await getPostBySlug('unknown-post');
      assert.equal(post, undefined);
    });
  });

  describe('getBooks and getBookById', () => {
    it('returns books array', async () => {
      const books = await getBooks();
      assert.ok(Array.isArray(books));
      assert.ok(books.length > 0);
    });

    it('returns book by ID when exists', async () => {
      const books = await getBooks();
      const firstBook = books[0];
      const foundBook = await getBookById(firstBook.id);
      assert.deepEqual(foundBook, firstBook);
    });

    it('returns undefined when book ID is not found', async () => {
      const foundBook = await getBookById('non-existent-id-123456');
      assert.equal(foundBook, undefined);
    });
  });
});
