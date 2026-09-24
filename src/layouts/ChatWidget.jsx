import React, { useState } from "react";
import { MessageCircle, X, Send, Minus } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "received",
      text: "Hey! 👋 Welcome to MemoriesHub.",
    },
    {
      id: 2,
      type: "received",
      text: "Want to share a memory?",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "sent",
        text: message,
      },
    ]);

    setMessage("");
  };

  if (!open) {
    return (
      <button
        className="chat-floating-button"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
      >
        <MessageCircle size={25} />
        <span className="chat-notification">2</span>
      </button>
    );
  }

  return (
    <div className={`chat-widget ${minimized ? "minimized" : ""}`}>
      <div className="chat-header">
        <div className="chat-user">
          <div className="chat-avatar">
            <img
              src="https://i.pravatar.cc/100?img=32"
              alt="Rahul"
            />

            <span />
          </div>

          <div>
            <strong>Rahul Verma</strong>
            <small>Online now</small>
          </div>
        </div>

        <div className="chat-actions">
          <button onClick={() => setMinimized(!minimized)}>
            <Minus size={17} />
          </button>

          <button onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="chat-messages">
            <div className="chat-date">TODAY</div>

            {messages.map((item) => (
              <div
                key={item.id}
                className={`chat-message ${item.type}`}
              >
                {item.text}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Write a message..."
            />

            <button onClick={sendMessage}>
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}