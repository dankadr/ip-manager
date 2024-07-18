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
  const [editingId, setEditingId] = useState(null);
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

  const handleInputChange = (e, id) => {
    const { name, value } = e.target;
    if (id) {
      setIps(ips.map(ip => ip.id === id ? { ...ip, [name]: value } : ip));
    } else {
      setNewIp({ ...newIp, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/ips`, newIp, {
        headers: { 'Authorization': localStorage.getItem('token') }
      });
      setNewIp({
        static_ip: '',
        machine: '',
        description: '',
        assigned_to: ''
      });
      fetchIps();
    } catch (error) {
      console.error('Error saving IP:', error);
      alert('Failed to save IP. Admin access required.');
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleUpdate = async (id) => {
    try {
      const ipToUpdate = ips.find(ip => ip.id === id);
      await axios.put(`${API_BASE_URL}/api/ips/${id}`, ipToUpdate, {
        headers: { 'Authorization': localStorage.getItem('token') }
      });
      setEditingId(null);
      fetchIps();
    } catch (error) {
      console.error('Error updating IP:', error);
      alert('Failed to update IP. Admin access required.');
    }
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
            <input name="machine" value={newIp.machine} onChange={(e) => handleInputChange(e)} placeholder="Machine" />
            <input name="static_ip" value={newIp.static_ip} onChange={(e) => handleInputChange(e)} placeholder="Static IP" required />
            <input name="description" value={newIp.description} onChange={(e) => handleInputChange(e)} placeholder="Description" />
            <input name="assigned_to" value={newIp.assigned_to} onChange={(e) => handleInputChange(e)} placeholder="Assigned To" />
            <button type="submit">Add IP</button>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Static IP</th>
              <th>Description</th>
              <th>Assigned To</th>
              <th>Last Updated</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {ips.map((ip, index) => (
              <tr key={ip.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  {editingId === ip.id ? (
                    <input name="machine" value={ip.machine} onChange={(e) => handleInputChange(e, ip.id)} />
                  ) : (
                    ip.machine
                  )}
                </td>
                <td>
                  {editingId === ip.id ? (
                    <input name="static_ip" value={ip.static_ip} onChange={(e) => handleInputChange(e, ip.id)} />
                  ) : (
                    ip.static_ip
                  )}
                </td>
                <td>
                  {editingId === ip.id ? (
                    <input name="description" value={ip.description} onChange={(e) => handleInputChange(e, ip.id)} />
                  ) : (
                    ip.description
                  )}
                </td>
                <td>
                  {editingId === ip.id ? (
                    <input name="assigned_to" value={ip.assigned_to} onChange={(e) => handleInputChange(e, ip.id)} />
                  ) : (
                    ip.assigned_to
                  )}
                </td>
                <td>{new Date(ip.last_updated).toLocaleString()}</td>
                {isAdmin && (
                  <td>
                    {editingId === ip.id ? (
                      <button onClick={() => handleUpdate(ip.id)} className="edit-btn">Save</button>
                    ) : (
                      <button onClick={() => handleEdit(ip.id)} className="edit-btn">Edit</button>
                    )}
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