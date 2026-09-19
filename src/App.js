import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { TEMPLATES, TEMPLATE_LIST, PHASE_COLORS } from "./templates";
// ─── CRM CUSTOMER FETCH ───────────────────────────────────────────────────────
const CRM_URL = "https://fwjlhocedpzeijsshwjh.supabase.co";
const CRM_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3amxob2NlZHB6ZWlqc3Nod2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjc1OTMsImV4cCI6MjEwMzc0MzU5M30.jBukjNnMccX6qxnX9f3FZbukcjGB_1zfWo0iQ3xO3Es";

async function fetchCRMCustomers() {
  try {
    const res = await fetch(
      `${CRM_URL}/rest/v1/customers?select=id,company_name,product_interest,status&order=company_name.asc`,
      { headers: { "apikey": CRM_KEY, "Authorization": `Bearer ${CRM_KEY}` } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}



// ─── BRAND ────────────────────────────────────────────────────────────────────
const C = {
  blue: "#1B3A6B", blueMid: "#2352A0", blueLight: "#3B72C8",
  orange: "#F5891F", orangeLight: "#FDECD6",
  white: "#FFFFFF", bg: "#F4F7FB", border: "#DDE6F0",
  textDark: "#1B3A6B", textMid: "#4A6080", textLight: "#8DA0B8",
};

const LOCAL_KEY = "di-session-v2";
const saveSession = (d) => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); } catch {} };
const loadSession = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY)); } catch { return null; } };

function Logo({ height = 36, white = true }) {
  return <img src={white ? "/logo-white.png" : "/logo.png"} alt="Delta Iris" style={{ height, objectFit: "contain" }} />;
}

const ICON_OPTIONS = ["📋","🚢","🏦","🏛️","📦","✈️","🧪","⚗️","🔄","📁","📝","💼","🔑","🛳️","📊","🧾","🏭","🚛","📬","💰"];
const COLOR_OPTIONS = ["#2352A0","#F5891F","#16A34A","#E11D48","#9333EA","#0369A1","#D97706","#065F46","#0F766E","#6D28D9","#DC2626","#0284C7"];

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading, error }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [pin2, setPin2] = useState("");
  const ready = name.trim() && pin.length === 4 && (!isNew || pin === pin2);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.blue} 0%, ${C.blueMid} 60%, ${C.blueLight} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ background: C.white, borderRadius: 20, padding: "16px 28px", marginBottom: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <Logo height={44} white={false} />
      </div>
      <div style={{ width: "100%", maxWidth: 340, background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "28px 24px", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 style={{ color: C.white, fontSize: 20, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>{isNew ? "Create Account" : "Welcome Back"}</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textAlign: "center", marginBottom: 24 }}>DI Nexus. One platform. One team. One workflow.</p>
        {[["YOUR NAME", name, setName, "text", "e.g. Nithin"], ["4-DIGIT PIN", pin, (v) => setPin(v.replace(/\D/g,"").slice(0,4)), "password", "••••"]].map(([label, val, setter, type, ph]) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>{label}</label>
            <input placeholder={ph} value={val} onChange={e => setter(e.target.value)} type={type} inputMode={type === "password" ? "numeric" : "text"}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        {isNew && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>CONFIRM PIN</label>
            <input placeholder="••••" value={pin2} onChange={e => setPin2(e.target.value.replace(/\D/g,"").slice(0,4))} type="password" inputMode="numeric"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            {pin.length === 4 && pin2.length === 4 && pin !== pin2 && <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 6 }}>PINs don't match</p>}
          </div>
        )}
        {error && <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 10, textAlign: "center" }}>{error}</p>}
        <button onClick={() => ready && onLogin(name.trim(), pin, isNew)} disabled={!ready || loading}
          style={{ width: "100%", marginTop: 16, padding: 14, borderRadius: 12, border: "none", background: ready && !loading ? C.orange : "rgba(255,255,255,0.15)", color: C.white, fontSize: 15, fontWeight: 700, cursor: ready && !loading ? "pointer" : "default" }}>
          {loading ? "Please wait…" : isNew ? "Create Account →" : "Sign In →"}
        </button>
        <button onClick={() => { setIsNew(!isNew); setPin(""); setPin2(""); }}
          style={{ width: "100%", marginTop: 10, padding: 10, background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}>
          {isNew ? "Already have an account? Sign in" : "New user? Create account"}
        </button>
      </div>
    </div>
  );
}

