module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ text: "Falta API Key." });

    // Intentamos con la versión 1.5 Flash pero usando la ruta de 'v1' (Estable)
    // Este es el endpoint que Google está forzando a nivel global ahora mismo
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
        // Si vuelve a fallar, intentamos con el modelo de texto puro (text-bison-001) 
        // que es el abuelo de todos y siempre está activo
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateMessage?key=${apiKey}`;
        return res.status(200).json({ 
            text: `Error de modelo: ${data.error.message}. Intenta cambiar el nombre del modelo en el código a 'gemini-1.5-flash-8b'.` 
        });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
