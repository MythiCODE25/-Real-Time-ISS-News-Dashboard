import axios from 'axios';

/**
 * Vercel Serverless Function — POST /api/chat
 *
 * Uses axios (already in project deps) instead of native fetch so it
 * works on any Node.js version Vercel might use.
 *
 * Required env var (set in Vercel dashboard → Settings → Environment Variables):
 *   HF_TOKEN = your Hugging Face token
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    console.error('[api/chat] HF_TOKEN is not set in environment variables');
    return res.status(500).json({
      error: 'Server misconfiguration: HF_TOKEN is not set. Add it in Vercel → Project Settings → Environment Variables.',
    });
  }

  try {
    const { data, status } = await axios.post(
      'https://api-inference.huggingface.co/v1/chat/completions',
      req.body,
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000, // 25 s — stays within Vercel Hobby 30 s limit
      }
    );

    return res.status(status).json(data);
  } catch (err) {
    // axios wraps HTTP errors in err.response
    if (err.response) {
      console.error('[api/chat] HF API error:', err.response.status, err.response.data);
      return res.status(err.response.status).json(err.response.data);
    }
    // Network / timeout error
    console.error('[api/chat] Network error:', err.message);
    return res.status(502).json({ error: `Failed to reach Hugging Face API: ${err.message}` });
  }
}
