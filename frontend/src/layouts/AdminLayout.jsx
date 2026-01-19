import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
    return (
        <>
            <div className="flex w-full">
                <AdminSidebar />
                <main className="w-full">
                    <Outlet />
                </main>
            </div>
        </>
    )
}

export default AdminLayout