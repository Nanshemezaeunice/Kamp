import { useState, useEffect } from "react";
import { api } from "../config";
import { Building2, User, Mail, Clock, CheckCircle, XCircle, ExternalLink, Eye } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(api("/api/applications"));
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus, reason = "") => {
    setIsActionLoading(true);
    try {
      const response = await fetch(api(`/api/applications/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          rejectionReason: reason 
        }),
      });
      if (response.ok) {
        fetchApplications();
        setConfirmModalOpen(false);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openConfirmModal = (app, status) => {
    const isReject = status === "rejected";
    setModalConfig({
      appId: app._id,
      status: status,
      type: isReject ? "danger" : (status === "accepted" ? "success" : "info"),
      title: isReject ? "Reject Application" : (status === "accepted" ? "Approve Application" : "Review Application"),
      message: isReject 
        ? `Are you sure you want to reject the application from ${app.userId?.name}? This action cannot be undone.`
        : `Are you sure you want to ${status === "accepted" ? "approve" : "mark as reviewed"} the application from ${app.userId?.name}?`,
      confirmText: isReject ? "Reject Application" : (status === "accepted" ? "Approve" : "Mark Reviewed"),
      showReasonInput: isReject
    });
    setRejectionReason("");
    setConfirmModalOpen(true);
  };

  const filteredApplications = filter === "all"
    ? applications
    : applications.filter((app) => app.status === filter);

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Project Applications
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
            Review and approve user applications
          </p>
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          {["all", "pending", "reviewed", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-all ${
                filter === status
                  ? "bg-amber-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-black text-slate-400 uppercase tracking-widest">No applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-shadow group"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    app.applicantType === "organization"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {app.applicantType === "organization" ? (
                      <Building2 className="w-6 h-6" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">
                      {app.userId?.name || "Unknown User"}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      {app.applicantType || "supporter"} · {app.involvementType || "General"}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[app.status] || statusColors.pending}`}>
                  {app.status}
                </div>
              </div>

              {/* Target project */}
              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Target Project
                </p>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="font-bold text-sm">{app.projectId?.name || "Deleted Project"}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Message */}
              {app.message && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-sm italic text-slate-600">&ldquo;{app.message}&rdquo;</p>
                </div>
              )}

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Applicant
                  </p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {app.userId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">
                    Contact
                  </p>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      {app.userId?.email || "N/A"} <Mail className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Applied {new Date(app.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => openConfirmModal(app, "accepted")}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openConfirmModal(app, "reviewed")}
                      className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => openConfirmModal(app, "rejected")}
                      className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {app.status === "reviewed" && (
                  <>
                    <button
                      onClick={() => openConfirmModal(app, "accepted")}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openConfirmModal(app, "rejected")}
                      className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {app.status === "accepted" && (
                  <div className="flex-1 bg-emerald-50 text-emerald-700 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest text-center">
                    ✓ Approved
                  </div>
                )}
                {app.status === "rejected" && (
                  <div className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest text-center">
                    ✕ Rejected
                    {app.rejectionReason && (
                      <span className="block italic text-[8px] mt-1 normal-case font-medium">
                        Reason: {app.rejectionReason}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleStatusUpdate(modalConfig.appId, modalConfig.status, rejectionReason)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        isLoading={isActionLoading}
        showReasonInput={modalConfig.showReasonInput}
        reasonValue={rejectionReason}
        onReasonChange={setRejectionReason}
      />
    </div>
  );
};

export default AdminApplications;
