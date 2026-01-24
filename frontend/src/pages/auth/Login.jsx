import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Icon } from '@iconify/react';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(email, password);
            toast.success("เข้าสู่ระบบเรียบร้อย");

            if (userData.isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-50 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sea-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sea-teal/20 blur-[120px]" />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-sea-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-sea-primary to-sea-deep text-white shadow-lg shadow-sea-primary/30 mb-6 transform hover:scale-105 transition-transform duration-300">
                            <span className="text-2xl font-bold">B</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-sea-text mb-2">ยินดีต้อนรับ</h2>
                        <p className="text-sea-subtext">เข้าสู่ระบบเพื่อใช้งาน ByteShop</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-sea-text mb-1.5 ml-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sea-text placeholder-slate-400 focus:outline-none focus:border-sea-primary focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-sea-text">
                                        Password
                                    </label>
                                    <Link to="/forgot" className="text-sm font-medium text-sea-primary hover:text-sea-deep transition-colors">
                                        ลืมรหัสผ่าน?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sea-text placeholder-slate-400 focus:outline-none focus:border-sea-primary focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300 pr-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-sea-primary transition-colors focus:outline-none"
                                    >
                                        <Icon icon={showPassword ? "ic:outline-visibility-off" : "ic:outline-visibility"} width="20" height="20" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-4 bg-linear-to-r from-sea-primary to-sea-deep text-white font-bold rounded-xl shadow-lg shadow-sea-primary/30 flex items-center justify-center gap-2 hover:shadow-sea-primary/50 hover:scale-[1.01] transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>กำลังเข้าสู่ระบบ...</span>
                                </>
                            ) : (
                                <span>เข้าสู่ระบบ</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sea-subtext">
                            ยังไม่มีบัญชี?{' '}
                            <Link to="/register" className="font-bold text-sea-primary hover:text-sea-deep transition-colors">
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;