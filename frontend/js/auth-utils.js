function protectRoute() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '../public/login.html';
    }
}

// Automatically check authentication when the page loads
document.addEventListener('DOMContentLoaded', protectRoute);
