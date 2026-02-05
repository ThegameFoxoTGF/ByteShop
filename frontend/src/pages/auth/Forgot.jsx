import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import authService from '../../services/auth.service';

function Forgot() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: New Password
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Form Data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordToken, setPasswordToken] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Step 0: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            toast.success("ส่ง OTP ไปยังอีเมลของคุณแล้ว");
            setStep(1);
            setCountdown(60);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "ส่ง OTP ไม่สำเร็จ กรุณาตรวจสอบอีเมล");
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            toast.success("ส่งรหัส OTP ใหม่เรียบร้อย");
            setCountdown(60);
        } catch (error) {
            toast.error(error.response?.data?.message || "ส่ง OTP ไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.verifyOtp(email, otp, 'forgot');
            setPasswordToken(res.responseData.passwordToken);
            toast.success("ยืนยัน OTP เรียบร้อย");
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "OTP ไม่ถูกต้อง");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("รหัสผ่านไม่ตรงกัน");
            return;
        }
        setLoading(true);
        try {
            await authService.resetPassword(email, passwordToken, newPassword);
            toast.success("เปลี่ยนรหัสผ่านเรียบร้อย กรุณาเข้าสู่ระบบใหม่");
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
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
                        <h2 className="text-3xl font-bold text-sea-text mb-2">
                            {step === 0 && 'รีเซ็ตรหัสผ่าน'}
                            {step === 1 && 'ยืนยันรหัส OTP'}
                            {step === 2 && 'รหัสผ่านใหม่'}
                        </h2>
                        <p className="text-sea-subtext">
                            {step === 0 && 'ป้อนอีเมลของคุณเพื่อรับรหัส OTP'}
                            {step === 1 && `รหัส OTP ถูกส่งไปยัง ${email}`}
                            {step === 2 && 'กำหนดรหัสผ่านใหม่ของคุณ'}
                        </p>
                    </div>

                    {/* Step 0: Input Email */}
                    {step === 0 && (
                        <form className="space-y-6" onSubmit={handleRequestOtp}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-sea-text mb-1.5 ml-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sea-text placeholder-slate-400 focus:outline-none focus:border-sea-primary focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-4 bg-linear-to-r from-sea-primary to-sea-deep text-white font-bold rounded-xl shadow-lg shadow-sea-primary/30 flex items-center justify-center gap-2 hover:shadow-sea-primary/50 hover:scale-[1.01] transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'กำลังส่ง...' : 'ส่ง OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 1: Input OTP */}
                    {step === 1 && (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-sea-text mb-1.5 ml-1">
                                    Verification Code (OTP)
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-2xl tracking-widest font-mono text-sea-text placeholder-slate-300 focus:outline-none focus:border-sea-primary focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-4 bg-linear-to-r from-sea-primary to-sea-deep text-white font-bold rounded-xl shadow-lg shadow-sea-primary/30 flex items-center justify-center gap-2 hover:shadow-sea-primary/50 hover:scale-[1.01] transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ OTP'}
                            </button>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0 || loading}
                                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors border border-dashed ${countdown > 0
                                        ? 'text-slate-400 border-slate-300 bg-slate-50 cursor-not-allowed'
                                        : 'text-sea-primary border-sea-primary/50 hover:bg-sea-primary/5 hover:border-sea-primary'
                                        }`}
                                >
                                    {countdown > 0 ? `ขอรหัสใหม่ได้ใน ${countdown} วินาที` : 'ส่งรหัส OTP อีกครั้ง'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(0)}
                                    className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                                >
                                    เปลี่ยนอีเมล
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Input New Password */}
                    {step === 2 && (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-sea-text mb-1.5 ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sea-text focus:outline-none focus:border-sea-primary focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sea-primary transition-colors"
                                        >
                                            <Icon icon={showNewPassword ? "ic:round-visibility" : "ic:round-visibility-off"} width="20" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-sea-text mb-1.5 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sea-text focus:outline-none focus:border-sea-primary focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sea-primary transition-colors"
                                        >
                                            <Icon icon={showConfirmPassword ? "ic:round-visibility" : "ic:round-visibility-off"} width="20" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-4 bg-linear-to-r from-sea-primary to-sea-deep text-white font-bold rounded-xl shadow-lg shadow-sea-primary/30 flex items-center justify-center gap-2 hover:shadow-sea-primary/50 hover:scale-[1.01] transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'กำลังอัปเดต...' : 'เปลี่ยนรหัสผ่าน'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <Link to="/login" className="font-bold text-sea-primary hover:text-sea-deep transition-colors flex items-center justify-center gap-2">
                            <Icon icon="ic:round-arrow-back" /> กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Forgot;