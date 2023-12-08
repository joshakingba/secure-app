const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true, maxAge: 60 * 60 * 1000 }, // Example settings, adjust as needed
  })
);

// Set up helmet middleware for security headers
app.use(helmet());

// Set up logging using morgan middleware
app.use(morgan('combined'));

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// SQLite database connection
const db = new sqlite3.Database('your_secure_database.db');

// Set up the database schema
const setupSchemaQuery = fs.readFileSync('secure-schema.sql', 'utf8');
db.exec(setupSchemaQuery, (err) => {
    if (err) {
        console.error('Error setting up database schema:', err.message);
    } else {
        console.log('Database schema set up successfully.');
    }
});

// Add this middleware to log errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Registration page route
app.get('/secure-register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'secure-register.html'));
});

// Registration form submission
app.post('/secure-register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Secure: Use bcrypt to hash passwords
        const hashedPassword = await bcrypt.hash(password, 10);

        // Secure: Use parameterized queries to prevent SQL injection
        const insertUserQuery = 'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)';
        db.run(insertUserQuery, [username, hashedPassword, email], (err) => {
            if (err) {
                console.error('Error registering user:', err.message);
                return res.status(500).send('Error registering user.');
            }

            res.send('User registered successfully!');
        });
    } catch (error) {
        console.error('Error hashing password:', error.message);
        res.status(500).send('Error registering user.');
    }
});

// Login page route
app.get('/secure-login', (req, res) => {
    res.render('secure-login');
});

// Login form submission
app.post('/secure-login', async (req, res) => {
    const { username, password } = req.body;

    // Secure: Use parameterized queries to prevent SQL injection
    const selectUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.get(selectUserQuery, [username], async (err, row) => {
        if (err || !row) {
            return res.status(401).send('Invalid username or password.');
        }

        try {
            // Secure: Use bcrypt to verify passwords
            const passwordMatch = await bcrypt.compare(password, row.password_hash);

            if (passwordMatch) {
                // Secure: Store user information in the session
                req.session.user = { id: row.id, username: row.username };

                // Redirect to the secure to-do list page
                res.redirect('/secure-todo');
            } else {
                res.status(401).send('Invalid username or password.');
            }
        } catch (error) {
            console.error('Error comparing passwords:', error.message);
            res.status(500).send('Error logging in.');
        }
    });
});

// Secure to-do list page route
app.get('/secure-todo', (req, res) => {
    // Secure: Fetch tasks only for the authenticated user
    const userId = req.session.user ? req.session.user.id : 0;
    const selectTasksQuery = 'SELECT * FROM secure_todo_items WHERE user_id = ?';
    db.all(selectTasksQuery, [userId], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching tasks.');
        }

        res.render('secure-todo', { tasks: rows });
    });
});

// Add task form submission
app.post('/secure-todo', (req, res) => {
    try {
        const { task } = req.body;

        // Secure: For demonstration purposes, use the user ID stored in req.session.user
        const userId = req.session.user ? req.session.user.id : 1;

        // Secure: Use parameterized queries to prevent SQL injection
        const insertTaskQuery = 'INSERT INTO secure_todo_items (task, user_id) VALUES (?, ?)';
        db.run(insertTaskQuery, [task, userId], (err) => {
            if (err) {
                console.error('Error adding task:', err.message);
                return res.status(500).send('Error adding task.');
            }

            res.redirect('/secure-todo');
        });
    } catch (error) {
        console.error('Error processing task submission:', error.message);
        res.status(500).send('Error processing task submission.');
    }
});

// Delete task route
app.get('/secure-delete-task/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    // Secure: For demonstration purposes, use the user ID stored in req.session.user
    const userId = req.session.user ? req.session.user.id : 1;

    // Check if taskId is a valid integer
    if (isNaN(taskId) || taskId <= 0) {
        return res.status(400).send('Invalid task ID.');
    }

    // Secure: Use parameterized queries to prevent SQL injection
    const deleteTaskQuery = 'DELETE FROM secure_todo_items WHERE id = ? AND user_id = ?';
    db.run(deleteTaskQuery, [taskId, userId], (err) => {
        if (err) {
            console.error('Error deleting task:', err.message);
            return res.status(500).send('Error deleting task.');
        }

        res.redirect('/secure-todo');
    });
});


app.post('/logout', (req, res) => {
    // Clear the session data to log out the user
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err.message);
            return res.status(500).send('Error logging out.');
        }

        // Redirect to the login page after successful logout
        res.redirect('/secure-login');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Secure ToDo app listening at http://localhost:${port}`);
});
