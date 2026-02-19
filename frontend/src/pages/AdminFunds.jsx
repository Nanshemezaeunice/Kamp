// Platform-wide financial overview for the admin.
// Shows donations, member contributions and spending per project in one place.
import { useState, useEffect } from "react";
import { api } from "../config";

const AdminFunds = () => {
  const [fundsData, setFundsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState({});
  const token = localStorage.getItem("kamp_token");

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const res = await fetch(api("/api/stats/admin/funds"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFundsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch funds:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectFinances = async (projectId) => {
    if (projectDetails[projectId]) {
      setExpandedProject(expandedProject === projectId ? null : projectId);
      return;
    }
    try {
      const res = await fetch(api(`/api/project-manage/${projectId}/finances`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjectDetails(prev => ({ ...prev, [projectId]: data }));
        setExpandedProject(projectId);
      }
    } catch (err) {
      console.error("Failed to fetch project finances:", err);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val?.toLocaleString() || 0}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fundsData) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="text-xl font-bold">Failed to load funds data</p>
      </div>
    );
  }

  const { summary, projectFunds, recentDonations, recentExpenditures } = fundsData;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Funds Tracker</h1>
        <p className="text-gray-600">Track the flow of funds across all approved projects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Funds Received</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalFunds)}</p>
          <div className="mt-2 text-xs text-gray-400">
            <span className="text-green-600 font-medium">Donations: {formatCurrency(summary.totalDonations)}</span>
            {" | "}
            <span className="text-blue-600 font-medium">Members: {formatCurrency(summary.totalMemberFunds)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
          <p className="text-gray-500 text-sm font-medium mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(summary.netBalance)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Goal</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalGoal)}</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min((summary.totalFunds / summary.totalGoal) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{Math.round((summary.totalFunds / summary.totalGoal) * 100)}% funded</p>
          </div>
        </div>
      </div>

      {/* Per-Project Funds Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Project Fund Flow</h2>
          <p className="text-sm text-gray-500 mt-1">Click a project to see detailed transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Goal</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Donations</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Member Funds</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total In</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Spent</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projectFunds.map((pf) => (
                <tr key={pf.project._id}>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => fetchProjectFinances(pf.project._id)}
                      className="text-left hover:text-blue-600 transition"
                    >
                      <p className="font-semibold text-gray-800 text-sm">{pf.project.name}</p>
                      <p className="text-xs text-gray-400">by {pf.project.creator}</p>
                    </button>
                  </td>
                  <td className="text-right px-4 py-4 text-sm font-medium text-gray-700">{formatCurrency(pf.project.goal)}</td>
                  <td className="text-right px-4 py-4 text-sm font-medium text-green-600">{formatCurrency(pf.totalDonated)}</td>
                  <td className="text-right px-4 py-4 text-sm font-medium text-blue-600">{formatCurrency(pf.memberFunds)}</td>
                  <td className="text-right px-4 py-4 text-sm font-bold text-gray-800">{formatCurrency(pf.totalFunds)}</td>
                  <td className="text-right px-4 py-4 text-sm font-medium text-red-600">{formatCurrency(pf.totalSpent)}</td>
                  <td className={`text-right px-4 py-4 text-sm font-bold ${pf.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(pf.balance)}
                  </td>
                  <td className="text-center px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      pf.project.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                      pf.project.status === 'Planning' || pf.project.status === 'Planned' ? 'bg-yellow-100 text-yellow-700' :
                      pf.project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {pf.project.status}
                    </span>
                  </td>
                </tr>
              ))}
              {projectFunds.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">No approved projects with fund data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Project Detail */}
      {expandedProject && projectDetails[expandedProject] && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Fund Details: {projectFunds.find(pf => pf.project._id === expandedProject)?.project.name}
              </h2>
            </div>
            <button
              onClick={() => setExpandedProject(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donations List */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Donations ({projectDetails[expandedProject].donations?.length || 0})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {projectDetails[expandedProject].donations?.map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()} — {d.cause}</p>
                    </div>
                    <span className="font-bold text-green-700">${d.amount?.toLocaleString()}</span>
                  </div>
                ))}
                {(!projectDetails[expandedProject].donations || projectDetails[expandedProject].donations.length === 0) && (
                  <p className="text-gray-400 text-sm">No donations yet</p>
                )}
              </div>
            </div>

            {/* Expenditures List */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Expenditures ({projectDetails[expandedProject].expenditures?.length || 0})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {projectDetails[expandedProject].expenditures?.map((e, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{e.title}</p>
                      <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()} — {e.category}</p>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        e.status === 'approved' ? 'bg-green-100 text-green-700' :
                        e.status === 'flagged' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{e.status}</span>
                    </div>
                    <span className="font-bold text-red-700">${e.amount?.toLocaleString()}</span>
                  </div>
                ))}
                {(!projectDetails[expandedProject].expenditures || projectDetails[expandedProject].expenditures.length === 0) && (
                  <p className="text-gray-400 text-sm">No expenditures recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Spending by Category */}
          {projectDetails[expandedProject].spendingByCategory && Object.keys(projectDetails[expandedProject].spendingByCategory).length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Spending by Category</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(projectDetails[expandedProject].spendingByCategory).map(([cat, amount]) => (
                  <div key={cat} className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">{cat}</p>
                    <p className="font-bold text-gray-800">${amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Donations (All Projects)</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentDonations.map((d, i) => (
              <div key={i} className="flex justify-between items-start pb-3 border-b border-gray-50 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.projectId?.name || 'Unknown project'} — {new Date(d.createdAt).toLocaleDateString()}</p>
                  {d.cause && <p className="text-xs text-blue-500 font-medium mt-0.5">Cause: {d.cause}</p>}
                </div>
                <span className="font-bold text-green-600 text-sm shrink-0 ml-3">+${d.amount?.toLocaleString()}</span>
              </div>
            ))}
            {recentDonations.length === 0 && <p className="text-gray-400 text-sm">No donations yet</p>}
          </div>
        </div>

        {/* Recent Expenditures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Expenditures (All Projects)</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentExpenditures.map((e, i) => (
              <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{e.title}</p>
                  <p className="text-xs text-gray-400">{e.projectId?.name || 'Unknown'} — {new Date(e.date).toLocaleDateString()}</p>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    e.status === 'approved' ? 'bg-green-100 text-green-700' :
                    e.status === 'flagged' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{e.status}</span>
                </div>
                <span className="font-bold text-red-600 text-sm">-${e.amount?.toLocaleString()}</span>
              </div>
            ))}
            {recentExpenditures.length === 0 && <p className="text-gray-400 text-sm">No expenditures yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFunds;
