import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { api } from "../config";

const interestOptions = [
  "Donating", "Volunteering", "Advocacy",
  "Research", "Community Monitoring", "Other",
];

const SupporterSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    interest: "Donating",
    location: "",
    occupation: "",
    bio: "",
    areasOfInterest: "",
    howHeard: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("kamp_token");
        if (!token) { navigate("/get-started"); return; }

        const res = await fetch(api("/api/profiles/individual/me"), {
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
            phone: data.phone || prev.phone,
            interest: data.interest || prev.interest,
            location: data.location || prev.location,
            occupation: data.occupation || prev.occupation,
            bio: data.bio || prev.bio,
            areasOfInterest: Array.isArray(data.areasOfInterest) ? data.areasOfInterest.join(", ") : prev.areasOfInterest,
            howHeard: data.howHeard || prev.howHeard,
          }));
        }
      } catch {
        // fresh user
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
      const res = await fetch(api("/api/profiles/individual/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          areasOfInterest: form.areasOfInterest
            ? form.areasOfInterest.split(",").map((s) => s.trim()).filter(Boolean)
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

  if (showPopup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Profile Under Review
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing your profile! Your information is
            currently being reviewed by the KAMP team. We'll notify you once
            your account has been verified.
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
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Supporter Profile
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Tell us a bit more about yourself so we can tailor your KAMP
            experience.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-3">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                Primary Interest
              </label>
              <select
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                className={inputClass}
              >
                {interestOptions.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
                placeholder="e.g. Kampala, Uganda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className={inputClass}
                placeholder="e.g. Teacher, Engineer"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 border-b pb-3 pt-4">
            About You
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Tell us a little about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas of Interest
            </label>
            <input
              type="text"
              value={form.areasOfInterest}
              onChange={(e) => setForm({ ...form, areasOfInterest: e.target.value })}
              className={inputClass}
              placeholder="e.g. Health, Education, Agriculture (comma-separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How Did You Hear About KAMP?
            </label>
            <input
              type="text"
              value={form.howHeard}
              onChange={(e) => setForm({ ...form, howHeard: e.target.value })}
              className={inputClass}
              placeholder="e.g. Social media, a friend, news"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 mt-4"
          >
            {saving ? "Submitting..." : "Submit Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupporterSetup;
