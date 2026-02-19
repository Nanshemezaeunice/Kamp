// Milestone and achievement tracker for a project.
// Milestones are planned checkpoints; achievements are real outcomes actually delivered.
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Target, Plus, Check, Clock, ChevronRight, 
  Trash2, Edit3, X, Trophy, Star, Calendar,
  CheckCircle, AlertCircle
} from "lucide-react";
import { api } from "../config";

const ProjectManageMilestones = () => {
  const { project, setProject } = useOutletContext();
  const [milestones, setMilestones] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("milestones");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [editingMs, setEditingMs] = useState(null);
  const [msForm, setMsForm] = useState({
    title: "", description: "", targetDate: "", status: "not-started", progress: 0
  });
  const [achForm, setAchForm] = useState({
    title: "", description: "", metric: "", value: "", date: new Date().toISOString().split("T")[0]
  });
  const token = localStorage.getItem("kamp_token");

  useEffect(() => {
    if (project?._id) fetchData();
  }, [project?._id]);

  const fetchData = async () => {
    try {
      const [msRes, achRes] = await Promise.all([
        fetch(api(`/api/project-manage/${project._id}/milestones`), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(api(`/api/project-manage/${project._id}/achievements`), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (msRes.ok) setMilestones(await msRes.json());
      if (achRes.ok) setAchievements(await achRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Milestones ───
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/milestones`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(msForm)
      });
      if (res.ok) {
        setMilestones(await res.json());
        setShowAddMilestone(false);
        setMsForm({ title: "", description: "", targetDate: "", status: "not-started", progress: 0 });
      }
    } catch (err) {
      console.error("Error adding milestone:", err);
    }
  };

  const handleUpdateMilestone = async (msId, data) => {
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/milestones/${msId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setMilestones(await res.json());
        setEditingMs(null);
      }
    } catch (err) {
      console.error("Error updating milestone:", err);
    }
  };

  const handleDeleteMilestone = async (msId) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/milestones/${msId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setMilestones(await res.json());
    } catch (err) {
      console.error("Error deleting milestone:", err);
    }
  };

  // ─── Achievements ───
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/achievements`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...achForm, value: achForm.value ? Number(achForm.value) : undefined })
      });
      if (res.ok) {
        setAchievements(await res.json());
        setShowAddAchievement(false);
        setAchForm({ title: "", description: "", metric: "", value: "", date: new Date().toISOString().split("T")[0] });
      }
    } catch (err) {
      console.error("Error adding achievement:", err);
    }
  };

  const handleDeleteAchievement = async (achId) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/achievements/${achId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAchievements(await res.json());
    } catch (err) {
      console.error("Error deleting achievement:", err);
    }
  };

  const statusConfig = {
    "not-started": { label: "Not Started", color: "bg-slate-100 text-slate-600", icon: Clock },
    "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: ChevronRight },
    "completed": { label: "Completed", color: "bg-green-100 text-green-700", icon: Check }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const completedCount = milestones.filter(m => m.status === "completed").length;
  const overallProgress = milestones.length > 0 
    ? Math.round(milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / milestones.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestones</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{milestones.length}</p>
          <p className="text-xs text-slate-500 mt-1">{completedCount} completed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{overallProgress}%</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Achievements</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{achievements.length}</p>
          <p className="text-xs text-slate-500 mt-1">Impact recorded</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        <button onClick={() => setActiveTab("milestones")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "milestones" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          Milestones ({milestones.length})
        </button>
        <button onClick={() => setActiveTab("achievements")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "achievements" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          Achievements ({achievements.length})
        </button>
      </div>

      {/* Milestones Tab */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Project Milestones</h3>
            <button onClick={() => { setShowAddMilestone(true); setEditingMs(null); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </div>

          {/* Add / Edit Form */}
          {showAddMilestone && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-blue-900">New Milestone</h4>
                <button onClick={() => setShowAddMilestone(false)} className="text-blue-400 hover:text-blue-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Title *</label>
                  <input type="text" required value={msForm.title}
                    onChange={(e) => setMsForm({ ...msForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    placeholder="e.g. Complete community survey" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Description</label>
                  <textarea value={msForm.description} rows={2}
                    onChange={(e) => setMsForm({ ...msForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white resize-none"
                    placeholder="What needs to be accomplished..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-800 mb-1">Target Date</label>
                    <input type="date" value={msForm.targetDate}
                      onChange={(e) => setMsForm({ ...msForm, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-800 mb-1">Initial Status</label>
                    <select value={msForm.status}
                      onChange={(e) => setMsForm({ ...msForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddMilestone(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                    Add Milestone
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Milestones List */}
          {milestones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No milestones defined yet.</p>
              <p className="text-xs text-slate-400 mt-1">Add milestones to track project progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((ms, index) => {
                const config = statusConfig[ms.status] || statusConfig["not-started"];
                const StatusIcon = config.icon;
                const isEditing = editingMs === ms._id;
                const isOverdue = ms.targetDate && new Date(ms.targetDate) < new Date() && ms.status !== "completed";

                return (
                  <div key={ms._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            ms.status === "completed" ? "bg-green-100" : ms.status === "in-progress" ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            <StatusIcon className={`w-5 h-5 ${
                              ms.status === "completed" ? "text-green-600" : ms.status === "in-progress" ? "text-blue-600" : "text-slate-400"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold text-slate-900 ${ms.status === "completed" ? "line-through text-slate-400" : ""}`}>
                                {ms.title}
                              </h4>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${config.color}`}>
                                {config.label}
                              </span>
                              {isOverdue && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Overdue
                                </span>
                              )}
                            </div>
                            {ms.description && (
                              <p className="text-sm text-slate-500 mb-2">{ms.description}</p>
                            )}
                            {ms.targetDate && (
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                Target: {new Date(ms.targetDate).toLocaleDateString()}
                                {ms.completedDate && (
                                  <span className="ml-2 text-green-600">
                                    Completed: {new Date(ms.completedDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Progress</span>
                                <span className="text-xs font-bold text-slate-700">{ms.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className={`h-2 rounded-full transition-all ${
                                  ms.status === "completed" ? "bg-green-500" : "bg-blue-500"
                                }`} style={{ width: `${ms.progress || 0}%` }} />
                              </div>
                            </div>

                            {/* Inline Progress Editor */}
                            {isEditing && (
                              <div className="mt-3 flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                                <label className="text-xs font-bold text-slate-600">Progress:</label>
                                <input type="range" min="0" max="100" step="5"
                                  defaultValue={ms.progress || 0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    handleUpdateMilestone(ms._id, { 
                                      progress: val,
                                      status: val === 100 ? "completed" : val > 0 ? "in-progress" : "not-started"
                                    });
                                  }}
                                  className="flex-1" />
                                <select defaultValue={ms.status}
                                  onChange={(e) => handleUpdateMilestone(ms._id, { status: e.target.value })}
                                  className="px-2 py-1 border border-slate-200 rounded text-xs bg-white">
                                  <option value="not-started">Not Started</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                                <button onClick={() => setEditingMs(null)} 
                                  className="text-xs text-slate-500 hover:text-slate-700">Done</button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditingMs(isEditing ? null : ms._id)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {ms.status !== "completed" && (
                            <button onClick={() => handleUpdateMilestone(ms._id, { status: "completed", progress: 100 })}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition" title="Mark Complete">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteMilestone(ms._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Impact & Achievements</h3>
            <button onClick={() => setShowAddAchievement(true)}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition">
              <Plus className="w-4 h-4" /> Record Achievement
            </button>
          </div>

          {/* Add Achievement Form */}
          {showAddAchievement && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-amber-900">New Achievement</h4>
                <button onClick={() => setShowAddAchievement(false)} className="text-amber-400 hover:text-amber-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddAchievement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">Title *</label>
                  <input type="text" required value={achForm.title}
                    onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    placeholder="e.g. Distributed 500 water filters" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">Description</label>
                  <textarea value={achForm.description} rows={2}
                    onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white resize-none"
                    placeholder="Details about this achievement..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Metric</label>
                    <input type="text" value={achForm.metric}
                      onChange={(e) => setAchForm({ ...achForm, metric: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      placeholder="e.g. People reached" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Value</label>
                    <input type="number" value={achForm.value}
                      onChange={(e) => setAchForm({ ...achForm, value: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      placeholder="500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Date</label>
                    <input type="date" value={achForm.date}
                      onChange={(e) => setAchForm({ ...achForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddAchievement(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit"
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition">
                    Record Achievement
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Achievements List */}
          {achievements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No achievements recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">Record your project's impact and milestones</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(ach => (
                <div key={ach._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">{ach.title}</h4>
                        {ach.description && (
                          <p className="text-sm text-slate-500 mb-2">{ach.description}</p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {ach.metric && ach.value && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                              <span className="text-lg font-black text-amber-700">{ach.value.toLocaleString()}</span>
                              <span className="text-xs text-amber-600 ml-1">{ach.metric}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(ach.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAchievement(ach._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManageMilestones;
