import React, { useState } from 'react';
import './signin.css'; // Reuse the CSS file for styling
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    contactNumber: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    console.log('Sending signup request to:', `${process.env.REACT_APP_API_URL}/signup`);
    console.log('Signup data:', formData);

    try {
      console.log('Sending signup request to:', `${process.env.REACT_APP_API_URL}/signup`);
      console.log('Signup data:', formData);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, formData);
      console.log("Signup response:", response.data);
      alert("Sign up successful! Please log in.");
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      setError(`Error: ${error.response?.data?.error || error.message || 'An error occurred during sign up.'}`);
    }
  };

  return (
    <div className="signup-container">
      <div className="logo-section">
        <img src={logo} alt="Logo" className="logo" />
        <h1><span style={{ color: 'blue' }}>DOCU TRACK</span></h1>
      </div>
      <div className="form-section">
        <div className="form-content1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'skyblue' }}>Welcome to <span style={{ color: '#448EE4', fontWeight: 'bold' }}>DocuTrack</span></h2>
            <p style={{ fontSize: '14px' }}><br />Have account?<br /> <Link to="/" className="signup-link">Sign In</Link></p>
          </div>
          <h1>Sign Up</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Enter your university Email Address</label>
            <input id="email" type="email" placeholder="University Email" required onChange={handleChange} />
            <br />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ width: '48%' }}>
                <label htmlFor="username">User Name</label>
                <input id="username" type="text" placeholder="User Name" required style={{ width: '100%' }} onChange={handleChange} />
              </div>
              <div style={{ width: '40%' }}>
                <label htmlFor="contactNumber">Contact Number</label>
                <input id="contactNumber" type="tel" placeholder="09XX-XXX-XXXX" required style={{ width: '100%' }} onChange={handleChange} />
              </div>
            </div>
            <br />
            <label htmlFor="password">Enter your Password</label>
            <input id="password" type="password" placeholder="Password" required onChange={handleChange} />
            <br/>
            <button type="submit" className="sign-in-btn">Sign up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

