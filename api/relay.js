const crypto = require("crypto");

const ALLOWED_HOSTS = ["pixiv.net", "donmai.us", "wallhaven.cc", "api.bilibili.com"];
const FORWARDED_HEADERS = ["user-agent", "referer", "accept", "accept-language", "cookie", "origin"];
const PASSTHROUGH_HEADERS = ["content-type", "location"];
const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const MAX_HEADER_VALUE = 4000;

function hostAllowed(hostname) {
  const host = String(hostname).toLowerCase();
  return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith("." + allowed));
}

function safeEqual(received, expected) {
  const left = Buffer.from(String(received));
  const right = Buffer.from(String(expected));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function fail(res, status, code) {
  res.statusCode = status;
  res.setHeader("x-relay-error", code);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function parseForwardedHeaders(raw) {
  const result = {};
  if (!raw) return result;

  let parsed;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return result;
  }
  if (!parsed || typeof parsed !== "object") return result;

  for (const [name, value] of Object.entries(parsed)) {
    const key = name.toLowerCase();
    if (FORWARDED_HEADERS.includes(key) && typeof value === "string" && value.length <= MAX_HEADER_VALUE) {
      result[key] = value;
    }
  }
  return result;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return fail(res, 405, "method_not_allowed");

  const secret = process.env.RELAY_SECRET;
  if (!secret) return fail(res, 503, "relay_not_configured");
  if (!safeEqual(req.headers["x-relay-key"] || "", secret)) return fail(res, 401, "unauthorized");

  let target;
  try {
    target = new URL(new URL(req.url, "https://relay.local").searchParams.get("url") || "");
  } catch {
    return fail(res, 400, "invalid_url");
  }

  if (target.protocol !== "https:" || target.username || target.password || !hostAllowed(target.hostname)) {
    return fail(res, 403, "host_not_allowed");
  }

  let upstream;
  try {
    upstream = await fetch(target.toString(), {
      method: "GET",
      headers: parseForwardedHeaders(req.headers["x-relay-headers"]),
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    return fail(res, 502, err && (err.name === "TimeoutError" || err.name === "AbortError") ? "upstream_timeout" : "upstream_unreachable");
  }

  const declared = parseInt(upstream.headers.get("content-length") || "0", 10);
  if (declared > MAX_BYTES) return fail(res, 502, "response_too_large");

  let body;
  try {
    body = Buffer.from(await upstream.arrayBuffer());
  } catch {
    return fail(res, 502, "upstream_read_failed");
  }
  if (body.length > MAX_BYTES) return fail(res, 502, "response_too_large");

  res.statusCode = upstream.status;
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
};
