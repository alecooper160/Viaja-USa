module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ text: "Falta la API Key en Vercel." });
    }

    // Intentamos con la URL más básica y el modelo 1.0 Pro
    // Este modelo es el que Google regala por defecto al crear cualquier cuenta
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemMsg}\n\nPregunta: ${prompt}` }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      // Si esto falla, te daré un link directo para arreglarlo
      return res.status(200).json({ 
        text: `Error de Google: ${data.error.message}. Por favor, entra a https://aistudio.google.com/ y asegúrate de que puedes usar el chat ahí.` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No recibí respuesta.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error: " + error.message });
  }
};
