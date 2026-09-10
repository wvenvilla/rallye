// api/leads.js
// Sends vehicle reservations and service appointments straight to email
// instead of storing them in a database. Uses Resend (resend.com) — a
// transactional email API, no dependency to install (plain fetch call).
//
// One-time setup in Vercel (Settings -> Environment Variables):
//   RESEND_API_KEY      -> from your Resend dashboard (API Keys)
//   RESERVATIONS_EMAIL  -> where vehicle reservations should land, e.g. sales@rallyemotors.ca
//   SERVICE_EMAIL       -> where service appointments should land, e.g. service@rallyemotors.ca
//   LEADS_FROM_EMAIL    -> optional, e.g. "Rallye Motors <leads@yourdomain.com>"
//                          (requires verifying that domain in Resend; until then,
//                          this falls back to Resend's shared test sender)
//
// POST /api/leads  { type: "reservation" | "appointment", ...fields }

const RESEND_API_URL = "https://api.resend.com/emails";
const TYPES = ["reservation", "appointment"];

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { type, ...data } = req.body || {};
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: "type must be 'reservation' or 'appointment'" });
  }

  try {
    if (type === "reservation") {
      const to = process.env.RESERVATIONS_EMAIL;
      if (!to) throw new Error("RESERVATIONS_EMAIL is not set in Vercel environment variables");
      await sendEmail({
        to,
        subject: `New reservation: ${data.vehicle || "vehicle"}`,
        html: reservationEmailHtml(data),
        replyTo: data.email,
      });
    } else {
      const to = process.env.SERVICE_EMAIL;
      if (!to) throw new Error("SERVICE_EMAIL is not set in Vercel environment variables");
      await sendEmail({
        to,
        subject: `New service appointment: ${data.name || "customer"} — ${data.date || ""}`,
        html: appointmentEmailHtml(data),
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send lead email:", err);
    return res.status(500).json({ error: "email_failed", message: String(err.message || err) });
  }
}
