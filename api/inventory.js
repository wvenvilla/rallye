// api/inventory.js
// Vercel serverless function. Runs on Node, NOT in the browser — so it can
// fetch the dealer feeds directly without hitting CORS restrictions.
// The React app calls GET /api/inventory (same-origin) instead of the feeds
// directly. Vercel's edge cache (s-maxage) keeps this "live" without
// hammering the dealer servers on every visit.

const FEEDS = [
  { brand: "Chrysler Group", url: "https://www.rallyemotors-chrysler.ca/feeds.asp?feed=Auction123Feedv2" },
  { brand: "Hyundai", url: "https://www.rallyemotors-hyundai.ca/feeds.asp?feed=Auction123Feedv2" },
  { brand: "Infiniti", url: "https://www.rallyemotors-infiniti.ca/feeds.asp?feed=Auction123Feedv2" },
  { brand: "Mitsubishi", url: "https://www.rallyemotors-mitsubishi.ca/feeds.asp?feed=Auction123Feedv2" },
  { brand: "Nissan", url: "https://www.rallyemotors-nissan.ca/feeds.asp?feed=Auction123Feedv2" },
  { brand: "Rallye Motors (Group / Pre-Owned)", url: "https://www.rallyemotors.ca/feeds.asp?feed=Auction123Feedv2" },
];

const MAX_PER_FEED = 120; // safety cap so one huge feed can't blow up the response
const MAX_PHOTOS_PER_VEHICLE = 20; // show the full real gallery, capped only as a sanity limit
const FETCH_TIMEOUT_MS = 8000;

// ---------- RFC4180-ish CSV parser (handles quoted fields with embedded commas) ----------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i] !== undefined ? r[i] : ""));
    return obj;
  });
}

