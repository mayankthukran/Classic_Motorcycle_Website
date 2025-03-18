// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupName = document.getElementById('signup-name');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirmPassword = document.getElementById('signup-confirm-password');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const logoutBtn = document.getElementById('logout-btn');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    // Validate inputs
    if (!email || !password) {
        showError(loginError, 'Please enter both email and password');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching email
    const user = users.find(user => user.email === email);
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
        showError(loginError, 'Invalid email or password');
        return;
    }
    
    // Login successful
    const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    
    // Store current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Close modal
    closeModal(document.getElementById('login-modal'));
    
    // Update UI based on auth status
    checkAuthStatus();
    
    // Redirect to home if needed
    window.location.hash = '#';
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    const confirmPassword = signupConfirmPassword.value.trim();
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        showError(signupError, 'Please fill in all fields');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
        showError(signupError, 'Please enter a valid email address');
        return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        showError(signupError, 'Passwords do not match');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showError(signupError, 'Email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name,
        email,
        password
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login the new user
    const currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Close modal
    closeModal(document.getElementById('signup-modal'));
    
    // Update UI based on auth status
    checkAuthStatus();
    
    // Redirect to home
    window.location.hash = '#';
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Update UI based on auth status
    checkAuthStatus();
    
    // Redirect to home
    window.location.hash = '#';
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    
    // Hide error after 3 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}