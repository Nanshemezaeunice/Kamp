import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Calendar, DollarSign, Users, TrendingUp, ExternalLink } from "lucide-react";
import { api } from "../config";

const SupporterMyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("kamp_token");

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      // Fetch applications where this supporter was accepted
      const appsRes = await fetch(api("/api/applications/my-applications"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (appsRes.ok) {
        const applications = await appsRes.json();
        // Filter only accepted applications with populated project data
        const acceptedProjects = applications
          .filter(app => app.status === "accepted" && app.projectId)
          .map(app => ({
            ...app.projectId,
            involvementType: app.involvementType,
            joinedAt: app.updatedAt
          }));
        setProjects(acceptedProjects);
      }
    } catch (error) {
      console.error("Error fetching my projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "pending":
      case "planned":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Projects</h1>
        <p className="text-gray-500">Projects you are officially involved in as a supporter</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-500 mb-4">
            You haven&apos;t been accepted into any projects yet.
          </p>
          <Link
            to="/supporter/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Available Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = project.goal > 0 
              ? Math.round((project.raised / project.goal) * 100) 
              : 0;

            return (
              <Link
                key={project._id}
                to={`/supporter/my-projects/${project._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                {project.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status || "Active"}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-600 uppercase">{project.involvementType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(project.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Raised</span>
                      <span className="font-bold text-gray-900">
                        ${(project.raised || 0).toLocaleString()} / ${(project.goal || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{progress}% funded</span>
                      <span>{project.donors || 0} donors</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupporterMyProjects;
