# 🔒 pii-parser

A Python utility that strips Personally Identifiable Information (PII) from support
case data before it is passed to AI models or logged externally. Built for enterprise
support workflows where data privacy and GDPR compliance are non-negotiable.

## Why this exists

When working support cases, raw case data often contains client names, email addresses,
phone numbers, and account identifiers. Passing this data directly to LLMs or logging
systems creates privacy risk. This tool sanitises case text before any external processing.

## What it strips

- Email addresses
- Phone numbers (international formats)
- Full names (configurable dictionary)
- Account/customer IDs (configurable regex)
- IP addresses

## Usage

```python
from pii_parser import clean_case

raw = "Customer John Smith (john@acme.com, +48 530 503 252) reported login failure."
safe = clean_case(raw)
# Output: "Customer [NAME] ([EMAIL], [PHONE]) reported login failure."
```

## Stack

- Python 3.10+
- `re` (stdlib regex)
- Configurable via `config.json`

## Status

Active — used internally as part of a Claude AI support workflow at Cornerstone OnDemand.
