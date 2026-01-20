import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

function ProfileLayout() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
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
