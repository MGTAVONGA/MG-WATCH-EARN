// ========================================
// MG WATCH & EARN
// AUTHENTICATION + USER WALLET SYSTEM
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

    if (!registerForm || !loginForm || !message || !dashboard) {
        console.error("Required website elements missing.");
        return;
    }

    // ========================================
    // MESSAGE SYSTEM
    // ========================================

    function showMessage(text, success = false) {

        message.textContent = text;

        message.style.color = success
            ? "#00e5a0"
            : "#ff7777";

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

    function formatMoney(amount) {

        const value = Number(amount);

        if (!Number.isFinite(value)) {
            return "$0.00";
        }

        return "$" + value.toFixed(2);

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
            availableBalanceElement.textContent = "$0.00";
        }

        if (videosWatchedElement) {
            videosWatchedElement.textContent = "0";
        }

        if (rewardsElement) {
            rewardsElement.textContent = "$0.00";
        }

    }

    // ========================================
    // LOAD REAL USER WALLET
    // ========================================

    async function loadWallet(user) {

        if (!user || !user.id) return;

        try {

            if (availableBalanceElement) {
                availableBalanceElement.textContent = "Loading...";
            }

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

                console.warn("User wallet not found.");

                return;

            }

            const balance = Number(data.balance);

            if (!Number.isFinite(balance) || balance < 0) {
                throw new Error("Invalid wallet balance.");
            }

            const currency = data.currency || "USD";

            const formattedBalance =
                new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency
                }).format(balance);

            if (availableBalanceElement) {
                availableBalanceElement.textContent = formattedBalance;
            }

            // Earnings remain zero until verified rewards
            // have been processed by the secure backend.

            if (totalEarningsElement) {
                totalEarningsElement.textContent = formattedBalance;
            }

            if (rewardsElement) {
                rewardsElement.textContent = "$0.00";
            }

            console.log("MG wallet loaded successfully.");

        } catch (error) {

            console.error("Wallet loading error:", error);

            if (availableBalanceElement) {
                availableBalanceElement.textContent = "Unavailable";
            }

        }

    }

    // ========================================
    // LOAD USER ACCOUNT
    // ========================================

    async function loadUserAccount(user) {

        showDashboard(user);

        await loadWallet(user);

    }

    // ========================================
    // CHECK SUPABASE
    // ========================================

    if (!db) {

        showMessage(
            "Supabase connection failed. Refresh the website."
        );

        return;

    }

    // ========================================
    // REGISTRATION
    // ========================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("registerEmail")
            ?.value.trim();

        const password = document
            .getElementById("registerPassword")
            ?.value;

        if (!email || !password) {

            showMessage("Please enter your email and password.");

            return;

        }

        if (password.length < 8) {

            showMessage("Password must contain at least 8 characters.");

            return;

        }

        setLoading(registerForm, true);

        showMessage("Creating your account...", true);

        try {

            const { data, error } = await db.auth.signUp({

                email,
                password,

                options: {

                    emailRedirectTo:
                        window.location.origin +
                        window.location.pathname

                }

            });

            if (error) throw error;

            registerForm.reset();

            if (data.session) {

                await loadUserAccount(data.user);

                showMessage(
                    "Your account was created successfully!",
                    true
                );

            } else {

                showMessage(
                    "Registration successful! Please verify your email.",
                    true
                );

            }

        } catch (error) {

            showMessage(explainError(error));

        } finally {

            setLoading(registerForm, false);

        }

    });

    // ========================================
    // LOGIN
    // ========================================

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("loginEmail")
            ?.value.trim();

        const password = document
            .getElementById("loginPassword")
            ?.value;

        if (!email || !password) {

            showMessage("Enter your email and password.");

            return;

        }

        setLoading(loginForm, true);

        showMessage("Signing in...", true);

        try {

            const { data, error } = await db.auth
                .signInWithPassword({

                    email,
                    password

                });

            if (error) throw error;

            loginForm.reset();

            await loadUserAccount(data.user);

            showMessage(
                "Welcome to MG WATCH & EARN!",
                true
            );

        } catch (error) {

            showMessage(explainError(error));

        } finally {

            setLoading(loginForm, false);

        }

    });

    // ========================================
    // LOGOUT
    // ========================================

    if (logoutButton) {

        logoutButton.addEventListener("click", async function () {

            logoutButton.disabled = true;

            try {

                const { error } = await db.auth.signOut();

                if (error) throw error;

                showLoginForms();

                showMessage(
                    "You have successfully logged out.",
                    true
                );

                document.getElementById("account")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            } catch (error) {

                showMessage(explainError(error));

            } finally {

                logoutButton.disabled = false;

            }

        });

    }

    // ========================================
    // EXISTING LOGIN SESSION
    // ========================================

    async function checkSession() {

        try {

            const { data, error } =
                await db.auth.getSession();

            if (error) throw error;

            if (data.session) {

                await loadUserAccount(data.session.user);

            } else {

                showLoginForms();

            }

        } catch (error) {

            console.error(error);

            showLoginForms();

            showMessage(explainError(error));

        }

    }

    // ========================================
    // AUTHENTICATION CHANGES
    // ========================================

    db.auth.onAuthStateChange((event, session) => {

        if (event === "SIGNED_OUT") {

            showLoginForms();

        } else if (
            session &&
            (event === "SIGNED_IN" ||
             event === "TOKEN_REFRESHED" ||
             event === "USER_UPDATED")
        ) {

            // Run outside the authentication callback
            // to avoid blocking Supabase auth operations.

            setTimeout(() => {
                loadUserAccount(session.user);
            }, 0);

        }

    });

    // ========================================
    // INTERNET STATUS
    // ========================================

    window.addEventListener("offline", function () {

        showMessage("Internet connection lost.");

    });

    window.addEventListener("online", function () {

        showMessage("Internet connection restored.", true);

    });

    // ========================================
    // START WEBSITE
    // ========================================

    await checkSession();

});
