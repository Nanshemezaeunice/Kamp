import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DonationForm from "../components/DonationForm";
import NGOApplicationModal from "../components/NGOApplicationModal";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDonating, setIsDonating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastDonationAmount, setLastDonationAmount] = useState(0);

  useEffect(() => {
    const fetchProjectAndDonations = async () => {
      try {
        const [projRes, donRes] = await Promise.all([
          fetch(`http://localhost:3001/api/projects/${id}`),
          fetch(`http://localhost:3001/api/donations/project/${id}`)
        ]);

        if (!projRes.ok) {
          throw new Error("Project not found");
        }

        const projData = await projRes.json();
        setProject(projData);

        if (donRes.ok) {
          const donData = await donRes.json();
          setDonations(donData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndDonations();
  }, [id]);

  const handleDonationComplete = (amount) => {
    // Refresh project data and donations
    const refreshData = async () => {
      try {
        const [projRes, donRes] = await Promise.all([
          fetch(`http://localhost:3001/api/projects/${id}`),
          fetch(`http://localhost:3001/api/donations/project/${id}`)
        ]);
        const projData = await projRes.json();
        const donData = await donRes.json();
        setProject(projData);
        setDonations(donData);
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
    };
    refreshData();
    setLastDonationAmount(amount);
    setIsDonating(false);
    setShowThankYou(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-8">The project you are looking for does not exist or has been removed.</p>
        <Link to="/projects" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
          Back to Projects
        </Link>
      </div>
    );
  }

  const progress = project.goal > 0 
    ? Math.round((project.raised / project.goal) * 100)
    : 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Dynamic Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <img 
          src={project.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&h=900&fit=crop"} 
          alt={project.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 pb-12">
          <button 
            onClick={() => navigate("/projects")}
            className="w-fit mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-black uppercase tracking-widest">Back to Projects</span>
          </button>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.categories?.map((cat, idx) => (
              <span key={idx} className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">
            {project.name}
          </h1>
          <p className="text-blue-100 text-lg font-bold">Led by {project.ngos?.join(", ")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
              {isDonating ? (
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <button 
                      onClick={() => setIsDonating(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Process Donation</h2>
                  </div>
                  <DonationForm 
                    project={project} 
                    onComplete={handleDonationComplete}
                    onCancel={() => setIsDonating(false)}
                  />
                </div>
              ) : (
                <div className="space-y-10">
                  <section>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Project Overview</label>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                      {project.description}
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                    <section>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Target Regions</label>
                      <div className="flex flex-wrap gap-2">
                        {project.districts?.map(d => (
                          <span key={d} className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider">
                            📍 {d}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Beneficiaries</label>
                      <div className="flex flex-wrap gap-2">
                        {project.targetAudience?.map(t => (
                          <span key={t} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-wider">
                            {t === 'Men' ? '🧔' : t === 'Women' ? '👩' : t === 'Kids' ? '🧒' : t === 'Elderly' ? '👵' : '🌍'} {t}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  {project.milestones && (
                    <section className="pt-8 border-t border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Deployment Path</label>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600">
                        {project.milestones}
                      </div>
                    </section>
                  )}

                  {/* Donations Feed */}
                  <section className="pt-8 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Supporters</label>
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {project.donors || 0} Supporters
                      </span>
                    </div>
                    <div className="space-y-4">
                      {donations.length === 0 ? (
                        <p className="text-slate-400 text-sm italic">No donations yet. Be the first to support!</p>
                      ) : (
                        donations.map((donation) => (
                          <div key={donation._id} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-black">
                              {donation.name?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{donation.name}</h4>
                              </div>
                              {donation.message && (
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                  {donation.message}
                                </p>
                              )}
                              {!donation.message && (
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Sent a contribution</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Impact Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Progress</p>
                    <p className="text-3xl font-black text-blue-600 leading-none">{progress}%</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 p-1 border border-slate-200 shadow-inner">
                    <div 
                      className="bg-linear-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400 uppercase tracking-tighter">Raised</span>
                      <span className="text-slate-900 text-lg">${project.raised?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400 uppercase tracking-tighter">Goal</span>
                      <span className="text-slate-500">${project.goal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400 uppercase tracking-tighter">Direct Donors</span>
                      <span className="text-slate-900">{project.donors || 0}</span>
                    </div>
                  </div>
                </div>

                {project.isOpenForDonations ? (
                  !isDonating && (
                    <button 
                      onClick={() => setIsDonating(true)}
                      className="w-full bg-linear-to-r from-blue-600 to-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] py-6 px-8 rounded-2xl hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                      <span className="flex items-center gap-2">
                        Authorize Donation 
                        <span className="bg-white/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          {project.donors || 0}
                        </span>
                      </span>
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                  )
                ) : (
                  <div className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-bold text-slate-600">This project is not currently accepting public donations.</p>
                  </div>
                )}

                {project.isOpenForOrganizations && (
                  <div className="pt-4">
                    <button 
                      onClick={() => setIsApplying(true)}
                      className="w-full py-4 rounded-2xl border-2 border-blue-600 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-colors"
                    >
                      Interested NGO? Get Involved
                    </button>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">🛡️</div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">KAMP Verified</p>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Anti-Corruption Standard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowThankYou(false)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-scaleIn border border-white">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
            
            <div className="p-10 md:p-14 text-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <span className="text-5xl animate-bounce">💖</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none">
                Impact Received
              </h3>
              
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
                Your contribution of <span className="text-blue-600 font-black">${lastDonationAmount?.toLocaleString()}</span> has been securely processed. You are now a vital part of the <span className="text-slate-900 font-bold">{project.name}</span> mission.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowThankYou(false)}
                  className="w-full bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] py-5 px-8 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                >
                  Continue Browsing
                </button>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Verified by KAMP Accountability Engine
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* NGO Application Modal */}
      <NGOApplicationModal
        isOpen={isApplying}
        onClose={() => setIsApplying(false)}
        projectId={id}
        projectTitle={project.title}
      />
    </div>
  );
};

export default ProjectDetails;
