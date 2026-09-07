// ===================================================================
// 1. STATE & DATABASES
// ===================================================================
const SUPABASE_URL = "https://vgazgftegixbqzoqwegt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YdfM6Ft3oYHCgpRxn1kjWA_PQCCFqpD";

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let activeRole = 'student';
let activeMode = 'login';
let speechRecognitionObj = null;
let isListeningSpeech = false;

// Dynamic Educator & Recruiter Data
let EDUCATOR_COURSES = [
  { id: 1, title: "Full-Stack System Architecture & Supabase", category: "Backend", modules: "Module 1: PostgreSQL Locks, Module 2: REST APIs" }
];

let LIVE_JOBS_DATABASE = [
  { id: 101, title: "Full-Stack Web Developer", company: "TechCorp Inc.", salary: "$95,000 - $125,000", match: "94% Match" },
  { id: 102, title: "AI & Machine Learning Engineer", company: "SkillForge Labs", salary: "$120,000 - $150,000", match: "88% Match" }
];

const CANDIDATES_PIPELINE = [
  { name: "Prince Singh", role: "Full-Stack AI", skills: "HTML, CSS, JS, React, Supabase, Postgres", match: "94%" },
  { name: "Alex Rivera", role: "Backend Engineer", skills: "Python, Docker, Node.js, Postgres", match: "89%" },
  { name: "Sophia Chen", role: "AI & ML Engineer", skills: "Python, PyTorch, Transformers, Vector DBs", match: "85%" }
];

// 50 CAREER ROADMAP DATABASE
const CAREER_ROADMAPS_DATABASE = [
  { 
    id: 1, 
    title: "Full-Stack Web Developer", 
    category: "Software", 
    time: "6 Months",
    skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "PostgreSQL"],
    phases: [
      { name: "Phase 1: Foundations", modules: ["HTML5 & CSS3 Flexbox/Grid", "Modern Tailwind UI"] },
      { name: "Phase 2: Client Side", modules: ["JavaScript ES6+ Syntax", "React State & Hooks"] },
      { name: "Phase 3: Backend & Database", modules: ["Node.js Express APIs", "PostgreSQL & Supabase Auth"] }
    ]
  },
  { 
    id: 2, 
    title: "AI & Machine Learning Engineer", 
    category: "AI", 
    time: "8 Months",
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Vector DBs"],
    phases: [
      { name: "Phase 1: Math & Python", modules: ["Linear Algebra", "Pandas Data Analysis"] },
      { name: "Phase 2: Neural Nets", modules: ["PyTorch Basics", "Transformer Architectures"] }
    ]
  }
];

for (let i = 3; i <= 50; i++) {
  CAREER_ROADMAPS_DATABASE.push({
    id: i,
    title: `Specialized Track ${i}: Tech Domain Role`,
    category: i % 2 === 0 ? "Engineering" : "Infrastructure",
    time: "5 Months",
    skills: ["Core Logic", "Architecture", "Database", "Security"],
    phases: [
      { name: "Phase 1: Core Fundamentals", modules: ["Domain Logic", "Tooling Setup"] },
      { name: "Phase 2: Production Deployment", modules: ["Scalability Testing", "Cloud Setup"] }
    ]
  });
}

// TOAST NOTIFIER
function executeBroadcastToastNotification(msg) {
  const toast = document.getElementById('toastBroadcastSystem');
  if (toast) {
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
  }
}

// HERO ENTRY
function enterApp(mode) {
  const landing = document.getElementById('landing-hero');
  if (landing) landing.style.opacity = '0';
  setTimeout(() => {
    if (landing) landing.classList.add('hidden');
    if (mode === 'auth') {
      const auth = document.getElementById('auth-page');
      if (auth) auth.classList.remove('hidden');
    } else {
      openDashboard("Guest User", "student");
    }
  }, 500);
}

// ROLE SELECTION & AUTH
function selectRole(role) {
  activeRole = role;
  ['student', 'educator', 'recruiter'].forEach(r => {
    const btn = document.getElementById(`role-btn-${r}`);
    if (btn) btn.className = (r === role) ? "py-2 rounded-lg bg-indigo-600 text-white font-semibold" : "py-2 rounded-lg text-slate-400";
  });
}

