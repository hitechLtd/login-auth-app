const express = require('express');
const session = require('express-session');
const path = require('path');
const { addUser, verifyUser } = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-super-secret-key-here', // Change this in production!
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true with HTTPS
}));

// Set EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route 1: GET / - Show login form
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/home'); // Redirect if already logged in
  }
  res.render('login', { error: null }); // Show login page if not logged in
});

// Route 2: POST /login - Validate credentials
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', { error: 'Please enter both fields!' });
  }
  verifyUser(username, password, (isValid) => {
    if (isValid) {
      req.session.user = { username }; // Set session on success
      return res.redirect('/home'); // Redirect to home
    } else {
      res.render('login', { error: 'Invalid username or password!' });
    }
  });
});

// Route 3: GET /home - Protected dashboard
app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); // Redirect to login if not logged in
  }
  res.render('home', { username: req.session.user.username }); // Show home if logged in
});

// Route 4: GET /logout - End session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Logout error!');
    res.redirect('/');
  });
});

// Route 5: GET /register - Show registration form
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Route 6: POST /register - Add new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('register', { error: 'Please enter both fields!' });
  }
  addUser(username, password, (err, msg) => {
    if (err) {
      return res.render('register', { error: err.message });
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});