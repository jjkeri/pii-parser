// JS port of ../pii_parser.py (the reference implementation). Keep in sync.

// Email
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// IPv4 — must run before phone to prevent the phone regex consuming dotted quads
const IPV4_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

// IPv6 (abbreviated forms included)
const IPV6_RE = /\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b/g;

// Phone: runs after IPv4 so dotted quads are already replaced
const PHONE_RE = /\+?\d{1,3}[\s\-.]?(?:\(?\d{1,4}\)?[\s\-.]?)(?:\d[\s\-.]?){6,12}\d/g;

// Account/customer IDs: label is case-insensitive (explicit alternatives, since JS has
// no inline flag groups), the ID itself stays case-sensitive uppercase.
const ACCOUNT_ID_RE = new RegExp(
  "(?:" +
    ["account", "customer", "client", "user", "id", "ref", "case"]
      .map((w) => [...w].map((c) => `[${c}${c.toUpperCase()}]`).join(""))
      .join("|") +
    ")\\s*[:#]\\s*([A-Z0-9][A-Z0-9\\-]{5,19})",
  "g"
);

// Two-word proper name pattern: FirstName LastName (both title-case)
const NAME_RE = /\b([A-Z][a-z]{1,20})\s+([A-Z][a-z]{1,20})\b/g;

// Words that look like names but are not
const NAME_ALLOWLIST = new Set([
  // Days / months
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "August", "September",
  "October", "November", "December",
  // Products / platforms
  "Jira", "Slack", "Salesforce", "Chrome", "Safari", "Firefox", "Windows",
  "Outlook", "Teams", "Zendesk", "Servicenow", "Workday", "Cornerstone",
  // Common support case vocabulary (title-case at sentence start)
  "Customer", "Reporter", "Platform", "Environment", "Issue", "Steps",
  "Missing", "Duplicate", "Signal", "Status", "Active", "Subject",
  "Priority", "Category", "Severity", "Routing", "Confidence", "Impact",
  "Summary", "Analysis", "Evidence", "Timeline", "Actions", "Risks",
  "Internal", "External", "Client", "Account", "Contact", "Product",
  "Module", "Feature", "Version", "Error", "Response", "Request",
  "System", "Service", "Server", "Network", "Database", "Browser",
  "Portal", "Dashboard", "Report", "Access", "Permission", "Role",
  "Admin", "Support", "Technical", "Business", "Global", "Local",
]);

function redactNames(text) {
  return text.replace(NAME_RE, (match, first, last) =>
    NAME_ALLOWLIST.has(first) || NAME_ALLOWLIST.has(last) ? match : "[NAME]"
  );
}

/** Strip PII from support case text and return the sanitised string. */
export function cleanCase(text) {
  text = text.replace(EMAIL_RE, "[EMAIL]");
  // IP addresses must be replaced before phone to prevent false matches on dotted quads
  text = text.replace(IPV4_RE, "[IP]");
  text = text.replace(IPV6_RE, "[IP]");
  text = text.replace(PHONE_RE, "[PHONE]");
  text = text.replace(ACCOUNT_ID_RE, (m, id) => m.split(id).join("[ID]"));
  return redactNames(text);
}
