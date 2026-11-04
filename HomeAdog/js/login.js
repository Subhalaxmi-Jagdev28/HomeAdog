// Demo auth: users live in localStorage. For production, move this to a real backend.
const $ = id => document.getElementById(id);
let mode = 'signup';

if (localStorage.getItem('homeadog_session')) location.href = 'home.html';

async function loadDog() {
  try {
    const r = await fetch('https://dog.ceo/api/breeds/image/random');
    $('heroDog').src = (await r.json()).message;
  } catch {
    $('heroDog').src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="70">🐶</text></svg>');
  }
}
loadDog();
$('newDog').onclick = loadDog;
setInterval(() => {
  const p = document.createElement('span');
  p.className = 'paw'; p.textContent = '🐾';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.animationDuration = 8 + Math.random() * 6 + 's';
  $('paws').appendChild(p);
  setTimeout(() => p.remove(), 14000);
}, 900);

document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  mode = t.dataset.mode;
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
  $('nameRow').style.display = mode === 'signup' ? 'grid' : 'none';
  $('submitBtn').textContent = mode === 'signup' ? 'Create my account' : 'Log in';
  $('error').textContent = '';
});

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function fail(msg) {
  $('error').textContent = msg;
  $('authForm').classList.remove('shake'); void $('authForm').offsetWidth;
  $('authForm').classList.add('shake');
}

$('authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('name').value.trim(), email = $('email').value.trim().toLowerCase(), pw = $('password').value;
  if (mode === 'signup' && name.length < 2) return fail('Please tell us your name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Enter a valid email, like sam@example.com.');
  if (pw.length < 6) return fail('Password needs at least 6 characters.');

  const users = JSON.parse(localStorage.getItem('homeadog_users') || '{}');
  const pwHash = await hash(pw);

  if (mode === 'signup') {
    if (users[email]) return fail('That email already has an account. Try Log in.');
    users[email] = { name, pwHash };
    localStorage.setItem('homeadog_users', JSON.stringify(users));
  } else if (!users[email] || users[email].pwHash !== pwHash) {
    return fail('Email or password is wrong.');
  }
  localStorage.setItem('homeadog_session', JSON.stringify({ email, name: users[email].name }));
  location.href = 'home.html';
});
