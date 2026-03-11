// ================= PAGE NAVIGATION =================

const pages = {
    landing: document.getElementById("page-landing"),
    signup: document.getElementById("page-signup"),
    login: document.getElementById("page-login"),
    dashboard: document.getElementById("page-dashboard")
};

function showPage(pageName) {
    Object.values(pages).forEach(p => p.classList.remove("active"));
    pages[pageName].classList.add("active");
}

// ================= ELEMENT SELECTION =================

// Dashboard elements
const balanceEl = document.getElementById("balance");
const list = document.getElementById("list");
const emptyState = document.getElementById("empty-state");
const balanceForm = document.getElementById("balance-form");
const spendForm = document.getElementById("transaction-form");
const initialBalanceInput = document.getElementById("initial-balance");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");
const txnTypeInput = document.getElementById("txn-type");
const txnSubmitBtn = document.getElementById("txn-submit-btn");
const toggleBtns = document.querySelectorAll(".toggle-btn");
const descLabel = document.getElementById("desc-label");
const resetBtn = document.getElementById("reset-btn");
const welcomeMsg = document.getElementById("welcome-msg");

// Auth elements
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const authUserEl = document.getElementById("auth-user");
const logoutBtn = document.getElementById("logout-btn");

// Navigation buttons
const landingSignupBtn = document.getElementById("landing-signup-btn");
const landingLoginBtn = document.getElementById("landing-login-btn");
const signupBackBtn = document.getElementById("signup-back-btn");
const loginBackBtn = document.getElementById("login-back-btn");
const gotoLogin = document.getElementById("goto-login");
const gotoSignup = document.getElementById("goto-signup");

// Theme toggles (one on landing, one on dashboard)
const themeToggleLanding = document.getElementById("theme-toggle-landing");
const themeToggleDash = document.getElementById("theme-toggle");

// ================= DATA (STATE) =================

let balance = localStorage.getItem("balance")
    ? Number(localStorage.getItem("balance"))
    : 0;

let history = localStorage.getItem("history")
    ? JSON.parse(localStorage.getItem("history"))
    : [];

let users = localStorage.getItem("users")
    ? JSON.parse(localStorage.getItem("users"))
    : [];

let currentUser = localStorage.getItem("currentUser")
    ? JSON.parse(localStorage.getItem("currentUser"))
    : null;

const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(num);
};

// ================= THEME LOGIC =================

function syncThemeIcons() {
    const icon = isDarkMode
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    themeToggleLanding.innerHTML = icon;
    themeToggleDash.innerHTML = icon;
}

const applyTheme = (isDark) => {
    if (isDark) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
    syncThemeIcons();
};

let isDarkMode = localStorage.getItem("darkMode") === "true";
applyTheme(isDarkMode);

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("darkMode", isDarkMode);
    applyTheme(isDarkMode);
}

themeToggleLanding.addEventListener("click", toggleTheme);
themeToggleDash.addEventListener("click", toggleTheme);

// ================= HELPER FUNCTIONS =================

function getDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });
    return `${date} • ${time}`;
}

function saveData() {
    localStorage.setItem("balance", balance);
    localStorage.setItem("history", JSON.stringify(history));
}

function saveAuthData() {
    localStorage.setItem("users", JSON.stringify(users));
    if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
        localStorage.removeItem("currentUser");
    }
}

function updateBalance() {
    balanceEl.innerText = formatCurrency(balance);
}

