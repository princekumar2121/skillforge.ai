// ===================================================================
// 1. STATE & SUPABASE INITIALIZATION
// ===================================================================
const SUPABASE_URL = "https://vgazgftegixbqzoqwegt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YdfM6Ft3oYHCgpRxn1kjWA_PQCCFqpD";

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let activeRole = 'student';
let activeMode = 'login';

// 50 CAREER ROADMAP DATABASE
const CAREER_ROADMAPS_DATABASE = [
  { id: 1, title: "Full-Stack Web Developer", category: "Software", skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "PostgreSQL"] },
  { id: 2, title: "AI & Machine Learning Engineer", category: "AI", skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Vector DBs"] },
  { id: 3, title: "Cloud Solutions Architect", category: "Cloud", skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"] },
  { id: 4, title: "Cybersecurity Analyst", category: "Security", skills: ["Network Security", "Ethical Hacking", "SIEM", "Python", "Linux"] },
  { id: 5, title: "Data Scientist", category: "Data", skills: ["Python", "Pandas", "SQL", "Statistics", "Data Visualization"] },
  { id: 6, title: "DevOps Engineer", category: "Cloud", skills: ["Linux", "Jenkins", "Ansible", "Kubernetes", "Bash"] },
  { id: 7, title: "UI/UX Product Designer", category: "Design", skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"] },
  { id: 8, title: "Mobile App Developer (Flutter/React Native)", category: "Software", skills: ["Dart", "React Native", "Firebase", "REST APIs", "App Store Publishing"] },
  { id: 9, title: "Blockchain Developer", category: "Web3", skills: ["Solidity", "Ethereum", "Smart Contracts", "Ethers.js", "Rust"] },
  { id: 10, title: "Data Engineer", category: "Data", skills: ["Apache Spark", "Airflow", "SQL", "Python", "Snowflake"] },
  { id: 11, title: "Embedded Systems Engineer", category: "Hardware", skills: ["C/C++", "Microcontrollers", "RTOS", "PCB Design", "IoT Protocols"] },
  { id: 12, title: "Game Developer (Unity/Unreal)", category: "Gaming", skills: ["C#", "C++", "3D Modeling", "Physics Engines", "Shader Graph"] }
];

// Generate up to 50 career paths dynamically
for (let i = 13; i <= 50; i++) {
  CAREER_ROADMAPS_DATABASE.push({
    id: i,
    title: `Specialized Track ${i}: Tech Role Domain`,
    category: i % 2 === 0 ? "Engineering" : "Analytics",
    skills: ["Core Logic", "Architecture", "Database", "Security", "Deployment"]
  });
}

// REAL-TIME JOB MATCHES DATABASE
const LIVE_JOBS_DATABASE = [
  { id: 101, title: "Frontend Engineer (React / Tailwind)", company: "TechCorp Global", salary: "$90,000 - $120,000", match: "94% Match" },
  { id: 102, title: "Full-Stack AI Developer", company: "SkillForge Labs", salary: "$110,000 - $140,000", match: "88% Match" },
  { id: 103, title: "Junior Python & Backend Dev", company: "DataSync Systems", salary: "$75,000 - $95,000", match: "82% Match" }
];

// TOAST NOTIFICATIONS
function executeBroadcastToastNotification(msg) {
  const toast = document.getElementById('toastBroadcastSystem');
  if (toast) {
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
  }
}

// LANDING PAGE TRANSITION
function enterApp(mode) {
  const landing = document.getElementById('landing-hero');
  if (landing) landing.style.opacity = '0';
  setTimeout(() => {
    if (landing) landing.classList.add('hidden');
    if (mode === 'auth') {
      const auth = document.getElementById('auth-page');
      if (auth) auth.classList.remove('hidden');
    } else {
      openDashboard("Demo User", "student");
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

// 50 CAREERS HUB RENDER
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
      <button onclick="executeBroadcastToastNotification('Loaded ${item.title} roadmap details.')" class="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 rounded-lg text-[10px] font-semibold transition-all">View Roadmap →</button>
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
        <button class="w-full py-1.5 bg-slate-800 text-indigo-300 rounded-lg text-[10px]">View Roadmap →</button>
      </div>
    `).join('');
  }
}

// LIVE JOBS RENDER
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
        <button onclick="executeBroadcastToastNotification('Application submitted to ${job.company}!')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">Apply Now</button>
      </div>
    </div>
  `).join('');
}

// PDF RESUME UPLOAD PARSER
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
    } catch (err) {
      executeBroadcastToastNotification("⚠️ PDF parse error: Upload standard text PDF.");
    }
  };
  fileReader.readAsArrayBuffer(file);
}

// ATS RESUME ANALYZER
function analyzeResume() {
  const resumeText = document.getElementById('resume-text-input').value.toLowerCase();
  if (!resumeText.trim()) {
    executeBroadcastToastNotification("⚠️ Upload a PDF or paste text first.");
    return;
  }

  const keywordList = ["html", "css", "javascript", "react", "node.js", "python", "postgresql", "supabase", "git", "tailwind", "api", "system design"];
  let matched = [];
  let missing = [];

  keywordList.forEach(kw => {
    if (resumeText.includes(kw)) matched.push(kw);
    else missing.push(kw);
  });

  const score = Math.round((matched.length / keywordList.length) * 100);

  document.getElementById('ats-results-placeholder').classList.add('hidden');
  document.getElementById('ats-results-content').classList.remove('hidden');
  document.getElementById('ats-score-display').innerText = `${score}%`;

  document.getElementById('matched-keywords-container').innerHTML = matched.map(k => `<span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">${k.toUpperCase()}</span>`).join('');
  document.getElementById('missing-keywords-container').innerHTML = missing.map(k => `<span class="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px]">${k.toUpperCase()}</span>`).join('');
}
