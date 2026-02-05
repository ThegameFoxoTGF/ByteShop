import crypto from 'crypto';

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const generatePasswordToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

const otpTemplate = (otp) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        .container {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background-color: #2563eb;
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }
        .content {
            padding: 40px;
            text-align: center;
            background-color: #ffffff;
        }
        .otp-code {
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #1e293b;
            background-color: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            display: inline-block;
            border: 2px dashed #cbd5e1;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        .warning {
            color: #ef4444;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size: 28px;">Byte IT Store</h1>
        </div>
        <div class="content">
            <h2 style="color: #1e293b;">รีเซ็ตรหัสผ่าน</h2>
            <p style="color: #475569; font-size: 16px;">สวัสดีครับ, โปรดใช้รหัส OTP ด้านล่างนี้เพื่อดำเนินการต่อให้เสร็จสมบูรณ์:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p class="warning">รหัสนี้จะมีอายุการใช้งานเพียง 5 นาทีเท่านั้น</p>
            <p style="color: #94a3b8; font-size: 14px;">เพื่อความปลอดภัย โปรดอย่าแจ้งรหัสนี้แก่ผู้อื่น</p>
        </div>
        <div class="footer">
            <p>หากคุณไม่ได้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
            <p>&copy; 2026 Byte IT Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

export { generateOtp, generatePasswordToken, otpTemplate };