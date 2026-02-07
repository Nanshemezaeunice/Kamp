import { useState, useEffect } from "react";
import { Building2, Mail, Phone, Clock, CheckCircle, XCircle, ExternalLink, Filter } from "lucide-react";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/applications");
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredApplications = filter === "all" 
    ? applications 
    : applications.filter(app => app.status === filter);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">NGO Partnerships</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Manage collaboration inquiries</p>
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          {["all", "pending", "reviewed", "accepted"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-all ${
                filter === status 
                  ? "bg-amber-600 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map((app) => (
            <div key={app._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">{app.organizationName}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{app.involvementType}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  app.status === "pending" ? "bg-amber-100 text-amber-700" :
                  app.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {app.status}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Project</p>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="font-bold text-sm">{app.projectId?.title || "Deleted Project"}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-sm italic text-slate-600">"{app.message}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Representative</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {app.representativeName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Contact Info</p>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                       {app.email} <Mail className="w-3 h-3" />
                    </p>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                       {app.phone} <Phone className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleStatusUpdate(app._id, "accepted")}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                >
                  Approve Partnership
                </button>
                <button 
                  onClick={() => handleStatusUpdate(app._id, "reviewed")}
                  className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredApplications.length === 0 && !loading && (
        <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-black text-slate-400 uppercase tracking-widest">No applications found</p>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
