/**
 * Cloudflare Worker – Portfolio Email via Resend
 *
 * ENV Variables da impostare nel Cloudflare Dashboard:
 *   RESEND_API_KEY  → la tua chiave API Resend (re_xxxxxxxxx)
 *   TO_EMAIL        → aghirculesei@gmail.com
 */

const ALLOWED_ORIGINS = [
  'https://aghirculesei.pages.dev',           // production
  /^https:\/\/[a-z0-9]+\.aghirculesei\.pages\.dev$/, // preview deployments
];

function getAllowedOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  for (const allowed of ALLOWED_ORIGINS) {
    if (typeof allowed === 'string' ? origin === allowed : allowed.test(origin)) {
      return origin;
    }
  }
  return ALLOWED_ORIGINS[0]; // fallback to production
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

    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400, request);
    }

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return corsResponse(JSON.stringify({ error: 'Missing required fields' }), 400, request);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return corsResponse(JSON.stringify({ error: 'Invalid email address' }), 400, request);
    }

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: [env.TO_EMAIL],
          reply_to: email,
          subject: `Portfolio Kontakt von ${name}`,
          html: `
            <h2>Neue Nachricht vom Portfolio</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>Nachricht:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error('Resend error:', errorText);
        return corsResponse(JSON.stringify({ error: 'Failed to send email', detail: errorText }), 500, request);
      }

      return corsResponse(JSON.stringify({ success: true }), 200, request);

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
