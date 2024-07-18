import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [ips, setIps] = useState([]);
  const [newIp, setNewIp] = useState({
    static_ip: '',
    machine: '',
    description: '',
    assigned_to: ''
  });
  const [editingIp, setEditingIp] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);

  useEffect(() => {
    fetchIps();
  }, []);

  const fetchIps = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ips`);
      setIps(response.data);
    } catch (error) {
      console.error('Error fetching IPs:', error);
    }
  };

  const handleLoginSuccess = (adminStatus) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    setShowLoginPage(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingIp) {
      setEditingIp({ ...editingIp, [name]: value });
    } else {
      setNewIp({ ...newIp, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIp) {
        await axios.put(`${API_BASE_URL}/api/ips/${editingIp.id}`, editingIp, {
          headers: { 'Authorization': localStorage.getItem('token') }
        });
        setEditingIp(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/ips`, newIp, {
          headers: { 'Authorization': localStorage.getItem('token') }
        });
        setNewIp({
          static_ip: '',
          machine: '',
          description: '',
          assigned_to: ''
        });
      }
      fetchIps();
    } catch (error) {
      console.error('Error saving IP:', error);
      alert('Failed to save IP. Admin access required.');
    }
  };

  const handleEdit = (ip) => {
    setEditingIp(ip);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/ips/${id}`, {
        headers: { 'Authorization': localStorage.getItem('token') }
      });
      fetchIps();
    } catch (error) {
      console.error('Error deleting IP:', error);
      alert('Failed to delete IP. Admin access required.');
    }
  };

  if (showLoginPage) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header>
        <h1>IP Manager</h1>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={() => setShowLoginPage(true)}>Login</button>
          )}
        </div>
      </header>
      <main>
        {isAdmin && (
          <form onSubmit={handleSubmit} className="ip-form">
            <input name="static_ip" value={editingIp ? editingIp.static_ip : newIp.static_ip} onChange={handleInputChange} placeholder="Static IP" required />
            <input name="machine" value={editingIp ? editingIp.machine : newIp.machine} onChange={handleInputChange} placeholder="Machine" />
            <input name="description" value={editingIp ? editingIp.description : newIp.description} onChange={handleInputChange} placeholder="Description" />
            <input name="assigned_to" value={editingIp ? editingIp.assigned_to : newIp.assigned_to} onChange={handleInputChange} placeholder="Assigned To" />
            <button type="submit">{editingIp ? 'Update IP' : 'Add IP'}</button>
            {editingIp && <button type="button" onClick={() => setEditingIp(null)}>Cancel</button>}
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Static IP</th>
              <th>Machine</th>
              <th>Description</th>
              <th>Assigned To</th>
              <th>Last Updated</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {ips.map((ip, index) => (
              <tr key={ip.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{ip.static_ip}</td>
                <td>{ip.machine}</td>
                <td>{ip.description}</td>
                <td>{ip.assigned_to}</td>
                <td>{new Date(ip.last_updated).toLocaleString()}</td>
                {isAdmin && (
                  <td>
                    <button onClick={() => handleEdit(ip)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(ip.id)} className="delete-btn">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;