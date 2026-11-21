
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,// ========================================
// MG WATCH & EARN
// COMPLETE WEBSITE + ADMIN MANAGEMENT
// STAGE 8: USER REWARDS & WATCH HISTORY
// FIXED: DUPLICATE LOADING
// ========================================

// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://zcadzmhldvfrqtewfuqs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_mf5Guob3rMWAld0imIXkqg_nF0NBi9p";

let db = null;
let adminAccessCheckInProgress = false;

try {
    if (!window.supabase) {
        throw new Error("Supabase library not loaded.");
    }

    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
                detectSessionInUrl: true
            }
        }
    );

} catch (error) {
    console.error("Supabase initialisation:", error);
}

// ========================================
// WEBSITE INITIALISATION
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");
    const message = document.getElementById("authMessage");
    const dashboard = document.getElementById("userDashboard");
    const userEmail = document.getElementById("userEmail");
const advertiserApplicationForm =
    document.getElementById("advertiserApplicationForm");
    const advertisementList =
        document.getElementById("advertisementList");
const advertiserCampaignForm =
    document.getElementById("advertiserCampaignForm");

const advertiserCampaignSection =
    document.getElementById("advertiserCampaignSection");
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
    // LOADING PROTECTION
    // ========================================

    let currentUser = null;

    let accountLoadPromise = null;
    let lastLoadedUserId = null;
    let accountLoadGeneration = 0;

    let advertisementLoadPromise = null;

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

        if (parent) {
            parent.appendChild(element);
        }

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

    function styleAdminButton(button, background = "#00e5a0") {
        button.style.cssText = [
            "background:" + background,
            "color:#071321",
            "padding:11px 15px",
            "border:0",
            "border-radius:6px",
            "font-weight:bold",
            "cursor:pointer",
            "margin:5px"
        ].join(";");
    }

    function createAdminTable(parent, headings) {
        const wrapper = createElement("div", undefined, parent);
        wrapper.style.overflowX = "auto";

        const table = createElement("table", undefined, wrapper);

        table.style.cssText =
            "width:100%;border-collapse:collapse;color:white;";

        const thead = createElement("thead", undefined, table);
        const headerRow = createElement("tr", undefined, thead);

        headings.forEach(label => {
            const th = createElement("th", label, headerRow);

            th.style.cssText =
                "padding:10px;text-align:left;border-bottom:1px solid #00e5a0;white-space:nowrap;";
        });

        return createElement("tbody", undefined, table);
    }

    function addAdminTableRow(tbody, values) {
        const row = createElement("tr", undefined, tbody);

        values.forEach(value => {
            const cell = createElement(
                "td",
                value === null || value === undefined
                    ? ""
                    : String(value),
                row
            );

            cell.style.cssText =
                "padding:10px;border-bottom:1px solid #29445f;white-space:nowrap;";
        });

        return row;
    }

    function formatDate(value) {
        if (!value) return "Unknown";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? "Unknown"
            : date.toLocaleString();
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
if (advertiserCampaignSection) {
    advertiserCampaignSection.hidden = true;
}if (advertiserCampaignSection) {
    advertiserCampaignSection.hidden = true;
}
        registerForm.hidden = false;
        loginForm.hidden = false;

        const panel = document.getElementById("mgAdminPanel");
        if (panel) panel.hidden = true;

        const userPanel =
            document.getElementById("mgUserActivityPanel");

        if (userPanel) userPanel.hidden = true;
    }

    function showDashboard(user) {
        dashboard.hidden = false;
if (advertiserCampaignSection) {
    advertiserCampaignSection.hidden = false;
}
        registerForm.hidden = true;
        loginForm.hidden = true;

        if (userEmail) {
            userEmail.textContent =
                "Email: " + (user.email || "");
        }

        if (totalEarningsElement) {
            totalEarningsElement.textContent = "Loading...";
        }

        if (availableBalanceElement) {
            availableBalanceElement.textContent = "Loading...";
        }

        if (videosWatchedElement) {
            videosWatchedElement.textContent = "Loading...";
        }

        if (rewardsElement) {
            rewardsElement.textContent = "Loading...";
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

            if (currentUser?.id !== user.id) return;

            if (!data) {
                if (availableBalanceElement) {
                    availableBalanceElement.textContent =
                        "Unavailable";
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

            if (currentUser?.id === user.id &&
                availableBalanceElement) {
                availableBalanceElement.textContent = "Unavailable";
            }
        }
    }

    // ========================================
    // USER ACTIVITY PANEL
    // ========================================

    function createUserActivityPanel() {
        const existing =
            document.getElementById("mgUserActivityPanel");

        if (existing) return existing;

        const container =
            dashboard.querySelector(".dashboard-container");

        if (!container) {
            console.error("Dashboard container not found.");
            return null;
        }

        const panel = createElement("section", undefined, container);

        panel.id = "mgUserActivityPanel";

        panel.style.cssText = [
            "background:#101d35",
            "border:1px solid #00e5a0",
            "border-radius:14px",
            "padding:20px",
            "margin:25px 0",
            "color:white"
        ].join(";");

        createElement("hr", undefined, panel);
        createElement("h2", "💰 MY REWARDS", panel);

        createElement(
            "p",
            "Track your pending, approved and rejected rewards.",
            panel
        );

        const rewardSummary =
            createElement("h3", "Loading rewards...", panel);

        rewardSummary.id = "mgMyRewardSummary";

        const rewardRefresh =
            createElement("button", "REFRESH MY REWARDS", panel);

        rewardRefresh.type = "button";
        styleAdminButton(rewardRefresh);

        const rewardList = createElement("div", undefined, panel);
        rewardList.id = "mgMyRewardsList";

        rewardRefresh.addEventListener("click", () => {
            if (currentUser) loadUserActivity(currentUser);
        });

        createElement("hr", undefined, panel);
        createElement("h2", "🎬 MY WATCH HISTORY", panel);

        createElement(
            "p",
            "See the advertisements you have completed.",
            panel
        );

        const historySummary =
            createElement("h3", "Loading watch history...", panel);

        historySummary.id = "mgMyHistorySummary";

        const historyList = createElement("div", undefined, panel);
        historyList.id = "mgMyWatchHistory";

        createElement("hr", undefined, panel);
        createElement("h2", "📊 MY TRANSACTIONS", panel);

        createElement(
            "p",
            "View wallet credits and debits.",
            panel
        );

        const transactionSummary =
            createElement("h3", "Loading transactions...", panel);

        transactionSummary.id = "mgMyTransactionSummary";

        const transactionRefresh =
            createElement("button", "REFRESH MY TRANSACTIONS", panel);

        transactionRefresh.type = "button";
        styleAdminButton(transactionRefresh);

        const transactionList =
            createElement("div", undefined, panel);

        transactionList.id = "mgMyTransactions";

        transactionRefresh.addEventListener("click", () => {
            if (currentUser) loadUserActivity(currentUser);
        });

        return panel;
    }

    // ========================================
    // LOAD USER ACTIVITY
    // ========================================

    async function loadUserActivity(user) {
        if (!user || !user.id || currentUser?.id !== user.id) return;

        const panel = createUserActivityPanel();
        if (!panel) return;

        panel.hidden = false;

        const rewardList = panel.querySelector("#mgMyRewardsList");
        const rewardSummary = panel.querySelector("#mgMyRewardSummary");
        const historyList = panel.querySelector("#mgMyWatchHistory");
        const historySummary = panel.querySelector("#mgMyHistorySummary");
        const transactionList = panel.querySelector("#mgMyTransactions");
        const transactionSummary = panel.querySelector("#mgMyTransactionSummary");

        rewardList.replaceChildren();
        historyList.replaceChildren();
        transactionList.replaceChildren();

        createElement("p", "Loading rewards...", rewardList);
        createElement("p", "Loading watch history...", historyList);
        createElement("p", "Loading transactions...", transactionList);

        try {
            const [
                rewardsResult,
                historyResult,
                transactionsResult
            ] = await Promise.all([
                db.from("user_rewards")
                    .select("id, advertisement_id, amount, status, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),

                db.from("ad_watch_history")
                    .select("id, advertisement_id, completed, watched_seconds, reward_amount, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),

                db.from("wallet_transactions")
                    .select("id, amount, transaction_type, description, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
            ]);

            if (currentUser?.id !== user.id) return;

            if (rewardsResult.error) throw rewardsResult.error;
            if (historyResult.error) throw historyResult.error;
            if (transactionsResult.error) throw transactionsResult.error;

            const rewards = rewardsResult.data || [];
            const history = historyResult.data || [];
            const transactions = transactionsResult.data || [];

            const adIds = [
                ...new Set([
                    ...rewards.map(item => item.advertisement_id),
                    ...history.map(item => item.advertisement_id)
                ].filter(Boolean))
            ];

            let adTitles = {};

            if (adIds.length > 0) {
                const { data: ads, error: adsError } = await db
                    .from("advertisements")
                    .select("id, title")
                    .in("id", adIds);

                if (!adsError && ads) {
                    ads.forEach(ad => {
                        adTitles[ad.id] = ad.title;
                    });
                }
            }

            if (currentUser?.id !== user.id) return;

            function getAdTitle(id) {
                return adTitles[id] || "Advertisement";
            }

            const pending = rewards.filter(item => item.status === "pending");
            const approved = rewards.filter(item => item.status === "approved");
            const rejected = rewards.filter(item => item.status === "rejected");

            const approvedTotal = approved.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );

            const pendingTotal = pending.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );

            rewardSummary.textContent =
                "TOTAL: " + rewards.length +
                " | PENDING: " + pending.length +
                " (" + formatMoney(pendingTotal) + ")" +
                " | APPROVED: " + approved.length +
                " (" + formatMoney(approvedTotal) + ")" +
                " | REJECTED: " + rejected.length;

            if (totalEarningsElement) {
                totalEarningsElement.textContent = formatMoney(approvedTotal);
            }

            if (rewardsElement) {
                rewardsElement.textContent = formatMoney(approvedTotal);
            }

            rewardList.replaceChildren();

            if (rewards.length === 0) {
                createElement(
                    "p",
                    "You do not have any rewards yet. Complete sponsored advertisements to start earning eligible rewards.",
                    rewardList
                );
            } else {
                rewards.forEach(reward => {
                    const card = createElement("div", undefined, rewardList);

                    card.style.cssText =
                        "background:#102b48;padding:14px;margin:10px 0;border-radius:8px;border:1px solid #29445f;";

                    createElement("h3", getAdTitle(reward.advertisement_id), card);
                    createElement("p", "Amount: " + formatMoney(reward.amount), card);
                    createElement("p", "Date: " + formatDate(reward.created_at), card);

                    const status = createElement(
                        "p",
                        "STATUS: " + String(reward.status || "unknown").toUpperCase(),
                        card
                    );

                    status.style.fontWeight = "bold";
                    status.style.color =
                        reward.status === "approved" ? "#00e5a0" :
                        reward.status === "pending" ? "#ffcf70" : "#ff7777";
                });
            }

            const completedHistory = history.filter(
                item => item.completed === true
            );

            historySummary.textContent =
                "TOTAL WATCH RECORDS: " + history.length +
                " | COMPLETED: " + completedHistory.length;

            if (videosWatchedElement) {
                videosWatchedElement.textContent =
                    String(completedHistory.length);
            }

            historyList.replaceChildren();

            if (history.length === 0) {
                createElement(
                    "p",
                    "You have not completed any sponsored advertisements yet.",
                    historyList
                );
            } else {
                history.forEach(item => {
                    const card = createElement("div", undefined, historyList);

                    card.style.cssText =
                        "background:#102b48;padding:14px;margin:10px 0;border-radius:8px;border:1px solid #29445f;";

                    createElement("h3", getAdTitle(item.advertisement_id), card);

                    createElement(
                        "p",
                        "Watched: " + Number(item.watched_seconds || 0) + " seconds",
                        card
                    );

                    createElement(
                        "p",
                        "Recorded reward: " + formatMoney(item.reward_amount || 0),
                        card
                    );

                    createElement("p", "Date: " + formatDate(item.created_at), card);

                    const completion = createElement(
                        "p",
                        item.completed ? "COMPLETED" : "NOT COMPLETED",
                        card
                    );

                    completion.style.color =
                        item.completed ? "#00e5a0" : "#ffcf70";
                });
            }

            const credits = transactions.filter(
                item => String(item.transaction_type).toLowerCase() === "credit"
            );

            const debits = transactions.filter(
                item => String(item.transaction_type).toLowerCase() === "debit"
            );

            transactionSummary.textContent =
                "TOTAL TRANSACTIONS: " + transactions.length +
                " | CREDITS: " + credits.length +
                " | DEBITS: " + debits.length;

            transactionList.replaceChildren();

            if (transactions.length === 0) {
                createElement("p", "No wallet transactions found yet.", transactionList);
            } else {
                transactions.forEach(transaction => {
                    const card = createElement("div", undefined, transactionList);

                    card.style.cssText =
                        "background:#102b48;padding:14px;margin:10px 0;border-radius:8px;border:1px solid #29445f;";

                    const type = String(
                        transaction.transaction_type || "unknown"
                    ).toLowerCase();

                    const amount = createElement(
                        "h3",
                        (type === "credit" ? "+ " : type === "debit" ? "- " : "") +
                        formatMoney(transaction.amount),
                        card
                    );

                    amount.style.color =
                        type === "credit" ? "#00e5a0" :
                        type === "debit" ? "#ff7777" : "white";

                    createElement("p", "Type: " + type.toUpperCase(), card);

                    createElement(
                        "p",
                        "Description: " + (transaction.description || "Wallet transaction"),
                        card
                    );

                    createElement("p", "Date: " + formatDate(transaction.created_at), card);
                });
            }

        } catch (error) {
            console.error("User activity error:", error);

            if (currentUser?.id !== user.id) return;

            rewardSummary.textContent = "Could not load reward information.";
            historySummary.textContent = "Could not load watch history.";
            transactionSummary.textContent = "Could not load transactions.";

            rewardList.replaceChildren();
            historyList.replaceChildren();
            transactionList.replaceChildren();

            createElement("p", explainError(error), rewardList);
        }
    }

    // ========================================
    // USER ADVERTISEMENTS
    // ========================================

    async function loadAdvertisements() {

        if (!advertisementList || !advertisementMessage) return;

        // PREVENT OVERLAPPING REQUESTS

        if (advertisementLoadPromise) {
            return advertisementLoadPromise;
        }

        const loadPromise = (async () => {

            advertisementList.replaceChildren();

            advertisementMessage.textContent =
                "Loading sponsored advertisements...";

            try {
                const { data, error } = await db
                    .from("advertisements")
                    .select(`
                        id,
                        title,
                        description,
                        video_url,
                        advertiser_name,
                        duration_seconds,
                        created_at
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
                    ...new Map(data.map(ad => [ad.id, ad])).values()
                ];

                advertisementMessage.textContent =
                    uniqueAds.length + " sponsored campaign(s) available.";

                uniqueAds.forEach(ad => {

                    const card = createElement("div", undefined, advertisementList);
                    card.className = "advertisement-card";

                    createElement("h3", ad.title || "Sponsored advertisement", card);

                    createElement(
                        "p",
                        "Sponsored by: " + (ad.advertiser_name || "Advertiser"),
                        card
                    );

                    createElement("p", ad.description || "", card);

                    const duration = Math.max(
                        1,
                        Math.floor(Number(ad.duration_seconds) || 15)
                    );

                    createElement(
                        "p",
                        "Required viewing time: " + duration + " seconds",
                        card
                    );

                    const videoURL = safeVideoURL(ad.video_url);

                    if (!videoURL) {
                        createElement(
                            "p",
                            "This advertisement does not have a valid HTTPS video link.",
                            card
                        );
                        return;
                    }

                    const video = createElement("video", undefined, card);

                    video.controls = false;
                    video.preload = "metadata";
                    video.playsInline = true;
                    video.style.width = "100%";
                    video.style.display = "none";
                    video.src = videoURL;

                    const startButton = createElement(
                        "button",
                        "START WATCHING",
                        card
                    );

                    startButton.type = "button";

                    startButton.style.cssText =
                        "background:#00e5a0;color:#071321;padding:13px 20px;border:0;border-radius:6px;font-weight:bold;cursor:pointer;margin:10px 0;";

                    const timerLabel = createElement(
                        "p",
                        "Time watched: 0 / " + duration + " seconds",
                        card
                    );

                    const progress = createElement("progress", undefined, card);
                    progress.max = duration;
                    progress.value = 0;
                    progress.style.width = "100%";

                    const status = createElement(
                        "p",
                        "Click START WATCHING to begin your viewing session.",
                        card
                    );

                    const retryButton = createElement(
                        "button",
                        "RETRY COMPLETION",
                        card
                    );

                    retryButton.type = "button";
                    retryButton.hidden = true;

                    let sessionId = null;
                    let watched = 0;
                    let lastTime = 0;
                    let timer = null;
                    let completed = false;
                    let finishing = false;

                    video.playbackRate = 1;

                    function updateProgress() {
                        timerLabel.textContent =
                            "Time watched: " +
                            Math.floor(watched) +
                            " / " + duration + " seconds";

                        progress.value = Math.min(duration, watched);
                    }

                    function stopTimer() {
                        if (timer !== null) {
                            clearInterval(timer);
                            timer = null;
                        }
                    }

                    async function finishViewing() {
                        if (!sessionId || completed || finishing) return;

                        finishing = true;
                        stopTimer();
                        video.pause();

                        status.textContent =
                            "Submitting your completed viewing session...";

                        retryButton.hidden = true;

                        try {
                            const { data, error } = await db.rpc(
                                "finish_ad_watch",
                                {
                                    p_session_id: sessionId
                                }
                            );

                            if (error) throw error;

                            if (data && data.success === true) {
                                completed = true;
                                finishing = false;

                                startButton.disabled = true;
                                startButton.textContent = "COMPLETED";

                                status.textContent =
                                    data.reward_status === "pending"
                                        ? "Advertisement completed successfully. Your reward is PENDING ADMIN APPROVAL."
                                        : "Advertisement completed successfully. No monetary reward was issued.";

                                if (currentUser) {
                                    await Promise.all([
                                        loadUserActivity(currentUser),
                                        loadWallet(currentUser)
                                    ]);
                                }

                                return;
                            }

                            if (data && Number(data.seconds_remaining) > 0) {
                                const remaining = Math.ceil(
                                    Number(data.seconds_remaining)
                                );

                                status.textContent =
                                    "Please wait " + remaining +
                                    " more seconds while the database verifies your session.";

                                finishing = false;

                                setTimeout(() => {
                                    finishViewing();
                                }, (remaining + 1) * 1000);

                                return;
                            }

                            finishing = false;

                            status.textContent =
                                data?.message ||
                                "The viewing session could not be completed.";

                            if (
                                data?.message &&
                                data.message.toLowerCase().includes("already completed")
                            ) {
                                completed = true;
                                startButton.disabled = true;
                                startButton.textContent = "COMPLETED";
                                return;
                            }

                            retryButton.hidden = false;

                        } catch (error) {
                            console.error("Finish advertisement error:", error);

                            finishing = false;

                            status.textContent =
                                "Could not submit completion. Check your connection and retry.";

                            retryButton.hidden = false;
                        }
                    }

                    retryButton.addEventListener("click", finishViewing);

                    function startTimer() {
                        if (timer !== null || completed) return;

                        lastTime = video.currentTime;

                        timer = setInterval(() => {
                            if (
                                document.visibilityState !== "visible" ||
                                video.paused ||
                                video.ended
                            ) {
                                return;
                            }

                            const currentTime = video.currentTime;
                            const difference = currentTime - lastTime;

                            if (difference > 0 && difference <= 1.5) {
                                watched = Math.min(
                                    duration,
                                    watched + difference
                                );

                                updateProgress();
                            }

                            lastTime = currentTime;

                            if (watched >= duration) {
                                watched = duration;
                                updateProgress();
                                finishViewing();
                            }

                        }, 500);
                    }

                    video.addEventListener("playing", () => {
                        if (!completed) {
                            status.textContent =
                                "Advertisement playing. Please keep watching.";

                            startTimer();
                        }
                    });

                    video.addEventListener("pause", () => {
                        stopTimer();

                        if (!completed && !finishing) {
                            status.textContent =
                                "Video paused. Resume to continue.";
                        }
                    });

                    video.addEventListener("ended", () => {
                        stopTimer();

                        if (!completed && !finishing) {
                            if (watched >= duration) {
                                finishViewing();
                            } else {
                                lastTime = 0;
                                video.currentTime = 0;

                                status.textContent =
                                    "The video ended early. Press PLAY to replay and complete your viewing time.";
                            }
                        }
                    });

                    video.addEventListener("seeking", () => {
                        if (
                            sessionId &&
                            !completed &&
                            Math.abs(video.currentTime - lastTime) > 1.5
                        ) {
                            video.currentTime = lastTime;

                            status.textContent =
                                "Please watch the advertisement without skipping.";
                        }
                    });

                    video.addEventListener("ratechange", () => {
                        if (video.playbackRate !== 1) {
                            video.playbackRate = 1;
                        }
                    });

                    startButton.addEventListener("click", async () => {
                        if (sessionId || startButton.disabled) return;

                        startButton.disabled = true;
                        startButton.textContent = "STARTING SESSION...";

                        status.textContent =
                            "Creating your secure viewing session...";

                        try {
                            const { data, error } = await db.rpc(
                                "start_ad_watch",
                                {
                                    p_advertisement_id: ad.id
                                }
                            );

                            if (error) throw error;

                            if (
                                !data ||
                                data.success !== true ||
                                !data.session_id
                            ) {
                                throw new Error(
                                    data?.message ||
                                    "Could not start viewing session."
                                );
                            }

                            sessionId = data.session_id;

                            startButton.hidden = true;

                            video.style.display = "block";
                            video.controls = true;
                            video.load();

                            status.textContent =
                                "Viewing session started. Press PLAY to watch the advertisement.";

                        } catch (error) {
                            console.error("Start advertisement error:", error);

                            status.textContent = explainError(error);

                            startButton.disabled = false;
                            startButton.textContent = "TRY AGAIN";
                        }
                    });
                });

            } catch (error) {
                console.error("Advertisement loading error:", error);

                advertisementMessage.textContent =
                    "Could not load advertisements. Please refresh and try again.";
            }

        })();

        advertisementLoadPromise = loadPromise;

        try {
            await loadPromise;
        } finally {
            if (advertisementLoadPromise === loadPromise) {
                advertisementLoadPromise = null;
            }
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
        createElement("p", "Loading registered users...", list);

        try {
            const { data, error } = await db.rpc("admin_get_users");

            if (error) throw error;

            list.replaceChildren();

            const users = data || [];

            count.textContent =
                "TOTAL REGISTERED USERS: " + users.length;

            if (users.length === 0) {
                createElement("p", "No registered users found.", list);
                return;
            }

            const tbody = createAdminTable(
                list,
                ["Email", "Registration date", "Last sign-in"]
            );

            users.forEach(user => {
                addAdminTableRow(tbody, [
                    user.email || "No email",
                    user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Unknown",
                    user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : "Never"
                ]);
            });

        } catch (error) {
            console.error("Admin user loading error:", error);

            list.replaceChildren();

            createElement(
                "p",
                "Could not load users: " + (error.message || "Unknown error"),
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
        const list = panel.querySelector("#mgAdminAdsList");
        const count = panel.querySelector("#mgAdminAdCount");
        const refresh = panel.querySelector("#mgRefreshAds");

        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "Loading...";

        list.replaceChildren();
        createElement("p", "Loading advertisements...", list);

        try {
            const { data, error } = await db.rpc("admin_get_ads");

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
                const card = createElement("div", undefined, list);

                card.style.cssText =
                    "background:#102b48;padding:16px;margin:12px 0;border-radius:9px;border:1px solid #29445f;";

                createElement("h3", ad.title, card);

                createElement(
                    "p",
                    "Advertiser: " + (ad.advertiser_name || ""),
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
                    "Reward amount: " + formatMoney(ad.reward_amount || 0),
                    card
                );

                const buttonArea = createElement("div", undefined, card);

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
                styleAdminButton(statusButton);

                statusButton.addEventListener("click", async () => {
                    const newStatus =
                        ad.status === "active" ? "paused" : "active";

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

                        showMessage("Advertisement status updated.", true);

                        await Promise.all([
                            loadAdminAds(panel),
                            loadAdvertisements()
                        ]);

                    } catch (error) {
                        showMessage(explainError(error));
                        statusButton.disabled = false;
                    }
                });

                const deleteButton = createElement(
                    "button",
                    "DELETE ADVERTISEMENT",
                    buttonArea
                );

                deleteButton.type = "button";
                styleAdminButton(deleteButton, "#d93636");
                deleteButton.style.color = "white";

                deleteButton.addEventListener("click", async () => {
                    if (!window.confirm(
                        "Are you sure you want to delete this advertisement?"
                    )) return;

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
        const title = form.querySelector("#mgAdTitle").value.trim();
        const advertiser = form.querySelector("#mgAdAdvertiser").value.trim();
        const description = form.querySelector("#mgAdDescription").value.trim();
        const videoURL = form.querySelector("#mgAdVideoURL").value.trim();
        const duration = Number(form.querySelector("#mgAdDuration").value);

        if (!title || !advertiser || !videoURL) {
            showMessage(
                "Please complete the title, advertiser and video link."
            );
            return;
        }

        if (!safeVideoURL(videoURL)) {
            showMessage("Please enter a valid HTTPS video link.");
            return;
        }

        if (!Number.isInteger(duration) || duration < 1 || duration > 3600) {
            showMessage("Duration must be between 1 and 3600 seconds.");
            return;
        }

        const submit = form.querySelector('button[type="submit"]');

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

            showMessage("Advertisement created successfully!", true);

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
    // ADMIN REWARDS MANAGEMENT
    // ========================================

    async function loadAdminRewards(panel) {
        const list = panel.querySelector("#mgAdminRewardsList");
        const count = panel.querySelector("#mgAdminRewardCount");
        const refresh = panel.querySelector("#mgRefreshRewards");

        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "LOADING...";

        list.replaceChildren();
        createElement("p", "Loading user rewards...", list);

        try {
            const { data, error } = await db.rpc("admin_get_rewards");

            if (error) throw error;

            const rewards = data || [];

            list.replaceChildren();

            const pending = rewards.filter(
                reward => reward.status === "pending"
            ).length;

            count.textContent =
                "TOTAL REWARDS: " + rewards.length +
                " | PENDING: " + pending;

            if (rewards.length === 0) {
                createElement("p", "No user rewards found yet.", list);
                return;
            }

            rewards.forEach(reward => {
                const card = createElement("div", undefined, list);

                card.style.cssText =
                    "background:#102b48;padding:16px;margin:12px 0;border-radius:9px;border:1px solid #29445f;";

                createElement(
                    "h3",
                    reward.user_email || "Unknown user",
                    card
                );

                createElement(
                    "p",
                    "Advertisement: " +
                    (reward.advertisement_title || "Unknown advertisement"),
                    card
                );

                createElement(
                    "p",
                    "Reward amount: " + formatMoney(reward.amount, "USD"),
                    card
                );

                createElement("p", "Reward ID: " + reward.reward_id, card);
                createElement("p", "Date: " + formatDate(reward.created_at), card);

                const status = createElement(
                    "p",
                    "STATUS: " + String(reward.status || "unknown").toUpperCase(),
                    card
                );

                status.style.fontWeight = "bold";

                status.style.color =
                    reward.status === "pending" ? "#ffcf70" :
                    reward.status === "approved" ? "#00e5a0" : "#ff7777";

                if (reward.status !== "pending") {
                    createElement(
                        "p",
                        "This reward has already been processed.",
                        card
                    );
                    return;
                }

                const buttonArea = createElement("div", undefined, card);

                buttonArea.style.cssText =
                    "display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;";

                const approveButton = createElement(
                    "button",
                    "APPROVE & CREDIT WALLET",
                    buttonArea
                );

                approveButton.type = "button";
                styleAdminButton(approveButton);

                const rejectButton = createElement(
                    "button",
                    "REJECT REWARD",
                    buttonArea
                );

                rejectButton.type = "button";
                styleAdminButton(rejectButton, "#d93636");
                rejectButton.style.color = "white";

                approveButton.addEventListener("click", async () => {
                    const amount = Number(reward.amount);

                    if (!Number.isFinite(amount) || amount <= 0) {
                        showMessage(
                            "Invalid reward amount. Approval cancelled."
                        );
                        return;
                    }

                    const confirmed = window.confirm(
                        "Approve " + formatMoney(amount, "USD") +
                        " for " + (reward.user_email || "this user") +
                        "?\n\nThis will immediately credit their wallet."
                    );

                    if (!confirmed) return;

                    approveButton.disabled = true;
                    rejectButton.disabled = true;
                    approveButton.textContent = "PROCESSING...";

                    try {
                        const { data, error } = await db.rpc(
                            "admin_process_reward",
                            {
                                p_reward_id: reward.reward_id,
                                p_decision: "approved"
                            }
                        );

                        if (error) throw error;

                        if (!data || data.success !== true) {
                            throw new Error(
                                data?.message ||
                                "Reward approval was not confirmed."
                            );
                        }

                        showMessage(
                            "Reward approved and wallet credited: " +
                            formatMoney(data.amount, "USD"),
                            true
                        );

                        await Promise.all([
                            loadAdminRewards(panel),
                            loadAdminWallets(panel),
                            loadAdminTransactions(panel)
                        ]);

                    } catch (error) {
                        console.error("Reward approval error:", error);
                        showMessage(explainError(error));

                        approveButton.disabled = false;
                        rejectButton.disabled = false;

                        approveButton.textContent =
                            "APPROVE & CREDIT WALLET";
                    }
                });

                rejectButton.addEventListener("click", async () => {
                    const confirmed = window.confirm(
                        "Are you sure you want to reject this reward?\n\nThe user's wallet will not be credited."
                    );

                    if (!confirmed) return;

                    approveButton.disabled = true;
                    rejectButton.disabled = true;
                    rejectButton.textContent = "REJECTING...";

                    try {
                        const { data, error } = await db.rpc(
                            "admin_process_reward",
                            {
                                p_reward_id: reward.reward_id,
                                p_decision: "rejected"
                            }
                        );

                        if (error) throw error;

                        if (!data || data.success !== true) {
                            throw new Error(
                                data?.message ||
                                "Reward rejection was not confirmed."
                            );
                        }

                        showMessage(
                            "Reward rejected. No wallet credit was issued.",
                            true
                        );

                        await loadAdminRewards(panel);

                    } catch (error) {
                        console.error("Reward rejection error:", error);
                        showMessage(explainError(error));

                        approveButton.disabled = false;
                        rejectButton.disabled = false;
                        rejectButton.textContent = "REJECT REWARD";
                    }
                });
            });

        } catch (error) {
            console.error("Admin rewards loading error:", error);

            list.replaceChildren();

            createElement(
                "p",
                "Could not load rewards: " + (error.message || "Unknown error"),
                list
            );

        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH REWARDS";
        }
    }

    // ========================================
    // ADMIN WALLET MANAGEMENT
    // ========================================

    async function loadAdminWallets(panel) {
        const list = panel.querySelector("#mgAdminWalletsList");
        const count = panel.querySelector("#mgAdminWalletCount");
        const refresh = panel.querySelector("#mgRefreshWallets");
        const total = panel.querySelector("#mgAdminWalletTotal");

        if (!list || !count || !refresh || !total) return;

        refresh.disabled = true;
        refresh.textContent = "LOADING...";

        list.replaceChildren();
        createElement("p", "Loading user wallets...", list);

        try {
            const { data, error } = await db.rpc("admin_get_wallets");

            if (error) throw error;

            const wallets = data || [];

            list.replaceChildren();

            count.textContent = "TOTAL USER WALLETS: " + wallets.length;

            const totals = {};

            wallets.forEach(wallet => {
                const currency = wallet.currency || "USD";

                totals[currency] =
                    (totals[currency] || 0) +
                    Number(wallet.balance || 0);
            });

            const totalText = Object.entries(totals)
                .map(([currency, amount]) => formatMoney(amount, currency))
                .join(" | ");

            total.textContent =
                "TOTAL WALLET BALANCES: " + (totalText || "$0.00");

            if (wallets.length === 0) {
                createElement("p", "No user wallets found.", list);
                return;
            }

            const tbody = createAdminTable(
                list,
                ["User Email", "Balance", "Currency", "Created"]
            );

            wallets.forEach(wallet => {
                addAdminTableRow(tbody, [
                    wallet.user_email || "Unknown user",
                    formatMoney(wallet.balance, wallet.currency || "USD"),
                    wallet.currency || "USD",
                    wallet.created_at
                        ? new Date(wallet.created_at).toLocaleDateString()
                        : "Unknown"
                ]);
            });

        } catch (error) {
            console.error("Admin wallet error:", error);

            list.replaceChildren();

            createElement(
                "p",
                "Could not load wallets: " + (error.message || "Unknown error"),
                list
            );

            total.textContent = "TOTAL WALLET BALANCES: Unavailable";

        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH WALLETS";
        }
    }

    // ========================================
    // ADMIN TRANSACTIONS MANAGEMENT
    // ========================================

    async function loadAdminTransactions(panel) {
        const list = panel.querySelector("#mgAdminTransactionsList");
        const count = panel.querySelector("#mgAdminTransactionCount");
        const refresh = panel.querySelector("#mgRefreshTransactions");

        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "LOADING...";

        list.replaceChildren();
        createElement("p", "Loading wallet transactions...", list);

        try {
            const { data, error } =
                await db.rpc("admin_get_transactions");

            if (error) throw error;

            const transactions = data || [];

            list.replaceChildren();

            const credits = transactions.filter(
                item => String(item.transaction_type).toLowerCase() === "credit"
            );

            const debits = transactions.filter(
                item => String(item.transaction_type).toLowerCase() === "debit"
            );

            count.textContent =
                "TOTAL TRANSACTIONS: " + transactions.length +
                " | CREDITS: " + credits.length +
                " | DEBITS: " + debits.length;

            if (transactions.length === 0) {
                createElement("p", "No wallet transactions found yet.", list);
                return;
            }

            const tbody = createAdminTable(
                list,
                [
                    "User Email",
                    "Amount",
                    "Type",
                    "Description",
                    "Date",
                    "Transaction ID"
                ]
            );

            transactions.forEach(transaction => {
                const row = addAdminTableRow(tbody, [
                    transaction.user_email || "Unknown user",
                    formatMoney(transaction.amount, "USD"),
                    String(transaction.transaction_type || "Unknown").toUpperCase(),
                    transaction.description || "",
                    formatDate(transaction.created_at),
                    transaction.transaction_id || ""
                ]);

                const type = String(
                    transaction.transaction_type || ""
                ).toLowerCase();

                if (type === "credit") {
                    row.style.color = "#00e5a0";
                } else if (type === "debit") {
                    row.style.color = "#ff7777";
                }
            });

        } catch (error) {
            console.error("Admin transaction error:", error);

            list.replaceChildren();

            createElement(
                "p",
                "Could not load transactions: " + (error.message || "Unknown error"),
                list
            );

        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH TRANSACTIONS";
        }
    }


    // ========================================
    // ADMIN CAMPAIGN FUNDING MANAGEMENT
    // ========================================
    async function loadAdminCampaignFunding(panel) {
    const list = panel.querySelector("#mgAdminCampaignFundingList");
    const count = panel.querySelector("#mgAdminCampaignFundingCount");
    const select = panel.querySelector("#mgFundingCampaign");
    const refresh = panel.querySelector("#mgRefreshCampaignFunding");

    if (!list || !count || !select || !refresh) return;

    refresh.disabled = true;
    list.replaceChildren();
    createElement("p", "Loading campaign funding...", list);

    try {
        const { data, error } = await db.rpc("admin_get_campaign_funding");

        if (error) throw error;

        const rows = data || [];

        list.replaceChildren();
        select.replaceChildren();

        createElement("option", "Select a campaign", select).value = "";

        let budget = 0;
        let reserved = 0;
        let spent = 0;
        let available = 0;

        rows.forEach(item => {
            const opt = createElement(
                "option",
                item.title || item.advertisement_id,
                select
            );

            opt.value = item.advertisement_id;

            budget += Number(item.sponsor_budget || 0);
            reserved += Number(item.reserved_amount || 0);
            spent += Number(item.spent_amount || 0);
            available += Number(item.available_amount || 0);
        });

        count.textContent =
            `CAMPAIGNS: ${rows.length} | BUDGET: ${formatMoney(budget)} | RESERVED: ${formatMoney(reserved)} | SPENT: ${formatMoney(spent)} | AVAILABLE: ${formatMoney(available)}`;

        if (!rows.length) {
            createElement("p", "No campaign funding records found.", list);
        } else {
            const tbody = createAdminTable(list, [
                "Campaign",
                "Sponsor Budget",
                "Reserved",
                "Spent",
                "Available",
                "Funding Status"
            ]);

            rows.forEach(x => {
                addAdminTableRow(tbody, [
                    x.title,
                    formatMoney(x.sponsor_budget),
                    formatMoney(x.reserved_amount),
                    formatMoney(x.spent_amount),
                    formatMoney(x.available_amount),
                    x.funding_status
                ]);
            });
        }

    } catch (e) {
        list.replaceChildren();
        createElement(
            "p",
            "Could not load campaign funding: " + (e.message || "Unknown error"),
            list
        );
    } finally {
        refresh.disabled = false;
    }
}
    async function recordCampaignFunding(form, panel) {
        const campaign = form.querySelector("#mgFundingCampaign").value;
        const amount = Number(form.querySelector("#mgFundingAmount").value);
        const reference = form.querySelector("#mgFundingReference").value.trim();
        if (!campaign || !Number.isFinite(amount) || amount <= 0 || !reference) {
            showMessage("Select a campaign and enter a valid amount and payment reference."); return;
        }
        if (!confirm("Only continue if this sponsor payment has already been received and independently verified. Record this payment?")) return;
        const button = form.querySelector("button[type=submit]"); button.disabled=true;
        try {
            const { data, error } = await db.rpc("admin_record_campaign_funding", {p_advertisement_id:campaign,p_amount:amount,p_payment_reference:reference});
            if (error) throw error;
            const result = Array.isArray(data) ? data[0] : data;
            if (!result || result.success !== true) throw new Error(result?.message || "Funding record was not accepted.");
            showMessage(result.message || "Campaign funding recorded."); form.querySelector("#mgFundingAmount").value=""; form.querySelector("#mgFundingReference").value="";
            await loadAdminCampaignFunding(panel);
        } catch(e) { showMessage("Could not record funding: " + (e.message || "Unknown error")); }
        finally { button.disabled=false; }
    }


    // ========================================
    // ADMIN ADVERTISER MANAGEMENT
    // ========================================

    async function loadAdminAdvertisers(panel) {
        const list = panel.querySelector("#mgAdminAdvertisersList");
        const count = panel.querySelector("#mgAdminAdvertiserCount");
        const refresh = panel.querySelector("#mgRefreshAdvertisers");
        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "LOADING...";
        list.replaceChildren();
        createElement("p", "Loading advertiser applications...", list);

        try {
            const { data, error } = await db.rpc("admin_get_advertisers");
            if (error) throw error;

            const advertisers = data || [];
            list.replaceChildren();
            const pending = advertisers.filter(x => x.status === "pending").length;
            count.textContent = `ADVERTISERS: ${advertisers.length} | PENDING: ${pending}`;

            if (!advertisers.length) {
                createElement("p", "No advertiser applications found.", list);
                return;
            }

            advertisers.forEach(ad => {
                const card = createElement("div", undefined, list);
                card.style.cssText = "background:#102b48;padding:16px;margin:12px 0;border-radius:9px;border:1px solid #29445f;";
                createElement("h3", ad.business_name || "Business", card);
                createElement("p", "Contact: " + (ad.contact_email || ""), card);
                createElement("p", "Phone: " + (ad.phone_number || "Not provided"), card);
                createElement("p", "Description: " + (ad.business_description || "Not provided"), card);
                createElement("p", "Applied: " + formatDate(ad.created_at), card);
                const status = createElement("p", "STATUS: " + String(ad.status).toUpperCase(), card);
                status.style.fontWeight = "bold";
                status.style.color = ad.status === "approved" ? "#00e5a0" :
                    ad.status === "pending" ? "#ffcf70" : "#ff7777";

                const actions = createElement("div", undefined, card);
                if (ad.status !== "approved") {
                    const approve = createElement("button", "APPROVE", actions);
                    approve.type = "button"; styleAdminButton(approve);
                    approve.addEventListener("click", () => updateAdvertiserStatus(ad, "approved", panel));
                }
                if (ad.status !== "rejected") {
                    const reject = createElement("button", "REJECT", actions);
                    reject.type = "button"; styleAdminButton(reject, "#d93636"); reject.style.color = "white";
                    reject.addEventListener("click", () => updateAdvertiserStatus(ad, "rejected", panel));
                }
                if (ad.status !== "suspended") {
                    const suspend = createElement("button", "SUSPEND", actions);
                    suspend.type = "button"; styleAdminButton(suspend, "#b7791f");
                    suspend.addEventListener("click", () => updateAdvertiserStatus(ad, "suspended", panel));
                }
            });
        } catch (error) {
            list.replaceChildren();
            createElement("p", "Could not load advertisers: " + (error.message || "Unknown error"), list);
        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH ADVERTISERS";
        }
    }

    async function updateAdvertiserStatus(ad, status, panel) {
        if (!window.confirm("Set " + ad.business_name + " to " + status.toUpperCase() + "?")) return;
        try {
            const { data, error } = await db.rpc("admin_update_advertiser_status", {
                p_profile_id: ad.profile_id,
                p_status: status
            });
            if (error) throw error;
            if (!data || data.success !== true) throw new Error(data?.message || "Status update failed.");
            showMessage(data.message || "Advertiser status updated.", true);
            await Promise.all([
                loadAdminAdvertisers(panel),
                loadAdminAdvertiserCampaigns(panel)
            ]);
        } catch (error) {
            showMessage("Could not update advertiser: " + (error.message || "Unknown error"));
        }
    }

    // ========================================
    // ADMIN ADVERTISER CAMPAIGN REVIEW
    // ========================================

    async function loadAdminAdvertiserCampaigns(panel) {
        const list = panel.querySelector("#mgAdminAdvertiserCampaignsList");
        const count = panel.querySelector("#mgAdminAdvertiserCampaignCount");
        const refresh = panel.querySelector("#mgRefreshAdvertiserCampaigns");
        if (!list || !count || !refresh) return;

        refresh.disabled = true;
        refresh.textContent = "LOADING...";
        list.replaceChildren();
        createElement("p", "Loading submitted advertiser campaigns...", list);

        try {
            const { data, error } = await db.rpc("admin_get_advertiser_campaigns");
            if (error) throw error;
            const campaigns = data || [];
            list.replaceChildren();
            const pending = campaigns.filter(x => x.status === "pending").length;
            count.textContent = `CAMPAIGNS: ${campaigns.length} | PENDING REVIEW: ${pending}`;

            if (!campaigns.length) {
                createElement("p", "No advertiser campaigns have been submitted.", list);
                return;
            }

            campaigns.forEach(campaign => {
                const card = createElement("div", undefined, list);
                card.style.cssText = "background:#102b48;padding:16px;margin:12px 0;border-radius:9px;border:1px solid #29445f;";
                createElement("h3", campaign.title || "Campaign", card);
                createElement("p", "Business: " + (campaign.business_name || "Unknown"), card);
                createElement("p", "Duration: " + campaign.duration_seconds + " seconds", card);
                createElement("p", "Requested reward per completed view: " + formatMoney(campaign.requested_reward_amount, "USD"), card);
                createElement("p", "Video: " + (campaign.video_url || ""), card);
                if (campaign.description) createElement("p", campaign.description, card);
                createElement("p", "Submitted: " + formatDate(campaign.created_at), card);
                if (campaign.advertisement_id) createElement("p", "Advertisement ID: " + campaign.advertisement_id, card);
                if (campaign.admin_notes) createElement("p", "Admin notes: " + campaign.admin_notes, card);

                const status = createElement("p", "STATUS: " + String(campaign.status).toUpperCase(), card);
                status.style.fontWeight = "bold";
                status.style.color = campaign.status === "approved" ? "#00e5a0" :
                    campaign.status === "pending" ? "#ffcf70" : "#ff7777";

                const notes = document.createElement("textarea");
                notes.placeholder = "Optional admin notes";
                notes.maxLength = 1000;
                notes.style.cssText = "width:100%;min-height:55px;padding:10px;box-sizing:border-box;margin:8px 0;";
                card.appendChild(notes);

                const actions = createElement("div", undefined, card);
                if (campaign.status !== "approved") {
                    const approve = createElement("button", "APPROVE (CREATES PAUSED AD)", actions);
                    approve.type = "button"; styleAdminButton(approve);
                    approve.addEventListener("click", () => reviewAdvertiserCampaign(campaign, "approved", notes.value, panel));
                }
                if (campaign.status !== "rejected") {
                    const reject = createElement("button", "REJECT", actions);
                    reject.type = "button"; styleAdminButton(reject, "#d93636"); reject.style.color = "white";
                    reject.addEventListener("click", () => reviewAdvertiserCampaign(campaign, "rejected", notes.value, panel));
                }
                if (campaign.status !== "suspended") {
                    const suspend = createElement("button", "SUSPEND", actions);
                    suspend.type = "button"; styleAdminButton(suspend, "#b7791f");
                    suspend.addEventListener("click", () => reviewAdvertiserCampaign(campaign, "suspended", notes.value, panel));
                }
            });
        } catch (error) {
            list.replaceChildren();
            createElement("p", "Could not load advertiser campaigns: " + (error.message || "Unknown error"), list);
        } finally {
            refresh.disabled = false;
            refresh.textContent = "REFRESH ADVERTISER CAMPAIGNS";
        }
    }

    async function reviewAdvertiserCampaign(campaign, decision, notes, panel) {
        const warning = decision === "approved"
            ? "Approve this campaign? This creates its advertisement as PAUSED. It will not appear to viewers until it is separately activated after verified funding."
            : "Set this campaign to " + decision.toUpperCase() + "?";
        if (!window.confirm(warning)) return;

        try {
            const { data, error } = await db.rpc("admin_review_advertiser_campaign", {
                p_campaign_id: campaign.campaign_id,
                p_decision: decision,
                p_admin_notes: notes || null
            });
            if (error) throw error;
            if (!data || data.success !== true) throw new Error(data?.message || "Campaign review failed.");
            showMessage(data.message || "Campaign reviewed.", true);
            await Promise.all([
                loadAdminAdvertiserCampaigns(panel),
                loadAdminAds(panel),
                loadAdminCampaignFunding(panel)
            ]);
        } catch (error) {
            showMessage("Could not review campaign: " + (error.message || "Unknown error"));
        }
    }

    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    async function checkAdminAccess(user) {

        if (!user || !user.id) {
            const panel = document.querySelector("#mgAdminPanel");
            if (panel) panel.hidden = true;
            return false;
        }

        if (adminAccessCheckInProgress) {
            return false;
        }

        adminAccessCheckInProgress = true;

        let panel = null;

        try {
            const existingPanels =
                document.querySelectorAll("#mgAdminPanel");

            panel = existingPanels[0] || null;

            existingPanels.forEach((item, index) => {
                if (index > 0) item.remove();
            });

            const { data, error } = await db.rpc("is_admin");

            if (error) throw error;

            if (currentUser?.id !== user.id) return false;

            if (data !== true) {
                if (panel) panel.hidden = true;
                return false;
            }

            if (!panel) {
                const dashboardContainer =
                    dashboard.querySelector(".dashboard-container");

                if (!dashboardContainer) {
                    throw new Error("Dashboard container was not found.");
                }

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

                dashboardContainer.appendChild(panel);

                createElement("h2", "MG ADMIN DASHBOARD", panel);

                const adminStatus = createElement(
                    "p",
                    "ADMIN STATUS: ACTIVE",
                    panel
                );

                adminStatus.style.color = "#00e5a0";

                // USER MANAGEMENT

                createElement("hr", undefined, panel);
                createElement("h2", "👥 USER MANAGEMENT", panel);

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
                styleAdminButton(userRefresh);

                const userList = createElement("div", undefined, panel);
                userList.id = "mgAdminUsersList";

                userRefresh.addEventListener("click", () => loadAdminUsers(panel));

                // ADVERTISEMENT MANAGEMENT

                createElement("hr", undefined, panel);
                createElement("h2", "📢 ADVERTISEMENT MANAGEMENT", panel);

                createElement(
                    "p",
                    "Create and manage sponsored campaigns.",
                    panel
                );

                const form = createElement("form", undefined, panel);
                form.id = "mgCreateAdForm";

                function addAdminInput(id, placeholder, type = "text", required = true) {
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

                addAdminInput("mgAdTitle", "Advertisement title");
                addAdminInput("mgAdAdvertiser", "Advertiser / Company name");

                const descriptionInput = document.createElement("textarea");

                descriptionInput.id = "mgAdDescription";
                descriptionInput.placeholder = "Advertisement description";

                descriptionInput.style.cssText =
                    "display:block;width:100%;min-height:85px;padding:13px;margin:10px 0;box-sizing:border-box;border-radius:6px;";

                form.appendChild(descriptionInput);

                addAdminInput("mgAdVideoURL", "HTTPS video link", "url");

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
                styleAdminButton(createButton);

                form.addEventListener("submit", event => {
                    event.preventDefault();
                    createAdvertisement(form, panel);
                });

                // EXISTING ADVERTISEMENTS

                createElement("hr", undefined, panel);
                createElement("h2", "📋 EXISTING ADVERTISEMENTS", panel);

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
                styleAdminButton(adRefresh);

                const adList = createElement("div", undefined, panel);
                adList.id = "mgAdminAdsList";

                adRefresh.addEventListener("click", () => loadAdminAds(panel));


                // ADVERTISER APPLICATION MANAGEMENT

                createElement("hr", undefined, panel);
                createElement("h2", "🏢 ADVERTISER MANAGEMENT", panel);
                createElement("p", "Review business applications and approve, reject or suspend advertisers.", panel);
                const advertiserCount = createElement("h3", "ADVERTISERS: Loading...", panel);
                advertiserCount.id = "mgAdminAdvertiserCount";
                const advertiserRefresh = createElement("button", "REFRESH ADVERTISERS", panel);
                advertiserRefresh.id = "mgRefreshAdvertisers";
                advertiserRefresh.type = "button";
                styleAdminButton(advertiserRefresh);
                const advertiserList = createElement("div", undefined, panel);
                advertiserList.id = "mgAdminAdvertisersList";
                advertiserRefresh.addEventListener("click", () => loadAdminAdvertisers(panel));

                // ADVERTISER CAMPAIGN REVIEW

                createElement("hr", undefined, panel);
                createElement("h2", "🎯 ADVERTISER CAMPAIGN REVIEW", panel);
                createElement("p", "Review submitted campaigns. Approval creates a paused advertisement; funding and activation are separate steps.", panel);
                const advertiserCampaignCount = createElement("h3", "CAMPAIGNS: Loading...", panel);
                advertiserCampaignCount.id = "mgAdminAdvertiserCampaignCount";
                const advertiserCampaignRefresh = createElement("button", "REFRESH ADVERTISER CAMPAIGNS", panel);
                advertiserCampaignRefresh.id = "mgRefreshAdvertiserCampaigns";
                advertiserCampaignRefresh.type = "button";
                styleAdminButton(advertiserCampaignRefresh);
                const advertiserCampaignList = createElement("div", undefined, panel);
                advertiserCampaignList.id = "mgAdminAdvertiserCampaignsList";
                advertiserCampaignRefresh.addEventListener("click", () => loadAdminAdvertiserCampaigns(panel));

                // REWARDS MANAGEMENT

                createElement("hr", undefined, panel);
                createElement("h2", "💰 REWARDS MANAGEMENT", panel);

                createElement(
                    "p",
                    "Review user rewards and manage reward approvals.",
                    panel
                );

                const rewardCount = createElement(
                    "h3",
                    "TOTAL REWARDS: Loading...",
                    panel
                );

                rewardCount.id = "mgAdminRewardCount";

                const rewardRefresh = createElement(
                    "button",
                    "REFRESH REWARDS",
                    panel
                );

                rewardRefresh.id = "mgRefreshRewards";
                rewardRefresh.type = "button";
                styleAdminButton(rewardRefresh);

                const rewardList = createElement("div", undefined, panel);
                rewardList.id = "mgAdminRewardsList";

                rewardRefresh.addEventListener("click", () => loadAdminRewards(panel));

                // WALLET MANAGEMENT

                createElement("hr", undefined, panel);
                createElement("h2", "👛 WALLET MANAGEMENT", panel);

                createElement(
                    "p",
                    "View registered users' wallet balances and currencies.",
                    panel
                );

                const walletCount = createElement(
                    "h3",
                    "TOTAL USER WALLETS: Loading...",
                    panel
                );

                walletCount.id = "mgAdminWalletCount";

                const walletTotal = createElement(
                    "h3",
                    "TOTAL WALLET BALANCES: Loading...",
                    panel
                );

                walletTotal.id = "mgAdminWalletTotal";

                const walletRefresh = createElement(
                    "button",
                    "REFRESH WALLETS",
                    panel
                );

                walletRefresh.id = "mgRefreshWallets";
                walletRefresh.type = "button";
                styleAdminButton(walletRefresh);

                const walletList = createElement("div", undefined, panel);
                walletList.id = "mgAdminWalletsList";

                walletRefresh.addEventListener("click", () => loadAdminWallets(panel));

                // TRANSACTIONS MANAGEMENT

                createElement("hr", undefined, panel);
                createElement("h2", "📊 TRANSACTIONS MANAGEMENT", panel);

                createElement(
                    "p",
                    "Review wallet credits, debits and transaction records.",
                    panel
                );

                const transactionCount = createElement(
                    "h3",
                    "TOTAL TRANSACTIONS: Loading...",
                    panel
                );

                transactionCount.id = "mgAdminTransactionCount";

                const transactionRefresh = createElement(
                    "button",
                    "REFRESH TRANSACTIONS",
                    panel
                );

                transactionRefresh.id = "mgRefreshTransactions";
                transactionRefresh.type = "button";
                styleAdminButton(transactionRefresh);

                const transactionList = createElement("div", undefined, panel);
                transactionList.id = "mgAdminTransactionsList";

                transactionRefresh.addEventListener(
                    "click",
                    () => loadAdminTransactions(panel)
                );


                // CAMPAIGN FUNDING MANAGEMENT
                createElement("hr", undefined, panel);
                createElement("h2", "💰 CAMPAIGN FUNDING MANAGEMENT", panel);
                createElement("p", "Review sponsor budgets and record payments only after they have been independently verified.", panel);
                const fundingCount = createElement("h3", "CAMPAIGN FUNDING: Loading...", panel);
                fundingCount.id = "mgAdminCampaignFundingCount";
                const fundingRefresh = createElement("button", "REFRESH CAMPAIGN FUNDING", panel);
                fundingRefresh.id = "mgRefreshCampaignFunding"; fundingRefresh.type = "button"; styleAdminButton(fundingRefresh);
                const fundingList = createElement("div", undefined, panel); fundingList.id = "mgAdminCampaignFundingList";
                fundingRefresh.addEventListener("click", () => loadAdminCampaignFunding(panel));
                const fundingForm = createElement("form", undefined, panel);
                fundingForm.style.cssText = "display:grid;gap:10px;max-width:500px;margin:15px 0;";
                const campaignSelect = createElement("select", undefined, fundingForm); campaignSelect.id = "mgFundingCampaign";
                const amountInput = createElement("input", undefined, fundingForm); amountInput.id = "mgFundingAmount"; amountInput.type="number"; amountInput.min="0.01"; amountInput.step="0.01"; amountInput.placeholder="Verified payment amount (USD)";
                const referenceInput = createElement("input", undefined, fundingForm); referenceInput.id="mgFundingReference"; referenceInput.type="text"; referenceInput.placeholder="Unique payment reference";
                const fundingSubmit = createElement("button", "RECORD VERIFIED SPONSOR PAYMENT", fundingForm); fundingSubmit.type="submit"; styleAdminButton(fundingSubmit);
                fundingForm.addEventListener("submit", event => { event.preventDefault(); recordCampaignFunding(fundingForm,panel); });
                createElement("p", "WARNING: This form records a payment reference; it does not verify or collect money. Never enter test or unpaid funds.", panel).style.cssText="color:#ffcf70;font-size:13px;";

                // SECURITY NOTICE

                createElement("hr", undefined, panel);

                const notice = createElement(
                    "p",
                    "IMPORTANT: Only approve verified rewards covered by sponsor funding. Approval immediately credits the user's USD wallet. This does not send money to a bank account or mobile wallet.",
                    panel
                );

                notice.style.cssText = "color:#ffcf70;font-size:13px;";
            }

            panel.hidden = false;

            await Promise.all([
                loadAdminUsers(panel),
                loadAdminAds(panel),
                loadAdminAdvertisers(panel),
                loadAdminAdvertiserCampaigns(panel),
                loadAdminRewards(panel),
                loadAdminWallets(panel),
                loadAdminTransactions(panel),
                loadAdminCampaignFunding(panel)
            ]);

            return true;

        } catch (error) {
            console.error("Admin verification error:", error);

            if (panel) panel.hidden = true;

            return false;

        } finally {
            adminAccessCheckInProgress = false;
        }
    }

    // ========================================
    // LOAD USER ACCOUNT
    // ========================================

    async function loadUserAccount(user) {
        if (!user || !user.id) return;

        // SAME USER ALREADY LOADING

        if (
            accountLoadPromise &&
            lastLoadedUserId === user.id
        ) {
            return accountLoadPromise;
        }

        // SAME USER ALREADY LOADED

        if (lastLoadedUserId === user.id) {
            return;
        }

        const generation = ++accountLoadGeneration;

        currentUser = user;
        lastLoadedUserId = user.id;

        showDashboard(user);

        const loadPromise = (async () => {
            try {
                await Promise.all([
                    loadWallet(user),
                    loadAdvertisements(),
                    loadUserActivity(user),
                    checkAdminAccess(user)
                ]);

            } catch (error) {
                console.error("Dashboard loading error:", error);

                if (generation === accountLoadGeneration) {
                    lastLoadedUserId = null;
                }

            } finally {
                if (generation === accountLoadGeneration) {
                    accountLoadPromise = null;
                }
            }
        })();

        accountLoadPromise = loadPromise;

        return loadPromise;
    }
// ========================================
// ADVERTISER REGISTRATION
// ========================================

if (advertiserApplicationForm) {

    advertiserApplicationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const businessName =
                document.getElementById("advertiserBusinessName")
                    .value.trim();

            const contactEmail =
                document.getElementById("advertiserContactEmail")
                    .value.trim();

            const phoneNumber =
                document.getElementById("advertiserPhoneNumber")
                    .value.trim();

            const businessDescription =
                document.getElementById("advertiserBusinessDescription")
                    .value.trim();

            const applicationMessage =
                document.getElementById("advertiserApplicationMessage");

            if (!businessName || !contactEmail) {
                applicationMessage.textContent =
                    "Please enter your business name and contact email.";
                return;
            }

            const { data: userData, error: userError } =
                await db.auth.getUser();

            if (userError || !userData.user) {
                applicationMessage.textContent =
                    "Please log in before applying as an advertiser.";
                return;
            }

            setLoading(advertiserApplicationForm, true);

            applicationMessage.textContent =
                "Submitting your application...";

            try {

                const { data, error } = await db.rpc(
                    "apply_for_advertiser",
                    {
                        p_business_name: businessName,
                        p_contact_email: contactEmail,
                        p_phone_number: phoneNumber || null,
                        p_business_description:
                            businessDescription || null
                    }
                );

                if (error) throw error;

                if (
                    data &&
                    (data.success === false || data.ok === false)
                ) {
                    throw new Error(
                        data.message || "Application was not accepted."
                    );
                }

                applicationMessage.textContent =
                    "Application submitted successfully! " +
                    "Your advertiser account is now pending admin approval.";

                applicationMessage.style.color = "#00e5a0";

                advertiserApplicationForm.reset();

            } catch (error) {

                console.error("Advertiser application error:", error);

                const errorText =
                    error.message || "Something went wrong.";

                applicationMessage.textContent =
                    errorText.toLowerCase().includes("already")
                        ? "You have already submitted an advertiser application."
                        : "Application failed: " + errorText;

                applicationMessage.style.color = "#ff7777";

            } finally {

                setLoading(advertiserApplicationForm, false);

            }

        }
    );

}// ========================================
// ADVERTISER CAMPAIGN SUBMISSION
// ========================================

if (advertiserCampaignForm) {

    advertiserCampaignForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const campaignMessage =
                document.getElementById("advertiserCampaignMessage");

            if (!currentUser) {
                campaignMessage.textContent =
                    "Please log in before submitting a campaign.";
                campaignMessage.style.color = "#ff7777";
                return;
            }

            const title =
                document.getElementById("campaignTitle").value.trim();

            const description =
                document.getElementById("campaignDescription").value.trim();

            const videoURL =
                document.getElementById("campaignVideoURL").value.trim();

            const duration =
                Number(document.getElementById("campaignDuration").value);

            const reward =
                Number(document.getElementById("campaignReward").value);

            if (!title || !description || !videoURL) {
                campaignMessage.textContent =
                    "Please complete all campaign details.";
                campaignMessage.style.color = "#ff7777";
                return;
            }

            if (title.length > 150 || description.length > 2000) {
                campaignMessage.textContent =
                    "Please check the title and description lengths.";
                campaignMessage.style.color = "#ff7777";
                return;
            }

            if (!safeVideoURL(videoURL)) {
                campaignMessage.textContent =
                    "Please enter a valid HTTPS video link.";
                campaignMessage.style.color = "#ff7777";
                return;
            }

            if (
                !Number.isInteger(duration) ||
                duration < 5 ||
                duration > 300
            ) {
                campaignMessage.textContent =
                    "Video duration must be between 5 and 300 seconds.";
                campaignMessage.style.color = "#ff7777";
                return;
            }

            if (
                !Number.isFinite(reward) ||
                reward <= 0 ||
                reward > 100
            ) {
                campaignMessage.textContent =
                    "Reward must be greater than $0 and not more than $100.";
                campaignMessage.style.color = "#ff7777";
                return;
            }

            setLoading(advertiserCampaignForm, true);

            campaignMessage.textContent =
                "Submitting your advertising campaign...";

            campaignMessage.style.color = "#ffcf70";

            try {

                const { data, error } = await db.rpc(
                    "advertiser_submit_campaign",
                    {
                        p_title: title,
                        p_description: description,
                        p_video_url: videoURL,
                        p_duration_seconds: duration,
                        p_requested_reward_amount: reward
                    }
                );

                if (error) throw error;

                if (
                    data &&
                    (data.success === false || data.ok === false)
                ) {
                    throw new Error(
                        data.message ||
                        "Campaign submission was rejected."
                    );
                }

                campaignMessage.textContent =
                    "Campaign submitted successfully! " +
                    "It is now waiting for admin review.";

                campaignMessage.style.color = "#00e5a0";

                advertiserCampaignForm.reset();

                document.getElementById("campaignDuration").value = 15;

            } catch (error) {

                console.error(
                    "Campaign submission error:",
                    error
                );

                campaignMessage.textContent =
                    "Campaign submission failed: " +
                    (error.message || "Please try again.");

                campaignMessage.style.color = "#ff7777";

            } finally {

                setLoading(advertiserCampaignForm, false);

            }
        }
    );
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
            const { data, error } = await db.auth.signInWithPassword({
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

    function resetUserSession() {
        accountLoadGeneration++;

        currentUser = null;
        lastLoadedUserId = null;
        accountLoadPromise = null;

        adminAccessCheckInProgress = false;

        showLoginForms();

        if (advertisementList) {
            advertisementList.replaceChildren();
        }

        if (advertisementMessage) {
            advertisementMessage.textContent =
                "Please log in to view advertisements.";
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            logoutButton.disabled = true;

            try {
                const { error } = await db.auth.signOut();

                if (error) throw error;

                resetUserSession();

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
            const { data, error } = await db.auth.getSession();

            if (error) throw error;

            if (data.session) {
                await loadUserAccount(data.session.user);
            } else {
                resetUserSession();
            }

        } catch (error) {
            console.error("Session error:", error);

            resetUserSession();
            showMessage(explainError(error));
        }
    }

    // ========================================
    // AUTHENTICATION EVENTS
    // ========================================

    db.auth.onAuthStateChange((event, session) => {

        if (event === "SIGNED_OUT") {
            resetUserSession();
            return;
        }

        // TOKEN REFRESH DOES NOT NEED TO RELOAD
        // THE ENTIRE DASHBOARD.

        if (event === "TOKEN_REFRESHED") {
            return;
        }

        if (
            session &&
            (
                event === "SIGNED_IN" ||
                event === "USER_UPDATED"
            )
        ) {
            setTimeout(() => {
                if (session.user?.id) {
                    loadUserAccount(session.user);
                }
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
