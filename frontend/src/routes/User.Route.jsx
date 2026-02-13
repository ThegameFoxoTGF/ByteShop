import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useEffect } from "react";

function UserRoute() {
    const { user, is_admin } = useAuth();

    useEffect(() => {
        if (user && is_admin) {
            toast.error("ผู้ดูแลระบบ (Admin) ไม่สามารถใช้งานส่วนนี้ได้");
        }
    }, [user, is_admin]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (is_admin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default UserRoute;
