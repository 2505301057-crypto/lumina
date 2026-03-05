/* ============================================================
   LUMINA app.js — All interactive logic
   ============================================================ */

// ─── State ───────────────────────────────────────────────────
const state = {
  scansLeft: 3,
  hasPhoto: false,
  currentTab: 'upload',
  currentRoutine: 'am',
  analysisData: null,
  timerInterval: null,
  timerSeconds: 30,
  exerciseTimerRunning: false,
  cameraStream: null,
  hasCaptured: false,
};

// ─── DATA ────────────────────────────────────────────────────
const routineData = {
  am: [
    { icon: '🧼', name: 'Gentle Cleanser', badge: 'Essential', badgeClass: '', why: 'Removes overnight sebum without stripping the skin barrier.', ingredients: ['Ceramides','Glycerin','Aloe Vera'], link: '#', price: '$24–$38' },
    { icon: '✨', name: 'Vitamin C Serum', badge: 'Recommended', badgeClass: '', why: 'Neutralizes free radicals and brightens dark spots detected in your scan.', ingredients: ['L-Ascorbic Acid (10%)','Vitamin E','Ferulic Acid'], link: '#', price: '$35–$65' },
    { icon: '💧', name: 'Hyaluronic Moisturizer', badge: 'Sponsored ✦', badgeClass: 'sponsored', why: 'Your scan detected mild dehydration — HA attracts moisture to the surface skin.', ingredients: ['Hyaluronic Acid','Niacinamide','Panthenol'], link: '#', price: '$28–$45' },
    { icon: '☀️', name: 'Mineral SPF 50', badge: 'Essential', badgeClass: '', why: 'UV protection prevents worsening of detected dark spots and fine lines.', ingredients: ['Zinc Oxide','Titanium Dioxide','Niacinamide'], link: '#', price: '$20–$32' },
  ],
  pm: [
    { icon: '🫧', name: 'Oil Cleanser (Double)', badge: 'Recommended', badgeClass: '', why: 'Double cleansing removes sunscreen and daily pollution thoroughly.', ingredients: ['Jojoba Oil','Squalane','Polysorbate-20'], link: '#', price: '$18–$30' },
    { icon: '🌿', name: 'Retinol 0.3% Serum', badge: 'Essential', badgeClass: '', why: 'Addresses fine lines and uneven texture detected around eye and forehead zones.', ingredients: ['Retinol 0.3%','Bakuchiol','Peptides'], link: '#', price: '$42–$80' },
    { icon: '💎', name: 'Niacinamide Toner', badge: 'Sponsored ✦', badgeClass: 'sponsored', why: 'Minimizes visible pores detected in T-zone. Regulates sebum production.', ingredients: ['Niacinamide 10%','Zinc PCA','Panthenol'], link: '#', price: '$12–$22' },
    { icon: '🌙', name: 'Rich Night Cream', badge: 'Recommended', badgeClass: '', why: 'Intensively repairs the skin barrier overnight. Ideal for your dehydrated zones.', ingredients: ['Ceramides','Shea Butter','Peptides'], link: '#', price: '$35–$70' },
  ],
  weekly: [
    { icon: '🔬', name: 'BHA Exfoliant (2%)', badge: 'Essential', badgeClass: '', why: 'Salicylic acid reaches inside pores to clear congestion detected in cheek area.', ingredients: ['Salicylic Acid 2%','Willow Bark','Green Tea'], link: '#', price: '$16–$28' },
    { icon: '🍯', name: 'Honey Enzyme Mask', badge: 'Recommended', badgeClass: '', why: 'Brightening mask for detected dullness. Gentle enough for your skin sensitivity.', ingredients: ['Papain','Honey','Kojic Acid'], link: '#', price: '$30–$48' },
    { icon: '🧊', name: 'Under-Eye Patches', badge: 'Sponsored ✦', badgeClass: 'sponsored', why: 'Targets puffiness and dark circles detected in the under-eye zone.', ingredients: ['Caffeine','Peptides','Collagen'], link: '#', price: '$22–$36' },
    { icon: '⚡', name: 'AHA Glow Peel', badge: 'Essential', badgeClass: '', why: 'Lactic acid gently resurfaces texture issues identified on cheeks and forehead.', ingredients: ['Lactic Acid 10%','Glycolic Acid','Aloe'], link: '#', price: '$24–$40' },
  ],
};

