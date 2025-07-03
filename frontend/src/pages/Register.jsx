// src/pages/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/register',
        { username, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(res.data.msg || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #fdfbfb, #ebedee)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          padding: '2.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>📝 Register</h2>

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

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              background: '#28a745',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = '#1e7e34'}
            onMouseOut={(e) => e.target.style.background = '#28a745'}
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
