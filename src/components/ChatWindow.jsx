import React, { useState } from "react";
import {
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Image,
  Mic,
} from "lucide-react";

export default function ChatWindow({ conversation }) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "them",
      text: "Hey! How are you doing?",
      time: "10:21 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "I'm doing great! Just working on MemoriesHub 😊",
      time: "10:23 AM",
    },
    {
      id: 3,
      sender: "them",
      text: "That sounds exciting! I really like the new design.",
      time: "10:24 AM",
    },
  ]);

  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "me",
        text: trimmed,
        time: "Now",
      },
    ]);

    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-window">

      <div className="chat-header">

        <div className="chat-person">

          <div className="avatar avatar-medium">
            {conversation?.name?.charAt(0) || "R"}
            <span className="online-status" />
          </div>

          <div>
            <strong>
              {conversation?.name || "Rahul Verma"}
            </strong>

            <span className="chat-online">
              <i />
              Active now
            </span>
          </div>

        </div>

        <div className="chat-actions">

          <button>
            <Phone size={19} />
          </button>

          <button>
            <Video size={19} />
          </button>

          <button>
            <MoreHorizontal size={20} />
          </button>

        </div>

      </div>

      <div className="chat-body">

        <div className="chat-date">
          Today
        </div>

        {messages.map((item) => (
          <div
            key={item.id}
            className={`message-row ${
              item.sender === "me"
                ? "message-me"
                : "message-them"
            }`}
          >

            <div className="message-bubble">
              <p>{item.text}</p>
              <span>{item.time}</span>
            </div>

          </div>
        ))}

      </div>

      <div className="chat-composer">

        <div className="composer-tools">

          <button title="Attach file">
            <Paperclip size={19} />
          </button>

          <button title="Add image">
            <Image size={19} />
          </button>

        </div>

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows="1"
        />

        <button className="emoji-button">
          <Smile size={20} />
        </button>

        <button className="mic-button">
          <Mic size={19} />
        </button>

        <button
          className="send-message-button"
          onClick={sendMessage}
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  );
}