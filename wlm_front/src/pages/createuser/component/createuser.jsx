import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/createuser.css';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    id: '',
    email: '',
    department: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('fastapi.dummylink/나중에 추가', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('등록 실패');

      const result = await response.json();
      console.log('성공:', result);
      alert('계정 생성 성공!');
    } catch (error) {
      console.error('에러 발생:', error);
      alert('계정 생성 실패');
    }
  };

  return (
    <div className="body-section">
      <div className="container">
        <div className="form-container">

          <button className="back-button" onClick={() => navigate('/userlist')}>
            ←
          </button>
          
          <form onSubmit={handleSubmit}>
            <h1>계정 생성</h1>
            <span>사원 아이디 생성을 위해 필요한 정보를 입력해 주세요.</span> 
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input type="date" name="birth" placeholder="Birth" value={formData.birth} onChange={handleChange} required />
            <input type="text" name="id" placeholder="ID (Employee Number)" value={formData.employeeId} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button type="submit">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
