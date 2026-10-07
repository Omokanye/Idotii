const KEY = "idoti-feedback-v1";
const money = (n) => "₦" + Number(n || 0).toLocaleString("en-NG");
const phoneOk = (v) => /^(\+?234|0)[789][01]\d{8}$/.test(String(v).replace(/[\s-]/g, ""));
const emailOk = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const norm = (v) => String(v || "").replace(/[\s-]/g, "");
const uid = () => Math.random().toString(36).slice(2, 8);
const period = new Date().toISOString().slice(0, 7);

const seed = {
  role: null,
  who: "",
  customers: [
    { id: "c1", name: "Adaeze Okafor", phone: "08031234567", email: "adaeze@example.com", location: "12 Isaac John", area: "Ikeja", plan: "Weekly household", notes: "", status: "active" },
    { id: "c2", name: "Tunde Bakare", phone: "08122223333", email: "", location: "4 Hughes Avenue", area: "Yaba", plan: "Weekly household", notes: "No email. Call only.", status: "active" },
    { id: "c3", name: "Grace Eze", phone: "09011112222", email: "grace@example.com", location: "8 Admiralty Way", area: "Lekki", plan: "Twice weekly", notes: "", status: "active" },
    { id: "c4", name: "Ibrahim Musa", phone: "07045556666", email: "", location: "19 Allen Avenue", area: "Ikeja", plan: "Weekly household", notes: "", status: "active" },
    { id: "c5", name: "Funke Adeyemi", phone: "08099887766", email: "funke@example.com", location: "3 Adeniran Ogunsanya", area: "Surulere", plan: "Market stall", notes: "", status: "active" }
  ],
  bills: [
    { id: "b1", customerId: "c1", period, amount: 5000, paid: 5000 },
    { id: "b2", customerId: "c2", period, amount: 4000, paid: 0 },
    { id: "b3", customerId: "c3", period, amount: 7500, paid: 3000 },
    { id: "b4", customerId: "c4", period, amount: 5000, paid: 0 },
    { id: "b5", customerId: "c5", period, amount: 4500, paid: 4500 }
  ],
  collections: [
    { id: "k1", customerId: "c1", date: new Date().toISOString().slice(0, 10), wasteType: "Household", bins: 2, status: "completed", staff: "Field sample" }
  ],
  notices: [],
  feedback: []
};

let state = load();
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(seed); }
  catch { return structuredClone(seed); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function owe(id) {
  return state.bills.filter((b) => b.customerId === id).reduce((s, b) => s + Math.max(0, b.amount - b.paid), 0);
}
function customer(id) { return state.customers.find((c) => c.id === id); }

const app = document.querySelector("#app");

function shell(inner) {
  app.innerHTML = `
    <header class="top">
      <div class="brand"><img src="brand/logo-mark.svg" alt=""><div>Idoti<small>Waste management software</small></div></div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="free">Free while we learn</span>
        ${state.role ? `<button class="btn small ghost" id="switch" style="color:#f6f3ec;border-color:#f6f3ec">Switch role</button>` : ""}
      </div>
    </header>
    <main class="wrap">${inner}</main>
    <footer>Idoti keeps the customer book. Dustpan remains the waste marketplace. Records in this build stay on this device.</footer>`;
  document.querySelector("#switch")?.addEventListener("click", () => { state.role = null; save(); draw(); });
}

function draw() {
  if (!state.role) return gate();
  if (state.role === "customer") return customerView();
  return desk();
}

function gate() {
  shell(`
    <h1>Who is using the book today?</h1>
    <p class="lede">Idoti is free during feedback. A PSP operator runs the company book. Field staff register stops. A customer checks a bill with a phone number, and does not pay to look.</p>
    <div class="roles">
      <button class="role" data-role="operator"><b>PSP operator</b><span>Customers, bills, balances, import and notices.</span></button>
      <button class="role" data-role="staff"><b>Field staff</b><span>Register a customer and record today's collection.</span></button>
      <button class="role" data-role="customer"><b>Customer</b><span>See what was billed and what is still owed.</span></button>
    </div>`);
  app.querySelectorAll("[data-role]").forEach((b) => b.addEventListener("click", () => {
    state.role = b.dataset.role; save(); draw();
  }));
}

function askBox() {
  const hints = state.role === "staff"
    ? ["Register a stop", "Record a collection", "Find a customer"]
    : ["Who still owes?", "Register a customer", "Import a notebook", "Tell a customer what they owe"];
  return `<form class="bar" id="askform">
      <input class="ask" id="ask" placeholder="What do you need? Try “who owes” or “register”" autocomplete="off">
      <button class="btn" type="submit">Go</button>
    </form>
    <div class="suggest">${hints.map((h) => `<button type="button" data-ask="${h}">${h}</button>`).join("")}</div>`;
}

function desk() {
  const operator = state.role === "operator";
  const billed = state.bills.reduce((s, b) => s + b.amount, 0);
  const paid = state.bills.reduce((s, b) => s + b.paid, 0);
  const outstanding = state.customers.reduce((s, c) => s + owe(c.id), 0);
  shell(`
    <p class="free" style="background:#f3ead7">Signed in as ${operator ? "PSP operator" : "field staff"} · free feedback build</p>
    <h1>${operator ? "The company book" : "Today's route"}</h1>
    <p class="lede">${operator ? "See who is served, what was collected, and what is still owed." : "Add a stop or mark a collection. The operator sees it on this same device."}</p>
    ${askBox()}
    <div class="metrics">
      <article class="card metric"><span>Customers</span><b>${state.customers.length}</b></article>
      <article class="card metric"><span>Billed</span><b>${money(billed)}</b></article>
      <article class="card metric"><span>Collected</span><b>${money(paid)}</b></article>
      <article class="card metric"><span>Outstanding</span><b>${money(outstanding)}</b></article>
    </div>
    <div class="tabs" id="tabs">
      <button class="on" data-tab="book">Customers</button>
      <button data-tab="add">Register</button>
      <button data-tab="pick">Collection</button>
      ${operator ? `<button data-tab="pay">Payment</button><button data-tab="note">Notice</button><button data-tab="import">Import</button><button data-tab="feedback">Feedback</button>` : `<button data-tab="feedback">Feedback</button>`}
    </div>
    <div id="panel"></div>`);
  bindAsk();
  showTab("book");
  app.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
    app.querySelectorAll("[data-tab]").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    showTab(b.dataset.tab);
  }));
}

