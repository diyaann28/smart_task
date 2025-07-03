// src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import loginImg from '../assets/login.jpg';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/login',
        { username, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        localStorage.setItem('logged', 'yes');
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      } else {
        setError(res.data.msg || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login Failed');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #ece9e6, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          maxWidth: 900,
          width: '100%',
          background: '#fff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        }}
      >
        {/* 🖼 Left image panel */}
        <div style={{ flex: 1, background: '#f9f9f9' }}>
          <img
            src={loginImg}
            alt="Login Illustration"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* 🧾 Right login form */}
        <div
          style={{
            flex: 1,
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>🔐 Login</h2>

          {error && (
            <div
              style={{
                background: '#ffe6e6',
                color: '#b10000',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#0056b3'}
              onMouseOut={(e) => e.target.style.background = '#007bff'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
