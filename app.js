const DEFAULT_USER = {
  name: '', email: '', password: '', points: 0, water: 0, co2: 0,
  clothesAvoided: 0, money: 0, closet: [], completed: [], redeemed: []
};

const challenges = [
  { id:'c1', icon:'👕', title:'24 horas sin comprar ropa', points:50, water:2700, co2:2, clothes:1, money:60, reward:'Descuento en comida rápida' },
  { id:'c2', icon:'♻️', title:'Dona o intercambia una prenda', points:120, water:5400, co2:4, clothes:2, money:100, reward:'2x1 en cine o concierto' },
  { id:'c3', icon:'📍', title:'Visita una tienda de segunda mano', points:80, water:2700, co2:2, clothes:1, money:50, reward:'Cupón para cafetería o sorteo', stores:true },
  { id:'c4', icon:'✨', title:'Crea 3 outfits con ropa que ya tienes', points:70, water:2000, co2:1, clothes:1, money:40, reward:'Insignia ReWear' }
];

const rewards = [
  { id:'r1', icon:'🍔', title:'15% descuento en comida rápida', cost:700, desc:'Beneficio para usar con marcas aliadas.' },
  { id:'r2', icon:'🎵', title:'Sorteo para conciertos', cost:3000, desc:'Participa por entradas a eventos juveniles.' },
  { id:'r3', icon:'🎬', title:'2x1 en cine', cost:1000, desc:'Canjea una promoción para disfrutar con alguien.' },
  { id:'r4', icon:'☕', title:'Cupón para cafetería', cost:500, desc:'Premio pequeño para seguir motivándote.' }
];

const stores = [
  { name:'Retro Market', zone:'Lima', district:'Miraflores', rating:'4.9', desc:'Ropa vintage, casacas, polos y accesorios.', query:'Retro Market Miraflores Lima' },
  { name:'Feria Vintage Barranco', zone:'Lima', district:'Barranco', rating:'4.8', desc:'Prendas de segunda mano y accesorios alternativos.', query:'Feria Vintage Barranco Lima' },
  { name:'Feria San Miguel Circular', zone:'Lima', district:'San Miguel', rating:'4.7', desc:'Ferias sostenibles y opciones para estudiantes.', query:'feria ropa segunda mano San Miguel Lima' },
  { name:'Callao Circular', zone:'Callao', district:'Callao Monumental', rating:'4.7', desc:'Opciones de ferias, intercambio y moda circular.', query:'tiendas segunda mano Callao Monumental' },
  { name:'Bellavista Vintage', zone:'Callao', district:'Bellavista', rating:'4.6', desc:'Alternativas de ropa usada y accesorios.', query:'ropa segunda mano Bellavista Callao' }
];

let currentUser = null;

function getUsers(){ return JSON.parse(localStorage.getItem('rewear_users') || '[]'); }
function saveUsers(users){ localStorage.setItem('rewear_users', JSON.stringify(users)); }
function saveCurrent(){ localStorage.setItem('rewear_current', JSON.stringify(currentUser)); }
function loadCurrent(){ currentUser = JSON.parse(localStorage.getItem('rewear_current') || 'null'); }

function updateStoredUser(){
  const users = getUsers();
  const i = users.findIndex(u => u.email === currentUser.email);
  if(i >= 0) users[i] = currentUser;
  saveUsers(users);
  saveCurrent();
}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const nav = document.getElementById('bottomNav');
  if(['home','closet','challenges','impact','rewards','stores','profile'].includes(id)) nav.classList.remove('hidden');
  else nav.classList.add('hidden');
  if(currentUser) refreshUI();
  window.scrollTo(0,0);
}

function register(){
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const password = document.getElementById('registerPassword').value.trim();
  if(!name || !email || !password) return toast('Completa todos los campos');
  const users = getUsers();
  if(users.some(u => u.email === email)) return toast('Ese correo ya existe');
  currentUser = {...DEFAULT_USER, name, email, password, points:100};
  users.push(currentUser); saveUsers(users); saveCurrent();
  toast('Cuenta creada: +100 Spark Points ✨');
  showScreen('home');
}

function login(){
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();
  const user = getUsers().find(u => u.email === email && u.password === password);
  if(!user) return toast('Correo o contraseña incorrectos');
  currentUser = user; saveCurrent(); toast(`Bienvenida, ${user.name} 🌿`); showScreen('home');
}

function logout(){ localStorage.removeItem('rewear_current'); currentUser=null; showScreen('welcome'); }

function levelName(points){
  if(points >= 5000) return 'Eco Master';
  if(points >= 1500) return 'Eco Guardian';
  if(points >= 700) return 'Eco Explorer';
  return 'Eco Rookie';
}

function refreshUI(){
  const u = currentUser;
  document.getElementById('homeName').textContent = `Hola, ${u.name} 👋`;
  document.getElementById('homePoints').textContent = u.points;
  document.getElementById('homeLevel').textContent = `Nivel: ${levelName(u.points)}`;
  document.getElementById('homeProgress').value = Math.min(u.points, 500);
  document.getElementById('homeWater').textContent = `${u.water} L`;
  document.getElementById('homeCo2').textContent = `${u.co2} kg`;
  document.getElementById('homeClothes').textContent = u.clothesAvoided;
  document.getElementById('homeMoney').textContent = `S/. ${u.money}`;
  document.getElementById('impactPageWater').textContent = `${u.water} L`;
  document.getElementById('impactPageCo2').textContent = `${u.co2} kg`;
  document.getElementById('impactPageClothes').textContent = u.clothesAvoided;
  document.getElementById('impactPageMoney').textContent = `S/. ${u.money}`;
  document.getElementById('rewardPoints').textContent = u.points;
  document.getElementById('profileName').textContent = u.name;
  document.getElementById('profileLevel').textContent = levelName(u.points);
  document.getElementById('profilePoints').textContent = `${u.points} Spark Points`;
  document.getElementById('achievements').innerHTML = achievements().join('<br>');
  renderChallenges(); renderRewards(); renderCloset();
}