const avoidIngredients = ['Alcohol Denat.','Fragrance/Parfum','Sulfates (SLS)','Mineral Oil','Silicones (heavy)','Benzyl Alcohol','Oxybenzone'];

const exercisesData = [
  {
    icon: '💪', title: 'Jawline Definer', target: 'Jaw & Neck', duration: '90 sec',
    desc: 'Strengthens and defines the jawline to reduce puffiness and sagging detected in lower face.',
    steps: ['Tilt your head back slightly and look at the ceiling','Press your tongue firmly against the roof of your mouth','Smile wide, hold 5 seconds (feel the neck muscles engage)','Slowly bring your head back to neutral','Repeat 10 times with 3-second holds'],
  },
  {
    icon: '👁️', title: 'Eye Lift Yoga', target: 'Eyes & Brow Bone', duration: '60 sec',
    desc: 'Lifts the upper eyelid area and reduces under-eye puffiness targeted from your scan.',
    steps: ['Place index fingers gently under each eyebrow','Gently push brows upward while squinting against resistance','Hold the squint for 5 seconds','Release slowly — don\'t snap','Repeat 8–10 times twice daily'],
  },
  {
    icon: '🌸', title: 'Cheek Sculptor', target: 'Mid-Face & Cheeks', duration: '75 sec',
    desc: 'Tones cheek muscles for a lifted, contoured look. Combats detected mid-face sagging.',
    steps: ['Smile as wide as you can without showing teeth (big closed smile)','Place fingertips on cheek apples','Use the fingers to lightly press the cheeks toward your eyes','Hold tension for 20 seconds','Release and shake out face — repeat 5 times'],
  },
  {
    icon: '😮', title: 'Nasolabial Smoother', target: 'Smile Lines', duration: '60 sec',
    desc: 'Reduces the appearance of nasolabial folds and laugh lines identified in your analysis.',
    steps: ['Open mouth slightly into an "O" shape','Fold upper lip over upper teeth','Move lip corners up into a smile — hold 10 seconds','Release to neutral "O"','Repeat 15 times'],
  },
  {
    icon: '🦷', title: 'Neck & Décolletage', target: 'Neck & Chest', duration: '90 sec',
    desc: 'Tones the platysma muscle to firm and smooth the neck area for a more youthful appearance.',
    steps: ['Sit or stand upright with relaxed shoulders','Tilt chin up at a 45° angle','Open and close mouth slowly like chewing','Feel the neck muscles stretch and engage','Do 20 slow repetitions'],
  },
  {
    icon: '✨', title: 'Forehead Smoothing', target: 'Forehead & Brow', duration: '45 sec',
    desc: 'Releases tension from forehead muscles to soften horizontal lines detected in the scan.',
    steps: ['Place both hands flat across the forehead','Apply light downward pressure with fingers','Raise your eyebrows against the resistance','Hold for 10 seconds — breathe steadily','Relax and repeat 8 times'],
  },
];

const skinNeedsData = [
  { icon: '💧', text: 'Deep hydration with hyaluronic acid — 2x daily' },
  { icon: '🛡️', text: 'Barrier repair using ceramide-rich products' },
  { icon: '✨', text: 'Brightening agents: Vitamin C (AM), Niacinamide (PM)' },
  { icon: '☀️', text: 'Broad-spectrum SPF 50 every single morning' },
  { icon: '🌿', text: 'Gentle retinol 0.3% 3x/week for texture and lines' },
  { icon: '💤', text: '7–8 hours sleep for overnight cellular repair' },
  { icon: '💦', text: 'Minimum 2L water daily for natural hydration' },
  { icon: '🥗', text: 'Antioxidant-rich diet: berries, green tea, omega-3s' },
];

