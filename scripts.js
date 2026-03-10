// ================= ELEMENT SELECTION =================

// Balance & history
const balanceEl = document.getElementById("balance");
const list = document.getElementById("list");

// Forms
const balanceForm = document.getElementById("balance-form");
const spendForm = document.getElementById("transaction-form");

// Inputs
const initialBalanceInput = document.getElementById("initial-balance");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");

// Buttons
const resetBtn = document.getElementById("reset-btn");
const themeToggle = document.getElementById("theme-toggle");

// ================= DATA (STATE) =================
             
//. Load balance
// without this Balance wl not be taken
let balance = localStorage.getItem("balance") 
    ? Number(localStorage.getItem("balance")) //local storage treats eveything as string so we used "number" ti conver the balance
    : 0;


// Load history
// without this we can't use add spent buttonn
let history = localStorage.getItem("history")
    ? JSON.parse(localStorage.getItem("history"))
    : [];  // this a fallback valuve
    ;

    // ================= THEME LOGIC =================

// Load saved theme
//dark mode
// const savedTheme = localStorage.getItem("theme");
// if (savedTheme === "dark") {
//     document.body.classList.add("dark");

//     themeToggle.innerText = "☀️ Light Mode";
// }

// ================= HELPER FUNCTIONS =================

// Get date & time
function getDateTime() { //Creates a Date object, Stores the current date & time
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { // here localedatestring Converts date into human-readable format..nd en-IN means English (India) it wl maatch the inndiaan time style
        day: "2-digit", //01,02,21,05
        month: "short", //jan, feb, apr
        year: "numeric" //2016,2003,2007
    }); //output wl be 31 Jan 2026

    const time = now.toLocaleTimeString("en-IN", { //here we ignore seconds(ui)
        hour: "2-digit",//08,07,04
        minute: "2-digit" //15,20,60
    });//output wl be 08:15  //it wl automotically handles AM nd PM by seeing the hour..

    return `${date} • ${time}`; //Combine date & time , That dot • is just for nice UI separation — not required, but looks good...
}

// Save to localStorage
function saveData() { //it  wl save the data, without this app wl forget everything..
    localStorage.setItem("balance", balance);
    localStorage.setItem("history", JSON.stringify(history)); // history is an array, localStorage cannot store arrays or objects directly,jSON.stringify()--it converts it to a string..
}

// Update balance UI
function updateBalance() {
    balanceEl.innerText = `₹${balance}`; //This function’s only job is to show the current balance(updated balance) on the screen.
}
                                                                           
// ================= CORE FEATURES =================

// Set balance
function setBalance(e) {
    e.preventDefault();

    const value = Number(initialBalanceInput.value); //it converts the balance from string to a number

    if (value <= 0) { // Balance cannot be 0 or negative
        alert("Enter a valid balance");
        return;
    }

    balance = value;
    history = [];

    saveData();
    updateBalance();
    renderHistory();

    initialBalanceInput.value = "";
}

// Add spend
function addSpend(e) {
    e.preventDefault();

    const title = textInput.value.trim();
    const amount = Number(amountInput.value);

    if (title === "" || amount <= 0) {
        alert("Enter valid spend details");
        return; //This protects your app from bad input.
    }

    if (amount > balance) {
        alert("Insufficient balance"); //Prevents spending more than available balance
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

// Remove spend (refund)
function removeItem(id) {
    const item = history.find(h => h.id === id);

    balance += item.amount;
    history = history.filter(h => h.id !== id);

    saveData();
    updateBalance();
    renderHistory();
}

// Reset balance
function resetBalance()
 {
    const confirmReset = confirm
    (
        "Are you sure you want to reset the balance?\nThis will clear all history."
    );

    if (!confirmReset) return;

    balance = 0;
    history = [];

    localStorage.removeItem("balance");
    localStorage.removeItem("history");

    updateBalance();
    renderHistory();
}

// ================= INIT =================
function init()
 {
    updateBalance();
    renderHistory();
}

// Event listeners
balanceForm.addEventListener("submit", setBalance);
spendForm.addEventListener("submit", addSpend);
resetBtn.addEventListener("click", resetBalance);

// Start app
init();
