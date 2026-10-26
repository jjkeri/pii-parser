import { cleanCase } from "./cleaner.js";

const MENU_ID = "redact-pii";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Redact PII",
    contexts: ["selection"],
  });
});

// Runs inside the page. Replaces the selection in an editable field, else copies.
function applyInPage(cleaned) {
  const el = document.activeElement;
  if (
    el &&
    (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && typeof el.selectionStart === "number")) &&
    el.selectionStart !== el.selectionEnd
  ) {
    el.setRangeText(cleaned, el.selectionStart, el.selectionEnd, "end");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return "replaced";
  }
  const sel = window.getSelection();
  if (el && el.isContentEditable && sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(cleaned));
    sel.collapseToEnd();
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return "replaced";
  }
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = cleaned;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  };
  return navigator.clipboard.writeText(cleaned).then(() => "copied", () => {
    fallback();
    return "copied";
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab || tab.id === undefined || !info.selectionText) return;
  const cleaned = cleanCase(info.selectionText);
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [info.frameId ?? 0] },
      func: applyInPage,
      args: [cleaned],
    });
    chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });
    chrome.action.setBadgeText({ text: "✓" });
  } catch {
    chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
    chrome.action.setBadgeText({ text: "!" });
  }
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
});