const skinAvoidData = [
  { icon: '🚫', text: 'Alcohol-based toners and astringents — strips barrier' },
  { icon: '🚫', text: 'Heavy mineral oil — clogs detected large pores' },
  { icon: '🚫', text: 'Fragrant skincare — triggers detected skin sensitivity' },
  { icon: '🚫', text: 'Over-exfoliation (max 2x/week with acids)' },
  { icon: '🚫', text: 'Hot showers directly on the face — causes inflammation' },
  { icon: '🚫', text: 'Skipping SPF on cloudy days — UV damages skin daily' },
  { icon: '🚫', text: 'Silicone-heavy primers that block skincare absorption' },
  { icon: '🚫', text: 'Touching face throughout the day — transfers bacteria' },
];

const historyData = [
  { date: 'Mar 2026', score: 82, label: 'Radiant', change: '+5', dir: 'up' },
  { date: 'Feb 2026', score: 77, label: 'Balanced', change: '+3', dir: 'up' },
  { date: 'Jan 2026', score: 74, label: 'Improving', change: '+8', dir: 'up' },
];

const metricsData = [
  { icon: '💧', name: 'Hydration', value: '74%', fill: 74, color: '#4facfe', status: 'Good — slightly low in cheek zones' },
  { icon: '🔍', name: 'Pore Size', value: '6.2/10', fill: 62, color: '#f093fb', status: 'Moderate — concentrated in T-zone' },
  { icon: '🌿', name: 'Oiliness', value: 'Medium', fill: 45, color: '#43e97b', status: 'Balanced — slight excess mid-day' },
  { icon: '✨', name: 'Radiance', value: '80%', fill: 80, color: '#ffd700', status: 'High — well-reflective skin surface' },
  { icon: '🔬', name: 'Texture', value: '3.4/10', fill: 34, color: '#f5a623', status: 'Mild roughness on cheeks' },
  { icon: '🌑', name: 'Dark Spots', value: '4 zones', fill: 40, color: '#f87171', status: 'Detected — forehead & cheekbones' },
  { icon: '📏', name: 'Fine Lines', value: 'Low', fill: 20, color: '#96e6a1', status: 'Minimal — early prevention ideal age' },
  { icon: '🌡️', name: 'Redness', value: 'Mild', fill: 25, color: '#ff9f7f', status: 'Slight redness around nose zone' },
];

const shapeDescriptions = {
  oval: 'Your oval face is the most versatile shape. Balanced proportions work well with most hairstyles and makeup. Enhance your natural symmetry with light contouring along the sides. Avoid over-contouring — your shape needs minimal adjustment.',
  round: 'Your round face benefits from contouring along the temples and sides to add definition. Try angular hairstyles and structured makeup to create the illusion of length. High cheekbones are your superpower!',
  square: 'Your square face has a strong, symmetrical jawline — a highly desirable feature. Soften angles with side-swept styles and contouring on jaw corners. Emphasize eyes and lips to draw attention upward.',
  heart: 'Your heart-shaped face features a gorgeous wide forehead tapering to a delicate chin. Balance proportions by emphasizing the cheeks and lower face. A classic, romantic face shape that photographs beautifully.',
  diamond: 'Your diamond face has striking wide cheekbones as the focal point. Play up this feature with subtle blush and highlight. Soften the forehead and chin with strategically placed contouring.',
};

// ─── INIT ─────────────────────────────────────────────────────
window.addEventListener('load', () => {
  generateParticles();
  renderExercises();
  renderDiary();
  renderHistory();
  addScrollEffects();
  // inject SVG gradient
  const svg = `<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#C9A96E"/><stop offset="100%" style="stop-color:#E8A4B8"/></linearGradient></defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
});

// ─── PARTICLES ────────────────────────────────────────────────
function generateParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random()*100}%;
      top: ${Math.random()*100}%;
      --d: ${4 + Math.random()*6}s;
      --dy: ${-20 + Math.random()*40};
      animation-delay: ${Math.random()*6}s;
      opacity: ${0.2 + Math.random()*0.5};
    `;
    container.appendChild(p);
  }
}

