import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { MdEmail, MdLock, MdLogin, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);

        if (result.success) {
            toast.success("ยินดีต้อนรับเข้าสู่ระบบ!");
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                        <img src="/logoByte.png" alt="Logo" className="w-18 h-18 object-contain"/>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800">เข้าสู่ระบบ</h2>
                    <p className="text-slate-500 text-sm mt-2">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MdEmail size={20} />
                            </div>
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-slate-50 focus:bg-white"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MdLock size={20} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-slate-50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </button>
                        </div>
                        <div className="text-right mt-2">
                            <Link to="/forgot-password" title="Forgot Password" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <MdLogin size={20} className="mr-2" />
                        เข้าสู่ระบบ
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600">
                    ยังไม่มีบัญชีผู้ใช้?{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                        สมัครสมาชิก
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;