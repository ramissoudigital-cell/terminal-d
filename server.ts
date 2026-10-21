import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { text, history = [] } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const contents = history.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      contents.push({
        role: 'user',
        parts: [{ text: text }]
      });

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are TASKup IA, an AI assistant built into the TASKup platform. You know everything about the application and help users find freelancers, post jobs, and manage projects. Be helpful, professional, and concise. When users ask for freelancers (e.g. design, video, dev), propose specific freelancers from our database, describing their profile in detail and providing a link to their profile use markdown format: [Voir le profil de Nom du freelancer](freelancer:ID).\n\nHere is our database of top freelancers:\n- Sophie Martin (ID: f1). Role: Ménage & Nettoyage. Rating: 4.8. Rate: 18€/h. Skills: Deep Cleaning. \n- Marc Dubois (ID: f2). Role: Montage Vidéo. Rating: 5.0. Rate: 45€/h. Skills: Video Editing, Motion Graphics, After Effects.\n- Emma Petit (ID: f3). Role: Aide aux devoirs. Rating: 4.9. Rate: 22€/h.\n- Lucas Bernard (ID: f4). Role: Jardinage & Extérieur. Rating: 4.7. Rate: 25€/h.\n- Stephan Lee (ID: f5). Role: UI / UX Designer. Rating: 4.9. Rate: 55€/h. Location: Jakarta. Skills: UX Design, UI Design, Figma, Micro-interaction Design. Overview: Formerly at Google building Chrome. Amazing designer.",
        },
      });
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of responseStream) {
        const textResponse = (chunk as any).text;
        if (textResponse) {
          res.write(`data: ${JSON.stringify({ text: textResponse })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