// ─── NAV ──────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 60);
});
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function scrollToScan() {
  document.getElementById('scan').scrollIntoView({ behavior: 'smooth' });
}
function showPricing() {
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

// ─── LOGIN MODAL ──────────────────────────────────────────────
function showLogin() { document.getElementById('loginModal').style.display = 'flex'; }
function hideLogin() { document.getElementById('loginModal').style.display = 'none'; }
document.getElementById('loginModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('loginModal')) hideLogin();
});

// ─── TABS ─────────────────────────────────────────────────────
function switchTab(tab) {
  state.currentTab = tab;
  document.getElementById('panel-upload').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('panel-camera').style.display = tab === 'camera' ? 'block' : 'none';
  document.getElementById('tab-upload').classList.toggle('active', tab === 'upload');
  document.getElementById('tab-camera').classList.toggle('active', tab === 'camera');
  if (tab === 'upload' && state.cameraStream) stopCamera();
}

// ─── FILE UPLOAD ──────────────────────────────────────────────
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) loadPhotoFile(file);
}
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadZone').style.borderColor = 'var(--gold)';
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadPhotoFile(file);
}
function loadPhotoFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'block';
    state.hasPhoto = true;
    showToast('📸 Photo loaded — ready to analyze!');
  };
  reader.readAsDataURL(file);
}
function removePhoto() {
  document.getElementById('previewImg').src = '';
  document.getElementById('uploadZone').style.display = 'block';
  document.getElementById('previewContainer').style.display = 'none';
  document.getElementById('fileInput').value = '';
  state.hasPhoto = false;
}

// ─── CAMERA ───────────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    state.cameraStream = stream;
    const video = document.getElementById('videoEl');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('cameraPlaceholder').style.display = 'none';
    document.getElementById('startCameraBtn').style.display = 'none';
    document.getElementById('captureBtn').style.display = 'inline-block';
    state.hasPhoto = false;
  } catch (err) {
    showToast('⚠️ Camera access denied. Please use photo upload instead.');
  }
}
function capturePhoto() {
  const video = document.getElementById('videoEl');
  const canvas = document.getElementById('canvasEl');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const data = canvas.toDataURL('image/png');
  document.getElementById('capturedPhoto').src = data;
  document.getElementById('capturedPhoto').style.display = 'block';
  video.style.display = 'none';
  document.getElementById('captureBtn').style.display = 'none';
  document.getElementById('retakeBtn').style.display = 'inline-block';
  stopCamera();
  state.hasPhoto = true;
  state.hasCaptured = true;
  showToast('📸 Photo captured — ready to analyze!');
}
function retakePhoto() {
  document.getElementById('capturedPhoto').style.display = 'none';
  document.getElementById('retakeBtn').style.display = 'none';
  document.getElementById('startCameraBtn').style.display = 'inline-block';
  state.hasPhoto = false;
  state.hasCaptured = false;
}
function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
}

