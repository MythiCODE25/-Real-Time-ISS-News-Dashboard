/**
 * Vercel Serverless Function — GET /api/astronauts
 *
 * Proxies http://api.open-notify.org/astros.json server-side,
 * completely bypassing CORS restrictions in the browser.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('http://api.open-notify.org/astros.json', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      throw new Error(`Upstream responded ${response.status}`);
    }

    const data = await response.json();

    // Cache for 5 minutes — crew doesn't change that frequently
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/astronauts] Error:', err.message);
    return res.status(502).json({ error: `Failed to reach astronaut API: ${err.message}` });
  }
}
