// ── Jua App — app.js ─────────────────────────────────────────
// All data stored in localStorage for offline-first experience.

const QUOTES = [
  "Your consistency today is your freedom tomorrow.",
  "Small steps taken daily build mountains over time.",
  "Know yourself — that is where all growth begins.",
  "You don't have to be perfect. You have to be consistent.",
  "Every great journey starts with a single decision to begin.",
  "Your future self is watching you right now. Make them proud.",
  "Growth is not always visible. Trust the process.",
  "The person you want to become is built in the moments you don't feel like it.",
  "Discipline is the bridge between your goals and your reality.",
  "In every difficulty lies an opportunity to discover your strength.",
];

const PROMPTS = [
  "What is one thing that challenged you today, and what did it teach you?",
  "What are you most grateful for right now, and why?",
  "Describe a moment today when you felt most like yourself.",
  "What is one habit you want to improve, and what is your plan?",
  "If your best self could leave you a message tonight, what would it say?",
  "What fear held you back today, and how can you face it tomorrow?",
  "Who has positively influenced your life recently? What did they show you?",
  "What small win happened today that deserves recognition?",
  "What would you do differently if you could relive today?",
  "Write about what 'progress' means to you right now.",
];

// ── Storage helpers ──────────────────────────────────────────
function save(key, val) { localStorage.setItem("jua_" + key, JSON.stringify(val)); }
function load(key, fallback) {
  try { const v = localStorage.getItem("jua_" + key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

// ── State ────────────────────────────────────────────────────
let state = {
  goals:   load("goals", []),
  habits:  load("habits", []),
  entries: load("entries", []),
  moods:   load("moods", []),
  lastMood: load("lastMood", null),
};

// ── Page routing ──────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".bnav-btn").forEach(t => t.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  document.querySelectorAll(`[data-page="${name}"]`).forEach(t => t.classList.add("active"));
  if (name === "home") renderHome();
}

document.querySelectorAll(".nav-tab, .bnav-btn").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// ── Toast ────────────────────────────────────────────────────
function toast(msg, duration = 2200) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), duration);
}

// ── HOME ─────────────────────────────────────────────────────
function renderHome() {
  // Greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("greeting").textContent = greet;

  // Date
  const now = new Date();
  document.getElementById("homeDate").innerHTML =
    `<div>${now.toLocaleDateString("en-GB", {weekday:"short"}).toUpperCase()}</div>
     <div style="font-size:22px;font-weight:700;font-family:'Playfair Display',serif">${now.getDate()}</div>
     <div>${now.toLocaleDateString("en-GB", {month:"short"}).toUpperCase()}</div>`;

  // Quote
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  document.getElementById("quoteText").textContent = q;

  // Habits preview
  const list = document.getElementById("homeHabitList");
  const today = todayKey();
  const habits = state.habits.slice(0, 4);
  if (!habits.length) {
    list.innerHTML = '<p class="empty-state">Add habits to track →</p>';
  } else {
    list.innerHTML = habits.map(h => {
      const done = (h.doneOn || []).includes(today);
      return `<div class="home-habit-item">
        <input type="checkbox" ${done ? "checked" : ""} onchange="toggleHabit('${h.id}', this.checked)" />
        <span style="${done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${h.name}</span>
      </div>`;
    }).join("");
  }

  // Goal preview
  const gp = document.getElementById("homeGoalPreview");
  if (!state.goals.length) {
    gp.innerHTML = '<p class="empty-state">No goals yet.<br>Add one in Goals →</p>';
  } else {
    const g = state.goals[0];
    gp.innerHTML = `<div class="goal-tag">${g.timeframe}</div>
      <p style="font-size:14px;font-weight:600;color:var(--dark);margin-top:4px">${g.title}</p>`;
  }

  // Streak
  const streak = calcJournalStreak();
  document.getElementById("streakNum").textContent = streak;

  // Mood
  if (state.lastMood) {
    document.getElementById("todayMoodLabel").textContent = "Feeling " + state.lastMood.label + " today";
    document.querySelectorAll(".mood-btn").forEach(b => {
      b.classList.toggle("selected", b.dataset.mood === state.lastMood.emoji);
    });
  }
}

