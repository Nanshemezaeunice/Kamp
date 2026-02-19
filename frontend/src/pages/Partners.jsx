// Public listing of all verified organisations and individual advocates on the platform.
// Visitors can see who's doing what without being logged in.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../config";

const Partners = () => {
  const [organisations, setOrganisations] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("organisations");
  const [expandedPartner, setExpandedPartner] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch(api("/api/stats/partners"));
        if (res.ok) {
          const data = await res.json();
          setOrganisations(data.organisations || []);
          setAdvocates(data.advocates || []);
        }
      } catch (err) {
        console.error("Error fetching partners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const statusBadge = (status) => {
    const config = {
      Planning: "bg-purple-100 text-purple-700",
      Planned: "bg-blue-100 text-blue-700",
      Ongoing: "bg-green-100 text-green-700",
      Completed: "bg-slate-100 text-slate-600",
    };
    return (
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const PartnerCard = ({ partner, type }) => {
    const isExpanded = expandedPartner === partner._id;
    
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div 
          className="p-6 cursor-pointer"
          onClick={() => setExpandedPartner(isExpanded ? null : partner._id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white ${
                type === "org" ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-blue-500 to-blue-700"
              }`}>
                {partner.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{partner.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {type === "org" ? (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {partner.organisationType}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        {partner.category}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {partner.interest}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{partner.projectCount}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</p>
              </div>
              <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {(partner.description || partner.bio) && (
            <p className="text-sm text-slate-500 mt-3 line-clamp-2">
              {partner.description || partner.bio}
            </p>
          )}
          
          {(partner.address || partner.location) && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span>📍</span> {partner.address || partner.location}
            </p>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50 p-6 space-y-6 animate-fadeIn">
            {/* Projects */}
            {partner.projects?.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                  Projects ({partner.projects.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {partner.projects.map((project) => {
                    const progress = project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0;
                    return (
                      <Link 
                        key={project._id}
                        to={`/projects/${project._id}`}
                        className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {project.name}
                          </h5>
                          {statusBadge(project.status)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {project.categories?.slice(0, 2).map((cat, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-400">${project.raised?.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-blue-600">{progress}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Achievements */}
            {partner.achievements?.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                  Achievements
                </h4>
                <div className="space-y-2">
                  {partner.achievements.map((ach, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 flex items-start gap-3">
                      <span className="text-lg">🏆</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{ach.title}</p>
                        {ach.description && <p className="text-xs text-slate-500 mt-0.5">{ach.description}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          {ach.metric && ach.value && (
                            <span className="text-[10px] font-bold text-emerald-600">{ach.value} {ach.metric}</span>
                          )}
                          <span className="text-[10px] text-slate-400">via {ach.projectName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {partner.website && (
              <a 
                href={partner.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                🌐 Visit Website
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const currentList = activeTab === "organisations" ? organisations : advocates;

  return (
    <div>
      {/* Header */}
      <section 
        className="relative bg-cover bg-center text-white py-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=500&fit=crop')`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Partners</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Meet the organisations and advocates working with KAMP to bring lasting change to Karamoja.
            Explore their projects, achievements, and impact.
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900">{organisations.length}</p>
              <p className="text-sm text-slate-500 font-medium">Organisations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900">{advocates.length}</p>
              <p className="text-sm text-slate-500 font-medium">Advocates</p>
            </div>
           
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900">
                {organisations.reduce((sum, o) => sum + (o.achievements?.length || 0), 0) + advocates.reduce((sum, a) => sum + (a.achievements?.length || 0), 0)}
              </p>
              <p className="text-sm text-slate-500 font-medium">Achievements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white sticky top-16 z-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("organisations")}
              className={`py-4 border-b-2 font-bold text-sm uppercase tracking-widest transition-all ${
                activeTab === "organisations"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Organisations ({organisations.length})
            </button>
            <button
              onClick={() => setActiveTab("advocates")}
              className={`py-4 border-b-2 font-bold text-sm uppercase tracking-widest transition-all ${
                activeTab === "advocates"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Advocates ({advocates.length})
            </button>
          </div>
        </div>
      </section>

      {/* Partners List */}
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-slate-600">
                No {activeTab} registered yet.
              </p>
              <p className="text-slate-400 mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentList.map((partner) => (
                <PartnerCard 
                  key={partner._id} 
                  partner={partner} 
                  type={activeTab === "organisations" ? "org" : "adv"} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Become a Partner
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Join KAMP as an organisation or advocate to make a lasting difference in Karamoja.
            Manage funds, monitor progress, and create real impact.
          </p>
          <Link
            to="/get-started"
            className="bg-blue-600 text-white px-10 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Partners;
