const FASHN_API = 'https://api.fashn.ai/v1';
const MAX_IMAGE_CHARS = 7_000_000;

function send(res, status, body) {
  res.status(status).json(body);
}

function validImage(value) {
  return typeof value === 'string'
    && value.length <= MAX_IMAGE_CHARS
    && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return send(res, 405, { error: 'Utiliza POST.' });

  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) return send(res, 503, { error: 'A API ainda não está configurada. Define FASHN_API_KEY nas variáveis do projeto.' });

  const { action, model_image, garment_image, category, id } = req.body || {};
  try {
    if (action === 'start') {
      if (!validImage(model_image) || !validImage(garment_image)) {
        return send(res, 400, { error: 'Envia fotografias PNG, JPEG ou WebP válidas (máximo aproximado de 5 MB cada).' });
      }
      const supportedCategories = ['tops', 'bottoms', 'one-pieces'];
      if (!supportedCategories.includes(category)) {
        return send(res, 400, { error: 'Categoria inválida. Usa tops, bottoms ou one-pieces.' });
      }
      const upstream = await fetch(`${FASHN_API}/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: 'tryon-v1.6',
          inputs: { model_image, garment_image, category, mode: 'balanced', moderation_level: 'permissive' }
        })
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return send(res, upstream.status, { error: data.detail || data.error || 'O serviço FASHN não aceitou o pedido.' });
      return send(res, 200, { id: data.id, status: data.status || 'starting' });
    }

    if (action === 'status') {
      if (typeof id !== 'string' || !/^[\w-]+$/.test(id)) return send(res, 400, { error: 'ID de pedido inválido.' });
      const upstream = await fetch(`${FASHN_API}/status/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return send(res, upstream.status, { error: data.detail || data.error || 'Não foi possível consultar o pedido.' });
      return send(res, 200, { status: data.status, output: data.output || null, error: data.error || null });
    }

    return send(res, 400, { error: 'Ação inválida.' });
  } catch (error) {
    console.error('FASHN proxy error:', error);
    return send(res, 502, { error: 'Não foi possível contactar o serviço de prova virtual.' });
  }
}
