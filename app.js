// ========================================
// MG WATCH & EARN
// COMPLETE AUTHENTICATION SYSTEM
// ========================================

// SUPABASE SETTINGS
const SUPABASE_URL = "https://zcadzmhldvfrqtewfuqs.supabase.co";

// IMPORTANT: Replace this with your REAL Supabase publishable key.
// It normally starts with sb_publishable_
// NEVER use your Supabase secret key here.
const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_REAL_PUBLISHABLE_KEY_HERE";


// ========================================
// INITIALISE SUPABASE
// ========================================

let db = null;

try {
    if (!window.supabase) {
        throw new Error("Supabase library did not load.");
    }

    if (
        !SUPABASE_PUBLISHABLE_KEY ||
        SUPABASE_PUBLISHABLE_KEY === "PASTE_YOUR_REAL_PUBLISHABLE_KEY_HERE"
    ) {
        throw new Error("Your Supabase publishable key has not been added.");
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

    // ========================================
    // MESSAGE SYSTEM
    // ========================================

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#00e5a0" : "#ff7777";
    }

    function explainError(error) {
        console.error("MG WATCH & EARN error:", error);

        if (!navigator.onLine) {
            return "You appear to be offline. Please check your internet connection.";
        }

        const errorText = error?.message || String(error);

        if (
            error instanceof TypeError ||
            errorText.toLowerCase().includes("failed to fetch")
        ) {
            return "Connection failed. Check your internet, Supabase project URL, publishable key and Supabase project status.";
        }

        return errorText;
    }

    function setFormLoading(form, loading) {
        const buttons = form.querySelectorAll('button[type="submit"]');

        buttons.forEach(function (button) {
            button.disabled = loading;
            button.textContent = loading
                ? "Please wait..."
                : button.dataset.originalText || button.textContent;
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
    // CHECK EXISTING LOGIN SESSION
    // ========================================

    async function checkSession() {

        if (!db) {
            showMessage("Setup incomplete. Please check your Supabase publishable key.");
            return;
        }

        try {
            const { data, error } = await db.auth.getSession();

            if (error) {
                throw error;
            }

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
    // REGISTER NEW ACCOUNT
    // ========================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!db) {
            showMessage("Supabase is not configured. Check your publishable key.");
            return;
        }

        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        if (password.length < 8) {
            showMessage("Your password must contain at least 8 characters.");
            return;
        }

        setFormLoading(registerForm, true);
        showMessage("Creating your account...", true);

        try {

            const { data, error } = await db.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin +
                        window.location.pathname
                }
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                showMessage("Your account has been created successfully!", true);
                showDashboard(data.session.user);
            } else {
                showMessage(
                    "Registration successful! Please check your email for a verification link.",
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

        if (!db) {
            showMessage("Supabase is not configured. Check your publishable key.");
            return;
        }

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        setFormLoading(loginForm, true);
        showMessage("Logging into your account...", true);

        try {

            const { data, error } = await db.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

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

            if (!db) {
                showMessage("Supabase is not configured.");
                return;
            }

            logoutButton.disabled = true;

            try {

                const { error } = await db.auth.signOut();

                if (error) {
                    throw error;
                }

                showLoginForms();
                showMessage("You have logged out successfully.", true);

            } catch (error) {
                showMessage(explainError(error));

            } finally {
                logoutButton.disabled = false;
            }

        });

    }


    // ========================================
    // AUTOMATIC LOGIN SESSION UPDATES
    // ========================================

    if (db) {
        db.auth.onAuthStateChange(function (event, session) {

            if (session) {
                showDashboard(session.user);
            } else if (event === "SIGNED_OUT") {
                showLoginForms();
            }

        });
    }


    // ========================================
    // INTERNET CONNECTION STATUS
    // ========================================

    window.addEventListener("offline", function () {
        showMessage("Your internet connection has been lost.");
    });

    window.addEventListener("online", function () {
        showMessage("Internet connection restored. You can continue.", true);
    });


    // ========================================
    // START WEBSITE
    // ========================================

    checkSession();

});
