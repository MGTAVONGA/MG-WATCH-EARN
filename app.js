// ========================================
// MG WATCH & EARN
// COMPLETE WEBSITE + ADMIN MANAGEMENT
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

    const advertisementList =
        document.getElementById("advertisementList");

    const advertisementMessage =
        document.getElementById("advertisementMessage");

    if (!registerForm || !loginForm || !dashboard || !message) {
        console.error("Required HTML elements are missing.");
        return;
    }

    if (!db) {
        message.textContent =
            "Supabase could not connect. Please refresh.";
        return;
    }

    // ========================================
    // GENERAL FUNCTIONS
    // ========================================

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color =
            success ? "#00e5a0" : "#ff7777";
    }

    function explainError(error) {
        console.error(error);

        const text = error?.message || String(error);
        const lower = text.toLowerCase();

        if (!navigator.onLine) {
            return "Please check your internet connection.";
        }

        if (lower.includes("failed to fetch")) {
            return "Connection failed. Check your internet.";
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
        const button =
            form.querySelector('button[type="submit"]');

        if (!button) return;

        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }

        button.disabled = loading;

        button.textContent = loading
            ? "Please wait..."
            : button.dataset.originalText;
    }

    function createElement(tag, text, parent) {
        const element = document.createElement(tag);

        if (text !== undefined && text !== null) {
            element.textContent = text;
        }

        if (parent) parent.appendChild(element);

        return element;
    }

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

    function safeVideoURL(value) {
        if (!value) return null;

        try {
            const url = new URL(value);

            return url.protocol === "https:"
                ? url.href
                : null;

        } catch {
            return null;
        }
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

    // ========================================
    // LOGIN DISPLAY
    // ========================================

    function showLoginForms() {
        dashboard.hidden = true;
        registerForm.hidden = false;
        loginForm.hidden = false;

        const panel =
            document.getElementById("mgAdminPanel");

        if (panel) panel.hidden = true;
    }

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
                availableBalanceElement.textContent =
                    "Unavailable";
                return;
            }

            const balance = Number(data.balance);

            if (!Number.isFinite(balance) || balance < 0) {
                throw new Error("Invalid wallet balance.");
            }

            availableBalanceElement.textContent =
                formatMoney(balance, data.currency || "USD");

        } catch (error) {
            console.error("Wallet error:", error);

            if (availableBalanceElement) {
                availableBalanceElement.textContent =
                    "Unavailable";
            }
        }
    }

    // ========================================
    // USER ADVERTISEMENTS
    // ========================================

    async function loadAdvertisements() {
        if (!advertisementList || !advertisementMessage) return;

        advertisementList.replaceChildren();

        advertisementMessage.textContent =
            "Loading advertisements...";

        try {
            const { data, error } = await db
                .from("advertisements")
                .select(`
                    id,
                    title,
                    description,
                    video_url,
                    advertiser_name,
                    duration_seconds
                `)
                .eq("status", "active")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                advertisementMessage.textContent =
                    "No sponsored advertisements are available right now. Please check again later.";
                return;
            }

            const uniqueAds = [
                ...new Map(
                    data.map(ad => [ad.id, ad])
                ).values()
            ];

            advertisementMessage.textContent =
                uniqueAds.length +
                " sponsored campaign(s) available.";

            uniqueAds.forEach(ad => {

                const card = createElement(
                    "div",
                    undefined,
                    advertisementList
                );

                card.className = "advertisement-card";

                createElement(
                    "h3",
                    ad.title || "Sponsored advertisement",
                    card
                );

                createElement(
                    "p",
                    "Sponsored by: " +
                    (ad.advertiser_name || "Advertiser"),
                    card
                );

                createElement(
                    "p",
                    ad.description || "",
                    card
                );

                const durationSeconds = Math.max(
                    1,
                    Math.floor(Number(ad.duration_seconds) || 15)
                );

                createElement(
                    "p",
                    "Video duration: " +
                    durationSeconds + " seconds",
                    card
                );

                const videoURL =
                    safeVideoURL(ad.video_url);

                if (!videoURL) {
                    createElement(
                        "p",
                        "This video link cannot be displayed.",
                        card
                    );

                    return;
                }

                const video = createElement(
                    "video",
                    undefined,
                    card
                );

                video.controls = true;
                video.preload = "metadata";
                video.playsInline = true;
                video.src = videoURL;
                video.style.width = "100%";

                const timerLabel = createElement(
                    "p",
                    "Time watched: 0 / " +
                    durationSeconds + " seconds",
                    card
                );

                const progress = createElement(
                    "progress",
                    undefined,
                    card
                );

                progress.max = durationSeconds;
                progress.value = 0;
                progress.style.width = "100%";

                const status = createElement(
                    "p",
                    "Play the video to start the timer.",
                    card
                );

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
                                "Time watched: " +
                                watched + " / " +
                                durationSeconds + " seconds";

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
        const list =
            panel.querySelector("#mgAdminUsersList");

        const count =
            panel.querySelector("#mgAdminUserCount");

        const refresh =
            panel.querySelector("#mgRefreshUsers");

        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "Loading...";

        list.replaceChildren();

        createElement(
            "p",
            "Loading registered users...",
            list
        );

        try {
            const { data, error } =
                await db.rpc("admin_get_users");

            if (error) throw error;

            list.replaceChildren();

            const users = data || [];

            count.textContent =
                "TOTAL REGISTERED USERS: " + users.length;

            if (users.length === 0) {
                createElement(
                    "p",
                    "No registered users found.",
                    list
                );

                return;
            }

            const table = createElement(
                "table",
                undefined,
                list
            );

            table.style.cssText =
                "width:100%;border-collapse:collapse;color:white;";

            const thead = createElement(
                "thead",
                undefined,
                table
            );

            const headerRow = createElement(
                "tr",
                undefined,
                thead
            );

            [
                "Email",
                "Registration date",
                "Last sign-in"
            ].forEach(label => {

                const th = createElement(
                    "th",
                    label,
                    headerRow
                );

                th.style.cssText =
                    "padding:10px;text-align:left;border-bottom:1px solid #00e5a0;";
            });

            const tbody = createElement(
                "tbody",
                undefined,
                table
            );

            users.forEach(user => {

                const row = createElement(
                    "tr",
                    undefined,
                    tbody
                );

                const emailCell = createElement(
                    "td",
                    user.email || "No email",
                    row
                );

                const createdCell = createElement(
                    "td",
                    user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Unknown",
                    row
                );

                const lastCell = createElement(
                    "td",
                    user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : "Never",
                    row
                );

                [emailCell, createdCell, lastCell].forEach(cell => {
                    cell.style.padding = "10px";
                });

            });

            const wrapper = createElement(
                "div",
                undefined,
                list
            );

            wrapper.style.overflowX = "auto";
            wrapper.appendChild(table);

        } catch (error) {
            console.error("Admin user loading error:", error);

            list.replaceChildren();

            createElement(
                "p",
                "Could not load users: " +
                (error.message || "Unknown error"),
                list
            );

        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH USER LIST";
        }
    }

    // ========================================
    // ADMIN ADVERTISEMENT MANAGEMENT
    // ========================================

    async function loadAdminAds(panel) {

        const list =
            panel.querySelector("#mgAdminAdsList");

        const count =
            panel.querySelector("#mgAdminAdCount");

        const refresh =
            panel.querySelector("#mgRefreshAds");

        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "Loading...";

        list.replaceChildren();

        createElement(
            "p",
            "Loading advertisements...",
            list
        );

        try {

            const { data, error } =
                await db.rpc("admin_get_ads");

            if (error) throw error;

            list.replaceChildren();

            const ads = data || [];

            count.textContent =
                "TOTAL ADVERTISEMENTS: " + ads.length;

            if (ads.length === 0) {
                createElement(
                    "p",
                    "No advertisements have been created yet.",
                    list
                );

                return;
            }

            ads.forEach(ad => {

                const card = createElement(
                    "div",
                    undefined,
                    list
                );

                card.style.cssText = [
                    "background:#102b48",
                    "padding:16px",
                    "margin:12px 0",
                    "border-radius:9px",
                    "border:1px solid #29445f"
                ].join(";");

                createElement(
                    "h3",
                    ad.title,
                    card
                );

                createElement(
                    "p",
                    "Advertiser: " + ad.advertiser_name,
                    card
                );

                createElement(
                    "p",
                    "Duration: " + ad.duration_seconds + " seconds",
                    card
                );

                createElement(
                    "p",
                    "Status: " + String(ad.status).toUpperCase(),
                    card
                );

                createElement(
                    "p",
                    "Reward amount: " +
                    formatMoney(ad.reward_amount || 0),
                    card
                );

                const buttonArea = createElement(
                    "div",
                    undefined,
                    card
                );

                buttonArea.style.cssText =
                    "display:flex;gap:10px;flex-wrap:wrap;";

                const statusButton = createElement(
                    "button",
                    ad.status === "active"
                        ? "PAUSE ADVERTISEMENT"
                        : "ACTIVATE ADVERTISEMENT",
                    buttonArea
                );

                statusButton.type = "button";

                statusButton.addEventListener("click", async () => {

                    const newStatus =
                        ad.status === "active"
                            ? "paused"
                            : "active";

                    statusButton.disabled = true;

                    try {

                        const { error } = await db.rpc(
                            "admin_update_ad_status",
                            {
                                p_ad_id: ad.id,
                                p_status: newStatus
                            }
                        );

                        if (error) throw error;

                        showMessage(
                            "Advertisement status updated.",
                            true
                        );

                        await Promise.all([
                            loadAdminAds(panel),
                            loadAdvertisements()
                        ]);

                    } catch (error) {
                        showMessage(explainError(error));
                        statusButton.disabled = false;
                    }

                });

                statusButton.style.cssText =
                    "background:#00e5a0;color:#071321;padding:10px;border:0;border-radius:5px;cursor:pointer;font-weight:bold;";

                const deleteButton = createElement(
                    "button",
                    "DELETE ADVERTISEMENT",
                    buttonArea
                );

                deleteButton.type = "button";

                deleteButton.style.cssText =
                    "background:#d93636;color:white;padding:10px;border:0;border-radius:5px;cursor:pointer;font-weight:bold;";

                deleteButton.addEventListener("click", async () => {

                    const confirmed = window.confirm(
                        "Are you sure you want to delete this advertisement?"
                    );

                    if (!confirmed) return;

                    deleteButton.disabled = true;

                    try {

                        const { error } = await db.rpc(
                            "admin_delete_ad",
                            {
                                p_ad_id: ad.id
                            }
                        );

                        if (error) throw error;

                        showMessage(
                            "Advertisement deleted successfully.",
                            true
                        );

                        await Promise.all([
                            loadAdminAds(panel),
                            loadAdvertisements()
                        ]);

                    } catch (error) {
                        showMessage(explainError(error));
                        deleteButton.disabled = false;
                    }

                });

            });

        } catch (error) {

            console.error("Admin advertisement error:", error);

            list.replaceChildren();

            createElement(
                "p",
                "Could not load advertisements: " +
                (error.message || "Unknown error"),
                list
            );

        } finally {

            refresh.disabled = false;
            refresh.textContent = "REFRESH ADVERTISEMENTS";

        }
    }

    // ========================================
    // CREATE ADVERTISEMENT
    // ========================================

    async function createAdvertisement(form, panel) {

        const title =
            form.querySelector("#mgAdTitle").value.trim();

        const advertiser =
            form.querySelector("#mgAdAdvertiser").value.trim();

        const description =
            form.querySelector("#mgAdDescription").value.trim();

        const videoURL =
            form.querySelector("#mgAdVideoURL").value.trim();

        const duration =
            Number(form.querySelector("#mgAdDuration").value);

        if (!title || !advertiser || !videoURL) {
            showMessage(
                "Please complete the title, advertiser and video link."
            );
            return;
        }

        if (!safeVideoURL(videoURL)) {
            showMessage(
                "Please enter a valid HTTPS video link."
            );
            return;
        }

        if (
            !Number.isInteger(duration) ||
            duration < 1 ||
            duration > 3600
        ) {
            showMessage(
                "Duration must be between 1 and 3600 seconds."
            );
            return;
        }

        const submit =
            form.querySelector('button[type="submit"]');

        submit.disabled = true;
        submit.textContent = "CREATING...";

        try {

            const { data, error } = await db.rpc(
                "admin_create_ad",
                {
                    p_title: title,
                    p_description: description,
                    p_video_url: videoURL,
                    p_advertiser_name: advertiser,
                    p_duration_seconds: duration
                }
            );

            if (error) throw error;

            form.reset();

            form.querySelector("#mgAdDuration").value = 15;

            showMessage(
                "Advertisement created successfully!",
                true
            );

            console.log("New advertisement ID:", data);

            await Promise.all([
                loadAdminAds(panel),
                loadAdvertisements()
            ]);

        } catch (error) {

            showMessage(explainError(error));

        } finally {

            submit.disabled = false;
            submit.textContent = "CREATE ADVERTISEMENT";

        }
    }

    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    async function checkAdminAccess(user) {

        const existingPanels =
            document.querySelectorAll("#mgAdminPanel");

        let panel = existingPanels[0] || null;

        existingPanels.forEach((item, index) => {
            if (index > 0) item.remove();
        });

        if (!user || !user.id) {
            if (panel) panel.hidden = true;
            return false;
        }

        try {

            const { data, error } =
                await db.rpc("is_admin");

            if (error) throw error;

            if (data !== true) {
                if (panel) panel.hidden = true;
                return false;
            }

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

                dashboard.querySelector(
                    ".dashboard-container"
                ).appendChild(panel);

                // ADMIN HEADING

                createElement(
                    "h2",
                    "MG ADMIN DASHBOARD",
                    panel
                );

                const status = createElement(
                    "p",
                    "ADMIN STATUS: ACTIVE",
                    panel
                );

                status.style.color = "#00e5a0";

                // USER MANAGEMENT

                createElement(
                    "hr",
                    undefined,
                    panel
                );

                createElement(
                    "h2",
                    "👥 USER MANAGEMENT",
                    panel
                );

                const userCount = createElement(
                    "h3",
                    "TOTAL REGISTERED USERS: Loading...",
                    panel
                );

                userCount.id = "mgAdminUserCount";

                const userRefresh = createElement(
                    "button",
                    "REFRESH USER LIST",
                    panel
                );

                userRefresh.id = "mgRefreshUsers";
                userRefresh.type = "button";

                const userList = createElement(
                    "div",
                    undefined,
                    panel
                );

                userList.id = "mgAdminUsersList";

                userRefresh.addEventListener("click", () => {
                    loadAdminUsers(panel);
                });

                // ADVERTISEMENT MANAGEMENT

                createElement(
                    "hr",
                    undefined,
                    panel
                );

                createElement(
                    "h2",
                    "📢 ADVERTISEMENT MANAGEMENT",
                    panel
                );

                createElement(
                    "p",
                    "Create and manage sponsored campaigns.",
                    panel
                );

                // CREATE AD FORM

                const form = createElement(
                    "form",
                    undefined,
                    panel
                );

                form.id = "mgCreateAdForm";

                function addAdminInput(
                    id,
                    placeholder,
                    type = "text",
                    required = true
                ) {

                    const input = document.createElement("input");

                    input.id = id;
                    input.type = type;
                    input.placeholder = placeholder;
                    input.required = required;

                    input.style.cssText = [
                        "display:block",
                        "width:100%",
                        "padding:13px",
                        "margin:10px 0",
                        "box-sizing:border-box",
                        "border-radius:6px",
                        "border:1px solid #496078"
                    ].join(";");

                    form.appendChild(input);

                    return input;
                }

                addAdminInput(
                    "mgAdTitle",
                    "Advertisement title"
                );

                addAdminInput(
                    "mgAdAdvertiser",
                    "Advertiser / Company name"
                );

                const descriptionInput =
                    document.createElement("textarea");

                descriptionInput.id = "mgAdDescription";
                descriptionInput.placeholder =
                    "Advertisement description";

                descriptionInput.style.cssText = [
                    "display:block",
                    "width:100%",
                    "min-height:85px",
                    "padding:13px",
                    "margin:10px 0",
                    "box-sizing:border-box",
                    "border-radius:6px"
                ].join(";");

                form.appendChild(descriptionInput);

                addAdminInput(
                    "mgAdVideoURL",
                    "HTTPS video link",
                    "url"
                );

                const durationInput = addAdminInput(
                    "mgAdDuration",
                    "Duration in seconds",
                    "number"
                );

                durationInput.min = "1";
                durationInput.max = "3600";
                durationInput.value = "15";

                const createButton = createElement(
                    "button",
                    "CREATE ADVERTISEMENT",
                    form
                );

                createButton.type = "submit";

                createButton.style.cssText = [
                    "background:#00e5a0",
                    "color:#071321",
                    "padding:14px 20px",
                    "border:0",
                    "border-radius:6px",
                    "font-weight:bold",
                    "cursor:pointer"
                ].join(";");

                form.addEventListener("submit", event => {
                    event.preventDefault();
                    createAdvertisement(form, panel);
                });

                // EXISTING ADVERTISEMENTS

                createElement(
                    "hr",
                    undefined,
                    panel
                );

                createElement(
                    "h2",
                    "📋 EXISTING ADVERTISEMENTS",
                    panel
                );

                const adCount = createElement(
                    "h3",
                    "TOTAL ADVERTISEMENTS: Loading...",
                    panel
                );

                adCount.id = "mgAdminAdCount";

                const adRefresh = createElement(
                    "button",
                    "REFRESH ADVERTISEMENTS",
                    panel
                );

                adRefresh.id = "mgRefreshAds";
                adRefresh.type = "button";

                const adList = createElement(
                    "div",
                    undefined,
                    panel
                );

                adList.id = "mgAdminAdsList";

                adRefresh.addEventListener("click", () => {
                    loadAdminAds(panel);
                });

                // SECURITY NOTICE

                createElement(
                    "hr",
                    undefined,
                    panel
                );

                const notice = createElement(
                    "p",
                    "IMPORTANT: Advertisements currently receive zero automatic reward credit. Sponsor funding and verified reward processing must be implemented before payments are enabled.",
                    panel
                );

                notice.style.cssText =
                    "color:#ffcf70;font-size:13px;";

            }

            panel.hidden = false;

            await Promise.all([
                loadAdminUsers(panel),
                loadAdminAds(panel)
            ]);

            return true;

        } catch (error) {

            console.error("Admin verification error:", error);

            if (panel) panel.hidden = true;

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

        const email =
            document.getElementById("registerEmail")?.value.trim();

        const password =
            document.getElementById("registerPassword")?.value;

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        if (password.length < 8) {
            showMessage(
                "Password must contain at least 8 characters."
            );
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

        const email =
            document.getElementById("loginEmail")?.value.trim();

        const password =
            document.getElementById("loginPassword")?.value;

        if (!email || !password) {
            showMessage("Enter your email and password.");
            return;
        }

        setLoading(loginForm, true);

        showMessage("Signing in...", true);

        try {

            const { data, error } =
                await db.auth.signInWithPassword({
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

                if (advertisementList) {
                    advertisementList.replaceChildren();
                }

                if (advertisementMessage) {
                    advertisementMessage.textContent =
                        "Please log in to view advertisements.";
                }

                showMessage(
                    "You have successfully logged out.",
                    true
                );

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

            const { data, error } =
                await db.auth.getSession();

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
        showMessage(
            "Internet connection restored.",
            true
        );
    });

    // ========================================
    // START WEBSITE
    // ========================================

    await checkSession();

});
