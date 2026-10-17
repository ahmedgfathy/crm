import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { parseContactsFile } from "./contactsImport.js";
import "./style.css";

const emptyContact = { name: "", company: "", email: "", phone: "", status: "Lead", notes: "" };

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || `Request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function AuthScreen({ configured, onAuthenticate }) {
  const [email, setEmail] = useState("cernkey@outlook.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!configured && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api(configured ? "/auth/login" : "/auth/setup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onAuthenticate(result.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <a className="brand auth-brand" href="/" aria-label="Northstar home">
          <span className="brand-mark">n</span>
          <span>northstar<span className="brand-period">.</span></span>
        </a>
        <span className="eyebrow">{configured ? "YOUR PRIVATE WORKSPACE" : "ONE-TIME ACCOUNT SETUP"}</span>
        <h1>{configured ? "Welcome back" : "Create your login"}</h1>
        <p className="auth-description">{configured
          ? "Sign in to open your contacts and continue where you left off."
          : "Set up the local account for your private contact workspace. Your password is stored as a salted hash."}</p>
        <form onSubmit={submit} className="auth-form">
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              readOnly={!configured}
              required
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={configured ? "current-password" : "new-password"}
              minLength={configured ? undefined : 12}
              required
            />
            {!configured && <small>Choose at least 12 characters. This password is not saved in the source code.</small>}
          </label>
          {!configured && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : configured ? "Sign in" : "Create local account"}
          </button>
        </form>
        <div className="auth-privacy"><span>⌂</span><span><strong>Private by design</strong>Your account and contacts stay on this laptop.</span></div>
      </section>
    </main>
  );
}

function ContactDialog({ contact, onClose, onSave }) {
  const [form, setForm] = useState(contact || emptyContact);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{contact ? "CONTACT DETAILS" : "YOUR NETWORK"}</span>
            <h2 id="dialog-title">{contact ? "Edit contact" : "Add a contact"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <form onSubmit={submit}>
          <label>
            Full name <span className="required">*</span>
            <input name="name" value={form.name} onChange={update} placeholder="e.g. Alex Morgan" required autoFocus />
          </label>
          <label>
            Company
            <input name="company" value={form.company} onChange={update} placeholder="Company name" />
          </label>
          <div className="form-row">
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={update} placeholder="alex@company.com" />
            </label>
            <label>
              Phone
              <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="+1 555 000 0000" />
            </label>
          </div>
          <label>
            Relationship
            <select name="status" value={form.status} onChange={update}>
              <option>Lead</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={update} placeholder="Add a note about this contact…" rows="3" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : contact ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ImportDialog({ onClose, onImport }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function readFile(event) {
    const file = event.target.files?.[0];
    setPreview(null);
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose a file smaller than 5 MB.");
      return;
    }
    try {
      setPreview({ ...parseContactsFile(file.name, await file.text()), fileName: file.name });
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit() {
    if (!preview) return;
    setBusy(true);
    setError("");
    try {
      await onImport(preview.contacts);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">GOOGLE, MICROSOFT & MORE</span>
            <h2 id="import-title">Import contacts</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <p className="import-intro">Choose a Google Contacts or Outlook CSV export, or any standard vCard (.vcf) file. Names, companies, email addresses, phone numbers, and notes are mapped automatically.</p>
        <label className="file-picker">
          <span className="file-picker-icon">↥</span>
          <span><strong>{preview ? preview.fileName : "Choose a contacts file"}</strong><small>CSV or VCF · up to 5 MB · 1,000 contacts</small></span>
          <input type="file" accept=".csv,.vcf,text/csv,text/vcard" onChange={readFile} />
        </label>
        {preview && (
          <div className="import-preview">
            <div className="import-summary"><strong>{preview.contacts.length} contacts ready</strong><span>{preview.skipped ? `${preview.skipped} rows without a name will be skipped` : "Status defaults to Lead"}</span></div>
            <div className="preview-table-wrap">
              <table className="preview-table">
                <thead><tr><th>NAME</th><th>COMPANY</th><th>EMAIL</th></tr></thead>
                <tbody>{preview.contacts.slice(0, 5).map((contact, index) => (
                  <tr key={`${contact.email}-${index}`}><td>{contact.name}</td><td>{contact.company || "—"}</td><td>{contact.email || "—"}</td></tr>
                ))}</tbody>
              </table>
            </div>
            {preview.contacts.length > 5 && <span className="preview-more">Showing 5 of {preview.contacts.length} contacts</span>}
            <span className="duplicate-note">Contacts with email addresses already in your list will be skipped.</span>
          </div>
        )}
        {error && <p className="form-error import-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="button" disabled={!preview || busy} onClick={submit}>
            {busy ? "Importing…" : preview ? `Import ${preview.contacts.length} contacts` : "Import contacts"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Dashboard({ user, onSignOut }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All contacts");
  const [dialogContact, setDialogContact] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setContacts(await api("/contacts"));
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    total: contacts.length,
    active: contacts.filter((contact) => contact.status === "Active").length,
    leads: contacts.filter((contact) => contact.status === "Lead").length,
    companies: new Set(contacts.map((contact) => contact.company.trim()).filter(Boolean)).size,
  }), [contacts]);

  const filteredContacts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesFilter = filter === "All contacts" || contact.status === filter;
      const matchesSearch = !needle || [contact.name, contact.company, contact.email, contact.phone]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesFilter && matchesSearch;
    });
  }, [contacts, filter, search]);

  async function saveContact(form) {
    const editing = dialogContact;
    const saved = await api(editing ? `/contacts/${editing.id}` : "/contacts", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(form),
    });
    setContacts((current) => editing
      ? current.map((contact) => contact.id === saved.id ? saved : contact)
      : [saved, ...current]);
  }

  async function importContacts(importedContacts) {
    const result = await api("/contacts/import", {
      method: "POST",
      body: JSON.stringify({ contacts: importedContacts }),
    });
    setContacts((current) => [...result.imported, ...current]);
    const skipped = result.skippedDuplicates;
    setNotice(`${result.imported.length} contacts imported${skipped ? `; ${skipped} duplicate${skipped === 1 ? "" : "s"} skipped` : ""}.`);
    setError("");
  }

  async function deleteContact(contact) {
    if (!window.confirm(`Remove ${contact.name} from your contacts?`)) return;
    try {
      await api(`/contacts/${contact.id}`, { method: "DELETE" });
      setContacts((current) => current.filter((item) => item.id !== contact.id));
    } catch (err) {
      setError(err.message);
    }
  }

  function openDialog(contact = null) {
    setDialogContact(contact);
    setDialogOpen(true);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Northstar home">
          <span className="brand-mark">n</span>
          <span>northstar<span className="brand-period">.</span></span>
        </a>
        <span className="nav-label">WORKSPACE</span>
        <button className="nav-item nav-item-active" type="button">
          <span className="nav-icon">▦</span> Contacts <span className="nav-count">{contacts.length}</span>
        </button>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span className="privacy-icon">⌂</span>
            <strong>Your private workspace</strong>
            <span>Your contacts stay on this laptop.</span>
          </div>
          <div className="profile">
            <span className="profile-avatar">{initials(user)}</span>
            <span><strong>{user}</strong><small>Local account</small></span>
            <button className="sign-out-button" type="button" onClick={() => onSignOut().catch(() => {})}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Contacts</strong></div>
          <div className="topbar-right"><span className="local-indicator"><i /> Saved locally</span><span className="topbar-avatar">{initials(user)}</span></div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR RELATIONSHIPS</span>
              <h1>Contacts <span>{counts.total}</span></h1>
              <p>Keep track of the people who make your business tick.</p>
            </div>
            <button className="button button-primary add-button" onClick={() => openDialog()}>
              <span>＋</span> Add contact
            </button>
          </div>

          <section className="metrics" aria-label="Contact summary">
            <article className="metric-card">
              <div className="metric-top"><span>Total contacts</span><span className="metric-icon mint">♧</span></div>
              <strong>{counts.total}</strong><small>People in your network</small>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Active customers</span><span className="metric-icon blue">↗</span></div>
              <strong>{counts.active}</strong><small>Currently working together</small>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Open leads</span><span className="metric-icon amber">✳</span></div>
              <strong>{counts.leads}</strong><small>Opportunities to follow up</small>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Companies</span><span className="metric-icon violet">▤</span></div>
              <strong>{counts.companies}</strong><small>Across your contact list</small>
            </article>
          </section>

          <section className="contacts-panel">
            <div className="panel-heading">
              <div><h2>All contacts</h2><p>A little organization goes a long way.</p></div>
              <div className="panel-actions">
                <button className="button button-outline" onClick={() => setImportOpen(true)}>Import contacts</button>
                <button className="button button-primary panel-add-button" onClick={() => openDialog()}><span>＋</span> New contact</button>
              </div>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts..." aria-label="Search contacts" />
                <kbd>⌘ K</kbd>
              </label>
              <label className="filter-select">
                <span className="filter-icon">☷</span>
                <select aria-label="Filter contacts by status" value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option>All contacts</option><option>Lead</option><option>Active</option><option>Inactive</option>
                </select>
                <span className="select-chevron">⌄</span>
              </label>
            </div>

            {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
            {error && <div className="alert" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
            <div className="table-wrap">
              <table>
                <thead><tr><th><input type="checkbox" aria-label="Select all contacts" disabled /></th><th>NAME</th><th>COMPANY</th><th>EMAIL</th><th>PHONE</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td className="empty-state" colSpan="7">Loading your contacts…</td></tr>
                  ) : filteredContacts.length ? filteredContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td><input type="checkbox" aria-label={`Select ${contact.name}`} /></td>
                      <td><button className="contact-name" onClick={() => openDialog(contact)}><span className={`contact-avatar color-${Number(contact.id) % 5}`}>{initials(contact.name)}</span><span>{contact.name}</span></button></td>
                      <td>{contact.company || <span className="muted">—</span>}</td>
                      <td>{contact.email ? <a className="email-link" href={`mailto:${contact.email}`}>{contact.email}</a> : <span className="muted">—</span>}</td>
                      <td>{contact.phone || <span className="muted">—</span>}</td>
                      <td><span className={`status-pill status-${contact.status.toLowerCase()}`}><i />{contact.status}</span></td>
                      <td><div className="row-actions"><button onClick={() => openDialog(contact)} aria-label={`Edit ${contact.name}`}>✎</button><button onClick={() => deleteContact(contact)} aria-label={`Delete ${contact.name}`}>×</button></div></td>
                    </tr>
                  )) : (
                    <tr><td className="empty-state" colSpan="7">
                      {contacts.length ? "No contacts match your search." : "Your contact list is ready when you are."}
                      {!contacts.length && <button className="text-action" onClick={() => openDialog()}> Add your first contact</button>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing <strong>{filteredContacts.length ? 1 : 0}–{filteredContacts.length}</strong> of <strong>{contacts.length}</strong> contacts</span>
              <span>Made for your corner of the world <span className="footer-star">✳</span></span>
            </div>
          </section>
          <footer className="page-footer"><span>Northstar CRM</span><span>Simple tools, stronger relationships.</span></footer>
        </section>
      </main>
      {dialogOpen && <ContactDialog contact={dialogContact} onClose={() => setDialogOpen(false)} onSave={saveContact} />}
      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} onImport={importContacts} />}
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/auth/status")
      .then((status) => setAuth(status))
      .catch((err) => setError(err.message));
  }, []);

  if (!auth) {
    return error
      ? <main className="auth-screen"><section className="auth-card"><span className="eyebrow">NORTHSTAR CRM</span><h1>Can’t connect yet</h1><p className="auth-description">{error}</p><button className="button button-primary auth-submit" onClick={() => { setError(""); api("/auth/status").then(setAuth).catch((err) => setError(err.message)); }}>Try again</button></section></main>
      : <main className="auth-screen"><p className="auth-loading">Opening your private workspace…</p></main>;
  }

  if (!auth.authenticated) {
    return <AuthScreen configured={auth.configured} onAuthenticate={(email) => setAuth({ configured: true, authenticated: true, email })} />;
  }

  async function signOut() {
    try {
      await api("/auth/logout", { method: "POST" });
      setAuth((current) => ({ ...current, authenticated: false }));
    } catch (err) {
      throw err;
    }
  }

  return <Dashboard user={auth.email} onSignOut={signOut} />;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
