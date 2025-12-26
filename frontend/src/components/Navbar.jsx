import React from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, user, isAdmin, isEmployee } = useAuth();
  return (
    <div className="flex z-10 bg-white shadow-lg backdrop-blur-sm bg-opacity-50 p-2 m-1 items-center gap-1 select-none">
        <Link to="/">
        <div className="flex items-center gap-1 cursor-pointer">
            <img src="/logoByte.png" alt="Logo" className="w-12 h-12" />
        </div>
        </Link>

        <ul className="flex gap-4 ml-4 items-center text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-300">
            <li>หมวดหมูสินค้า</li> {/* dropdown */}

            {(isAdmin || isEmployee) && (
                <>
                    <li><Link to="/admin/create-product">Add Product</Link></li>
                    <li><Link to="/admin/create-category">Add Category</Link></li>
                </>
            )}
        </ul>

        <div className="flex gap-4 ml-auto items-center text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-300">
            <input type="text" placeholder="Search" className="p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex gap-4 ml-auto items-center text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-300">
            {isAuthenticated ? (
                <div className="flex items-center gap-4">
                    <span className="text-base font-medium text-gray-600">
                        Hello, {user?.name || user?.email || "User"}
                    </span>
                    <button 
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 cursor-pointer rounded text-base"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <Link to="/login">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 cursor-pointer rounded">
                        Login
                    </button>
                </Link>
            )}
        </div>
        
    </div>
  )
}

export default Navbar