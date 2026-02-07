import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-3">KAMP</h2>
            <p className="text-gray-400 max-w-md">
              Karamoja Aid Management Platform — Bringing transparency,
              accountability, and trust to humanitarian projects in Karamoja.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="hover:text-blue-400 transition"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-400 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/get-started"
                  className="hover:text-blue-400 transition"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="hover:text-blue-400 transition"
                >
                  Donate to a Project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 px-4 text-center text-gray-500 text-sm flex justify-between items-center">
          <div>
            &copy; {new Date().getFullYear()} KAMP — Karamoja Aid Management
            Platform. All rights reserved.
          </div>
          <Link
            to="/admin/login"
            className="text-gray-500 hover:text-blue-400 transition text-xs"
            title="Admin Portal"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
