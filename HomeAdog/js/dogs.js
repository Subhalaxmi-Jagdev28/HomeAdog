const session = JSON.parse(localStorage.getItem('homeadog_session') || 'null');
if (!session) location.href = 'index.html';

const $ = id => document.getElementById(id);
$('userName').textContent = session.name.split(' ')[0];
$('hello').textContent = session.email;
$('logout').onclick = () => { localStorage.removeItem('homeadog_session'); location.href = 'index.html'; };

// `path` is a dog.ceo breed path used to fetch a real photo.
const DOGS = [
  { id:1, name:'Buddy',   breed:'Labrador',         path:'labrador',         age:'2 yrs', size:'big',   trait:'Fetches everything, including your socks.' },
  { id:2, name:'Luna',    breed:'Siberian Husky',   path:'husky',            age:'3 yrs', size:'big',   trait:'Will sing you the song of her people.' },
  { id:3, name:'Biscuit', breed:'Beagle',           path:'beagle',           age:'1 yr',  size:'small', trait:'Nose first, questions later.' },
  { id:4, name:'Mochi',   breed:'Pug',              path:'pug',              age:'4 yrs', size:'small', trait:'Snores like a tiny tractor.' },
  { id:5, name:'Waffles', breed:'Corgi',            path:'corgi/cardigan',   age:'2 yrs', size:'small', trait:'Short legs, huge ambitions.' },
  { id:6, name:'Coco',    breed:'Poodle',           path:'poodle/standard',  age:'5 yrs', size:'big',   trait:'Smarter than your group chat.' },
  { id:7, name:'Hachi',   breed:'Shiba Inu',        path:'shiba',            age:'2 yrs', size:'small', trait:'Judges you silently, loves you loudly.' },
  { id:8, name:'Sunny',   breed:'Golden Retriever', path:'retriever/golden', age:'1 yr',  size:'big',   trait:'Has never met a stranger.' },
  { id:9, name:'Duke',    breed:'German Shepherd',  path:'germanshepherd',   age:'3 yrs', size:'big',   trait:'Loyal, brave, secretly a softie.' },
  { id:10,name:'Peanut',  breed:'Pomeranian',       path:'pomeranian',       age:'6 yrs', size:'small', trait:'A cloud with opinions.' },
  { id:11,name:'Frenchie',breed:'French Bulldog',   path:'bulldog/french',   age:'2 yrs', size:'small', trait:'Zoomies at 7 PM sharp.' },
  { id:12,name:'Kuma',    breed:'Akita',            path:'akita',            age:'4 yrs', size:'big',   trait:'Calm, fluffy, built like a bear.' },
];

const key = k => `homeadog_${k}_${session.email}`;
const load = k => JSON.parse(localStorage.getItem(key(k)) || '[]');
const save = (k, v) => localStorage.setItem(key(k), JSON.stringify(v));
let favs = load('favs'), adopted = load('adopted'), filter = 'all', query = '';
const photos = {};

async function photo(d) {
  if (photos[d.id]) return photos[d.id];
  try {
    const r = await fetch(`https://dog.ceo/api/breed/${d.path}/images/random`);
    return photos[d.id] = (await r.json()).message;
  } catch {
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" fill="#e6f4ff"/><text x="30" y="45" font-size="40">🐶</text></svg>');
  }
}

function confetti(x, y) {
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.textContent = ['🐾','🦴','❤️','⭐','🎉'][i % 5];
    c.style.left = x + 'px'; c.style.top = y + 'px';
    c.style.setProperty('--x', (Math.random() - .5) * 400 + 'px');
    c.style.setProperty('--y', (Math.random() - .8) * 400 + 'px');
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1200);
  }
}

function visible(d) {
  const q = query.toLowerCase();
  if (q && !(d.name + d.breed).toLowerCase().includes(q)) return false;
  if (filter === 'small' || filter === 'big') return d.size === filter;
  if (filter === 'fav') return favs.includes(d.id);
  if (filter === 'adopted') return adopted.includes(d.id);
  return true;
}

function render() {
  const list = DOGS.filter(visible);
  const grid = $('grid');
  if (!list.length) { grid.innerHTML = '<p class="empty">No dogs here yet. Try another filter 🐕</p>'; return; }
  grid.innerHTML = '';
  for (const d of list) {
    const el = document.createElement('article');
    el.className = 'dog';
    const isAdopted = adopted.includes(d.id);
    el.innerHTML = `
      ${isAdopted ? '<span class="badge">Yours 🏠</span>' : ''}
      <img alt="${d.name} the ${d.breed}" src="" title="Click for a new photo">
      <div class="info">
        <h3>${d.name}</h3>
        <p>${d.breed} · ${d.age}<br>${d.trait}</p>
        <div class="row">
          <button class="heart ${favs.includes(d.id) ? 'on' : ''}" aria-label="Favourite ${d.name}">♥</button>
          <button class="btn adopt ${isAdopted ? 'done' : ''}">${isAdopted ? 'Adopted!' : 'Adopt ' + d.name}</button>
        </div>
      </div>`;
    const img = el.querySelector('img');
    photo(d).then(u => img.src = u);
    img.onclick = async () => { delete photos[d.id]; img.src = await photo(d); };
    el.querySelector('.heart').onclick = e => {
      favs = favs.includes(d.id) ? favs.filter(i => i !== d.id) : [...favs, d.id];
      save('favs', favs);
      e.target.classList.toggle('on');
      if (e.target.classList.contains('on')) confetti(e.clientX, e.clientY);
    };
    el.querySelector('.adopt').onclick = e => {
      if (!adopted.includes(d.id)) {
        adopted = [...adopted, d.id]; save('adopted', adopted);
        confetti(e.clientX, e.clientY);
        setTimeout(render, 600);
      }
    };
    grid.appendChild(el);
  }
}

document.querySelectorAll('.chip').forEach(c => c.onclick = () => {
  filter = c.dataset.filter;
  document.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === c));
  render();
});
$('search').oninput = e => { query = e.target.value; render(); };
render();