// ─── ANALYSIS ─────────────────────────────────────────────────
function runAnalysis() {
  if (!state.hasPhoto) {
    showToast('📸 Please upload or capture a photo first!');
    return;
  }
  if (state.scansLeft <= 0) {
    showToast('✦ Scan limit reached — upgrade to Lumina Pro for unlimited scans!');
    showPricing();
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.classList.add('loading');
  document.getElementById('analyzeBtnText').textContent = 'Analyzing...';
  document.getElementById('loadingOverlay').style.display = 'flex';

  simulateLoading(() => {
    state.scansLeft--;
    document.getElementById('scanLimitText').innerHTML =
      `You have <strong>${state.scansLeft} free scan${state.scansLeft !== 1 ? 's' : ''}</strong> remaining this month`;
    document.getElementById('loadingOverlay').style.display = 'none';
    btn.classList.remove('loading');
    document.getElementById('analyzeBtnText').textContent = 'Analyze My Skin';

    showResults();
    showToast('✦ Analysis complete! Scroll down to see your results.');
  });
}

function simulateLoading(callback) {
  const steps = ['ls1','ls2','ls3','ls4'];
  const bar = document.getElementById('progressBar');
  let i = 0;
  const interval = setInterval(() => {
    if (i < steps.length) {
      if (i > 0) document.getElementById(steps[i-1]).className = 'loading-step done';
      document.getElementById(steps[i]).className = 'loading-step active';
      bar.style.width = `${(i+1) * 25}%`;
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        steps.forEach(id => document.getElementById(id).className = 'loading-step done');
        bar.style.width = '100%';
        setTimeout(callback, 600);
      }, 400);
    }
  }, 900);
}

// ─── RESULTS ──────────────────────────────────────────────────
function showResults() {
  const section = document.getElementById('results');
  section.style.display = 'block';
  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

  renderMetrics();
  renderRecommendations('am');
  renderAvoidChips();
  animateScore();
  setupShapeCards();
}

function animateScore() {
  const circle = document.getElementById('scoreCircle');
  const circumference = 314;
  const score = 82;
  const offset = circumference - (score / 100) * circumference;
  setTimeout(() => { circle.style.strokeDashoffset = offset; }, 300);
}

function renderMetrics() {
  const grid = document.getElementById('metricsGrid');
  grid.innerHTML = metricsData.map(m => `
    <div class="metric-card">
      <div class="metric-head">
        <span class="metric-name">${m.name}</span>
        <span class="metric-icon">${m.icon}</span>
      </div>
      <div class="metric-value" style="color:${m.color}">${m.value}</div>
      <div class="metric-bar">
        <div class="metric-fill" style="width:0%;background:${m.color}" data-target="${m.fill}"></div>
      </div>
      <div class="metric-status">${m.status}</div>
    </div>
  `).join('');
  setTimeout(() => {
    document.querySelectorAll('.metric-fill').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 300);
}

function renderRecommendations(routine) {
  const grid = document.getElementById('recGrid');
  const data = routineData[routine] || routineData.am;
  grid.innerHTML = data.map(r => `
    <div class="rec-card">
      <div class="rec-card-top">
        <span class="rec-icon">${r.icon}</span>
        <span class="rec-badge ${r.badgeClass}">${r.badge}</span>
      </div>
      <div class="rec-name">${r.name}</div>
      <div class="rec-why">${r.why}</div>
      <div class="rec-ingredients">
        <div class="rec-ingredients-label">Look for:</div>
        <div class="ingredient-chips">
          ${r.ingredients.map(i => `<span class="chip">${i}</span>`).join('')}
        </div>
      </div>
      <a href="${r.link}" class="rec-link" onclick="handleAffiliate(event,'${r.name}')">
        Shop Products — avg ${r.price} →
      </a>
    </div>
  `).join('');
}

function renderAvoidChips() {
  document.getElementById('avoidChips').innerHTML = avoidIngredients
    .map(i => `<span class="avoid-chip">✗ ${i}</span>`).join('');
}

function showRecTab(btn, routine) {
  document.querySelectorAll('.rec-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRecommendations(routine);
}

function handleAffiliate(e, product) {
  e.preventDefault();
  showToast(`🛍️ Redirecting to affiliate partner for "${product}"...`);
}

function setupShapeCards() {
  document.querySelectorAll('.shape-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.shape-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      document.getElementById('shapeDescription').textContent =
        shapeDescriptions[card.dataset.shape] || '';
    });
  });
}

