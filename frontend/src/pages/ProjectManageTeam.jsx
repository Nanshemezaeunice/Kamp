import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Crown, UserCheck, Calendar, Building2, Heart, Mail } from "lucide-react";
import { api } from "../config";

const ProjectManageTeam = () => {
  const { project } = useOutletContext();
  const [team, setTeam] = useState({ creator: null, partners: [] });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("kamp_token");

  useEffect(() => {
    if (project?._id) fetchTeam();
  }, [project?._id]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/team`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTeam(await res.json());
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const allMembers = [
    ...(team.creator ? [{ ...team.creator, role: "Creator" }] : []),
    ...team.partners.map(p => ({ ...p, role: "Partner" }))
  ];

  const orgMembers = allMembers.filter(m => m.accountType === "organization");
  const individualMembers = allMembers.filter(m => m.accountType === "individual");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Team</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{allMembers.length}</p>
          <p className="text-xs text-slate-500 mt-1">people involved</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organisations</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{orgMembers.length}</p>
          <p className="text-xs text-slate-500 mt-1">organisation partners</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advocates</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{individualMembers.length}</p>
          <p className="text-xs text-slate-500 mt-1">individual advocates</p>
        </div>
      </div>

      {/* Project Creator */}
      {team.creator && (
        <div>
          <h3 className="font-bold text-slate-900 mb-3">Project Creator</h3>
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                {(team.creator.name || team.creator.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{team.creator.name || "Unnamed"}</h4>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    <Crown className="w-3 h-3" /> Creator
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {team.creator.accountType === "organization" ? "Organisation" : "Advocate"}
                  </span>
                </div>
                {team.creator.email && (
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5" /> {team.creator.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partners */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Partners ({team.partners.length})</h3>
        {team.partners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No partners yet.</p>
            <p className="text-xs text-slate-400 mt-1">When organisations or advocates join this project, they'll appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.partners.map((partner, index) => (
              <div key={partner._id || index} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                    partner.accountType === "organization" ? "bg-purple-500" : "bg-green-500"
                  }`}>
                    {(partner.name || partner.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 truncate">{partner.name || "Unnamed"}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        partner.accountType === "organization" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {partner.accountType === "organization" ? "Organisation" : "Advocate"}
                      </span>
                    </div>

                    {partner.email && (
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                        <Mail className="w-3.5 h-3.5" /> {partner.email}
                      </div>
                    )}

                    {partner.involvementType && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {partner.involvementType}
                      </span>
                    )}

                    {partner.joinedAt && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(partner.joinedAt).toLocaleDateString()}
                      </div>
                    )}

                    {partner.contribution && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        "{partner.contribution}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManageTeam;