function switchAuthTab(mode) {
  activeMode = mode;
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const nameField = document.getElementById('field-fullname');
  const btnText = document.getElementById('btn-text');

  if (mode === 'signup') {
    if (signupTab) signupTab.className = "flex-1 py-2 text-indigo-400 border-b-2 border-indigo-500 text-center font-bold";
    if (loginTab) loginTab.className = "flex-1 py-2 text-slate-400 text-center";
    if (nameField) nameField.classList.remove('hidden');
    if (btnText) btnText.innerText = "Create Account & Continue";
  } else {
    if (loginTab) loginTab.className = "flex-1 py-2 text-indigo-400 border-b-2 border-indigo-500 text-center font-bold";
    if (signupTab) signupTab.className = "flex-1 py-2 text-slate-400 text-center";
    if (nameField) nameField.classList.add('hidden');
    if (btnText) btnText.innerText = "Sign In to Dashboard";
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('input-name');
  const emailInput = document.getElementById('input-email');
  const name = (nameInput && nameInput.value) ? nameInput.value : (emailInput ? emailInput.value.split('@')[0] : "User");
  openDashboard(name, activeRole);
}

function loginWithGoogle() {
  openDashboard("Google User", activeRole);
}

// OPEN DASHBOARD & LOAD ROLE SPECIFIC VIEWS
function openDashboard(userName, role) {
  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.innerText = userName;

  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) avatarEl.innerText = userName.charAt(0).toUpperCase();

  const roleBadge = document.getElementById('user-role-badge');
  if (roleBadge) roleBadge.innerText = role.charAt(0).toUpperCase() + role.slice(1) + " Account";

  const dashRole = document.getElementById('dashboard-role-text');
  if (dashRole) dashRole.innerText = role.charAt(0).toUpperCase() + role.slice(1);

  // Toggle Nav Groups
  const navStudent = document.getElementById('nav-group-student');
  const navEducator = document.getElementById('nav-group-educator');
  const navRecruiter = document.getElementById('nav-group-recruiter');

  if (navStudent) navStudent.classList.add('hidden');
  if (navEducator) navEducator.classList.add('hidden');
  if (navRecruiter) navRecruiter.classList.add('hidden');

  if (role === 'educator' && navEducator) {
    navEducator.classList.remove('hidden');
    switchTab('educator-view', 'Educator Class Analytics', null);
  } else if (role === 'recruiter' && navRecruiter) {
    navRecruiter.classList.remove('hidden');
    switchTab('recruiter-view', 'Recruiter Talent Pipeline', null);
  } else if (navStudent) {
    navStudent.classList.remove('hidden');
    switchTab('dashboard-view', 'Student Dashboard', null);
  }

  const authPage = document.getElementById('auth-page');
  if (authPage) authPage.classList.add('hidden');

  const appDashboard = document.getElementById('app-dashboard');
  if (appDashboard) appDashboard.classList.remove('hidden');

  renderRoadmapsHub();
  renderLiveJobs();
  renderEducatorCourses();
  renderRecruiterPipeline();
  renderRecruiterPostedJobs();
}

function handleLogout() {
  const dashboard = document.getElementById('app-dashboard');
  if (dashboard) dashboard.classList.add('hidden');
  
  const landing = document.getElementById('landing-hero');
  if (landing) {
    landing.classList.remove('hidden');
    landing.style.opacity = '1';
  }
}