// ---------- Normalization helpers ----------
function titleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// Like titleCase, but preserves tokens that look like acronyms or trims/codes
// (contain a digit, a hyphen, or are 3 letters or fewer in all caps) instead of
// mangling them — e.g. "QX50", "S-AWC", "RVR", "SLT" stay as-is.
function smartTitleCase(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => {
      if (!w) return w;
      const hasDigit = /\d/.test(w);
      const hasHyphen = w.includes("-");
      const lettersOnly = w.replace(/[^A-Za-z]/g, "");
      const shortAcronym = lettersOnly.length > 0 && lettersOnly.length <= 3 && lettersOnly === lettersOnly.toUpperCase();
      if (hasDigit || hasHyphen || shortAcronym) return w;
      const lower = w.toLowerCase();
      return lower[0].toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

// Some feeds cram marketing copy into the Model field itself, e.g.
// 'Wagoneer S Limited AWD! 0% FINANCING! ONLY 198 WEEKLY! EV!'. This pulls out
// a clean model name plus the promo fragments as separate, short features.
function cleanModelName(raw) {
  if (!raw) return { model: "", promoBits: [] };
  const parts = raw.split("!").map((s) => s.trim()).filter(Boolean);
  const model = smartTitleCase((parts[0] || "").split("$")[0].trim());
  const promoBits = parts.slice(1).filter((p) => p.length >= 2 && p.length < 40).map(smartTitleCase);
  return { model, promoBits };
}

function mapType(vehTypeName, category) {
  const vt = (vehTypeName || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  if (vt.includes("truck") || cat.includes("truck") || cat.includes("pickup") || cat.includes("crew cab") || cat.includes("cab pickup")) return "Pickup";
  if (vt === "van" || cat.includes("van")) return "Van";
  if (vt.includes("suv") || cat.includes("suv") || cat.includes("sport utility")) return "SUV";
  if (cat.includes("sedan") || cat.includes("coupe") || cat.includes("convertible") || cat.includes("hatchback")) return "Car";
  return "SUV"; // best default for this dealer group's mix
}

function extractTransmission(row) {
  // Some feeds populate Transmission_Description directly; others leave it
  // blank and bury it inside the free-text Options field instead.
  if (row.Transmission_Description && row.Transmission_Description.trim()) {
    return titleCase(row.Transmission_Description.trim());
  }
  const m = /TRANSMISSION:\s*([^,]+)/i.exec(row.Options || "");
  if (!m) return "Automatic";
  return titleCase(m[1].trim());
}

function extractEngine(options) {
  const m = /ENGINE:\s*([^,]+)/i.exec(options || "");
  return m ? titleCase(m[1].trim()) : null;
}

function mapFuel(fuelType) {
  const f = (fuelType || "").toLowerCase();
  if (f.includes("diesel")) return "Diesel";
  if (f.includes("hybrid")) return "Hybrid";
  if (f.includes("electric")) return "Electric";
  return "Gasoline";
}

function normalizeRow(row, sourceBrand) {
  const id = Number(row.VehicleID);
  if (!id || !row.Make || !row.Model) return null;

  const price = Number(row.SellingPrice) || 0;
  const msrp = Number(row.MSRP) || null;
  const savings = msrp && price && msrp > price ? msrp - price : null;
  const mileage = parseInt((row.Miles || "0").replace(/[^\d]/g, ""), 10) || 0;
  const photos = (row.PhotoURLs || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_PHOTOS_PER_VEHICLE);

  const { model: cleanedModel, promoBits } = cleanModelName(row.Model || "");
  const engine = extractEngine(row.Options);
  const overlay = (row.ImageOverlayText || "").trim();
  const priceText = row.PriceText && row.PriceText.trim() !== "**" && row.PriceText.trim().length > 4 ? row.PriceText.trim() : null;
  const features = [priceText, engine, row.Drivetrain, overlay, ...promoBits].filter(Boolean).slice(0, 4);

  const soldFlag = /sold/i.test(overlay);

  const dealerAddressParts = [row.DealerAddress, row.DealerCity, row.DealerState].filter(Boolean);

  return {
    id,
    brand: (row.Make || "").replace(/[®™]/g, "").trim() || sourceBrand,
    model: cleanedModel,
    year: Number(row.Year) || null,
    type: mapType(row.VehTypeName, row.Category),
    price: price || msrp || 0,
    msrp,
    savings,
    mileage,
    vin: row.VIN && row.VIN.trim() ? row.VIN.trim() : "N/A",
    stock: row.Stock || "",
    transmission: extractTransmission(row),
    fuel: mapFuel(row["Fuel Type"]),
    color: titleCase(row.ExteriorColor || ""),
    status: soldFlag ? "Sold" : "Available",
    condition: row.Type === "Used" ? "Used" : "New",
    photos,
    detailUrl: row["Detail-Page-URL"] || "",
    dealer: row.DealerName || sourceBrand,
    dealerAddress: dealerAddressParts.join(", "),
    features,
    insertedDate: row.InsertedDate || "",
  };
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function loadFeed(feed) {
  try {
    const text = await fetchWithTimeout(feed.url, FETCH_TIMEOUT_MS);
    const rows = rowsToObjects(parseCSV(text));
    const vehicles = rows
      .slice(0, MAX_PER_FEED)
      .map((r) => normalizeRow(r, feed.brand))
      .filter(Boolean);
    return { brand: feed.brand, ok: true, count: vehicles.length, vehicles };
  } catch (err) {
    return { brand: feed.brand, ok: false, count: 0, vehicles: [], error: String(err.message || err) };
  }
}

export default async function handler(req, res) {
  const results = await Promise.all(FEEDS.map(loadFeed));

  const vehicles = results
    .flatMap((r) => r.vehicles)
    .sort((a, b) => new Date(b.insertedDate) - new Date(a.insertedDate));

  const sources = results.map(({ brand, ok, count, error }) => ({ brand, ok, count, error }));

  // Cache at the edge for 15 minutes, serve stale for up to 1 hour while refreshing in the
  // background — this is what makes the feed feel "live" without re-fetching on every request.
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  res.status(200).json({
    fetchedAt: new Date().toISOString(),
    total: vehicles.length,
    sources,
    vehicles,
  });
}