// ── GOALS ────────────────────────────────────────────────────
document.getElementById("addGoalBtn").addEventListener("click", () => {
  document.getElementById("goalForm").classList.remove("hidden");
});
document.getElementById("cancelGoal").addEventListener("click", () => {
  document.getElementById("goalForm").classList.add("hidden");
});
document.getElementById("saveGoal").addEventListener("click", () => {
  const title = document.getElementById("goalTitle").value.trim();
  if (!title) return toast("Please enter a goal title.");
  const goal = {
    id: Date.now().toString(),
    title,
    timeframe: document.getElementById("goalTimeframe").value,
    desc: document.getElementById("goalDesc").value.trim(),
    createdAt: new Date().toISOString(),
  };
  state.goals.unshift(goal);
  save("goals", state.goals);
  document.getElementById("goalTitle").value = "";
  document.getElementById("goalDesc").value = "";
  document.getElementById("goalForm").classList.add("hidden");
  renderGoals();
  toast("✦ Goal added!");
});

function renderGoals() {
  const list = document.getElementById("goalsList");
  if (!state.goals.length) {
    list.innerHTML = '<p class="empty-state">No goals yet. Add your first goal above.</p>';
    return;
  }
  list.innerHTML = state.goals.map(g => `
    <div class="goal-card">
      <div>
        <div class="goal-tag">${g.timeframe}</div>
        <div class="goal-title">${escHtml(g.title)}</div>
        ${g.desc ? `<div class="goal-desc">${escHtml(g.desc)}</div>` : ""}
      </div>
      <button class="goal-delete" onclick="deleteGoal('${g.id}')" title="Delete">✕</button>
    </div>
  `).join("");
}

function deleteGoal(id) {
  state.goals = state.goals.filter(g => g.id !== id);
  save("goals", state.goals);
  renderGoals();
  toast("Goal removed.");
}

// ── HABITS ───────────────────────────────────────────────────
const CATEGORIES = { mind:"🧠 Mind", body:"💪 Body", spirit:"✨ Spirit", work:"📚 Work", social:"🤝 Social" };

document.getElementById("addHabitBtn").addEventListener("click", () => {
  document.getElementById("habitForm").classList.remove("hidden");
});
document.getElementById("cancelHabit").addEventListener("click", () => {
  document.getElementById("habitForm").classList.add("hidden");
});
document.getElementById("saveHabit").addEventListener("click", () => {
  const name = document.getElementById("habitName").value.trim();
  if (!name) return toast("Please enter a habit name.");
  const habit = {
    id: Date.now().toString(),
    name,
    category: document.getElementById("habitCategory").value,
    doneOn: [],
    createdAt: new Date().toISOString(),
  };
  state.habits.push(habit);
  save("habits", state.habits);
  document.getElementById("habitName").value = "";
  document.getElementById("habitForm").classList.add("hidden");
  renderHabits();
  toast("✅ Habit added!");
});

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function toggleHabit(id, checked) {
  const h = state.habits.find(h => h.id === id);
  if (!h) return;
  const key = todayKey();
  if (checked && !h.doneOn.includes(key)) h.doneOn.push(key);
  if (!checked) h.doneOn = h.doneOn.filter(d => d !== key);
  save("habits", state.habits);
  renderHabits();
}

