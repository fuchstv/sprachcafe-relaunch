import type { APIRoute } from 'astro';

export const prerender = false;

interface ContactPayload {
  name: string;
  email: string;
  topic?: string;
  subject: string;
  message: string;
  website_url?: string; // Honeypot field
  submitted_at?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: ContactPayload = await request.json();

    // --- 1. Honeypot check ---
    if (data.website_url && data.website_url.trim().length > 0) {
      // Bot trapped in honeypot -> silently accept with 200 OK so bot does not retry
      return new Response(JSON.stringify({ status: 'ok', message: 'Message received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 2. Required fields & email format validation ---
    if (!data.name || !data.email || !data.subject || !data.message) {
      return new Response(JSON.stringify({ status: 'error', message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 3. Spam Triage Heuristics ---
    const corpus = `${data.name} ${data.email} ${data.subject} ${data.message}`;

    // Cyrillic link spam without community keywords
    const hasCyrillic = /[\u0400-\u04FF]/.test(corpus);
    const hasCommunityKeywords = /\b(sprachcafe|berlin|polnisch|polski|kurs|dzieci|dziecko|niemiec|spotkanie|warsztat|termin|pankow|schöneberg|köpenick|hallo|guten|dzień|dobry|zapraszamy|kontakt)\b/i.test(corpus);
    if (hasCyrillic && !hasCommunityKeywords) {
      console.warn('[Contact API Spam Quarantined] Cyrillic without community context:', data.email);
      return new Response(JSON.stringify({ status: 'ok', message: 'Message received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // URL shorteners & high link density
    const shorteners = ['cutt.ly', 'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'rb.gy'];
    if (shorteners.some(s => corpus.toLowerCase().includes(s))) {
      console.warn('[Contact API Spam Quarantined] Spam URL shortener:', data.email);
      return new Response(JSON.stringify({ status: 'ok', message: 'Message received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const urlMatches = corpus.match(/https?:\/\/[^\s]+/gi) || [];
    if (urlMatches.length >= 2) {
      console.warn('[Contact API Spam Quarantined] Excessive URLs count:', urlMatches.length);
      return new Response(JSON.stringify({ status: 'ok', message: 'Message received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Commercial pitch phrases
    const commercialSpam = [
      /7-day free trial/i,
      /website traffic/i,
      /adaptive AI handles/i,
      /ad-platform complexity/i,
      /guest post/i,
      /seo audit/i,
      /ranking on google/i,
      /crypto|bitcoin|forex/i,
      /casino|slot machine|betting/i,
      /viagra|cialis|pharmacy/i
    ];
    if (commercialSpam.some(re => re.test(corpus))) {
      console.warn('[Contact API Spam Quarantined] Commercial pitch matched:', data.email);
      return new Response(JSON.stringify({ status: 'ok', message: 'Message received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 4. Forward Genuine Inquiry to Power Automate / M365 ---
    const webhookUrl = process.env.PUBLIC_POWER_AUTOMATE_CONTACT_WEBHOOK_URL ||
      process.env.PUBLIC_POWER_AUTOMATE_MEMBER_WEBHOOK_URL ||
      '';

    const forwardPayload = {
      sender_name: data.name,
      email: data.email,
      topic: data.topic || 'Allgemein',
      subject: data.subject,
      message: data.message,
      submitted_at: data.submitted_at || new Date().toISOString(),
      recipient: 'kontakt@sprachcafe-polnisch.org',
    };

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(forwardPayload),
        });
      } catch (err) {
        console.error('[Contact API] Failed forwarding to webhook:', err);
      }
    }

    return new Response(JSON.stringify({
      status: 'ok',
      message: 'Inquiry successfully processed and routed to kontakt@sprachcafe-polnisch.org'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return new Response(JSON.stringify({ status: 'error', message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