function renderHistory() {
    list.innerHTML = "";

    if (history.length === 0) {
        emptyState.classList.remove("hidden");
        list.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    list.classList.remove("hidden");

    const reversedHistory = [...history].reverse();

    reversedHistory.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("transaction-item");

        const isIncome = item.type === "income";
        if (isIncome) li.classList.add("income");

        const sign = isIncome ? "+" : "-";
        const amountClass = isIncome ? "item-amount credit" : "item-amount";

        li.innerHTML = `
            <div class="item-info">
                <span class="item-title"></span>
                <span class="item-date">${item.dateTime}</span>
            </div>
            <div class="item-right">
                <span class="${amountClass}">${sign}${formatCurrency(item.amount)}</span>
                <button class="delete-btn" title="Remove" onclick="removeItem(${item.id})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;

        li.querySelector(".item-title").textContent = item.title;
        list.appendChild(li);
    });
}

// ================= AUTH LOGIC =================

function handleSignUp(e) {
    e.preventDefault();

    const username = document.getElementById("signup-username").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    if (!username || !phone || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    if (!/^\d{10,15}$/.test(phone)) {
        alert("Phone number must be 10 to 15 digits.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 4) {
        alert("Password must be at least 4 characters.");
        return;
    }

    const exists = users.some(
        u =>
            u.username.toLowerCase() === username.toLowerCase() ||
            u.phone === phone ||
            (u.email || "").toLowerCase() === email
    );

    if (exists) {
        alert("Username, phone, or email already exists. Please login.");
        return;
    }

    users.push({ username, phone, email, password });

    currentUser = { username };
    saveAuthData();

    signupForm.reset();
    enterDashboard();
}

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const matched = users.find(
        u =>
            u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password
    );

    if (!matched) {
        alert("Invalid username or password.");
        return;
    }

    currentUser = { username: matched.username };
    saveAuthData();

    loginForm.reset();
    enterDashboard();
}

function handleLogout() {
    currentUser = null;
    saveAuthData();
    showPage("landing");
}

function enterDashboard() {
    authUserEl.textContent = `Hi, ${currentUser.username}`;
    welcomeMsg.textContent = `Welcome back, ${currentUser.username}!`;
    updateBalance();
    renderHistory();
    showPage("dashboard");
}

// ================= CORE FEATURES =================

function setBalance(e) {
    e.preventDefault();
    const value = Number(initialBalanceInput.value);

    if (value <= 0) {
        alert("Please enter a valid balance greater than 0.");
        return;
    }

    balance = value;
    history = [];

    saveData();
    updateBalance();
    renderHistory();
    initialBalanceInput.value = "";
}

function addTransaction(e) {
    e.preventDefault();
    const title = textInput.value.trim();
    const amount = Number(amountInput.value);
    const type = txnTypeInput.value; // "expense" or "income"

    if (title === "" || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    if (type === "expense" && amount > balance) {
        alert("Insufficient balance! You cannot spend more than your available balance.");
        return;
    }

    if (type === "expense") {
        balance -= amount;
    } else {
        balance += amount;
    }

    history.push({
        id: Date.now(),
        title,
        amount,
        type,
        dateTime: getDateTime()
    });

    saveData();
    updateBalance();
    renderHistory();
    textInput.value = "";
    amountInput.value = "";
}

function removeItem(id) {
    const item = history.find(h => h.id === id);
    if (!item) return;

    if (item.type === "income") {
        balance -= item.amount;
    } else {
        balance += item.amount;
    }
    history = history.filter(h => h.id !== id);

    saveData();
    updateBalance();
    renderHistory();
}

function resetBalance() {
    const confirmReset = confirm(
        "Are you sure you want to completely reset your tracker?\nYour balance and history will be permanently deleted."
    );

    if (!confirmReset) return;

    balance = 0;
    history = [];

    localStorage.removeItem("balance");
    localStorage.removeItem("history");

    updateBalance();
    renderHistory();
}

// ================= EVENT LISTENERS =================

// Landing page navigation
landingSignupBtn.addEventListener("click", () => showPage("signup"));
landingLoginBtn.addEventListener("click", () => showPage("login"));

// Auth page navigation
signupBackBtn.addEventListener("click", () => showPage("landing"));
loginBackBtn.addEventListener("click", () => showPage("landing"));
gotoLogin.addEventListener("click", (e) => { e.preventDefault(); showPage("login"); });
gotoSignup.addEventListener("click", (e) => { e.preventDefault(); showPage("signup"); });

// Auth forms
signupForm.addEventListener("submit", handleSignUp);
loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

// Dashboard forms
balanceForm.addEventListener("submit", setBalance);
spendForm.addEventListener("submit", addTransaction);

// Transaction type toggle
toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        toggleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const type = btn.dataset.type;
        txnTypeInput.value = type;
        if (type === "income") {
            descLabel.textContent = "From Whom";
            textInput.placeholder = "e.g. Dad, Company, Freelance...";
            amountInput.placeholder = "Amount credited";
            txnSubmitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Income';
            txnSubmitBtn.classList.remove("btn-success");
            txnSubmitBtn.classList.add("btn-income-mode");
        } else {
            descLabel.textContent = "Description";
            textInput.placeholder = "e.g. Groceries, Rent...";
            amountInput.placeholder = "0.00";
            txnSubmitBtn.innerHTML = '<i class="fa-solid fa-minus"></i> Add Expense';
            txnSubmitBtn.classList.remove("btn-income-mode");
            txnSubmitBtn.classList.add("btn-success");
        }
    });
});
resetBtn.addEventListener("click", resetBalance);

// ================= INITIALIZATION =================

function init() {
    if (currentUser) {
        enterDashboard();
    } else {
        showPage("landing");
    }
}

init();