function bindAsk() {
  const go = (q) => {
    const t = q.toLowerCase();
    const tab = /import|notebook|csv/.test(t) ? "import" : /notice|owe message|tell/.test(t) ? "note" : /pay|balance/.test(t) ? "pay" : /collect|pickup|bin/.test(t) ? "pick" : /register|stop|new customer|add/.test(t) ? "add" : /feedback|idea/.test(t) ? "feedback" : "book";
    const btn = app.querySelector(`[data-tab="${tab}"]`) || app.querySelector(`[data-tab="book"]`);
    btn?.click();
    if (/owe/.test(t)) {
      const sel = app.querySelector("#status");
      if (sel) { sel.value = "owing"; sel.dispatchEvent(new Event("input")); }
    }
  };
  app.querySelector("#askform")?.addEventListener("submit", (e) => { e.preventDefault(); go(app.querySelector("#ask").value); });
  app.querySelectorAll("[data-ask]").forEach((b) => b.addEventListener("click", () => go(b.dataset.ask)));
}

function showTab(tab) {
  const panel = app.querySelector("#panel");
  if (tab === "book") panel.innerHTML = bookPanel();
  if (tab === "add") panel.innerHTML = registerPanel();
  if (tab === "pick") panel.innerHTML = collectionPanel();
  if (tab === "pay") panel.innerHTML = payPanel();
  if (tab === "note") panel.innerHTML = noticePanel();
  if (tab === "import") panel.innerHTML = importPanel();
  if (tab === "feedback") panel.innerHTML = feedbackPanel();
  wire(tab);
}

