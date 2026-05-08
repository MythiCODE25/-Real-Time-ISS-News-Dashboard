/**
 * Vercel Serverless Function — /api/chat
 *
 * This runs on Vercel's Node.js edge. The HF_TOKEN env var is
 * read server-side only, so it is NEVER shipped in the browser bundle.
 *
 * In dev: Vite proxy intercepts /api/chat and adds the token before
 *         forwarding to HF — same security model.
 *
 * In prod: Vercel routes /api/chat here automatically.
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return res.status(500).json({ error: 'HF_TOKEN environment variable is not set.' });
  }

  try {
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await hfRes.json();
    return res.status(hfRes.status).json(data);
  } catch (err) {
    console.error('[api/chat] Upstream error:', err);
    return res.status(502).json({ error: 'Failed to reach Hugging Face API.' });
  }
}
