// ========================================
// LOAD ACTIVE ADVERTISEMENTS
// SECURE SUPABASE VIEWING SYSTEM
// ========================================

async function loadAdvertisements() {

    if (!advertisementList || !advertisementMessage) {
        return;
    }

    advertisementList.replaceChildren();

    advertisementMessage.textContent =
        "Loading available advertisements...";

    try {

        const { data, error } = await db
            .from("advertisements")
            .select(
                "id, title, description, video_url, advertiser_name, duration_seconds"
            )
            .eq("status", "active")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {

            advertisementMessage.textContent =
                "No sponsored advertisements are available right now. Please check again later.";

            return;
        }

        advertisementMessage.textContent =
            data.length + " sponsored campaign(s) available.";

        data.forEach(ad => {

            const card = document.createElement("div");
            card.className = "advertisement-card";

            const title = document.createElement("h3");
            title.textContent =
                ad.title || "Sponsored advertisement";

            const advertiser = document.createElement("p");
            advertiser.textContent =
                "Sponsored by: " +
                (ad.advertiser_name || "MG WATCH & EARN");

            const description = document.createElement("p");
            description.textContent =
                ad.description || "Discover this sponsored campaign.";

            const duration = Math.max(
                1,
                Math.floor(Number(ad.duration_seconds) || 30)
            );

            const durationText = document.createElement("p");
            durationText.textContent =
                "Video duration: " + duration + " seconds";

            card.append(
                title,
                advertiser,
                description,
                durationText
            );

            const videoURL = safeVideoURL(ad.video_url);

            if (!videoURL) {

                const warning = document.createElement("p");
                warning.textContent =
                    "This video link cannot currently be displayed.";

                card.appendChild(warning);
                advertisementList.appendChild(card);
                return;
            }

            const video = document.createElement("video");

            video.controls = true;
            video.preload = "metadata";
            video.playsInline = true;
            video.src = videoURL;

            card.appendChild(video);

            // VIEWING PROGRESS DISPLAY

            const timerBox = document.createElement("div");
            timerBox.className = "watch-timer";
            timerBox.style.marginTop = "14px";

            const timerLabel = document.createElement("p");
            timerLabel.textContent =
                "Verified viewing time: 0 / " +
                duration + " seconds";

            const progress = document.createElement("progress");
            progress.max = duration;
            progress.value = 0;
            progress.style.width = "100%";
            progress.style.height = "14px";

            const status = document.createElement("p");
            status.textContent =
                "Play the video to start a viewing session.";

            timerBox.append(timerLabel, progress, status);
            card.appendChild(timerBox);

            // SESSION VARIABLES

            let sessionId = null;
            let startingSession = false;
            let heartbeatTimer = null;
            let heartbeatRunning = false;
            let completed = false;
            let verifiedSeconds = 0;

            // STOP HEARTBEAT

            function stopHeartbeat() {

                if (heartbeatTimer !== null) {
                    clearInterval(heartbeatTimer);
                    heartbeatTimer = null;
                }
            }

            // UPDATE DISPLAY

            function updateProgress(seconds) {

                verifiedSeconds = Math.min(
                    duration,
                    Math.max(0, Number(seconds) || 0)
                );

                timerLabel.textContent =
                    "Verified viewing time: " +
                    verifiedSeconds + " / " +
                    duration + " seconds";

                progress.value = verifiedSeconds;
            }

            // VERIFY COMPLETION

            async function verifyCompletion() {

                if (!sessionId || completed) {
                    return;
                }

                stopHeartbeat();

                try {

                    const { data, error } = await db.rpc(
                        "complete_ad_view_session",
                        {
                            p_session_id: sessionId
                        }
                    );

                    if (error) throw error;

                    if (data === true) {

                        completed = true;

                        status.textContent =
                            "Viewing completed and verified by the server. No reward has been issued yet.";

                    } else {

                        status.textContent =
                            "More verified viewing time is required. Continue watching.";

                    }

                } catch (error) {

                    console.error(
                        "Completion verification error:",
                        error
                    );

                    status.textContent =
                        "We could not verify completion. Please try again.";
                }
            }

            // SEND PROGRESS TO SUPABASE

            async function sendHeartbeat() {

                if (
                    !sessionId ||
                    completed ||
                    heartbeatRunning ||
                    video.paused ||
                    document.visibilityState !== "visible"
                ) {
                    return;
                }

                heartbeatRunning = true;

                try {

                    const { data, error } = await db.rpc(
                        "record_ad_view_heartbeat",
                        {
                            p_session_id: sessionId,
                            p_video_position: Number(video.currentTime)
                        }
                    );

                    if (error) throw error;

                    updateProgress(data);

                    status.textContent =
                        "Viewing progress recorded by the server.";

                    if (verifiedSeconds >= duration) {
                        await verifyCompletion();
                    }

                } catch (error) {

                    console.error(
                        "Viewing progress error:",
                        error
                    );

                    status.textContent =
                        "Progress could not be recorded. Check your connection.";

                    stopHeartbeat();

                } finally {

                    heartbeatRunning = false;
                }
            }

            // START VIEWING SESSION

            async function startViewingSession() {

                if (sessionId || startingSession || completed) {
                    return;
                }

                startingSession = true;

                status.textContent =
                    "Starting secure viewing session...";

                try {

                    const { data, error } = await db.rpc(
                        "start_ad_view_session",
                        {
                            p_advertisement_id: ad.id
                        }
                    );

                    if (error) throw error;

                    sessionId = data;

                    if (!sessionId) {
                        throw new Error(
                            "No viewing session was returned."
                        );
                    }

                    status.textContent =
                        "Secure viewing session started.";

                    heartbeatTimer = setInterval(
                        sendHeartbeat,
                        5000
                    );

                } catch (error) {

                    console.error(
                        "Viewing session error:",
                        error
                    );

                    status.textContent =
                        "Could not start viewing session. Please refresh and try again.";

                    video.pause();

                } finally {

                    startingSession = false;
                }
            }

            // VIDEO PLAY EVENT

            video.addEventListener("play", function () {

                if (!sessionId && !startingSession && !completed) {
                    startViewingSession();
                }

            });

            // VIDEO PAUSE EVENT

            video.addEventListener("pause", function () {

                stopHeartbeat();

                if (!completed && sessionId) {
                    status.textContent =
                        "Video paused. Your viewing session is saved.";
                }

            });

            // FINAL PROGRESS

            async function sendFinalProgress() {

                if (!sessionId || completed) {
                    return;
                }

                try {

                    const { data, error } = await db.rpc(
                        "record_ad_view_heartbeat",
                        {
                            p_session_id: sessionId,
                            p_video_position: Number(video.currentTime)
                        }
                    );

                    if (error) throw error;

                    updateProgress(data);

                } catch (error) {

                    console.error(
                        "Final viewing progress error:",
                        error
                    );
                }
            }

            // VIDEO ENDED EVENT

            video.addEventListener("ended", async function () {

                stopHeartbeat();

                await sendFinalProgress();

                await verifyCompletion();

            });

            // PAGE VISIBILITY

            document.addEventListener(
                "visibilitychange",
                function () {

                    if (document.visibilityState !== "visible") {

                        stopHeartbeat();

                    } else if (
                        !video.paused &&
                        sessionId &&
                        !completed
                    ) {

                        if (heartbeatTimer === null) {

                            heartbeatTimer = setInterval(
                                sendHeartbeat,
                                5000
                            );

                        }
                    }

                }
            );

            advertisementList.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Advertisement loading error:",
            error
        );

        advertisementMessage.textContent =
            "We could not load advertisements. Please refresh and try again.";

    }
}
