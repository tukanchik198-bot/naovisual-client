(function () {
  var USERS_KEY = 'nao_users';
  var SESSION_KEY = 'nao_session';

  window.API_BASE_URL = (window.location.origin || '') + '/api/v1';

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function hash(salt, pw) {
    var s = salt + ':' + pw;
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16);
  }
  function getValueByIds() {
    for (var i = 0; i < arguments.length; i++) {
      var el = document.getElementById(arguments[i]);
      if (el) return el.value;
    }
    return '';
  }
  function currentLogin() {
    return localStorage.getItem(SESSION_KEY) || '';
  }

  window.verifyToken = async function () { return !!currentLogin(); };
  window.checkAuth = async function () {};
  window.apiRequest = async function () { throw new Error('offline'); };
  window.setAuthToken = function (t) { if (t) localStorage.setItem(SESSION_KEY, t); };

  var hCaptchaToken = null;
  window.onCaptchaVerify = function (t) { hCaptchaToken = t; };
  window.onCaptchaExpired = function () { hCaptchaToken = null; };

  window.handleRegistration = function (event) {
    if (event && event.preventDefault) event.preventDefault();

    var email = getValueByIds('email', 'mail').trim();
    var login = getValueByIds('login', 'username', 'user').trim();
    var password = getValueByIds('pass', 'password', 'pwd');

    var termsEl = document.getElementById('terms');
    if (termsEl && !termsEl.checked) { alert('Подтвердите соглашение с правилами.'); return; }
    if (!login || !email || !password) { alert('Заполните все поля.'); return; }
    if (password.length < 6) { alert('Пароль должен содержать минимум 6 символов.'); return; }

    var users = loadUsers();
    var lk = login.toLowerCase(), ek = email.toLowerCase();
    for (var k in users) {
      if (k === lk) { alert('Такой логин уже занят.'); return; }
      if ((users[k].email || '').toLowerCase() === ek) { alert('Эта почта уже используется.'); return; }
    }

    var salt = Math.random().toString(36).slice(2, 10);
    users[lk] = { login: login, email: email, salt: salt, hash: hash(salt, password), created: Date.now() };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, login);
    alert('Аккаунт создан! Добро пожаловать в NaoVisuals.');
    window.location.href = 'index.html';
  };

  window.handleSignIn = async function (event) {
    if (event && event.preventDefault) event.preventDefault();

    var errorEl = document.getElementById('signinError');
    if (errorEl) errorEl.textContent = '';

    var login = getValueByIds('login', 'username', 'user').trim();
    var password = getValueByIds('pass', 'password', 'pwd');

    var users = loadUsers();
    var key = login.toLowerCase();
    var user = users[key];
    if (!user && login.indexOf('@') !== -1) {
      for (var k in users) { if ((users[k].email || '').toLowerCase() === key) { user = users[k]; break; } }
    }

    if (!user || user.hash !== hash(user.salt, password)) {
      var msg = 'Неверный логин или пароль';
      if (errorEl) { errorEl.textContent = msg; errorEl.style.color = '#f44336'; } else { alert(msg); }
      return;
    }

    localStorage.setItem(SESSION_KEY, user.login);
    window.location.href = 'index.html';
  };

  window.naoLogout = function () {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  };
})();
