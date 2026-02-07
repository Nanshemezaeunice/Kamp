import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, appRes] = await Promise.all([
          fetch("http://localhost:3001/api/projects"),
          fetch("http://localhost:3001/api/applications")
        ]);
        
        if (!projRes.ok) throw new Error("Failed to fetch projects");
        
        const projData = await projRes.json();
        setProjects(projData);

        if (appRes.ok) {
          const appData = await appRes.json();
          setApplications(appData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const totalRaised = projects.reduce((sum, p) => sum + (p.raised || 0), 0);
  const totalDonors = projects.reduce((sum, p) => sum + (p.donors || 0), 0);
  const uniqueNgos = new Set(projects.flatMap((p) => p.ngos || [])).size;
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="text-xl font-bold">Error loading dashboard</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the KAMP Admin Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Projects */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-gray-800">{projects.length}</p>
            </div>
            <div className="text-4xl opacity-20">📁</div>
          </div>
        </div>

        {/* Total NGOs */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Partner NGOs</p>
              <p className="text-3xl font-bold text-gray-800">{uniqueNgos}</p>
            </div>
            <div className="text-4xl opacity-20">🏢</div>
          </div>
        </div>

        {/* Total Donations */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Donations</p>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalRaised)}</p>
            </div>
            <div className="text-4xl opacity-20">💰</div>
          </div>
        </div>

        {/* NGO Applications */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">NGO Inquiries</p>
              <p className="text-3xl font-bold text-gray-800">{applications.length}</p>
            </div>
            <div className="text-4xl opacity-20">📩</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Projects</h2>
          <div className="space-y-4">
            {recentProjects.map((project, idx) => {
              const progress = Math.round((project.raised / project.goal) * 100) || 0;
              return (
                <div key={project._id || idx} className="pb-4 border-b last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress}% funded</p>
                </div>
              );
            })}
            {recentProjects.length === 0 && (
              <p className="text-gray-500 text-sm">No projects found.</p>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Avg. Project Completion</span>
              <span className="font-bold text-lg text-blue-600">65%</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Funds Tracked</span>
              <span className="font-bold text-lg text-blue-600">{formatCurrency(totalRaised)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Donor Satisfaction</span>
              <span className="font-bold text-lg text-blue-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fraud Prevention Rate</span>
              <span className="font-bold text-lg text-blue-600">99.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
