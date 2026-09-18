import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { TEMPLATES } from './templates';

// ── CRM Supabase (read-only, for customer lookup) ──────────
const CRM_URL = 'https://fwjlhocedpzeijsshwjh.supabase.co';
const CRM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3amxob2NlZHB6ZWlqc3Nod2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjc1OTMsImV4cCI6MjEwMzc0MzU5M30.jBukjNnMccX6qxnX9f3FZbukcjGB_1zfWo0iQ3xO3Es';

async function fetchCRMCustomers() {
  const res = await fetch(`${CRM_URL}/rest/v1/customers?select=id,company_name,product_interest,status&order=company_name.asc&status=neq.lost`, {
    headers: { 'apikey': CRM_KEY, 'Authorization': `Bearer ${CRM_KEY}` }
  });
  if (!res.ok) return [];
  return res.json();
}

// ── Helpers ────────────────────────────────────────────────
function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

function getAllTasks(template, customTpl) {
  if (customTpl) return customTpl.tasks || [];
  if (template) return template.tasks || [];
  return [];
}

function getPhases(template, customTpl) {
  if (customTpl) return customTpl.phases || [];
  if (template) return template.phases || [...new Set((template.tasks || []).map(t => t.phase))];
  return [];
}

// ── Status color ───────────────────────────────────────────
function progressColor(pct) {
  if (pct === 100) return '#16a34a';
  if (pct >= 60) return '#7c3aed';
  if (pct >= 30) return '#d97706';
  return '#1E4FA0';
}