// ─── EXERCISES ────────────────────────────────────────────────
function renderExercises() {
  document.getElementById('exercisesGrid').innerHTML = exercisesData.map((ex, i) => `
    <div class="exercise-card" onclick="openExerciseModal(${i})">
      <div class="ex-header">
        <span class="ex-icon">${ex.icon}</span>
        <span class="ex-duration">⏱ ${ex.duration}</span>
      </div>
      <div class="ex-title">${ex.title}</div>
      <div class="ex-target">🎯 ${ex.target}</div>
      <div class="ex-desc">${ex.desc}</div>
      <div class="ex-cta">Start Exercise →</div>
    </div>
  `).join('');
}

function openExerciseModal(i) {
  const ex = exercisesData[i];
  document.getElementById('modalIcon').textContent = ex.icon;
  document.getElementById('modalTitle').textContent = ex.title;
  document.getElementById('modalDesc').textContent = ex.desc;
  document.getElementById('modalSteps').innerHTML = ex.steps.map((s, j) => `
    <div class="modal-step">
      <div class="step-num">${j + 1}</div>
      <div class="step-text">${s}</div>
    </div>
  `).join('');
  document.getElementById('exerciseModal').style.display = 'flex';
  resetTimer();
}
function closeExerciseModal() {
  document.getElementById('exerciseModal').style.display = 'none';
  clearInterval(state.timerInterval);
  state.exerciseTimerRunning = false;
  resetTimer();
}
function resetTimer() {
  state.timerSeconds = 30;
  document.getElementById('timerDisplay').textContent = '0:30';
  document.getElementById('timerBtn').textContent = 'Start';
  state.exerciseTimerRunning = false;
}
function startExerciseTimer() {
  if (state.exerciseTimerRunning) {
    clearInterval(state.timerInterval);
    state.exerciseTimerRunning = false;
    document.getElementById('timerBtn').textContent = 'Resume';
    return;
  }
  state.exerciseTimerRunning = true;
  document.getElementById('timerBtn').textContent = 'Pause';
  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    const m = Math.floor(state.timerSeconds / 60);
    const s = state.timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = `${m}:${s.toString().padStart(2,'0')}`;
    if (state.timerSeconds <= 0) {
      clearInterval(state.timerInterval);
      state.exerciseTimerRunning = false;
      document.getElementById('timerBtn').textContent = 'Done ✓';
      showToast('✨ Exercise complete! Wonderful work!');
      resetTimer();
    }
  }, 1000);
}

// ─── DIARY ────────────────────────────────────────────────────
function renderDiary() {
  document.getElementById('needsList').innerHTML = skinNeedsData
    .map(n => `<li><span class="li-icon">${n.icon}</span>${n.text}</li>`).join('');
  document.getElementById('avoidList').innerHTML = skinAvoidData
    .map(a => `<li><span class="li-icon">${a.icon}</span>${a.text}</li>`).join('');
}

function renderHistory() {
  document.getElementById('historyTimeline').innerHTML = historyData.map(h => `
    <div class="history-item">
      <span class="history-date">${h.date}</span>
      <span class="history-score">${h.score}</span>
      <span class="history-label">${h.label}</span>
      <span class="history-change ${h.dir}">${h.dir === 'up' ? '↑' : '↓'} ${h.change} pts</span>
    </div>
  `).join('');
}

function downloadReport() {
  showToast('✦ PDF report download is a Lumina Pro feature. Upgrade to access!');
  setTimeout(() => showPricing(), 1500);
}

// ─── PRICING ──────────────────────────────────────────────────
function subscribePro() {
  showToast('✦ Redirecting to secure checkout... (Stripe integration)');
}
function contactBrand() {
  showToast('📩 Opening brand partnership inquiry...');
}

// ─── DEMO ─────────────────────────────────────────────────────
function playDemo() {
  showToast('▶ Interactive demo — try uploading your own photo above!');
  scrollToScan();
}

// ─── TOAST ────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── SCROLL EFFECTS ───────────────────────────────────────────
function addScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.metric-card, .rec-card, .exercise-card, .testimonial-card, .price-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}
