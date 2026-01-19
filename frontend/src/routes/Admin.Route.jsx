import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminRoute() {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (!user.is_admin) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}

export default AdminRoute;