// ===================================================================
// 1. SUPABASE CLIENT CONFIGURATION
// ===================================================================
const SUPABASE_URL = "https://vgazgftegixbqzoqwegt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YdfM6Ft3oYHCgpRxn1kjWA_PQCCFqpD";

let supabase = null;
if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("✅ Supabase Connected!");
}

// Global State
let activeRole = 'student';
let activeMode = 'login';
let currentUser = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
});

// ===================================================================
// 2. CHECK ACTIVE SESSION
// ===================================================================
async function checkSession() {
  if (!supabase) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    currentUser = session.user;
    await fetchUserProfile(currentUser.id);
    showDashboardUI();
  } else {
    showAuthUI();
  }
}

// ===================================================================
// 3. AUTHENTICATION (SIGN UP & SIGN IN)
// ===================================================================

// SELECT ROLE (Student, Educator, Recruiter)
function selectRole(role) {
  activeRole = role;
  const roles = ['student', 'educator', 'recruiter'];
  roles.forEach(r => {
    const btn = document.getElementById(`role-btn-${r}`);
    if (btn) {
      btn.className = (r === role)
        ? "py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-md transition-all"
        : "py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all";
    }
  });
}

// SWITCH TAB (Sign In vs Create Account)
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

// SUBMIT FORM (Store in Supabase Auth & Profiles Table)
async function handleFormSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  const fullName = document.getElementById('input-name').value.trim() || email.split('@')[0];
  const btnText = document.getElementById('btn-text');

  btnText.innerText = "Processing...";

  try {
    if (activeMode === 'signup') {
      // 1. Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (error) throw error;

      if (data.user) {
        currentUser = data.user;
        // 2. Create User Profile Entry in Database
        await saveUserProfile(data.user.id, fullName, activeRole);
        await checkSession();
      }

    } else {
      // Sign In Existing User
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      currentUser = data.user;
      await checkSession();
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  } finally {
    btnText.innerText = activeMode === 'signup' ? "Create Account & Continue" : "Sign In to Dashboard";
  }
}

// LOGOUT
async function handleLogout() {
  if (supabase) await supabase.auth.signOut();
  currentUser = null;
  showAuthUI();
}

// ===================================================================
// 4. DATABASE OPERATIONS (READ & WRITE TO SUPABASE)
// ===================================================================

// SAVE PROFILE
async function saveUserProfile(userId, fullName, role) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    role: role
  });
  if (error) console.error("Profile Save Error:", error.message);
}

// FETCH PROFILE
async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (data) {
    document.getElementById('user-display-name').innerText = data.full_name || currentUser.email;
    document.getElementById('user-avatar').innerText = (data.full_name || currentUser.email).charAt(0).toUpperCase();
    document.getElementById('user-role-badge').innerText = `${capitalize(data.role)} Account`;
    document.getElementById('dashboard-role-text').innerText = capitalize(data.role);
  }
}

// STORE SKILL SCORE TO SUPABASE
async function saveSkillScore(skillName, score) {
  if (!currentUser) return;

  const { error } = await supabase.from('skill_assessments').insert({
    user_id: currentUser.id,
    skill_name: skillName,
    score: score
  });

  if (error) alert("Error saving skill: " + error.message);
  else alert(`Saved ${skillName} score (${score}%) to Supabase!`);
}

// STORE ATS RESUME SCORE TO SUPABASE
async function saveResumeAnalysis(score, missingKeywords, recommendations) {
  if (!currentUser) return;

  const { error } = await supabase.from('resume_analyses').insert({
    user_id: currentUser.id,
    overall_score: score,
    missing_keywords: missingKeywords,
    recommendations: recommendations
  });

  if (error) alert("Error saving resume score: " + error.message);
  else alert("Saved Resume Analysis to Supabase!");
}

// ===================================================================
// 5. UI VISIBILITY HELPERS
// ===================================================================
function showDashboardUI() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app-dashboard').classList.remove('hidden');
}

function showAuthUI() {
  document.getElementById('app-dashboard').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
