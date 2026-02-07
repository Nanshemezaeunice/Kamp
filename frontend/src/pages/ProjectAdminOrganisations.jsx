import { useOutletContext } from "react-router-dom";
import { Building2, ShieldCheck, Mail, Globe, Plus } from "lucide-react";

const ProjectAdminOrganisations = () => {
  const { project } = useOutletContext();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Partner Organisations</h2>
          <p className="text-sm text-slate-500 font-medium">Verified partners leading this aid cycle</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.ngos?.map((ngo, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{ngo}</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Lead Humanitarian Implementation Partner</p>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-medium text-slate-600 italic">contact@{ngo.toLowerCase().replace(/\s/g, '')}.org</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium text-slate-600">www.{ngo.toLowerCase().replace(/\s/g, '')}.org</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors">
                Profile
              </button>
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 border border-red-50 rounded-lg transition-colors">
                Remove
              </button>
            </div>
          </div>
        ))}

        {(!project.ngos || project.ngos.length === 0) && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
            <Building2 className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No partners assigned</p>
            <p className="text-sm text-slate-400 max-w-xs px-6">This project does not yet have any official humanitarian partners assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAdminOrganisations;
