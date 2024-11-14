document.addEventListener('DOMContentLoaded', () => {
    const historyDiv = document.getElementById('history');
    const lazyPanda = document.getElementById('no-history'); // Ensure lazy panda div is targeted
    const tipText = document.getElementById('tip-text');
    const nextTipButton = document.getElementById('next-tip');
    const prevTipButton = document.getElementById('prev-tip');

    if (!historyDiv || !tipText || !nextTipButton || !prevTipButton) {
        console.error('One or more required elements are missing from the DOM.');
        return;
    }

    // Fetch emissions history
    chrome.storage.local.get(['emissionsHistory'], (data) => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving emissions data:', chrome.runtime.lastError);
            lazyPanda.style.display = 'block'; // Ensure Lazy Panda is visible on error
            return;
        }

        // Display emissions history
        if (data.emissionsHistory && data.emissionsHistory.length > 0) {
            lazyPanda.style.display = 'none'; // Hide Lazy Panda and its message
            historyDiv.innerHTML = ''; // Clear existing history
            data.emissionsHistory.forEach((item) => {
                const date = new Date(item.date || Date.now()); // Use the stored date or current date
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div><strong>File:</strong> ${item.fileName}</div>
                    <div><strong>Size:</strong> ${(item.fileSize / 1e6).toFixed(2)} MB</div>
                    <div><strong>Emissions:</strong> ${item.emissions.toFixed(2)} gCO2e</div>
                    <div class="date-info">Uploaded on: ${formattedDate}</div>
                `;
                historyDiv.appendChild(historyItem);
            });
        } else {
            lazyPanda.style.display = 'block'; // Show Lazy Panda with the message
        }
    });

    // Rotating tips
    const tipsArray = [
        "💡 Tip: Compress files before uploading to reduce CO2 emissions.",
        "💡 Tip: Store files in renewable-energy regions to save the planet.",
        "💡 Tip: Delete old cloud files to lower your digital footprint.",
        "💡 Tip: Use shared or collaborative documents to reduce duplicated cloud storage.",
        "💡 Tip: Prefer local storage for infrequently accessed files.",
        "💡 Tip: Regularly review and remove unused apps or backups in cloud accounts.",
        "💡 Tip: Schedule file uploads during off-peak hours to reduce network strain.",
        "💡 Tip: Opt for cloud providers committed to renewable energy usage."
    ];

    let tipIndex = 0;

    // Function to update the tip text
    function updateTip(index) {
        tipText.textContent = tipsArray[index];
        tipText.classList.remove('fade-in'); // Reset animation
        void tipText.offsetWidth; // Trigger reflow for animation restart
        tipText.classList.add('fade-in'); // Apply animation
    }

    // Automatic tip rotation
    setInterval(() => {
        tipIndex = (tipIndex + 1) % tipsArray.length;
        updateTip(tipIndex);
    }, 5000);

    // Manual tip controls
    nextTipButton.addEventListener('click', () => {
        tipIndex = (tipIndex + 1) % tipsArray.length;
        updateTip(tipIndex);
    });

    prevTipButton.addEventListener('click', () => {
        tipIndex = (tipIndex - 1 + tipsArray.length) % tipsArray.length;
        updateTip(tipIndex);
    });
});

// Listen for storage changes to dynamically update the UI
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
        const historyDiv = document.getElementById('history');
        const lazyPanda = document.getElementById('no-history');
        if (changes.emissionsHistory) {
            const newHistory = changes.emissionsHistory.newValue || [];
            if (newHistory.length > 0) {
                lazyPanda.style.display = 'none'; // Hide Lazy Panda
                historyDiv.innerHTML = ''; // Clear existing history
                newHistory.forEach((item) => {
                    const date = new Date(item.date || Date.now());
                    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `
                        <div><strong>File:</strong> ${item.fileName}</div>
                        <div><strong>Size:</strong> ${(item.fileSize / 1e6).toFixed(2)} MB</div>
                        <div><strong>Emissions:</strong> ${item.emissions.toFixed(2)} gCO2e</div>
                        <div class="date-info">Uploaded on: ${formattedDate}</div>
                    `;
                    historyDiv.appendChild(historyItem);
                });
            } else {
                lazyPanda.style.display = 'block'; // Show Lazy Panda
            }
        }
    }
});
