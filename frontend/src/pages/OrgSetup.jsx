import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { api } from "../config";

const orgCategories = [
  "Health", "Education", "Water & Sanitation", "Agriculture",
  "Humanitarian Aid", "Gender & Development", "Environment",
  "Economic Development", "Other",
];

const OrgSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [form, setForm] = useState({
    category: "Health",
    description: "",
    phone: "",
    website: "",
    address: "",
    registrationNumber: "",
    foundingYear: "",
    teamSize: "",
    missionStatement: "",
    areasOfOperation: "",
    previousProjects: "",
  });

  // Fetch existing profile to prefill
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("kamp_token");
        if (!token) { navigate("/get-started"); return; }

        const res = await fetch(api("/api/profiles/org/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.setupStatus === "under_review" || data.setupStatus === "verified") {
            setShowPopup(true);
            setLoading(false);
            return;
          }
          setForm((prev) => ({
            ...prev,
            category: data.category || prev.category,
            description: data.description || prev.description,
            phone: data.phone || prev.phone,
            website: data.website || prev.website,
            address: data.address || prev.address,
            registrationNumber: data.registrationNumber || prev.registrationNumber,
            foundingYear: data.foundingYear || prev.foundingYear,
            teamSize: data.teamSize || prev.teamSize,
            missionStatement: data.missionStatement || prev.missionStatement,
            areasOfOperation: Array.isArray(data.areasOfOperation) ? data.areasOfOperation.join(", ") : prev.areasOfOperation,
            previousProjects: Array.isArray(data.previousProjects) ? data.previousProjects.join(", ") : prev.previousProjects,
          }));
        }
      } catch {
        // ignore – fresh user
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = localStorage.getItem("kamp_token");
      const res = await fetch(api("/api/profiles/org/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          foundingYear: form.foundingYear ? Number(form.foundingYear) : undefined,
          areasOfOperation: form.areasOfOperation
            ? form.areasOfOperation.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          previousProjects: form.previousProjects
            ? form.previousProjects.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          finalize: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPopup(true);
      } else {
        // Clean up Mongoose validation errors for a better user experience
        let errorMsg = data.message || "Failed to save profile";
        if (errorMsg.includes("validation failed")) {
          errorMsg = "Please ensure all required fields are filled out correctly.";
        }
        setError(errorMsg);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── Under-Review Popup ───
  if (showPopup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Verification In Progress
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing your organisation profile! Your
            information is currently being reviewed by the KAMP team. We'll
            notify you once your organisation has been verified.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Organisation Profile
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Provide detailed information about your organisation so the KAMP
            team can verify and approve it.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-3">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {orgCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
                placeholder="+256 700 000 000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className={inputClass}
                placeholder="https://yourorg.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
                placeholder="Kampala, Uganda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                className={inputClass}
                placeholder="NGO-REG-XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Founded
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={form.foundingYear}
                onChange={(e) => setForm({ ...form, foundingYear: e.target.value })}
                className={inputClass}
                placeholder="e.g. 2015"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                value={form.teamSize}
                onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                className={inputClass}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 border-b pb-3 pt-4">
            Detailed Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Brief overview of what your organisation does..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mission Statement
            </label>
            <textarea
              rows={3}
              value={form.missionStatement}
              onChange={(e) => setForm({ ...form, missionStatement: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Your organisation's mission..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas of Operation
            </label>
            <input
              type="text"
              value={form.areasOfOperation}
              onChange={(e) => setForm({ ...form, areasOfOperation: e.target.value })}
              className={inputClass}
              placeholder="e.g. Karamoja, Kampala, Gulu (comma-separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Projects
            </label>
            <input
              type="text"
              value={form.previousProjects}
              onChange={(e) => setForm({ ...form, previousProjects: e.target.value })}
              className={inputClass}
              placeholder="e.g. Clean Water Initiative, School Feeding Program (comma-separated)"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 mt-4"
          >
            {saving ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrgSetup;
