import { useState, useEffect } from "react";
import {
  Car, Wrench, ClipboardList, ChevronLeft, ChevronRight, Check, X, Gauge,
  Fuel, Cog, Palette, Phone, User, Mail, Clock, MapPin, Trash2
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const C = {
  base: "#14171B",
  surface: "#1D2126",
  surfaceRaised: "#252A30",
  border: "#2B3036",
  text: "#F3F2EE",
  muted: "#9195A0",
  accent: "#FF5433",      // reserve / purchase
  accent2: "#4C8DFF",     // service / appointments
  success: "#33C481",
  successBg: "rgba(51,196,129,0.12)",
  dangerBg: "rgba(255,84,51,0.12)",
};

const FONT_DISPLAY = "'Oswald', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

const money = (n) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */
// Real inventory from Rallye Motors Chrysler (Moncton, NB) — rallyemotors-chrysler.ca
const INITIAL_VEHICLES = [
  { id: 17100830, brand: "Jeep", model: "Wagoneer S Limited", year: 2025, type: "SUV", price: 62887, mileage: 12,
    vin: "3C4RJNBK1ST572524", stock: "CA502",
    transmission: "Automatic (1-spd)", fuel: "Electric", color: "Bright White", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/DD/B3/DDB39BA9-5E68-4211-A827-79816B28B647.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/39/25/392509A2-DC87-4F00-AFAF-2890FF5B778B.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/CD/C5/CDC592C1-1880-45C7-9C4C-65B047E1B102.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2025-Jeep-SUV-WAGONEER-S-LIMITED-Rallye-Motors-Chrysler--17100830",
    features: ["400V electric AWD", "Comfort package", "Two-tone paint", "$26,805 below MSRP"] },
  { id: 17768293, brand: "Jeep", model: "Compass North", year: 2026, type: "SUV", price: 36098, mileage: 12,
    vin: "3C4NJDBN3TT155135", stock: "CA686",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Bright White", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/C5/01/C501894D-D651-422C-B9D0-4667EED8912D.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/43/82/4382B3DD-5DA9-41E1-BD3A-1ADB3A5A9C2D.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/E1/9E/E19EBDE8-C6AB-4F35-87C2-6C5EF11495EF.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-SUV-COMPASS-NORTH-Rallye-Motors-Chrysler--17768293",
    features: ["2.0L Turbo engine", "17\" aluminum wheels", "0% financing", "Premium cloth seats"] },
  { id: 17731088, brand: "RAM", model: "2500 Big Horn", year: 2026, type: "Pickup", price: 85935, mileage: 12,
    vin: "3C63R5DL0TG176655", stock: "CA624",
    transmission: "8-spd Automatic", fuel: "Diesel", color: "Diamond Black Crystal Pearl", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/95/B7/95B7D13D-C8C5-4F74-BC95-97CBB708F2DB.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/38/B7/38B76DCF-373F-4F82-B97B-2BE42A87CFC7.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/D5/2C/D52CAD8E-7394-4088-A785-0B54CDB543E8.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-RAM-Light-Duty-Truck-2500-BIG-HORN-Rallye-Motors-Chrysler--17731088",
    features: ["Cummins 6.7L Turbo Diesel", "10-yr / 160,000 km warranty", "Heated seats & steering wheel", "0% up to 72 months"] },
  { id: 18369104, brand: "Dodge", model: "Charger Scat Pack", year: 2026, type: "Car", price: 64480, mileage: 5880,
    vin: "2C3CDAMPXTR212126", stock: "CA825",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Triple Nickel", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/48/BF/48BFCF7A-5517-48DA-81B9-EC75A762E521.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/CC/6B/CC6B8639-60B5-40E3-B153-EDF5E6C56EEA.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/36/8C/368C8B6F-AFBE-4219-8E2C-F2EDF85EEE6A.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Dodge-Car-CHARGER-SCAT-PACK-Rallye-Motors-Chrysler--18369104",
    features: ["3.0L I-6 Twin Turbo engine", "20\" black wheels", "Blacktop package", "$10,500 below MSRP"] },
  { id: 18479522, brand: "RAM", model: "1500 Tungsten", year: 2026, type: "Pickup", price: 96339, mileage: 12,
    vin: "1C6SRFKPXTN336989", stock: "CA873",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Bright White", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/A8/DD/A8DDF3AE-3F3E-4BA0-9A50-AD65804F2D7B.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/50/0C/500C1421-F785-4D1B-A47A-54ADF6D8E990.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/B8/C1/B8C120A0-E2B6-4E18-BAE6-B612043CF19A.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-RAM-Light-Duty-Truck-1500-TUNGSTEN-Rallye-Motors-Chrysler--18479522",
    features: ["Premium leather seats", "E-Locker rear axle", "Trailer brake control", "0% up to 84 months"] },
  { id: 18563474, brand: "Jeep", model: "Grand Cherokee Laredo X", year: 2026, type: "SUV", price: 57985, mileage: 12,
    vin: "N/A", stock: "CA858",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Diamond Black Crystal Pearl", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/10/C1/10C1EBA2-034C-4211-9162-6D28A1455D78.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/28/18/2818FB7E-D0FE-4AEA-B6DA-16A5010CD258.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/6F/5B/6F5BCB17-40F4-44FE-927C-7F247D73B408.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-SUV-GRAND-CHEROKEE-LAREDO-X-Rallye-Motors-Chrysler--18563474",
    features: ["3.6L Pentastar V6 engine", "0% up to 72 months", "Cloth seats", "From $198 weekly"] },
  { id: 18701919, brand: "Chrysler", model: "Grand Caravan SXT", year: 2026, type: "Van", price: 46978, mileage: 12,
    vin: "2C4RC1ZG0TR276399", stock: "CA944",
    transmission: "9-spd Automatic", fuel: "Gasoline", color: "Bright White", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/17/4B/174B0BC8-6ECD-47F1-92EA-4DFE125E5741.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/08/C4/08C46FDD-E767-4CEB-BD73-C9B6A69470EB.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/60/DC/60DCA7B9-81EB-45D3-8E20-B36D1B3DC03E.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Chrysler-Van-GRAND-CARAVAN-SXT-Rallye-Motors-Chrysler--18701919",
    features: ["3.6L Pentastar V6 engine", "Leatherette seats", "Great for families", "Large cargo space"] },
  { id: 18730076, brand: "Jeep", model: "Gladiator Nighthawk", year: 2026, type: "Pickup", price: 57968, mileage: 12,
    vin: "1C6PJTAGXTL180381", stock: "CA882",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Black", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/26/22/26229B68-8E21-439F-8B8C-88FD9DD46140.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/FB/74/FB74E676-C33C-48F3-A41C-81C96379BB6B.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/8C/98/8C98DCCF-32C0-4E75-9B9C-3B94CB7CB8A6.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-Light-Duty-Truck-GLADIATOR-NIGHTHAWK-Rallye-Motors-Chrysler--18730076",
    features: ["3.6L Pentastar V6 engine", "Convenience group", "Black cloth seats", "Open-air 4x4"] },
  { id: 18763597, brand: "Jeep", model: "Wrangler Sahara", year: 2026, type: "Car", price: 63328, mileage: 0,
    vin: "1C4PJXEG8TW303183", stock: "CA905",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Granite Crystal Metallic", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/FE/C3/FEC3A103-C641-4CBF-8357-DB8403FCD3B7.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/FA/68/FA68ED29-2133-41EA-A4F7-18F89CBBBB21.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/AE/C5/AEC5B14D-A4E4-4EBC-93D6-E16F4945D430.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-Car-WRANGLER-SAHARA-Rallye-Motors-Chrysler--18763597",
    features: ["Dual Top Group", "Trailer tow & HD electrical group", "Side steps", "0% up to 84 months"] },
  { id: 18819052, brand: "Jeep", model: "Grand Cherokee L Summit", year: 2026, type: "SUV", price: 78970, mileage: 0,
    vin: "1C4RJKARXT8596611", stock: "CA940",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Bright White", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/1D/56/1D563909-CA7E-4BC3-A769-4B95049A8AA0.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/16/42/16423C3C-6656-4D2F-99D1-9E9CBC7E21FC.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/25/3E/253EB747-A43D-4B8F-9B8C-F3865CB55158.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-SUV-GRAND-CHEROKEE-L-SUMMIT-Rallye-Motors-Chrysler--18819052",
    features: ["Third row of seats", "21\" wheels", "Palermo leather seats", "0% up to 72 months"] },
  { id: 18857168, brand: "RAM", model: "1500 Rebel", year: 2026, type: "Pickup", price: 84230, mileage: 0,
    vin: "1C6SRFLT2TN409803", stock: "CA928",
    transmission: "8-spd Automatic", fuel: "Hybrid", color: "Bright White", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/E0/7F/E07FEE25-4862-4600-B6B6-2FDBB75BFF1F.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/24/62/2462B575-0B46-4DCD-A616-F32E029A7ED0.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/17/62/176263D2-2518-4F72-9341-438E06A1D2AB.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-RAM-Light-Duty-Truck-1500-REBEL-Rallye-Motors-Chrysler--18857168",
    features: ["HEMI 5.7L V8 eTorque engine", "Steel Sport hood", "Red-accent seats", "0% up to 84 months"] },
  { id: 18862374, brand: "Jeep", model: "Cherokee Limited", year: 2026, type: "SUV", price: 53508, mileage: 12,
    vin: "3C4PJMB26TT263568", stock: "CA886",
    transmission: "Automatic (EVT)", fuel: "Hybrid", color: "Sting-Grey", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/2C/9F/2C9F4FE1-DD21-46F7-BC4D-56955FE47103.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/B9/4D/B94D10C0-93E3-431B-A3AF-FE04586EF131.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/30/87/308709C0-4BC2-4B0B-A0BC-B55C85475F77.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-SUV-CHEROKEE-LIMITED-Rallye-Motors-Chrysler--18862374",
    features: ["1.6L Turbo Hybrid engine", "6.3L / 100km", "Panoramic sunroof", "Only 1 unit left"] },
  { id: 18937173, brand: "Jeep", model: "Grand Wagoneer Summit Reserve", year: 2026, type: "SUV", price: 130085, mileage: 12,
    vin: "1C4SJVEP0TS191694", stock: "CA941",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "High Gloss Black", status: "Sold", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/B3/64/B3644F0A-F40E-4B84-A980-0A1BA8A657ED.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/79/F4/79F4F87C-3978-435E-AA15-B66036F32790.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/96/C9/96C974AF-98DD-4A37-B2EF-25B6B53B96AB.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-SUV-GRAND-WAGONEER-SUMMIT-RESERVE-Rallye-Motors-Chrysler--18937173",
    features: ["3.0L Twin Turbo engine", "Premium leather seats", "Black appearance package", "Top-of-the-line edition"] },
  { id: 18223708, brand: "RAM", model: "3500 Limited", year: 2026, type: "Pickup", price: 135270, mileage: 6000,
    vin: "3C63RRPL3TG263274", stock: "CA835",
    transmission: "8-spd Automatic", fuel: "Diesel", color: "Ceramic Grey", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/87/A8/87A8907C-07A6-4DD0-90B2-7007FB126A82.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/56/BE/56BEDC2C-F232-4867-AFD6-000230410F88.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/A5/21/A5218565-B6E3-46B8-B923-186A0268BFB5.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-RAM-Light-Duty-Truck-3500-LIMITED-Rallye-Motors-Chrysler--18223708",
    features: ["Cummins 6.7L Turbo Diesel", "Rear air suspension", "Power sunroof", "Dual rear wheels"] },
  { id: 18799886, brand: "Jeep", model: "Wrangler Rubicon", year: 2026, type: "Car", price: 82065, mileage: 0,
    vin: "1C4PJXFG0TW310546", stock: "CA935",
    transmission: "8-spd Automatic", fuel: "Gasoline", color: "Anvil", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/A6/9F/A69F659C-BC9A-4F6A-AABA-EB75BE9B927C.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/28/C5/28C54FC1-9540-4E3C-9383-8E50F90B8483.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/A4/C4/A4C40EDE-EB63-4CC7-A7D0-209693D2E417.jpg"],
    detailUrl: "https://www.rallyemotors-chrysler.ca/New-Inventory-2026-Jeep-Car-WRANGLER-RUBICON-Rallye-Motors-Chrysler--18799886",
    features: ["Performance suspension", "Nappa leather seats", "Freedom Top hardtop", "0% for 7 years"] },

  // Hyundai — Rallye Motors Hyundai (rallyemotors-hyundai.ca)
  { id: 17613065, brand: "Hyundai", model: "Kona 2.0L Preferred AWD", year: 2026, type: "SUV", price: 34249, mileage: 8558,
    vin: "KM8HCCAB7TU343120", stock: "HF105",
    transmission: "Automatic", fuel: "Gasoline", color: "Abyss Black", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/26/93/2693EF21-F333-4927-BC06-9B7E42577B2C.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/BA/96/BA9693F0-0A3E-4296-B954-4D17BF752A4D.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/9D/44/9D44FF8F-ABB5-4FEB-AA68-1BA63E015F32.jpg"],
    detailUrl: "https://www.rallyemotors-hyundai.ca/New-Inventory-2026-Hyundai-Car-KONA-2-0L-PREFERRED-AWD-Rallye-Motors-Hyundai-17613065",
    features: ["All-wheel drive", "From $91 weekly", "Subcompact SUV", "Android Auto / Apple CarPlay"] },
  { id: 18203354, brand: "Hyundai", model: "Tucson Preferred KMX", year: 2026, type: "SUV", price: 35649, mileage: 10,
    vin: "3KMJBCDE4TE037308", stock: "HF703",
    transmission: "Automatic", fuel: "Gasoline", color: "Ash Black", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/12/13/1213FDE2-B7F3-4F09-886D-91052A80839F.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/7E/6E/7E6E7BA3-B589-42CC-B510-4081446EC981.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/34/6C/346C322C-9CB7-4CEA-B021-1B5AFEA11975.jpg"],
    detailUrl: "https://www.rallyemotors-hyundai.ca/New-Inventory-2026-Hyundai-Car-TUCSON-PREFERRED-KMX-Rallye-Motors-Hyundai-18203354",
    features: ["Competitive warranty", "Midsize SUV", "Best price guarantee", "Ample cargo room"] },
  { id: 18223728, brand: "Hyundai", model: "Elantra N Line Ultimate", year: 2026, type: "Car", price: 31499, mileage: 10,
    vin: "KMHLR4DF6TU138899", stock: "HF682",
    transmission: "Automatic", fuel: "Gasoline", color: "Ecotronic Gray", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/62/93/6293E73F-A0B0-493A-8312-18B6BA409188.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/3E/DA/3EDAD432-92CC-4DF2-A0F3-3CB9A038D7D7.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/F2/A5/F2A57B33-888B-453D-8A69-8D55B908F621.jpg"],
    detailUrl: "https://www.rallyemotors-hyundai.ca/New-Inventory-2026-Hyundai-Car-ELANTRA-N-LINE-ULTIMATE-Rallye-Motors-Hyundai-18223728",
    features: ["N Line sport package", "From $188 biweekly", "Sport wheels", "Connected tech"] },
  { id: 18841403, brand: "Hyundai", model: "Santa Fe Ultimate Calligraphy HEV", year: 2026, type: "SUV", price: 57499, mileage: 10,
    vin: "KM8P5DG13TU197907", stock: "HG097",
    transmission: "Automatic", fuel: "Hybrid", color: "Abyss Black", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/2A/D8/2AD8FD77-E31E-4E4E-BF8D-0664FE8EA375.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/E5/3E/E53E8CC9-0305-488E-9B9D-244FE721840C.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/DD/2C/DD2C3497-3CCC-4F37-BE85-901DFCCC2C1A.jpg"],
    detailUrl: "https://www.rallyemotors-hyundai.ca/New-Inventory-2026-Hyundai-Car-SANTA-FE-ULTIMATE-CALLIGRAPHY-HEV-Rallye-Motors-Hyundai-18841403",
    features: ["Hybrid engine", "Top-trim Calligraphy finish", "3-row SUV", "Premium leather seats"] },

  // Infiniti — Rallye Motors Infiniti (rallyemotors-infiniti.ca)
  { id: 17840286, brand: "Infiniti", model: "QX50 Pure", year: 2025, type: "SUV", price: 38340, mileage: 10,
    vin: "3PCAJ5AB4SF114389", stock: "I1789",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Black Obsidian", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/CB/A2/CBA2C055-3071-4056-A567-DD2EA0BAC9D5.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/F1/42/F1422310-1D6E-48DE-9051-13E1F18B0D4D.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/71/C0/71C05603-2D94-404E-A566-05D0180A6A9E.jpg"],
    detailUrl: "https://www.rallyemotors-infiniti.ca/New-Inventory-2025-Infiniti-Car-QX50-PURE-Rallye-Motors-Infiniti-17840286",
    features: ["Best-selling luxury SUV in NB", "Save $18,400 (taxes included)", "From $122 weekly", "Variable compression engine"] },
  { id: 18268544, brand: "Infiniti", model: "QX60 Sport", year: 2026, type: "SUV", price: 63729, mileage: 5718,
    vin: "5N1AL1FS1TC348429", stock: "I1955",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Mineral Black", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/52/3F/523FDC52-1E83-4F01-9075-B386AFA7B4A7.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/E2/25/E225622B-AB99-44A4-9750-7387814068F0.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/5A/0E/5A0E775B-3B08-4CEC-A397-DDC003A450C6.jpg"],
    detailUrl: "https://www.rallyemotors-infiniti.ca/New-Inventory-2026-Infiniti-Car-QX60-SPORT-Rallye-Motors-Infiniti-18268544",
    features: ["3-row SUV", "Rates from 1.99%", "Dusk Blue sport interior", "Save $10,017 (taxes included)"] },
  { id: 17438220, brand: "Infiniti", model: "QX80 Autograph 7-Passenger", year: 2026, type: "SUV", price: 113570, mileage: 10,
    vin: "JN8AZ3CC8T9620049", stock: "I1719",
    transmission: "Automatic", fuel: "Gasoline", color: "Black Obsidian", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/47/92/47922BC0-9CAC-48F0-B0DE-3BF776C88652.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/70/59/705919E3-646A-4314-8487-1C4CC3BA86DA.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/65/79/65791E3C-B025-41B9-AB11-E828DAD535F7.jpg"],
    detailUrl: "https://www.rallyemotors-infiniti.ca/New-Inventory-2026-Infiniti-Car-QX80-AUTOGRAPH-7-PASSENGER-Rallye-Motors-Infiniti-17438220",
    features: ["6-year warranty", "Flagship 7-passenger SUV", "Save $20,608 (taxes included)", "Lease from 0.99%"] },
  { id: 18915882, brand: "Infiniti", model: "QX65 Luxe", year: 2027, type: "SUV", price: 64331, mileage: 0,
    vin: "5N1AC0EX5VC602380", stock: "I2011",
    transmission: "Automatic", fuel: "Gasoline", color: "Harbor Gray", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/08/ED/08ED4F2E-6C13-45CD-A345-5960F363C4B5.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/F3/BC/F3BC8E78-322F-4592-BCA9-E43CD8B1836C.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/30/5C/305C44C9-3D8A-46E6-8291-210A52A80E5D.jpg"],
    detailUrl: "https://www.rallyemotors-infiniti.ca/New-Inventory-2027-Infiniti-Car-QX65-LUXE-Rallye-Motors-Infiniti-18915882",
    features: ["Just-arrived 2027 model", "4 years maintenance included", "Save $5,875 (taxes included)", "Coupe-SUV design"] },

  // Mitsubishi — Rallye Motors Mitsubishi (rallyemotors-mitsubishi.ca)
  { id: 17861512, brand: "Mitsubishi", model: "Eclipse Cross Noir S-AWC", year: 2026, type: "SUV", price: 36473, mileage: 10,
    vin: "JA4ATVAA8TZ601134", stock: "M7895",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Titanium Grey", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/BD/01/BD01B4C8-C2AC-4E9F-86F6-85133046973C.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/7C/6C/7C6C606E-6EB1-4F9D-B927-184C34AD987A.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/FC/B2/FCB2B379-28AF-43A2-B558-33805A21B7F5.jpg"],
    detailUrl: "https://www.rallyemotors-mitsubishi.ca/New-Inventory-2026-Mitsubishi-Motors-Car-ECLIPSE-CROSS-NOIR-S-AWC-Rallye-Motors-Mitsubishi-17861512",
    features: ["S-AWC all-wheel drive", "Free winter tires", "Free remote start", "0.99% financing"] },
  { id: 18240298, brand: "Mitsubishi", model: "Outlander GT S-AWC", year: 2026, type: "SUV", price: 46873, mileage: 10,
    vin: "JA4J4WAB1TZ605506", stock: "M8032",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Moonstone Gray", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/81/13/81132BF6-843A-41F3-85AE-1C0ADCB324B4.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/54/58/5458B939-719F-4160-87FA-BD0387B5A13D.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/DA/13/DA13922D-65DD-46DF-85CD-492E1C08B9CA.jpg"],
    detailUrl: "https://www.rallyemotors-mitsubishi.ca/New-Inventory-2026-Mitsubishi-Motors-Car-OUTLANDER-GT-S-AWC-Rallye-Motors-Mitsubishi-18240298",
    features: ["Top-trim GT finish", "S-AWC all-wheel drive", "0.99% financing", "Third row available"] },
  { id: 18306464, brand: "Mitsubishi", model: "Outlander GT Premium S-AWC", year: 2026, type: "SUV", price: 47873, mileage: 10,
    vin: "JA4J4WABXTZ607707", stock: "M8081",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Cosmic Blue", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/22/83/228300D4-E434-43B9-9037-7C2DD269ADD0.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/B4/5B/B45B27C9-E6F3-44AF-A248-AAF689C2B5BE.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/DD/97/DD974AEA-4641-4DD6-8582-6D36092A406B.jpg"],
    detailUrl: "https://www.rallyemotors-mitsubishi.ca/New-Inventory-2026-Mitsubishi-Motors-Car-OUTLANDER-GT-PREMIUM-S-AWC-Rallye-Motors-Mitsubishi-18306464",
    features: ["Heated rear seats", "Digital rearview mirror", "Free extended warranty", "Premium interior"] },
  { id: 19081061, brand: "Mitsubishi", model: "Outlander SE S-AWC", year: 2026, type: "SUV", price: 41323, mileage: 10,
    vin: "JA4J4VAB9TZ621561", stock: "M8311",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Sterling Silver", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/49/5B/495B9A63-D291-4F6B-8FFD-8EE3C52771BC.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/B4/7D/B47D6D36-7671-4E54-A87F-D53AAC4ED4F2.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/1E/83/1E8389D5-56AA-498F-A23B-F7C06992D173.jpg"],
    detailUrl: "https://www.rallyemotors-mitsubishi.ca/New-Inventory-2026-Mitsubishi-Motors-Car-OUTLANDER-SE-S-AWC-Rallye-Motors-Mitsubishi-19081061",
    features: ["Mid-tier SE finish", "S-AWC all-wheel drive", "10-year warranty", "Great value for the price"] },

  // Nissan — Rallye Motors Nissan (rallyemotors-nissan.ca)
  { id: 18429507, brand: "Nissan", model: "Rogue Platinum AWD", year: 2026, type: "SUV", price: 41528, mileage: 10,
    vin: "JN8BT3DD5TW307765", stock: "NB162",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Super Black", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/88/4B/884B5E24-D021-4722-9B26-81C25B574816.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/83/02/8302F1AC-A43F-40AC-8A82-FBF1AC3F6EB4.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/98/E0/98E05D8A-829D-43E2-9C79-1448948EB173.jpg"],
    detailUrl: "https://www.rallyemotors-nissan.ca/New-Inventory-2026-Nissan-Car-ROGUE-PLATINUM-AWD-PANORAMIC-ROOF-BOSE-Rallye-Motors-Nissan-18429507",
    features: ["Quilted leather interior", "Panoramic roof & Bose audio", "ProPILOT Assist", "0% financing"] },
  { id: 18775793, brand: "Nissan", model: "Kicks SV Premium Elegance", year: 2026, type: "SUV", price: 31598, mileage: 0,
    vin: "3N8AP6CB2TL406728", stock: "NB326",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Aspen White Tricoat", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/33/06/3306D502-F49D-4E81-9220-8C11971AA80E.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/92/29/9229A281-15C7-495C-80C1-420F44C034D4.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/41/37/413710CC-17C1-4F38-B046-F652E57D4307.jpg"],
    detailUrl: "https://www.rallyemotors-nissan.ca/New-Inventory-2026-Nissan-Car-KICKS-SV-PREMIUM-ELEGANCE-Rallye-Motors-Nissan-18775793",
    features: ["NB's best-selling small SUV", "Winter package with alloy wheels", "Compact and efficient", "Great lease option"] },
  { id: 18910302, brand: "Nissan", model: "Sentra SR Sport Styling", year: 2026, type: "Car", price: 28450, mileage: 0,
    vin: "3N1AB9DV4TY304289", stock: "NB459",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Energetic Ember", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/74/41/74416BE6-5A34-48B8-BA44-B2121CE1016B.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/5A/79/5A79C550-E741-4DDD-8631-E137CDEC1C0C.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/C3/08/C3082150-D05C-45FE-93FA-ECE096BE2D18.jpg"],
    detailUrl: "https://www.rallyemotors-nissan.ca/New-Inventory-2026-Nissan-Car-SENTRA-SR-SR-Sport-Styling-Rallye-Motors-Nissan-18910302",
    features: ["SR sport package", "Maritime delivery available", "Accessible financing", "Transparent pricing"] },
  { id: 19014309, brand: "Nissan", model: "Murano Platinum", year: 2026, type: "SUV", price: 59098, mileage: 47,
    vin: "5N1AZ3DS9TC133409", stock: "NB511",
    transmission: "Automatic (CVT)", fuel: "Gasoline", color: "Super Black / Aurora Blue", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/4B/CB/4BCB3B72-AF5B-48A9-AF90-F9781A49EB40.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/53/38/5338E3E5-8A6F-4D94-A325-75D56032C26E.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/49/85/4985E6C4-1029-405A-B0A6-51452701C34C.jpg"],
    detailUrl: "https://www.rallyemotors-nissan.ca/New-Inventory-2026-Nissan-Car-MURANO-PLATINUM-ONLY-ONE-LEFT-LOADED-PANORAMIC-ROOF-Rallye-Motors-Nissan-19014309",
    features: ["Premium leather interior", "Heated & ventilated front seats", "Panoramic roof & Bose audio", "Last unit in stock"] },
  { id: 19071794, brand: "Nissan", model: "Pathfinder Platinum 4WD", year: 2026, type: "SUV", price: 58448, mileage: 65,
    vin: "5N1DR3DJXTC274350", stock: "NB517",
    transmission: "Automatic", fuel: "Gasoline", color: "Super Black / Boulder Gray", status: "Available", condition: "New",
    photos: ["https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/FA/DA/FADA21E3-B28A-4AD6-85F3-4BE339C5A698.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/85/D9/85D96D1B-7EA5-4048-9D5B-C0E7A157A3D0.jpg", "https://cdn.dealerspike.com/imglib/v1/1024x1024/imglib/Assets/Inventory/E6/92/E6926849-5C4D-46A5-9E39-B2E591F56561.jpg"],
    detailUrl: "https://www.rallyemotors-nissan.ca/New-Inventory-2026-Nissan-Car-PATHFINDER-PLATINUM-4WD-PANORAMIC-ROOF-BOSE-360-CAM-Rallye-Motors-Nissan-19071794",
    features: ["Fully loaded 3-row SUV", "Intelligent 4WD", "Heated & ventilated seats", "Power liftgate"] },
];

