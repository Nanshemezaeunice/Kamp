import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("kamp_token");
  const userStr = localStorage.getItem("kamp_user");
  
  if (!token || !userStr) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.type !== "Admin") {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("kamp_token");
    localStorage.removeItem("kamp_user");
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
