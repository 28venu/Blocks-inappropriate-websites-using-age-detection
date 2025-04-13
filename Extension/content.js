(async function () {
    if (document.getElementById("contentBlockerContainer")) return;

    const container = document.createElement("div");
    container.id = "contentBlockerContainer";
    container.style = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 99999;
    `;

    const button = document.createElement("button");
    button.id = "contentBlockerBtn";
    button.style = `
        padding: 10px 15px;
        color: #fff;
        font-size: 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
    `;

    document.body.style.paddingTop = "60px";
    container.appendChild(button);
    document.body.prepend(container);

    const blockedDomains = [
    "xnxx.health", "xhamster.desi", "xhamster.com", "deezer.com", "xnxx.tv",
        "pornhub.com", "pornhubs.video", "porn", "xxx", "adult", "sex", "nude",
        "nsfw", "18+", "erotic", "hot", "milf", "teen", "blowjob", "anal",
        "hardcore", "lesbian", "gay", "fetish", "babe", "hentai", "masturbation",
        "dildo", "pussy", "boobs", "cum", "cock", "pussyboy.net","kompoz2.com","xvideos.com","xvideos3.com",
        "xfree.com","mat6tube.com","xhamster1.desi","xhamster2.com","z00y.com","youjizz.com",
        "xhaccess.com","letmejerk.com","xnxx.com","xnxx3.com","xnxxbest.pro"
    ];

    function isBlocked(url) {
        return blockedDomains.some(domain => url.toLowerCase().includes(domain));
    }

    function updateButtonUI(enabled) {
        button.style.backgroundColor = enabled ? "#00aa00" : "#ff0000";
        button.textContent = enabled ? "🟢" : "🔴";
    }

    function enforceSafeSearch(enabled) {
        const url = new URL(window.location.href);

        if (url.pathname.includes("/search")) {
            if (enabled) {
                if (!url.searchParams.get("safe") || !url.searchParams.get("safeRedirected")) {
                    url.searchParams.set("safe", "active");
                    url.searchParams.set("safeRedirected", "true");
                    window.location.replace(url.toString());
                }
            } else {
                if (url.searchParams.get("safe")) {
                    url.searchParams.delete("safe");
                    window.location.replace(url.toString());
                }
            }
        }
    }

    function enforceBlocking(enabled) {
        if (!enabled) return;

        document.querySelectorAll("a, img, video, iframe").forEach(el => {
            const url = el.href || el.src || "";
            if (isBlocked(url)) el.remove();
        });

        if (isBlocked(window.location.href)) {
            alert("This page is blocked.");
            window.location.href = "https://www.google.com";
        }
    }
    let ageCheckInterval = null;

function manageAgeCheckInterval(enabled) {
    if (!enabled && !ageCheckInterval) {
        // Safe Mode is OFF → start interval
        ageCheckInterval = setInterval(() => {
            chrome.storage.local.get(["blockingEnabled"], ({ blockingEnabled }) => {
                if (!blockingEnabled) {
                    captureImageAndPredictAge();
                } else {
                    clearInterval(ageCheckInterval);
                    ageCheckInterval = null;
                }
            });
        }, 1 * 60 * 1000); // every 5 minutes
    } else if (enabled && ageCheckInterval) {
        // Safe Mode is ON → clear interval
        clearInterval(ageCheckInterval);
        ageCheckInterval = null;
    }
}

    async function captureImageAndPredictAge() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement("video");
            video.srcObject = stream;

            await new Promise(resolve => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            stream.getTracks().forEach(track => track.stop());

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
            const formData = new FormData();
            formData.append("image", imageBlob, "image.jpg");

            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                body: formData,
                headers: { "Accept": "application/json" }
            });

            const data = await response.json();
            const isAdult = data.result === 1;
            const safeMode = !isAdult;

            chrome.storage.local.set({ blockingEnabled: safeMode }, () => {
                updateButtonUI(safeMode);
                enforceSafeSearch(safeMode);
                enforceBlocking(safeMode);
            });
        } catch (e) {
            console.error("Error during age prediction", e);
            chrome.storage.local.set({ blockingEnabled: true }, () => {
                updateButtonUI(true);
                enforceSafeSearch(true);
                enforceBlocking(true);
            });
        }
    }

    chrome.storage.local.get(["blockingEnabled"], ({ blockingEnabled }) => {
        const enabled = blockingEnabled ?? true;
        updateButtonUI(enabled);
        enforceSafeSearch(enabled);
        enforceBlocking(enabled);
        manageAgeCheckInterval(enabled)
    });

    button.addEventListener("click", captureImageAndPredictAge);

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === "updateButton") {
            chrome.storage.local.get(["blockingEnabled"], ({ blockingEnabled }) => {
                const enabled = blockingEnabled ?? true;
                updateButtonUI(enabled);
                enforceSafeSearch(enabled);
                manageAgeCheckInterval(enabled)
            });
        }
    });
})();
