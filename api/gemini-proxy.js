module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ text: "Error: Falta la API Key." });

    // Usamos el modelo 2.0 Flash que está activo en tu cuenta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemMsg}\n\n${prompt}` }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `Error de Google: ${data.error.message}` });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta del modelo.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
