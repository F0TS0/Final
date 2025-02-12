// This code sets up an Express API to interact with the Google Cloud Vertex AI model  for chatbot functionality. It handles the connection to the API and processes user input.

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { VertexAI } from "@google-cloud/vertexai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const projectId = process.env.GCP_PROJECT_ID;
const location = "us-central1";
const vertexAI = new VertexAI({
  projectId: projectId,
  location: location,
});

const model = vertexAI.getGenerativeModel({ model: "gemini-pro" });

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    console.log("Vertex AI Response:", response);

    if (
      response.response.candidates &&
      response.response.candidates.length > 0
    ) {
      console.log("Response candidates:", response.response.candidates);
      res.json({
        reply: response.response.candidates[0].content.parts[0].text,
      });
    } else {
      console.error("No valid candidates in the response");
      res.status(500).json({ error: "No valid response from Vertex AI" });
    }
  } catch (error) {
    console.error("Vertex AI API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch response", details: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