function statusStyle(status) {
  if (status === "Available") return { color: C.success, bg: C.successBg };
  if (status === "Sold") return { color: C.muted, bg: "rgba(255,255,255,0.06)" };
  return { color: C.accent, bg: C.dangerBg }; // Reserved
}

const PRICE_RANGES = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under $30,000", min: 0, max: 30000 },
  { label: "$30,000 – $50,000", min: 30000, max: 50000 },
  { label: "$50,000 – $75,000", min: 50000, max: 75000 },
  { label: "$75,000 – $100,000", min: 75000, max: 100000 },
  { label: "Over $100,000", min: 100000, max: Infinity },
];

const SERVICE_LOCATIONS = [
  { name: "Rallye Motors Chrysler", address: "1810 Main St W., Moncton, NB", phone: "506-852-8210" },
  { name: "Rallye Motors Hyundai", address: "199 Carson Dr., Moncton, NB", phone: "506-852-8200" },
  { name: "Rallye Motors Infiniti", address: "195 Carson Dr., Moncton, NB", phone: "506-386-3157" },
  { name: "Rallye Motors Mitsubishi", address: "1837 Main St., Moncton, NB", phone: "506-857-8677" },
  { name: "Rallye Motors Nissan", address: "191 Carson Dr., Moncton, NB", phone: "506-857-1800" },
];

