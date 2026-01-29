// auth helpers for the frontend (drop into js/app.js)

const API_BASE = "http://localhost:8000"; // change for production

function saveToken(token){
  localStorage.setItem('streamly_token', token);
}

function getToken(){
  return localStorage.getItem('streamly_token');
}

function removeToken(){
  localStorage.removeItem('streamly_token');
}

// Simple wrapper to include Authorization header if token exists
async function authFetch(path, options = {}){
  const url = API_BASE + path;
  const token = getToken();
  options.headers = options.headers || {};
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  if(token){
    options.headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(url, options);
  // simple error handling for expired/invalid tokens
  if(res.status === 401){
    // logged out or token invalid
    removeToken();
    updateAuthUI(false);
  }
  return res;
}

// Login function: posts to /auth/login
async function loginUser(email, password){
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if(!res.ok){
    const err = await res.json().catch(()=>({detail: 'Login failed'}));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  saveToken(data.access_token);
  updateAuthUI(true);
  return data;
}

// Register function: posts to /auth/register
async function registerUser(email, password){
  const res = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if(!res.ok){
    const err = await res.json().catch(()=>({detail: 'Register failed'}));
    throw new Error(err.detail || 'Register failed');
  }
  const user = await res.json();
  // Optionally auto-login after register:
  await loginUser(email, password);
  return user;
}

function logout(){
  removeToken();
  updateAuthUI(false);
}

// Very small helper to decode JWT payload (unsafe: only for UI purposes)
function parseJwt (token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch(e){
    return null;
  }
}

// Example: update UI depending on login state (customize to your layout)
function updateAuthUI(isLoggedIn){
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  if(isLoggedIn){
    if(loginBtn) loginBtn.textContent = 'Logout';
    if(registerBtn) registerBtn.style.display = 'none';
    // optionally display user info
    const token = getToken();
    const payload = parseJwt(token);
    if(payload){
      console.log('Logged as user id:', payload.sub);
    }
    // change click action of loginBtn to logout
    if(loginBtn){
      loginBtn.onclick = () => {
        logout();
        alert('Logged out');
      };
    }
  } else {
    if(loginBtn) loginBtn.textContent = 'Login';
    if(registerBtn) registerBtn.style.display = '';
    if(loginBtn){
      loginBtn.onclick = async () => {
        // For demo: simple prompts. Replace with modal/form in production.
        const email = prompt('Email:');
        const pass = prompt('Password:');
        if(!email || !pass) return;
        try {
          await loginUser(email, pass);
          alert('Logged in!');
        } catch(err){
          alert('Login error: ' + err.message);
        }
      };
    }
    if(registerBtn){
      registerBtn.onclick = async () => {
        const email = prompt('Email to register:');
        const pass = prompt('Password:');
        if(!email || !pass) return;
        try {
          await registerUser(email, pass);
          alert('Registered & logged in!');
        } catch(err){
          alert('Register error: ' + err.message);
        }
      };
    }
  }
}

// initialize auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI(!!getToken());
});
async function requestPresign(filename, contentType){
  const res = await authFetch('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ filename, content_type: contentType })
  });
  if(!res.ok) throw new Error('Presign failed');
  return res.json();
}
