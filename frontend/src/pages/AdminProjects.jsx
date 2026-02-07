import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal";
import ConfirmationModal from "../components/ConfirmationModal";

const verifiedNGOs = [
  "Water4Life Uganda", "FeedKaramoja", "AgroAid Karamoja", 
  "SheFuture Foundation", "HealthReach Uganda", "SunlightEd", 
  "ActionAid Karamoja", "Skills4K", "Green Uganda"
];

const projectCategories = [
  "Health", "Education", "Water & Sanitation", "Agriculture", 
  "Gender & Development", "Energy", "Food & Nutrition", 
  "Environment", "Economic Development"
];

const AdminProjects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  useEffect(() => {
    fetchProjects();
  }, []);

  const openConfirmModal = (type, title, message, confirmText, onConfirm) => {
    setModalConfig({ type, title, message, confirmText, onConfirm });
    setConfirmModalOpen(true);
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3001/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Ongoing":
        return "bg-green-100 text-green-800";
      case "Pending":
      case "Planned":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteProject = async (projectId) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchProjects();
        if (selectedProject?._id === projectId) setSelectedProject(null);
        setConfirmModalOpen(false);
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateProject = async (newProjectData) => {
    try {
      const response = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProjectData),
      });
      if (response.ok) {
        fetchProjects();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Platform Projects</h1>
          <p className="text-gray-600">Overview and management of all active aid cycles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Project</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Projects</p>
          <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Active Funding</p>
          <p className="text-2xl font-bold text-gray-800">$1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
          <p className="text-2xl font-bold text-blue-600">8</p>
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by project name or NGO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-37.5"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-37.5"
        >
          <option>All Categories</option>
          {projectCategories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects
            .filter(project => {
              const matchesSearch = 
                (project.name?.toLowerCase().includes((searchTerm || "").toLowerCase())) ||
                (project.ngos?.some(ngo => typeof ngo === 'string' && ngo.toLowerCase().includes((searchTerm || "").toLowerCase())));
              
              const matchesStatus = statusFilter === "All Status" || project.status === statusFilter;
              const matchesCategory = categoryFilter === "All Categories" || project.categories?.includes(categoryFilter);
              
              return matchesSearch && matchesStatus && matchesCategory;
            })
            .map((project) => {
              const progress = Math.round((project.raised / project.goal) * 100);
              return (
                <div 
                  key={project._id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group"
                >
                  <Link 
                    to={`/admin/projects/${project._id}`} 
                    target="_blank"
                    className="relative h-48 block overflow-hidden"
                  >
                    <img
                      src={project.image || "https://images.unsplash.com/photo-1541544741938-0af808871cc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                          {project.categories?.join(", ")}
                        </span>
                        <span className="text-xs text-gray-400">ID: #{project._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <Link 
                        to={`/admin/projects/${project._id}`} 
                        target="_blank"
                        className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors block"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-600 font-medium">by {project.ngos?.join(", ")}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <p className="text-sm text-gray-600 font-medium">Funding Progress</p>
                          <p className="text-sm font-bold text-blue-600">{progress}%</p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-3 border-t border-b border-gray-50 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Raised</p>
                          <p className="font-bold text-gray-800">${project.raised.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs">Donors</p>
                          <p className="font-bold text-gray-800">{project.donors}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">Goal</p>
                          <p className="font-bold text-gray-800">${project.goal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Link 
                        to={`/admin/projects/${project._id}`}
                        target="_blank"
                        className="flex-1 px-4 py-2 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 text-sm font-semibold rounded-lg transition-all duration-200 text-center"
                      >
                        Management
                      </Link>
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => openConfirmModal(
                          "danger",
                          "Delete Project",
                          "Are you sure you want to delete this project? This action cannot be undone and all associated data will be lost.",
                          "Delete Permanently",
                          () => handleDeleteProject(project._id)
                        )}
                        className="px-3 py-2 bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 transition rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

    {/* View Details Modal */}
    {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              aria-hidden="true"
              onClick={() => setSelectedProject(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-fadeIn">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Image & Fast Stats */}
                <div className="relative h-64 md:h-full">
                  <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                    <span className={`self-start text-xs font-bold px-3 py-1 rounded-full mb-4 ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                    <h2 className="text-3xl font-bold mb-2">{selectedProject.name}</h2>
                    <p className="text-blue-200 font-medium">By {selectedProject.ngos?.join(", ")}</p>
                  </div>
                </div>

                {/* Right Side: Details */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                        {selectedProject.categories?.join(" • ")}
                      </span>
                      <h4 className="text-lg font-bold text-gray-800 mt-1">Project Overview</h4>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium mb-1">Total Goal</p>
                        <p className="text-xl font-bold text-gray-900">${selectedProject.goal.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-xs text-blue-500 font-medium mb-1">Amount Raised</p>
                        <p className="text-xl font-bold text-blue-700">${selectedProject.raised.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fundraising Progress</span>
                        <span className="font-bold text-gray-900">{Math.round((selectedProject.raised / selectedProject.goal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((selectedProject.raised / selectedProject.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{selectedProject.donors} Donors</span>
                        <span>$ {(selectedProject.goal - selectedProject.raised).toLocaleString()} remaining</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-800 mb-2">Description</h5>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProject.description}
                      </p>
                      {selectedProject.districts && (
                        <div className="mt-4">
                          <h6 className="text-xs font-bold text-gray-400 uppercase mb-2">Locations</h6>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.districts.map(d => (
                              <span key={d} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={() => window.open(`#/projects/${selectedProject._id}`, '_blank')}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                    >
                      View Public Page
                    </button>
                    <button 
                      onClick={() => openConfirmModal(
                        "danger",
                        "Archive Project",
                        "Are you sure you want to delete this project? This action cannot be undone.",
                        "Delete Project",
                        () => handleDeleteProject(selectedProject._id)
                      )}
                      className="px-6 py-3 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl transition font-bold text-gray-600"
                    >
                      Archive Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        verifiedNGOs={verifiedNGOs}
        projectCategories={projectCategories}
      />

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default AdminProjects;
