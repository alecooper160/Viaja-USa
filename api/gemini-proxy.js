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

    // Usaremos v1beta y gemini-1.5-pro, que es el más flexible con las regiones
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `INSTRUCCIONES: ${systemMsg}\n\nPREGUNTA: ${prompt}` }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      // Si esto falla, el error nos dirá si es por localización o permisos
      return res.status(200).json({ 
        text: `Aviso del sistema: ${data.error.message} (Código: ${data.error.status})` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "El sistema no pudo generar una respuesta en este momento.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