function calcHabitStreak(habit) {
  // Count consecutive days ending today
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!habit.doneOn.includes(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function renderHabits() {
  const list = document.getElementById("habitsList");
  const today = todayKey();
  const doneCount = state.habits.filter(h => (h.doneOn || []).includes(today)).length;

  // Update banner
  const banner = document.getElementById("streakBannerText");
  if (!state.habits.length) banner.textContent = "Add your first habit above!";
  else if (doneCount === state.habits.length) banner.textContent = `🔥 All ${state.habits.length} habits done today! Amazing work.`;
  else banner.textContent = `${doneCount} of ${state.habits.length} habits completed today — keep going!`;

  if (!state.habits.length) {
    list.innerHTML = '<p class="empty-state">No habits yet. Add your first one above.</p>';
    return;
  }

  list.innerHTML = state.habits.map(h => {
    const done = (h.doneOn || []).includes(today);
    const streak = calcHabitStreak(h);
    return `
      <div class="habit-card ${done ? 'done' : ''}" onclick="toggleHabit('${h.id}', ${!done})">
        <div class="habit-check">${done ? "✓" : ""}</div>
        <div class="habit-info">
          <div class="habit-name">${escHtml(h.name)}</div>
          <div class="habit-meta">
            <span class="habit-cat">${CATEGORIES[h.category] || h.category}</span>
            ${streak > 0 ? `<span class="habit-streak">🔥 ${streak} day streak</span>` : ""}
          </div>
        </div>
        <button class="habit-delete" onclick="event.stopPropagation(); deleteHabit('${h.id}')" title="Delete">✕</button>
      </div>
    `;
  }).join("");
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  save("habits", state.habits);
  renderHabits();
  toast("Habit removed.");
}

// ── JOURNAL ───────────────────────────────────────────────────
let currentPrompt = PROMPTS[new Date().getDate() % PROMPTS.length];

function refreshPrompt() {
  const idx = Math.floor(Math.random() * PROMPTS.length);
  currentPrompt = PROMPTS[idx];
  document.getElementById("journalPrompt").textContent = currentPrompt;
}

document.getElementById("newPromptBtn").addEventListener("click", refreshPrompt);

document.getElementById("journalText").addEventListener("input", function() {
  const words = this.value.trim().split(/\s+/).filter(Boolean).length;
  document.getElementById("charCount").textContent = words + " word" + (words !== 1 ? "s" : "");
});

document.getElementById("saveEntry").addEventListener("click", () => {
  const text = document.getElementById("journalText").value.trim();
  if (text.length < 10) return toast("Write a bit more before saving 😊");
  const entry = {
    id: Date.now().toString(),
    text,
    prompt: currentPrompt,
    date: new Date().toISOString(),
  };
  state.entries.unshift(entry);
  save("entries", state.entries);
  document.getElementById("journalText").value = "";
  document.getElementById("charCount").textContent = "0 words";
  refreshPrompt();
  renderEntries();
  toast("✦ Entry saved!");
});

function calcJournalStreak() {
  let streak = 0;
  const d = new Date();
  while (true) {
    const dayStr = d.toDateString();
    if (!state.entries.some(e => new Date(e.date).toDateString() === dayStr)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function renderEntries() {
  const list = document.getElementById("entriesList");
  if (!state.entries.length) {
    list.innerHTML = '<p class="empty-state">Your journal is empty. Write your first entry above.</p>';
    return;
  }
  list.innerHTML = state.entries.map(e => `
    <div class="entry-card">
      <div class="entry-date">${new Date(e.date).toLocaleDateString("en-GB", {weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <div class="entry-prompt">✦ ${escHtml(e.prompt)}</div>
      <div class="entry-text">${escHtml(e.text)}</div>
    </div>
  `).join("");
}

// ── MOOD ──────────────────────────────────────────────────────
let selectedMood = null;

document.querySelectorAll(".mood-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mood-option").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMood = { emoji: btn.dataset.mood, label: btn.dataset.label };
  });
});

document.getElementById("logMoodBtn").addEventListener("click", () => {
  if (!selectedMood) return toast("Pick a mood first!");
  const entry = { ...selectedMood, date: new Date().toISOString() };
  state.moods.unshift(entry);
  save("moods", state.moods);
  state.lastMood = entry;
  save("lastMood", entry);
  renderMoodHistory();
  toast(selectedMood.emoji + " Mood logged!");
  selectedMood = null;
  document.querySelectorAll(".mood-option").forEach(b => b.classList.remove("selected"));
});

// Quick mood buttons on home
document.querySelectorAll(".mood-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const entry = { emoji: btn.dataset.mood, label: btn.dataset.label, date: new Date().toISOString() };
    state.moods.unshift(entry);
    save("moods", state.moods);
    state.lastMood = entry;
    save("lastMood", entry);
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    document.getElementById("todayMoodLabel").textContent = "Feeling " + entry.label + " today";
    toast(entry.emoji + " Mood noted!");
  });
});

