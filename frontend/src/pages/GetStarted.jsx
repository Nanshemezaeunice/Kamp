import { useState } from "react";
import { api } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const orgCategories = [
  "Health", "Education", "Water & Sanitation", "Agriculture",
  "Humanitarian Aid", "Gender & Development", "Environment",
  "Economic Development", "Other",
];

const individualInterests = [
  "Donating", "Volunteering", "Advocacy",
  "Research", "Community Monitoring", "Other",
];

const GetStarted = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // ─── NGO Form State ───
  const [ngoForm, setNgoForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    category: "Health", description: "",
  });
  const [ngoShowPw, setNgoShowPw] = useState(false);
  const [ngoShowCpw, setNgoShowCpw] = useState(false);
  const [ngoError, setNgoError] = useState("");
  const [ngoLoading, setNgoLoading] = useState(false);

  // ─── Individual Form State ───
  const [indForm, setIndForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    interest: "Donating",
  });
  const [indShowPw, setIndShowPw] = useState(false);
  const [indShowCpw, setIndShowCpw] = useState(false);
  const [indError, setIndError] = useState("");
  const [indLoading, setIndLoading] = useState(false);

  // ─── NGO Submit ───
  const handleNgoSubmit = async (e) => {
    e.preventDefault();
    setNgoError("");
    if (ngoForm.password !== ngoForm.confirmPassword) {
      return setNgoError("Passwords do not match");
    }
    if (ngoForm.password.length < 6) {
      return setNgoError("Password must be at least 6 characters");
    }
    setNgoLoading(true);
    try {
      const res = await fetch(api("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ngoForm.name,
          email: ngoForm.email,
          password: ngoForm.password,
          type: "Organization",
          category: ngoForm.category,
          description: ngoForm.description,
          phone: ngoForm.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("kamp_token", data.token);
        localStorage.setItem("kamp_user", JSON.stringify(data.user));
        navigate("/organization/setup");
      } else {
        setNgoError(data.message || "Registration failed");
      }
    } catch {
      setNgoError("Network error. Please try again.");
    } finally {
      setNgoLoading(false);
    }
  };

  // ─── Individual Submit ───
  const handleIndSubmit = async (e) => {
    e.preventDefault();
    setIndError("");
    if (indForm.password !== indForm.confirmPassword) {
      return setIndError("Passwords do not match");
    }
    if (indForm.password.length < 6) {
      return setIndError("Password must be at least 6 characters");
    }
    setIndLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: indForm.name,
          email: indForm.email,
          password: indForm.password,
          type: "Individual",
          phone: indForm.phone,
          interest: indForm.interest,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("kamp_token", data.token);
        localStorage.setItem("kamp_user", JSON.stringify(data.user));
        navigate("/supporter/setup");
      } else {
        setIndError(data.message || "Registration failed");
      }
    } catch {
      setIndError("Network error. Please try again.");
    } finally {
      setIndLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div>
      {/* Header */}
      <section
        className="relative bg-cover bg-center text-white py-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=500&fit=crop')`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Get Started with KAMP</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Join the movement to bring transparency and accountability to
            humanitarian projects in Karamoja.
          </p>
        </div>
      </section>

      {/* Role Selection */}
      {!role && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              How would you like to join?
            </h2>
            <p className="text-gray-600 mb-10">
              Choose your role to get started on the right path.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* NGO Card */}
              <button
                onClick={() => setRole("ngo")}
                className="p-8 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left cursor-pointer bg-white overflow-hidden flex flex-col"
              >
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop"
                  alt="NGO"
                  className="w-full h-40 object-cover rounded mb-4"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  I&apos;m an Organisation
                </h3>
                <p className="text-gray-600 text-sm">
                  Create projects, apply to get involved in existing ones,
                  manage funds, and monitor how resources are spent.
                </p>
              </button>

              {/* Supporter Card */}
              <button
                onClick={() => setRole("supporter")}
                className="p-8 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left cursor-pointer bg-white overflow-hidden flex flex-col"
              >
                <img
                  src="https://images.unsplash.com/photo-1469169504649-88b996d3dd5f?w=400&h=250&fit=crop"
                  alt="Supporter"
                  className="w-full h-40 object-cover rounded mb-4"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  I&apos;m a Community Supporter
                </h3>
                <p className="text-gray-600 text-sm">
                  Browse projects, make donations, volunteer, and track how
                  your support makes a real impact.
                </p>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ NGO Registration Form ═══════════ */}
      {role === "ngo" && (
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <button onClick={() => setRole(null)} className="text-blue-600 font-medium mb-6 inline-block hover:underline cursor-pointer">
              ← Back to role selection
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">NGO Registration</h2>
            <p className="text-gray-600 mb-8">Fill in your organization details to apply for access.</p>

            {ngoError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{ngoError}</div>
            )}

            <form onSubmit={handleNgoSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input type="text" required value={ngoForm.name} onChange={(e) => setNgoForm({ ...ngoForm, name: e.target.value })}
                  className={inputClass} placeholder="e.g. Water4Life Uganda" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" required value={ngoForm.email} onChange={(e) => setNgoForm({ ...ngoForm, email: e.target.value })}
                  className={inputClass} placeholder="contact@yourorg.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" required value={ngoForm.phone} onChange={(e) => setNgoForm({ ...ngoForm, phone: e.target.value })}
                  className={inputClass} placeholder="+256 700 000 000" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category of Organisation</label>
                <select value={ngoForm.category} onChange={(e) => setNgoForm({ ...ngoForm, category: e.target.value })}
                  className={inputClass}>
                  {orgCategories.map((c) => (<option key={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description of Your Organization</label>
                <textarea required rows={4} value={ngoForm.description} onChange={(e) => setNgoForm({ ...ngoForm, description: e.target.value })}
                  className={`${inputClass} resize-none`} placeholder="Tell us about what your organization does..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={ngoShowPw ? "text" : "password"} required value={ngoForm.password}
                    onChange={(e) => setNgoForm({ ...ngoForm, password: e.target.value })}
                    className={`${inputClass} pr-12`} placeholder="Create a strong password" />
                  <button type="button" onClick={() => setNgoShowPw(!ngoShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {ngoShowPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={ngoShowCpw ? "text" : "password"} required value={ngoForm.confirmPassword}
                    onChange={(e) => setNgoForm({ ...ngoForm, confirmPassword: e.target.value })}
                    className={`${inputClass} pr-12`} placeholder="Re-enter your password" />
                  <button type="button" onClick={() => setNgoShowCpw(!ngoShowCpw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {ngoShowCpw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={ngoLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50">
                {ngoLoading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
            <p className="text-center text-gray-500 mt-6 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
            </p>
          </div>
        </section>
      )}

      {/* ═══════════ Community Supporter Registration ═══════════ */}
      {role === "supporter" && (
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <button onClick={() => setRole(null)} className="text-blue-600 font-medium mb-6 inline-block hover:underline cursor-pointer">
              ← Back to role selection
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Supporter Sign Up</h2>
            <p className="text-gray-600 mb-8">Create an account to support projects transparently.</p>

            {indError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{indError}</div>
            )}

            <form onSubmit={handleIndSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={indForm.name} onChange={(e) => setIndForm({ ...indForm, name: e.target.value })}
                  className={inputClass} placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={indForm.email} onChange={(e) => setIndForm({ ...indForm, email: e.target.value })}
                  className={inputClass} placeholder="you@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={indForm.phone} onChange={(e) => setIndForm({ ...indForm, phone: e.target.value })}
                  className={inputClass} placeholder="+256 700 000 000" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Interest</label>
                <select value={indForm.interest} onChange={(e) => setIndForm({ ...indForm, interest: e.target.value })}
                  className={inputClass}>
                  {individualInterests.map((i) => (<option key={i}>{i}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={indShowPw ? "text" : "password"} required value={indForm.password}
                    onChange={(e) => setIndForm({ ...indForm, password: e.target.value })}
                    className={`${inputClass} pr-12`} placeholder="Create a strong password" />
                  <button type="button" onClick={() => setIndShowPw(!indShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {indShowPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={indShowCpw ? "text" : "password"} required value={indForm.confirmPassword}
                    onChange={(e) => setIndForm({ ...indForm, confirmPassword: e.target.value })}
                    className={`${inputClass} pr-12`} placeholder="Re-enter your password" />
                  <button type="button" onClick={() => setIndShowCpw(!indShowCpw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {indShowCpw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={indLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50">
                {indLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            <p className="text-center text-gray-500 mt-6 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
            </p>
            <p className="text-center text-gray-400 mt-2 text-xs">
              After signing up, head to{" "}
              <Link to="/projects" className="text-blue-600 font-medium hover:underline">Projects</Link>{" "}
              to find a cause you care about.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default GetStarted;
