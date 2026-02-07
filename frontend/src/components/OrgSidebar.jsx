import { Link, useLocation } from "react-router-dom";

const OrgSidebar = ({ isOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/organization/dashboard",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Projects",
      path: "/organization/projects",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out z-40 shadow-sm 
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          lg:translate-x-0 lg:sticky lg:top-16 lg:shadow-none lg:overflow-visible
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <nav className="p-4">
          <div className="mb-8">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 lg:border-l-0 lg:bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${isCollapsed ? "lg:px-0 lg:justify-center" : ""}`}
                >
                  <span className={`${isActive(item.path) ? "text-blue-600" : "text-gray-400"} group-hover:text-blue-600 transition-colors`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap animate-fadeIn">{item.label}</span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:block hidden z-[60] whitespace-nowrap border border-gray-700 shadow-xl">
                      {item.label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-gray-900"></div>
                    </div>
                  )}

                  {isActive(item.path) && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 animate-fadeIn">
            <div className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} KAMP Organisation
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default OrgSidebar;
