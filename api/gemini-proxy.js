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

    // Usamos el endpoint v1 (estable) con el nombre exacto 'gemini-1.5-flash'
    // Pero esta vez sin el prefijo 'models/' en la construcción interna si fuera necesario
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
      // Si vuelve a dar 404, imprimimos la lista de modelos permitidos para tu llave
      if (data.error.status === "NOT_FOUND") {
        return res.status(200).json({ 
          text: "Error de configuración: Tu API Key no reconoce este modelo. Por favor, verifica que en AI Studio el modelo 'Gemini 1.5 Flash' esté disponible para ti." 
        });
      }
      return res.status(200).json({ text: `Error: ${data.error.message}` });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta del modelo.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
