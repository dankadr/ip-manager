const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const SECRET_KEY = 'your_secret_key'; // Replace with a secure secret key

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./ipmanager.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the IP manager database.');
});

// Create IP entries table
db.run(`CREATE TABLE IF NOT EXISTS ip_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  static_ip TEXT NOT NULL,
  machine TEXT,
  description TEXT,
  assigned_to TEXT,
  last_updated TEXT
)`);

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT 0
)`);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    req.isAdmin = false;
    return next();
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      req.isAdmin = false;
      return next();
    }
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    next();
  });
};

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result) return res.status(400).json({ error: 'Incorrect password' });

      const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token, isAdmin: user.is_admin });
    });
  });
});

// Get all IP entries (public access)
app.get('/api/ips', (req, res) => {
  db.all("SELECT * FROM ip_entries", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

// Add new IP entry (admin only)
app.post('/api/ips', verifyToken, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  const { static_ip, machine, description, assigned_to } = req.body;
  const last_updated = new Date().toISOString();

  db.run(`INSERT INTO ip_entries (static_ip, machine, description, assigned_to, last_updated) 
          VALUES (?, ?, ?, ?, ?)`, 
          [static_ip, machine, description, assigned_to, last_updated], 
          function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      message: "success",
      data: { id: this.lastID, ...req.body, last_updated }
    });
  });
});

// Delete an IP entry (admin only)
app.delete('/api/ips/:id', verifyToken, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  db.run('DELETE FROM ip_entries WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "deleted", changes: this.changes });
  });
});

// Update an IP entry (admin only)
app.put('/api/ips/:id', verifyToken, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  const { static_ip, machine, description, assigned_to } = req.body;
  const last_updated = new Date().toISOString();

  db.run(`UPDATE ip_entries SET
          static_ip = ?,
          machine = ?,
          description = ?,
          assigned_to = ?,
          last_updated = ?
          WHERE id = ?`,
          [static_ip, machine, description, assigned_to, last_updated, req.params.id],
          function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      message: "success",
      data: { id: req.params.id, ...req.body, last_updated }
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Helper function to add a user (you can use this to add an admin user)
function addUser(username, password, isAdmin) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) console.error(err);
      db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', [username, hash, isAdmin ? 1 : 0], (err) => {
        if (err) console.error(err);
        else console.log(`User ${username} added successfully`);
      });
    });
  }

// Helper function to add a user (you can use this to add an admin user)
//addUser('admin','adminpassword',true)