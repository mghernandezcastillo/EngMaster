const fs = require('fs');

const serverFile = fs.readFileSync('server.ts', 'utf-8');

const translateEndpoint = `
  // API route for word translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { word, context, language } = req.body;
      if (!word) {
        return res.status(400).json({ error: "Missing word" });
      }
      
      const prompt = \`
      Translate the English word "\${word}" into \${language === 'es' ? 'Spanish' : 'English'}.
      Context sentence: "\${context || ''}"
      
      Provide a highly concise response formatted in JSON with the keys:
      - translation (string, just the translated word or very short phrase)
      - phonetics (string, IPA spelling)
      \`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("AI translation error:", error);
      res.status(500).json({ error: "Failed to generate translation" });
    }
  });
`;

if (!serverFile.includes('/api/translate')) {
  const updatedServer = serverFile.replace('// Vite middleware for development', translateEndpoint + '\n  // Vite middleware for development');
  fs.writeFileSync('server.ts', updatedServer, 'utf-8');
  console.log('Updated server.ts');
} else {
  console.log('Already updated');
}
