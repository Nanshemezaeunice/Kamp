import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle, Clock, XCircle, Ban, PauseCircle, Trash2, ExternalLink } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

const AdminOrganisations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    orgId: null
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const openConfirmModal = (type, title, message, confirmText, onConfirm, orgId) => {
    setModalConfig({ type, title, message, confirmText, onConfirm, orgId });
    setModalOpen(true);
  };

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
      const user = JSON.parse(localStorage.getItem("kamp_user") || "{}");
      
      console.log("🔍 Debug Info:");
      console.log("Token exists:", !!token);
      console.log("Token length:", token?.length);
      console.log("User from localStorage:", user);
      console.log("User type:", user.type);
      
      if (!token) {
        console.error("No token found in localStorage!");
        return;
      }
      
      const res = await fetch("http://localhost:3001/api/admin/organizations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Organizations fetched:", data.length);
        setOrganizations(data);
      } else {
        const errorData = await res.json();
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orgId) => {
    openConfirmModal(
      "success-action",
      "Verify Organization",
      "Are you sure you want to verify this organization? This will allow them to create projects and access all platform features.",
      "Verify Now",
      async () => {
        try {
          const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
          const res = await fetch(`http://localhost:3001/api/admin/organizations/${orgId}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ setupStatus: "verified" }),
          });
          
          if (res.ok) {
            fetchOrganizations();
            setModalOpen(false);
          }
        } catch (error) {
          console.error("Error verifying organization:", error);
        }
      },
      orgId
    );
  };

  const handleReject = async (orgId) => {
    openConfirmModal(
      "warning",
      "Reject Organization",
      "Are you sure you want to reject this organization's application? They will be notified of this decision.",
      "Reject Application",
      async () => {
        try {
          const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
          const res = await fetch(`http://localhost:3001/api/admin/organizations/${orgId}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ setupStatus: "rejected" }),
          });
          
          if (res.ok) {
            fetchOrganizations();
            setModalOpen(false);
          }
        } catch (error) {
          console.error("Error rejecting organization:", error);
        }
      },
      orgId
    );
  };

  const handleDelete = async (orgId) => {
    openConfirmModal(
      "danger",
      "Delete Organization",
      "This action is permanent and cannot be undone. All data associated with this organization will be removed.",
      "Delete Permanently",
      async () => {
        try {
          const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
          const res = await fetch(`http://localhost:3001/api/admin/organizations/${orgId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.ok) {
            fetchOrganizations();
            setModalOpen(false);
          }
        } catch (error) {
          console.error("Error deleting organization:", error);
        }
      },
      orgId
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      details_pending: { color: "bg-gray-100 text-gray-600", icon: Clock, label: "Details Pending" },
      under_review: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Under Review" },
      verified: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Verified" },
      rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
      banned: { color: "bg-red-100 text-red-700", icon: Ban, label: "Banned" },
      suspended: { color: "bg-orange-100 text-orange-700", icon: PauseCircle, label: "Suspended" },
    };
    
    const badge = badges[status] || badges.details_pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesFilter = filter === "all" || org.setupStatus === filter;
    const matchesSearch = org.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
            <p className="text-sm text-gray-500">Manage and verify registered organizations</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "under_review", "verified", "rejected", "banned", "suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "All" : status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {organizations.filter(o => o.setupStatus === "under_review").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Verified</p>
          <p className="text-2xl font-bold text-green-600">
            {organizations.filter(o => o.setupStatus === "verified").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {organizations.filter(o => o.setupStatus === "rejected").length}
          </p>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{org.userId?.name}</p>
                          <p className="text-sm text-gray-500">{org.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{org.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(org.setupStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/organisation/${org._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        
                        {org.setupStatus === "under_review" && (
                          <>
                            <button
                              onClick={() => handleVerify(org._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Verify"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(org._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDelete(org._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
};

export default AdminOrganisations;
