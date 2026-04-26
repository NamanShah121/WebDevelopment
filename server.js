const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to Database
const db = new sqlite3.Database('./colleges.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the colleges database.');
});

// API Endpoints

// Get all colleges with search and filtering
app.get('/api/colleges', (req, res) => {
    const { q, state, type, limit = 50 } = req.query;
    let sql = 'SELECT * FROM colleges WHERE 1=1';
    let params = [];

    if (q) {
        sql += ' AND (college_name LIKE ? OR courses LIKE ? OR city LIKE ?)';
        const search = `%${q}%`;
        params.push(search, search, search);
    }

    if (state) {
        sql += ' AND state = ?';
        params.push(state);
    }

    if (type) {
        sql += ' AND college_type = ?';
        params.push(type);
    }

    sql += ' LIMIT ?';
    params.push(parseInt(limit));

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single college by ID
app.get('/api/colleges/:id', (req, res) => {
    const sql = 'SELECT * FROM colleges WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '/')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
