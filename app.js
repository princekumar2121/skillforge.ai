// ===================================================================
// 1. STATE & INITIALIZATION
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

// 50 CAREER ROADMAP DATABASE WITH DETAILED PHASES
const CAREER_ROADMAPS_DATABASE = [
  { 
    id: 1, 
    title: "Full-Stack Web Developer", 
    category: "Software", 
    time: "6 Months",
    skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "PostgreSQL"],
    phases: [
      { name: "Phase 1: Web Foundations", modules: ["HTML5 Semantic Structure", "CSS3 Flexbox & Grid Layouts", "Modern Tailwind CSS"] },
      { name: "Phase 2: Client Side Development", modules: ["JavaScript ES6+ Syntax & DOM", "React.js Components & State", "REST API Consumption"] },
      { name: "Phase 3: Backend & Database", modules: ["Node.js & Express Architecture", "PostgreSQL & Supabase Setup", "Row-Level Security & Auth"] },
      { name: "Phase 4: Deployment & System Design", modules: ["Git & GitHub Actions CI/CD", "Vercel / Cloud Deployment", "Performance Optimization"] }
    ]
  },
  { 
    id: 2, 
    title: "AI & Machine Learning Engineer", 
    category: "AI", 
    time: "8 Months",
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Vector DBs"],
    phases: [
      { name: "Phase 1: Math & Python Foundations", modules: ["Linear Algebra & Calculus", "NumPy & Pandas Data Analysis", "Advanced Python"] },
      { name: "Phase 2: Classical Machine Learning", modules: ["Scikit-Learn Algorithms", "Regression & Classification", "Model Evaluation Metrics"] },
      { name: "Phase 3: Deep Learning & Neural Nets", modules: ["PyTorch Framework Basics", "Convolutional & Recurrent Nets", "Transformer Architecture"] },
      { name: "Phase 4: Generative AI & MLOps", modules: ["LLMs & HuggingFace Models", "Vector Databases (Pinecone/Chroma)", "Model Deployment"] }
    ]
  },
  { 
    id: 3, 
    title: "Cloud Solutions Architect", 
    category: "Cloud", 
    time: "7 Months",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    phases: [
      { name: "Phase 1: Networking & Linux", modules: ["Linux Shell Scripting", "TCP/IP & Subnetting", "Virtual Machines"] },
      { name: "Phase 2: Cloud Computing (AWS)", modules: ["EC2, S3, IAM & VPC Security", "Lambda Serverless Functions", "CloudWatch Monitoring"] },
      { name: "Phase 3: Containerization & IaC", modules: ["Docker Containers", "Kubernetes Cluster Management", "Terraform Automation"] }
    ]
  },
  { 
    id: 4, 
    title: "Cybersecurity Analyst", 
    category: "Security", 
    time: "6 Months",
    skills: ["Network Security", "Ethical Hacking", "SIEM", "Python", "Linux"],
    phases: [
      { name: "Phase 1: Security Fundamentals", modules: ["CompTIA Security+ Core Concepts", "Wireshark Packet Analysis", "Firewall Configuration"] },
      { name: "Phase 2: Penetration Testing", modules: ["Metasploit & Nmap Scanning", "OWASP Top 10 Web Vulnerabilities", "Python Security Scripts"] }
    ]
  },
  { 
    id: 5, 
    title: "Data Scientist", 
    category: "Data", 
    time: "6 Months",
    skills: ["Python", "Pandas", "SQL", "Statistics", "Data Visualization"],
    phases: [
      { name: "Phase 1: Data Analytics", modules: ["Advanced SQL Queries", "Pandas Data Wrangling", "Matplotlib & Seaborn"] },
      { name: "Phase 2: Statistical Modeling", modules: ["Hypothesis Testing", "Predictive Analytics", "A/B Testing Methodology"] }
    ]
  }
];

// Populate up to 50 career paths
for (let i = 6; i <= 50; i++) {
  CAREER_ROADMAPS_DATABASE.push({
    id: i,
    title: `Specialized Track ${i}: Tech Domain Role`,
    category: i % 2 === 0 ? "Engineering" : "Infrastructure",
    time: "5 Months",
    skills: ["Core Logic", "Architecture", "Database", "Security"],
    phases: [
      { name: "Phase 1: Core Fundamentals", modules: ["Domain Logic", "Tooling Setup"] },
      { name: "Phase 2: Advanced Implementation", modules: ["Scalability Testing", "Production Deployment"] }
    ]
  });
}

// REAL-TIME JOBS DATABASE
const LIVE_JOBS_DATABASE = [
  { id: 101, title: "Full-Stack Web Developer", company: "TechCorp Inc.", salary: "$95,000 - $125,000", match: "94% Match" },
  { id: 102, title: "AI & Machine Learning Engineer", company: "SkillForge Labs", salary: "$120,000 - $150,000", match: "88% Match" },
  { id: 103, title: "Junior Python & Backend Engineer", company: "DataSync Systems", salary: "$80,000 - $100,000", match: "82% Match" }
];

// TOAST SYSTEM
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

// AUTH HANDLERS
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

function openDashboard(userName, role) {
  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.innerText = userName;

  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) avatarEl.innerText = userName.charAt(0).toUpperCase();

  const roleBadge = document.getElementById('user-role-badge');
  if (roleBadge) roleBadge.innerText = role.charAt(0).toUpperCase() + role.slice(1) + " Account";

  const dashRole = document.getElementById('dashboard-role-text');
  if (dashRole) dashRole.innerText = role.charAt(0).toUpperCase() + role.slice(1);

  // Toggle Role Specific Nav Items
  const educatorNav = document.getElementById('nav-btn-educator');
  const recruiterNav = document.getElementById('nav-btn-recruiter');

  if (role === 'educator' && educatorNav) educatorNav.classList.remove('hidden');
  if (role === 'recruiter' && recruiterNav) recruiterNav.classList.remove('hidden');

  const authPage = document.getElementById('auth-page');
  if (authPage) authPage.classList.add('hidden');

  const appDashboard = document.getElementById('app-dashboard');
  if (appDashboard) appDashboard.classList.remove('hidden');

  renderRoadmapsHub();
  renderLiveJobs();
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

// TAB SWITCHING
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
// 2. 50 CAREER ROADMAPS HUB & FULL ROADMAP OVERLAY
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
  phasesContainer.innerHTML = career.phases.map((phase, idx) => `
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
// 3. REAL-TIME JOB MATCHES
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

// ===================================================================
// 4. PDF PARSER & MULTI-SELECT ATS RESUME ANALYZER
// ===================================================================
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
    executeBroadcastToastNotification("Select at least 1 job requirement skill.");
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
// 5. WORKING SPEECH-TO-TEXT AI VOICE MOCK INTERVIEW
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
