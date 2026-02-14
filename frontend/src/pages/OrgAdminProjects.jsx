import { useState, useEffect } from "react";
import { api } from "../config";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { FolderKanban, Calendar, DollarSign, Users, ExternalLink, FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const OrgAdminProjects = () => {
  const { id } = useParams();
  const { organization } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");

  const userId = organization?.userId?._id || organization?.userId;

  useEffect(() => {
    fetchProjects();
    if (userId) {
      fetchApplications();
    }
  }, [id, userId]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
      const res = await fetch(api(`/api/admin/organizations/${id}/projects`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(api(`/api/applications/user/${userId}`));
      if (res.ok) {
        const data = await res.json();
        setApplications(data.filter(app => app.applicantType === "organization"));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const involvedProjects = projects; // Projects they created
  const participatingProjects = applications.filter(app => app.status === "accepted");
  const unrespondedCount = applications.filter(app => app.status === "pending" || app.status === "reviewed").length;

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "reviewed": return <Eye className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects & Applications</h2>
        <p className="text-sm text-gray-500">
          View all projects and applications for this organization
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("managed")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "managed"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Managed Projects ({involvedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("involved")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "involved"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Involved Projects ({participatingProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "applications"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Applications History ({unrespondedCount})
          </button>
        </div>
      </div>

      {/* Managed Projects Tab */}
      {activeTab === "managed" && (
        <>
          {involvedProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Managed Projects</h3>
              <p className="text-gray-500">
                This organization hasn&apos;t created any projects on KAMP yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {involvedProjects.map((project) => {
                const progress = project.goal > 0 
                  ? Math.round((project.raised / project.goal) * 100)
                  : 0;

                return (
                  <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          <Link
                            to={`/admin/projects/${project._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === "Active" 
                          ? "bg-green-100 text-green-700"
                          : project.status === "Completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(project.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Raised / Goal</p>
                          <p className="text-sm font-medium text-gray-900">
                            ${project.raised?.toLocaleString()} / ${project.goal?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Donors</p>
                          <p className="text-sm font-medium text-gray-900">{project.donors || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Funding Progress</span>
                        <span className="text-xs font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Involved Projects Tab (Same as Supporter) */}
      {activeTab === "involved" && (
        <>
          {participatingProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Involved Projects</h3>
              <p className="text-gray-500">
                This organization is not officially involved in any external projects yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participatingProjects.map((app) => (
                <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{app.projectId?.name}</h3>
                        <Link
                          to={`/admin/projects/${app.projectId?._id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{app.projectId?.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      Involved
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(app.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="font-bold text-blue-600 uppercase tracking-tighter">
                      {app.involvementType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <>
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications History</h3>
              <p className="text-gray-500">
                This organization has no previous or pending applications.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {app.projectId?.name || "Unknown Project"}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                        {app.involvementType || "General Support"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600 italic">&ldquo;{app.message}&rdquo;</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500">
                      Applied {new Date(app.createdAt).toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </p>
                    {app.projectId?._id && (
                      <Link
                        to={`/admin/projects/${app.projectId._id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Project <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrgAdminProjects;
