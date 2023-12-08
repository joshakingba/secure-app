-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL
);

-- Create insecure_todo_items table (assuming it's needed)
CREATE TABLE IF NOT EXISTS insecure_todo_items (
    id INTEGER PRIMARY KEY,
    task TEXT NOT NULL,
    user_id INTEGER NOT NULL
);

-- Add user_id field to insecure_todo_items if it doesn't exist
PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- Check if the column exists before adding it
CREATE TABLE temp_insecure_todo_items AS SELECT * FROM insecure_todo_items;

-- Drop the existing table
DROP TABLE insecure_todo_items;

-- Recreate the table with the new schema
CREATE TABLE insecure_todo_items (
    id INTEGER PRIMARY KEY,
    task TEXT NOT NULL,
    user_id INTEGER NOT NULL
);

-- Copy the data back to the table
INSERT INTO insecure_todo_items SELECT * FROM temp_insecure_todo_items;

-- Drop the temporary table
DROP TABLE temp_insecure_todo_items;

COMMIT;

PRAGMA foreign_keys=on;