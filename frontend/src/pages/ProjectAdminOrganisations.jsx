import { useState, useEffect } from "react";
import { api } from "../config";
import { useOutletContext } from "react-router-dom";
import { Building2, Mail, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

const ProjectAdminOrganisations = () => {
  const { project, refreshCounts } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [project._id]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(api(`/api/applications/project/${project._id}`));
      if (res.ok) {
        const data = await res.json();
        setApplications(data.filter(app => app.applicantType === "organization"));
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, status, reason = "") => {
    setIsActionLoading(true);
    try {
      const res = await fetch(api(`/api/applications/${appId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          rejectionReason: reason 
        }),
      });
      if (res.ok) {
        fetchApplications();
        if (refreshCounts) refreshCounts();
        setConfirmModalOpen(false);
      }
    } catch (err) {
      console.error("Error updating application:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openConfirmModal = (type, title, message, confirmText, appId, status, showReason = false) => {
    setModalConfig({ type, title, message, confirmText, appId, status, showReason });
    setRejectionReason("");
    setConfirmModalOpen(true);
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "rejected": return <XCircle className="w-5 h-5 text-red-600" />;
      case "reviewed": return <Eye className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Organization Applications</h2>
          <p className="text-sm text-slate-500 font-medium">
            {applications.length} organization{applications.length !== 1 ? 's' : ''} applied for this project
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
          <Building2 className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No applications yet</p>
          <p className="text-sm text-slate-400 max-w-xs px-6">No organizations have applied to this project yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((app) => (
            <div key={app._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">
                      {app.userId?.name || "Unknown Organization"}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      {app.involvementType || "General Support"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(app.status)}
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[app.status]}`}>
                    {app.status}
                  </div>
                </div>
              </div>

              {app.message && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-sm italic text-slate-600">&ldquo;{app.message}&rdquo;</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 mb-4">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-600">{app.userId?.email || "No email"}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Applied {new Date(app.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => openConfirmModal(
                        "success",
                        "Approve Application",
                        `Approve ${app.userId?.name || "this organization"} to join this project?`,
                        "Approve",
                        app._id,
                        "accepted"
                      )}
                      className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app._id, "reviewed")}
                      className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => openConfirmModal(
                        "danger",
                        "Reject Application",
                        `Reject ${app.userId?.name || "this organization"}'s application? This action requires a reason.`,
                        "Reject",
                        app._id,
                        "rejected",
                        true
                      )}
                      className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {app.status === "reviewed" && (
                  <>
                    <button
                      onClick={() => openConfirmModal(
                        "success",
                        "Approve Application",
                        `Approve ${app.userId?.name || "this organization"} to join this project?`,
                        "Approve",
                        app._id,
                        "accepted"
                      )}
                      className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openConfirmModal(
                        "danger",
                        "Reject Application",
                        `Reject ${app.userId?.name || "this organization"}'s application? This action requires a reason.`,
                        "Reject",
                        app._id,
                        "rejected",
                        true
                      )}
                      className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
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
                  <div className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg font-black text-[10px] uppercase  tracking-widest text-center">
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

      {confirmModalOpen && (
        <ConfirmationModal
          isOpen={confirmModalOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          onConfirm={() => handleStatusUpdate(modalConfig.appId, modalConfig.status, rejectionReason)}
          onClose={() => setConfirmModalOpen(false)}
          isLoading={isActionLoading}
          showReasonInput={modalConfig.showReason}
          reasonValue={rejectionReason}
          onReasonChange={setRejectionReason}
        />
      )}
    </div>
  );
};

export default ProjectAdminOrganisations;
