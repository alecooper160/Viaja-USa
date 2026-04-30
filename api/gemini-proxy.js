const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
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
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Falta GEMINI_API_KEY en las variables de Vercel' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Cambiamos a 'gemini-pro' o 'gemini-1.5-flash-latest' que son nombres más estables
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest"
    });

    // En lugar de systemInstruction en la configuración, lo pasamos como parte del contenido
    // para asegurar compatibilidad total con la versión de la librería
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemMsg }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Actuaré bajo esas instrucciones profesionales." }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ text: text });
  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({ 
      error: 'Error en el servidor de Google', 
      message: error.message 
    });
  }
};
