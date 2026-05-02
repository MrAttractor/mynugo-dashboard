exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Vérifier que la clé existe
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY manquante');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Clé API manquante côté serveur' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body invalide' }) };
  }

  const { messages, system } = body;

  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages manquants' }) };
  }

  try {
    console.log('Appel Claude API — messages:', messages.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: system || 'Tu es MAC, assistant CEO de MY NUGO.',
        messages: messages
      })
    });

    const responseText = await response.text();
    console.log('Réponse Claude status:', response.status);

    if (!response.ok) {
      console.error('Erreur Claude API:', responseText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Erreur Claude: ' + response.status, detail: responseText })
      };
    }

    const data = JSON.parse(responseText);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error('Exception:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