function renderMoodHistory() {
  const list = document.getElementById("moodHistory");
  if (!state.moods.length) {
    list.innerHTML = '<p class="empty-state">No moods logged yet.</p>';
    return;
  }
  list.innerHTML = state.moods.slice(0, 14).map(m => `
    <div class="mood-entry">
      <span class="mood-emoji">${m.emoji}</span>
      <div class="mood-info">
        <div class="mood-name">${m.label}</div>
        <div class="mood-time">${new Date(m.date).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})} · ${new Date(m.date).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
      </div>
    </div>
  `).join("");
}

// ── AI COMPANION ──────────────────────────────────────────────
const chatWindow = document.getElementById("chatWindow");
const chatInput  = document.getElementById("chatInput");
const sendBtn    = document.getElementById("sendBtn");
let chatHistory  = [];

const SYSTEM_PROMPT = `You are Jua, an AI companion in a personal growth and mental wellness app designed for young Africans aged 16-30. 

Your role:
- Be a warm, supportive reflection partner — not a therapist, not a life coach
- Help users think through their goals, habits, emotions, and daily experiences
- Ask thoughtful follow-up questions to deepen reflection
- Offer gentle encouragement and perspective
- Respect the user's autonomy — you guide, you do not decide
- Be culturally aware: understand pressures around academics, career, family, identity, and socio-economic challenges common for African youth
- Keep responses concise (2-4 short paragraphs max), warm, and conversational
- Never be preachy or overwhelming
- If someone seems distressed, acknowledge their feelings first before anything else
- Always remind users that you are an AI and that professional support exists if needed`;

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || sendBtn.disabled) return;

  addChatMsg("user", text);
  chatInput.value = "";
  sendBtn.disabled = true;

  chatHistory.push({ role: "user", content: text });

  // Loading indicator
  const loadingId = "loading_" + Date.now();
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "chat-msg assistant loading";
  loadingDiv.id = loadingId;
  loadingDiv.innerHTML = `<span class="msg-avatar">✦</span><div class="msg-bubble">Thinking…</div>`;
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch(
  "https://models.inference.ai.azure.com/chat/completions",
  {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "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"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory
      ],
      max_tokens: 1000,
    }),
  }
);
const data = await response.json();
document.getElementById(loadingId)?.remove();
const replyText = data?.choices?.[0]?.message?.content || "Sorry, I couldn't connect right now.";
    chatHistory.push({ role: "assistant", content: replyText });
    addChatMsg("assistant", replyText);
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    addChatMsg("assistant", "I'm having trouble connecting right now. Please check your internet and try again.");
  }

  sendBtn.disabled = false;
  chatInput.focus();
}

function addChatMsg(role, text) {
  const div = document.createElement("div");
  div.className = "chat-msg " + role;
  const avatar = role === "assistant"
    ? `<span class="msg-avatar">✦</span>`
    : `<span class="msg-avatar" style="background:var(--mid)">👤</span>`;
  div.innerHTML = `${avatar}<div class="msg-bubble">${escHtml(text).replace(/\n/g, "<br>")}</div>`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ── Utils ─────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

// ── Init ──────────────────────────────────────────────────────
document.getElementById("journalPrompt").textContent = currentPrompt;
renderHome();
renderGoals();
renderHabits();
renderEntries();
renderMoodHistory();
