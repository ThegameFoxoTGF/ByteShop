import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import userService from "../services/user.service";
import authService from "../services/auth.service";

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form Data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birthday: "",
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "",
      });
    }
  }, [user]);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        birthday: formData.birthday || null,
      };

      const updatedUser = await userService.updateProfile(payload);

      const flattenedUser = {
        ...user,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone_number: updatedUser.phone_number,
        birthday: updatedUser.birthday,
        email: updatedUser.email
      };

      updateUser(flattenedUser);
      setIsEditing(false);
      toast.success("อัปเดตข้อมูลสำเร็จ");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "อัปเดตข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await authService.sendOtp(user.email);
      setOtpSent(true);
      setResendTimer(60);
      toast.success("ส่ง OTP ไปยังอีเมลเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "ส่ง OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!otpSent) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await userService.updatePassword({
        otp: passwordData.otp,
        newPassword: passwordData.newPassword
      });
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setIsChangingPassword(false);
      setOtpSent(false);
      setPasswordData({ newPassword: "", confirmPassword: "", otp: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  if (isChangingPassword) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sea-text flex items-center gap-2">
            <button onClick={() => setIsChangingPassword(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Icon icon="ic:round-arrow-back" width="28" />
            </button>
            เปลี่ยนรหัสผ่าน
          </h1>
        </div>

        <div className="bg-white h-full min-h-[500px] p-8 rounded-2xl shadow-sm border border-slate-100 relative">

          <form onSubmit={handleSubmitPassword} className="space-y-6 max-w-lg">
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 mb-6 flex gap-3">
              <Icon icon="ic:round-info" className="text-xl shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">ขั้นตอนการเปลี่ยนรหัสผ่าน (เพื่อความปลอดภัย)</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>กรอกรหัสผ่านใหม่ที่ต้องการ</li>
                  <li>กดปุ่ม "ส่ง OTP" เพื่อรับรหัสยืนยันทางอีเมล</li>
                  <li>นำรหัส OTP 6 หลักมากรอกเพื่อยืนยัน</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={otpSent}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary disabled:bg-slate-50 disabled:text-slate-400 pr-10"
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sea-primary transition-colors"
                  disabled={otpSent}
                >
                  <Icon icon={showNewPassword ? "ic:round-visibility" : "ic:round-visibility-off"} width="20" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={otpSent}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary disabled:bg-slate-50 disabled:text-slate-400 pr-10"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sea-primary transition-colors"
                  disabled={otpSent}
                >
                  <Icon icon={showConfirmPassword ? "ic:round-visibility" : "ic:round-visibility-off"} width="20" />
                </button>
              </div>
            </div>

            {/* OTP Section */}
            <div className="pt-2 border-t border-slate-100">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword || loading}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? <Icon icon="eos-icons:loading" /> : <Icon icon="ic:round-send" />}
                  ส่ง OTP ยืนยัน
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">รหัส OTP</label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendTimer > 0 || loading}
                        className="text-xs text-sea-primary hover:underline disabled:text-slate-400 disabled:no-underline"
                      >
                        {resendTimer > 0 ? `ส่งใหม่ใน ${resendTimer}s` : 'ส่งรหัสใหม่'}
                      </button>
                    </div>
                    <input
                      type="text"
                      name="otp"
                      value={passwordData.otp}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary text-center tracking-widest font-bold text-lg"
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                    <p className="text-xs text-slate-500 mt-1">รหัสถูกส่งไปที่ {user?.email}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setPasswordData(prev => ({ ...prev, otp: "" }));
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                    >
                      แก้ไขรหัสผ่าน
                    </button>
                    <button
                      type="submit"
                      disabled={!passwordData.otp || loading}
                      className="flex-2 py-2.5 rounded-xl bg-sea-primary text-white font-bold hover:bg-sea-deep shadow-lg shadow-sea-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {loading ? <Icon icon="eos-icons:loading" /> : <Icon icon="ic:round-check-circle" />}
                      ยืนยันการเปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sea-text">ข้อมูลส่วนตัว</h1>
      </div>

      <div className="bg-white h-full min-h-[500px] p-8 rounded-2xl shadow-sm border border-slate-100 relative">

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันเกิด</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    email: user.email || "",
                    phone_number: user.phone_number || "",
                    birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "",
                  });
                }}
                className="px-6 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-sea-primary text-white font-bold shadow-lg shadow-sea-primary/30 hover:bg-sea-deep transition-all flex items-center gap-2"
              >
                {loading && <Icon icon="eos-icons:loading" />}
                บันทึก
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-sea-primary text-2xl font-bold border border-slate-100 shadow-sm">
                {user?.first_name?.[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{user?.first_name} {user?.last_name}</h3>
                <p className="text-slate-500 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto px-6 py-3 bg-sea-primary text-white text-base font-bold rounded-xl shadow-lg shadow-sea-primary/30 hover:bg-sea-deep hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Icon icon="ic:round-edit" width="20" />
                แก้ไขข้อมูล
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-slate-100 hover:border-sea-primary/30 transition-colors group">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Icon icon="ic:round-email" className="group-hover:text-sea-primary transition-colors" /> อีเมล
                </label>
                <div className="text-slate-800 font-medium">{user?.email}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 hover:border-sea-primary/30 transition-colors group">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Icon icon="ic:round-phone" className="group-hover:text-sea-primary transition-colors" /> เบอร์โทรศัพท์
                </label>
                <div className="text-slate-800 font-medium">{user?.phone_number || '-'}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 hover:border-sea-primary/30 transition-colors group">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Icon icon="ic:round-cake" className="group-hover:text-sea-primary transition-colors" /> วันเกิด
                </label>
                <div className="text-slate-800 font-medium">
                  {user?.birthday
                    ? new Date(user.birthday).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'
                  }
                </div>
              </div>
              <div
                onClick={() => setIsChangingPassword(true)}
                className="p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200 transition-all cursor-pointer group flex items-center justify-between shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-100 group-hover:scale-110 transition-transform">
                    <Icon icon="ic:round-lock-reset" width="20" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">เปลี่ยนรหัสผ่าน</h4>
                    <p className="text-xs text-slate-500">เพื่อความปลอดภัยของบัญชี</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-white text-red-500 text-sm font-bold rounded-lg border border-red-100 shadow-sm group-hover:px-4 transition-all">
                  แก้ไข
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
