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

    // Usamos 'gemini-pro', que es el nombre con mayor compatibilidad histórica
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
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
      // Si el error persiste, intentamos con una ruta alternativa por si tu cuenta es muy reciente
      return res.status(200).json({ 
        text: `Error de Google (${data.error.code}): ${data.error.message}` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "El modelo no devolvió texto.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
