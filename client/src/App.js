import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

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
    const [filters, setFilters] = useState({
        machine: '',
        static_ip: '',
        description: '',
        assigned_to: ''
    });

    useEffect(() => {
        fetchIps();
    }, []);

    const fetchIps = async () => {
        try {
            const response = await axios.get(`/api/ips`);
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
            await axios.post(`/api/ips`, newIp, {
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
            await axios.put(`/api/ips/${id}`, ipToUpdate, {
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
            await axios.delete(`/api/ips/${id}`, {
                headers: { 'Authorization': localStorage.getItem('token') }
            });
            fetchIps();
        } catch (error) {
            console.error('Error deleting IP:', error);
            alert('Failed to delete IP. Admin access required.');
        }
    };

    const filterIps = (ips) => {
        return ips.filter(ip => {
            return (
                ip.machine.toLowerCase().includes(filters.machine.toLowerCase()) &&
                ip.static_ip.toLowerCase().includes(filters.static_ip.toLowerCase()) &&
                ip.description.toLowerCase().includes(filters.description.toLowerCase()) &&
                ip.assigned_to.toLowerCase().includes(filters.assigned_to.toLowerCase())
            );
        });
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
                        <input name="machine" value={newIp.machine} onChange={(e) => handleInputChange(e)} placeholder="WF-600 ID" required/>
                        <input name="static_ip" value={newIp.static_ip} onChange={(e) => handleInputChange(e)} placeholder="Location" />
                        <input name="description" value={newIp.description} onChange={(e) => handleInputChange(e)} placeholder="Description" />
                        <input name="assigned_to" value={newIp.assigned_to} onChange={(e) => handleInputChange(e)} placeholder="Assigned To" />
                        <button type="submit">Add IP</button>
                    </form>
                )}
                <div className="table-container">
                    <div className="filters">
                        <input
                            placeholder="Filter WF-600 ID"
                            value={filters.machine}
                            onChange={(e) => setFilters({ ...filters, machine: e.target.value })}
                        />
                        <input
                            placeholder="Filter Location"
                            value={filters.static_ip}
                            onChange={(e) => setFilters({ ...filters, static_ip: e.target.value })}
                        />
                        <input
                            placeholder="Filter Description"
                            value={filters.description}
                            onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                        />
                        <input
                            placeholder="Filter Assigned To"
                            value={filters.assigned_to}
                            onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
                        />
                        {isAdmin && <div className="filter-placeholder"></div>}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>WF-600 ID</th>
                                <th>Location</th>
                                <th>Description</th>
                                <th>Assigned To</th>
                                <th>Last Updated</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filterIps(ips).map((ip, index) => (
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
                </div>
            </main>
        </div>
    );
}

export default App;