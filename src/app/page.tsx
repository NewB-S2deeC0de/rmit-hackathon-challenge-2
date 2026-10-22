"use client";

import { useCallback, useEffect, useState } from "react";
import { demoBatch } from "@/data/demo-batch";
import { DemoBatchCrypto } from "@/lib/demo/crypto";
import { calculatePCF, parseBatchForm, publicSummary } from "@/lib/pcf";
import type { Actor, BatchFormValues, ListPublicBatchesResponse, PrivateBatchPayload, PublicBatch } from "@/types";

type Governance = { grant: { id: string; target: string; approvals: string[]; status: string; canDecrypt: boolean } | null; simulation: true };
const personas = [
  { id: "supplier-a", label: "Supplier A" }, { id: "supplier-b", label: "Supplier B" },
  { id: "buyer", label: "Buyer" }, { id: "admin-a", label: "Admin A" },
  { id: "admin-b", label: "Admin B" }, { id: "admin-c", label: "Admin C" },
];
const formFields: { key: keyof BatchFormValues; label: string; unit?: string }[] = [
  { key: "batchId", label: "Batch ID" }, { key: "productName", label: "Product name" },
  { key: "quantity", label: "Quantity", unit: "units" }, { key: "electricityKwh", label: "Electricity", unit: "kWh" },
  { key: "materialKg", label: "Material", unit: "kg" }, { key: "inboundTransportTonKm", label: "Inbound transport", unit: "tonne-km" },
  { key: "wasteKg", label: "Waste", unit: "kg" },
];

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? `HTTP ${response.status}`);
  return data as T;
}

