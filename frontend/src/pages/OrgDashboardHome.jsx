import { useEffect, useState } from "react";
import { api } from "../config";

const OrgDashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("kamp_user") || "{}");
  const [stats, setStats] = useState({ projects: 0, donations: 0, totalRaised: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("kamp_token");
        const res = await fetch(api("/api/projects"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const projects = await res.json();
          const totalRaised = projects.reduce((sum, p) => sum + (p.raised || 0), 0);
          setStats({
            projects: projects.length,
            donations: projects.reduce((sum, p) => sum + (p.donations?.length || 0), 0),
            totalRaised,
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Projects", value: stats.projects, color: "blue", icon: "📋" },
    { label: "Total Donations", value: stats.donations, color: "green", icon: "💰" },
    { label: "Total Raised", value: `$${stats.totalRaised.toLocaleString()}`, color: "purple", icon: "📈" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user.name || "Organisation"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your organisation&apos;s activity on KAMP.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{card.icon}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${card.color}-50 text-${card.color}-600`}>
                    {card.label}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/organization/projects"
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium text-gray-800">View Projects</p>
                  <p className="text-sm text-gray-500">Manage your active projects</p>
                </div>
              </a>
              <a
                href="/projects"
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium text-gray-800">Browse All Projects</p>
                  <p className="text-sm text-gray-500">Discover projects on KAMP</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgDashboardHome;
