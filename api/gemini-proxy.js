module.exports = async (req, res) => {
  // Cabeceras para que el navegador no bloquee la respuesta
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, systemMsg } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemMsg}\n\nPregunta: ${prompt}` }] }]
        })
      }
    );

    const data = await response.json();
    
    // Extraemos el texto de la respuesta de Google
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";

    // Enviamos SOLO el texto en un objeto JSON limpio
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ text: "Hubo un error interno en el servidor." });
  }
};
