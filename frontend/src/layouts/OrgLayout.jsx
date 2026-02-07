import { useState } from "react";
import { Outlet } from "react-router-dom";
import OrgNavbar from "../components/OrgNavbar";
import OrgSidebar from "../components/OrgSidebar";

const OrgLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OrgNavbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <OrgSidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <main className="flex-1 min-h-[calc(100vh-64px)] transition-all duration-300">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrgLayout;
