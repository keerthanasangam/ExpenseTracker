// ================= ELEMENT SELECTION =================

// Balance & history
const balanceEl = document.getElementById("balance");
const list = document.getElementById("list");
const emptyState = document.getElementById("empty-state");

// Forms
const balanceForm = document.getElementById("balance-form");
const spendForm = document.getElementById("transaction-form");

// Inputs
const initialBalanceInput = document.getElementById("initial-balance");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");

// Buttons & Toggles
const resetBtn = document.getElementById("reset-btn");
const themeToggle = document.getElementById("theme-toggle");

// ================= DATA (STATE) =================

// Load balance
let balance = localStorage.getItem("balance")
    ? Number(localStorage.getItem("balance"))
    : 0;

// Load history
let history = localStorage.getItem("history")
    ? JSON.parse(localStorage.getItem("history"))
    : [];

// Formatter for Indian Rupees
const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(num);
};

// ================= THEME LOGIC =================

const applyTheme = (isDark) => {
    if (isDark) {
        document.body.classList.add("dark-mode");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
};

let isDarkMode = localStorage.getItem("darkMode") === "true";
applyTheme(isDarkMode);

themeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem("darkMode", isDarkMode);
    applyTheme(isDarkMode);
});

// ================= HELPER FUNCTIONS =================

// Get nicely formatted date & time
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

// Save to localStorage
function saveData() {
    localStorage.setItem("balance", balance);
    localStorage.setItem("history", JSON.stringify(history));
}

// Update balance UI
function updateBalance() {
    balanceEl.innerText = formatCurrency(balance);
}

// Render history
function renderHistory() {
    list.innerHTML = "";

    if (history.length === 0) {
        emptyState.classList.remove("hidden");
        list.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    list.classList.remove("hidden");

    // Reverse history to show newest first
    const reversedHistory = [...history].reverse();

    reversedHistory.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("transaction-item");

        li.innerHTML = `
            <div class="item-info">
                <span class="item-title"></span>
                <span class="item-date">${item.dateTime}</span>
            </div>
            <div class="item-right">
                <span class="item-amount">-${formatCurrency(item.amount)}</span>
                <button class="delete-btn" title="Remove Expense" onclick="removeItem(${item.id})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;

        // Use textContent to prevent XSS
        li.querySelector(".item-title").textContent = item.title;
        list.appendChild(li);
    });
}

// ================= CORE FEATURES =================

// Set initial balance
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

// Add new expense
function addSpend(e) {
    e.preventDefault();

    const title = textInput.value.trim();
    const amount = Number(amountInput.value);

    if (title === "" || amount <= 0) {
        alert("Please enter valid expense details.");
        return;
    }

    if (amount > balance) {
        alert("Insufficient balance! You cannot spend more than your available balance.");
        return;
    }

    balance -= amount;

    history.push({
        id: Date.now(),
        title,
        amount,
        dateTime: getDateTime()
    });

    saveData();
    updateBalance();
    renderHistory();

    textInput.value = "";
    amountInput.value = "";
}

// Remove previously added expense
function removeItem(id) {
    const item = history.find(h => h.id === id);
    if (!item) return;

    // Refund the amount to the balance
    balance += item.amount;
    history = history.filter(h => h.id !== id);

    saveData();
    updateBalance();
    renderHistory();
}

// Fully reset app state
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

// ================= INITIALIZATION =================
function init() {
    updateBalance();
    renderHistory();
}

// Event Listeners
balanceForm.addEventListener("submit", setBalance);
spendForm.addEventListener("submit", addSpend);
resetBtn.addEventListener("click", resetBalance);

// Start
init();
