const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const userDetails = document.getElementById('userDetails');
const nameElement = document.getElementById('name');
const emailElement = document.getElementById('email');
const avatarElement = document.getElementById('avatar');
const authForm = document.getElementById('authForm');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Handle Show Register Form
showRegister.addEventListener('click', () => {
    document.getElementById('registerHeader').style.display = 'block';
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    showRegister.style.display = 'none';
    showLogin.style.display = 'block';
});

showLogin.addEventListener('click', () => {
    document.getElementById('registerHeader').style.display = 'none';
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    showRegister.style.display = 'block';
    showLogin.style.display = 'none';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Login berhasil');
        authForm.style.display = 'none';
        getUserDetails();
    } else {
        alert('Login gagal: ' + data.errors[0].msg);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, passwordConfirm })
    });
    const data = await response.json();

    if (data.message) {
        alert('Register berhasil, silakan login');
        showLogin.click();
    } else {
        alert('Register gagal: ' + data.errors[0].msg);
    }
});

async function getUserDetails() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://localhost:3000/api/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();

    if (data.user) {
        nameElement.textContent = data.user.id;
        emailElement.textContent = data.user.email;
        avatarElement.src = data.user.picture || 'default-avatar.png';
        userDetails.style.display = 'block';
    }
}

window.onload = () => {
    if (localStorage.getItem('token')) {
        authForm.style.display = 'none';
        getUserDetails();
    }
};
