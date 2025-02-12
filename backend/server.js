// This section sets up an Express server, connects to MongoDB, integrates with Google Cloud's Vertex AI,

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth } from "google-auth-library";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

if (!process.env.GOOGLE_CLOUD_PROJECT) {
  console.error("❌ GOOGLE_CLOUD_PROJECT is not defined in .env file");
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "❌ GOOGLE_APPLICATION_CREDENTIALS is not defined in .env file"
  );
  process.exit(1);
}

const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const client = auth.getClient();

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = "us-central1";

const vertexAI = new VertexAI({
  projectId,
  location,
  authClient: client,
});

const model = vertexAI.getGenerativeModel({ model: "gemini-pro" });

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Message received:", message);
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    console.log("Vertex AI response:", response);
    if (
      response.response.candidates &&
      response.response.candidates.length > 0 &&
      response.response.candidates[0].content &&
      response.response.candidates[0].content.parts &&
      response.response.candidates[0].content.parts.length > 0
    ) {
      const reply =
        response.response.candidates[0].content.parts[0].text ||
        "No response text found";
      console.log("Response candidates:", response.response.candidates);
      res.json({ reply });
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
