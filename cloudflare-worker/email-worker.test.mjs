// Unit tests for the contact-form Worker — run with `npm run test:worker`
// (Node's built-in test runner; the Worker only relies on fetch/Response,
// which Node provides natively).
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import worker from './email-worker.js';

const PROD_ORIGIN = 'https://aghirculesei.pages.dev';
const WORKER_URL = 'https://api.aghirculesei.workers.dev';

const VALID_BODY = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello there, this is a message.' };

function request(body, { method = 'POST', origin = PROD_ORIGIN, raw = false } = {}) {
  const headers = { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' };
  if (origin) headers.Origin = origin;
  const init = { method, headers };
  if (method === 'POST') init.body = raw ? body : JSON.stringify(body);
  return new Request(WORKER_URL, init);
}

function memoryKv(initial = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    store,
    get: async (key, type) => (store.has(key) ? (type === 'json' ? JSON.parse(store.get(key)) : store.get(key)) : null),
    put: async (key, value) => void store.set(key, value),
  };
}

function env(overrides = {}) {
  return {
    RESEND_API_KEY: 're_test',
    TO_EMAIL: 'inbox@example.com',
    FROM_EMAIL: 'Portfolio <noreply@mail.example.com>',
    RATE_LIMIT_KV: memoryKv(),
    ...overrides,
  };
}

let resend;

beforeEach(() => {
  resend = mock.method(globalThis, 'fetch', async () =>
    new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }),
  );
  mock.method(console, 'error', () => {});
  mock.method(console, 'warn', () => {});
  mock.method(console, 'log', () => {});
});

afterEach(() => mock.restoreAll());

async function send(req, environment = env()) {
  const res = await worker.fetch(req, environment);
  return { res, body: res.status === 204 ? null : await res.json() };
}

describe('CORS', () => {
  it('answers preflight requests with 204 and the CORS headers', async () => {
    const { res } = await send(request(null, { method: 'OPTIONS' }));
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), PROD_ORIGIN);
    assert.equal(res.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
    assert.equal(res.headers.get('Vary'), 'Origin');
  });

  it('echoes an allowed preview-deployment origin', async () => {
    const preview = 'https://feat-x.aghirculesei.pages.dev';
    const { res } = await send(request(VALID_BODY, { origin: preview }));
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), preview);
  });

  it('rejects browser requests from a foreign origin', async () => {
    const { res, body } = await send(request(VALID_BODY, { origin: 'https://evil.example' }));
    assert.equal(res.status, 403);
    assert.equal(body.error, 'Origin not allowed');
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), PROD_ORIGIN);
    assert.equal(resend.mock.callCount(), 0);
  });

  it('rejects methods other than POST and OPTIONS', async () => {
    const { res } = await send(request(null, { method: 'GET' }));
    assert.equal(res.status, 405);
  });
});

describe('validation', () => {
  const cases = [
    ['malformed JSON', '{"name":', 'Invalid JSON'],
    ['a JSON null body', 'null', 'Invalid request body'],
    ['a JSON array body', '[1,2]', 'Invalid request body'],
    ['a JSON string body', '"hi"', 'Invalid request body'],
  ];
  for (const [label, raw, error] of cases) {
    it(`returns 400 for ${label}`, async () => {
      const { res, body } = await send(request(raw, { raw: true }));
      assert.equal(res.status, 400);
      assert.equal(body.error, error);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), PROD_ORIGIN);
    });
  }

  it('rejects non-string fields instead of coercing them', async () => {
    for (const patch of [{ name: {} }, { email: ['jane@example.com'] }, { message: 42 }]) {
      const { res, body } = await send(request({ ...VALID_BODY, ...patch }));
      assert.equal(res.status, 400, JSON.stringify(patch));
      assert.equal(body.error, 'Invalid field type');
    }
  });

  it('treats missing and whitespace-only fields as missing', async () => {
    for (const patch of [{ name: undefined }, { email: '   ' }, { message: '\n\t ' }]) {
      const { res, body } = await send(request({ ...VALID_BODY, ...patch }));
      assert.equal(res.status, 400, JSON.stringify(patch));
      assert.equal(body.error, 'Missing required fields');
    }
  });

  it('rejects over-long fields', async () => {
    const { res, body } = await send(request({ ...VALID_BODY, message: 'x'.repeat(5001) }));
    assert.equal(res.status, 400);
    assert.equal(body.error, 'Field too long');
  });

  it('rejects an invalid email address', async () => {
    const { res, body } = await send(request({ ...VALID_BODY, email: 'not-an-email' }));
    assert.equal(res.status, 400);
    assert.equal(body.error, 'Invalid email address');
  });
});