// ══════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('shipments');
  const [shipments, setShipments] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [activeShipment, setActiveShipment] = useState(null);
  const [activeCustomTpl, setActiveCustomTpl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // list | shipment | template-edit | new-shipment | new-template
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filterTemplate, setFilterTemplate] = useState('all');

  // Auth
  const [loginName, setLoginName] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // New shipment form
  const [newShipName, setNewShipName] = useState('');
  const [newShipTemplate, setNewShipTemplate] = useState('');
  const [newShipCRM, setNewShipCRM] = useState('');
  const [newShipCRMName, setNewShipCRMName] = useState('');
  const [newShipCRMProduct, setNewShipCRMProduct] = useState('');
  const [crmCustomers, setCRMCustomers] = useState([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('di_nexus_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) {
      loadShipments();
      loadCustomTemplates();
    }
  }, [user]);

  async function signIn() {
    setLoginError('');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('name', loginName.trim())
      .eq('pin', loginPin.trim())
      .single();
    if (error || !data) { setLoginError('Invalid name or PIN.'); return; }
    const u = { id: data.id, name: data.name };
    setUser(u);
    sessionStorage.setItem('di_nexus_user', JSON.stringify(u));
  }

  async function signOut() {
    setUser(null);
    sessionStorage.removeItem('di_nexus_user');
    setView('list');
    setActiveShipment(null);
  }

  async function loadShipments() {
    const { data } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
    setShipments(data || []);
  }

  async function loadCustomTemplates() {
    const { data } = await supabase.from('custom_templates').select('*').order('created_at', { ascending: false });
    setCustomTemplates(data || []);
  }

  // ── Open a shipment ──────────────────────────────────────
  async function openShipment(ship) {
    setLoading(true);
    setActiveShipment(ship);
    // Check if it's a custom template
    const customTpl = customTemplates.find(t => t.id === ship.template_id) || null;
    setActiveCustomTpl(customTpl);
    setView('shipment');
    setLoading(false);
  }

  // ── Toggle task ──────────────────────────────────────────
  async function toggleTask(taskId) {
    if (!activeShipment) return;
    const completed = { ...(activeShipment.completed || {}) };
    if (completed[taskId]) {
      delete completed[taskId];
    } else {
      completed[taskId] = { by: user.name, at: new Date().toISOString() };
    }
    const updated = { ...activeShipment, completed, last_updated_by: user.name };
    await supabase.from('shipments').update({ completed, last_updated_by: user.name }).eq('id', activeShipment.id);
    setActiveShipment(updated);
    setShipments(prev => prev.map(s => s.id === activeShipment.id ? updated : s));
  }

  // ── Create shipment ──────────────────────────────────────
  async function createShipment() {
    if (!newShipName.trim() || !newShipTemplate) return;
    const payload = {
      name: newShipName.trim(),
      template_id: newShipTemplate,
      created_by: user.name,
      last_updated_by: user.name,
      completed: {},
      crm_customer_id: newShipCRM || null,
      crm_customer_name: newShipCRMName || null,
      crm_product: newShipCRMProduct || null,
    };
    const { data } = await supabase.from('shipments').insert(payload).select().single();
    if (data) {
      setShipments(prev => [data, ...prev]);
      setNewShipName(''); setNewShipTemplate(''); setNewShipCRM('');
      setNewShipCRMName(''); setNewShipCRMProduct('');
      setView('list');
    }
  }

  // ── Delete shipment ──────────────────────────────────────
  async function deleteShipment(id) {
    if (!window.confirm('Delete this shipment?')) return;
    await supabase.from('shipments').delete().eq('id', id);
    setShipments(prev => prev.filter(s => s.id !== id));
    if (activeShipment?.id === id) { setView('list'); setActiveShipment(null); }
  }

  // ── Load CRM customers when opening new shipment form ───
  async function openNewShipment() {
    setView('new-shipment');
    const customers = await fetchCRMCustomers();
    setCRMCustomers(customers);
  }

  // ── Template editing ─────────────────────────────────────
  function openTemplateEdit(tpl) {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl))); // deep copy
    setView('template-edit');
  }

  function openNewTemplate() {
    setEditingTemplate({
      id: null,
      label: '',
      description: '',
      icon: '📦',
      color: '#1E4FA0',
      phases: ['Phase 1'],
      tasks: [{ id: 1, task: '', phase: 'Phase 1', note: '' }]
    });
    setView('template-edit');
  }

  async function saveTemplate() {
    const tpl = editingTemplate;
    if (!tpl.label.trim()) { alert('Template name required'); return; }
    // Clean up tasks - remove empty ones
    const tasks = tpl.tasks.filter(t => t.task.trim()).map((t, i) => ({ ...t, id: i + 1 }));
    const phases = [...new Set(tasks.map(t => t.phase))];
    const payload = { label: tpl.label, description: tpl.description, icon: tpl.icon, color: tpl.color, phases, tasks, created_by: user.name };

    if (tpl.id) {
      await supabase.from('custom_templates').update(payload).eq('id', tpl.id);
      setCustomTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, ...payload } : t));
    } else {
      const { data } = await supabase.from('custom_templates').insert(payload).select().single();
      if (data) setCustomTemplates(prev => [data, ...prev]);
    }
    setView('templates');
    setTab('templates');
  }

  async function deleteTemplate(id) {
    if (!window.confirm('Delete this template? Existing shipments using it will still work.')) return;
    await supabase.from('custom_templates').delete().eq('id', id);
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  }

  // ── Template editor helpers ──────────────────────────────
  function addTask(phase) {
    const maxId = Math.max(0, ...editingTemplate.tasks.map(t => t.id));
    setEditingTemplate(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: maxId + 1, task: '', phase, note: '' }]
    }));
  }

  function updateTask(idx, field, value) {
    setEditingTemplate(prev => {
      const tasks = [...prev.tasks];
      tasks[idx] = { ...tasks[idx], [field]: value };
      return { ...prev, tasks };
    });
  }

  function removeTask(idx) {
    setEditingTemplate(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== idx) }));
  }

  function addPhase() {
    const name = `Phase ${editingTemplate.phases.length + 1}`;
    setEditingTemplate(prev => ({ ...prev, phases: [...prev.phases, name] }));
  }

  function updatePhase(idx, value) {
    setEditingTemplate(prev => {
      const phases = [...prev.phases];
      const old = phases[idx];
      phases[idx] = value;
      // Update tasks that referenced the old phase name
      const tasks = prev.tasks.map(t => t.phase === old ? { ...t, phase: value } : t);
      return { ...prev, phases, tasks };
    });
  }

  function removePhase(idx) {
    setEditingTemplate(prev => {
      const phases = prev.phases.filter((_, i) => i !== idx);
      const removedPhase = prev.phases[idx];
      const tasks = prev.tasks.filter(t => t.phase !== removedPhase);
      return { ...prev, phases, tasks };
    });
  }

  // ── Computed ─────────────────────────────────────────────
  const allTemplateOptions = [
    ...TEMPLATES.map(t => ({ id: t.id, label: t.label, icon: t.icon })),
    ...customTemplates.map(t => ({ id: t.id, label: t.label, icon: t.icon }))
  ];

  const filteredShipments = filterTemplate === 'all'
    ? shipments
    : shipments.filter(s => s.template_id === filterTemplate);

  const templateCategories = [...new Set(shipments.map(s => s.template_id))];

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════

  if (!user) return <LoginScreen
    name={loginName} setName={setLoginName}
    pin={loginPin} setPin={setLoginPin}
    error={loginError} onLogin={signIn}
  />;

  if (view === 'shipment' && activeShipment) {
    const template = getTemplate(activeShipment.template_id);
    const customTpl = activeCustomTpl || customTemplates.find(t => t.id === activeShipment.template_id);
    const tasks = getAllTasks(template, customTpl);
    const phases = getPhases(template, customTpl);
    const completed = activeShipment.completed || {};
    const pct = tasks.length ? Math.round((Object.keys(completed).length / tasks.length) * 100) : 0;
    const tplName = customTpl?.label || template?.label || activeShipment.template_id;

    return (
      <div style={styles.app}>
        <Header user={user} onSignOut={signOut} />
        <div style={styles.container}>
          <button onClick={() => { setView('list'); setActiveShipment(null); }} style={styles.backBtn}>← Back</button>

          <div style={styles.shipmentHeader}>
            <div>
              <div style={styles.shipmentLabel}>{customTpl?.icon || template?.icon || '📦'} {tplName}</div>
              <h1 style={styles.shipmentTitle}>{activeShipment.name}</h1>
              {activeShipment.crm_customer_name && (
                <div style={styles.crmBadge}>🏢 {activeShipment.crm_customer_name}{activeShipment.crm_product ? ` · ${activeShipment.crm_product}` : ''}</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...styles.pctBadge, background: progressColor(pct) }}>{pct}%</div>
              <div style={styles.shipMeta}>{Object.keys(completed).length} of {tasks.length} done</div>
              {pct === 100 && <div style={styles.doneBadge}>✓ Complete</div>}
            </div>
          </div>

          <ProgressBar pct={pct} color={progressColor(pct)} />

          {phases.map(phase => {
            const phaseTasks = tasks.filter(t => t.phase === phase);
            const phaseDone = phaseTasks.filter(t => completed[t.id]).length;
            return (
              <div key={phase} style={styles.phaseBlock}>
                <div style={styles.phaseHeader}>
                  <span style={styles.phaseTitle}>{phase}</span>
                  <span style={styles.phaseCount}>{phaseDone}/{phaseTasks.length}</span>
                </div>
                {phaseTasks.map(task => (
                  <div key={task.id}
                    onClick={() => toggleTask(task.id)}
                    style={{ ...styles.taskRow, ...(completed[task.id] ? styles.taskDone : {}) }}>
                    <div style={{ ...styles.checkbox, ...(completed[task.id] ? styles.checkboxDone : {}) }}>
                      {completed[task.id] && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...styles.taskLabel, ...(completed[task.id] ? styles.taskLabelDone : {}) }}>{task.task}</div>
                      {task.note && <div style={styles.taskNote}>📎 {task.note}</div>}
                      {completed[task.id] && (
                        <div style={styles.completedBy}>✓ by {completed[task.id].by} · {new Date(completed[task.id].at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  if (view === 'template-edit' && editingTemplate) {
    return (
      <div style={styles.app}>
        <Header user={user} onSignOut={signOut} />
        <div style={styles.container}>
          <button onClick={() => setView('templates')} style={styles.backBtn}>← Back to Templates</button>
          <h1 style={{ ...styles.pageTitle, marginBottom: 20 }}>{editingTemplate.id ? 'Edit Template' : 'New Template'}</h1>

          {/* Template meta */}
          <div style={styles.card}>
            <div style={styles.sectionLabel}>Template Details</div>
            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Template Name *</label>
                <input style={styles.input} value={editingTemplate.label}
                  onChange={e => setEditingTemplate(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Synercore Export Shipment" />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Description</label>
                <input style={styles.input} value={editingTemplate.description}
                  onChange={e => setEditingTemplate(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description" />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Icon (emoji)</label>
                <input style={{ ...styles.input, width: 80 }} value={editingTemplate.icon}
                  onChange={e => setEditingTemplate(p => ({ ...p, icon: e.target.value }))} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Color</label>
                <input type="color" value={editingTemplate.color}
                  onChange={e => setEditingTemplate(p => ({ ...p, color: e.target.value }))}
                  style={{ height: 40, width: 80, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
              </div>
            </div>
          </div>

          {/* Phases & Tasks */}
          {editingTemplate.phases.map((phase, pi) => (
            <div key={pi} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <input
                  value={phase}
                  onChange={e => updatePhase(pi, e.target.value)}
                  style={{ ...styles.input, flex: 1, fontWeight: 700, fontSize: 14 }}
                  placeholder="Phase name" />
                <button onClick={() => removePhase(pi)}
                  style={styles.dangerBtn} title="Remove phase">✕ Remove Phase</button>
              </div>

              {editingTemplate.tasks.filter(t => t.phase === phase).map((task, _) => {
                const idx = editingTemplate.tasks.indexOf(task);
                return (
                  <div key={task.id} style={styles.taskEditRow}>
                    <div style={{ flex: 1 }}>
                      <input
                        value={task.task}
                        onChange={e => updateTask(idx, 'task', e.target.value)}
                        style={{ ...styles.input, marginBottom: 6 }}
                        placeholder="Task description" />
                      <input
                        value={task.note || ''}
                        onChange={e => updateTask(idx, 'note', e.target.value)}
                        style={{ ...styles.input, fontSize: 12, color: '#6b7280' }}
                        placeholder="Note / sub-items (optional)" />
                    </div>
                    <button onClick={() => removeTask(idx)} style={styles.removeTaskBtn}>✕</button>
                  </div>
                );
              })}

              <button onClick={() => addTask(phase)} style={styles.addTaskBtn}>+ Add Task</button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={addPhase} style={styles.secondaryBtn}>+ Add Phase</button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
            <button onClick={saveTemplate} style={styles.primaryBtn}>💾 Save Template</button>
            <button onClick={() => setView('templates')} style={styles.ghostBtn}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'new-shipment') {
    return (
      <div style={styles.app}>
        <Header user={user} onSignOut={signOut} />
        <div style={styles.container}>
          <button onClick={() => setView('list')} style={styles.backBtn}>← Back</button>
          <h1 style={{ ...styles.pageTitle, marginBottom: 24 }}>New Shipment</h1>

          <div style={styles.card}>
            <div style={styles.sectionLabel}>Shipment Details</div>
            <div style={styles.formField}>
              <label style={styles.label}>Shipment Name *</label>
              <input style={styles.input} value={newShipName}
                onChange={e => setNewShipName(e.target.value)}
                placeholder="e.g. Vitabiotics Beta Carotene 750kg" />
            </div>
            <div style={{ ...styles.formField, marginTop: 12 }}>
              <label style={styles.label}>Template *</label>
              <select style={styles.input} value={newShipTemplate}
                onChange={e => setNewShipTemplate(e.target.value)}>
                <option value="">— Select template —</option>
                <optgroup label="Built-in Templates">
                  {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                </optgroup>
                {customTemplates.length > 0 && (
                  <optgroup label="Custom Templates">
                    {customTemplates.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionLabel}>🏢 Link to CRM Customer (optional)</div>
            <div style={styles.formField}>
              <label style={styles.label}>Customer</label>
              <select style={styles.input} value={newShipCRM}
                onChange={e => {
                  const cust = crmCustomers.find(c => c.id === e.target.value);
                  setNewShipCRM(e.target.value);
                  setNewShipCRMName(cust?.company_name || '');
                  setNewShipCRMProduct(cust?.product_interest || '');
                }}>
                <option value="">— Select CRM customer —</option>
                {crmCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}{c.product_interest ? ` — ${c.product_interest}` : ''}</option>
                ))}
              </select>
              {crmCustomers.length === 0 && (
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Loading CRM customers...</div>
              )}
            </div>
            {newShipCRMName && (
              <div style={styles.crmPreview}>
                🏢 <strong>{newShipCRMName}</strong>{newShipCRMProduct ? ` · ${newShipCRMProduct}` : ''}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
            <button onClick={createShipment}
              disabled={!newShipName.trim() || !newShipTemplate}
              style={{ ...styles.primaryBtn, opacity: (!newShipName.trim() || !newShipTemplate) ? 0.5 : 1 }}>
              Create Shipment →
            </button>
            <button onClick={() => setView('list')} style={styles.ghostBtn}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN LIST VIEW ───────────────────────────────────────
  return (
    <div style={styles.app}>
      <Header user={user} onSignOut={signOut} />

      <div style={styles.tabBar}>
        <button onClick={() => { setTab('shipments'); setView('list'); }}
          style={{ ...styles.tab, ...(tab === 'shipments' ? styles.tabActive : {}) }}>
          📦 Shipments
        </button>
        <button onClick={() => { setTab('templates'); setView('templates'); }}
          style={{ ...styles.tab, ...(tab === 'templates' ? styles.tabActive : {}) }}>
          📋 Templates
        </button>
      </div>

      <div style={styles.container}>
        {tab === 'shipments' && (
          <>
            <div style={styles.listHeader}>
              <div>
                <h1 style={styles.pageTitle}>Work Checklist</h1>
                <div style={styles.pageSubtitle}>Shared across team · Live sync</div>
              </div>
              <button onClick={openNewShipment} style={styles.primaryBtn}>+ New</button>
            </div>

            {/* Filter pills */}
            {templateCategories.length > 1 && (
              <div style={styles.filterBar}>
                <button onClick={() => setFilterTemplate('all')}
                  style={{ ...styles.pill, ...(filterTemplate === 'all' ? styles.pillActive : {}) }}>All</button>
                {templateCategories.map(tid => {
                  const tpl = TEMPLATES.find(t => t.id === tid) || customTemplates.find(t => t.id === tid);
                  return (
                    <button key={tid} onClick={() => setFilterTemplate(tid)}
                      style={{ ...styles.pill, ...(filterTemplate === tid ? styles.pillActive : {}) }}>
                      {tpl?.icon} {tpl?.label || tid}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredShipments.map(ship => {
              const tpl = TEMPLATES.find(t => t.id === ship.template_id) || customTemplates.find(t => t.id === ship.template_id);
              const tasks = getAllTasks(tpl, customTemplates.find(t => t.id === ship.template_id));
              const doneCount = Object.keys(ship.completed || {}).length;
              const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
              const isDone = pct === 100;

              return (
                <div key={ship.id} onClick={() => openShipment(ship)}
                  style={{ ...styles.shipCard, ...(isDone ? styles.shipCardDone : {}) }}>
                  <div style={styles.shipCardTop}>
                    <div>
                      <div style={{ ...styles.shipCardTemplate, color: tpl?.color || '#1E4FA0' }}>
                        {tpl?.icon} {tpl?.label || ship.template_id}
                      </div>
                      <div style={styles.shipCardName}>{ship.name}</div>
                      {ship.crm_customer_name && (
                        <div style={styles.shipCRMTag}>🏢 {ship.crm_customer_name}</div>
                      )}
                      <div style={styles.shipMeta}>
                        {new Date(ship.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {ship.last_updated_by ? ` · Last by ${ship.last_updated_by}` : ''}
                      </div>
                    </div>
                    {isDone
                      ? <div style={styles.doneBadge}>✓ Done</div>
                      : <div style={{ ...styles.pctBadge, background: progressColor(pct) }}>{pct}%</div>}
                  </div>
                  <ProgressBar pct={pct} color={progressColor(pct)} />
                  <div style={styles.shipProgress}>{doneCount} of {tasks.length} tasks completed</div>
                  <button onClick={e => { e.stopPropagation(); deleteShipment(ship.id); }}
                    style={styles.deleteBtn} title="Delete shipment">✕</button>
                </div>
              );
            })}

            {filteredShipments.length === 0 && (
              <div style={styles.empty}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📦</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No shipments yet</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Click "+ New" to create your first shipment.</div>
              </div>
            )}
          </>
        )}

        {tab === 'templates' && (
          <>
            <div style={styles.listHeader}>
              <div>
                <h1 style={styles.pageTitle}>Templates</h1>
                <div style={styles.pageSubtitle}>Built-in and custom checklists</div>
              </div>
              <button onClick={openNewTemplate} style={styles.primaryBtn}>+ New Template</button>
            </div>

            <div style={styles.sectionLabel}>Built-in Templates</div>
            {TEMPLATES.map(t => (
              <div key={t.id} style={styles.tplCard}>
                <div style={{ ...styles.tplIcon, background: t.color + '22', fontSize: 22 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: t.color }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{t.description} · {t.tasks?.length || 0} tasks</div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '3px 8px', borderRadius: 6 }}>Built-in</div>
              </div>
            ))}

            {customTemplates.length > 0 && (
              <>
                <div style={{ ...styles.sectionLabel, marginTop: 24 }}>Custom Templates</div>
                {customTemplates.map(t => (
                  <div key={t.id} style={styles.tplCard}>
                    <div style={{ ...styles.tplIcon, background: (t.color || '#1E4FA0') + '22', fontSize: 22 }}>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: t.color || '#1E4FA0' }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{t.description} · {t.tasks?.length || 0} tasks</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Created by {t.created_by}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openTemplateEdit(t)} style={styles.editBtn}>✎ Edit</button>
                      <button onClick={() => deleteTemplate(t.id)} style={styles.dangerBtn}>✕</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {customTemplates.length === 0 && (
              <div style={styles.empty}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>No custom templates yet. Click "+ New Template" to create one.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────
function Header({ user, onSignOut }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerBrand}>
        <img src="/logo.png" alt="Delta Iris" style={{ height: 32, marginRight: 10 }} onError={e => e.target.style.display='none'} />
        <span style={styles.headerTitle}>Delta Iris</span>
      </div>
      <div style={styles.headerUser}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginRight: 6 }}>Signed in as</span>
        <span style={{ fontWeight: 700, color: 'white', marginRight: 12 }}>{user.name}</span>
        <button onClick={onSignOut} style={styles.signOutBtn}>Sign out</button>
      </div>
    </header>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={styles.progressTrack}>
      <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
    </div>
  );
}

function LoginScreen({ name, setName, pin, setPin, error, onLogin }) {
  return (
    <div style={styles.loginBg}>
      <div style={styles.loginLogo}>
        <img src="/logo.png" alt="Delta Iris" style={{ height: 60 }} onError={e => e.target.style.display='none'} />
        <div style={{ fontWeight: 800, fontSize: 22, color: '#1E4FA0', marginTop: 8 }}>Delta Iris</div>
      </div>
      <div style={styles.loginCard}>
        <h2 style={styles.loginTitle}>Welcome Back</h2>
        <p style={styles.loginSub}>DI Nexus. One platform. One team. One workflow.</p>
        {error && <div style={styles.loginError}>{error}</div>}
        <label style={styles.loginLabel}>YOUR NAME</label>
        <input style={styles.loginInput} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nithin" />
        <label style={{ ...styles.loginLabel, marginTop: 16 }}>4-DIGIT PIN</label>
        <input style={styles.loginInput} type="password" maxLength={4} value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onLogin()} placeholder="••••" />
        <button onClick={onLogin} style={styles.loginBtn}>Sign In →</button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          New user? Contact your admin.
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = {
  app: { minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif" },
  header: { background: 'linear-gradient(135deg, #1E4FA0, #163d82)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  headerBrand: { display: 'flex', alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: 800, fontSize: 18 },
  headerUser: { display: 'flex', alignItems: 'center' },
  signOutBtn: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  tabBar: { background: 'linear-gradient(135deg, #1E4FA0, #163d82)', display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderBottom: '3px solid transparent', fontFamily: 'inherit' },
  tabActive: { color: 'white', borderBottom: '3px solid #F58220' },
  container: { maxWidth: 720, margin: '0 auto', padding: '24px 16px' },
  listHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 },
  pageSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  backBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '0 0 16px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 },
  filterBar: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  pill: { border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'white', color: '#374151', fontFamily: 'inherit' },
  pillActive: { background: '#1E4FA0', borderColor: '#1E4FA0', color: 'white' },
  shipCard: { background: 'white', borderRadius: 12, padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1.5px solid #e5e7eb', cursor: 'pointer', position: 'relative', transition: 'box-shadow 0.15s' },
  shipCardDone: { borderColor: '#16a34a', background: '#f0fdf4' },
  shipCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  shipCardTemplate: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  shipCardName: { fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 },
  shipCRMTag: { fontSize: 11, color: '#1E4FA0', fontWeight: 600, background: '#e8eef8', display: 'inline-block', padding: '2px 8px', borderRadius: 8, marginBottom: 4 },
  shipMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  pctBadge: { color: 'white', fontWeight: 800, fontSize: 13, padding: '4px 10px', borderRadius: 20 },
  doneBadge: { background: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 20 },
  progressTrack: { background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden', margin: '8px 0' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease' },
  shipProgress: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  deleteBtn: { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#d1d5db', fontSize: 14, cursor: 'pointer', padding: 4, borderRadius: 4 },
  tplCard: { background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' },
  tplIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  card: { background: 'white', borderRadius: 12, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#1E4FA0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formField: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#374151' },
  input: { border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', outline: 'none' },
  primaryBtn: { background: '#1E4FA0', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  secondaryBtn: { background: '#e8eef8', color: '#1E4FA0', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  ghostBtn: { background: 'none', border: '1.5px solid #e5e7eb', color: '#6b7280', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  editBtn: { background: '#e8eef8', color: '#1E4FA0', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  dangerBtn: { background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  taskEditRow: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' },
  removeTaskBtn: { background: 'none', border: 'none', color: '#dc2626', fontSize: 16, cursor: 'pointer', padding: '8px 4px', flexShrink: 0 },
  addTaskBtn: { background: '#f0f4fc', color: '#1E4FA0', border: '1.5px dashed #1E4FA0', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'inherit', marginTop: 6 },
  phaseBlock: { background: 'white', borderRadius: 12, marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' },
  phaseHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
  phaseTitle: { fontWeight: 700, fontSize: 13, color: '#1E4FA0' },
  phaseCount: { fontSize: 12, color: '#6b7280', fontWeight: 500 },
  taskRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' },
  taskDone: { background: '#f0fdf4' },
  taskLabel: { fontSize: 13, fontWeight: 500, color: '#111827' },
  taskLabelDone: { color: '#9ca3af', textDecoration: 'line-through' },
  taskNote: { fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 1.4 },
  completedBy: { fontSize: 11, color: '#16a34a', marginTop: 4, fontWeight: 500 },
  checkbox: { width: 20, height: 20, border: '2px solid #d1d5db', borderRadius: 5, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  checkboxDone: { background: '#16a34a', borderColor: '#16a34a' },
  checkmark: { color: 'white', fontSize: 12, fontWeight: 800 },
  shipmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  shipmentLabel: { fontSize: 13, fontWeight: 700, color: '#1E4FA0', marginBottom: 4 },
  shipmentTitle: { fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 },
  shipMeta: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  crmBadge: { fontSize: 12, color: '#1E4FA0', fontWeight: 600, background: '#e8eef8', display: 'inline-block', padding: '4px 10px', borderRadius: 8, marginTop: 6 },
  crmPreview: { marginTop: 10, background: '#e8eef8', border: '1px solid #c7d9f5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1E4FA0' },
  empty: { textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' },
  loginBg: { minHeight: '100vh', background: 'linear-gradient(135deg, #1E4FA0 0%, #0f2d60 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 },
  loginLogo: { textAlign: 'center', marginBottom: 24 },
  loginCard: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 380, border: '1px solid rgba(255,255,255,0.2)' },
  loginTitle: { color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 6px', textAlign: 'center' },
  loginSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  loginError: { background: 'rgba(220,38,38,0.2)', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  loginLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', display: 'block', marginBottom: 6 },
  loginInput: { width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: 4 },
  loginBtn: { width: '100%', background: '#F58220', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20, fontFamily: 'inherit' },
};
