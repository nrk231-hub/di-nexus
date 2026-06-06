// ─── ALL SHIPMENT TEMPLATES ───────────────────────────────────────────────────
// Each template = one sheet from the Excel file

export const TEMPLATES = {

  // ── 1. Vitabiotics Export Shipment ────────────────────────────────────────
  vitabiotics: {
    id: "vitabiotics",
    label: "Vitabiotics",
    description: "Full export shipment to Vitabiotics via Zeyus & EFL",
    icon: "🌍",
    color: "#2352A0",
    phases: [
      "Order & Payment",
      "Documentation – Receive",
      "Documentation – Share",
      "Hard Copy Docs",
      "Logistics",
      "Final Docs",
    ],
    tasks: [
      { id: 1,  phase: "Order & Payment",         task: "Received PO from Vitabiotics" },
      { id: 2,  phase: "Order & Payment",         task: "Sent PI to Vitabiotics" },
      { id: 3,  phase: "Order & Payment",         task: "Received ACID No from Vitabiotics" },
      { id: 4,  phase: "Order & Payment",         task: "Sent PO to Zeyus Hegia" },
      { id: 5,  phase: "Order & Payment",         task: "Received 50% advance from Vitabiotics" },
      { id: 6,  phase: "Documentation – Receive", task: "Received COA from Zeyus" },
      { id: 7,  phase: "Documentation – Receive", task: "Received MSDS from Zeyus" },
      { id: 8,  phase: "Documentation – Receive", task: "Received Draft Labels from Zeyus" },
      { id: 9,  phase: "Documentation – Receive", task: "Received Draft Health Certificate from Zeyus" },
      { id: 10, phase: "Documentation – Share",   task: "Share COA to Vitabiotics" },
      { id: 11, phase: "Documentation – Share",   task: "Share MSDS to Vitabiotics" },
      { id: 12, phase: "Documentation – Share",   task: "Share Draft Labels to Vitabiotics" },
      { id: 13, phase: "Documentation – Share",   task: "Share Draft Health Certificate to Vitabiotics" },
      { id: 14, phase: "Documentation – Share",   task: "Provide COO Draft to Vitabiotics" },
      { id: 15, phase: "Documentation – Share",   task: "Share Draft Invoice to Vitabiotics" },
      { id: 16, phase: "Documentation – Share",   task: "Share Packing List to Vitabiotics" },
      { id: 17, phase: "Hard Copy Docs",          task: "Received Hard Copy of COA from Zeyus" },
      { id: 18, phase: "Hard Copy Docs",          task: "Received Hard Copy of MSDS from Zeyus" },
      { id: 19, phase: "Hard Copy Docs",          task: "Received Hard Copy of Health Declaration from Zeyus" },
      { id: 20, phase: "Logistics",               task: "Inform Zeyus to dispatch material from Vtrans" },
      { id: 21, phase: "Logistics",               task: "Email EFL for Quotation" },
      { id: 22, phase: "Logistics",               task: "Share Invoice and Packing List to EFL" },
      { id: 23, phase: "Logistics",               task: "EFL to generate Shipping Bill" },
      { id: 24, phase: "Logistics",               task: "Received Draft BL from EFL" },
      { id: 25, phase: "Logistics",               task: "Share BL Draft to Vitabiotics" },
      { id: 26, phase: "Logistics",               task: "BL Confirmed from Vitabiotics" },
      { id: 27, phase: "Logistics",               task: "Received BL Hard Copy from EFL" },
      { id: 28, phase: "Logistics",               task: "Material Received at Vtrans" },
      { id: 29, phase: "Logistics",               task: "Material Clearance and Dispatch to EFL" },
      { id: 30, phase: "Logistics",               task: "Sent Hard Copy Documents to EFL",
        note: "Invoice Orig ×2 · Packing List Orig ×2 · COA Orig ×1 · MSDS Orig ×1 · Non-Haz Orig ×1" },
      { id: 31, phase: "Final Docs",              task: "Generate COO Original" },
      { id: 32, phase: "Final Docs",              task: "Health Declaration Attested" },
      { id: 33, phase: "Final Docs",              task: "Share Final Documents to Vitabiotics" },
      { id: 34, phase: "Final Docs",              task: "Upload Documents in Cargo X" },
      { id: 35, phase: "Final Docs",              task: "Courier Final Documents to Vitabiotics",
        note: "MSDS Orig+Xerox · COA Orig+Xerox · Invoice Orig ×3 · Packing List Orig ×3 · COO Orig ×2 · Health Decl Orig+Attested · BL Orig ×1" },
    ],
  },

  // ── 2. Export Commission Payment ─────────────────────────────────────────
  export_commission: {
    id: "export_commission",
    label: "Export Commission Payment",
    description: "Bank and CA documentation for export commission",
    icon: "🏦",
    color: "#0369A1",
    phases: ["Bank Documents", "CA Documents"],
    tasks: [
      { id: 1,  phase: "Bank Documents", task: "Bank Form A2 (on letterhead)" },
      { id: 2,  phase: "Bank Documents", task: "Invoice (colour printout)" },
      { id: 3,  phase: "Bank Documents", task: "Shipping Bill" },
      { id: 4,  phase: "Bank Documents", task: "Airway Bill" },
      { id: 5,  phase: "CA Documents",   task: "CA Provide Form 146 Acknowledgement" },
      { id: 6,  phase: "CA Documents",   task: "CA Provide Form 146" },
      { id: 7,  phase: "CA Documents",   task: "Invoice of Delta Iris – Product Invoice (e.g. Beta Carotene)" },
      { id: 8,  phase: "CA Documents",   task: "Form 145 – Provide CA" },
      { id: 9,  phase: "CA Documents",   task: "Form 145 Acknowledgement" },
      { id: 10, phase: "CA Documents",   task: "UDIN" },
      { id: 11, phase: "CA Documents",   task: "Declaration on Letterhead" },
    ],
  },

  // ── 3. Axis Bank Document Submission ─────────────────────────────────────
  axis_bank: {
    id: "axis_bank",
    label: "Axis Bank Submission",
    description: "Documents to submit to Axis Bank (hard copy + email)",
    icon: "🏛️",
    color: "#9333EA",
    phases: ["Axis Bank Documents"],
    tasks: [
      { id: 1, phase: "Axis Bank Documents", task: "Invoice" },
      { id: 2, phase: "Axis Bank Documents", task: "Packing List" },
      { id: 3, phase: "Axis Bank Documents", task: "COO" },
      { id: 4, phase: "Axis Bank Documents", task: "Shipping Bill" },
      { id: 5, phase: "Axis Bank Documents", task: "AWB" },
      { id: 6, phase: "Axis Bank Documents", task: "Annexure 7",
        note: "All docs to be sent as hard copy AND email with merged PDF · All docs stamped and signed (Attested)" },
    ],
  },

  // ── 4. DHL Courier ────────────────────────────────────────────────────────
  dhl: {
    id: "dhl",
    label: "DHL Courier Docs",
    description: "Documents checklist for DHL courier shipment",
    icon: "📦",
    color: "#D97706",
    phases: ["DHL Documents"],
    tasks: [
      { id: 1, phase: "DHL Documents", task: "MSDS with 16 points – Original on letterhead ×1 + Xerox ×1" },
      { id: 2, phase: "DHL Documents", task: "COA – Original on letterhead ×1 + Xerox ×1" },
      { id: 3, phase: "DHL Documents", task: "Non-Haz Declaration – Original on letterhead ×1 + Xerox ×1" },
      { id: 4, phase: "DHL Documents", task: "KYC (GST and IEC)" },
      { id: 5, phase: "DHL Documents", task: "Invoice – 3 Copies" },
      { id: 6, phase: "DHL Documents", task: "Packing List – 3 Copies" },
      { id: 7, phase: "DHL Documents", task: "DHL Authorization Letter",
        note: "All docs to be signed and stamped by the shipper" },
    ],
  },

  // ── 5. FedEx Courier ──────────────────────────────────────────────────────
  fedex: {
    id: "fedex",
    label: "FedEx Courier Docs",
    description: "Documents checklist for FedEx courier shipment",
    icon: "✈️",
    color: "#6D28D9",
    phases: ["FedEx Documents"],
    tasks: [
      { id: 1, phase: "FedEx Documents", task: "MSDS with 16 points – Original on letterhead ×1 + Xerox ×1" },
      { id: 2, phase: "FedEx Documents", task: "COA – Original ×1 + Xerox ×1" },
      { id: 3, phase: "FedEx Documents", task: "Non-Haz Declaration – Original ×1 + Xerox ×1" },
      { id: 4, phase: "FedEx Documents", task: "KYC (GST and IEC)" },
      { id: 5, phase: "FedEx Documents", task: "Invoice – 3 Copies" },
      { id: 6, phase: "FedEx Documents", task: "Packing List – 3 Copies" },
      { id: 7, phase: "FedEx Documents", task: "FedEx Authorization Letter" },
      { id: 8, phase: "FedEx Documents", task: "End Use Letter" },
      { id: 9, phase: "FedEx Documents", task: "Scomet Declaration",
        note: "All docs to be signed and stamped by the shipper" },
    ],
  },

  // ── 6. Givaudan – Calcium Stearate ───────────────────────────────────────
  givaudan_ca_stearate: {
    id: "givaudan_ca_stearate",
    label: "Givaudan – Calcium Stearate",
    description: "Domestic supply to Givaudan via MLA and Vtrans",
    icon: "🧪",
    color: "#065F46",
    phases: ["Order & Procurement", "Documentation & Dispatch"],
    tasks: [
      { id: 1,  phase: "Order & Procurement",      task: "Received PO from Givaudan" },
      { id: 2,  phase: "Order & Procurement",      task: "Issued OC to Givaudan" },
      { id: 3,  phase: "Order & Procurement",      task: "Share PO to MLA" },
      { id: 4,  phase: "Order & Procurement",      task: "Received confirmation from MLA" },
      { id: 5,  phase: "Order & Procurement",      task: "Material dispatched from MLA through Vtrans" },
      { id: 6,  phase: "Order & Procurement",      task: "Received COA from MLA" },
      { id: 7,  phase: "Order & Procurement",      task: "Received MSDS from MLA" },
      { id: 8,  phase: "Documentation & Dispatch", task: "Issued Invoice to Vtrans" },
      { id: 9,  phase: "Documentation & Dispatch", task: "Issued E-way Bill to Vtrans" },
      { id: 10, phase: "Documentation & Dispatch", task: "Vtrans doc clearing letter to Vtrans" },
      { id: 11, phase: "Documentation & Dispatch", task: "Share Invoice to Givaudan" },
      { id: 12, phase: "Documentation & Dispatch", task: "Share COA to Givaudan" },
      { id: 13, phase: "Documentation & Dispatch", task: "Share MSDS to Givaudan" },
      { id: 14, phase: "Documentation & Dispatch", task: "Share E-way Bill to Givaudan" },
      { id: 15, phase: "Documentation & Dispatch", task: "Share Vtrans Goods Consignment Note to Givaudan" },
    ],
  },

  // ── 7. Givaudan – Acetic Acid ─────────────────────────────────────────────
  givaudan_acetic_acid: {
    id: "givaudan_acetic_acid",
    label: "Givaudan – Acetic Acid",
    description: "Supply to Givaudan via Titan with driver coordination",
    icon: "⚗️",
    color: "#0F766E",
    phases: ["Order & Procurement", "Driver & Documentation"],
    tasks: [
      { id: 1,  phase: "Order & Procurement",    task: "Received PO from Givaudan" },
      { id: 2,  phase: "Order & Procurement",    task: "Issued OC to Givaudan" },
      { id: 3,  phase: "Order & Procurement",    task: "Share PO to Titan" },
      { id: 4,  phase: "Order & Procurement",    task: "Received confirmation from Titan" },
      { id: 5,  phase: "Order & Procurement",    task: "Material dispatched from Titan" },
      { id: 6,  phase: "Order & Procurement",    task: "Received COA from Titan" },
      { id: 7,  phase: "Order & Procurement",    task: "Received MSDS from Titan" },
      { id: 8,  phase: "Driver & Documentation", task: "Coordinate with driver for material" },
      { id: 9,  phase: "Driver & Documentation", task: "Share Invoice to Driver" },
      { id: 10, phase: "Driver & Documentation", task: "Share E-way Bill to Driver" },
      { id: 11, phase: "Driver & Documentation", task: "Share COA to Driver" },
      { id: 12, phase: "Driver & Documentation", task: "Share COA to Givaudan" },
      { id: 13, phase: "Driver & Documentation", task: "Share MSDS to Givaudan" },
      { id: 14, phase: "Driver & Documentation", task: "Share Invoice to Givaudan" },
    ],
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

// Phase accent colors — shared across templates
export const PHASE_COLORS = {
  // Vitabiotics
  "Order & Payment":         { accent: "#2352A0", bg: "#EEF3FB", light: "#C5D5EE" },
  "Documentation – Receive": { accent: "#16A34A", bg: "#F0FDF4", light: "#BBF7D0" },
  "Documentation – Share":   { accent: "#F5891F", bg: "#FFF4E6", light: "#FDDDB0" },
  "Hard Copy Docs":          { accent: "#E11D48", bg: "#FFF1F2", light: "#FECDD3" },
  "Logistics":               { accent: "#3B72C8", bg: "#EFF6FF", light: "#BFDBFE" },
  "Final Docs":              { accent: "#7C3AED", bg: "#F5F3FF", light: "#DDD6FE" },
  // Export Commission
  "Bank Documents":          { accent: "#0369A1", bg: "#F0F9FF", light: "#BAE6FD" },
  "CA Documents":            { accent: "#0369A1", bg: "#EFF6FF", light: "#BFDBFE" },
  // Axis Bank
  "Axis Bank Documents":     { accent: "#9333EA", bg: "#F5F3FF", light: "#DDD6FE" },
  // DHL
  "DHL Documents":           { accent: "#D97706", bg: "#FFFBEB", light: "#FDE68A" },
  // FedEx
  "FedEx Documents":         { accent: "#6D28D9", bg: "#F5F3FF", light: "#DDD6FE" },
  // Givaudan
  "Order & Procurement":     { accent: "#065F46", bg: "#ECFDF5", light: "#A7F3D0" },
  "Documentation & Dispatch":{ accent: "#065F46", bg: "#F0FDF4", light: "#BBF7D0" },
  "Driver & Documentation":  { accent: "#0F766E", bg: "#F0FDFA", light: "#99F6E4" },
};
