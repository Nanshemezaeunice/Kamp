import { useOutletContext } from "react-router-dom";
import { TrendingUp, Users, Target, Calendar, Info, MapPin } from "lucide-react";

const ProjectAdminOverview = () => {
  const { project } = useOutletContext();

  const progress = Math.round((project.raised / project.goal) * 100);

  const stats = [
    { label: "Total Raised", value: `$${project.raised.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
    { label: "Funding Goal", value: `$${project.goal.toLocaleString()}`, icon: <Target className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
    { label: "Direct Donors", value: project.donors, icon: <Users className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
    { label: "Impact Score", value: "8.4/10", icon: <Info className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Funding Progress Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Funding Progress</h3>
                <p className="text-sm text-slate-500 font-medium">Real-time performance of this aid cycle</p>
              </div>
              <p className="text-3xl font-black text-blue-600">{progress}%</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Current: ${project.raised.toLocaleString()}</span>
              <span>Goal: ${project.goal.toLocaleString()}</span>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Project Narrative
            </h3>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p className="mb-4">{project.description}</p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Location</p>
                  <p className="text-sm font-bold text-slate-700">Karamoja Sub-region, Uganda</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Project Status</h4>
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="text-sm font-bold text-blue-800">{project.status}</span>
            </div>
            <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
              Update Status
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Configuration</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Public Donations</span>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">NGO Partnerships</span>
                <span className={project.isOpenForOrganizations ? "bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase" : "bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase"}>
                  {project.isOpenForOrganizations ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAdminOverview;
