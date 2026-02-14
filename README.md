# 🛠️ โปรเจคเพื่อการศึกษาโดย **[ThegameFoxoTGF]** 💻

# 💻 ByteShop - Computer E-commerce Platform (MERN Stack)

ByteShop คือแพลตฟอร์มอีคอมเมิร์ซสำหรับจำหน่ายอุปกรณ์คอมพิวเตอร์ที่พัฒนาด้วย MERN Stack (MongoDB, Express, React, Node.js)

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - Library สำหรับสร้าง UI
- **Tailwind CSS 4** - Styling Framework
- **React Router 7** - การจัดการ Routing
- **Axios** - การเชื่อมต่อ API
- **Iconify** - ไอคอนเซ็ต
- **React Toastify** - การแจ้งเตือน (Notifications)
- **Recharts** - กราฟ
- **Vite** - สร้างโปรเจค

### Backend

- **Node.js** - Runtime Environment
- **Express.js 5** - Web Framework
- **Mongoose** - ODM สำหรับ MongoDB
- **JWT (JSON Web Token)** - การยืนยันตัวตน
- **bcryptjs** - การเข้ารหัสรหัสผ่าน
- **Cors** - การจัดการ Cross-Origin Resource Sharing
- **dotenv** - การจัดการตัวแปรสภาพแวดล้อม
- **Cookie-parser** - การจัดการคุกกี้
- **Cloudinary** - พื้นที่ฝากไฟล์รูปภาพ
- **Multer** - Middleware สำหรับจัดการไฟล์อัปโหลด
- **Nodemailer** - สำหรับส่งอีเมล (OTP)

### Database

- **MongoDB** - Database

### Tools

- **Visual Studio Code** - โปรแกรมพัฒนา
- **MongoDB Compass** - จัดการข้อมูล MongoDB
- **MongoDB Atlas** - คลาวด์เก็บข้อมูล MongoDB
- **Git** - ระบบจัดการโค้ด
- **GitHub** - จัดเก็บโค้ด
- **Postman** - ทดสอบ API

---

## 📂 Project Structure

```
ByteShop/
├── backend/            # Express Server & API
│   ├── config/         # Database & Cloudinary Config
│   ├── controllers/    # Route Controllers
│   ├── middleware/     # Auth & Error Middleware
│   ├── models/         # Mongoose Models (Schema)
│   ├── routes/         # API Routes
│   └── utils/          # Helper functions (Email, Token)
│
└── frontend/           # React Application
    ├── src/
    │   ├── api/        # Axios Client Setup
    │   ├── assets/     # Static Assets (Images, Icons)
    │   ├── components/ # Reusable Components
    │   ├── contexts/   # React Context (Auth, Cart)
    │   ├── layouts/    # Page Layouts
    │   ├── pages/      # Application Pages
    │   ├── routes/     # React Router Setup
    │   └── services/   # API Service Functions
```

---
