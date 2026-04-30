module.exports = async (req, res) => {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la clave GEMINI_API_KEY en Vercel' });
    }

    // Usamos FETCH directo a Google, saltándonos la librería problemática
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      console.error("Error de Google:", data);
      return res.status(response.status).json({ error: data.error?.message || 'Error de Google' });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No recibí respuesta.";
    
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Error en el Proxy:", error);
    return res.status(500).json({ error: 'Error interno', message: error.message });
  }
};
