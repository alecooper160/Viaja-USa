module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(200).json({ text: "Falta API Key en Vercel." });

    // PASO 1: Consultar a Google qué modelos tiene ACTIVOS tu llave
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (listData.error) {
      return res.status(200).json({ text: `Error de Google: ${listData.error.message}` });
    }

    // Extraemos los nombres de los modelos disponibles
    const availableModels = listData.models ? listData.models.map(m => m.name.replace('models/', '')) : [];

    if (availableModels.length === 0) {
      return res.status(200).json({ text: "Tu API Key no tiene modelos habilitados. Crea una nueva en un 'New Project' en AI Studio." });
    }

    // PASO 2: Usar el primer modelo disponible de la lista automáticamente
    const bestModel = availableModels.find(m => m.includes('flash')) || availableModels[0];
    
    const { prompt, systemMsg } = req.body;
    const genResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${bestModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemMsg}\n\n${prompt}` }] }]
        })
      }
    );

    const genData = await genResponse.json();
    const aiText = genData.candidates?.[0]?.content?.parts?.[0]?.text || `Modelos disponibles para ti: ${availableModels.join(', ')}. Prueba usando uno de estos.`;

    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error: " + error.message });
  }
};
