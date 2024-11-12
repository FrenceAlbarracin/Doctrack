import React, { useState, useEffect } from 'react';
import './forpass.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have the reset token
    const resetToken = sessionStorage.getItem('resetToken');
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resetToken = sessionStorage.getItem('resetToken');
      const response = await fetch('http://localhost:2000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear the reset token from session storage
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetEmail');
        
        // Navigate to login with success message
        navigate('/', { 
          state: { message: 'Password reset successful. Please login with your new password.' }
        });
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container2">
      <div className="logo-section">
        <img src={logo} alt="Logo" className="logo" />
        <h1><span style={{ color: 'blue' }}>DOCU TRACK</span></h1>
      </div>
      <div className="form-section">
        <div className="form-content2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'skyblue' }}>Welcome to <span style={{ color: '#448EE4', fontWeight: 'bold' }}>DocuTrack</span></h2>
          </div>
          <h1>Change Password</h1>
          <p>Please enter your new password below.</p>
          <br/>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>Enter New Password</label>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
            />
            <label>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            <br />
            <button type="submit" className="sign-in-btn">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
