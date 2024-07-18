// src/Login.js
import React, { useState } from 'react';
import axios from 'axios';

// const API_BASE_URL = '';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      onLoginSuccess(response.data.isAdmin);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <h2>Login to IP Manager</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;