function completeDailyChallenge(){
  if(currentUser.completed.includes('daily')) return toast('Ya completaste el reto diario');
  addProgress(50,2700,2,1,60,'daily');
  document.getElementById('dailyBtn').textContent='Reto completado ✅';
  document.getElementById('dailyBtn').disabled=true;
}

function completeChallenge(id){
  const c = challenges.find(x => x.id === id);
  if(currentUser.completed.includes(id)) return toast('Ya completaste este reto');
  addProgress(c.points,c.water,c.co2,c.clothes,c.money,id);
}

function addProgress(points,water,co2,clothes,money,id){
  currentUser.points += points;
  currentUser.water += water;
  currentUser.co2 += co2;
  currentUser.clothesAvoided += clothes;
  currentUser.money += money;
  currentUser.completed.push(id);
  updateStoredUser(); refreshUI(); toast(`¡Ganaste ${points} Spark Points! ✨`);
}

function renderChallenges(){
  const box = document.getElementById('challengesList');
  box.innerHTML = challenges.map(c => {
    const done = currentUser.completed.includes(c.id);
    return `<article class="challenge ${done?'completed':''}">
      <h3>${c.icon} ${c.title}</h3><small>+${c.points} Spark Points</small>
      <p>Premio sugerido: ${c.reward}</p>
      ${c.stores ? `<button class="btn secondary full" onclick="showScreen('stores')">Ver tiendas</button>` : ''}
      <button class="btn primary full" onclick="completeChallenge('${c.id}')" ${done?'disabled':''}>${done?'Completado ✅':'Completar'}</button>
    </article>`;
  }).join('');
}

function addClothing(){
  const name = document.getElementById('clothingName').value.trim();
  const category = document.getElementById('clothingCategory').value;
  const color = document.getElementById('clothingColor').value.trim() || 'Sin color';
  if(!name) return toast('Escribe el nombre de la prenda');
  currentUser.closet.push({name,category,color});
  document.getElementById('clothingName').value=''; document.getElementById('clothingColor').value='';
  updateStoredUser(); renderCloset(); toast('Prenda agregada a tu clóset 👕');
}

function renderCloset(){
  const box = document.getElementById('clothesList');
  const advice = document.getElementById('closetAdvice');
  const emoji = {Polo:'👕','Pantalón':'👖','Casaca':'🧥','Vestido':'👗','Zapatos':'👟','Accesorio':'👜'};
  if(!currentUser.closet.length){ box.innerHTML='<p class="muted">Aún no tienes prendas registradas.</p>'; advice.classList.add('hidden'); return; }
  box.innerHTML = currentUser.closet.map(item => `<div class="closet-item"><div class="closet-emoji">${emoji[item.category]||'👚'}</div><div><b>${item.name}</b><br><span>${item.category} · ${item.color}</span></div></div>`).join('');
  const polos = currentUser.closet.filter(i => i.category === 'Polo').length;
  if(polos >= 3){ advice.textContent = `🌱 Ya tienes ${polos} polos. Antes de comprar otro, intenta combinar los que ya tienes.`; advice.classList.remove('hidden'); }
  else advice.classList.add('hidden');
}

function renderRewards(){
  const box = document.getElementById('rewardsList');
  box.innerHTML = rewards.map(r => {
    const redeemed = currentUser.redeemed.includes(r.id);
    return `<article class="reward"><h3>${r.icon} ${r.title}</h3><small>Costo: ${r.cost} Spark Points</small><p>${r.desc}</p><button class="btn primary full" onclick="redeemReward('${r.id}')" ${redeemed?'disabled':''}>${redeemed?'Canjeado ✅':'Canjear'}</button></article>`;
  }).join('');
}

function redeemReward(id){
  const r = rewards.find(x => x.id === id);
  if(currentUser.redeemed.includes(id)) return toast('Ya canjeaste esta recompensa');
  if(currentUser.points < r.cost) return toast('No tienes suficientes Spark Points');
  currentUser.points -= r.cost; currentUser.redeemed.push(id); updateStoredUser(); refreshUI(); toast('Recompensa canjeada 🎁');
}

function renderStores(filter='Todas'){
  const list = stores.filter(s => filter==='Todas' || s.zone===filter);
  document.getElementById('storesList').innerHTML = list.map(s => `<article class="store"><h3>📍 ${s.name}</h3><small>${s.district} · ${s.zone} · ⭐ ${s.rating}</small><p>${s.desc}</p><button class="btn primary full" onclick="openMap('${s.query}')">Abrir en Google Maps</button></article>`).join('');
}

function openMap(query){ window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`,'_blank'); }

function achievements(){
  const a = ['✅ Primer registro'];
  if(currentUser.completed.length) a.push('✅ Primer reto completado'); else a.push('🔒 Primer reto completado');
  if(currentUser.points >= 700) a.push('✅ Eco Explorer'); else a.push('🔒 Eco Explorer');
  if(currentUser.closet.length >= 5) a.push('✅ Clóset consciente'); else a.push('🔒 Clóset consciente');
  return a;
}

function toast(msg){
  const old = document.querySelector('.toast'); if(old) old.remove();
  const t = document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(),2500);
}

window.addEventListener('load',()=>{ loadCurrent(); renderStores(); if(currentUser) showScreen('home'); });
