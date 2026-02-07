import { useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { AlertTriangle, Ban, PauseCircle, CheckCircle, Trash2 } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

const OrgAdminSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization, refreshOrganization } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [actionReason, setActionReason] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    showReasonInput: false
  });

  const isVerified = organization.setupStatus === "verified";
  const isBanned = organization.setupStatus === "banned";
  const isSuspended = organization.setupStatus === "suspended";

  const openConfirmModal = (type, title, message, confirmText, onConfirm, showReasonInput = false) => {
    setModalConfig({ type, title, message, confirmText, onConfirm, showReasonInput });
    setModalOpen(true);
  };

  const handleVerify = async () => {
    openConfirmModal(
      "success-action",
      "Verify Organization",
      "Are you sure you want to verify this organization? This will allow them to create projects and access all platform features.",
      "Verify Now",
      async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
          const res = await fetch(`http://localhost:3001/api/admin/organizations/${id}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ setupStatus: "verified" }),
          });
          
          if (res.ok) {
            await refreshOrganization();
            setModalOpen(false);
          }
        } catch (error) {
          console.error("Error verifying organization:", error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleBan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
      const res = await fetch(`http://localhost:3001/api/admin/organizations/${id}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "ban", reason: actionReason }),
      });
      
      if (res.ok) {
        await refreshOrganization();
        setModalOpen(false);
        setActionReason("");
      }
    } catch (error) {
      console.error("Error banning organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
      const res = await fetch(`http://localhost:3001/api/admin/organizations/${id}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "suspend", reason: actionReason }),
      });
      
      if (res.ok) {
        await refreshOrganization();
        setModalOpen(false);
        setActionReason("");
      }
    } catch (error) {
      console.error("Error suspending organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    openConfirmModal(
      "success-action",
      "Reactivate Organization",
      "Are you sure you want to reactivate this organization? Their status will be set back to verified.",
      "Reactivate Now",
      async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
          const res = await fetch(`http://localhost:3001/api/admin/organizations/${id}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ setupStatus: "verified" }),
          });
          
          if (res.ok) {
            await refreshOrganization();
            setModalOpen(false);
          }
        } catch (error) {
          console.error("Error reactivating organization:", error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
      const res = await fetch(`http://localhost:3001/api/admin/organizations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setModalOpen(false);
        window.close(); // Close the tab
        // Fallback if window.close() doesn't work
        setTimeout(() => {
          navigate("/admin/organisations");
        }, 100);
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-sm text-gray-500">
          Manage organization status and permissions
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Account Status</p>
            <p className={`text-lg font-semibold ${
              isVerified ? "text-green-600" :
              isBanned ? "text-red-600" :
              isSuspended ? "text-orange-600" :
              "text-yellow-600"
            }`}>
              {organization.setupStatus.replace("_", " ").toUpperCase()}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isVerified ? "bg-green-100" :
            isBanned ? "bg-red-100" :
            isSuspended ? "bg-orange-100" :
            "bg-yellow-100"
          }`}>
            {isVerified ? <CheckCircle className="w-6 h-6 text-green-600" /> :
             isBanned ? <Ban className="w-6 h-6 text-red-600" /> :
             isSuspended ? <PauseCircle className="w-6 h-6 text-orange-600" /> :
             <AlertTriangle className="w-6 h-6 text-yellow-600" />}
          </div>
        </div>
      </div>

      {/* Verification */}
      {!isVerified && !isBanned && !isSuspended && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
          <p className="text-sm text-gray-600 mb-4">
            Verify this organization to allow them to create projects and participate fully on the platform.
          </p>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Verify Organization
          </button>
        </div>
      )}

      {/* Ban/Suspend Actions (Only for verified orgs) */}
      {isVerified && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restrict Access</h3>
              <p className="text-sm text-gray-600">
                Suspend or ban this organization if they violate KAMP policies.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openConfirmModal(
                "suspend",
                "Suspend Organization",
                "Are you sure you want to suspend this organization? They will be temporarily restricted from creating new projects.",
                "Suspend Now",
                handleSuspend,
                true
              )}
              disabled={loading}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <PauseCircle className="w-5 h-5" />
              Suspend
            </button>
            <button
              onClick={() => openConfirmModal(
                "ban",
                "Ban Organization",
                "Are you sure you want to ban this organization? They will lose all access to the platform.",
                "Ban Now",
                handleBan,
                true
              )}
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Ban className="w-5 h-5" />
              Ban
            </button>
          </div>
        </div>
      )}

      {/* Reactivate (For banned/suspended orgs) */}
      {(isBanned || isSuspended) && (
        <div className="bg-white rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reactivate Organization</h3>
          <p className="text-sm text-gray-600 mb-4">
            Restore this organization&apos;s access and change their status back to verified.
          </p>
          {organization.actionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-xs text-red-600 mb-1">Current Restriction Reason:</p>
              <p className="text-sm text-red-800">{organization.actionReason}</p>
            </div>
          )}
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Reactivate Organization
          </button>
        </div>
      )}

      {/* Delete */}
      <div className="bg-white rounded-xl border border-red-300 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Organization</h3>
            <p className="text-sm text-gray-600">
              Permanently delete this organization and their user account. This action cannot be undone.
            </p>
          </div>
        </div>
        <button
          onClick={() => openConfirmModal(
            "danger",
            "Delete Organization",
            "This action is permanent and cannot be undone. Are you sure you want to delete this organization and all their data?",
            "Delete Permanently",
            handleDelete
          )}
          disabled={loading}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          Delete Organization
        </button>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActionReason("");
        }}
        onConfirm={modalConfig.onConfirm}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isLoading={loading}
        showReasonInput={modalConfig.showReasonInput}
        reasonValue={actionReason}
        onReasonChange={setActionReason}
      />
    </div>
  );
};

export default OrgAdminSettings;
