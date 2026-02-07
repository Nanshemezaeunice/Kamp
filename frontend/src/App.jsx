import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import OrgLayout from "./layouts/OrgLayout";
import SupporterLayout from "./layouts/SupporterLayout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import ProjectDetails from "./pages/ProjectDetails";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProjects from "./pages/AdminProjects";
import AdminTeam from "./pages/AdminTeam";
import AdminApplications from "./pages/AdminApplications";
import ProjectAdminLayout from "./layouts/ProjectAdminLayout";
import ProjectAdminOverview from "./pages/ProjectAdminOverview";
import ProjectAdminOrganisations from "./pages/ProjectAdminOrganisations";
import AdminOrganisations from "./pages/AdminOrganisations";
import OrgAdminLayout from "./layouts/OrgAdminLayout";
import OrgAdminOverview from "./pages/OrgAdminOverview";
import OrgAdminProjects from "./pages/OrgAdminProjects";
import OrgAdminSettings from "./pages/OrgAdminSettings";
import AdminSupporters from "./pages/AdminSupporters";
import SupporterAdminLayout from "./layouts/SupporterAdminLayout";
import SupporterAdminOverview from "./pages/SupporterAdminOverview";
import SupporterAdminSettings from "./pages/SupporterAdminSettings";
import OrgSetup from "./pages/OrgSetup";
import OrgDashboardHome from "./pages/OrgDashboardHome";
import OrgDashboardProjects from "./pages/OrgDashboardProjects";
import SupporterSetup from "./pages/SupporterSetup";
import SupporterDashboardHome from "./pages/SupporterDashboardHome";
import SupporterDashboardProjects from "./pages/SupporterDashboardProjects";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/:id", element: <ProjectDetails /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "get-started", element: <GetStarted /> },
      { path: "login", element: <Login /> },
    ],
  },
  // ─── Admin ───
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "projects", element: <AdminProjects /> },
          { path: "organisations", element: <AdminOrganisations /> },
          { path: "supporters", element: <AdminSupporters /> },
          { path: "team", element: <AdminTeam /> },
          { path: "applications", element: <AdminApplications /> },
        ],
      },
      {
        path: "projects/:id",
        element: <ProjectAdminLayout />,
        children: [
          { index: true, element: <ProjectAdminOverview /> },
          { path: "overview", element: <ProjectAdminOverview /> },
          { path: "organisations", element: <ProjectAdminOrganisations /> },
        ],
      },
      {
        path: "organisation/:id",
        element: <OrgAdminLayout />,
        children: [
          { index: true, element: <OrgAdminOverview /> },
          { path: "overview", element: <OrgAdminOverview /> },
          { path: "projects", element: <OrgAdminProjects /> },
          { path: "settings", element: <OrgAdminSettings /> },
        ],
      },
      {
        path: "supporter/:id",
        element: <SupporterAdminLayout />,
        children: [
          { index: true, element: <SupporterAdminOverview /> },
          { path: "overview", element: <SupporterAdminOverview /> },
          { path: "settings", element: <SupporterAdminSettings /> },
        ],
      },
    ],
  },
  // ─── Organisation ───
  {
    path: "/organization/setup",
    element: <OrgSetup />,
  },
  {
    path: "/organization",
    element: <OrgLayout />,
    children: [
      { path: "dashboard", element: <OrgDashboardHome /> },
      { path: "projects", element: <OrgDashboardProjects /> },
    ],
  },
  // ─── Community Supporter ───
  {
    path: "/supporter/setup",
    element: <SupporterSetup />,
  },
  {
    path: "/supporter",
    element: <SupporterLayout />,
    children: [
      { path: "dashboard", element: <SupporterDashboardHome /> },
      { path: "projects", element: <SupporterDashboardProjects /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
