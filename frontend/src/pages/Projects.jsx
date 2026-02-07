import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DonationForm from "../components/DonationForm";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        const publicProjects = data.filter((project) => project.isPublic);
        setProjects(publicProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Browse ongoing projects in Karamoja. Donate directly or apply as an
            NGO to get involved and help manage project resources.
          </p>
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
                
                return (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col cursor-pointer group"
                  >
                    <div className="relative h-48">
                      <img 
                        src={project.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&h=300&fit=crop"}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {project.categories && project.categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="text-[10px] font-bold uppercase text-white bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded">
                            {cat}
                          </span>
                        ))}
                        {!project.isOpenForDonations && (
                          <span className="text-[10px] font-bold uppercase text-white bg-slate-600/80 backdrop-blur-sm px-2 py-1 rounded">
                            Direct Funding Closed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="mt-auto">
                        <p className="text-xs text-gray-500 mb-4 flex items-center">
                          <span className="mr-1">By</span>
                          <span className="font-semibold text-gray-700 truncate">
                            {project.ngos && project.ngos.length > 0 ? project.ngos.join(", ") : "Unknown NGO"}
                          </span>
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">
                              ${project.raised?.toLocaleString()} raised
                            </span>
                            <span className="text-gray-500">
                              ${project.goal?.toLocaleString()} goal
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-xs font-bold text-blue-600">{progress}%</span>
                          </div>
                        </div>

                        <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                          <span>{project.isOpenForDonations ? "Donate" : "View Details"}</span>
                          {project.isOpenForDonations && (
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                              {project.donors || 0}
                            </span>
                          )}
                        </button>
                      </div>
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
    </div>
  );
};

export default Projects;
