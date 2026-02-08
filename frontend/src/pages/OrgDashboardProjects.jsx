import { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, Eye, Plus } from "lucide-react";
import ProjectInfoModal from "../components/ProjectInfoModal";
import ApplyProjectModal from "../components/ApplyProjectModal";
import DonationForm from "../components/DonationForm";
import CreateProjectModal from "../components/CreateProjectModal";
import { api } from "../config";

const OrgDashboardProjects = () => {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [appliedMap, setAppliedMap] = useState({});
  const token = localStorage.getItem("kamp_token");
  const user = JSON.parse(localStorage.getItem("kamp_user") || "null");

  useEffect(() => {
    fetchProjects();
    fetchApplications();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(api("/api/projects"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProjects(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(api("/api/applications/my-applications"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
        const map = {};
        data.forEach((a) => { map[a.projectId?._id || a.projectId] = a.status; });
        setAppliedMap(map);
      }
    } catch { /* ignore */ }
  };

  const unrespondedCount = applications.filter(app => ["pending", "reviewed"].includes(app.status)).length;

  const combinedApplications = [
    ...applications,
    ...projects
      .filter(p => (p.creatorId?._id === user?.id || p.creatorId === user?.id))
      .filter(p => !applications.some(app => (app.projectId?._id || app.projectId) === p._id))
      .map(p => ({
        _id: `creator-${p._id}`,
        projectId: p,
        status: 'Head',
        createdAt: p.createdAt,
        isCreator: true
      }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCardClick = (project) => {
    setSelectedProject(project);
    setShowInfoModal(true);
  };

  const handleApply = (project) => {
    setShowInfoModal(false);
    setSelectedProject(project);
    setShowApplyModal(true);
  };

  const handleDonate = (project) => {
    setShowInfoModal(false);
    setSelectedProject(project);
    setShowDonationForm(true);
  };

  const handleApplySuccess = (projectId) => {
    setAppliedMap((prev) => ({ ...prev, [projectId]: "pending" }));
    setShowApplyModal(false);
    setSelectedProject(null);
    fetchApplications();
  };

  const handleCreateProject = async (newProjectData) => {
    try {
      const response = await fetch(api("/api/projects"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProjectData),
      });
      if (response.ok) {
        setShowCreateModal(false);
        fetchProjects();
        alert("Project submitted for review successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getAppStatusIcon = (status) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected": return <XCircle className="w-5 h-5 text-red-600" />;
      case "reviewed": return <Eye className="w-5 h-5 text-blue-600" />;
      case "Head": return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const appBadge = (s) => ({
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    Head: "bg-blue-600 text-white font-black",
  }[s] || "bg-gray-100 text-gray-700");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 mt-1">Browse projects and track your applications.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 font-semibold transition ${activeTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
          All Projects
        </button>
        <button onClick={() => setActiveTab("applications")} className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${activeTab === "applications" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
          My Applications
          {unrespondedCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unrespondedCount}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : activeTab === "all" ? (
        projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <span className="text-5xl block mb-4">📋</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Yet</h3>
            <p className="text-gray-500">No projects on KAMP yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const progress = p.goal > 0 ? Math.round((p.raised / p.goal) * 100) : 0;
              const applied = appliedMap[p._id];
              return (
                <div key={p._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group">
                  <div className="cursor-pointer" onClick={() => handleCardClick(p)}>
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />}
                    <div className="p-5 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>{p.status || "Active"}</span>
                        {applied && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appBadge(applied)}`}>
                            {applied === "pending" ? "Applied" : applied.charAt(0).toUpperCase() + applied.slice(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{p.name || p.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                      <div className="mb-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">${(p.raised || 0).toLocaleString()}</span>
                          <span className="text-gray-500">${(p.goal || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-4 flex gap-2">
                    {p.creatorId?._id === user?.id || p.creatorId === user?.id ? (
                      <div className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-black text-center uppercase tracking-widest border border-blue-100 italic">
                        Project Head
                      </div>
                    ) : (
                      <>
                        {p.isOpenForDonations && (
                          <button onClick={() => handleDonate(p)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">Donate</button>
                        )}
                        {applied ? (
                          <div className={`flex-1 py-2 rounded-lg text-sm font-semibold text-center ${appBadge(applied)}`}>
                            {applied === "pending" ? "Applied ✓" : applied.charAt(0).toUpperCase() + applied.slice(1)}
                          </div>
                        ) : (
                          <button onClick={() => handleApply(p)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Apply</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        combinedApplications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <span className="text-5xl block mb-4">📝</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Applications Yet</h3>
            <p className="text-gray-500">You haven&apos;t applied to any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {combinedApplications.map((app) => (
              <div 
                key={app._id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                onClick={() => handleCardClick(app.projectId)}
              >
                {app.projectId?.image && (
                  <img src={app.projectId.image} alt={app.projectId.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{app.projectId?.name || "Project Deleted"}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{app.projectId?.description}</p>
                  </div>
                  {getAppStatusIcon(app.status)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${appBadge(app.status)}`}>
                    {app.status === 'Head' ? (
                      <span className="flex items-center gap-1">MANAGEMENT</span>
                    ) : (
                      app.status.charAt(0).toUpperCase() + app.status.slice(1)
                    )}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                {app.status === "pending" && <p className="text-xs text-gray-500 mt-3 italic">Waiting for admin approval...</p>}
                {app.status === "accepted" && <p className="text-xs text-green-600 mt-3 font-semibold">✓ You&apos;ve been approved for this project!</p>}
                {app.status === "Head" && <p className="text-xs text-blue-600 mt-3 font-bold">👑 You created this project.</p>}
                {app.status === "rejected" && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                    <p className="text-xs text-red-700 italic">"{app.rejectionReason || "No explanation provided."}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {showInfoModal && selectedProject && (
        <ProjectInfoModal
          project={selectedProject}
          onClose={() => { setShowInfoModal(false); setSelectedProject(null); }}
          onApply={handleApply}
          onDonate={handleDonate}
          hasApplied={!!appliedMap[selectedProject._id]}
          applicationStatus={appliedMap[selectedProject._id]}
          currentUserId={user?.id}
        />
      )}
      {showApplyModal && selectedProject && (
        <ApplyProjectModal
          project={selectedProject}
          onClose={() => { setShowApplyModal(false); setSelectedProject(null); }}
          onSuccess={handleApplySuccess}
        />
      )}
      {showDonationForm && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowDonationForm(false); setSelectedProject(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <DonationForm project={selectedProject} onComplete={() => { setShowDonationForm(false); setSelectedProject(null); fetchProjects(); }} onCancel={() => { setShowDonationForm(false); setSelectedProject(null); }} />
          </div>
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default OrgDashboardProjects;
