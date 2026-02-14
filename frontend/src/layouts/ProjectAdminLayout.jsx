import { useState, useEffect } from "react";
import { useParams, NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ArrowLeft, ExternalLink, Settings, Building2, Heart } from "lucide-react";
import { api } from "../config";

const ProjectAdminLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ organisations: 0, supporters: 0 });

  useEffect(() => {
    const fetchProjectAndCounts = async () => {
      try {
        const [projRes, countsRes] = await Promise.all([
          fetch(api(`/api/projects/${id}`)),
          fetch(api(`/api/applications/project/${id}/unresponded-counts`))
        ]);

        if (!projRes.ok) throw new Error("Project not found");
        const projectData = await projRes.json();
        setProject(projectData);

        if (countsRes.ok) {
          const countsData = await countsRes.json();
          setCounts(countsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndCounts();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Project not found</h1>
      <button 
        onClick={() => window.close()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
      >
        Close Tab
      </button>
    </div>
  );

  const navItems = [
    { 
      label: "Overview", 
      path: `/admin/projects/${id}/overview`, 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      label: "Organisations", 
      path: `/admin/projects/${id}/organisations`, 
      icon: <Building2 className="w-4 h-4" />,
      count: counts.organisations
    },
    { 
      label: "Supporters", 
      path: `/admin/projects/${id}/supporters`, 
      icon: <Heart className="w-4 h-4" />,
      count: counts.supporters
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/admin/projects"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to all projects"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 truncate max-w-50 sm:max-w-md">
                  {project.name}
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">
                  Project Management Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/projects/${id}`}
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live View
              </Link>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 -mb-px">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-all
                  ${isActive 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"}
                `}
              >
                {item.icon}
                {item.label}
                {item.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    window.location.pathname.includes(item.path)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.count}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ 
          project, 
          setProject, 
          refreshCounts: () => {
            fetch(api(`/api/applications/project/${id}/unresponded-counts`))
              .then(res => res.json())
              .then(data => setCounts(data));
          } 
        }} />
      </main>
    </div>
  );
};

export default ProjectAdminLayout;
