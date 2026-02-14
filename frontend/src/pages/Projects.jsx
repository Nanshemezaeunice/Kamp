import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DonationForm from "../components/DonationForm";
import ProjectInfoModal from "../components/ProjectInfoModal";
import ApplyProjectModal from "../components/ApplyProjectModal";
import CreateProjectModal from "../components/CreateProjectModal";
import { Plus } from "lucide-react";
import { api } from "../config";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Track applied projects  {projectId: status}
  const [appliedMap, setAppliedMap] = useState({});

  const user = JSON.parse(localStorage.getItem("kamp_user") || "null");
  const token = localStorage.getItem("kamp_token");
  const isLoggedIn = !!user && !!token;

  useEffect(() => {
    fetchProjects();
    if (isLoggedIn) fetchMyApplications();
  }, []);

  const fetchProjects = async () => {
    try {
      const url = api("/api/projects");
      console.log("Fetching from:", url); // Debug log
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Fetch error:", err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await fetch(api("/api/applications/my-applications"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        data.forEach((a) => { map[a.projectId?._id || a.projectId] = a.status; });
        setAppliedMap(map);
      }
    } catch { /* ignore */ }
  };

  const handleCardClick = (project) => {
    setSelectedProject(project);
    setShowInfoModal(true);
  };

  const handleApply = (project) => {
    if (!isLoggedIn) {
      alert("Please log in or register first to apply for a project.");
      return;
    }
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

  return (
    <div>
      {/* Header */}
      <section 
        className="relative bg-cover bg-center text-white py-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop')`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Browse ongoing projects in Karamoja. Donate directly or apply as an
            NGO to get involved and help manage project resources.
          </p>
          
          {isLoggedIn && (user.type === "Organization" || user.type === "Supporter") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-5 h-5" />
              Create New Project
            </button>
          )}
        </div>
      </section>

      

      {/* Projects Grid */}
      <section className="py-16 min-h-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-20">
              <p>Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-600 py-20">
              <p className="text-xl font-semibold">No public projects available at the moment.</p>
              <p className="mt-2 text-gray-500">Please check back later or start a new project if you're an NGO.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => {
                const progress = project.goal > 0 
                  ? Math.round((project.raised / project.goal) * 100)
                  : 0;
                const applied = appliedMap[project._id];
                
                return (
                  <div
                    key={project._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col group"
                  >
                    {/* Clickable image + info area opens modal */}
                    <div className="cursor-pointer" onClick={() => handleCardClick(project)}>
                      <div className="relative h-48">
                        <img 
                          src={project.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&h=300&fit=crop"}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {project.categories?.slice(0, 2).map((cat, idx) => (
                            <span key={idx} className="text-[10px] font-bold uppercase text-white bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                        {applied && (
                          <div className="absolute top-4 right-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-sm ${
                              applied === "accepted" ? "bg-green-500/90 text-white" :
                              applied === "rejected" ? "bg-red-500/90 text-white" :
                              "bg-amber-500/90 text-white"
                            }`}>
                              {applied === "pending" ? "Applied" : applied.charAt(0).toUpperCase() + applied.slice(1)}
                            </span>
                          </div>
                        )}
                        {project.approvalStatus && project.approvalStatus !== 'approved' && (
                          <div className="absolute bottom-4 right-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-sm ${
                              project.approvalStatus === "rejected" ? "bg-red-600/90 text-white" :
                              "bg-amber-600/90 text-white"
                            }`}>
                              {project.approvalStatus.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 pb-3">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{project.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                        <p className="text-xs text-gray-500 mb-3 font-medium">
                          By <span className="font-bold text-gray-700">{project.creatorId?._id === user?.id || project.creatorId === user?.id ? "Me (Project Head)" : (project.creatorId?.name || project.ngos?.join(", ") || "Unknown NGO")}</span>
                        </p>
                        {/* Progress */}
                        <div className="mb-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">${project.raised?.toLocaleString()} raised</span>
                            <span className="text-gray-500">${project.goal?.toLocaleString()} goal</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                          <p className="text-right text-xs font-bold text-blue-600 mt-1">{progress}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (always visible) */}
                    <div className="px-6 pb-5 mt-auto flex gap-2">
                      {project.creatorId?._id === user?.id || project.creatorId === user?.id ? (
                        <div className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-black text-center uppercase tracking-widest border border-blue-100">
                          Project Head
                        </div>
                      ) : (
                        <>
                          {project.isOpenForDonations && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDonate(project); }}
                              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                            >
                              Donate
                            </button>
                          )}
                          {applied ? (
                            <div className={`flex-1 py-2.5 rounded-lg font-semibold text-center text-sm ${
                              applied === "accepted" ? "bg-green-100 text-green-700" :
                              applied === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {applied === "pending" ? "Applied ✓" : applied.charAt(0).toUpperCase() + applied.slice(1)}
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApply(project); }}
                              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                            >
                              Apply
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA for NGOs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Are You an NGO?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Apply to get involved in existing projects or create your own.
            Manage funds, monitor progress, and bring real impact to Karamoja.
          </p>
          <Link
            to="/get-started"
            className="bg-blue-600 text-white px-10 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md inline-block"
          >
            Apply as an NGO
          </Link>
        </div>
      </section>

      {/* Project Info Modal */}
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

      {/* Apply Modal */}
      {showApplyModal && selectedProject && (
        <ApplyProjectModal
          project={selectedProject}
          onClose={() => { setShowApplyModal(false); setSelectedProject(null); }}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* Donation Form */}
      {showDonationForm && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowDonationForm(false); setSelectedProject(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <DonationForm
              project={selectedProject}
              onComplete={() => { setShowDonationForm(false); setSelectedProject(null); fetchProjects(); }}
              onCancel={() => { setShowDonationForm(false); setSelectedProject(null); }}
            />
          </div>
        </div>
      )}
      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
