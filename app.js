// ========================================
// MG WATCH & EARN
// AUTHENTICATION + WALLET + ADVERTISEMENTS
// ========================================

// SUPABASE CONFIGURATION

const SUPABASE_URL =
    "https://zcadzmhldvfrqtewfuqs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_mf5Guob3rMWAld0imIXkqg_nF0NBi9p";

// ========================================
// INITIALISE SUPABASE
// ========================================

let db = null;

try {
    if (!window.supabase) {
        throw new Error("Supabase library not loaded.");
    }

    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );

} catch (error) {
    console.error("Supabase error:", error);
}

// ========================================
// MAIN WEBSITE
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");

    const message = document.getElementById("authMessage");
    const dashboard = document.getElementById("userDashboard");
    const userEmail = document.getElementById("userEmail");

    const advertisementList =
        document.getElementById("advertisementList");

    const advertisementMessage =
        document.getElementById("advertisementMessage");

    if (!registerForm || !loginForm || !message || !dashboard) {
        console.error("Required website elements missing.");
        return;
    }

    // ========================================
    // MESSAGE SYSTEM
    // ========================================

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#00e5a0" : "#ff7777";
    }

    function explainError(error) {

        console.error("MG WATCH & EARN:", error);

        const text = error?.message || String(error);
        const lower = text.toLowerCase();

        if (!navigator.onLine) {
            return "Please check your internet connection.";
        }

        if (lower.includes("failed to fetch")) {
            return "Connection failed. Please check your internet and Supabase.";
        }

        if (lower.includes("invalid login credentials")) {
            return "Incorrect email or password.";
        }

        if (lower.includes("already registered")) {
            return "This email is already registered. Please log in.";
        }

        if (lower.includes("email not confirmed")) {
            return "Please verify your email before logging in.";
        }

        if (lower.includes("permission denied") ||
            lower.includes("row-level security")) {
            return "Database permission error. Please contact support.";
        }

        return text;
    }

    // ========================================
    // LOADING BUTTONS
    // ========================================

    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.dataset.originalText = button.textContent;
    });

    function setLoading(form, loading) {

        const button = form.querySelector('button[type="submit"]');

        if (!button) return;

        button.disabled = loading;

        button.textContent = loading
            ? "Please wait..."
            : button.dataset.originalText;
    }

    // ========================================
    // DASHBOARD ELEMENTS
    // ========================================

    const dashboardCards = dashboard.querySelectorAll(
        ".dashboard-grid .dashboard-card"
    );

    const totalEarningsElement =
        dashboardCards[0]?.querySelector(".balance");

    const availableBalanceElement =
        dashboardCards[1]?.querySelector(".balance");

    const videosWatchedElement =
        dashboardCards[2]?.querySelector(".balance");

    const rewardsElement =
        dashboardCards[3]?.querySelector(".balance");

    // ========================================
    // FORMAT MONEY
    // ========================================

    function formatMoney(amount, currency = "USD") {

        const value = Number(amount);

        if (!Number.isFinite(value)) {
            return "$0.00";
        }

        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency
            }).format(value);
        } catch {
            return "$" + value.toFixed(2);
        }
    }

    // ========================================
    // SHOW LOGIN FORMS
    // ========================================

    function showLoginForms() {

        dashboard.hidden = true;

        registerForm.hidden = false;
        loginForm.hidden = false;
    }

    // ========================================
    // SHOW DASHBOARD
    // ========================================

    function showDashboard(user) {

        dashboard.hidden = false;

        registerForm.hidden = true;
        loginForm.hidden = true;

        if (userEmail) {
            userEmail.textContent =
                "Email: " + (user.email || "");
        }

        if (totalEarningsElement) {
            totalEarningsElement.textContent = "$0.00";
        }

        if (availableBalanceElement) {
            availableBalanceElement.textContent = "Loading...";
        }

        if (videosWatchedElement) {
            videosWatchedElement.textContent = "0";
        }

        if (rewardsElement) {
            rewardsElement.textContent = "$0.00";
        }
    }

    // ========================================
    // LOAD USER WALLET
    // ========================================

    async function loadWallet(user) {

        if (!user || !user.id) return;

        try {

            const { data, error } = await db
                .from("user_wallets")
                .select("balance, currency")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                if (availableBalanceElement) {
                    availableBalanceElement.textContent = "Unavailable";
                }
                return;
            }

            const balance = Number(data.balance);

            if (!Number.isFinite(balance) || balance < 0) {
                throw new Error("Invalid wallet balance.");
            }

            const currency = data.currency || "USD";

            if (availableBalanceElement) {
                availableBalanceElement.textContent =
                    formatMoney(balance, currency);
            }

            if (totalEarningsElement) {
                totalEarningsElement.textContent = "$0.00";
            }

        } catch (error) {

            console.error("Wallet loading error:", error);

            if (availableBalanceElement) {
                availableBalanceElement.textContent = "Unavailable";
            }
        }
    }
