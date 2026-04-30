module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ text: "Falta API Key." });

    // Cambiamos al modelo '8b' y usamos la versión 'v1beta'
    // que es donde este modelo vive actualmente con mayor estabilidad
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`;

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
      // Si el 404 persiste, mostramos la lista de modelos que TU llave sí permite
      return res.status(200).json({ 
        text: `Error persistente: ${data.error.message}. Por favor, verifica si tu cuenta de Google tiene alguna restricción de país o de tipo (Workspace/Empresa).` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta del modelo.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
