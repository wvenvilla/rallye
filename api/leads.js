// api/leads.js
// Every reservation/appointment does TWO things in parallel:
//   1. Gets saved permanently in a Redis database (Upstash, via Vercel's
//      Storage marketplace) — so the business has a durable, queryable
//      record even if an email bounces or gets lost.
//   2. Triggers an email via Resend — for immediate notification.
// Neither one blocks the other; if email fails, the record is still saved,
// and vice versa.
//
// One-time setup in Vercel:
//   Storage tab -> Create Database -> Upstash -> Redis -> connect to this
//     project with prefix "KV" (Vercel injects KV_REDIS_URL automatically)
//   Environment Variables:
//     RESEND_API_KEY      -> from your Resend dashboard (API Keys)
//     RESERVATIONS_EMAIL  -> where vehicle reservations should land
//     SERVICE_EMAIL       -> where service appointments should land
//     LEADS_FROM_EMAIL    -> optional, requires a verified Resend domain
//     ADMIN_KEY           -> any secret you choose, protects the GET endpoint
//
// POST /api/leads          { type: "reservation" | "appointment", ...fields }
// GET  /api/leads?key=...             -> list saved records (JSON, requires ADMIN_KEY)
// GET  /api/leads?key=...&format=xlsx -> download all records as an Excel file
// GET  /api/leads?key=...&action=reset -> permanently deletes ALL saved records

import { createClient } from "redis";
import * as XLSX from "xlsx";

// Turns a saved record (reservation or appointment — different shapes) into
// one flat row with consistent columns, so both types export cleanly into
// the same spreadsheet.
function toRow(r) {
  return {
    ID: r.id,
    Type: r.type,
    "Created At": r.createdAt,
    Vehicle: r.vehicle || "",
    Stock: r.stock || "",
    VIN: r.vin || "",
    Location: r.location || "",
    Services: Array.isArray(r.services) ? r.services.join(", ") : (r.service || ""),
    Date: r.date || "",
    Time: r.time || "",
    Plate: r.plate || "",
    Name: r.name || "",
    Phone: r.phone || "",
    Email: r.email || "",
  };
}

// Reuse the connection across warm serverless invocations instead of
// reconnecting on every request.
let clientPromise;
function getClient() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.KV_REDIS_URL });
    client.on("error", (err) => console.error("Redis client error:", err));
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const TYPES = ["reservation", "appointment"];

// Defends against the most common copy-paste mistakes when setting env vars
// in Vercel: trailing whitespace/newlines, or accidentally-included quotes.
function cleanEnvEmail(v) {
  if (!v) return v;
  return v.trim().replace(/^["']|["']$/g, "");
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function reservationEmailHtml(data) {
  return `
    <h2>New vehicle reservation</h2>
    <p style="font-size:16px"><strong>${esc(data.vehicle)}</strong>${data.stock ? ` — Stock #${esc(data.stock)}` : ""}</p>
    ${data.vin && data.vin !== "N/A" ? `<p>VIN: ${esc(data.vin)}</p>` : ""}
    <hr/>
    <p><strong>Customer</strong></p>
    <p>${esc(data.name)}<br/>${esc(data.phone)}<br/>${esc(data.email)}</p>
    <p style="color:#888;font-size:12px">Reserved via the Rallye app — no payment taken online.</p>
  `;
}

function appointmentEmailHtml(data) {
  const services = Array.isArray(data.services) ? data.services.join(", ") : data.service || "";
  return `
    <h2>New service appointment</h2>
    <p style="font-size:16px"><strong>${esc(data.date)} at ${esc(data.time)}</strong></p>
    <p>Location: ${esc(data.location)}</p>
    <p>Services requested: ${esc(services)}</p>
    <hr/>
    <p><strong>Vehicle</strong></p>
    <p>${esc(data.vehicle)}${data.plate ? ` — Plate ${esc(data.plate)}` : ""}</p>
    ${data.vin ? `<p>VIN: ${esc(data.vin)}</p>` : ""}
    <hr/>
    <p><strong>Customer</strong></p>
    <p>${esc(data.name)}<br/>${esc(data.phone)}</p>
  `;
}

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set in Vercel environment variables");
  const from = process.env.LEADS_FROM_EMAIL || "Rallye Motors <onboarding@resend.dev>";

  const payload = { from, to, subject, html };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
  return res.json();
}

async function sendLeadEmail(type, data) {
  if (type === "reservation") {
    const to = cleanEnvEmail(process.env.RESERVATIONS_EMAIL);
    if (!to) throw new Error("RESERVATIONS_EMAIL is not set in Vercel environment variables");
    return sendEmail({
      to,
      subject: `New reservation: ${data.vehicle || "vehicle"}`,
      html: reservationEmailHtml(data),
      replyTo: data.email,
    });
  }
  const to = cleanEnvEmail(process.env.SERVICE_EMAIL);
  if (!to) throw new Error("SERVICE_EMAIL is not set in Vercel environment variables");
  return sendEmail({
    to,
    subject: `New service appointment: ${data.name || "customer"} — ${data.date || ""}`,
    html: appointmentEmailHtml(data),
  });
}

async function saveLeadToDb(type, id, record) {
  const client = await getClient();
  await client.set(id, JSON.stringify(record));
  await client.lPush(`index:${type}`, id);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const client = await getClient().catch((err) => {
      res.status(500).json({ error: "storage_unavailable", message: String(err.message || err) });
      return null;
    });
    if (!client) return;

    // Danger zone: permanently clears every saved reservation/appointment.
    if (req.query.action === "reset") {
      try {
        const idLists = await Promise.all(TYPES.map((t) => client.lRange(`index:${t}`, 0, -1)));
        const ids = idLists.flat();
        if (ids.length) await client.del(ids);
        await client.del(TYPES.map((t) => `index:${t}`));
        return res.status(200).json({ ok: true, deleted: ids.length });
      } catch (err) {
        return res.status(500).json({ error: "reset_failed", message: String(err.message || err) });
      }
    }

    try {
      const type = req.query.type;
      const wantedTypes = type ? [type] : TYPES;
      const idLists = await Promise.all(wantedTypes.map((t) => client.lRange(`index:${t}`, 0, -1)));
      const ids = idLists.flat();
      const rawRecords = ids.length ? await Promise.all(ids.map((id) => client.get(id))) : [];
      const records = rawRecords.filter(Boolean).map((r) => JSON.parse(r));
      const sorted = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (req.query.format === "xlsx") {
        const ws = XLSX.utils.json_to_sheet(sorted.map(toRow));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="rallye-leads-${new Date().toISOString().slice(0, 10)}.xlsx"`);
        return res.status(200).send(buf);
      }

      return res.status(200).json({ total: sorted.length, records: sorted });
    } catch (err) {
      return res.status(500).json({ error: "storage_unavailable", message: String(err.message || err) });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { type, ...data } = req.body || {};
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: "type must be 'reservation' or 'appointment'" });
  }

  const id = `${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const record = { id, type, ...data, createdAt: new Date().toISOString() };

  const [dbResult, emailResult] = await Promise.allSettled([
    saveLeadToDb(type, id, record),
    sendLeadEmail(type, data),
  ]);

  if (dbResult.status === "rejected") console.error("Failed to save lead to database:", dbResult.reason);
  if (emailResult.status === "rejected") console.error("Failed to send lead email:", emailResult.reason);

  const saved = dbResult.status === "fulfilled";
  const emailed = emailResult.status === "fulfilled";

  if (!saved && !emailed) {
    return res.status(500).json({ error: "both_failed", saved, emailed });
  }
  return res.status(200).json({ ok: true, saved, emailed });
}
