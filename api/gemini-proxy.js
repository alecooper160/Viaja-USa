module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ text: "Falta API Key en Vercel." });

    // Intentamos con la versión PRO, que es la que se activa por defecto en proyectos nuevos
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemMsg}\n\n${prompt}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si falla, mostramos el mensaje exacto de Google para saber qué modelo SI puedes usar
      return res.status(200).json({ 
        text: `Aviso: Tu llave de Google dice "${data.error.message}". Prueba a generar una llave nueva en https://aistudio.google.com/ haciendo clic en 'Get API Key' y luego en 'Create API key in new project'.` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
