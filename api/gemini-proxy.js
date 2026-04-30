const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Configuración de cabeceras para evitar bloqueos
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
      return res.status(500).json({ error: 'Falta la clave GEMINI_API_KEY en Vercel' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Usamos 'gemini-1.5-flash-latest' que es el endpoint más estable actualmente
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest" 
    });

    // Construimos el mensaje incluyendo las instrucciones del sistema al principio
    // Esto evita el error 404 de compatibilidad con systemInstruction en ciertas versiones
    const fullPrompt = `INSTRUCCIONES DE SISTEMA: ${systemMsg}\n\nUSUARIO: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ text: text });

  } catch (error) {
    console.error("Error detallado:", error);
    // Si el error es específicamente un 404, intentamos con el modelo Pro por si el Flash está saturado
    return res.status(500).json({ 
      error: 'Error de comunicación con Google',
      message: error.message 
    });
  }
};