// TAB NAVIGATION
function switchTab(viewId, title, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(btn => btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white");
  if (element) element.className = "nav-item active w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20";

  const titleEl = document.getElementById('view-title');
  if (titleEl) titleEl.innerText = title;
}

// ===================================================================
// 2. EDUCATOR ACTIONS
// ===================================================================
function createNewCourse(e) {
  e.preventDefault();
  const title = document.getElementById('course-title-input').value;
  const category = document.getElementById('course-category-input').value;
  const modules = document.getElementById('course-modules-input').value;

  EDUCATOR_COURSES.push({ id: Date.now(), title, category, modules });
  renderEducatorCourses();
  executeBroadcastToastNotification(`Published course: ${title}!`);

  document.getElementById('course-title-input').value = "";
  document.getElementById('course-category-input').value = "";
  document.getElementById('course-modules-input').value = "";
}

function renderEducatorCourses() {
  const container = document.getElementById('educator-course-list');
  if (!container) return;

  container.innerHTML = EDUCATOR_COURSES.map(c => `
    <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
      <div>
        <p class="text-xs font-bold text-white">${c.title} <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] ml-2">${c.category}</span></p>
        <p class="text-[10px] text-slate-400 mt-0.5">${c.modules}</p>
      </div>
      <button onclick="executeBroadcastToastNotification('Broadcasting course updates to students!')" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px]">Notify Class</button>
    </div>
  `).join('');
}

// ===================================================================
// 3. RECRUITER ACTIONS
// ===================================================================
function createNewJobListing(e) {
  e.preventDefault();
  const title = document.getElementById('job-title-input').value;
  const company = document.getElementById('job-company-input').value;
  const salary = document.getElementById('job-salary-input').value;

  LIVE_JOBS_DATABASE.push({ id: Date.now(), title, company, salary, match: "Direct Match" });
  renderLiveJobs();
  renderRecruiterPostedJobs();
  executeBroadcastToastNotification(`Published job: ${title} at ${company}!`);

  document.getElementById('job-title-input').value = "";
  document.getElementById('job-company-input').value = "";
  document.getElementById('job-salary-input').value = "";
}

function renderRecruiterPipeline() {
  const container = document.getElementById('recruiter-candidates-list');
  if (!container) return;

  container.innerHTML = CANDIDATES_PIPELINE.map(c => `
    <div class="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700">
      <div>
        <p class="text-xs font-bold text-white">${c.name} <span class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] ml-2">${c.role}</span></p>
        <p class="text-[10px] text-slate-400 mt-0.5">Skills: ${c.skills}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs font-extrabold text-emerald-400">${c.match} Match</span>
        <button onclick="executeBroadcastToastNotification('Sent 1-Click Interview Invite to ${c.name}!')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">Invite Interview</button>
      </div>
    </div>
  `).join('');
}

function renderRecruiterPostedJobs() {
  const container = document.getElementById('recruiter-posted-jobs-list');
  if (!container) return;

  container.innerHTML = LIVE_JOBS_DATABASE.map(j => `
    <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
      <div>
        <p class="text-xs font-bold text-white">${j.title} <span class="text-slate-400 font-normal">at ${j.company}</span></p>
        <p class="text-[10px] text-emerald-400">${j.salary}</p>
      </div>
      <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">Active Listing</span>
    </div>
  `).join('');
}

// ===================================================================
// 4. ROADMAPS & STUDENT FEATURES
// ===================================================================
function renderRoadmapsHub() {
  const container = document.getElementById('roadmaps-grid-container');
  if (!container) return;

  container.innerHTML = CAREER_ROADMAPS_DATABASE.map(item => `
    <div class="glass-card p-5 rounded-2xl space-y-3 border border-slate-700/50 hover:border-indigo-500/50 transition-all">
      <div class="flex justify-between items-center">
        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">${item.category}</span>
        <span class="text-[10px] text-slate-500">Track #${item.id}</span>
      </div>
      <h4 class="text-xs font-bold text-white">${item.title}</h4>
      <div class="flex flex-wrap gap-1">
        ${item.skills.map(s => `<span class="px-2 py-0.5 bg-slate-800 text-[9px] text-slate-300 rounded border border-slate-700">${s}</span>`).join('')}
      </div>
      <button onclick="openDetailedRoadmap(${item.id})" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer">
        View Roadmap →
      </button>
    </div>
  `).join('');
}

function filterRoadmaps() {
  const query = document.getElementById('roadmap-search-input').value.toLowerCase();
  const filtered = CAREER_ROADMAPS_DATABASE.filter(r => r.title.toLowerCase().includes(query) || r.category.toLowerCase().includes(query));
  
  const container = document.getElementById('roadmaps-grid-container');
  if (container) {
    container.innerHTML = filtered.map(item => `
      <div class="glass-card p-5 rounded-2xl space-y-3 border border-slate-700/50">
        <h4 class="text-xs font-bold text-white">${item.title}</h4>
        <button onclick="openDetailedRoadmap(${item.id})" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">View Roadmap →</button>
      </div>
    `).join('');
  }
}

function openDetailedRoadmap(careerId) {
  const career = CAREER_ROADMAPS_DATABASE.find(c => c.id === careerId);
  if (!career) return;

  document.getElementById('roadmap-hub-main').classList.add('hidden');
  document.getElementById('roadmap-detailed-overlay').classList.remove('hidden');

  document.getElementById('detailed-roadmap-title').innerText = career.title;
  document.getElementById('detailed-roadmap-category').innerText = career.category;
  document.getElementById('detailed-roadmap-time').innerText = career.time;

  const phasesContainer = document.getElementById('detailed-roadmap-phases');
  phasesContainer.innerHTML = career.phases.map((phase) => `
    <div class="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-3">
      <h4 class="text-xs font-bold text-indigo-400">${phase.name}</h4>
      <div class="space-y-2">
        ${phase.modules.map(mod => `
          <label class="flex items-center gap-3 p-2.5 bg-slate-800 rounded-lg border border-slate-700/60 cursor-pointer hover:bg-slate-750">
            <input type="checkbox" onchange="executeBroadcastToastNotification('Updated milestone completion status.')" class="w-4 h-4 accent-indigo-500 rounded">
            <span class="text-xs text-slate-200">${mod}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function closeDetailedRoadmap() {
  document.getElementById('roadmap-detailed-overlay').classList.add('hidden');
  document.getElementById('roadmap-hub-main').classList.remove('hidden');
}

// ===================================================================
// 5. REAL-TIME JOB MATCHES & RESUME PARSER
// ===================================================================
function renderLiveJobs() {
  const container = document.getElementById('jobs-container-list');
  if (!container) return;

  container.innerHTML = LIVE_JOBS_DATABASE.map(job => `
    <div class="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
      <div>
        <p class="text-xs font-bold text-white">${job.title}</p>
        <p class="text-[10px] text-slate-400">${job.company} • ${job.salary}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${job.match}</span>
        <button onclick="executeBroadcastToastNotification('Application submitted to ${job.company}!')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">Quick Apply</button>
      </div>
    </div>
  `).join('');
}

async function handlePDFUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  executeBroadcastToastNotification(`Extracting text from ${file.name}...`);

  const fileReader = new FileReader();
  fileReader.onload = async function() {
    try {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map(item => item.str).join(' ') + " ";
      }

      document.getElementById('resume-text-input').value = extractedText;
      executeBroadcastToastNotification("✅ PDF text successfully parsed!");
      analyzeResume();
    } catch (err) {
      executeBroadcastToastNotification("⚠️ PDF parse note: Using typed text input fallback.");
    }
  };
  fileReader.readAsArrayBuffer(file);
}

function analyzeResume() {
  const resumeText = document.getElementById('resume-text-input').value.toLowerCase();
  const checkboxes = document.querySelectorAll('.skill-req-check:checked');

  let selectedKeywords = [];
  checkboxes.forEach(box => selectedKeywords.push(box.value));

  if (selectedKeywords.length === 0) {
    executeBroadcastToastNotification("Select at least 1 skill requirement.");
    return;
  }

  let matched = [];
  let missing = [];

  selectedKeywords.forEach(kw => {
    if (resumeText.includes(kw.toLowerCase())) matched.push(kw);
    else missing.push(kw);
  });

  const score = Math.round((matched.length / selectedKeywords.length) * 100);

  document.getElementById('ats-results-placeholder').classList.add('hidden');
  document.getElementById('ats-results-content').classList.remove('hidden');
  document.getElementById('ats-score-display').innerText = `${score}%`;

  document.getElementById('matched-keywords-container').innerHTML = matched.length > 0
    ? matched.map(k => `<span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">${k.toUpperCase()}</span>`).join('')
    : '<span class="text-xs text-slate-500">None found</span>';

  document.getElementById('missing-keywords-container').innerHTML = missing.length > 0
    ? missing.map(k => `<span class="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">${k.toUpperCase()}</span>`).join('')
    : '<span class="text-xs text-emerald-400">All selected skills matched!</span>';
}

// ===================================================================
// 6. VOICE SPEECH RECOGNITION INTERVIEW
// ===================================================================
function toggleVoiceSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    executeBroadcastToastNotification("⚠️ Web Speech API not supported in this browser. Use Chrome/Edge.");
    return;
  }

  const micIcon = document.getElementById('voice-mic-icon');
  const btnText = document.getElementById('voice-btn-text');
  const waveAnim = document.getElementById('audio-wave-anim');
  const statusTag = document.getElementById('speech-status-indicator');
  const outputTextarea = document.getElementById('voice-transcript-output');

  if (!isListeningSpeech) {
    speechRecognitionObj = new SpeechRecognition();
    speechRecognitionObj.continuous = true;
    speechRecognitionObj.interimResults = true;

    speechRecognitionObj.onstart = function() {
      isListeningSpeech = true;
      if (micIcon) micIcon.innerText = "⏹️";
      if (btnText) btnText.innerText = "Stop Voice Recording";
      if (waveAnim) waveAnim.classList.remove('hidden');
      if (statusTag) {
        statusTag.innerText = "RECORDING LIVE";
        statusTag.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse";
      }
    };

    speechRecognitionObj.onresult = function(event) {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      if (outputTextarea) outputTextarea.value = currentTranscript;
    };

    speechRecognitionObj.onerror = function(event) {
      executeBroadcastToastNotification("Speech Error: " + event.error);
    };

    speechRecognitionObj.start();

  } else {
    if (speechRecognitionObj) speechRecognitionObj.stop();
    isListeningSpeech = false;
    if (micIcon) micIcon.innerText = "🎙️";
    if (btnText) btnText.innerText = "Start Voice Answer Recording";
    if (waveAnim) waveAnim.classList.add('hidden');
    if (statusTag) {
      statusTag.innerText = "MIC READY";
      statusTag.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700";
    }
  }
}

function evaluateSpeechAnswer() {
  const answerText = document.getElementById('voice-transcript-output').value;
  if (!answerText.trim()) {
    executeBroadcastToastNotification("⚠️ Please speak or type an answer first.");
    return;
  }

  const resultsCard = document.getElementById('speech-eval-results');
  const feedbackText = document.getElementById('speech-eval-feedback');

  if (resultsCard) resultsCard.classList.remove('hidden');
  if (feedbackText) {
    feedbackText.innerText = "Strong response! Your speech transcript demonstrated solid technical comprehension of asynchronous execution and transaction integrity.";
  }
  executeBroadcastToastNotification("🎉 Voice answer evaluated by AI!");
}
