/**
 * Cloudflare Worker – Portfolio Email via Resend
 *
 * ENV Variables da impostare nel Cloudflare Dashboard
 * (Workers & Pages → api → Settings → Variables and Secrets):
 *   RESEND_API_KEY  → la tua chiave API Resend (re_xxxxxxxxx)
 *   TO_EMAIL        → aghirculesei@gmail.com
 *   FROM_EMAIL      → mittente su un dominio VERIFICATO in Resend,
 *                     es. "Portfolio <noreply@mail.tuodominio.com>".
 *                     Senza questa variabile si usa "onboarding@resend.dev",
 *                     che Resend accetta ma consegna solo all'indirizzo del
 *                     titolare dell'account e Gmail lo mette in spam / lo
 *                     scarta: è la causa tipica delle email che "non arrivano".
 *
 * KV Namespace richiesto per il rate limiting (binding RATE_LIMIT_KV):
 *   1. Crea il namespace:  wrangler kv namespace create RATE_LIMIT_KV
 *   2. Collega l'id generato al binding "RATE_LIMIT_KV" in wrangler.toml
 *      (già presente sotto [[kv_namespaces]]) oppure dal Cloudflare Dashboard:
 *      Workers & Pages → api → Settings → Bindings → KV Namespace Bindings.
 */

const DEFAULT_FROM_EMAIL = 'Portfolio Contact <onboarding@resend.dev>';

const ALLOWED_ORIGINS = [
  'https://aghirculesei.pages.dev',                    // production
  /^https:\/\/[a-z0-9-]+\.aghirculesei\.pages\.dev$/,  // preview deployments
  /^http:\/\/localhost(:\d+)?$/,                       // local dev, any port
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,                    // local dev, any port
];

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
  );
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

// Anti-abuse only: counts just genuine, validated send attempts (not
// validation errors or honeypot hits), so normal use and testing never trip it.
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60; // 10 minuti

async function isRateLimited(env, ip) {
  if (!env.RATE_LIMIT_KV || !ip) {
    return false;
  }

  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const stored = await env.RATE_LIMIT_KV.get(key, 'json');

  if (stored && stored.resetAt > now) {
    if (stored.count >= RATE_LIMIT_MAX_REQUESTS) {
      return true;
    }
    await env.RATE_LIMIT_KV.put(
      key,
      JSON.stringify({ count: stored.count + 1, resetAt: stored.resetAt }),
      { expirationTtl: Math.ceil((stored.resetAt - now) / 1000) }
    );
    return false;
  }

  const resetAt = now + RATE_LIMIT_WINDOW_SECONDS * 1000;
  await env.RATE_LIMIT_KV.put(
    key,
    JSON.stringify({ count: 1, resetAt }),
    { expirationTtl: RATE_LIMIT_WINDOW_SECONDS }
  );
  return false;
}

function getAllowedOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  return isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0]; // fallback to production
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204, request);
    }

    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405, request);
    }

    // Reject browser requests coming from any site other than the allow-list.
    // (Non-browser callers send no Origin header and are left to the rate limiter.)
    const origin = request.headers.get('Origin');
    if (origin && !isAllowedOrigin(origin)) {
      return corsResponse(JSON.stringify({ error: 'Origin not allowed' }), 403, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400, request);
    }

    const { name, email, message, website } = body;

    if (!name || !email || !message) {
      return corsResponse(JSON.stringify({ error: 'Missing required fields' }), 400, request);
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      email.length > MAX_EMAIL_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return corsResponse(JSON.stringify({ error: 'Field too long' }), 400, request);
    }

    // Honeypot: campo nascosto compilato solo dai bot. Rispondiamo 200 senza inviare l'email.
    if (website) {
      return corsResponse(JSON.stringify({ success: true }), 200, request);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return corsResponse(JSON.stringify({ error: 'Invalid email address' }), 400, request);
    }

    // Rate limit only real, validated attempts — a few typos in the form never
    // eat into the quota, and only a genuine send counts toward it.
    const ip = request.headers.get('CF-Connecting-IP');
    if (await isRateLimited(env, ip)) {
      return corsResponse(JSON.stringify({ error: 'Too many requests' }), 429, request);
    }

    if (!env.RESEND_API_KEY || !env.TO_EMAIL) {
      console.error('Email service misconfigured: RESEND_API_KEY or TO_EMAIL is not set');
      return corsResponse(JSON.stringify({ error: 'Email service not configured' }), 500, request);
    }

    const fromEmail = env.FROM_EMAIL || DEFAULT_FROM_EMAIL;
    if (fromEmail === DEFAULT_FROM_EMAIL) {
      console.warn('FROM_EMAIL is not set — using the Resend sandbox sender; delivery to arbitrary inboxes is unreliable.');
    }

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [env.TO_EMAIL],
          reply_to: email,
          subject: `Portfolio Kontakt von ${name}`,
          // Plain-text part alongside the HTML — HTML-only mail scores worse
          // with spam filters.
          text:
            `Neue Nachricht vom Portfolio\n\n` +
            `Name: ${name}\n` +
            `E-Mail: ${email}\n\n` +
            `Nachricht:\n${message}\n`,
          html: `
            <h2>Neue Nachricht vom Portfolio</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>Nachricht:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          `,
        }),
      });

      const resendBody = await resendResponse.json().catch(() => ({}));

      if (!resendResponse.ok) {
        // Log the full upstream error so it shows up in `wrangler tail`, but
        // don't leak Resend internals to the browser.
        console.error('Resend rejected the send:', resendResponse.status, JSON.stringify(resendBody));
        return corsResponse(JSON.stringify({ error: 'Failed to send email' }), 502, request);
      }

      // The id lets you trace this message in the Resend dashboard → Emails
      // (Delivered / Bounced / Complained).
      console.log('Resend accepted message:', resendBody.id);
      return corsResponse(JSON.stringify({ success: true, id: resendBody.id ?? null }), 200, request);

    } catch (err) {
      console.error('Worker error:', err);
      return corsResponse(JSON.stringify({ error: 'Internal server error' }), 500, request);
    }
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function corsResponse(body, status, request) {
  const headers = {
    'Access-Control-Allow-Origin': getAllowedOrigin(request),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  return new Response(body, { status, headers });
}
