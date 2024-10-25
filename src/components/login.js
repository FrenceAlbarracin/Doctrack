import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import logo from '../assets/logo.png';
import googleLogo from '../assets/google.webp';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios'; // Make sure to install axios: npm install axios

const GoogleLoginButton = ({ isCaptchaVerified }) => {
  const navigate = useNavigate();
  
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      console.log("Google Sign-In Successful:", codeResponse);
      try {
        // Get user info using the access token
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${codeResponse.access_token}` } }
        );
        
        console.log("User Info:", userInfo.data);

        // Here, you would typically:
        // 1. Send this data to your backend
        // 2. Create or update the user in your database
        // 3. Get a session token or JWT from your backend
        // 4. Store that token in localStorage or a secure cookie

        // For example:
        // const response = await axios.post('your-backend-url/auth/google', userInfo.data);
        // localStorage.setItem('token', response.data.token);

        // After successful authentication and storing the token
        console.log("Authentication successful, navigating to dashboard...");
        navigate('/dashboard');
      } catch (error) {
        console.error("Error during Google authentication:", error);
        alert("An error occurred during sign in. Please try again.");
      }
    },
    onError: (error) => {
      console.error('Google Sign-In Failed:', error);
      alert("Login failed. Please try again and ensure you complete the sign-in process.");
    },
  });

  const handleClick = () => {
    if (!isCaptchaVerified) {
      alert("Please complete the reCAPTCHA before signing in with Google");
      return;
    }
    login();
  };

  return (
    <button onClick={handleClick} className="google-login-btn" disabled={!isCaptchaVerified}>
      <img src={googleLogo} alt="Google Logo" style={{ width: '20px', marginRight: '10px' }} />
      Sign in with Google
    </button>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const handleCaptchaChange = (value) => {
    setIsCaptchaVerified(!!value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isCaptchaVerified) {
      alert("Please complete the reCAPTCHA");
      return;
    }
    
    console.log("Form submitted with reCAPTCHA verified");
    // Add your regular login API call here
    navigate('/dashboard');
  };

  return (
    <GoogleOAuthProvider clientId="948616457649-9m9i5mjm96aq76cgbk96t1rk0guo137k.apps.googleusercontent.com">
      <div className="login-container">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />
          <h1><span style={{ color: 'blue' }}>DOCU TRACK</span></h1>
        </div>
        <div className="form-section">
          <div className="form-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: 'skyblue' }}>Welcome to <span style={{ color: '#448EE4', fontWeight: 'bold' }}>DocuTrack</span></h2>
              <p style={{ fontSize: '14px' }}><br />No account?<br /> <Link to="/sign-up" className="signup-link">Sign Up</Link></p>
            </div>
            <h1>Sign in</h1>
            
            <GoogleLoginButton isCaptchaVerified={isCaptchaVerified} />
            
            <form onSubmit={handleSubmit}>
              <label>Enter your username or email address</label>
              <input type="text" placeholder="Username or email address" required />
              <br />
              <label>Enter your Password</label>
              <input type="password" placeholder="Password" required />
       
              <ReCAPTCHA
                sitekey="6LdeY2oqAAAAAGSi81scus4rs5Rz8WM8yeWcdfrZ"
                ref={recaptchaRef}
                onChange={handleCaptchaChange}
              />
              
              <Link to="/forgot-password" className="forgot-password">Forgotten Password?</Link>
              <button type="submit" className="sign-in-btn" disabled={!isCaptchaVerified}>Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