function bookPanel() {
  return `<article class="card">
    <div class="bar"><input id="q" placeholder="Search name, phone or area"><select id="status"><option value="">All balances</option><option value="owing">Owing</option><option value="paid">Settled</option></select></div>
    <div style="overflow:auto"><table><thead><tr><th>Customer</th><th>Phone</th><th>Place</th><th>Owed</th><th>Status</th></tr></thead><tbody id="rows"></tbody></table></div>
  </article>`;
}
function paintRows() {
  const q = (app.querySelector("#q")?.value || "").toLowerCase();
  const st = app.querySelector("#status")?.value || "";
  const rows = state.customers.filter((c) => {
    const hit = `${c.name} ${c.phone} ${c.area} ${c.location}`.toLowerCase().includes(q);
    const due = owe(c.id);
    return hit && (!st || (st === "owing" ? due > 0 : due === 0));
  });
  app.querySelector("#rows").innerHTML = rows.map((c) => `<tr><td>${esc(c.name)}<div style="color:#5d6b63">${esc(c.plan)}</div></td><td>${esc(c.phone)}</td><td>${esc(c.location)}, ${esc(c.area)}</td><td>${money(owe(c.id))}</td><td><span class="pill ${owe(c.id) ? "bad" : "ok"}">${owe(c.id) ? "Owing" : "Settled"}</span></td></tr>`).join("") || `<tr><td colspan="5">No matching customers.</td></tr>`;
}
function registerPanel() {
  return `<form class="card stack" id="reg">
    <label>Full name<input name="name" required></label>
    <label>Phone<input name="phone" placeholder="08012345678" required></label>
    <label>Email, optional<input name="email"></label>
    <label>Street<input name="location" required></label>
    <label>Area<input name="area" placeholder="Ikeja" required></label>
    <label>Monthly bill, optional<input name="bill" type="number" min="0" step="100"></label>
    <label>Note for the next crew<textarea name="notes"></textarea></label>
    <p class="err" id="err"></p><p class="okmsg" id="ok"></p>
    <button class="btn" type="submit">Save customer</button>
  </form>`;
}
function collectionPanel() {
  const opts = state.customers.map((c) => `<option value="${c.id}">${esc(c.name)} · ${esc(c.area)}</option>`).join("");
  return `<form class="card stack" id="col">
    <label>Customer<select name="customerId">${opts}</select></label>
    <label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
    <label>Waste type<input name="wasteType" value="Household mixed"></label>
    <label>Bins<input name="bins" type="number" min="1" value="1"></label>
    <label>Status<select name="status"><option>completed</option><option>missed</option><option>rescheduled</option></select></label>
    <p class="err" id="err"></p><p class="okmsg" id="ok"></p>
    <button class="btn" type="submit">Record collection</button>
  </form>
  <article class="card" style="margin-top:12px">${state.collections.slice(0, 6).map((c) => `<p>${c.date} · ${esc(customer(c.customerId)?.name || "")} · ${esc(c.wasteType)} · ${c.bins} bins · ${c.status}</p>`).join("") || "No collections yet."}</article>`;
}
function payPanel() {
  const open = state.bills.filter((b) => b.amount > b.paid);
  return `<form class="card stack" id="pay">
    <label>Open bill<select name="billId">${open.map((b) => `<option value="${b.id}">${esc(customer(b.customerId)?.name)} · ${b.period} · due ${money(b.amount - b.paid)}</option>`).join("") || `<option value="">No open bills</option>`}</select></label>
    <label>Amount received<input name="amount" type="number" min="1" step="100"></label>
    <p class="err" id="err"></p><p class="okmsg" id="ok"></p>
    <button class="btn" type="submit">Apply payment</button>
  </form>`;
}
function noticePanel() {
  const opts = state.customers.map((c) => `<option value="${c.id}">${esc(c.name)} · owed ${money(owe(c.id))}</option>`).join("");
  return `<form class="card stack" id="note">
    <label>Customer<select name="customerId">${opts}</select></label>
    <label>Channel<select name="channel"><option value="phone">Phone</option><option value="email">Email</option></select></label>
    <label>Message<textarea name="message">Your outstanding waste bill is ready. Reply with a payment date.</textarea></label>
    <p class="err" id="err"></p><p class="okmsg" id="ok"></p>
    <button class="btn" type="submit">Queue notice</button>
    <p style="color:#5d6b63;font-size:13px">Queued on this device. Sending by SMS or email comes after feedback.</p>
  </form>`;
}
function importPanel() {
  return `<article class="card stack">
    <p>Columns: name, phone, email, location, area, plan, monthly_bill. Email may be blank.</p>
    <p><a href="sample-customers.csv">Download a sample file</a></p>
    <input id="csv" type="file" accept=".csv,text/csv">
    <p class="err" id="err"></p><p class="okmsg" id="ok"></p>
  </article>`;
}
function feedbackPanel() {
  return `<form class="card stack" id="fb">
    <label>Your name<input name="name" value="${esc(state.who)}"></label>
    <label>What should we fix or keep?<textarea name="message" required></textarea></label>
    <p class="okmsg" id="ok"></p>
    <button class="btn" type="submit">Send feedback</button>
  </form>
  <article class="card" style="margin-top:12px">${state.feedback.map((f) => `<p><b>${esc(f.role)}</b> · ${esc(f.message)}</p>`).join("") || "No feedback yet."}</article>`;
}

