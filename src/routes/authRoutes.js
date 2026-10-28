const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { getLatestTicks } = require('../gateways/binanceWebSocket');

// Render Login
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle Login via Supabase Auth
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.render('login', { error: error.message });
    }

    // Set secure session cookie or token context if needed, then redirect
    res.redirect('/dashboard');
});

// Render Signup
router.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// Handle Signup via Supabase Auth
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.render('signup', { error: error.message });
    }

    res.render('login', { error: 'Registration successful! Please sign in with your credentials.' });
});

// Handle Logout
router.get('/logout', async (req, res) => {
    await supabase.auth.signOut();
    res.redirect('/login');
});

// Protected Dashboard Route
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { ticks: getLatestTicks() });
});

router.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = router;