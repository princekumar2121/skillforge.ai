// ===================================================================
// 1. SUPABASE CLIENT INITIALIZATION
// ===================================================================
const SUPABASE_URL = "https://vgazgftegixbqzoqwegt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YdfM6Ft3oYHCgpRxn1kjWA_PQCCFqpD";

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("✅ Supabase Connected!");
}

let activeRole = 'student';
let activeMode = 'login';

// ===================================================================
// 2. AUTHENTICATION & UI ROLE SELECTION
// ===================================================================
function selectRole(role) {
  activeRole = role;
  ['student', 'educator', 'recruiter'].forEach(r => {
    const btn = document.getElementById(`role-btn-${r}`);
    if (btn) {
      btn.className = (r === role)
        ? "py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-md transition-all"
        : "py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all";
    }
  });
}

function switchAuthTab(mode) {
  activeMode = mode;
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const nameField = document.getElementById('field-fullname');
  const btnText = document.getElementById('btn-text');

  if (mode === 'signup') {
    signupTab.className = "flex-1 py-2 text-indigo-400 border-b-2 border-indigo-500 text-center font-bold";
    loginTab.className = "flex-1 py-2 text-slate-400 hover:text-slate-200 text-center";
    nameField.classList.remove('hidden');
    btnText.innerText = "Create Account & Continue";
  } else {
    loginTab.className = "flex-1 py-2 text-indigo-400 border-b-2 border-indigo-500 text-center font-bold";
    signupTab.className = "flex-1 py-2 text-slate-400 hover:text-slate-200 text-center";
    nameField.classList.add('hidden');
    btnText.innerText = "Sign In to Dashboard";
  }
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Prevents page reload bug

  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  const nameInput = document.getElementById('input-name').value.trim();
  const fullName = nameInput || email.split('@')[0];
  const btnText = document.getElementById('btn-text');

  btnText.innerText = "Connecting to Supabase...";

  try {
    if (activeMode === 'signup') {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email,
          password: password,
          options: { data: { full_name: fullName, role: activeRole } }
        });
        if (error) throw error;
        alert("🎉 Account created in Supabase!");
      }
    } else {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });
        if (error) throw error;
      }
    }
    openDashboard(fullName, activeRole);
  } catch (err) {
    alert("⚠️ Auth Note: " + err.message);
    openDashboard(fullName, activeRole);
  } finally {
    btnText.innerText = activeMode === 'signup' ? "Create Account & Continue" : "Sign In to Dashboard";
  }
}

async function loginWithGoogle() {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
      });
      if (error) throw error;
    } catch (err) {
      alert("Google OAuth setup required in Supabase dashboard: " + err.message);
      openDashboard("Google User", activeRole);
    }
  } else {
    openDashboard("Google User", activeRole);
  }
}

function openDashboard(userName, role) {
  document.getElementById('user-display-name').innerText = userName;
  document.getElementById('user-avatar').innerText = userName.charAt(0).toUpperCase();
  document.getElementById('user-role-badge').innerText = role.charAt(0).toUpperCase() + role.slice(1) + " Account";
  document.getElementById('dashboard-role-text').innerText = role.charAt(0).toUpperCase() + role.slice(1);

  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app-dashboard').classList.remove('hidden');
}

function handleLogout() {
  if (supabaseClient) supabaseClient.auth.signOut();
  document.getElementById('app-dashboard').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');
}

// ===================================================================
// 3. TAB NAVIGATION
// ===================================================================
function switchTab(viewId, title, element) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  
  // Show target tab
  document.getElementById(viewId).classList.remove('hidden');

  // Highlight active nav item
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800";
  });
  element.className = "nav-item active w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20";

  document.getElementById('view-title').innerText = title;
}

// ===================================================================
// 4. FEATURE 1: ROADMAP TRACKER LOGIC
// ===================================================================
function updateRoadmapProgress() {
  const checkboxes = document.querySelectorAll('.roadmap-checkbox');
  let checkedCount = 0;

  checkboxes.forEach(box => {
    if (box.checked) checkedCount++;
  });

  const total = checkboxes.length;
  const percentage = Math.round((checkedCount / total) * 100);

  // Update UI stats
  document.getElementById('stat-readiness').innerText = `${percentage}%`;
  document.getElementById('stat-completed-count').innerText = `${checkedCount} / ${total}`;
  document.getElementById('roadmap-progress-badge').innerText = `Progress: ${percentage}%`;
}

// ===================================================================
// 5. FEATURE 2: LIVE ATS RESUME ANALYZER LOGIC
// ===================================================================
function analyzeResume() {
  const jobTitleText = document.getElementById('target-job-title').value.toLowerCase();
  const resumeText = document.getElementById('resume-text-input').value.toLowerCase();

  if (!resumeText.trim()) {
    alert("⚠️ Please paste your resume text to run the ATS analysis.");
    return;
  }

  // Keywords to extract and match
  const keywordList = ["html", "css", "javascript", "react", "node.js", "python", "postgresql", "supabase", "git", "tailwind", "api", "system design"];
  
  let matched = [];
  let missing = [];

  keywordList.forEach(kw => {
    if (resumeText.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const score = Math.round((matched.length / keywordList.length) * 100);

  // Display Results
  document.getElementById('ats-results-placeholder').classList.add('hidden');
  document.getElementById('ats-results-content').classList.remove('hidden');

  document.getElementById('ats-score-display').innerText = `${score}%`;
  document.getElementById('stat-ats-score').innerText = `${score} / 100`;

  // Matched Keywords Tags
  const matchedContainer = document.getElementById('matched-keywords-container');
  matchedContainer.innerHTML = matched.map(k => `<span class="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${k.toUpperCase()}</span>`).join('');

  // Missing Keywords Tags
  const missingContainer = document.getElementById('missing-keywords-container');
  missingContainer.innerHTML = missing.length > 0 
    ? missing.map(k => `<span class="px-2 py-1 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">${k.toUpperCase()}</span>`).join('')
    : '<span class="text-xs text-emerald-400">Great job! No key technical skills missing.</span>';

  // Dynamic recommendation
  if (missing.length > 0) {
    document.getElementById('ats-recommendation-text').innerText = `To reach an ATS score above 85%, add these missing keywords: ${missing.slice(0, 3).join(', ').toUpperCase()}.`;
  } else {
    document.getElementById('ats-recommendation-text').innerText = `Excellent resume alignment! Your profile matches all key technical requirements.`;
  }
}
