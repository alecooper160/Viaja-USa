const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Metodo no permitido" };
  }

  try {
    const { prompt, systemMsg } = JSON.parse(event.body);
    // Netlify tomara la clave de las variables de entorno que configures en su panel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemMsg 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text() }),
    };
  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Error en el servidor de IA" }) 
    };
  }
};
