import { useState } from "react";
import { api } from "../config";

const DonationForm = ({ project, onComplete, onCancel }) => {
  const [donorType, setDonorType] = useState("Individual");
  const [isAuthMode, setIsAuthMode] = useState(false); // For organizations: login/register
  const [authView, setAuthView] = useState("login"); // 'login' or 'register'
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("kamp_user")));
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    amount: "",
    message: "",
    cause: project.categories?.[0] || "",
    email: user?.email || "",
    password: "",
    orgName: user?.name || "",
    paymentMethod: "Card",
    cardNumber: "",
    expiry: "",
    cvv: "",
    phoneNumber: "",
    momoProvider: "MTN"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const endpoint = authView === "login" ? "login" : "register";
    const payload = authView === "login" 
      ? { email: formData.email, password: formData.password }
      : { name: formData.orgName, email: formData.email, password: formData.password, type: "Organization" };

    try {
      const response = await fetch(api(`/api/auth/${endpoint}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("kamp_user", JSON.stringify(data.user));
        localStorage.setItem("kamp_token", data.token);
        setUser(data.user);
        setFormData({ ...formData, name: data.user.name, email: data.user.email });
        setIsAuthMode(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (donorType === "Organization" && !user) {
      setIsAuthMode(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(api("/api/donations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project._id,
          amount: formData.amount,
          donorType,
          name: formData.name,
          message: formData.message,
          cause: formData.cause,
          userId: user?.id,
          paymentMethod: formData.paymentMethod
        }),
      });

      if (response.ok) {
        onComplete(formData.amount);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError("Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthMode && donorType === "Organization" && !user) {
    return (
      <div className="animate-fadeIn">
        <h3 className="text-xl font-black text-slate-900 mb-2">Organization Access</h3>
        <p className="text-sm text-slate-500 mb-6">Organizations must have a verified KAMP account to process donations.</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {authView === "register" && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Entity Name</label>
              <input
                required
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="e.g. Hope Foundation International"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="contact@org.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Security Key</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.228 0 2.391.272 3.432.748m3.095 2.342a10.05 10.05 0 014.131 3.91M9 9l3 3m0 0l3 3m-3-3l3-3m-3 3l-3 3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition"
          >
            {loading ? "Verifying..." : authView === "login" ? "Authorize Login" : "Create Account"}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setAuthView(authView === "login" ? "register" : "login")}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest"
            >
              {authView === "login" ? "Need an organisation account?" : "Already have an account?"}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setIsAuthMode(false)}
            className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest py-2"
          >
            Cancel and Donate as Individual
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {/* Donor Type Toggle */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setDonorType("Individual")}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${donorType === "Individual" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
        >Individual</button>
        <button
          type="button"
          onClick={() => setDonorType("Organization")}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${donorType === "Organization" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
        >Organization</button>
      </div>

      {user && donorType === "Organization" && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold">
              {user.name?.[0]}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">{user.name}</p>
              <p className="text-[10px] opacity-70">Verified Organization</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => {
              localStorage.removeItem("kamp_user");
              localStorage.removeItem("kamp_token");
              setUser(null);
            }}
            className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100"
          >Sign Out</button>
        </div>
      )}

      {/* Name/Amount Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            placeholder={donorType === "Individual" ? "Your Name or Anonymous" : "Organisation Name"}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Donation Amount ($)</label>
          <input
            required
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
            placeholder="100"
            min="1"
          />
        </div>
      </div>

      {/* Cause Selection */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Cause</label>
        <div className="flex flex-wrap gap-2">
          {project.categories?.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setFormData({...formData, cause: cat})}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.cause === cat ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({...formData, paymentMethod: "Card"})}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === "Card" ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white"}`}
          >
            <span className="text-xl">💳</span>
            <span className={`text-[11px] font-black uppercase tracking-widest ${formData.paymentMethod === "Card" ? "text-blue-600" : "text-slate-400"}`}>Credit Card</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, paymentMethod: "Mobile Money"})}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === "Mobile Money" ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white"}`}
          >
            <span className="text-xl">📱</span>
            <span className={`text-[11px] font-black uppercase tracking-widest ${formData.paymentMethod === "Mobile Money" ? "text-blue-600" : "text-slate-400"}`}>Mobile Money</span>
          </button>
        </div>

        {/* Conditional Payment Details */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          {formData.paymentMethod === "Card" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={(e) => setFormData({...formData, expiry: e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5)})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, momoProvider: "MTN"})}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.momoProvider === "MTN" ? "bg-yellow-400 text-yellow-900 shadow-sm" : "text-slate-400 hover:text-yellow-600"}`}
                >MTN MoMo</button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, momoProvider: "Airtel"})}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.momoProvider === "Airtel" ? "bg-red-600 text-white shadow-sm" : "text-slate-400 hover:text-red-600"}`}
                >Airtel Money</button>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm border-r border-slate-100 pr-3">+256</span>
                  <input
                    type="text"
                    placeholder="770 000000"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                    className="w-full pl-16 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold tracking-widest"
                  />
                </div>
              </div>
            </div>
          )}
          <p className="mt-4 text-[9px] text-slate-400 italic text-center uppercase tracking-widest font-bold">
            🔒 This is a secure demo transaction
          </p>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message (Optional)</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium h-24"
          placeholder="Leave a word of encouragement..."
        />
      </div>

      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

      <div className="pt-4 flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition"
        >
          Nevermind
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-2 bg-linear-to-r from-blue-600 to-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] py-5 px-8 rounded-2xl hover:shadow-2xl hover:shadow-blue-200 transition-all"
        >
          {loading ? "Processing..." : `Send $${formData.amount || '0'} Donation`}
        </button>
      </div>
    </form>
  );
};

export default DonationForm;
