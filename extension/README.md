# PII Parser — Chrome extension

Manifest V3 port of `pii_parser.py`. Redacts emails, IPs, phone numbers, account IDs and names.

- **Popup:** paste text, get cleaned output, click Copy. Pre-fills with the page's current selection.
- **Context menu:** select text, right-click → **Redact PII**. In an editable field the selection is replaced in place; otherwise the cleaned text is copied to the clipboard.

## Install (Load unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this `extension/` folder

## Privacy

Everything runs locally in the browser. No network calls, no remote code, no analytics.

## Tests

```
node extension/cleaner.test.js
```

`cleaner.js` is a port of `../pii_parser.py` (the reference); keep them in sync.
