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

    // Servera spelfiler
    return handleStaticFiles(request, url);
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

async function handleStaticFiles(request, url) {
  // Huvudsida
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(getIndexHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // Spel JavaScript
  if (url.pathname === '/game.js') {
    return new Response(getGameJS(), {
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
    });
  }

  return new Response('Fil inte hittad', { status: 404 });
}

// HTML fil embedded (skulle kunna läsas från static assets istället)
function getIndexHTML() {
  return \`<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kungen Hoppar Flaggor - Nationaldag Spel 🇸🇪</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #006aa7 0%, #fecc00 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Arial', sans-serif;
            color: white;
        }
        
        .game-container {
            text-align: center;
            background: rgba(0, 0, 0, 0.1);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            margin: 0 0 20px 0;
            color: #fecc00;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            font-size: 2.5em;
        }
        
        canvas {
            border: 3px solid #fecc00;
            border-radius: 10px;
            background: #87ceeb;
            display: block;
            margin: 0 auto;
        }
        
        .controls {
            margin-top: 15px;
            color: white;
            font-size: 1.2em;
        }
        
        .score {
            font-size: 1.5em;
            margin: 10px 0;
            color: #fecc00;
            font-weight: bold;
        }
        
        .high-scores {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .high-scores h3 {
            color: #fecc00;
            margin: 0 0 15px 0;
            text-align: center;
        }
        
        .score-entry {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid rgba(254, 204, 0, 0.3);
        }
        
        .score-entry:last-child {
            border-bottom: none;
        }
        
        .rank {
            color: #fecc00;
            font-weight: bold;
            width: 25px;
        }
        
        .name {
            flex: 1;
            padding: 0 10px;
        }
        
        .score-value {
            color: #fecc00;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>🇸🇪 Kungen Hoppar Flaggor 👑</h1>
        <div class="score">Kronor: <span id="score">0</span></div>
        <canvas id="gameCanvas" width="800" height="400"></canvas>
        <div class="controls">
            Tryck MELLANSLAG för att hoppa! 
        </div>
        
        <div class="high-scores">
            <h3>🏆 TOPPLISTA 🏆</h3>
            <div id="highScoreList">
                <div class="score-entry">
                    <span class="rank">1.</span>
                    <span class="name">Laddar...</span>
                    <span class="score-value">-</span>
                </div>
            </div>
        </div>
    </div>
    
    <script src="game.js"></script>
</body>
</html>\`;
}

function getGameJS() {
  // Här skulle vi läsa game.js från fil eller embed den
  // För enkelhetens skull returnerar vi en placeholder
  return \`// Game.js kommer laddas från extern fil eller embedded här
console.log('Spel laddar...');\`;
} 