describe('anti-abuse', () => {
  it('silently accepts honeypot submissions without sending an email', async () => {
    const { res, body } = await send(request({ ...VALID_BODY, website: 'https://spam.example' }));
    assert.equal(res.status, 200);
    assert.deepEqual(body, { success: true });
    assert.equal(resend.mock.callCount(), 0);
  });

  it('returns 429 once the per-IP quota for the window is used up', async () => {
    const kv = memoryKv({ 'ratelimit:203.0.113.7': { count: 10, resetAt: Date.now() + 60_000 } });
    const { res } = await send(request(VALID_BODY), env({ RATE_LIMIT_KV: kv }));
    assert.equal(res.status, 429);
    assert.equal(resend.mock.callCount(), 0);
  });

  it('counts only validated send attempts toward the quota', async () => {
    const kv = memoryKv();
    await send(request({ ...VALID_BODY, email: 'bad' }), env({ RATE_LIMIT_KV: kv }));
    assert.equal(kv.store.size, 0);
    await send(request(VALID_BODY), env({ RATE_LIMIT_KV: kv }));
    assert.equal(JSON.parse(kv.store.get('ratelimit:203.0.113.7')).count, 1);
  });
});

describe('sending', () => {
  it('sends the message through Resend and returns its id', async () => {
    const { res, body } = await send(request({ ...VALID_BODY, name: '  Jane\r\nBcc: x  ' }));
    assert.equal(res.status, 200);
    assert.deepEqual(body, { success: true, id: 'email_123' });

    const [url, init] = resend.mock.calls[0].arguments;
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(init.headers.Authorization, 'Bearer re_test');
    const payload = JSON.parse(init.body);
    assert.equal(payload.from, 'Portfolio <noreply@mail.example.com>');
    assert.deepEqual(payload.to, ['inbox@example.com']);
    assert.equal(payload.reply_to, 'jane@example.com');
    assert.equal(payload.subject, 'Portfolio Kontakt von Jane Bcc: x');
  });

  it('escapes user input in the HTML part', async () => {
    await send(request({ ...VALID_BODY, message: '<img src=x onerror=alert(1)> & "quotes"' }));
    const { html } = JSON.parse(resend.mock.calls[0].arguments[1].body);
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quotes&quot;'));
    assert.ok(!html.includes('<img'));
  });

  it('falls back to the Resend sandbox sender when FROM_EMAIL is unset', async () => {
    await send(request(VALID_BODY), env({ FROM_EMAIL: undefined }));
    const { from } = JSON.parse(resend.mock.calls[0].arguments[1].body);
    assert.equal(from, 'Portfolio Contact <onboarding@resend.dev>');
  });

  it('returns 500 when the Resend credentials are not configured', async () => {
    const { res, body } = await send(request(VALID_BODY), env({ RESEND_API_KEY: undefined }));
    assert.equal(res.status, 500);
    assert.equal(body.error, 'Email service not configured');
    assert.equal(resend.mock.callCount(), 0);
  });

  it('returns 502 without leaking upstream details when Resend rejects the send', async () => {
    resend.mock.mockImplementation(async () =>
      new Response(JSON.stringify({ message: 'domain not verified' }), { status: 403 }),
    );
    const { res, body } = await send(request(VALID_BODY));
    assert.equal(res.status, 502);
    assert.deepEqual(body, { error: 'Failed to send email' });
  });

  it('returns 500 when the call to Resend throws', async () => {
    resend.mock.mockImplementation(async () => {
      throw new Error('network down');
    });
    const { res, body } = await send(request(VALID_BODY));
    assert.equal(res.status, 500);
    assert.deepEqual(body, { error: 'Internal server error' });
  });
});
