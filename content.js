function handleFileUpload(fileSizeBytes, fileName) {
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(
      {
        type: "CALCULATE_EMISSIONS",
        fileSizeBytes,
        fileName,
      },
      (response) => {
        if (response && response.success) {
          console.log("Emissions calculated and notification displayed.");
        } else {
          console.error("Failed to calculate emissions or display notification.");
        }
      }
    );
  } else {
    console.error("chrome.runtime.sendMessage is not available.");
  }
}

function addChangeListener(input) {
  if (!input.dataset.listenerAdded) {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log(`File detected: ${file.name}, Size: ${file.size} bytes`);
        handleFileUpload(file.size, file.name); // Pass fileName to handleFileUpload
      }
    });
    input.dataset.listenerAdded = "true"; // Mark listener as added
  }
}

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target && target.type === "file" && target.files.length > 0) {
    const file = target.files[0];
    console.log(`File detected: ${file.name}, Size: ${file.size} bytes`);
    handleFileUpload(file.size, file.name); // Pass fileName to handleFileUpload
  }
});

// Observe the DOM for dynamically added file inputs
const observer = new MutationObserver(() => {
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    addChangeListener(input);
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Add listeners to already existing file inputs
document.querySelectorAll('input[type="file"]').forEach((input) => {
  addChangeListener(input);
});
