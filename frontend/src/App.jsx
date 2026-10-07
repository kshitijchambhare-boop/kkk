import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Beaker,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  FlaskConical,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Plus,
  Search,
  Sprout,
  UserRound,
  Wheat,
  X,
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '')
const today = new Date().toISOString().slice(0, 10)
const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

async function request(path, { token, method = 'GET', body } = {}) {
  if (!API_URL) throw new Error('This deployment is not connected to an API yet. Set the VITE_API_URL Actions variable and redeploy.')
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`)
  return payload
}

const navigation = [
  { id: 'overview', label: 'Overview', icon: Activity, group: 'WORKSPACE' },
  { id: 'tests', label: 'Soil tests', icon: FlaskConical },
  { id: 'crops', label: 'Crop guide', icon: Wheat, group: 'FIELD LIBRARY' },
  { id: 'fertilizers', label: 'Nutrients', icon: Leaf },
  { id: 'reports', label: 'Reports', icon: FileText },
]

const nutrientNames = {
  pH: 'Soil pH',
  nitrogen: 'Nitrogen',
  phosphorus: 'Phosphorus',
  potassium: 'Potassium',
  organicCarbon: 'Organic carbon',
  moisture: 'Moisture',
}

function prettyDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? 'Not recorded' : date.toLocaleDateString('en-IN', options)
}

function initials(name = 'Farmer') {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await request('/auth/register', {
          method: 'POST',
          body: { name: form.name, email: form.email, password: form.password, location: form.location },
        })
      }
      const result = await request('/auth/login', {
        method: 'POST',
        body: { email: form.email, password: form.password },
      })
      onAuthenticated({ token: result.token, user: result.user })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><span className="brand-mark"><Sprout size={19} /></span> soilcare</div>
        <div className="auth-copy">
          <p className="eyebrow light-eyebrow">BETTER SOIL, BETTER SEASONS</p>
          <h1>Know your soil.<br /><em>Grow with clarity.</em></h1>
          <p>One thoughtful place for your soil records, field notes, and next-season decisions.</p>
        </div>
        <img className="auth-photo" src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1300&q=85" alt="Rows of cultivated farmland beneath a bright sky" />
        <div className="photo-caption"><span className="caption-dot" /> FIELD NOTES, MADE USEFUL</div>
        <div className="auth-foot"><span>SOIL HEALTH, IN SEASON</span><span>01 / 04</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><span className="brand-mark"><Sprout size={18} /></span> soilcare</div>
        <div className="auth-form-wrap">
          <p className="eyebrow">YOUR FIELD WORKSPACE</p>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-subtitle">{mode === 'login' ? 'Sign in to pick up where your field left off.' : 'Start keeping a clearer record of your soil.'}</p>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && <label className="field-label">Full name<div className="input-wrap"><UserRound size={17} /><input name="name" autoComplete="name" placeholder="Your name" value={form.name} onChange={update} required /></div></label>}
            <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></div></label>
            {mode === 'register' && <label className="field-label">Farm location <span className="optional">OPTIONAL</span><div className="input-wrap"><MapPin size={17} /><input name="location" placeholder="Village or district" value={form.location} onChange={update} /></div></label>}
            <label className="field-label">Password<div className="input-wrap"><LockKeyhole size={17} /><input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" minLength={6} value={form.password} onChange={update} required /></div></label>
            {error && <div className="form-error" role="alert"><CircleAlert size={16} />{error}</div>}
            <button className="button button-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={18} /> : mode === 'login' ? 'Sign in' : 'Create account'}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>
          <p className="auth-switch">{mode === 'login' ? 'New to Soilcare?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login') }}>{mode === 'login' ? 'Create an account' : 'Sign in instead'}</button>
          </p>
          <div className="auth-note"><span className="note-rule" />Private to your farm. Your records stay yours.</div>
        </div>
        <div className="auth-panel-footer">SOILCARE <span>·</span> FIELD MANAGEMENT</div>
      </section>
    </main>
  )
}

function Sidebar({ active, onNavigate, onLogout, user, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <button type="button" className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><span className="brand-mark"><Sprout size={19} /></span><span>soilcare<span className="brand-period">.</span></span><button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="workspace-switch"><span className="workspace-icon"><Leaf size={15} /></span><span><b>My farm</b><small>PERSONAL WORKSPACE</small></span><ChevronRight size={15} /></div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item, index) => {
            const Icon = item.icon
            return <div key={item.id}>
              {item.group && <p className={`nav-group ${index ? 'nav-group-spaced' : ''}`}>{item.group}</p>}
              <button className={`nav-link ${active === item.id ? 'nav-link-active' : ''}`} onClick={() => { onNavigate(item.id); onClose() }}>
                <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.id === 'tests' && <span className="nav-count">{user.testCount}</span>}
              </button>
            </div>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="season-card"><div className="season-top"><span className="season-icon"><Wheat size={16} /></span><span className="season-label">SEASONAL NOTE</span></div><p>Small observations today make better decisions tomorrow.</p><span className="season-date"><Clock3 size={13} /> {currentMonth}</span></div>
          <button className="profile-row" onClick={onLogout} title="Sign out"><span className="avatar">{initials(user.name)}</span><span className="profile-name"><b>{user.name}</b><small>{user.role === 'admin' ? 'Administrator' : 'Farm account'}</small></span><LogOut size={17} /></button>
        </div>
      </aside>
    </>
  )
}

function Topbar({ user, onNewTest, onMenu, notice }) {
  return <header className="topbar">
    <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
    <div className="breadcrumb"><span>Soilcare</span><ChevronRight size={14} /><b>Field workspace</b></div>
    <div className="topbar-right"><span className="today-label"><span className="live-dot" /> FIELD LOG ACTIVE</span><button className="button button-primary top-new-test" onClick={onNewTest}><Plus size={17} /> New soil test</button><span className="top-avatar" title={user.name}>{initials(user.name)}</span></div>
    {notice && <div className={`toast toast-${notice.type}`} role="status">{notice.type === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}{notice.message}</div>}
  </header>
}

function SectionHeading({ eyebrow, title, description, action }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="section-description">{description}</p>}</div>{action}</div>
}

function StatusPill({ value }) {
  const text = value || 'Not rated'
  const tone = /excellent|good|adequate|neutral/i.test(text) ? 'good' : /moderate|medium/i.test(text) ? 'moderate' : /not rated/i.test(text) ? 'neutral' : 'alert'
  return <span className={`status-pill status-${tone}`}><span />{text}</span>
}

function StatTile({ label, value, detail, icon: Icon, tone }) {
  return <article className="stat-tile"><div className={`stat-icon stat-icon-${tone}`}><Icon size={19} strokeWidth={1.8} /></div><p className="stat-label">{label}</p><div className="stat-value-row"><strong>{value}</strong><span className="stat-detail">{detail}</span></div></article>
}

function NutrientBars({ latest }) {
  if (!latest?.nutrientStatus) return <div className="empty-inline"><span className="empty-seed"><Beaker size={17} /></span><p>Your nutrient profile will appear after your first soil test.</p></div>
  const statuses = latest.nutrientStatus
  return <div className="nutrient-list">{['nitrogen', 'phosphorus', 'potassium', 'organicCarbon', 'moisture'].map((key) => {
    const value = statuses[key] || 'Unknown'
    const width = /adequate|high/i.test(value) ? '82%' : /medium/i.test(value) ? '58%' : '30%'
    const tone = /low/i.test(value) ? 'bar-low' : /high|adequate/i.test(value) ? 'bar-good' : 'bar-mid'
    return <div className="nutrient-row" key={key}><div className="nutrient-title"><span>{nutrientNames[key]}</span><span>{value}</span></div><div className="nutrient-track"><span className={tone} style={{ width }} /></div></div>
  })}</div>
}

function RecentTests({ tests, onSelect, onShowAll }) {
  return <section className="content-section recent-section">
    <div className="section-bar"><div><p className="eyebrow">FIELD RECORDS</p><h2>Recent soil tests</h2></div><button className="text-action" onClick={onShowAll}>View all <ArrowUpRight size={15} /></button></div>
    {tests.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>FIELD / CROP</th><th>TEST DATE</th><th>SOIL HEALTH</th><th>SCORE</th><th /></tr></thead><tbody>{tests.slice(0, 4).map((test) => <tr key={test._id} onClick={() => onSelect(test)}><td><span className="field-cell"><span className="field-dot"><Sprout size={14} /></span><span><b>{test.crop || 'Unspecified crop'}</b><small>{[test.village, test.soilType].filter(Boolean).join(' · ') || 'Field record'}</small></span></span></td><td>{prettyDate(test.testDate)}</td><td><StatusPill value={test.fertilityLevel} /></td><td><b className="score-cell">{test.healthScore ?? '—'}<small>/100</small></b></td><td><ChevronRight size={17} className="row-chevron" /></td></tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-illustration"><FlaskConical size={24} /></span><div><h3>Your first field reading starts here</h3><p>Record a soil test to see health scores and crop recommendations.</p></div><button className="button button-outline" onClick={onShowAll}><Plus size={16} /> Add a test</button></div>}
  </section>
}

function Overview({ user, stats, tests, onNewTest, onSelect, onShowAll }) {
  const latest = tests[0]
  const score = latest?.healthScore || 0
  return <>
    <section className="welcome-band">
      <div className="welcome-copy"><p className="eyebrow light-eyebrow">YOUR FARM, AT A GLANCE <span className="welcome-line" /></p><h1>Good day, {user.name.split(' ')[0]}.</h1><p>Healthy ground begins with knowing what is happening beneath it.</p><button className="button button-lime" onClick={onNewTest}><Plus size={17} /> Record a soil test</button></div>
      <div className="welcome-image-wrap"><img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85" alt="Cultivated green fields stretching across a rural landscape" /><span className="image-stamp"><Sprout size={14} /> GROW WITH KNOWLEDGE</span><span className="image-index">FIELD NOTE · 01</span></div>
      <span className="welcome-orbit orbit-one" /><span className="welcome-orbit orbit-two" />
    </section>
    <div className="stats-grid">
      <StatTile label="Total soil tests" value={stats?.totalTests ?? 0} detail="field records" icon={FlaskConical} tone="green" />
      <StatTile label="Healthy samples" value={stats?.healthy ?? 0} detail="good / excellent" icon={Leaf} tone="lime" />
      <StatTile label="Need attention" value={stats?.deficient ?? 0} detail="soil profiles" icon={Activity} tone="coral" />
      <StatTile label="Reports saved" value={stats?.reports ?? 0} detail="ready to review" icon={FileText} tone="blue" />
    </div>
    <div className="overview-grid">
      <section className="panel health-panel"><div className="section-bar panel-heading"><div><p className="eyebrow">LATEST READING</p><h2>Soil vitality</h2></div><span className="date-chip"><Clock3 size={13} />{latest ? prettyDate(latest.testDate) : 'Awaiting first test'}</span></div>
        {latest ? <div className="health-content"><div className="health-score"><div className="score-ring" style={{ '--score': `${score * 3.6}deg` }}><div><strong>{score}</strong><span>OUT OF 100</span></div></div><div><StatusPill value={latest.fertilityLevel} /><p>{latest.crop || 'Field profile'}{latest.soilType ? ` · ${latest.soilType} soil` : ''}</p></div></div><div className="panel-divider" /><NutrientBars latest={latest} /></div> : <div className="empty-health"><span className="empty-illustration"><Activity size={24} /></span><h3>No readings yet</h3><p>Your soil vitality summary will appear here after a test.</p><button className="text-action" onClick={onNewTest}>Start a test <ArrowRight size={15} /></button></div>}
      </section>
      <section className="panel insight-panel"><div className="section-bar panel-heading"><div><p className="eyebrow">FIELD INSIGHT</p><h2>{latest?.deficiencies?.length ? 'A little attention goes a long way' : 'Your field, understood'}</h2></div><span className="insight-leaf"><Leaf size={17} /></span></div>
        {latest ? <><p className="insight-copy">{latest.recommendations?.[0] || 'Your latest soil reading is in. Keep tracking the field through the season to spot changes early.'}</p><div className="insight-tags">{(latest.deficiencies?.length ? latest.deficiencies : ['Profile recorded']).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><button className="text-action" onClick={() => onSelect(latest)}>See full reading <ArrowRight size={15} /></button></> : <><p className="insight-copy">Keep your soil history together and let each reading guide the next decision.</p><div className="insight-check"><span><Check size={14} /></span>Track nutrient levels over time</div><div className="insight-check"><span><Check size={14} /></span>Compare crops to field conditions</div><button className="text-action" onClick={onNewTest}>Add your first reading <ArrowRight size={15} /></button></>}
      </section>
    </div>
    <RecentTests tests={tests} onSelect={onSelect} onShowAll={onShowAll} />
  </>
}

function TestsView({ tests, onNewTest, onSelect }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => tests.filter((test) => [test.crop, test.village, test.soilType, test.fertilityLevel].join(' ').toLowerCase().includes(query.toLowerCase())), [tests, query])
  return <>
    <SectionHeading eyebrow="FIELD RECORDS" title="Soil tests" description="Every reading, kept in one place." action={<button className="button button-primary" onClick={onNewTest}><Plus size={17} /> New soil test</button>} />
    <section className="content-section list-section"><div className="list-toolbar"><div className="list-count"><b>{tests.length}</b> {tests.length === 1 ? 'record' : 'records'}</div><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search field or crop" /></label></div>
      {filtered.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>FIELD / CROP</th><th>TEST DATE</th><th>PH</th><th>SOIL HEALTH</th><th>SCORE</th><th /></tr></thead><tbody>{filtered.map((test) => <tr key={test._id} onClick={() => onSelect(test)}><td><span className="field-cell"><span className="field-dot"><Sprout size={14} /></span><span><b>{test.crop || 'Unspecified crop'}</b><small>{[test.village, test.soilType].filter(Boolean).join(' · ') || test.location || 'Field record'}</small></span></span></td><td>{prettyDate(test.testDate)}</td><td>{test.ph}</td><td><StatusPill value={test.fertilityLevel} /></td><td><b className="score-cell">{test.healthScore}<small>/100</small></b></td><td><ChevronRight size={17} className="row-chevron" /></td></tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-illustration"><FlaskConical size={24} /></span><div><h3>{query ? 'No matching field records' : 'No soil tests recorded'}</h3><p>{query ? 'Try another crop, field, or soil type.' : 'Add a test to get health scores and recommendations.'}</p></div>{!query && <button className="button button-outline" onClick={onNewTest}><Plus size={16} /> Add a test</button>}</div>}
    </section>
  </>
}

function CropsView({ crops }) {
  return <>
    <SectionHeading eyebrow="FIELD LIBRARY" title="Crop guide" description="Explore crops and the soil conditions they prefer." />
    {crops.length ? <div className="library-grid">{crops.map((crop, index) => <article className="library-item crop-item" key={crop._id}><div className="library-top"><span className={`crop-illustration crop-tone-${index % 4}`}><Wheat size={21} /></span><span className="ph-chip">pH {crop.idealPH}</span></div><h2>{crop.name}</h2><p>{crop.description || 'A useful addition to your field plan.'}</p><div className="library-meta"><span>SOIL TYPES</span><div className="tag-row">{(crop.soilTypes || []).slice(0, 3).map((soil) => <small key={soil}>{soil}</small>)}</div></div><div className="crop-levels">{[['N', crop.nitrogen], ['P', crop.phosphorus], ['K', crop.potassium]].map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div></article>)}</div> : <div className="empty-state library-empty"><span className="empty-illustration"><Wheat size={24} /></span><div><h3>Crop guide is waiting for data</h3><p>Crop recommendations appear after the library has been seeded.</p></div></div>}
  </>
}

function FertilizersView({ fertilizers }) {
  const groups = ['Nitrogen', 'Phosphorus', 'Potassium', 'Organic Carbon']
  return <>
    <SectionHeading eyebrow="FIELD LIBRARY" title="Nutrient guide" description="Learn what each amendment supports before planning an application." />
    {fertilizers.length ? <div className="fertilizer-list">{groups.map((group) => {
      const items = fertilizers.filter((fertilizer) => fertilizer.nutrient === group)
      if (!items.length) return null
      return <section className="fertilizer-group" key={group}><div className="fertilizer-group-heading"><span className="nutrient-marker">{group === 'Nitrogen' ? 'N' : group === 'Phosphorus' ? 'P' : group === 'Potassium' ? 'K' : 'C'}</span><div><p className="eyebrow">NUTRIENT</p><h2>{group}</h2></div><span className="group-total">{items.length} {items.length === 1 ? 'option' : 'options'}</span></div><div className="fertilizer-items">{items.map((item) => <article className="fertilizer-item" key={item._id}><div className="fertilizer-item-title"><span className="fert-icon"><Leaf size={17} /></span><div><h3>{item.name}</h3><p>{item.composition || item.purpose}</p></div></div><div className="fertilizer-purpose"><span>APPLICATION</span><p>{item.applicationMethod || 'Follow local guidance'}</p></div><div className="fertilizer-quantity"><span>ADVISORY QUANTITY</span><p>{item.quantity || 'As locally recommended'}</p></div><div className="fertilizer-caution">{item.precautions || 'Verify application with a local agricultural expert.'}</div></article>)}</div></section>
    })}<p className="advisory-note"><CircleAlert size={16} /> Advisory only. Confirm timing and quantities with a qualified local agricultural expert.</p></div> : <div className="empty-state library-empty"><span className="empty-illustration"><Leaf size={24} /></span><div><h3>Nutrient guide is waiting for data</h3><p>Fertilizer information appears after the library has been seeded.</p></div></div>}
  </>
}

function ReportsView({ reports, tests, onCreate, creating }) {
  return <>
    <SectionHeading eyebrow="YOUR FIELD ARCHIVE" title="Reports" description="Save a snapshot of a soil test and its recommendations." />
    <section className="content-section list-section"><div className="section-bar report-toolbar"><div><p className="eyebrow">SAVED REPORTS</p><h2>{reports.length} {reports.length === 1 ? 'report' : 'reports'}</h2></div><span className="date-chip"><FileText size={14} /> Private archive</span></div>
      {reports.length ? <div className="report-list">{reports.map((report) => {
        const detail = report.reportData || {}
        return <article className="report-row" key={report._id}><span className="report-icon"><FileText size={19} /></span><div className="report-main"><h3>{detail.crop || 'Soil test report'}</h3><p>{detail.soilType || 'Soil profile'} · Created {prettyDate(report.createdAt)}</p></div><StatusPill value={detail.fertilityLevel} /><button className="icon-button report-download" title="Download report" onClick={() => downloadReport(report)}><ArrowDownToLine size={17} /></button></article>
      })}</div> : <div className="empty-state"><span className="empty-illustration"><FileText size={24} /></span><div><h3>No reports saved yet</h3><p>Create a report from one of your soil tests to keep its recommendations together.</p></div></div>}
    </section>
    {tests.length > 0 && <section className="report-create"><div><p className="eyebrow">CREATE A SNAPSHOT</p><h2>Choose a soil test</h2><p>Save the result and recommendations as a report.</p></div><label className="report-select"><span className="sr-only">Select soil test</span><select id="report-test-select" defaultValue=""><option value="" disabled>Select field / crop</option>{tests.map((test) => <option key={test._id} value={test._id}>{test.crop || 'Unspecified crop'} · {prettyDate(test.testDate)}</option>)}</select></label><button className="button button-primary" disabled={creating} onClick={() => { const id = document.getElementById('report-test-select')?.value; if (id) onCreate(id) }}>{creating ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />} Save report</button></section>}
  </>
}

function downloadReport(report) {
  const blob = new Blob([JSON.stringify(report.reportData || report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `soilcare-report-${prettyDate(report.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-')}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function SoilTestDialog({ user, onClose, onSave, saving }) {
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    for (const key of ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organicCarbon', 'moisture']) payload[key] = Number(payload[key])
    try { await onSave(payload) } catch (saveError) { setError(saveError.message) }
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="test-modal" role="dialog" aria-modal="true" aria-labelledby="test-dialog-title"><div className="modal-header"><div><p className="eyebrow">FIELD RECORD</p><h2 id="test-dialog-title">New soil test</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div><form className="test-form" onSubmit={submit}>
    <div className="form-section-title"><span>01</span><div><b>Field details</b><small>Where and what you are growing</small></div></div>
    <div className="form-grid"><label>Farmer name<input name="farmerName" defaultValue={user.name} /></label><label>Field / village<input name="village" defaultValue={user.location || ''} placeholder="e.g. East field" /></label><label>Soil type<select name="soilType" defaultValue=""><option value="">Choose soil type</option>{['Loamy', 'Sandy', 'Clay', 'Black', 'Red', 'Silt'].map((soil) => <option key={soil}>{soil}</option>)}</select></label><label>Current crop<input name="crop" placeholder="e.g. Wheat" /></label><label>Previous crop<input name="previousCrop" placeholder="Optional" /></label><label>Irrigation<select name="irrigationType" defaultValue=""><option value="">Choose method</option>{['Rainfed', 'Drip', 'Sprinkler', 'Flood', 'Other'].map((method) => <option key={method}>{method}</option>)}</select></label></div>
    <div className="form-section-title form-section-spaced"><span>02</span><div><b>Soil readings</b><small>Enter values from your soil test report</small></div></div>
    <div className="form-grid readings-grid"><label>pH <span>0–14</span><input name="ph" type="number" min="0" max="14" step="0.1" placeholder="6.5" required /></label><label>Nitrogen (kg/ha)<input name="nitrogen" type="number" min="0" step="1" placeholder="280" required /></label><label>Phosphorus (kg/ha)<input name="phosphorus" type="number" min="0" step="1" placeholder="18" required /></label><label>Potassium (kg/ha)<input name="potassium" type="number" min="0" step="1" placeholder="150" required /></label><label>Organic carbon (%)<input name="organicCarbon" type="number" min="0" max="100" step="0.01" placeholder="0.6" required /></label><label>Moisture (%)<input name="moisture" type="number" min="0" max="100" step="0.1" placeholder="25" required /></label><label>Test date<input name="testDate" type="date" defaultValue={today} /></label></div>
    <label className="notes-field">Field notes <span className="optional">OPTIONAL</span><textarea name="notes" rows="2" placeholder="Anything notable about the field today?" /></label>
    {error && <div className="form-error" role="alert"><CircleAlert size={16} />{error}</div>}
    <div className="modal-footer"><span><LockKeyhole size={14} /> Saved to your private field log</span><div><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Activity size={17} />} Analyze soil</button></div></div>
  </form></section></div>
}

function ResultDialog({ result, onClose, onReport }) {
  const recommendations = result.cropRecommendations || []
  const fertilizer = result.fertilizerRecommendations?.items || []
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title"><div className="result-top"><button className="icon-button result-close" onClick={onClose} aria-label="Close"><X size={20} /></button><span className="result-check"><Check size={22} /></span><p className="eyebrow light-eyebrow">SOIL TEST COMPLETE</p><h2 id="result-title">Your field reading is ready</h2><div className="result-score"><strong>{result.healthScore}</strong><span>/ 100</span><StatusPill value={result.fertilityLevel} /></div></div><div className="result-body"><div className="result-columns"><div><p className="eyebrow">CROP MATCHES</p>{recommendations.length ? recommendations.slice(0, 3).map((crop, index) => <div className="result-match" key={crop.cropId || crop.name}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{crop.name}</b><small>{crop.suitability}% fit · {crop.reason}</small></div></div>) : <p className="result-muted">Crop guide data is not available yet.</p>}</div><div><p className="eyebrow">NUTRIENT NOTES</p>{result.recommendations?.length ? result.recommendations.slice(0, 3).map((item) => <div className="result-note" key={item}><span><Leaf size={14} /></span>{item}</div>) : <p className="result-muted">No immediate nutrient actions were flagged.</p>}{fertilizer.length > 0 && <small className="fertilizer-count">{fertilizer.length} fertilizer options match flagged nutrients</small>}</div></div><div className="result-actions"><button className="button button-outline" onClick={() => onReport(result._id)}><FileText size={16} /> Save report</button><button className="button button-primary" onClick={onClose}>Back to workspace <ArrowRight size={16} /></button></div></div></section></div>
}

function DetailDialog({ test, onClose, onDelete, onReport, busy }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div className="modal-header"><div><p className="eyebrow">FIELD READING · {prettyDate(test.testDate)}</p><h2 id="detail-title">{test.crop || 'Soil test'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div><div className="detail-summary"><div className="detail-score"><strong>{test.healthScore ?? '—'}</strong><span>SOIL HEALTH SCORE</span></div><StatusPill value={test.fertilityLevel} /><span>{[test.village, test.soilType].filter(Boolean).join(' · ') || 'Field reading'}</span></div><div className="detail-nutrients">{Object.entries(test.nutrientStatus || {}).map(([key, value]) => <div key={key}><span>{nutrientNames[key] || key}</span><StatusPill value={value} /></div>)}</div><div className="detail-recommendations"><p className="eyebrow">FIELD NOTES</p>{test.recommendations?.length ? <ul>{test.recommendations.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No additional recommendations.</p>}</div><div className="modal-footer"><button className="button button-danger-quiet" disabled={busy} onClick={() => onDelete(test._id)}><X size={16} /> Delete record</button><div><button className="button button-outline" disabled={busy} onClick={() => onReport(test._id)}><FileText size={16} /> Save report</button><button className="button button-primary" onClick={onClose}>Done</button></div></div></section></div>
}

function LoadingScreen({ message = 'Preparing your field workspace' }) {
  return <main className="loading-screen"><div className="loading-brand"><span className="brand-mark"><Sprout size={18} /></span> soilcare</div><LoaderCircle size={24} className="spin loading-icon" /><p>{message}</p></main>
}

async function loadWorkspace(token) {
  const [stats, tests, crops, fertilizers, reports] = await Promise.all([
    request('/dashboard/stats', { token }),
    request('/soil-tests', { token }),
    request('/crops', { token }),
    request('/fertilizers', { token }),
    request('/reports', { token }),
  ])
  return { stats, tests, crops, fertilizers, reports }
}

function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('soilcare-session') || 'null') } catch { return null }
  })
  const [data, setData] = useState(null)
  const [active, setActive] = useState('overview')
  const [loading, setLoading] = useState(Boolean(session?.token))
  const [savingTest, setSavingTest] = useState(false)
  const [creatingReport, setCreatingReport] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (session) localStorage.setItem('soilcare-session', JSON.stringify(session))
    else localStorage.removeItem('soilcare-session')
  }, [session])

  useEffect(() => {
    if (!session?.token) return
    let current = true
    loadWorkspace(session.token).then((workspace) => {
      if (current) { setData(workspace); setNotice(null) }
    }).catch((loadError) => {
      if (current) {
        setNotice({ type: 'error', message: loadError.message })
        if (/authenticated|token|unauthorized/i.test(loadError.message)) setSession(null)
      }
    }).finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [session?.token])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(null), 4200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function logout() {
    setSession(null)
    setData(null)
    setLoading(false)
    setActive('overview')
    setDialog(null)
  }

  function authenticate(nextSession) {
    setData(null)
    setLoading(true)
    setSession(nextSession)
  }

  async function refresh() {
    if (!session?.token) return
    const workspace = await loadWorkspace(session.token)
    setData(workspace)
  }

  async function saveTest(payload) {
    setSavingTest(true)
    try {
      const result = await request('/soil-tests', { token: session.token, method: 'POST', body: payload })
      await refresh()
      setDialog({ type: 'result', value: result })
      setNotice({ type: 'success', message: 'Soil test analyzed and saved.' })
    } finally { setSavingTest(false) }
  }

  async function createReport(testId) {
    if (!testId) return
    setCreatingReport(true)
    try {
      await request('/reports', { token: session.token, method: 'POST', body: { soilTestId: testId } })
      await refresh()
      setDialog(null)
      setActive('reports')
      setNotice({ type: 'success', message: 'Report saved to your archive.' })
    } catch (reportError) { setNotice({ type: 'error', message: reportError.message }) }
    finally { setCreatingReport(false) }
  }

  async function deleteTest(testId) {
    if (!window.confirm('Delete this soil test and its saved reports?')) return
    try {
      await request(`/soil-tests/${testId}`, { token: session.token, method: 'DELETE' })
      await refresh()
      setDialog(null)
      setNotice({ type: 'success', message: 'Soil test removed.' })
    } catch (deleteError) { setNotice({ type: 'error', message: deleteError.message }) }
  }

  if (!session) return <AuthScreen onAuthenticated={authenticate} />
  if (loading && !data) return <LoadingScreen />

  const user = session.user || { name: 'Farmer', role: 'farmer' }
  const tests = data?.tests || []
  const activePage = navigation.find((item) => item.id === active)?.label || 'Overview'

  return <div className="app-shell">
    <Sidebar active={active} onNavigate={setActive} onLogout={logout} user={{ ...user, testCount: tests.length }} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <main className="main-area">
      <Topbar user={user} onNewTest={() => setDialog({ type: 'new-test' })} onMenu={() => setMobileOpen(true)} notice={notice} />
      <div className="page-content" key={active}>
        {active === 'overview' && <Overview user={user} stats={data?.stats} tests={tests} onNewTest={() => setDialog({ type: 'new-test' })} onSelect={(test) => setDialog({ type: 'detail', value: test })} onShowAll={() => setActive('tests')} />}
        {active === 'tests' && <TestsView tests={tests} onNewTest={() => setDialog({ type: 'new-test' })} onSelect={(test) => setDialog({ type: 'detail', value: test })} />}
        {active === 'crops' && <CropsView crops={data?.crops || []} />}
        {active === 'fertilizers' && <FertilizersView fertilizers={data?.fertilizers || []} />}
        {active === 'reports' && <ReportsView reports={data?.reports || []} tests={tests} creating={creatingReport} onCreate={createReport} />}
        <footer className="page-footer"><span>SOILCARE FIELD WORKSPACE</span><span><span className="live-dot" /> API CONNECTED</span><span>{activePage}</span></footer>
      </div>
    </main>
    {dialog?.type === 'new-test' && <SoilTestDialog user={user} saving={savingTest} onClose={() => setDialog(null)} onSave={saveTest} />}
    {dialog?.type === 'result' && <ResultDialog result={dialog.value} onClose={() => setDialog(null)} onReport={createReport} />}
    {dialog?.type === 'detail' && <DetailDialog test={dialog.value} busy={creatingReport} onClose={() => setDialog(null)} onDelete={deleteTest} onReport={createReport} />}
  </div>
}

export default App