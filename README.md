# Secure To-Do List Web Application

This is a simple secure to-do list web application with user registration, login, and task management functionality. The application is built using Node.js, Express, SQLite3, and incorporates various security features.

## Setup

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

- Node.js: [Download Node.js](https://nodejs.org/)
- npm: Included with Node.js

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/secure-app-prog.git
cd secure-app-prog
```
2. Install dependencies:

```bash
npm install
```


## Features

### Insecure Version

```bash
cd secure-app-prog/insecure-app
node app.js
```
On browser go to http://localhost:3000/insecure-login

User registration without password hashing
Login without secure password verification
To-do list with basic functionality

### Secure Version

```bash
cd secure-app-prog/secure-app
node secure-app.js
```
On browser go to http://localhost:3001/secure-login

Secure user registration with bcrypt password hashing
Login with secure password verification
To-do list with CSRF protection and secure task management
Security headers implemented using the Helmet middleware