function wire(tab) {
  if (tab === "book") {
    paintRows();
    ["q", "status"].forEach((id) => app.querySelector("#" + id)?.addEventListener("input", paintRows));
  }
  app.querySelector("#reg")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const err = check(f);
    setMsg(err, err ? null : `${f.name.trim()} is on the book.`);
    if (err) return;
    const id = uid();
    state.customers.unshift({ id, name: f.name.trim(), phone: norm(f.phone), email: f.email.trim(), location: f.location.trim(), area: f.area.trim(), plan: "Weekly household", notes: f.notes.trim(), status: "active" });
    if (Number(f.bill) > 0) state.bills.unshift({ id: uid(), customerId: id, period, amount: Number(f.bill), paid: 0 });
    save(); e.target.reset();
  });
  app.querySelector("#col")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (!f.customerId || Number(f.bins) < 1) return setMsg("Choose a customer and at least one bin.");
    state.collections.unshift({ id: uid(), ...f, bins: Number(f.bins), staff: state.role });
    save(); setMsg(null, "Collection recorded.");
  });
  app.querySelector("#pay")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const bill = state.bills.find((b) => b.id === f.billId);
    const amount = Number(f.amount);
    if (!bill) return setMsg("No open bill selected.");
    if (!amount || amount <= 0) return setMsg("Enter a payment greater than zero.");
    if (amount > bill.amount - bill.paid) return setMsg("That is more than the outstanding balance.");
    bill.paid += amount; save(); setMsg(null, "Payment applied.");
  });
  app.querySelector("#note")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const c = customer(f.customerId);
    if (f.channel === "email" && !c.email) return setMsg("No email on this record. Use phone.");
    if (!f.message.trim()) return setMsg("Write the notice first.");
    state.notices.unshift({ id: uid(), customerId: c.id, channel: f.channel, message: f.message.trim(), status: "queued" });
    save(); setMsg(null, "Notice queued.");
  });
  app.querySelector("#csv")?.addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
    const headers = head.split(",").map((h) => h.trim().toLowerCase());
    let added = 0; const skipped = [];
    lines.forEach((line, i) => {
      const cols = line.split(",");
      const row = Object.fromEntries(headers.map((h, n) => [h, (cols[n] || "").trim()]));
      const err = check(row);
      if (err) skipped.push(`row ${i + 2}`);
      else {
        const id = uid();
        state.customers.push({ id, name: row.name, phone: norm(row.phone), email: row.email || "", location: row.location, area: row.area || row.location, plan: row.plan || "Weekly household", notes: "Imported.", status: "active" });
        if (Number(row.monthly_bill) > 0) state.bills.push({ id: uid(), customerId: id, period, amount: Number(row.monthly_bill), paid: 0 });
        added++;
      }
    });
    save(); setMsg(null, `${added} imported.${skipped.length ? " Skipped " + skipped.slice(0, 6).join(", ") : ""}`);
  });
  app.querySelector("#fb")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    state.who = f.name.trim();
    state.feedback.unshift({ role: state.role, name: state.who, message: f.message.trim() });
    save(); setMsg(null, "Thank you. This stays on this device for the operator to read.");
    e.target.reset();
  });
}

function check(r) {
  if (!r.name || r.name.trim().length < 2) return "Enter the customer's full name.";
  if (!phoneOk(r.phone || "")) return "Enter a valid Nigerian phone number.";
  if (!emailOk((r.email || "").trim())) return "Email is optional, but this one is not valid.";
  if (!(r.location || "").trim() || !(r.area || r.location || "").trim()) return "Location and area are required.";
  if (state.customers.some((c) => norm(c.phone) === norm(r.phone))) return "That phone is already on the book.";
  return "";
}
function setMsg(err, ok) {
  const e = app.querySelector("#err"); const o = app.querySelector("#ok");
  if (e) e.textContent = err || "";
  if (o) o.textContent = ok || "";
}
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """ }[c])); }

function customerView() {
  shell(`
    <h1>Your bill</h1>
    <p class="lede">Free to view. Use the phone number on the waste company's record. This does not take a payment.</p>
    <form class="card stack" id="look">
      <label>Phone number<input name="phone" placeholder="08031234567" required></label>
      <p class="err" id="err"></p>
      <button class="btn" type="submit">Show my record</button>
    </form>
    <div id="bill"></div>
    <form class="card stack" id="fb" style="margin-top:14px">
      <label>Feedback for Idoti<textarea name="message" placeholder="Was this clear?"></textarea></label>
      <button class="btn ghost" type="submit">Leave feedback</button>
      <p class="okmsg" id="ok"></p>
    </form>`);
  app.querySelector("#look").addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = norm(new FormData(e.target).get("phone"));
    const c = state.customers.find((x) => norm(x.phone) === phone);
    app.querySelector("#err").textContent = c ? "" : "No record uses that phone number.";
    app.querySelector("#bill").innerHTML = c ? `<article class="card" style="margin-top:12px"><h2>${esc(c.name)}</h2><p>${esc(c.location)}, ${esc(c.area)}</p><p>Outstanding ${money(owe(c.id))}</p>${state.bills.filter((b) => b.customerId === c.id).map((b) => `<p>${b.period} · billed ${money(b.amount)} · paid ${money(b.paid)} · due ${money(b.amount - b.paid)}</p>`).join("")}</article>` : "";
  });
  app.querySelector("#fb").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = new FormData(e.target).get("message").trim();
    if (!message) return;
    state.feedback.unshift({ role: "customer", name: "Customer", message });
    save(); app.querySelector("#ok").textContent = "Received. Thank you.";
  });
}

draw();
