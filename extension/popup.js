import { cleanCase } from "./cleaner.js";

const input = document.getElementById("input");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copy");

function clean() {
  output.value = cleanCase(input.value);
}

async function prefillSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id === undefined) return;
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => String(window.getSelection() || ""),
    });
    if (res && res.result) {
      input.value = res.result;
      clean();
    }
  } catch {
    // Restricted pages (chrome://, web store) can't be scripted; ignore.
  }
}

input.addEventListener("input", clean);
document.getElementById("clean").addEventListener("click", clean);

copyBtn.addEventListener("click", async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
  } catch {
    output.select();
    document.execCommand("copy");
  }
  copyBtn.textContent = "Copied";
  setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
});

prefillSelection();
