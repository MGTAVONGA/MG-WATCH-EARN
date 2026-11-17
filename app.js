// ========================================
// MG WATCH & EARN
// COMPLETE AUTHENTICATION SYSTEM
// ========================================

// SUPABASE SETTINGS
const SUPABASE_URL = "https://zcadzmhldvfrqtewfuqs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mf5Guob3rMWAld0imIXkqg_nF0NBi9p";

// ========================================
// INITIALISE SUPABASE
// ========================================

let db = null;

try {
    if (!window.supabase) {
        throw new Error("Supabase library did not load.");
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
    console.error("Supabase initialisation error:", error);
}

// ========================================
// MAIN WEBSITE SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");

    const message = document.getElementById("authMessage");
    const dashboard = document.getElementById("userDashboard");
    const userEmail = document.getElementById("userEmail");

    if (!registerForm || !loginForm || !message || !dashboard) {
        console.error("MG WATCH & EARN: Required HTML elements are missing.");
        return;
    }

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#00e5a0" : "#ff7777";
    }

    function explainError(error) {
        console.error("MG WATCH & EARN error:", error);

        if (!navigator.onLine) {
            return "Please check your internet connection.";
        }

        const errorText = error?.message || String(error);

        if (errorText.toLowerCase().includes("failed to fetch")) {
            return "Connection failed. Check your Supabase settings.";
        }

        return errorText;
    }

    function setFormLoading(form, loading) {
        const buttons = form.querySelectorAll('button[type="submit"]');

        buttons.forEach(function (button) {
            button.disabled = loading;
            button.textContent = loading
                ? "Please wait..."
                : button.dataset.originalText;
        });
    }

    document.querySelectorAll('form button[type="submit"]').forEach(function (button) {
        button.dataset.originalText = button.textContent;
    });

    // ========================================
    // DASHBOARD
    // ========================================

    function showDashboard(user) {
        dashboard.hidden = false;
        registerForm.hidden = true;
        loginForm.hidden = true;

        if (userEmail) {
            userEmail.textContent = "Email: " + user.email;
        }
    }

    function showLoginForms() {
        dashboard.hidden = true;
        registerForm.hidden = false;
        loginForm.hidden = false;
    }

    // ========================================
    // CHECK EXISTING SESSION
    // ========================================

    async function checkSession() {

        if (!db) {
            showMessage("Supabase configuration error.");
            return;
        }

        try {
            const { data, error } = await db.auth.getSession();

            if (error) throw error;

            if (data.session) {
                showDashboard(data.session.user);
            } else {
                showLoginForms();
            }

        } catch (error) {
            showLoginForms();
            showMessage(explainError(error));
        }
    }

    // ========================================
    // REGISTRATION
    // ========================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!email || !password) {
            showMessage("Enter your email and password.");
            return;
        }

        if (password.length < 8) {
            showMessage("Password must contain at least 8 characters.");
            return;
        }

        setFormLoading(registerForm, true);
        showMessage("Creating your account...", true);

        try {

            const { data, error } = await db.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin +
                        window.location.pathname
                }
            });

            if (error) throw error;

            if (data.session) {
                showMessage("Account created successfully!", true);
                showDashboard(data.session.user);
            } else {
                showMessage(
                    "Registration successful! Check your email for verification.",
                    true
                );
            }

            registerForm.reset();

        } catch (error) {
            showMessage(explainError(error));

        } finally {
            setFormLoading(registerForm, false);
        }
    });

    // ========================================
    // LOGIN
    // ========================================

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showMessage("Enter your email and password.");
            return;
        }

        setFormLoading(loginForm, true);
        showMessage("Logging in...", true);

        try {

            const { data, error } = await db.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            showMessage("Welcome to MG WATCH & EARN!", true);

            loginForm.reset();

            showDashboard(data.user);

        } catch (error) {
            showMessage(explainError(error));

        } finally {
            setFormLoading(loginForm, false);
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

                showMessage("Successfully logged out.", true);

            } catch (error) {
                showMessage(explainError(error));

            } finally {
                logoutButton.disabled = false;
            }
        });
    }

    // ========================================
    // AUTHENTICATION STATE
    // ========================================

    db.auth.onAuthStateChange(function (event, session) {

        if (session) {
            showDashboard(session.user);
        } else if (event === "SIGNED_OUT") {
            showLoginForms();
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

    checkSession();

});
