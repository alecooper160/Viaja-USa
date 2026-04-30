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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemMsg}\n\n${prompt}` }]
          }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      }
    );

    const data = await response.json();

    // Verificamos si Google devolvió un error de cuota o de clave
    if (data.error) {
      return res.status(200).json({ text: `Error de Google: ${data.error.message}` });
    }

    // Intentamos extraer el texto de diferentes formas por si Google cambia el formato
    let aiText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      aiText = data.candidates[0].content.parts[0].text;
    } else if (data.candidates && data.candidates[0].finishReason === "SAFETY") {
      aiText = "El modelo bloqueó la respuesta por políticas de seguridad. Intenta preguntar de otra forma.";
    } else {
      aiText = "Google respondió, pero no incluyó texto. Revisa la consola de Vercel.";
      console.log("Respuesta extraña de Google:", JSON.stringify(data));
    }

    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Error de conexión: " + error.message });
  }
};
