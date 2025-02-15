import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setChat([...chat, userMessage]);

    try {
      const response = await axios.post("http://localhost:5001/chat", {
        message,
      });
      const botMessage = { role: "bot", content: response.data.reply };
      setChat([...chat, userMessage, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
    }

    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Chatbot</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "auto",
        }}
      >
        {chat.map((msg, index) => (
          <p
            key={index}
            style={{ textAlign: msg.role === "user" ? "right" : "left" }}
          >
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "80%", padding: 5 }}
      />
      <button onClick={sendMessage} style={{ marginLeft: 5, padding: 5 }}>
        Send
      </button>
    </div>
  );
};

export default Chatbot;
