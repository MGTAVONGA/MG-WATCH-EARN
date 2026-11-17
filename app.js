// ========================================
// MG WATCH & EARN
// REGISTRATION, LOGIN AND USER DASHBOARD
// ========================================

const SUPABASE_URL = "https://zcadzmhldvfrqtewfuqs.supabase.co";
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener("DOMContentLoaded", async function () {

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");

    const message = document.getElementById("authMessage");
    const dashboard = document.getElementById("userDashboard");
    const userEmail = document.getElementById("userEmail");

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#00e5a0" : "#ff7777";
    }

    async function updateDashboard() {

        const { data, error } = await db.auth.getUser();

        if (error) {
            showMessage(error.message);
            return;
        }

        const user = data.user;

        if (user) {
            dashboard.hidden = false;
            userEmail.textContent = "Email: " + user.email;
            registerForm.hidden = true;
            loginForm.hidden = true;
        } else {
            dashboard.hidden = true;
            registerForm.hidden = false;
            loginForm.hidden = false;
        }
    }

    // REGISTRATION

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        showMessage("Creating your account...");

        const { data, error } = await db.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin +
                    window.location.pathname
            }
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        if (data.session) {
            showMessage("Account created successfully!", true);
            await updateDashboard();
        } else {
            showMessage(
                "Registration received! Please check your email to verify your account.",
                true
            );
        }

        registerForm.reset();
    });

    // LOGIN

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        showMessage("Logging in...");

        const { error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        showMessage("Welcome to MG WATCH & EARN!", true);

        loginForm.reset();
        await updateDashboard();
    });

    // LOGOUT

    logoutButton.addEventListener("click", async function () {

        const { error } = await db.auth.signOut();

        if (error) {
            showMessage(error.message);
            return;
        }

        showMessage("You have logged out successfully.", true);

        await updateDashboard();
    });

    // CHECK LOGIN STATUS

    await updateDashboard();

});
