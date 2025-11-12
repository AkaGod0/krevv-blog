"use client";

import { useState, useEffect } from "react";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "false");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 z-50 shadow-lg">
      <p className="text-sm text-center sm:text-left">
        🍪 This website uses cookies to improve your experience.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="bg-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-gray-600 px-4 py-2 rounded font-semibold hover:bg-gray-700 transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
