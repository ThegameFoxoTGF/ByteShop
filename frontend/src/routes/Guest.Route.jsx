import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function GuestRoute() {
    const { user } = useAuth();
    if (user) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}

export default GuestRoute;