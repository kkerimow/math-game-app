
const API_URL = window.API_URL || 'http://localhost:5000';

async function handleSignUp(event) {
    event.preventDefault();

    const name = document.getElementById('name').value; // Username'i alın
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const userData = { username: name, email, password }; 

    try {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            alert('Sign Up successful!');
            openModal(true); 
        } else {
            const error = await response.json();
            alert(`Sign Up failed: ${error.error}`);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        alert('An error occurred. Please try again.');
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('signupBtn')) {
        const form = document.getElementById('register-form');
        form.addEventListener('submit', handleSignUp);
    }
});


// --------------------------

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Sending login request...');
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        console.log('Response received:', response);

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            if (data.token) {
                localStorage.setItem('token', data.token); 
                localStorage.setItem('username', data.username); 

                window.location.href = `index2.html?username=${data.username}`;
                console.log(data.username);

            } else {
                alert('No token received. Please try again.');
                console.log('Response not OK. Parsing error message...');
                const errorData = await response.json();
                console.log('Error details from server:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
        } else {
            alert(data.error || 'Login failed');
        }
        console.log('Parsed response data:', data);
    } catch (error) {
        console.error('An error occurred during login:', error.message || error);
        alert(`Something went wrong: ${error.message || 'Unknown error'}`);
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('loginBtn')) {
        const form = document.getElementById('login-form'); 
        if (form) {
            form.addEventListener('submit', handleLogin); 
        }
    }
});
