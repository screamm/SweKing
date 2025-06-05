/**
 * Kungen Hoppar Flaggor - Cloudflare Workers Backend
 * Hanterar spelfiler och topplista API
 */

// CORS headers för frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Hantera CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API routes för topplista
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }

    // Servera spelfiler från ASSETS
    return handleStaticFiles(request, env, url);
  }
};

async function handleApiRequest(request, env, url) {
  try {
    // GET /api/scores - Hämta topplista
    if (url.pathname === '/api/scores' && request.method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT name, score, created_at 
        FROM high_scores 
        ORDER BY score DESC 
        LIMIT 10
      `).all();

      return new Response(JSON.stringify(results), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // POST /api/scores - Spara ny poäng
    if (url.pathname === '/api/scores' && request.method === 'POST') {
      const { name, score } = await request.json();
      
      // Validering
      if (!name || typeof score !== 'number' || score < 0) {
        return new Response('Ogiltig data', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      // Begränsa namn längd
      const cleanName = name.slice(0, 20).trim();
      
      // Spara i databas
      await env.DB.prepare(`
        INSERT INTO high_scores (name, score) 
        VALUES (?, ?)
      `).bind(cleanName, score).run();

      // Ta bort gamla poäng (behåll bara top 100)
      await env.DB.prepare(`
        DELETE FROM high_scores 
        WHERE id NOT IN (
          SELECT id FROM high_scores 
          ORDER BY score DESC 
          LIMIT 100
        )
      `).run();

      return new Response('Poäng sparad! 🏆', {
        headers: corsHeaders
      });
    }

    return new Response('API endpoint finns inte', { 
      status: 404,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response('Server fel', { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

async function handleStaticFiles(request, env, url) {
  try {
    // Huvudsida
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const asset = await env.ASSETS.fetch(new URL('/index.html', request.url));
      if (asset.ok) {
        return new Response(asset.body, {
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders
          }
        });
      }
    }

    // Spel JavaScript
    if (url.pathname === '/game.js') {
      const asset = await env.ASSETS.fetch(new URL('/game.js', request.url));
      if (asset.ok) {
        return new Response(asset.body, {
          headers: { 
            'Content-Type': 'application/javascript; charset=utf-8',
            ...corsHeaders
          }
        });
      }
    }

    // Försök hämta från assets
    const asset = await env.ASSETS.fetch(request);
    if (asset.ok) {
      return asset;
    }

  } catch (error) {
    console.error('Static file error:', error);
  }

  return new Response('Fil inte hittad', { 
    status: 404,
    headers: corsHeaders 
  });
} 