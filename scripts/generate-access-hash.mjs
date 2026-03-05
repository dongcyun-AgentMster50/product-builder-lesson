#!/usr/bin/env node
import { createHmac } from "crypto";

const secret = String(process.env.ACCESS_HMAC_SECRET || "").trim();
const codes = process.argv.slice(2).map((item) => item.trim()).filter(Boolean);

if (!secret) {
    console.error("Missing ACCESS_HMAC_SECRET env.");
    process.exit(1);
}

if (!codes.length) {
    console.error("Usage: ACCESS_HMAC_SECRET=... node scripts/generate-access-hash.mjs \"code1\" \"code2\"");
    process.exit(1);
}

const hashes = codes.map((code) => createHmac("sha256", secret).update(code).digest("hex"));
console.log(hashes.join(","));
