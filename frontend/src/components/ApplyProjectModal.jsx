import { useState } from "react";
import { X, Send } from "lucide-react";
import { api } from "../config";

const ApplyProjectModal = ({ project, onClose, onSuccess }) => {
  const [involvementType, setInvolvementType] = useState("Other");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const involvementOptions = [
    "Technical Support",
    "Funding",
    "Resource Provision",
    "Operations",
    "Volunteering",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please provide a message explaining why you want to join.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("kamp_token");
      const user = JSON.parse(localStorage.getItem("kamp_user") || "{}");

      if (!token) {
        setError("You must be logged in to apply. Please log in first.");
        setLoading(false);
        return;
      }

      const res = await fetch(api("/api/applications"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: project._id,
          involvementType,
          message,
          applicantType: user.type === "Organization" ? "organization" : "supporter",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess(project._id);
      } else {
        setError(data.message || "Failed to submit application");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Apply to Project</h3>
            <p className="text-sm text-gray-500 mt-0.5">{project.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Involvement Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              How would you like to be involved?
            </label>
            <select
              value={involvementType}
              onChange={(e) => setInvolvementType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {involvementOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Why do you want to join this project?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Describe your motivation, relevant experience, and how you plan to contribute..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{message.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyProjectModal;
