module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Petición directa por FETCH (Sin librerías que fallen)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemMsg}\n\nUsuario: ${prompt}` }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    return res.status(200).json({ text: texto });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
