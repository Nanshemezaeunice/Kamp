import { useState, useEffect } from "react";
import { useParams, Outlet, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
import { api } from "../config";

const UserProjectLayout = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("kamp_user") || "{}");
    setUserType(user.type);
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(api(`/api/projects/${id}`));
      if (!response.ok) throw new Error("Project not found");
      const data = await response.json();
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Project not found</h1>
        <button 
          onClick={() => window.close()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Close Tab
        </button>
      </div>
    );
  }

  const backUrl = userType === "Organization" 
    ? "/organization/my-projects" 
    : "/supporter/my-projects";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                to={backUrl}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to my projects"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 truncate max-w-md">
                  {project.name}
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">
                  Project Details
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === "Active" 
                  ? "bg-green-100 text-green-700"
                  : project.status === "Completed"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {project.status || "Active"}
              </span>
              <Link
                to={`/projects/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Public View
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ project, setProject }} />
      </main>
    </div>
  );
};

export default UserProjectLayout;
