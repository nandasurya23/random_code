const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const port = 3000;
const userCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [];

const JWT_SECRET = 'your_jwt_secret_key';

app.get('/api/randomuser', async (req, res) => {
    const { gender, name, occupation } = req.query;
    const cacheKey = `${gender}-${name || 'any'}-${occupation || 'any'}`;

    const cachedData = userCache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const url = gender || name || occupation
            ? `https://randomuser.me/api/?gender=${gender}&name=${name}&occupation=${occupation}`
            : 'https://randomuser.me/api/';
        const response = await axios.get(url);
        const userData = response.data.results[0];

        userCache.set(cacheKey, userData);
        res.json(userData);
    } catch (error) {
        res.status(500).send('Error fetching data from API');
    }
});

app.post('/api/register', [
    body('username').isLength({ min: 5 }).withMessage('Username harus lebih dari 5 karakter'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password harus lebih dari 6 karakter'),
    body('passwordConfirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password dan konfirmasi password tidak cocok');
        }
        return true;
    })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email sudah terdaftar' }] });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    users.push({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User berhasil terdaftar' });
});

app.post('/api/login', [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password tidak valid')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User tidak ditemukan' }] });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Password salah' }] });
    }

    const token = jwt.sign({ id: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login sukses', token });
});

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ msg: 'Akses ditolak, token tidak ditemukan' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token tidak valid' });
    }
};

app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Anda mengakses halaman yang dilindungi', user: req.user });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
