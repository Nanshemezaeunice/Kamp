import { useState, useEffect } from "react";
import { api } from "../config";
import { User, Lock, Building2, Mail, Eye, EyeOff, Upload, Camera } from "lucide-react";

const OrgSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Organization State
  const [orgData, setOrgData] = useState({
    organisationName: "",
    registrationNumber: "",
    organisationType: "",
    description: "",
    website: "",
    phoneNumber: "",
    logo: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("kamp_token");
      const userStr = localStorage.getItem("kamp_user");
      if (!userStr) return;
      const userId = JSON.parse(userStr).id;
      
      const response = await fetch(api(`/api/users/${userId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || "",
          email: data.email || "",
        });
        if (data.profile) {
          setOrgData({
            organisationName: data.profile.organisationName || data.name || "",
            registrationNumber: data.profile.registrationNumber || "",
            organisationType: data.profile.organisationType || data.profile.category || "",
            description: data.profile.description || "",
            website: data.profile.website || "",
            phoneNumber: data.profile.phoneNumber || data.profile.phone || "",
            logo: data.profile.logo || ""
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgData({ ...orgData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("kamp_token");
      const userId = JSON.parse(localStorage.getItem("kamp_user") || "{}").id;
      
      const response = await fetch(api(`/api/users/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const currentUser = JSON.parse(localStorage.getItem("kamp_user") || "{}");
        localStorage.setItem("kamp_user", JSON.stringify({ ...currentUser, name: updatedUser.name, email: updatedUser.email }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("kamp_token");
      const userId = JSON.parse(localStorage.getItem("kamp_user") || "{}").id;
      
      const response = await fetch(api(`/api/users/${userId}/password`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to update password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleOrgUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("kamp_token");
      const userId = JSON.parse(localStorage.getItem("kamp_user") || "{}").id;
      
      const response = await fetch(api(`/api/users/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orgData)
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Organization details updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to update organization" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "organization", label: "Organization", icon: Building2 },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and organization preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage({ type: "", text: "" });
                }}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {message.text && (
          <div className={`mx-6 mt-6 p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {activeTab === "profile" && (
          <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john@organization.com"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordUpdate} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "organization" && (
          <form onSubmit={handleOrgUpdate} className="p-6 space-y-6">
            <div className="flex flex-col items-center justify-center pb-6 border-b border-gray-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
                  {orgData.logo ? (
                    <img src={orgData.logo} alt="Organization Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Logo</span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-100 p-2 rounded-full cursor-pointer hover:bg-blue-50 transition-all text-blue-600">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-gray-700">Organization Logo</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-widest">JPG, PNG or GIF • Max 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Organization Name</label>
              <input
                required
                type="text"
                value={orgData.organisationName}
                onChange={(e) => setOrgData({ ...orgData, organisationName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="KAMP Foundation"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Number</label>
                <input
                  type="text"
                  value={orgData.registrationNumber}
                  onChange={(e) => setOrgData({ ...orgData, registrationNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="REG-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Organization Type</label>
                <select
                  value={orgData.organisationType}
                  onChange={(e) => setOrgData({ ...orgData, organisationType: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="NGO">NGO</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Charity">Charity</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Community Group">Community Group</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={orgData.description}
                onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                placeholder="Tell us about your organization..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={orgData.website}
                  onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={orgData.phoneNumber}
                  onChange={(e) => setOrgData({ ...orgData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md"
              >
                {loading ? "Updating..." : "Update Organization"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrgSettings;
