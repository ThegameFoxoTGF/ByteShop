import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import { Icon } from "@iconify/react";

function OTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef([]);

    // Get email from router state or fallback
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            // If no email provided, redirect to login or show error
            // toast.error("Email not found. Please login or register first.");
            // navigate('/login');
            // For development/demo purposes, we might let it stay or handle it gracefully
        }

        // Timer countdown
        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleChange = (index, value) => {
        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on Backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every(char => /^\d$/.test(char))) {
            const newOtp = [...otp];
            pastedData.forEach((char, index) => {
                if (index < 6) newOtp[index] = char;
            });
            setOtp(newOtp);

            // Focus the last filled input or the first empty one
            const lastFilledIndex = Math.min(pastedData.length - 1, 5);
            inputRefs.current[lastFilledIndex].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            toast.error("Please enter a complete 6-digit code");
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOtp(email, otpValue);
            toast.success("Email verified successfully!");
            navigate('/login'); // Or home, depending on flow
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        try {
            await authService.sendOtp(email);
            setResendTimer(60);
            toast.success("OTP resent successfully!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: "2s" }}></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: "4s" }}></div>
            </div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl z-10 border border-white/20">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-linear-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                        <Icon icon="ic:round-mark-email-read" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Verify your email
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        We've sent a 6-digit code to <br />
                        <span className="font-semibold text-gray-800">{email || 'your email address'}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-center gap-2 sm:gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all shadow-sm bg-gray-50 focus:bg-white focus:-translate-y-1"
                            />
                        ))}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <Icon icon="line-md:loading-loop" className="mr-2 text-xl" />
                                    Verifying...
                                </span>
                            ) : 'Verify Email'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive the code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendTimer > 0}
                            className={`font-semibold transition-colors ${resendTimer > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-indigo-600 hover:text-indigo-500'
                                }`}
                        >
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                        </button>
                    </p>
                </div>

                <div className='mt-6 text-center'>
                    <button
                        onClick={() => navigate('/login')}
                        className='text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 w-full'
                    >
                        <Icon icon="ic:round-arrow-back" /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OTP;