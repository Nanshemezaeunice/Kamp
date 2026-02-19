// Top bar for the organisation dashboard.
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../config";

const OrgNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("kamp_user") || "{}");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds so partner invitations show up promptly
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("kamp_token");
      const res = await fetch(api("/api/notifications"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 20));
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch {}
  };

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem("kamp_token");
      await fetch(api(`/api/notifications/${id}/read`), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const respondToPartner = async (notification, response) => {
    try {
      const token = localStorage.getItem("kamp_token");
      const projectId = notification.projectId?._id || notification.projectId;
      await fetch(api(`/api/projects/${projectId}/respond-partner`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response }),
      });
      // The backend marks the notification as read — just refresh the list
      fetchNotifications();
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("kamp_token");
    localStorage.removeItem("kamp_user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <Link to="/organization/dashboard" className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                KAMP Organisation
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-gray-400 text-sm">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-4 ${!n.read ? "bg-blue-50" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm text-gray-800">{n.title}</p>
                            <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{n.message}</p>
                          {/* Partner invitations show accept/decline — other notifications just get a read button */}
                          {n.type === "partner_invitation" && n.read === false && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => respondToPartner(n, "accepted")}
                                className="flex-1 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-600 hover:text-white transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => respondToPartner(n, "declined")}
                                className="flex-1 py-1.5 text-xs font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {n.type !== "partner_invitation" && !n.read && (
                            <button
                              onClick={() => markRead(n._id)}
                              className="text-xs text-blue-500 hover:underline mt-1"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : "O"}
                </span>
              </div>
              <span>{user.name || "Organisation"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OrgNavbar;
