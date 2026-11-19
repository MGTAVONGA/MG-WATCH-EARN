// ========================================
// MG WATCH & EARN
// COMPLETE WEBSITE + ADMIN USER MANAGEMENT
// ========================================

const SUPABASE_URL =
    "https://zcadzmhldvfrqtewfuqs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_mf5Guob3rMWAld0imIXkqg_nF0NBi9p";

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
    console.error("Supabase initialisation:", error);
}

document.addEventListener("DOMContentLoaded", async function () {

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");
    const message = document.getElementById("authMessage");
    const dashboard = document.getElementById("userDashboard");
    const userEmail = document.getElementById("userEmail");
    const advertisementList = document.getElementById("advertisementList");
    const advertisementMessage = document.getElementById("advertisementMessage");

    if (!registerForm || !loginForm || !dashboard || !message) {
        console.error("Required website HTML elements are missing.");
        return;
    }

    if (!db) {
        message.textContent = "Supabase could not connect. Please refresh.";
        return;
    }

    // ========================================
    // MESSAGES
    // ========================================

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#00e5a0" : "#ff7777";
    }

    function explainError(error) {
        console.error(error);

        const text = error?.message || String(error);
        const lower = text.toLowerCase();

        if (!navigator.onLine) {
            return "Please check your internet connection.";
        }

        if (lower.includes("failed to fetch")) {
            return "Connection failed. Please check your internet.";
        }

        if (lower.includes("invalid login credentials")) {
            return "Incorrect email or password.";
        }

        if (lower.includes("email not confirmed")) {
            return "Please verify your email before logging in.";
        }

        return text;
    }

    function setLoading(form, loading) {
        const button = form.querySelector('button[type="submit"]');
        if (!button) return;

        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }

        button.disabled = loading;
        button.textContent = loading
            ? "Please wait..."
            : button.dataset.originalText;
    }

    // ========================================
    // DASHBOARD ELEMENTS
    // ========================================

    const cards = dashboard.querySelectorAll(
        ".dashboard-grid .dashboard-card"
    );

    const totalEarningsElement =
        cards[0]?.querySelector(".balance");

    const availableBalanceElement =
        cards[1]?.querySelector(".balance");

    const videosWatchedElement =
        cards[2]?.querySelector(".balance");

    const rewardsElement =
        cards[3]?.querySelector(".balance");

    function formatMoney(amount, currency = "USD") {
        const value = Number(amount);

        if (!Number.isFinite(value)) return "$0.00";

        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency
            }).format(value);
        } catch {
            return "$" + value.toFixed(2);
        }
    }

    // ========================================
    // LOGIN AND DASHBOARD DISPLAY
    // ========================================

    function showLoginForms() {
        dashboard.hidden = true;
        registerForm.hidden = false;
        loginForm.hidden = false;

        const panel = document.getElementById("mgAdminPanel");
        if (panel) panel.hidden = true;
    }

    function showDashboard(user) {
        dashboard.hidden = false;
        registerForm.hidden = true;
        loginForm.hidden = true;

        if (userEmail) {
            userEmail.textContent = "Email: " + (user.email || "");
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
    // USER WALLET
    // ========================================

    async function loadWallet(user) {
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

            if (availableBalanceElement) {
                availableBalanceElement.textContent =
                    formatMoney(balance, data.currency || "USD");
            }

        } catch (error) {
            console.error("Wallet error:", error);

            if (availableBalanceElement) {
                availableBalanceElement.textContent = "Unavailable";
            }
        }
    }

    // ========================================
    // ADVERTISEMENTS
    // ========================================

    function safeVideoURL(value) {
        if (!value) return null;

        try {
            const url = new URL(value);
            return url.protocol === "https:" ? url.href : null;
        } catch {
            return null;
        }
    }

    async function loadAdvertisements() {
        if (!advertisementList || !advertisementMessage) return;

        advertisementList.replaceChildren();
        advertisementMessage.textContent = "Loading advertisements...";

        try {
            const { data, error } = await db
                .from("advertisements")
                .select("id,title,description,video_url,advertiser_name,duration_seconds")
                .eq("status", "active")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                advertisementMessage.textContent =
                    "No sponsored advertisements are available right now. Please check again later.";
                return;
            }

            const uniqueAds = [
                ...new Map(data.map(ad => [ad.id, ad])).values()
            ];

            advertisementMessage.textContent =
                uniqueAds.length + " sponsored campaign(s) available.";

            uniqueAds.forEach(ad => {
                const card = document.createElement("div");
                card.className = "advertisement-card";

                const title = document.createElement("h3");
                title.textContent = ad.title || "Sponsored advertisement";
                card.appendChild(title);

                const advertiser = document.createElement("p");
                advertiser.textContent =
                    "Sponsored by: " + (ad.advertiser_name || "Advertiser");
                card.appendChild(advertiser);

                const description = document.createElement("p");
                description.textContent = ad.description || "";
                card.appendChild(description);

                const durationSeconds = Math.max(
                    1,
                    Math.floor(Number(ad.duration_seconds) || 15)
                );

                const duration = document.createElement("p");
                duration.textContent =
                    "Video duration: " + durationSeconds + " seconds";
                card.appendChild(duration);

                const videoURL = safeVideoURL(ad.video_url);

                if (videoURL) {
                    const video = document.createElement("video");
                    video.controls = true;
                    video.preload = "metadata";
                    video.playsInline = true;
                    video.src = videoURL;
                    video.style.width = "100%";
                    card.appendChild(video);

                    const timerLabel = document.createElement("p");
                    timerLabel.textContent =
                        "Time watched: 0 / " + durationSeconds + " seconds";

                    const progress = document.createElement("progress");
                    progress.max = durationSeconds;
                    progress.value = 0;
                    progress.style.width = "100%";

                    const status = document.createElement("p");
                    status.textContent = "Play the video to start the timer.";

                    card.append(timerLabel, progress, status);

                    let watched = 0;
                    let interval = null;
                    let lastTime = 0;
                    let completed = false;

                    video.addEventListener("play", () => {
                        if (completed || interval !== null) return;

                        lastTime = video.currentTime;

                        status.textContent =
                            "Demonstration timer running.";

                        interval = setInterval(() => {
                            if (
                                document.visibilityState !== "visible" ||
                                video.paused ||
                                video.ended
                            ) return;

                            const current = video.currentTime;
                            const advanced =
                                current > lastTime + 0.1 &&
                                current - lastTime < 2;

                            lastTime = current;

                            if (advanced) {
                                watched = Math.min(
                                    durationSeconds,
                                    watched + 1
                                );

                                timerLabel.textContent =
                                    "Time watched: " + watched +
                                    " / " + durationSeconds + " seconds";

                                progress.value = watched;
                            }

                            if (watched >= durationSeconds) {
                                completed = true;
                                clearInterval(interval);
                                interval = null;
                                video.pause();

                                status.textContent =
                                    "Demonstration complete. No reward has been issued.";
                            }
                        }, 1000);
                    });

                    function stopTimer() {
                        if (interval !== null) {
                            clearInterval(interval);
                            interval = null;
                        }
                    }

                    video.addEventListener("pause", () => {
                        stopTimer();

                        if (!completed) {
                            status.textContent = "Timer paused.";
                        }
                    });

                    video.addEventListener("ended", stopTimer);

                    video.addEventListener("seeking", () => {
                        lastTime = video.currentTime;
                    });

                    video.addEventListener("seeked", () => {
                        lastTime = video.currentTime;
                    });

                } else if (ad.video_url) {
                    const warning = document.createElement("p");
                    warning.textContent = "This video link cannot be displayed.";
                    card.appendChild(warning);
                }

                advertisementList.appendChild(card);
            });

        } catch (error) {
            console.error("Advertisement error:", error);

            advertisementMessage.textContent =
                "Could not load advertisements. Please try again.";
        }
    }

    // ========================================
    // ADMIN USER MANAGEMENT
    // ========================================

    async function loadAdminUsers(panel) {
        const list = panel.querySelector("#mgAdminUsersList");
        const count = panel.querySelector("#mgAdminUserCount");
        const refresh = panel.querySelector("#mgRefreshUsers");

        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "Loading...";

        list.replaceChildren();

        const loading = document.createElement("p");
        loading.textContent = "Loading registered users...";
        list.appendChild(loading);

        try {
            const { data, error } = await db.rpc("admin_get_users");

            if (error) throw error;

            list.replaceChildren();

            const users = data || [];

            count.textContent =
                "TOTAL REGISTERED USERS: " + users.length;

            if (users.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "No registered users found.";
                list.appendChild(empty);
                return;
            }

            const table = document.createElement("table");

            table.style.cssText =
                "width:100%;border-collapse:collapse;color:white;";

            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");

            ["Email", "Registration date", "Last sign-in"].forEach(label => {
                const th = document.createElement("th");
                th.textContent = label;
                th.style.cssText =
                    "padding:10px;text-align:left;border-bottom:1px solid #00e5a0;";
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");

            users.forEach(user => {
                const row = document.createElement("tr");

                const emailCell = document.createElement("td");
                emailCell.textContent = user.email || "No email";
                emailCell.style.padding = "10px";

                const createdCell = document.createElement("td");
                createdCell.textContent = user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Unknown";
                createdCell.style.padding = "10px";

                const lastCell = document.createElement("td");
                lastCell.textContent = user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Never";
                lastCell.style.padding = "10px";

                row.append(emailCell, createdCell, lastCell);
                tbody.appendChild(row);
            });

            table.appendChild(tbody);

            const wrapper = document.createElement("div");
            wrapper.style.overflowX = "auto";
            wrapper.appendChild(table);

            list.appendChild(wrapper);

        } catch (error) {
            console.error("Admin user loading error:", error);

            list.replaceChildren();

            const errorText = document.createElement("p");
            errorText.textContent =
                "Could not load users: " + (error.message || "Unknown error");

            list.appendChild(errorText);

        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH USER LIST";
        }
    }

    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    async function checkAdminAccess(user) {
        const existing = document.getElementById("mgAdminPanel");

        if (!user || !user.id) {
            if (existing) existing.hidden = true;
            return false;
        }

        try {
            const { data, error } = await db.rpc("is_admin");

            if (error) throw error;

            if (data !== true) {
                if (existing) existing.hidden = true;
                return false;
            }

            let panel = existing;

            if (!panel) {
                panel = document.createElement("section");
                panel.id = "mgAdminPanel";

                panel.style.cssText = [
                    "background:#101d35",
                    "border:1px solid #00e5a0",
                    "border-radius:14px",
                    "padding:22px",
                    "margin:24px 0",
                    "color:#ffffff"
                ].join(";");

                const heading = document.createElement("h2");
                heading.textContent = "MG ADMIN DASHBOARD";

                const status = document.createElement("p");
                status.textContent = "ADMIN STATUS: ACTIVE";
                status.style.color = "#00e5a0";

                const count = document.createElement("h3");
                count.id = "mgAdminUserCount";
                count.textContent = "TOTAL REGISTERED USERS: Loading...";

                const refresh = document.createElement("button");
                refresh.id = "mgRefreshUsers";
                refresh.type = "button";
                refresh.textContent = "REFRESH USER LIST";
                refresh.style.cssText =
                    "background:#00e5a0;color:#071321;padding:12px 18px;border:0;border-radius:6px;cursor:pointer;font-weight:bold;";

                const list = document.createElement("div");
                list.id = "mgAdminUsersList";
                list.style.marginTop = "18px";

                panel.append(heading, status, count, refresh, list);
                dashboard.appendChild(panel);

                refresh.addEventListener("click", () => {
                    loadAdminUsers(panel);
                });
            }

            panel.hidden = false;

            await loadAdminUsers(panel);

            return true;

        } catch (error) {
            console.error("Admin verification error:", error);

            if (existing) existing.hidden = true;

            return false;
        }
    }

    // ========================================
    // LOAD USER ACCOUNT
    // ========================================

    async function loadUserAccount(user) {
        if (!user || !user.id) return;

        showDashboard(user);

        await Promise.all([
            loadWallet(user),
            loadAdvertisements(),
            checkAdminAccess(user)
        ]);
    }

    // ========================================
    // REGISTRATION
    // ========================================

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("registerEmail")?.value.trim();
        const password = document.getElementById("registerPassword")?.value;

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
                        window.location.origin + window.location.pathname
                }
            });

            if (error) throw error;

            registerForm.reset();

            if (data.session) {
                await loadUserAccount(data.user);
                showMessage("Your account was created successfully!", true);
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

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;

        if (!email || !password) {
            showMessage("Enter your email and password.");
            return;
        }

        setLoading(loginForm, true);
        showMessage("Signing in...", true);

        try {
            const { data, error } = await db.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            loginForm.reset();

            await loadUserAccount(data.user);

            showMessage("Welcome to MG WATCH & EARN!", true);

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

                if (advertisementList) {
                    advertisementList.replaceChildren();
                }

                if (advertisementMessage) {
                    advertisementMessage.textContent =
                        "Please log in to view advertisements.";
                }

                showMessage("You have successfully logged out.", true);

            } catch (error) {
                showMessage(explainError(error));
            } finally {
                logoutButton.disabled = false;
            }
        });
    }

    // ========================================
    // SESSION CHECK
    // ========================================

    async function checkSession() {
        try {
            const { data, error } = await db.auth.getSession();

            if (error) throw error;

            if (data.session) {
                await loadUserAccount(data.session.user);
            } else {
                showLoginForms();
            }

        } catch (error) {
            console.error("Session error:", error);
            showLoginForms();
            showMessage(explainError(error));
        }
    }

    // ========================================
    // AUTHENTICATION EVENTS
    // ========================================

    db.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            showLoginForms();

            if (advertisementList) {
                advertisementList.replaceChildren();
            }

        } else if (
            session &&
            (
                event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "USER_UPDATED"
            )
        ) {
            setTimeout(() => {
                loadUserAccount(session.user);
            }, 0);
        }
    });

    // ========================================
    // INTERNET STATUS
    // ========================================

    window.addEventListener("offline", () => {
        showMessage("Internet connection lost.");
    });

    window.addEventListener("online", () => {
        showMessage("Internet connection restored.", true);
    });

    // ========================================
    // START WEBSITE
    // ========================================

    await checkSession();

});
