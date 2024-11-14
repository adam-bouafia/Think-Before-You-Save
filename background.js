import { co2 } from '@tgwf/co2';

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "CALCULATE_EMISSIONS") {
    const { fileSizeBytes, fileName } = message;

    try {
      // Validate file size
      if (!fileSizeBytes || fileSizeBytes <= 0) {
        sendResponse({ success: false, error: "Invalid file size" });
        return true;
      }

      const model = new co2({ model: "swd", version: 4 });
      const emissions = model.perByte(fileSizeBytes);

      // Save the history to local storage
      chrome.storage.local.get(['emissionsHistory'], (data) => {
        const history = data.emissionsHistory || [];
        history.push({
          fileName: fileName || "Unnamed File",
          fileSize: fileSizeBytes,
          emissions: emissions,
        });

        chrome.storage.local.set({ emissionsHistory: history }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving history:", chrome.runtime.lastError);
            sendResponse({ success: false, error: "Failed to save history" });
            return;
          }
          console.log("History updated:", history);
        });
      });

      const notificationMessage = `Did you know? Uploading a file of size ${(fileSizeBytes / 1e6).toFixed(2)} MB will emit approximately ${emissions.toFixed(2)} grams of CO2.`;
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("icons/icon128.png"),
        title: "Think Before You Save",
        message: notificationMessage,
      });

      console.log(`File upload detected: ${fileSizeBytes} bytes, CO2 emissions: ${emissions.toFixed(2)} gCO2e`);
      sendResponse({ success: true, emissions });
    } catch (error) {
      console.error("Error calculating emissions:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Ensures `sendResponse` works asynchronously
});
