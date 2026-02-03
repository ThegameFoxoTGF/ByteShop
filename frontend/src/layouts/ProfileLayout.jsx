import { Outlet, useLocation } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import Breadcrumb from '../components/Breadcrumb';

function ProfileLayout() {
    const location = useLocation();
    const path = location.pathname;

    const getBreadcrumbs = () => {
        const base = [
            { label: 'หน้าหลัก', path: '/', icon: 'ic:round-home' }
        ];

        if (path === '/profile') {
            base.push({ label: 'ข้อมูลส่วนตัว', icon: 'ic:round-person' });
        } else {
            base.push({ label: 'บัญชีผู้ใช้', path: '/profile', icon: 'ic:round-account-circle' });

            if (path.includes('/orders')) {
                base.push({ label: 'ประวัติคำสั่งซื้อ', icon: 'ic:round-history' });
            } else if (path.includes('/address')) {
                base.push({ label: 'ที่อยู่ของฉัน', icon: 'ic:round-location-on' });
            } else if (path.includes('/wishlist')) {
                base.push({ label: 'สิ่งที่อยากได้', icon: 'ic:round-favorite' });
            }
        }

        return base;
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Breadcrumb items={getBreadcrumbs()} />
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <UserSidebar />
                <div className="flex-1 w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default ProfileLayout;
