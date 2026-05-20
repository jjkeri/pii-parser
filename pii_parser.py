"""PII sanitiser for enterprise support case data."""

import re
import sys

# Email: standard RFC 5322 simplified pattern
_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

# Phone: international formats — optional +, country code, separators (spaces/dashes/dots)
_PHONE_RE = re.compile(
    r"\+?[\d]{1,3}[\s\-.]?(?:\(?\d{1,4}\)?[\s\-.]?)(?:\d[\s\-.]?){6,12}\d"
)

# IPv4 addresses
_IPV4_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")

# IPv6 addresses (abbreviated forms included)
_IPV6_RE = re.compile(
    r"\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b"
)

# Account/customer IDs: alphanumeric strings 6–20 chars preceded by common labels
_ACCOUNT_ID_RE = re.compile(
    r"(?i)(?:account|customer|client|user|id|ref|case)\s*[:#]?\s*([A-Z0-9\-]{6,20})"
)

# Common name patterns: "FirstName LastName" — two capitalised words
# Intentionally conservative to avoid false positives on product names
_NAME_RE = re.compile(r"\b([A-Z][a-z]{1,20})\s+([A-Z][a-z]{1,20})\b")

# Words that look like names but aren't — expand as needed
_NAME_ALLOWLIST = frozenset({
    "Jira", "Slack", "Salesforce", "Chrome", "Safari", "Firefox",
    "Windows", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
    "January", "February", "March", "April", "August", "September",
    "October", "November", "December",
})


def _redact_names(text: str) -> str:
    """Replace two-word proper-name patterns not on the allowlist."""
    def _replace(m: re.Match) -> str:
        first, last = m.group(1), m.group(2)
        if first in _NAME_ALLOWLIST or last in _NAME_ALLOWLIST:
            return m.group(0)
        return "[NAME]"

    return _NAME_RE.sub(_replace, text)


def clean_case(text: str) -> str:
    """Strip PII from support case text and return the sanitised string."""
    text = _EMAIL_RE.sub("[EMAIL]", text)
    text = _PHONE_RE.sub("[PHONE]", text)
    text = _IPV4_RE.sub("[IP]", text)
    text = _IPV6_RE.sub("[IP]", text)
    text = _ACCOUNT_ID_RE.sub(lambda m: m.group(0).replace(m.group(1), "[ID]"), text)
    text = _redact_names(text)
    return text


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raw = sys.stdin.read()
    else:
        raw = " ".join(sys.argv[1:])

    print(clean_case(raw))
