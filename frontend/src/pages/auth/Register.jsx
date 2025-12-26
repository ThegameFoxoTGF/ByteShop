import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Import ไอคอน
import { MdEmail, MdLock, MdPersonAdd, MdVpnKey, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
        }
        
        const result = await register({ email, password });

        if (result.success) {
            toast.success("สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...");
            navigate('/'); 
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="flex items-center justify-center ">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
                
                <div className="text-center mb-8">
                    {/* ใช้สีเขียว (Emerald) เล็กน้อยเพื่อสื่อถึงการสร้างใหม่ */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                        <img src="/logoByte.png" alt="Logo" className="w-18 h-18 object-contain"/>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800">สมัครสมาชิก</h2>
                    <p className="text-slate-500 text-sm mt-2">สมัครสมาชิกเพื่อเริ่มต้นใช้งาน</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MdEmail size={20} />
                            </div>
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-slate-50 focus:bg-white"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MdLock size={20} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-slate-50 focus:bg-white"
                                placeholder="รหัสผ่านอย่าน้อย 6 ตัวอักษร"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MdVpnKey size={20} />
                            </div>
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-slate-50 focus:bg-white"
                                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* ปุ่มสมัครสมาชิก ใช้สีเขียว Emerald */}
                    <button 
                        type="submit"
                        className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <MdPersonAdd size={20} className="mr-2" />
                        สมัครสมาชิก
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600">
                    เป็นสมาชิกอยู่แล้ว?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                        เข้าสู่ระบบที่นี่
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;