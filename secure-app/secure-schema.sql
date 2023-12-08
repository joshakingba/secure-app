-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Store hashed passwords instead of plain text
    email TEXT NOT NULL
);

-- Create secure_todo_items table
CREATE TABLE IF NOT EXISTS secure_todo_items (
    id INTEGER PRIMARY KEY,
    task TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);