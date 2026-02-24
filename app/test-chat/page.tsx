"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function TestChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const addLog = (log: string) => {
    console.log(log);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${log}`]);
  };

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    addLog(`🔌 Connecting to: ${SOCKET_URL}/marketplace-chat`);
    
    const newSocket = io(`${SOCKET_URL}/marketplace-chat`, {
      transports: ["websocket", "polling"],
      auth: { token: localStorage.getItem("token") },
    });

    newSocket.on("connect", () => {
      addLog(`✅ Connected! Socket ID: ${newSocket.id}`);
      setConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      addLog(`❌ Connection Error: ${error.message}`);
      setConnected(false);
    });

    newSocket.on("disconnect", () => {
      addLog("❌ Disconnected");
      setConnected(false);
    });

    newSocket.on("newMessage", (msg) => {
      addLog(`📨 Received message: ${msg.text}`);
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("userJoined", (data) => {
      addLog(`👤 User joined: ${JSON.stringify(data)}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = () => {
    if (socket) {
      socket.emit("joinServiceChat", { serviceId: "test-service-123" });
      addLog("📤 Joined room: test-service-123");
    }
  };

  const sendTestMessage = () => {
    if (socket && message) {
      const msg = {
        _id: `msg-${Date.now()}`,
        text: message,
        senderId: "test-user",
        timestamp: new Date().toISOString(),
      };
      
      socket.emit("sendMessage", {
        serviceId: "test-service-123",
        message: msg,
      });
      
      addLog(`📤 Sent: ${message}`);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Socket.IO Chat Test</h1>
        
        {/* Connection Status */}
        <div className={`p-6 rounded-2xl mb-6 ${connected ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
          <p className="font-bold text-xl">
            {connected ? '✅ Connected to Server' : '❌ Disconnected'}
          </p>
          <p className="text-sm mt-2">
            Backend URL: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="font-bold text-xl mb-4">Controls</h2>
          <div className="space-y-4">
            <button
              onClick={joinRoom}
              disabled={!connected}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Join Test Room
            </button>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendTestMessage()}
                placeholder="Type a message..."
                disabled={!connected}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none disabled:opacity-50"
              />
              <button
                onClick={sendTestMessage}
                disabled={!connected || !message}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="font-bold text-xl mb-4">Messages</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-400 italic">No messages yet</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold">{msg.senderId}</p>
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="font-bold text-xl mb-4">Connection Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>Waiting for events...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}