import { useState, useEffect } from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import { Users, LayoutDashboard, Settings, ArrowLeft } from "lucide-react";

const SupporterAdminLayout = () => {
  const { id } = useParams();
  const location = useLocation();
  const [supporter, setSupporter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupporter();
  }, [id]);

  const fetchSupporter = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
      const res = await fetch(`http://localhost:3001/api/admin/supporters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSupporter(data);
      }
    } catch (error) {
      console.error("Error fetching supporter:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path || 
    (path.includes("overview") && location.pathname === `/admin/supporter/${id}`);

  const menuItems = [
    {
      label: "Overview",
      path: `/admin/supporter/${id}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: "Settings",
      path: `/admin/supporter/${id}/settings`,
      icon: Settings,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!supporter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Supporter not found</p>
          <Link to="/admin/supporters" className="text-blue-600 hover:underline">
            Back to Supporters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/supporters"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{supporter.userId?.name}</h1>
                <p className="text-sm text-gray-500">{supporter.interest}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                supporter.setupStatus === "verified" 
                  ? "bg-green-100 text-green-700"
                  : supporter.setupStatus === "banned"
                  ? "bg-red-100 text-red-700"
                  : supporter.setupStatus === "suspended"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {supporter.setupStatus.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ supporter, refreshSupporter: fetchSupporter }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupporterAdminLayout;