// ─── TEMPLATE BUILDER ─────────────────────────────────────────────────────────
function TemplateBuilder({ user, onClose, onSaved }) {
  const [step, setStep] = useState(1); // 1=details, 2=phases+tasks
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📋");
  const [color, setColor] = useState("#2352A0");
  const [phases, setPhases] = useState([{ name: "", tasks: [{ text: "", note: "" }] }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addPhase = () => setPhases(p => [...p, { name: "", tasks: [{ text: "", note: "" }] }]);
  const removePhase = (pi) => setPhases(p => p.filter((_, i) => i !== pi));
  const updatePhaseName = (pi, val) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, name: val } : ph));

  const addTask = (pi) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, tasks: [...ph.tasks, { text: "", note: "" }] } : ph));
  const removeTask = (pi, ti) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, tasks: ph.tasks.filter((_, j) => j !== ti) } : ph));
  const updateTask = (pi, ti, field, val) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, tasks: ph.tasks.map((t, j) => j === ti ? { ...t, [field]: val } : t) } : ph));

  const handleSave = async () => {
    // Validate
    if (!label.trim()) { setError("Please give this template a name."); return; }
    const validPhases = phases.filter(ph => ph.name.trim());
    if (validPhases.length === 0) { setError("Add at least one phase."); return; }
    const allTasks = validPhases.flatMap(ph => ph.tasks.filter(t => t.text.trim()));
    if (allTasks.length === 0) { setError("Add at least one task."); return; }

    // Build template object
    let taskId = 1;
    const builtPhases = validPhases.map(ph => ph.name.trim());
    const builtTasks = validPhases.flatMap(ph =>
      ph.tasks.filter(t => t.text.trim()).map(t => ({
        id: taskId++,
        phase: ph.name.trim(),
        task: t.text.trim(),
        ...(t.note.trim() ? { note: t.note.trim() } : {}),
      }))
    );

    const templateData = {
      label: label.trim(),
      description: description.trim() || label.trim(),
      icon,
      color,
      phases: builtPhases,
      tasks: builtTasks,
      created_by: user.name,
    };

    setSaving(true);
    const { data, error: err } = await supabase.from("custom_templates").insert(templateData).select().single();
    setSaving(false);
    if (err) { setError("Could not save template. Try again."); return; }
    onSaved(data);
  };

  const iStyle = { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", color: C.textDark, fontFamily: "inherit", background: C.white };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bg, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueMid})`, borderRadius: "20px 20px 0 0", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ color: C.white, fontSize: 17, fontWeight: 800, margin: 0 }}>Create New Template</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "3px 0 0" }}>Step {step} of 2 · {step === 1 ? "Name & Style" : "Phases & Tasks"}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "7px 11px", color: C.white, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          {/* Progress */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 99, marginTop: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", width: step === 1 ? "50%" : "100%", background: C.orange, borderRadius: 99, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px" }}>
          {step === 1 && (
            <>
              <label style={labelSt}>TEMPLATE NAME</label>
              <input placeholder="e.g. Domestic Supply – BASF" value={label} onChange={e => setLabel(e.target.value)} style={{ ...iStyle, marginBottom: 14 }} />

              <label style={labelSt}>DESCRIPTION (optional)</label>
              <input placeholder="Brief description of this workflow" value={description} onChange={e => setDescription(e.target.value)} style={{ ...iStyle, marginBottom: 18 }} />

              <label style={labelSt}>ICON</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {ICON_OPTIONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    style={{ width: 42, height: 42, borderRadius: 10, border: icon === ic ? `2px solid ${color}` : `1.5px solid ${C.border}`, background: icon === ic ? `${color}15` : C.white, fontSize: 20, cursor: "pointer" }}>
                    {ic}
                  </button>
                ))}
              </div>

              <label style={labelSt}>COLOR</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {COLOR_OPTIONS.map(cl => (
                  <button key={cl} onClick={() => setColor(cl)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: color === cl ? `3px solid ${C.textDark}` : "none", background: cl, cursor: "pointer", outline: color === cl ? `2px solid ${cl}` : "none", outlineOffset: 2 }} />
                ))}
              </div>

              {/* Preview */}
              {label.trim() && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 11, color: C.textLight, margin: "2px 0 0" }}>{description || "No description"}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
                Add phases (sections) and tasks under each phase. You can add notes to tasks for reference.
              </p>
              {phases.map((ph, pi) => (
                <div key={pi} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 14, overflow: "hidden" }}>
                  {/* Phase header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: `${color}10`, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, flex: 0, whiteSpace: "nowrap" }}>PHASE {pi + 1}</span>
                    <input placeholder="Phase name e.g. Order & Payment" value={ph.name} onChange={e => updatePhaseName(pi, e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", fontWeight: 600, color: C.textDark }} />
                    {phases.length > 1 && (
                      <button onClick={() => removePhase(pi)} style={{ background: "#FEE2E2", border: "none", borderRadius: 7, padding: "6px 9px", color: "#E11D48", cursor: "pointer", fontSize: 13 }}>🗑</button>
                    )}
                  </div>

                  {/* Tasks */}
                  <div style={{ padding: "10px 14px" }}>
                    {ph.tasks.map((t, ti) => (
                      <div key={ti} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.textLight, minWidth: 18 }}>{ti + 1}</span>
                          <input placeholder={`Task ${ti + 1} description`} value={t.text} onChange={e => updateTask(pi, ti, "text", e.target.value)}
                            style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", color: C.textDark }} />
                          {ph.tasks.length > 1 && (
                            <button onClick={() => removeTask(pi, ti)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: 16, padding: "4px" }}>✕</button>
                          )}
                        </div>
                        <input placeholder="Note / document reference (optional)" value={t.note} onChange={e => updateTask(pi, ti, "note", e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box", marginTop: 5, padding: "6px 10px 6px 26px", borderRadius: 8, border: `1px dashed ${C.border}`, fontSize: 12, outline: "none", fontFamily: "inherit", color: C.textMid, background: "#FAFBFC" }} />
                      </div>
                    ))}
                    <button onClick={() => addTask(pi)} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1.5px dashed ${color}`, background: `${color}08`, color, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
                      + Add Task
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={addPhase} style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1.5px dashed ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
                + Add Phase
              </button>
            </>
          )}

          {error && <p style={{ color: "#E11D48", fontSize: 13, marginTop: 8, fontWeight: 600 }}>{error}</p>}
        </div>

        {/* Footer buttons */}
        <div style={{ padding: "14px 20px 32px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              ← Back
            </button>
          )}
          {step === 1 && (
            <button onClick={() => { if (!label.trim()) { setError("Please enter a template name."); return; } setError(""); setStep(2); }}
              style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: label.trim() ? color : C.border, color: C.white, fontSize: 14, fontWeight: 700, cursor: label.trim() ? "pointer" : "default" }}>
              Next: Add Tasks →
            </button>
          )}
          {step === 2 && (
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: saving ? C.border : C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer", boxShadow: saving ? "none" : "0 4px 14px rgba(245,137,31,0.3)" }}>
              {saving ? "Saving…" : "Save Template ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelSt = { fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: 0.5, display: "block", marginBottom: 8 };


// ─── TEMPLATE EDITOR ─────────────────────────────────────────────────────────
function TemplateEditor({ template, user, onClose, onSaved }) {
  const [label, setLabel] = useState(template.label || "");
  const [description, setDescription] = useState(template.description || "");
  const [icon, setIcon] = useState(template.icon || "📋");
  const [color, setColor] = useState(template.color || "#2352A0");
  // Build phases structure from flat tasks
  const buildPhaseState = (tpl) => {
    const phaseList = tpl.phases || [...new Set((tpl.tasks || []).map(t => t.phase))];
    return phaseList.map(ph => ({
      name: ph,
      tasks: (tpl.tasks || []).filter(t => t.phase === ph).map(t => ({ text: t.task, note: t.note || "" }))
    }));
  };
  const [phases, setPhases] = useState(() => buildPhaseState(template));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addPhase = () => setPhases(p => [...p, { name: "", tasks: [{ text: "", note: "" }] }]);
  const removePhase = (pi) => setPhases(p => p.filter((_, i) => i !== pi));
  const updatePhaseName = (pi, val) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, name: val } : ph));
  const addTask = (pi) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, tasks: [...ph.tasks, { text: "", note: "" }] } : ph));
  const removeTask = (pi, ti) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, tasks: ph.tasks.filter((_, j) => j !== ti) } : ph));
  const updateTask = (pi, ti, field, val) => setPhases(p => p.map((ph, i) => i === pi ? { ...ph, tasks: ph.tasks.map((t, j) => j === ti ? { ...t, [field]: val } : t) } : ph));

  const handleSave = async () => {
    if (!label.trim()) { setError("Template name is required."); return; }
    const validPhases = phases.filter(ph => ph.name.trim());
    if (!validPhases.length) { setError("Add at least one phase."); return; }
    let taskId = 1;
    const builtPhases = validPhases.map(ph => ph.name.trim());
    const builtTasks = validPhases.flatMap(ph =>
      ph.tasks.filter(t => t.text.trim()).map(t => ({
        id: taskId++, phase: ph.name.trim(), task: t.text.trim(),
        ...(t.note.trim() ? { note: t.note.trim() } : {}),
      }))
    );
    if (!builtTasks.length) { setError("Add at least one task."); return; }
    const payload = { label: label.trim(), description: description.trim() || label.trim(), icon, color, phases: builtPhases, tasks: builtTasks };
    setSaving(true);
    const { data, error: err } = await supabase.from("custom_templates").update(payload).eq("id", template.id).select().single();
    setSaving(false);
    if (err) { setError("Could not save. Try again."); return; }
    onSaved(data);
  };

  const iStyle = { width: "100%", boxSizing: "border-box", padding: "10px 13px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none", color: C.textDark, fontFamily: "inherit", background: C.white };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bg, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560, maxHeight: "94vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: `linear-gradient(135deg, ${color}, ${C.blueMid})`, borderRadius: "20px 20px 0 0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ color: C.white, fontSize: 17, fontWeight: 800, margin: 0 }}>Edit Template</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "3px 0 0" }}>{label || "Untitled"}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "7px 11px", color: C.white, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 18px" }}>
          {/* Meta */}
          <div style={{ background: C.white, borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelSt}>NAME</label>
                <input value={label} onChange={e => setLabel(e.target.value)} style={iStyle} placeholder="Template name" />
              </div>
              <div>
                <label style={labelSt}>DESCRIPTION</label>
                <input value={description} onChange={e => setDescription(e.target.value)} style={iStyle} placeholder="Short description" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div>
                <label style={labelSt}>ICON</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => setIcon(ic)} style={{ width: 36, height: 36, borderRadius: 8, border: icon === ic ? `2px solid ${color}` : `1.5px solid ${C.border}`, background: icon === ic ? `${color}15` : C.white, fontSize: 18, cursor: "pointer" }}>{ic}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={labelSt}>COLOR</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {COLOR_OPTIONS.map(cl => (
                  <button key={cl} onClick={() => setColor(cl)} style={{ width: 28, height: 28, borderRadius: 6, border: color === cl ? `3px solid ${C.textDark}` : "none", background: cl, cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Phases & Tasks */}
          {phases.map((ph, pi) => (
            <div key={pi} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${color}10`, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>PHASE {pi + 1}</span>
                <input value={ph.name} onChange={e => updatePhaseName(pi, e.target.value)} placeholder="Phase name"
                  style={{ flex: 1, padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", fontWeight: 600, color: C.textDark }} />
                {phases.length > 1 && <button onClick={() => removePhase(pi)} style={{ background: "#FEE2E2", border: "none", borderRadius: 6, padding: "5px 8px", color: "#E11D48", cursor: "pointer", fontSize: 12 }}>🗑</button>}
              </div>
              <div style={{ padding: "10px 14px" }}>
                {ph.tasks.map((t, ti) => (
                  <div key={ti} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textLight, minWidth: 16 }}>{ti + 1}</span>
                      <input value={t.text} onChange={e => updateTask(pi, ti, "text", e.target.value)} placeholder={`Task ${ti + 1}`}
                        style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", color: C.textDark }} />
                      {ph.tasks.length > 1 && <button onClick={() => removeTask(pi, ti)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: 15 }}>✕</button>}
                    </div>
                    <input value={t.note} onChange={e => updateTask(pi, ti, "note", e.target.value)} placeholder="Note (optional)"
                      style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "5px 10px 5px 24px", borderRadius: 7, border: `1px dashed ${C.border}`, fontSize: 11, outline: "none", fontFamily: "inherit", color: C.textMid, background: "#FAFBFC" }} />
                  </div>
                ))}
                <button onClick={() => addTask(pi)} style={{ width: "100%", padding: "7px", borderRadius: 8, border: `1.5px dashed ${color}`, background: `${color}08`, color, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Task</button>
              </div>
            </div>
          ))}
          <button onClick={addPhase} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1.5px dashed ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>+ Add Phase</button>
          {error && <p style={{ color: "#E11D48", fontSize: 13, fontWeight: 600 }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 18px 32px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: saving ? C.border : C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
            {saving ? "Saving…" : "💾 Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SHIPMENT LIST ────────────────────────────────────────────────────────────
function ShipmentListScreen({ user, shipments, loading, customTemplates, onSelect, onNew, onNewTemplate, onEditTemplate, onLogout }) {
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("shipments"); // shipments | templates

  const allTemplates = [
    ...TEMPLATE_LIST,
    ...customTemplates.map(ct => ({ ...ct, id: ct.id, isCustom: true })),
  ];

  const filtered = filter === "all" ? shipments : shipments.filter(s => s.template_id === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueMid} 100%)`, padding: "52px 20px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Logo height={28} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: 0 }}>Signed in as</p>
                <p style={{ color: C.white, fontSize: 13, fontWeight: 700, margin: 0 }}>{user.name}</p>
              </div>
              <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12 }}>Sign out</button>
            </div>
          </div>

          {/* Main tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {[["shipments", "📦 Shipments"], ["templates", "📋 Templates"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", borderBottom: tab === key ? `3px solid ${C.orange}` : "3px solid transparent", color: tab === key ? C.white : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 16px" }}>

        {/* ── SHIPMENTS TAB ── */}
        {tab === "shipments" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: C.textDark, margin: 0 }}>Work Checklist</h2>
                <p style={{ fontSize: 12, color: C.textLight, margin: "3px 0 0" }}>Shared across team · Live sync</p>
              </div>
              <button onClick={onNew} style={{ background: C.orange, border: "none", borderRadius: 10, padding: "9px 16px", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,137,31,0.35)" }}>
                + New
              </button>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 14, paddingBottom: 2 }}>
              {["all", ...allTemplates.map(t => t.id)].map(tid => {
                const tmpl = allTemplates.find(t => t.id === tid);
                const active = filter === tid;
                return (
                  <button key={tid} onClick={() => setFilter(tid)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: active ? C.blue : C.white, color: active ? C.white : C.textMid, boxShadow: active ? "0 2px 8px rgba(27,58,107,0.2)" : "0 1px 3px rgba(0,0,0,0.07)", transition: "all 0.2s" }}>
                    {tid === "all" ? "All" : `${tmpl?.icon} ${tmpl?.label}`}
                  </button>
                );
              })}
            </div>

            {loading && <div style={{ textAlign: "center", padding: "60px 0", color: C.textLight }}><div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div><p>Loading…</p></div>}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.textLight }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>No shipments yet</p>
                <p style={{ fontSize: 13 }}>Tap "+ New" to create one</p>
              </div>
            )}
            {filtered.map(s => {
              const tmpl = TEMPLATES[s.template_id] || customTemplates.find(ct => ct.id === s.template_id) || { icon: "📋", label: s.template_id, color: C.blue, tasks: [] };
              const completed = s.completed || {};
              const done = tmpl.tasks.filter(t => completed[t.id]).length;
              const total = tmpl.tasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const isComplete = total > 0 && done === total;
              return (
                <div key={s.id} onClick={() => onSelect(s, tmpl)}
                  style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(27,58,107,0.07)", cursor: "pointer", border: isComplete ? "1.5px solid #86EFAC" : `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 13 }}>{tmpl.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: tmpl.color, background: `${tmpl.color}18`, padding: "2px 7px", borderRadius: 99 }}>{tmpl.label}</span>
                        {tmpl.isCustom && <span style={{ fontSize: 9, fontWeight: 700, color: C.orange, background: C.orangeLight, padding: "2px 6px", borderRadius: 99 }}>CUSTOM</span>}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.textDark, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</h3>
                      {s.crm_customer_name && <span style={{ fontSize: 10, fontWeight: 700, color: C.blueMid, background: "#EEF3FB", padding: "2px 7px", borderRadius: 99, display: "inline-block", marginTop: 3, marginBottom: 2 }}>🏢 {s.crm_customer_name}</span>}
                      <p style={{ fontSize: 11, color: C.textLight, margin: "3px 0 0" }}>
                        {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {s.last_updated_by && <span> · Last by <strong>{s.last_updated_by}</strong></span>}
                      </p>
                    </div>
                    {isComplete
                      ? <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, flexShrink: 0 }}>✓ Done</span>
                      : <span style={{ background: C.orangeLight, color: C.orange, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, flexShrink: 0 }}>{pct}%</span>}
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: isComplete ? "#22C55E" : `linear-gradient(90deg, ${tmpl.color || C.blue}, ${C.blueLight})`, transition: "width 0.4s ease" }} />
                  </div>
                  <p style={{ fontSize: 11, color: C.textLight, marginTop: 5 }}>{done} of {total} tasks completed</p>
                </div>
              );
            })}
          </>
        )}

        {/* ── TEMPLATES TAB ── */}
        {tab === "templates" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: C.textDark, margin: 0 }}>Checklist Templates</h2>
                <p style={{ fontSize: 12, color: C.textLight, margin: "3px 0 0" }}>Built-in + your custom templates</p>
              </div>
              <button onClick={onNewTemplate} style={{ background: C.orange, border: "none", borderRadius: 10, padding: "9px 14px", color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,137,31,0.35)" }}>
                + Create
              </button>
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: C.textLight, letterSpacing: 0.5, marginBottom: 10 }}>BUILT-IN</p>
            {TEMPLATE_LIST.map(tmpl => (
              <div key={tmpl.id} style={{ background: C.white, borderRadius: 12, padding: "13px 14px", marginBottom: 10, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${tmpl.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{tmpl.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: tmpl.color, margin: 0 }}>{tmpl.label}</p>
                  <p style={{ fontSize: 11, color: C.textLight, margin: "2px 0 0" }}>{tmpl.description} · {tmpl.tasks.length} tasks</p>
                </div>
              </div>
            ))}

            {customTemplates.length > 0 && (
              <>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.textLight, letterSpacing: 0.5, margin: "18px 0 10px" }}>CUSTOM</p>
                {customTemplates.map(tmpl => (
                  <div key={tmpl.id} style={{ background: C.white, borderRadius: 12, padding: "13px 14px", marginBottom: 10, border: `1.5px solid ${tmpl.color}40`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${tmpl.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{tmpl.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: tmpl.color, margin: 0 }}>{tmpl.label}</p>
                        <span style={{ fontSize: 9, fontWeight: 700, color: C.orange, background: C.orangeLight, padding: "2px 6px", borderRadius: 99 }}>CUSTOM</span>
                      </div>
                      <p style={{ fontSize: 11, color: C.textLight, margin: "2px 0 0" }}>{tmpl.description} · {tmpl.tasks.length} tasks · by {tmpl.created_by}</p>
                    </div>
                    <button onClick={() => onEditTemplate(tmpl)} style={{ background: "#EEF3FB", border: "none", borderRadius: 8, padding: "7px 12px", color: C.blueMid, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>✎ Edit</button>
                  </div>
                ))}
              </>
            )}

            {customTemplates.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.textLight, border: `1.5px dashed ${C.border}`, borderRadius: 14, marginTop: 8 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>No custom templates yet</p>
                <p style={{ fontSize: 12 }}>Tap "+ Create" to build your own</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── NEW SHIPMENT MODAL ───────────────────────────────────────────────────────
function NewShipmentModal({ onClose, onCreate, creating, customTemplates }) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [crmCustomers, setCRMCustomers] = useState([]);
  const [crmId, setCrmId] = useState("");
  const [crmName, setCrmName] = useState("");
  const [crmProduct, setCrmProduct] = useState("");
  const [loadingCRM, setLoadingCRM] = useState(true);

  useEffect(() => {
    fetchCRMCustomers().then(data => { setCRMCustomers(data); setLoadingCRM(false); });
  }, []);
  const allTemplates = [
    ...TEMPLATE_LIST,
    ...customTemplates.map(ct => ({ ...ct, id: ct.id, isCustom: true })),
  ];
  const ready = name.trim() && templateId;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.white, borderRadius: "20px 20px 0 0", padding: "20px 20px 44px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 99, margin: "0 auto 18px" }} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: C.textDark, marginBottom: 4 }}>New Shipment</h3>
        <p style={{ color: C.textLight, fontSize: 13, marginBottom: 18 }}>Choose a checklist type and give it a name</p>

        <label style={labelSt}>CHECKLIST TYPE</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {allTemplates.map(tmpl => {
            const sel = templateId === tmpl.id;
            return (
              <div key={tmpl.id} onClick={() => setTemplateId(tmpl.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: sel ? `2px solid ${tmpl.color}` : `1.5px solid ${C.border}`, background: sel ? `${tmpl.color}0A` : C.white, cursor: "pointer", transition: "all 0.15s" }}>
                <span style={{ fontSize: 22 }}>{tmpl.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: sel ? tmpl.color : C.textDark, margin: 0 }}>{tmpl.label}</p>
                    {tmpl.isCustom && <span style={{ fontSize: 9, fontWeight: 700, color: C.orange, background: C.orangeLight, padding: "2px 5px", borderRadius: 99 }}>CUSTOM</span>}
                  </div>
                  <p style={{ fontSize: 11, color: C.textLight, margin: "2px 0 0" }}>{tmpl.description} · {tmpl.tasks.length} tasks</p>
                </div>
                {sel && <div style={{ width: 18, height: 18, borderRadius: "50%", background: tmpl.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 3.5L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>}
              </div>
            );
          })}
        </div>

        <label style={labelSt}>LINK TO CRM CUSTOMER (optional)</label>
        <div style={{ marginBottom: 18 }}>
          {loadingCRM
            ? <p style={{ fontSize: 12, color: C.textLight }}>Loading CRM customers…</p>
            : <select value={crmId} onChange={e => {
                const c = crmCustomers.find(x => x.id === e.target.value);
                setCrmId(e.target.value);
                setCrmName(c?.company_name || "");
                setCrmProduct(c?.product_interest || "");
              }} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.textDark, background: C.white, boxSizing: "border-box" }}>
                <option value="">— No customer link —</option>
                {crmCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}{c.product_interest ? ` · ${c.product_interest}` : ""}</option>
                ))}
              </select>}
          {crmName && (
            <div style={{ marginTop: 8, background: "#EEF3FB", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.blueMid, fontWeight: 600 }}>
              🏢 {crmName}{crmProduct ? ` · ${crmProduct}` : ""}
            </div>
          )}
        </div>

        <label style={labelSt}>SHIPMENT NAME / REFERENCE</label>
        <input autoFocus placeholder="e.g. Vitabiotics May 2026 or PO-1045"
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ready && onCreate(name.trim(), templateId, crmId, crmName, crmProduct)}
          style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 15, outline: "none", marginBottom: 14, color: C.textDark, fontFamily: "inherit" }} />

        <button onClick={() => ready && onCreate(name.trim(), templateId, crmId, crmName, crmProduct)} disabled={!ready || creating}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: ready && !creating ? C.orange : C.border, color: ready && !creating ? C.white : C.textLight, fontSize: 15, fontWeight: 700, cursor: ready && !creating ? "pointer" : "default", boxShadow: ready ? "0 4px 14px rgba(245,137,31,0.3)" : "none" }}>
          {creating ? "Creating…" : "Create Shipment"}
        </button>
      </div>
    </div>
  );
}