export default function Home() {
  const [actor, setActor] = useState<Actor | null>(null);
  const [demoEnabled, setDemoEnabled] = useState<boolean | null>(null);
  const [form, setForm] = useState<BatchFormValues>({ ...demoBatch, batchId: "" });
  const [evidence, setEvidence] = useState("");
  const [publicBatches, setPublicBatches] = useState<PublicBatch[]>([]);
  const [search, setSearch] = useState("");
  const [batchId, setBatchId] = useState("");
  const [decrypted, setDecrypted] = useState<PrivateBatchPayload | null>(null);
  const [governance, setGovernance] = useState<Governance | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const parsed = parseBatchForm(form);
  const result = parsed.ok ? calculatePCF(parsed.value) : null;
  const summary = parsed.ok && result ? publicSummary(parsed.value, result) : null;

  const refresh = useCallback(async () => {
    const [session, batches, grants] = await Promise.all([
      jsonFetch<{ actor: Actor | null; demoEnabled: boolean }>("/api/demo/session"),
      jsonFetch<ListPublicBatchesResponse>("/api/batches/public"),
      jsonFetch<Governance>("/api/demo/governance"),
    ]);
    setActor(session.actor); setDemoEnabled(session.demoEnabled); setPublicBatches(batches.items); setGovernance(grants);
  }, []);
  useEffect(() => { refresh().catch((error) => setNotice(error.message)); }, [refresh]);

  async function signIn(id: string) {
    setBusy(true); setNotice(""); setDecrypted(null);
    try { const data = await jsonFetch<{ actor: Actor }>("/api/demo/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }); setActor(data.actor); setNotice(`Signed in as ${data.actor.name} (simulation).`); }
    catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!parsed.ok || !result || !summary) { setNotice("Fix the form fields before submitting."); return; }
    setBusy(true); setNotice("");
    try {
      const privatePayload: PrivateBatchPayload = { schemaVersion: 1, input: parsed.value, result, ...(evidence.trim() ? { evidence: { kind: "demo-text" as const, text: evidence.trim() } } : {}) };
      const encryptedInput = await new DemoBatchCrypto().encrypt(privatePayload);
      const response = await jsonFetch<{ id: string }>("/api/batches", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ schemaVersion: 1, publicSummary: summary, encryptedInput }) });
      setBatchId(response.id); setNotice(`Batch saved. Record ID: ${response.id}`); await refresh();
    } catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  async function decryptOwn() {
    setBusy(true); setNotice(""); setDecrypted(null);
    try { const encrypted = await jsonFetch<import("@/types").EncryptedPayload>(`/api/batches/${encodeURIComponent(batchId.trim())}/encrypted`); const payload = await new DemoBatchCrypto().decrypt(encrypted); setDecrypted(payload); setNotice("Demo payload opened in this browser."); }
    catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  async function changeGovernance(action: "propose" | "approve") {
    setBusy(true); setNotice("");
    try { const value = await jsonFetch<Governance>("/api/demo/governance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) }); setGovernance(value); setNotice(value.grant?.status === "pending" ? "One approval recorded; mock decrypt grant is still inactive." : "Two distinct approvals recorded; mock grant is active."); }
    catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  const filtered = publicBatches.filter((batch) => `${batch.publicSummary.batchId} ${batch.publicSummary.productName}`.toLowerCase().includes(search.toLowerCase()));

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="brandMark">S<span>0</span></span><span>ScopeZero <small>MVP v1</small></span></div><nav><a href="#workspace">Workspace</a><a href="#public">Public reports</a><a href="#access">Access demo</a></nav></header>
    <section className="hero"><div><div className="eyebrow">SUPPLIER-REPORTED CARBON DATA · DEMO</div><h1>Share the footprint.<br /><em>Control the source.</em></h1><p>Suppliers calculate a batch footprint in their browser. Buyers see a limited summary. Private input is sent as a demo encrypted payload.</p><div className="heroStats"><div><strong>4</strong><span>illustrative inputs</span></div><div><strong>1</strong><span>public summary</span></div><div><strong>2/3</strong><span>mock admin quorum</span></div></div></div><div className="heroCard"><span className="pill">Important limitation</span><h2>Simulation only</h2><p>The sign-in, roles, encryption key, and quorum shown here are local mocks. TideCloak is not connected. Do not enter real supplier records.</p><span className="cardFoot">The public PCF is supplier-reported, not independently verified.</span></div></section>
    {demoEnabled === false && <div className="warning">Run <code>npm run setup:demo</code> and restart the app to enable the local demo.</div>}
    <section id="workspace" className="workspace"><div className="sectionTitle"><div><span className="eyebrow">01 / WORKSPACE</span><h2>Choose a demo identity</h2></div><span className="status">{actor ? `${actor.name} · ${actor.role}` : "No demo session"}</span></div><div className="personaRow">{personas.map((person) => <button className={actor?.id === person.id ? "persona active" : "persona"} key={person.id} disabled={busy || !demoEnabled} onClick={() => signIn(person.id)}>{person.label}</button>)}</div>{notice && <p className="notice" role="status">{notice}</p>}
      {actor?.role === "supplier" && <div className="columns"><section className="panel"><div className="panelHeading"><span className="eyebrow">SUPPLIER FLOW</span><h3>Calculate a batch PCF</h3><p>All factors are illustrative. Calculation happens here before encryption.</p></div><div className="formGrid">{formFields.map((field) => <label key={field.key}>{field.label}{field.unit && <small>{field.unit}</small>}<input value={form[field.key]} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.label} />{!parsed.ok && parsed.fields[field.key] && <span className="fieldError">{parsed.fields[field.key]}</span>}</label>)}<label>Material type<input value={form.materialType} readOnly /></label></div><label className="fullLabel">Optional demo-text evidence <small>Never enter real records</small><textarea maxLength={10000} value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Optional explanatory text" /></label><div className="actions"><button className="secondary" onClick={() => setForm(demoBatch)}>Load DEMO-001</button><button className="primary" disabled={!parsed.ok || busy} onClick={submit}>Encrypt & submit</button></div></section><section className="panel summary"><span className="eyebrow">PUBLIC DISCLOSURE PREVIEW</span><h3>What a Buyer can see</h3>{summary ? <><div className="metric"><strong>{summary.totalKgCO2e.toLocaleString()}</strong><span>kg CO₂e / batch</span></div><div className="metric secondaryMetric"><strong>{summary.perProductKgCO2e.toLocaleString()}</strong><span>kg CO₂e / product</span></div><dl><dt>Batch</dt><dd>{summary.batchId}</dd><dt>Product</dt><dd>{summary.productName}</dd><dt>Factor set</dt><dd>{summary.factorVersion}</dd><dt>Assurance</dt><dd>{summary.assuranceLevel}</dd></dl><p className="caution">Publishing both total and per-product values can reveal the quantity.</p></> : <p className="muted">Complete the form to preview a public summary.</p>}<div className="divider" /><h3>Open an owned batch</h3><p className="muted">Use the record ID from submission. Trying another Supplier’s ID returns 404.</p><div className="inlineForm"><input value={batchId} onChange={(event) => setBatchId(event.target.value)} placeholder="Record ID" /><button className="secondary" disabled={!batchId.trim() || busy} onClick={decryptOwn}>Open</button></div>{decrypted && <div className="privateResult"><strong>Private payload opened in browser</strong><p>Electricity {decrypted.input.electricityKwh} kWh · Material {decrypted.input.materialKg} kg</p><p>Transport {decrypted.input.inboundTransportTonKm} tonne-km · Waste {decrypted.input.wasteKg} kg</p>{decrypted.evidence && <p>Demo text: {decrypted.evidence.text}</p>}</div>}</section></div>}
      {actor?.role === "buyer" && <div className="panel rolePanel"><span className="eyebrow">BUYER VIEW</span><h3>Public summaries only</h3><p>Browse the reports below. This role cannot submit batches or fetch private payloads.</p><a className="textLink" href="#public">Explore reports →</a></div>}
      {actor?.role === "admin" && <div className="panel rolePanel"><span className="eyebrow">ADMIN VIEW</span><h3>Permission change simulation</h3><p>Admin A proposes a self-grant. It remains pending after one approval. Admin B or C can provide the second approval.</p>{actor.id === "admin-a" && <button className="primary" disabled={busy} onClick={() => changeGovernance("propose")}>Propose self-grant</button>}{actor.id !== "admin-a" && <button className="primary" disabled={busy || !governance?.grant || governance.grant.status === "committed"} onClick={() => changeGovernance("approve")}>Approve pending grant</button>}</div>}
      {!actor && <div className="panel rolePanel"><h3>Start with Supplier A</h3><p>Submit the sample batch, switch to Buyer to see the public report, then try Supplier B with the saved record ID to see access denied.</p></div>}
    </section>
    <section id="public" className="publicSection"><div className="sectionTitle"><div><span className="eyebrow">02 / PUBLIC REPORTS</span><h2>Batch footprint summaries</h2></div><span className="status">{publicBatches.length} records</span></div><div className="searchBar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search batch or product" /><button className="secondary" onClick={() => refresh().catch((error) => setNotice(error.message))}>Refresh</button></div><div className="reportGrid">{filtered.length ? filtered.map((batch) => <article className="report" key={batch.id}><div className="reportTop"><span className="eyebrow">{batch.publicSummary.batchId}</span><span className="tag">supplier-reported</span></div><h3>{batch.publicSummary.productName}</h3><strong>{batch.publicSummary.totalKgCO2e.toLocaleString()} <small>kg CO₂e / batch</small></strong><p>{batch.publicSummary.perProductKgCO2e.toLocaleString()} kg CO₂e / product</p><div className="reportFoot">{new Date(batch.createdAt).toLocaleDateString()} · {batch.publicSummary.factorVersion}</div></article>) : <div className="empty">No matching summaries yet. Supplier A can publish DEMO-001 above.</div>}</div></section>
    <section id="access" className="accessSection"><div className="sectionTitle"><div><span className="eyebrow">03 / GOVERNANCE DEMO</span><h2>Two approvals to change access</h2></div><span className="tag">SIMULATED QEA</span></div><div className="accessGrid"><div className="panel"><h3>Admin A self-grant</h3><p>Mock decrypt permission for Admin A only. This is a status probe, not a TideCloak grant or actual batch decrypt permission.</p><div className="approvalTrack"><span className={governance?.grant ? "done" : ""}>Admin A proposes</span><span className={governance?.grant?.status === "committed" ? "done" : ""}>Admin B/C approves</span></div></div><div className="panel grantPanel"><span className="eyebrow">CURRENT STATE</span><strong>{governance?.grant?.status ?? "No request"}</strong><p>Approvals: {governance?.grant?.approvals.join(", ") ?? "none"}</p><p>Mock grant effective: <b>{governance?.grant?.canDecrypt ? "Yes" : "No"}</b></p></div></div></section><footer><span>ScopeZero · Hackathon MVP</span><span>Illustrative factors · simulated TideCloak controls · no real supplier data</span></footer>
  </main>;
}
