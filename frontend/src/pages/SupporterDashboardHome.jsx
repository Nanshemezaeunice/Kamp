import { useState, useEffect } from "react";

const SupporterDashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("kamp_user") || "{}");
  const [stats, setStats] = useState({ projectsBrowsed: 0, totalDonated: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("kamp_token");
        const res = await fetch("http://localhost:3001/api/donations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const donations = await res.json();
          const myDonations = donations.filter((d) => d.email === user.email);
          setStats({
            projectsBrowsed: new Set(myDonations.map((d) => d.projectId)).size,
            totalDonated: myDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.email]);

  const statCards = [
    { label: "Projects Supported", value: stats.projectsBrowsed, icon: "🎯", color: "blue" },
    { label: "Total Donated", value: `$${stats.totalDonated.toLocaleString()}`, icon: "💝", color: "green" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user.name || "Supporter"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s a snapshot of your activity on KAMP.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                href="/supporter/projects"
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium text-gray-800">Browse Projects</p>
                  <p className="text-sm text-gray-500">Discover and support projects</p>
                </div>
              </a>
              <a
                href="/projects"
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="font-medium text-gray-800">Explore KAMP</p>
                  <p className="text-sm text-gray-500">See all projects on the platform</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupporterDashboardHome;