// ─── CHECKLIST SCREEN ─────────────────────────────────────────────────────────
function ChecklistScreen({ shipment, tmpl, user, onUpdate, onBack }) {
  const [activePhase, setActivePhase] = useState("All");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(shipment.completed || {});

  useEffect(() => { setCompleted(shipment.completed || {}); }, [shipment.completed]);

  const toggle = async (id) => {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    setSaving(true);
    await onUpdate(shipment.id, updated);
    setSaving(false);
  };

  const totalDone = tmpl.tasks.filter(t => completed[t.id]).length;
  const total = tmpl.tasks.length;
  const progress = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  const filtered = tmpl.tasks.filter(t => {
    const phaseMatch = activePhase === "All" || t.phase === activePhase;
    const searchMatch = !search || t.task.toLowerCase().includes(search.toLowerCase());
    return phaseMatch && searchMatch;
  });

  const phaseProgress = (phase) => {
    const pts = tmpl.tasks.filter(t => t.phase === phase);
    return { done: pts.filter(t => completed[t.id]).length, total: pts.length };
  };

  const phases = tmpl.phases || [...new Set(tmpl.tasks.map(t => t.phase))];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 80 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueMid} 100%)`, padding: "52px 20px 18px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <button onClick={onBack} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 9, padding: "7px 12px", color: C.white, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13 }}>{tmpl.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>{tmpl.label}</span>
                {saving && <span style={{ color: C.orange, fontSize: 11, fontWeight: 600 }}>· Saving…</span>}
              </div>
              <h1 style={{ color: C.white, fontSize: 16, fontWeight: 800, margin: 0 }}>{shipment.name}</h1>
              {shipment.crm_customer_name && <span style={{ fontSize: 10, fontWeight: 700, color: C.orange, background: "rgba(255,255,255,0.12)", padding: "2px 8px", borderRadius: 99, marginTop: 3, display: "inline-block" }}>🏢 {shipment.crm_customer_name}</span>}
            </div>
            <Logo height={22} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>PROGRESS</span>
              <span style={{ color: C.orange, fontSize: 13, fontWeight: 700 }}>{totalDone}/{total} · {progress}%</span>
            </div>
            <div style={{ height: 7, background: "rgba(255,255,255,0.12)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.orange}, #FFB347)`, borderRadius: 99, transition: "width 0.5s ease" }} />
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.4 }}>🔍</span>
            <input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: C.white, fontSize: 14, padding: "8px 12px 8px 32px", outline: "none" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "13px 0 7px", scrollbarWidth: "none" }}>
          {["All", ...phases].map(ph => {
            const active = activePhase === ph;
            const pp = ph !== "All" ? phaseProgress(ph) : null;
            return (
              <button key={ph} onClick={() => setActivePhase(ph)} style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: active ? C.blue : C.white, color: active ? C.white : C.textMid, boxShadow: active ? "0 2px 8px rgba(27,58,107,0.25)" : "0 1px 3px rgba(0,0,0,0.07)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 4 }}>
                {ph === "All" ? "All Phases" : ph}
                {pp && <span style={{ background: pp.done === pp.total ? "#22C55E" : "rgba(0,0,0,0.08)", color: pp.done === pp.total ? C.white : C.textLight, borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{pp.done}/{pp.total}</span>}
              </button>
            );
          })}
        </div>

        {phases.filter(ph => activePhase === "All" || activePhase === ph).map(phase => {
          const phaseTasks = filtered.filter(t => t.phase === phase);
          if (!phaseTasks.length) return null;
          const colors = PHASE_COLORS[phase] || { accent: tmpl.color || C.blue, bg: `${tmpl.color || C.blue}10`, light: `${tmpl.color || C.blue}30` };
          const pp = phaseProgress(phase);
          const phaseDone = pp.done === pp.total && pp.total > 0;

          return (
            <div key={phase} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: colors.bg, borderRadius: "12px 12px 0 0", borderLeft: `4px solid ${colors.accent}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: colors.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>{phase}</span>
                <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  {phaseDone && <span style={{ fontSize: 10, fontWeight: 700, color: "#16A34A", background: "#DCFCE7", padding: "2px 7px", borderRadius: 99 }}>✓ Complete</span>}
                  <span style={{ fontSize: 11, fontWeight: 600, color: colors.accent, opacity: 0.7 }}>{pp.done}/{pp.total}</span>
                </div>
              </div>
              <div style={{ background: C.white, borderRadius: "0 0 12px 12px", border: `1px solid ${C.border}`, borderTop: "none", overflow: "hidden", boxShadow: "0 2px 8px rgba(27,58,107,0.05)" }}>
                {phaseTasks.map((t, idx) => {
                  const done = !!completed[t.id];
                  return (
                    <div key={t.id}>
                      <div onClick={() => toggle(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: idx === 0 ? "none" : `1px solid ${C.border}`, cursor: "pointer", background: done ? "#F8FFF9" : C.white, transition: "background 0.15s", userSelect: "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, border: done ? `2px solid ${colors.accent}` : `2px solid ${C.border}`, background: done ? colors.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                          {done && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: done ? colors.accent : C.border, minWidth: 18 }}>{t.id}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: done ? C.textLight : C.textDark, textDecoration: done ? "line-through" : "none", flex: 1, lineHeight: 1.4, transition: "all 0.2s" }}>{t.task}</span>
                      </div>
                      {t.note && (
                        <div style={{ padding: "7px 16px 9px 50px", background: colors.bg, borderTop: `1px dashed ${colors.light}`, fontSize: 11, color: colors.accent, lineHeight: 1.6 }}>
                          📎 {t.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]               = useState("loading");
  const [user, setUser]                   = useState(null);
  const [shipments, setShipments]         = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [activeShipment, setActive]       = useState(null);
  const [activeTmpl, setActiveTmpl]       = useState(null);
  const [authLoading, setAuthLoading]     = useState(false);
  const [authError, setAuthError]         = useState("");
  const [dataLoading, setDataLoading]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [showBuilder, setShowBuilder]     = useState(false);
  const [showEditor, setShowEditor]       = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [creating, setCreating]           = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session?.user) { setUser(session.user); setScreen("list"); }
    else setScreen("login");
  }, []);

  const fetchShipments = useCallback(async () => {
    setDataLoading(true);
    const [{ data: ships }, { data: ctmpls }] = await Promise.all([
      supabase.from("shipments").select("*").order("created_at", { ascending: false }),
      supabase.from("custom_templates").select("*").order("created_at", { ascending: false }),
    ]);
    setDataLoading(false);
    if (ships) setShipments(ships);
    if (ctmpls) setCustomTemplates(ctmpls);
  }, []);

  useEffect(() => {
    if (screen !== "list" && screen !== "checklist") return;
    fetchShipments();
    const channel = supabase.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, payload => {
        if (payload.eventType === "INSERT") setShipments(prev => [payload.new, ...prev]);
        else if (payload.eventType === "UPDATE") {
          setShipments(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
          setActive(prev => prev?.id === payload.new.id ? payload.new : prev);
        } else if (payload.eventType === "DELETE") setShipments(prev => prev.filter(s => s.id !== payload.old.id));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "custom_templates" }, payload => {
        setCustomTemplates(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [screen, fetchShipments]);

  const handleLogin = async (name, pin, isNew) => {
    setAuthLoading(true); setAuthError("");
    if (isNew) {
      const { data: existing } = await supabase.from("users").select("id").eq("name", name).single();
      if (existing) { setAuthError("Name already taken. Choose another."); setAuthLoading(false); return; }
      const { data, error } = await supabase.from("users").insert({ name, pin }).select().single();
      if (error || !data) { setAuthError("Could not create account. Try again."); setAuthLoading(false); return; }
      const u = { id: data.id, name: data.name };
      setUser(u); saveSession({ user: u }); setScreen("list");
    } else {
      const { data, error } = await supabase.from("users").select("*").eq("name", name).eq("pin", pin).single();
      if (error || !data) { setAuthError("Name or PIN is incorrect."); setAuthLoading(false); return; }
      const u = { id: data.id, name: data.name };
      setUser(u); saveSession({ user: u }); setScreen("list");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem(LOCAL_KEY); setUser(null); setScreen("login"); setShipments([]); };

  const handleCreate = async (name, templateId, crmId, crmName, crmProduct) => {
    setCreating(true);
    const { data, error } = await supabase.from("shipments").insert({
      name, template_id: templateId, completed: {},
      created_by: user.name, last_updated_by: user.name,
      crm_customer_id: crmId || null,
      crm_customer_name: crmName || null,
      crm_product: crmProduct || null,
    }).select().single();
    setCreating(false);
    if (!error && data) {
      const tmpl = TEMPLATES[templateId] || customTemplates.find(ct => ct.id === templateId);
      setShowNew(false); setActive(data); setActiveTmpl(tmpl); setScreen("checklist");
    }
  };

  const handleUpdate = async (shipmentId, completed) => {
    await supabase.from("shipments").update({ completed, last_updated_by: user.name }).eq("id", shipmentId);
  };

  const handleTemplateSaved = (newTmpl) => {
    setCustomTemplates(prev => [newTmpl, ...prev]);
    setShowBuilder(false);
  };

  const handleTemplateEdited = (updatedTmpl) => {
    setCustomTemplates(prev => prev.map(t => t.id === updatedTmpl.id ? updatedTmpl : t));
    setShowEditor(false);
    setEditingTemplate(null);
  };

  if (screen === "loading") return (
    <div style={{ minHeight: "100vh", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Logo height={48} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {screen === "login" && <LoginScreen onLogin={handleLogin} loading={authLoading} error={authError} />}
      {screen === "list" && (
        <ShipmentListScreen user={user} shipments={shipments} loading={dataLoading} customTemplates={customTemplates}
          onSelect={(s, tmpl) => { setActive(s); setActiveTmpl(tmpl); setScreen("checklist"); }}
          onNew={() => setShowNew(true)}
          onNewTemplate={() => setShowBuilder(true)}
          onEditTemplate={(tmpl) => { setEditingTemplate(tmpl); setShowEditor(true); }}
          onLogout={handleLogout}
        />
      )}
      {screen === "checklist" && activeShipment && activeTmpl && (
        <ChecklistScreen shipment={activeShipment} tmpl={activeTmpl} user={user} onUpdate={handleUpdate}
          onBack={() => { setScreen("list"); fetchShipments(); }} />
      )}
      {showNew && <NewShipmentModal onClose={() => setShowNew(false)} onCreate={handleCreate} creating={creating} customTemplates={customTemplates} />}
      {showBuilder && <TemplateBuilder user={user} onClose={() => setShowBuilder(false)} onSaved={handleTemplateSaved} />}
      {showEditor && editingTemplate && <TemplateEditor template={editingTemplate} user={user} onClose={() => { setShowEditor(false); setEditingTemplate(null); }} onSaved={handleTemplateEdited} />}
    </div>
  );
}
