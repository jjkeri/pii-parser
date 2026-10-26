import test from "node:test";
import assert from "node:assert/strict";
import { cleanCase } from "./cleaner.js";

// Parity with pii_parser.py: the regex consumes "Customer John" (allowlisted) so "Smith"
// is not redacted — the README's "[NAME]" output is not what the Python actually produces.
test("README example (email/phone, Python parity)", () => {
  assert.equal(
    cleanCase("Customer John Smith (john@acme.com, +48 530 503 252) reported login failure."),
    "Customer John Smith ([EMAIL], [PHONE]) reported login failure."
  );
  assert.equal(cleanCase("Contact John Smith today"), "Contact John Smith today");
  assert.equal(cleanCase("Reported by John Smith."), "Reported by [NAME].");
});

test("IPv4 is not eaten by the phone rule", () => {
  assert.equal(cleanCase("Host 192.168.1.1 down"), "Host [IP] down");
});

test("IPv6", () => {
  assert.equal(cleanCase("From 2001:db8:85a3:0:0:8a2e:370:7334 now"), "From [IP] now");
});

test("account ID keeps label", () => {
  assert.equal(cleanCase("Account: ABC-12345"), "Account: [ID]");
});

test("allowlist words are left alone", () => {
  assert.equal(cleanCase("Monday Morning"), "Monday Morning");
  assert.equal(cleanCase("Customer Support"), "Customer Support");
});
