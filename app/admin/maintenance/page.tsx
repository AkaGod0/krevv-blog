"use client";

import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [enabled, setEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith("maintenance="))
      ?.split("=")[1];

    setEnabled(value === "true");
  }, []);

  const confirmToggle = () => {
    const newValue = !enabled;

    // set cookie for 7 days
    document.cookie = `maintenance=${newValue}; path=/; max-age=${60 * 60 * 24 * 7}`;

    setEnabled(newValue);
    setShowModal(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">⚙ Admin Settings</h1>

      <button
        onClick={() => setShowModal(true)}
        className={`px-6 py-3 rounded-full font-semibold text-white transition ${
          enabled ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
      </button>

      <p className="mt-4 text-gray-600">
        Current status:{" "}
        <span className={enabled ? "text-red-600" : "text-green-600"}>
          {enabled ? "ON (Maintenance Active)" : "OFF (Website Live)"}
        </span>
      </p>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {enabled
                ? "Disable Maintenance Mode?"
                : "Enable Maintenance Mode?"}
            </h2>

            <p className="text-gray-700 mb-6">
              Are you sure you want to{" "}
              <strong>{enabled ? "disable" : "enable"}</strong> maintenance
              mode?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={confirmToggle}
                className={`px-4 py-2 rounded text-white ${
                  enabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
