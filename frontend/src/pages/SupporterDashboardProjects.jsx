import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SupporterDashboardProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <p className="text-gray-500 mt-1">
          Browse humanitarian projects and find causes to support.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Yet</h3>
          <p className="text-gray-500">
            There are no projects on the platform yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link
              key={p._id}
              to={`/projects/${p._id}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group"
            >
              {p.image && (
                <img src={p.image} alt={p.name || p.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                    {p.status || "Active"}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition">
                  {p.name || p.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {p.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Budget: <span className="font-medium text-gray-700">${(p.budget || 0).toLocaleString()}</span>
                  </span>
                  <span className="text-gray-500">
                    Raised: <span className="font-medium text-green-600">${(p.raised || 0).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupporterDashboardProjects;
