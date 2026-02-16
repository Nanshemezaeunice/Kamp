import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, 
  Plus, Check, Flag, Trash2, AlertTriangle, X,
  ChevronDown, ChevronUp, Receipt, Calendar
} from "lucide-react";
import { api } from "../config";

const CATEGORIES = [
  'Personnel', 'Equipment', 'Supplies', 'Transport', 
  'Construction', 'Training', 'Administration', 
  'Communication', 'Monitoring', 'Other'
];

const ProjectManageFinances = () => {
  const { project } = useOutletContext();
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const [expForm, setExpForm] = useState({
    title: "", description: "", category: "Personnel", 
    amount: "", date: new Date().toISOString().split("T")[0], vendor: "", notes: ""
  });
  const [budgetRows, setBudgetRows] = useState([]);
  const token = localStorage.getItem("kamp_token");
  const user = JSON.parse(localStorage.getItem("kamp_user") || "null");

  useEffect(() => {
    if (project?._id) fetchFinances();
  }, [project?._id]);

  const fetchFinances = async () => {
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/finances`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFinances(data);
        setBudgetRows(data.summary.budgetAllocations.length > 0 
          ? data.summary.budgetAllocations 
          : [{ category: "", allocated: "", description: "" }]
        );
      }
    } catch (err) {
      console.error("Error fetching finances:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(api(`/api/project-manage/${project._id}/expenditures`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...expForm, amount: Number(expForm.amount) })
      });
      if (res.ok) {
        setShowAddExpense(false);
        setExpForm({ title: "", description: "", category: "Personnel", amount: "", date: new Date().toISOString().split("T")[0], vendor: "", notes: "" });
        fetchFinances();
      }
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleApproveExpense = async (expId) => {
    try {
      await fetch(api(`/api/project-manage/${project._id}/expenditures/${expId}/approve`), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFinances();
    } catch (err) {
      console.error("Error approving expense:", err);
    }
  };

  const handleFlagExpense = async (expId) => {
    const notes = prompt("Enter a reason for flagging this expenditure:");
    if (!notes) return;
    try {
      await fetch(api(`/api/project-manage/${project._id}/expenditures/${expId}/flag`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes })
      });
      fetchFinances();
    } catch (err) {
      console.error("Error flagging expense:", err);
    }
  };

  const handleDeleteExpense = async (expId) => {
    if (!confirm("Delete this expenditure? This cannot be undone.")) return;
    try {
      await fetch(api(`/api/project-manage/${project._id}/expenditures/${expId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFinances();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleSaveBudget = async () => {
    const allocations = budgetRows.filter(r => r.category && r.allocated);
    try {
      await fetch(api(`/api/project-manage/${project._id}/budget`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ allocations })
      });
      setShowBudgetEditor(false);
      fetchFinances();
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  };

  const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!finances) return <p className="text-gray-500 text-center py-10">Unable to load financial data.</p>;

  const { summary, spendingByCategory, donationByCause, donations, expenditures } = finances;
  const isCreatorOrAdmin = user?.type === "Admin" || project.creatorId?._id === user?.id || project.creatorId === user?.id;
  const progress = summary.goal > 0 ? Math.round((summary.totalDonated / summary.goal) * 100) : 0;
  const spentPercent = summary.totalDonated > 0 ? Math.round((summary.totalSpent / summary.totalDonated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Raised</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{fmt(summary.totalDonated)}</p>
          <p className="text-xs text-slate-500 mt-1">{progress}% of {fmt(summary.goal)} goal</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{fmt(summary.totalSpent)}</p>
          <p className="text-xs text-slate-500 mt-1">{spentPercent}% of raised funds</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
          </div>
          <p className={`text-2xl font-black ${summary.balance >= 0 ? "text-slate-900" : "text-red-600"}`}>
            {fmt(summary.balance)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Available funds</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donors</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.donorCount}</p>
          <p className="text-xs text-slate-500 mt-1">Total contributions</p>
        </div>
      </div>

      {/* Funding Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">Funding Progress</h3>
          <span className="text-sm font-semibold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div className="h-full rounded-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{fmt(summary.totalDonated)} raised</span>
          <span>{fmt(summary.goal)} goal</span>
        </div>

        {/* Spent overlay */}
        {summary.totalSpent > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500">Spent vs Raised</span>
              <span className="text-xs font-semibold text-red-500">{spentPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-red-400 transition-all" 
                style={{ width: `${Math.min(spentPercent, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: "overview", label: "Budget Overview" },
          { id: "expenditures", label: `Expenditures (${expenditures.length})` },
          { id: "donations", label: `Donations (${donations.length})` }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeView === tab.id 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Budget Overview Tab */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Budget Allocations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Budget Allocations</h3>
              {isCreatorOrAdmin && (
                <button onClick={() => setShowBudgetEditor(!showBudgetEditor)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                  {showBudgetEditor ? "Cancel" : "Edit Budget"}
                </button>
              )}
            </div>

            {showBudgetEditor ? (
              <div className="space-y-3">
                {budgetRows.map((row, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input type="text" placeholder="Category" value={row.category}
                      onChange={(e) => {
                        const updated = [...budgetRows];
                        updated[i].category = e.target.value;
                        setBudgetRows(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <input type="number" placeholder="Amount" value={row.allocated}
                      onChange={(e) => {
                        const updated = [...budgetRows];
                        updated[i].allocated = e.target.value;
                        setBudgetRows(updated);
                      }}
                      className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button onClick={() => setBudgetRows(budgetRows.filter((_, j) => j !== i))}
                      className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-3">
                  <button onClick={() => setBudgetRows([...budgetRows, { category: "", allocated: "", description: "" }])}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-700">+ Add Row</button>
                  <button onClick={handleSaveBudget}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                    Save Budget
                  </button>
                </div>
              </div>
            ) : summary.budgetAllocations.length > 0 ? (
              <div className="space-y-3">
                {summary.budgetAllocations.map((alloc, i) => {
                  const catSpent = (spendingByCategory[alloc.category] || 0);
                  const catPercent = alloc.allocated > 0 ? Math.round((catSpent / alloc.allocated) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-700">{alloc.category}</span>
                        <span className="text-xs text-slate-500">
                          {fmt(catSpent)} / {fmt(alloc.allocated)} ({catPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${catPercent > 100 ? "bg-red-500" : catPercent > 80 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(catPercent, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4">
                No budget allocations set yet. {isCreatorOrAdmin && "Click 'Edit Budget' to define them."}
              </p>
            )}
          </div>

          {/* Spending by Category */}
          {Object.keys(spendingByCategory).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {Object.entries(spendingByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-700">{cat}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{fmt(amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Donations by Cause */}
          {Object.keys(donationByCause).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Donations by Cause</h3>
              <div className="space-y-3">
                {Object.entries(donationByCause)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cause, amount]) => (
                    <div key={cause} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-700">{cause}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{fmt(amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expenditures Tab */}
      {activeView === "expenditures" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">All Expenditures</h3>
            <button onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> Record Expense
            </button>
          </div>

          {/* Add Expense Form */}
          {showAddExpense && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-blue-900">New Expenditure</h4>
                <button onClick={() => setShowAddExpense(false)} className="text-blue-400 hover:text-blue-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-blue-800 mb-1">Title *</label>
                  <input type="text" required value={expForm.title}
                    onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    placeholder="e.g. Vehicle fuel for field visit" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Category *</label>
                  <select value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Amount ($) *</label>
                  <input type="number" required min="0" step="0.01" value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Date</label>
                  <input type="date" value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Vendor / Payee</label>
                  <input type="text" value={expForm.vendor}
                    onChange={(e) => setExpForm({ ...expForm, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    placeholder="Who was paid" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-blue-800 mb-1">Description</label>
                  <textarea value={expForm.description} rows={2}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white resize-none"
                    placeholder="Details about this expense..." />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowAddExpense(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition">Cancel</button>
                  <button type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                    Record Expense
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Expenditures List */}
          {expenditures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No expenditures recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="text-right px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                      <th className="text-center px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="text-right px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenditures.map(exp => (
                      <tr key={exp._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">{exp.title}</p>
                          {exp.vendor && <p className="text-xs text-slate-500">Vendor: {exp.vendor}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{exp.category}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">{fmt(exp.amount)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-600">{exp.recordedBy?.name || "Unknown"}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                            exp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            exp.status === 'flagged' ? 'bg-red-100 text-red-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {exp.status}
                          </span>
                          {exp.status === 'flagged' && exp.notes && (
                            <p className="text-[10px] text-red-500 mt-1 italic">{exp.notes}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {exp.status === 'pending' && isCreatorOrAdmin && (
                              <button onClick={() => handleApproveExpense(exp._id)} title="Approve"
                                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {exp.status !== 'flagged' && (
                              <button onClick={() => handleFlagExpense(exp._id)} title="Flag"
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition">
                                <Flag className="w-4 h-4" />
                              </button>
                            )}
                            {isCreatorOrAdmin && (
                              <button onClick={() => handleDeleteExpense(exp._id)} title="Delete"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Donations Tab */}
      {activeView === "donations" && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">All Donations</h3>
          {donations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No donations received yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="text-right px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cause</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                          {d.userId?.email && <p className="text-xs text-slate-500">{d.userId.email}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            d.donorType === 'Organization' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {d.donorType}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-green-600">{fmt(d.amount)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-600">{d.cause}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500">{d.paymentMethod}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500 italic line-clamp-2">{d.message || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManageFinances;
