module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ text: "Error: No configuraste la GEMINI_API_KEY en Vercel." });
    }

    // CAMBIO CLAVE: Usamos la versión 'v1' estable en lugar de 'v1beta'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemMsg}\n\n${prompt}` }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      // Si el error persiste, intentamos con el modelo Pro como última opción
      return res.status(200).json({ text: `Error de Google: ${data.error.message}` });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "El modelo no devolvió texto.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
