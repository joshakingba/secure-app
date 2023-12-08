const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// SQLite database connection
const db = new sqlite3.Database('your_database.db');

// Set up the database schema
const setupSchemaQuery = fs.readFileSync('insecure-schema.sql', 'utf8');
db.exec(setupSchemaQuery, (err) => {
    if (err) {
        console.error('Error setting up database schema:', err.message);
    } else {
        console.log('Database schema set up successfully.');
    }
});

// Registration page route
app.get('/insecure-register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'insecure-register.html'));
});

// Registration form submission
app.post('/insecure-register', (req, res) => {
    const { username, password, email } = req.body;

    // Insecure: Insert user data without proper validation or hashing
    const insertUserQuery = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    db.run(insertUserQuery, [username, password, email], (err) => {
        if (err) {
            console.error('Error registering user:', err.message);
            return res.status(500).send('Error registering user.');
        }

        res.send('User registered successfully!');
    });
});

// Login page route
app.get('/insecure-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'insecure-login.html'));
});

// Login form submission
app.post('/insecure-login', (req, res) => {
    const { username, password } = req.body;

    // Insecure: Authenticate user without password hashing or validation
    const selectUserQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(selectUserQuery, [username, password], (err, row) => {
        if (err || !row) {
            return res.status(401).send('Invalid username or password.');
        }

        // Redirect to the insecure to-do list page
        res.redirect('/insecure-todo');
    });
});

// Insecure to-do list page route
app.get('/insecure-todo', (req, res) => {
    // Insecure: Fetch all tasks without proper validation
    const selectTasksQuery = 'SELECT * FROM insecure_todo_items';
    db.all(selectTasksQuery, (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching tasks.');
        }

        res.render('insecure-todo', { tasks: rows });
    });
});

// Add task form submission
app.post('/insecure-todo', (req, res) => {
    const { task } = req.body;

    // For demonstration purposes, let's assume you have a user ID stored in req.user
    const userId = req.user ? req.user.id : 1;

    // Insecure: Insert task without proper validation
    const insertTaskQuery = 'INSERT INTO insecure_todo_items (task, user_id) VALUES (?, ?)';
    db.run(insertTaskQuery, [task, userId], (err) => {
        if (err) {
            console.error('Error adding task:', err.message);
            return res.status(500).send('Error adding task.');
        }

        res.redirect('/insecure-todo');
    });
});

// Delete task route
app.get('/delete-task/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    // For demonstration purposes, let's assume you have a user ID stored in req.user
    const userId = req.user ? req.user.id : 1;

    // Check if taskId is a valid integer
    if (isNaN(taskId) || taskId <= 0) {
        return res.status(400).send('Invalid task ID.');
    }

    // Insecure: Delete task without proper validation
    const deleteTaskQuery = 'DELETE FROM insecure_todo_items WHERE id = ? AND user_id = ?';
    db.run(deleteTaskQuery, [taskId, userId], (err) => {
        if (err) {
            console.error('Error deleting task:', err.message);
            return res.status(500).send('Error deleting task.');
        }

        res.redirect('/insecure-todo');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
