import React, { useState } from 'react';
import axios from 'axios';

const BrandTestPage = () => {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. จัดการการเลือกรูปและทำ Preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('กำลังประมวลผล...');

    try {
      // ขั้นตอนที่ 1: อัปโหลดรูปภาพไปยัง Cloudinary
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { url, public_id } = uploadRes.data; // รับข้อมูลรูปภาพกลับมา

      // ขั้นตอนที่ 2: นำข้อมูลไปสร้าง Brand ใน MongoDB
      const brandData = {
        name: name,
        image: { url, public_id } // ใช้โครงสร้างที่คุณปาล์มต้องการ
      };

      await axios.post('http://localhost:5000/api/brand', brandData);

      setMessage('บันทึกแบรนด์สำเร็จแล้ว!');
      setName('');
      setFile(null);
      setPreview(null);
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Test Brand CRUD (No Login)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>ชื่อแบรนด์:</label><br />
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>โลโก้แบรนด์:</label><br />
          <input type="file" onChange={handleFileChange} required />
          {preview && (
            <img src={preview} alt="preview" style={{ width: '100px', marginTop: '10px', display: 'block' }} />
          )}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกแบรนด์'}
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: 'blue' }}>{message}</p>}
    </div>
  );
};

export default BrandTestPage;