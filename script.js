// script.js

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const userUUID = generateUUID();

let prevCodeLength = 0;
let accumulatedIncrease = 0;
let timer = null;
let firstSnapshot = true;

// ---- Outside iframe paste ----
window.addEventListener("paste", (e) => {
  const pastedText = (e.clipboardData || window.clipboardData).getData("text");
  if (pastedText.length > 100) {
    console.log("caught you (large page paste)");
  }
  /*
        fetch("https://your-backend-api/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid: userUUID, flag: "iframe-paste-detected" })
        });
        */
});

// ---- OneCompiler iframe ----
window.addEventListener("message", (event) => {
  if (event.origin !== "https://onecompiler.com") return;

  const data = event.data;
  let code = null;

  if (typeof data.code === "string") {
    code = data.code;
  } else if (data.files && data.files[0] && typeof data.files[0].content === "string") {
    code = data.files[0].content;
  }

  if (code !== null) {
    // Skip first snapshot
    if (firstSnapshot) {
      prevCodeLength = code.length;
      firstSnapshot = false;
      console.log("Initial snapshot ignored.");
      return;
    }

    const diff = code.length - prevCodeLength;

    if (diff > 0) {
      accumulatedIncrease += diff;

      // Start/reset timer (1 second window)
      clearTimeout(timer);
      timer = setTimeout(() => {
        accumulatedIncrease = 0;
      }, 1000);

      if (accumulatedIncrease > 100) {
        console.log("caught you (iframe paste)");

        /*
        fetch("https://your-backend-api/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid: userUUID, flag: "iframe-paste-detected" })
        });
        */

        accumulatedIncrease = 0;
      }
    }

    prevCodeLength = code.length;
  }
});