const SERVICE_TYPES = ["Oil change", "Brakes", "Tires & alignment", "General diagnostics", "Major tune-up", "Other"];

const TIME_SLOTS = ["9:00", "10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00"];

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) cells.push(new Date(year, month, day));
  return cells;
}

// Full-month calendar for picking a service date. Closed Sundays; past days disabled.
function MonthCalendar({ selected, onSelect }) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = buildMonthGrid(viewMonth);
  const canGoPrev = viewMonth.getFullYear() > today.getFullYear() || viewMonth.getMonth() > today.getMonth();

  const changeMonth = (delta) => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => canGoPrev && changeMonth(-1)} disabled={!canGoPrev} style={{ color: canGoPrev ? C.text : C.border, padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.text, letterSpacing: 0.3 }}>
          {viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => changeMonth(1)} style={{ color: C.text, padding: 4 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 10.5, color: C.muted, padding: "2px 0" }}>{w}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < today;
          const isSunday = d.getDay() === 0;
          const disabled = isPast || isSunday;
          const isSelected = selected && dateKey(d) === dateKey(selected);
          const isToday = dateKey(d) === dateKey(today);
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(d)}
              style={{
                aspectRatio: "1", borderRadius: 9, fontSize: 12.5, fontFamily: FONT_BODY,
                border: isToday && !isSelected ? `1px solid ${C.accent2}` : "1px solid transparent",
                background: isSelected ? C.accent2 : "transparent",
                color: disabled ? "#4A4E55" : isSelected ? "#14171B" : C.text,
                textDecoration: isSunday && !isPast ? "line-through" : "none",
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SMALL VISUAL PIECES
--------------------------------------------------------- */
const TYPE_COLOR = { "Car": C.accent2, "SUV": C.accent, "Pickup": "#D9A93B", "Van": "#33C481" };

function CarBadge({ type }) {
  const color = TYPE_COLOR[type] || C.accent2;
  return (
    <div style={{ width: 56, height: 56, borderRadius: 14, background: `${color}1F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="34" height="20" viewBox="0 0 34 20" fill="none">
        <path d="M3 13.5 L6 7 Q7.5 5 10 5 H22 Q25 5 26.5 7.5 L30 13.5" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <rect x="1.5" y="13" width="31" height="3.6" rx="1.8" fill={color} />
        <circle cx="8.5" cy="17" r="2.6" fill={C.surface} stroke={color} strokeWidth="1.6" />
        <circle cx="25.5" cy="17" r="2.6" fill={C.surface} stroke={color} strokeWidth="1.6" />
      </svg>
    </div>
  );
}

// Real photo with automatic fallback to the illustrated icon if it fails to load
// (some dealer sites' image CDNs block hotlinking from other domains)
function VehiclePhoto({ src, alt, type, variant = "card", faded = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (variant === "hero") {
      return (
        <div style={{ background: `${TYPE_COLOR[type]}1A`, borderRadius: 18, padding: "28px 0", display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <svg width="150" height="88" viewBox="0 0 34 20" fill="none">
            <path d="M3 13.5 L6 7 Q7.5 5 10 5 H22 Q25 5 26.5 7.5 L30 13.5" stroke={TYPE_COLOR[type]} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
            <rect x="1.5" y="13" width="31" height="3.6" rx="1.8" fill={TYPE_COLOR[type]} />
            <circle cx="8.5" cy="17" r="2.6" fill={C.base} stroke={TYPE_COLOR[type]} strokeWidth="1.2" />
            <circle cx="25.5" cy="17" r="2.6" fill={C.base} stroke={TYPE_COLOR[type]} strokeWidth="1.2" />
          </svg>
        </div>
      );
    }
    return <CarBadge type={type} />;
  }

  const style = variant === "hero"
    ? { width: "100%", height: 200, objectFit: "cover", borderRadius: 18, marginBottom: 16, opacity: faded ? 0.55 : 1 }
    : { width: 64, height: 56, objectFit: "cover", borderRadius: 12, flexShrink: 0, opacity: faded ? 0.5 : 1 };

  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />;
}

// Multi-photo swipeable gallery with per-image fallback. If every photo in the
// set fails to load (hotlink-protected CDN), falls back to the illustrated hero.
function VehicleGallery({ photos = [], alt, type, faded = false }) {
  const [failed, setFailed] = useState({});
  const [active, setActive] = useState(0);

  const visible = photos.map((src, i) => ({ src, i })).filter(({ i }) => !failed[i]);

  if (visible.length === 0) {
    return (
      <div style={{ background: `${TYPE_COLOR[type]}1A`, borderRadius: 18, padding: "28px 0", display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <svg width="150" height="88" viewBox="0 0 34 20" fill="none">
          <path d="M3 13.5 L6 7 Q7.5 5 10 5 H22 Q25 5 26.5 7.5 L30 13.5" stroke={TYPE_COLOR[type]} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
          <rect x="1.5" y="13" width="31" height="3.6" rx="1.8" fill={TYPE_COLOR[type]} />
          <circle cx="8.5" cy="17" r="2.6" fill={C.base} stroke={TYPE_COLOR[type]} strokeWidth="1.2" />
          <circle cx="25.5" cy="17" r="2.6" fill={C.base} stroke={TYPE_COLOR[type]} strokeWidth="1.2" />
        </svg>
      </div>
    );
  }

  const handleScroll = (e) => {
    const w = e.currentTarget.clientWidth;
    if (w > 0) setActive(Math.round(e.currentTarget.scrollLeft / w));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        onScroll={handleScroll}
        style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", borderRadius: 18, WebkitOverflowScrolling: "touch" }}
      >
        {visible.map(({ src, i }) => (
          <img
            key={src}
            src={src}
            alt={alt}
            onError={() => setFailed((f) => ({ ...f, [i]: true }))}
            style={{ minWidth: "100%", height: 200, objectFit: "cover", flexShrink: 0, scrollSnapAlign: "start", opacity: faded ? 0.55 : 1 }}
          />
        ))}
      </div>
      {visible.length > 1 && (
        visible.length <= 8 ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
            {visible.map((_, i) => (
              <div key={i} style={{ width: active === i ? 14 : 5, height: 5, borderRadius: 3, background: active === i ? C.accent : C.border, transition: "all .2s" }} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11.5, color: C.muted }}>
            {Math.min(active + 1, visible.length)} / {visible.length} photos
          </div>
        )
      )}
    </div>
  );
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <label style={{ display: "block", flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "9px 8px", color: C.text, fontFamily: FONT_BODY, fontSize: 12.5, outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: C.surfaceRaised, color: C.text }}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Chip({ active, children, onClick, color = C.accent2 }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px", borderRadius: 999, fontSize: 13.5, fontFamily: FONT_BODY,
        border: `1px solid ${active ? color : C.border}`,
        background: active ? `${color}22` : "transparent",
        color: active ? color : C.muted, whiteSpace: "nowrap", transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ fontSize: 12.5, color: C.muted, display: "block", marginBottom: 6 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
        {Icon && <Icon size={16} color={C.muted} />}
        <input
          {...props}
          style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: FONT_BODY, fontSize: 14.5, width: "100%" }}
        />
      </div>
    </label>
  );
}

function PrimaryButton({ children, onClick, disabled, color = C.accent }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
        background: disabled ? C.border : color, color: disabled ? C.muted : "#14171B",
        fontFamily: FONT_DISPLAY, fontSize: 15.5, letterSpacing: 0.3, cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------
   CATALOG
--------------------------------------------------------- */
function CatalogList({ vehicles, onSelect }) {
  const [brand, setBrand] = useState("All");
  const [type, setType] = useState("All");
  const [year, setYear] = useState("All");
  const [priceIdx, setPriceIdx] = useState("0");
  const [condition, setCondition] = useState("All");

  const brands = ["All", ...Array.from(new Set(vehicles.map((v) => v.brand)))];
  const types = ["All", ...Array.from(new Set(vehicles.map((v) => v.type)))];
  const years = ["All", ...Array.from(new Set(vehicles.map((v) => v.year))).sort((a, b) => b - a)];
  const conditions = ["All", ...Array.from(new Set(vehicles.map((v) => v.condition)))];

  const range = PRICE_RANGES[Number(priceIdx)];

  const filtered = vehicles.filter(
    (v) =>
      (brand === "All" || v.brand === brand) &&
      (type === "All" || v.type === type) &&
      (year === "All" || v.year === Number(year)) &&
      (condition === "All" || v.condition === condition) &&
      v.price >= range.min && v.price <= range.max
  );

  return (
    <div style={{ padding: "4px 18px 18px" }}>
      <p style={{ fontSize: 12.5, color: C.muted, margin: "6px 0 8px" }}>Brand</p>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
        {brands.map((b) => (
          <Chip key={b} active={brand === b} onClick={() => setBrand(b)} color={C.accent}>{b}</Chip>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 8px" }}>Style</p>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
        {types.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)} color={C.accent}>{t}</Chip>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Dropdown
          label="Year"
          value={year}
          onChange={setYear}
          options={years.map((y) => ({ value: String(y), label: y === "All" ? "Any year" : String(y) }))}
        />
        <Dropdown
          label="Price"
          value={priceIdx}
          onChange={setPriceIdx}
          options={PRICE_RANGES.map((r, i) => ({ value: String(i), label: r.label }))}
        />
        <Dropdown
          label="Condition"
          value={condition}
          onChange={setCondition}
          options={conditions.map((c) => ({ value: c, label: c === "All" ? "New or used" : c }))}
        />
      </div>

      <p style={{ color: C.muted, fontSize: 13.5, margin: "2px 0 14px" }}>
        {filtered.length} {filtered.length === 1 ? "vehicle found" : "vehicles found"}
      </p>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted }}>
          <Car size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ fontSize: 14 }}>No vehicles match these filters.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((v) => {
          const st = statusStyle(v.status);
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              style={{
                display: "flex", gap: 12, alignItems: "center", textAlign: "left",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12,
              }}
            >
              {v.photos && v.photos[0] ? (
                <VehiclePhoto src={v.photos[0]} alt={`${v.brand} ${v.model}`} type={v.type} variant="card" faded={v.status === "Sold"} />
              ) : (
                <CarBadge type={v.type} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.text }}>{v.brand} {v.model}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{v.year}</span>
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{v.type} · {v.transmission} · {v.fuel}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.text }}>{money(v.price)}</span>
                    {v.savings ? (
                      <span style={{ fontSize: 10.5, color: C.success }}>save {money(v.savings)}</span>
                    ) : null}
                  </span>
                  <span style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 999, color: st.color, background: st.bg }}>{v.status}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VehicleDetail({ vehicle, onReserve, onBack }) {
  const st = statusStyle(vehicle.status);
  return (
    <div style={{ padding: "4px 18px 18px" }}>
      <VehicleGallery photos={vehicle.photos} alt={`${vehicle.brand} ${vehicle.model}`} type={vehicle.type} faded={vehicle.status === "Sold"} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.text, margin: 0 }}>{vehicle.brand} {vehicle.model}</h2>
        <span style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 999, color: st.color, background: st.bg, whiteSpace: "nowrap", marginTop: 4 }}>{vehicle.status}</span>
      </div>
      <p style={{ color: C.muted, margin: "4px 0 14px", fontSize: 14 }}>{vehicle.year} · {vehicle.type}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "0 0 6px" }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.accent }}>{money(vehicle.price)}</span>
        {vehicle.msrp && vehicle.savings ? (
          <span style={{ fontSize: 14, color: C.muted, textDecoration: "line-through" }}>{money(vehicle.msrp)}</span>
        ) : null}
      </div>
      {vehicle.savings ? (
        <p style={{ fontSize: 12.5, color: C.success, margin: "0 0 12px", fontFamily: FONT_BODY }}>
          You save {money(vehicle.savings)} off MSRP
        </p>
      ) : (
        <div style={{ marginBottom: 18 }} />
      )}

      <p style={{ fontSize: 11.5, color: C.muted, margin: "0 0 18px", fontFamily: "monospace", letterSpacing: 0.2 }}>
        Stock #{vehicle.stock}{vehicle.vin && vehicle.vin !== "N/A" ? ` · VIN ${vehicle.vin}` : ""}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[
          [Gauge, "Mileage", `${vehicle.mileage.toLocaleString("en-US")} km`],
          [Cog, "Transmission", vehicle.transmission],
          [Fuel, "Fuel", vehicle.fuel],
          [Palette, "Color", vehicle.color],
        ].map(([Icon, label, value]) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
            <Icon size={15} color={C.muted} />
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{label}</div>
            <div style={{ fontSize: 13.5, color: C.text, marginTop: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 8, textTransform: "none" }}>Key features</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {vehicle.features.map((f) => (
          <span key={f} style={{ fontSize: 12.5, color: C.text, background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 12px" }}>{f}</span>
        ))}
      </div>

      {vehicle.status === "Available" ? (
        <PrimaryButton onClick={onReserve}>Reserve this vehicle</PrimaryButton>
      ) : (
        <div style={{ textAlign: "center", padding: 12, borderRadius: 12, background: st.bg, color: st.color, fontSize: 13.5 }}>
          {vehicle.status === "Sold" ? "This vehicle has already been sold" : "This vehicle is already reserved"}
        </div>
      )}
      {vehicle.detailUrl && (
        <a href={vehicle.detailUrl} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", margin: "14px 0 0", color: C.accent2, fontSize: 12.5 }}>
          View full listing on site ↗
        </a>
      )}
      <button onClick={onBack} style={{ display: "block", margin: "10px auto 0", color: C.muted, fontSize: 13.5 }}>Back to catalog</button>
    </div>
  );
}

function ReserveForm({ vehicle, onConfirm, onBack }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const valid = form.name.trim() && form.phone.trim().length >= 10 && form.email.includes("@");
  return (
    <div style={{ padding: "4px 18px 18px" }}>
      <p style={{ color: C.muted, fontSize: 13.5, marginBottom: 4 }}>Reserving</p>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.text, margin: "0 0 8px" }}>{vehicle.brand} {vehicle.model} {vehicle.year}</h2>
      <p style={{ fontSize: 11.5, color: C.muted, margin: "0 0 18px", fontFamily: "monospace" }}>
        Stock #{vehicle.stock}{vehicle.vin && vehicle.vin !== "N/A" ? ` · VIN ${vehicle.vin}` : ""}
      </p>

      <Field label="Full name" icon={User} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Field label="Phone" icon={Phone} placeholder="10 digits" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Field label="Email" icon={Mail} placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

      <p style={{ fontSize: 12, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
        When you reserve, the vehicle is held for you with no online payment required. An advisor will contact you to complete the process.
      </p>

      <PrimaryButton disabled={!valid} onClick={() => onConfirm(form)}>Confirm reservation</PrimaryButton>
      <button onClick={onBack} style={{ display: "block", margin: "14px auto 0", color: C.muted, fontSize: 13.5 }}>Cancel</button>
    </div>
  );
}

function Confirmation({ title, subtitle, onDone, color = C.success }) {
  return (
    <div style={{ padding: "60px 26px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Check size={30} color={color} />
      </div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, color: C.text, margin: "0 0 8px" }}>{title}</h2>
      <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.5, marginBottom: 26 }}>{subtitle}</p>
      <PrimaryButton onClick={onDone} color={color}>Done</PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   SERVICE SCHEDULING
--------------------------------------------------------- */
function ServiceForm({ onSubmit }) {
  const [vBrand, setVBrand] = useState("");
  const [vModel, setVModel] = useState("");
  const [vPlate, setVPlate] = useState("");
  const [vVin, setVVin] = useState("");
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [time, setTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const toggleService = (s) => {
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const occupiedForDate = (d) => {
    if (!d) return [];
    const n = d.getDate();
    return [TIME_SLOTS[(n * 2) % TIME_SLOTS.length], TIME_SLOTS[(n * 3 + 1) % TIME_SLOTS.length]];
  };
  const occupied = occupiedForDate(selectedDate);

  const valid =
    vBrand.trim() && vModel.trim() && location && services.length > 0 &&
    selectedDate && time && name.trim() && phone.trim().length >= 10;

  return (
    <div style={{ padding: "4px 18px 32px" }}>
      <p style={{ fontSize: 12.5, color: C.muted, margin: "6px 0 8px" }}>Your vehicle</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Brand" placeholder="e.g. Jeep" value={vBrand} onChange={(e) => setVBrand(e.target.value)} />
        <Field label="Model" placeholder="e.g. Wrangler" value={vModel} onChange={(e) => setVModel(e.target.value)} />
      </div>
      <Field label="License plate (optional)" placeholder="ABC-123" value={vPlate} onChange={(e) => setVPlate(e.target.value)} />
      <Field label="VIN" placeholder="17-character VIN" value={vVin} onChange={(e) => setVVin(e.target.value.toUpperCase())} />
      <p style={{ fontSize: 11, color: C.muted, marginTop: -8, marginBottom: 14, lineHeight: 1.4 }}>
        You'll find it on your dashboard (driver's side) or door jamb. Having it helps our team pull up the exact service history for your vehicle.
      </p>

      <p style={{ fontSize: 12.5, color: C.muted, margin: "10px 0 8px" }}>Service location</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {SERVICE_LOCATIONS.map((loc) => {
          const isSelected = location?.name === loc.name;
          return (
            <button
              key={loc.name}
              onClick={() => setLocation(loc)}
              style={{
                display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: 12, borderRadius: 12,
                border: `1px solid ${isSelected ? C.accent2 : C.border}`,
                background: isSelected ? `${C.accent2}18` : C.surface,
              }}
            >
              <MapPin size={16} color={isSelected ? C.accent2 : C.muted} style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: isSelected ? C.accent2 : C.text }}>{loc.name}</div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{loc.address}</div>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 8px" }}>Service type — select all that apply</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {SERVICE_TYPES.map((s) => (
          <Chip key={s} active={services.includes(s)} onClick={() => toggleService(s)} color={C.accent2}>{s}</Chip>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 8px" }}>Choose a day</p>
      <MonthCalendar selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setTime(null); }} />

      <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 8px" }}>
        Available times{selectedDate ? ` — ${selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : ""}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {TIME_SLOTS.map((t) => {
          const isOccupied = occupied.includes(t);
          const isSelected = time === t;
          const disabled = !selectedDate || isOccupied;
          return (
            <button
              key={t}
              disabled={disabled}
              onClick={() => setTime(t)}
              style={{
                padding: "9px 0", borderRadius: 10, fontSize: 13, fontFamily: FONT_BODY,
                border: `1px solid ${isSelected ? C.accent2 : C.border}`,
                background: disabled ? C.base : isSelected ? `${C.accent2}22` : C.surface,
                color: disabled ? "#4A4E55" : isSelected ? C.accent2 : C.text,
                textDecoration: selectedDate && isOccupied ? "line-through" : "none",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 8px" }}>Contact info</p>
      <Field label="Full name" icon={User} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="Phone" icon={Phone} placeholder="10 digits" value={phone} onChange={(e) => setPhone(e.target.value)} />

      <PrimaryButton
        color={C.accent2}
        disabled={!valid}
        onClick={() =>
          onSubmit({
            id: Date.now(), vehicle: `${vBrand} ${vModel}`, plate: vPlate, vin: vVin,
            location: location.name, services,
            date: selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            time, name, phone,
          })
        }
      >
        Book appointment
      </PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   APPOINTMENTS
--------------------------------------------------------- */
function AppointmentsList({ reservations, appointments, onCancelReservation, onCancelAppointment }) {
  const empty = reservations.length === 0 && appointments.length === 0;
  return (
    <div style={{ padding: "4px 18px 24px" }}>
      {empty && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
          <ClipboardList size={30} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ fontSize: 14 }}>You don't have any reservations or appointments yet.</p>
        </div>
      )}

      {reservations.length > 0 && (
        <>
          <p style={{ fontSize: 12.5, color: C.muted, margin: "6px 0 10px" }}>Reserved vehicles</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {reservations.map((r) => (
              <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.text, margin: 0 }}>{r.vehicle}</p>
                    <p style={{ fontSize: 12.5, color: C.muted, margin: "4px 0 0" }}>{r.name} · {r.phone}</p>
                    {r.stock && (
                      <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>
                        Stock #{r.stock}{r.vin && r.vin !== "N/A" ? ` · VIN ${r.vin}` : ""}
                      </p>
                    )}
                  </div>
                  <button onClick={() => onCancelReservation(r.id)} style={{ color: C.muted }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {appointments.length > 0 && (
        <>
          <p style={{ fontSize: 12.5, color: C.muted, margin: "6px 0 10px" }}>Service appointments</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {appointments.map((a) => (
              <div key={a.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.text, margin: 0 }}>
                      {Array.isArray(a.services) ? a.services.join(", ") : a.service}
                    </p>
                    <p style={{ fontSize: 12.5, color: C.muted, margin: "4px 0 0" }}>{a.vehicle}{a.plate ? ` · ${a.plate}` : ""}</p>
                    {a.vin && (
                      <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>VIN {a.vin}</p>
                    )}
                    {a.location && (
                      <p style={{ fontSize: 11.5, color: C.muted, margin: "2px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={11} />{a.location}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 10, marginTop: 6, color: C.accent2, fontSize: 12.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} />{a.date}, {a.time}</span>
                    </div>
                  </div>
                  <button onClick={() => onCancelAppointment(a.id)} style={{ color: C.muted }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   SHELL
--------------------------------------------------------- */
function Header({ title, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 18px 14px", borderBottom: `1px solid ${C.border}` }}>
      {onBack && (
        <button onClick={onBack} style={{ color: C.muted }}><ChevronLeft size={20} /></button>
      )}
      <div>
        <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text, margin: 0, letterSpacing: 0.4 }}>{title}</p>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { key: "catalog", label: "Catalog", icon: Car },
    { key: "service", label: "Service", icon: Wrench },
    { key: "appointments", label: "My appointments", icon: ClipboardList },
  ];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.surface }}>
      {items.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
          >
            <Icon size={19} color={active ? C.accent : C.muted} />
            <span style={{ fontSize: 10.5, color: active ? C.accent : C.muted }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Fire-and-forget save to the database (Vercel KV via /api/leads). Never
// blocks the UI — if it fails, the person still sees their confirmation
// locally, but staff should know saves can fail if KV isn't configured yet.
function saveLead(type, data) {
  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...data }),
  }).catch((err) => console.error("Failed to save lead:", err));
}

export default function App() {
  const [tab, setTab] = useState("catalog");
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES); // shown until live data arrives
  const [liveStatus, setLiveStatus] = useState("loading"); // loading | live | offline
  const [selectedId, setSelectedId] = useState(null);
  const [catalogView, setCatalogView] = useState("list"); // list | detail | reserve | done
  const [reservations, setReservations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [serviceDone, setServiceDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/inventory")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.vehicles) && data.vehicles.length) {
          setVehicles(data.vehicles);
          setLiveStatus("live");
        } else {
          setLiveStatus("offline");
        }
      })
      .catch(() => {
        if (!cancelled) setLiveStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);

  const goCatalogList = () => { setCatalogView("list"); setSelectedId(null); };

  const handleReserveConfirm = (form) => {
    setVehicles((vs) => vs.map((v) => (v.id === selectedId ? { ...v, status: "Reserved" } : v)));
    const record = { id: Date.now(), vehicle: `${selectedVehicle.brand} ${selectedVehicle.model}`, stock: selectedVehicle.stock, vin: selectedVehicle.vin, ...form };
    setReservations((rs) => [...rs, record]);
    saveLead("reservation", record);
    setCatalogView("done");
  };

  const title = {
    catalog: catalogView === "list" ? "Catalog" : catalogView === "detail" ? selectedVehicle?.model : catalogView === "reserve" ? "Reserve vehicle" : "Confirmation",
    service: serviceDone ? "Confirmation" : "Book service",
    appointments: "My appointments",
  }[tab];

  const showBack = (tab === "catalog" && catalogView !== "list");

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", height: "100vh", maxHeight: 860, display: "flex", flexDirection: "column",
      background: C.base, fontFamily: FONT_BODY, overflow: "hidden", border: `1px solid ${C.border}`, borderRadius: 22,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        input::placeholder { color: #5B5F67; }
      `}</style>

      <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: "#14171B", fontWeight: 600 }}>R</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.text, letterSpacing: 1 }}>RALLYE</span>
          <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: 0.4, marginTop: -1 }}>Moncton · Rexton · Dieppe · Since 1994</div>
        </div>
        <span
          style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap",
            color: liveStatus === "live" ? C.success : liveStatus === "loading" ? C.muted : C.accent,
            background: liveStatus === "live" ? C.successBg : liveStatus === "loading" ? "transparent" : C.dangerBg,
            border: liveStatus === "loading" ? `1px solid ${C.border}` : "none",
          }}
        >
          {liveStatus === "live" ? "● Live inventory" : liveStatus === "loading" ? "Loading…" : "Demo data"}
        </span>
      </div>

      <Header title={title} onBack={showBack ? () => setCatalogView(catalogView === "detail" ? "list" : "detail") : null} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "catalog" && catalogView === "list" && (
          <CatalogList vehicles={vehicles} onSelect={(id) => { setSelectedId(id); setCatalogView("detail"); }} />
        )}
        {tab === "catalog" && catalogView === "detail" && selectedVehicle && (
          <VehicleDetail vehicle={selectedVehicle} onReserve={() => setCatalogView("reserve")} onBack={goCatalogList} />
        )}
        {tab === "catalog" && catalogView === "reserve" && selectedVehicle && (
          <ReserveForm vehicle={selectedVehicle} onConfirm={handleReserveConfirm} onBack={() => setCatalogView("detail")} />
        )}
        {tab === "catalog" && catalogView === "done" && selectedVehicle && (
          <Confirmation
            title="Vehicle reserved!"
            subtitle={`We've reserved the ${selectedVehicle.brand} ${selectedVehicle.model} for you. An advisor will reach out shortly to complete the process.`}
            onDone={goCatalogList}
          />
        )}

        {tab === "service" && !serviceDone && (
          <ServiceForm onSubmit={(appt) => { setAppointments((a) => [...a, appt]); saveLead("appointment", appt); setServiceDone(true); }} />
        )}
        {tab === "service" && serviceDone && (
          <Confirmation
            color={C.accent2}
            title="Appointment booked!"
            subtitle="Your service appointment has been booked. We'll see you at the shop on the date and time you selected."
            onDone={() => setServiceDone(false)}
          />
        )}

        {tab === "appointments" && (
          <AppointmentsList
            reservations={reservations}
            appointments={appointments}
            onCancelReservation={(id) => {
              const r = reservations.find((x) => x.id === id);
              setReservations((rs) => rs.filter((x) => x.id !== id));
              if (r) setVehicles((vs) => vs.map((v) => (`${v.brand} ${v.model}` === r.vehicle ? { ...v, status: "Available" } : v)));
            }}
            onCancelAppointment={(id) => setAppointments((a) => a.filter((x) => x.id !== id))}
          />
        )}
      </div>

      <BottomNav tab={tab} setTab={(t) => { setTab(t); setCatalogView("list"); setServiceDone(false); }} />
    </div>
  );
}
