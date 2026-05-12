export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Rutas
    if (pathname === '/api/send-email' && request.method === 'POST') {
      return handleSendEmail(request, env);
    }

    if (pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  },
};

async function handleSendEmail(request, env) {
  try {
    const { email, subject, html } = await request.json();

    if (!email || !subject || !html) {
      return jsonResponse({ error: 'Faltan campos requeridos: email, subject, html' }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Email inválido' }, 400);
    }

    const token = await getAzureToken(env);
    if (!token) {
      return jsonResponse({ error: 'No se pudo autenticar con Azure' }, 500);
    }

    const result = await sendEmailViaGraph(token, env, { email, subject, html });

    if (result.success) {
      return jsonResponse({ 
        success: true, 
        message: `Correo enviado a ${email}`,
        messageId: result.messageId 
      }, 200);
    } else {
      return jsonResponse({ error: result.error }, result.statusCode || 500);
    }

  } catch (error) {
    console.error('Error en handleSendEmail:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

async function getAzureToken(env) {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.AZURE_CLIENT_ID,
        client_secret: env.AZURE_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Azure token error:', data);
      return null;
    }

    return data.access_token;
  } catch (error) {
    console.error('Error obtaining Azure token:', error);
    return null;
  }
}

async function sendEmailViaGraph(token, env, { email, subject, html }) {
  try {
    const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${env.AZURE_SENDER}/sendMail`;

    const mailBody = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: email,
            },
          },
        ],
        from: {
          emailAddress: {
            address: env.AZURE_SENDER,
            name: 'Agente de Conocimiento · Metrored',
          },
        },
      },
      saveToSentItems: true,
    };

    const response = await fetch(graphEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailBody),
    });

    if (response.ok || response.status === 202) {
      return { success: true, messageId: 'sent' };
    } else {
      const error = await response.text();
      console.error('Graph API error:', error);
      return {
        success: false,
        error: `Error al enviar correo (${response.status})`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error('Error sending email via Graph:', error);
    return { success: false, error: error.message, statusCode: 500 };
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
