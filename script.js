/* 
  Member 5: Data Analyst & Testing -> Scenarios & Comparative Analysis
  Key Tasks: Scenario preparation (A, B, C), Comparison Tables, fair workload verification.
*/
const PAL = [
  '#e74c3c', '#2980b9', '#27ae60', '#f39c12', '#8e44ad',
  '#16a085', '#d35400', '#2c3e50', '#c0392b', '#1a5276'
];

// ─── STATE ──────────────────────────────────────────────────────────────
let procs = [];
let pidCounter = 1;

// ─── SCENARIOS ──────────────────────────────────────────────────────────
const SC = {
  A: { prule:'lower', procs:[
    {at:0, bt:8, pri:3},
    {at:1, bt:4, pri:1},
    {at:2, bt:9, pri:4},
    {at:3, bt:5, pri:2},
    {at:5, bt:2, pri:5},
  ]},
  B: { prule:'lower', procs:[
    {at:0, bt:12, pri:1},
    {at:2, bt:2,  pri:4},
    {at:3, bt:3,  pri:3},
    {at:5, bt:1,  pri:5},
  ]},
  C: { prule:'lower', procs:[
    {at:0, bt:3, pri:1},
    {at:1, bt:3, pri:1},
    {at:2, bt:3, pri:1},
    {at:0, bt:25, pri:5},
    {at:4, bt:3, pri:1},
  ]},
  D: { prule:'lower', procs:[
    {at:0,  bt:5,  pri:2.7},
    {at:0,  bt:0,  pri:1},
    {at:-1, bt:4,  pri:3},
    {at:2,  bt:6,  pri:2},
  ]}
};

function loadSc(id, btn) {
  const s = SC[id];
  procs = []; pidCounter = 1;
  s.procs.forEach(p => procs.push({ id: pidCounter++, ...p }));
  renderTable();
  document.getElementById('results').style.display = 'none';
  document.getElementById('error-msg').innerText = '';
}

// ─── TABLE ──────────────────────────────────────────────────────────────
// ─── MEMBER 1: UI/UX Developer -> Input Panel Logic ──────────────────
function addProc() {
  procs.push({ id: pidCounter++, at: 0, bt: 5, pri: 1 });
  renderTable();
  maybeRun();
}

function removeProc(idx) {
  procs.splice(idx, 1);
  renderTable();
  maybeRun();
}

function clearAll() {
  procs = [];
  pidCounter = 1;
  renderTable();
  document.getElementById('results').style.display = 'none';
  document.getElementById('error-msg').innerText = '';
}

function renderTable() {
  const tb = document.getElementById('ptbody');
  if (procs.length === 0) {
    tb.innerHTML = '<tr><td colspan="6" style="color:#999;">No processes added yet.</td></tr>';
    return;
  }
  tb.innerHTML = '';
  procs.forEach((p, i) => {
    const c = PAL[i % PAL.length];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="clr" style="background:${c}"></span></td>
      <td><input type="number" value="${p.id}"  onchange="upd(${i},'id',this.value)"  id="id-${p.id}" style="width:60px;"></td>
      <td><input type="number" value="${p.at}"  onchange="upd(${i},'at',this.value)"  id="at-${p.id}"></td>
      <td><input type="number" value="${p.bt}"  onchange="upd(${i},'bt',this.value)"  id="bt-${p.id}"></td>
      <td><input type="number" value="${p.pri}" onchange="upd(${i},'pri',this.value)" id="pri-${p.id}"></td>
      <td><button class="del-btn" onclick="removeProc(${i})">\u00d7</button></td>
    `;
    tb.appendChild(tr);
  });
}

function upd(idx, field, val) {
  const p = procs[idx];
  if (p) {
    if (val === "") {
      p[field] = NaN;
    } else {
      const num = Number(val);
      if (!Number.isInteger(num)) {
        p[field] = 0.5; // Trigger validation
      } else {
        p[field] = num;
      }
    }
  }
  maybeRun();
}

function maybeRun() {
  if (document.getElementById('results').style.display === 'block') {
    const errs = validate();
    if (errs.length === 0) runSim();
  }
}

// ─── MEMBER 4: Gantt Chart & Validation -> Input Validation ──────────
function validate() {
  const errs = [];
  document.querySelectorAll('#ptbody input').forEach(el => el.classList.remove('err'));
  if (procs.length < 2) { errs.push('Need at least 2 processes.'); return errs; }

  const pidSet = new Set();
  procs.forEach((p, i) => {
    const row = document.getElementById('ptbody').rows[i];
    const inputs = row.querySelectorAll('input');
    const elId = inputs[0], elAt = inputs[1], elBt = inputs[2], elPri = inputs[3];

    if (isNaN(p.id) || !Number.isInteger(p.id) || p.id < 1) {
      errs.push(`PID must be a positive integer \u2265 1.`);
      if (elId) elId.classList.add('err');
    }
    if (pidSet.has(p.id)) {
      errs.push(`Duplicate PID detected: ${p.id}`);
      if (elId) elId.classList.add('err');
    }
    pidSet.add(p.id);

    if (isNaN(p.at)) {
      errs.push(`Process ${i + 1}: Arrival Time is missing or invalid.`);
      if (elAt) elAt.classList.add('err');
    } else if (!Number.isInteger(p.at) || p.at < 0) {
      errs.push(`Process ${i + 1}: Arrival Time must be a non-negative integer.`);
      if (elAt) elAt.classList.add('err');
    }

    if (isNaN(p.bt)) {
      errs.push(`Process ${i + 1}: Burst Time is missing or invalid.`);
      if (elBt) elBt.classList.add('err');
    } else if (!Number.isInteger(p.bt) || p.bt < 1) {
      errs.push(`Process ${i + 1}: Burst Time must be a positive integer \u2265 1.`);
      if (elBt) elBt.classList.add('err');
    }

    if (isNaN(p.pri)) {
      errs.push(`Process ${i + 1}: Priority is missing or invalid.`);
      if (elPri) elPri.classList.add('err');
    } else if (!Number.isInteger(p.pri) || p.pri < 1) {
      errs.push(`Process ${i + 1}: Priority must be a positive integer \u2265 1.`);
      if (elPri) elPri.classList.add('err');
    }
  });
  return errs;
}

// ─── MEMBER 2: Priority Scheduling -> Preemptive Priority Logic ───────
function simPriority(ps, rule, tieRule) {
  const rem = {}, ft = {}, wt = {}, tat = {}, rt = {}, first = {};
  const gantt = [];
  const done = new Set();
  ps.forEach(p => rem[p.id] = p.bt);

  let t = 0;
  let last = null;
  const totalBT = ps.reduce((s, p) => s + p.bt, 0);
  const maxT = totalBT + Math.max(...ps.map(p => p.at)) + 100;

  while (done.size < ps.length && t < maxT) {
    const avail = ps.filter(p => p.at <= t && !done.has(p.id));

    if (!avail.length) {
      const remaining = ps.filter(p => !done.has(p.id));
      const nextAt = Math.min(...remaining.map(p => p.at));
      if (gantt.length && gantt[gantt.length - 1].pid === 'idle') {
        gantt[gantt.length - 1].end = nextAt;
      } else {
        gantt.push({ pid: 'idle', start: t, end: nextAt });
      }
      t = nextAt;
      last = null;
      continue;
    }

    avail.sort((a, b) => {
      const pa = rule === 'lower' ? a.pri : -a.pri;
      const pb = rule === 'lower' ? b.pri : -b.pri;
      if (pa !== pb) return pa - pb;
      // Tie-breaking: FCFS based on Arrival Time
      if (tieRule === 'fcfs') {
        if (a.at !== b.at) return a.at - b.at;
      }
      return a.id - b.id;
    });

    const p = avail[0];
    if (!(p.id in first)) first[p.id] = t;

    if (last !== p.id) {
      gantt.push({ pid: p.id, start: t, end: t + 1 });
      last = p.id;
    } else {
      gantt[gantt.length - 1].end++;
    }

    rem[p.id]--;
    t++;

    if (rem[p.id] === 0) {
      ft[p.id] = t;
      done.add(p.id);
      last = null;
    }
  }

  // Merge contiguous segments for better visualization
  const merged = [];
  gantt.forEach(seg => {
    if (merged.length && merged[merged.length - 1].pid === seg.pid && merged[merged.length - 1].end === seg.start) {
      merged[merged.length - 1].end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  });

  ps.forEach(p => {
    rt[p.id] = first[p.id] - p.at;
    tat[p.id] = ft[p.id] - p.at;
    wt[p.id] = tat[p.id] - p.bt;
  });

  return { gantt: merged, ft, wt, tat, rt };
}

// ─── MEMBER 3: SRTF -> Shortest Remaining Time First Logic ────────────
function simSRTF(ps) {
  const rem = {}, ft = {}, wt = {}, tat = {}, rt = {};
  const first = {}; const gantt = [];
  ps.forEach(p => rem[p.id] = p.bt);
  let t = 0; const done = new Set(); let last = null;
  let maxT = ps.reduce((s, p) => s + p.bt, 0) + Math.max(...ps.map(p => p.at)) + 10;
  while (done.size < ps.length && t <= maxT) {
    const avail = ps.filter(p => p.at <= t && !done.has(p.id));
    if (!avail.length) {
      const nextAt = Math.min(...ps.filter(p => !done.has(p.id)).map(p => p.at));
      if (gantt.length && gantt[gantt.length - 1].pid === 'idle') gantt[gantt.length - 1].end = nextAt;
      else gantt.push({ pid: 'idle', start: t, end: nextAt });
      t = nextAt; last = null; continue;
    }
    avail.sort((a, b) => rem[a.id] - rem[b.id] || a.at - b.at || a.id - b.id);
    const p = avail[0];
    if (!(p.id in first)) first[p.id] = t;
    if (last !== p.id) { gantt.push({ pid: p.id, start: t, end: t + 1 }); last = p.id; }
    else { gantt[gantt.length - 1].end++; }
    rem[p.id]--; t++;
    if (rem[p.id] === 0) { ft[p.id] = t; done.add(p.id); }
  }
  const merged = [];
  gantt.forEach(seg => {
    if (merged.length && merged[merged.length - 1].pid === seg.pid && merged[merged.length - 1].end === seg.start) merged[merged.length - 1].end = seg.end;
    else merged.push({ ...seg });
  });
  ps.forEach(p => { rt[p.id] = first[p.id] - p.at; tat[p.id] = ft[p.id] - p.at; wt[p.id] = tat[p.id] - p.bt; });
  return { gantt: merged, ft, wt, tat, rt };
}

// ─── MEMBER 4: Gantt Chart -> Visualization Logic ──────────────────
function renderGantt(gantt, ps, barId, ticksId, legId) {
  const bar = document.getElementById(barId);
  const tksEl = document.getElementById(ticksId);
  const legEl = document.getElementById(legId);
  bar.innerHTML = tksEl.innerHTML = legEl.innerHTML = '';
  const colors = {};
  ps.forEach((p, i) => colors[p.id] = PAL[i % PAL.length]);
  const total = gantt[gantt.length - 1].end;
  const scale = Math.max(30, Math.min(60, 800 / total));
  let ticks = new Set();
  gantt.forEach(s => { ticks.add(s.start); ticks.add(s.end); });
  ticks = [...ticks].sort((a, b) => a - b);
  gantt.forEach(seg => {
    const w = (seg.end - seg.start) * scale;
    const d = document.createElement('div');
    d.className = 'gantt-block' + (seg.pid === 'idle' ? ' idle' : '');
    d.style.width = w + 'px';
    if (seg.pid !== 'idle') d.style.backgroundColor = colors[seg.pid];
    d.textContent = seg.pid !== 'idle' ? seg.pid : '';
    bar.appendChild(d);
  });
  tksEl.style.width = (total * scale) + 'px';
  ticks.forEach(t => {
    const sp = document.createElement('span');
    sp.className = 'timeline-tick';
    sp.style.left = (t * scale) + 'px';
    sp.style.direction = 'ltr';
    sp.setAttribute('lang', 'en');
    sp.style.fontFamily = 'Arial, sans-serif';
    sp.textContent = t.toString();

    // Prevent clipping of the first tick by overflow-x: auto
    if (t === 0) {
      sp.style.transform = 'translateX(0)';
    }

    tksEl.appendChild(sp);
  });
  ps.forEach((p, i) => {
    const li = document.createElement('div');
    li.className = 'legend-item';
    li.innerHTML = `<span class="clr" style="background:${colors[p.id]}"></span>PID ${p.id} (pri:${p.pri}, bt:${p.bt})`;
    legEl.appendChild(li);
  });
}

// ─── MEMBER 1: UI/UX Developer -> Metric Results Table Rendering ─────
function renderRTable(tableId, ps, res) {
  const tbl = document.getElementById(tableId);
  tbl.innerHTML = `<thead><tr>
    <th>PID</th><th>AT</th><th>BT</th><th>Pri</th>
    <th>FT</th><th>WT</th><th>TAT</th><th>RT</th>
  </tr></thead>`;
  const tb = document.createElement('tbody');
  let sWT = 0, sTAT = 0, sRT = 0;
  ps.forEach(p => {
    sWT += res.wt[p.id]; sTAT += res.tat[p.id]; sRT += res.rt[p.id];
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${p.id}</strong></td><td>${p.at}</td><td>${p.bt}</td><td>${p.pri}</td>
      <td>${res.ft[p.id]}</td><td>${res.wt[p.id]}</td><td>${res.tat[p.id]}</td><td>${res.rt[p.id]}</td>`;
    tb.appendChild(tr);
  });
  const n = ps.length;
  const aWT = (sWT / n).toFixed(2), aTAT = (sTAT / n).toFixed(2), aRT = (sRT / n).toFixed(2);
  const ar = document.createElement('tr');
  ar.style.background = '#f1f2f6'; ar.style.fontWeight = 'bold';
  ar.innerHTML = `<td colspan="4">Average</td><td>\u2014</td><td>${aWT}</td><td>${aTAT}</td><td>${aRT}</td>`;
  tb.appendChild(ar); tbl.appendChild(tb);
  return { avgWT: +aWT, avgTAT: +aTAT, avgRT: +aRT };
}

// ─── MEMBER 5: Data Analyst -> Comparative Analysis Results Rendering ─
function renderCompare(ps, prAvg, sfAvg, prRes, sfRes) {
  const grid = document.getElementById('cmp-grid');
  grid.innerHTML = '';
  const metrics = [
    { lbl: 'AVG WAITING TIME', pr: prAvg.avgWT, sf: sfAvg.avgWT },
    { lbl: 'AVG TURNAROUND TIME', pr: prAvg.avgTAT, sf: sfAvg.avgTAT },
    { lbl: 'AVG RESPONSE TIME', pr: prAvg.avgRT, sf: sfAvg.avgRT },
  ];
  metrics.forEach(m => {
    const prWins = m.pr <= m.sf;
    const total = m.pr + m.sf || 1;
    const prPct = Math.round(m.sf / total * 100);
    const card = document.createElement('div');
    card.className = 'cmp-card';
    card.innerHTML = `
      <div class="cc-lbl">${m.lbl}</div>
      <div class="cc-row"><span class="cc-name">Priority</span><span class="cc-num cc-pr">${m.pr.toFixed(2)}${prWins ? ' \u2713' : ''}</span></div>
      <div class="cc-row"><span class="cc-name">SRTF</span><span class="cc-num cc-sf">${m.sf.toFixed(2)}${!prWins ? ' \u2713' : ''}</span></div>
      <div class="cc-bar">
        <div class="cc-bar-pr" style="width:${prPct}%"></div>
        <div class="cc-bar-sf" style="width:${100 - prPct}%"></div>
      </div>
      <div class="cc-winner">${prWins ? 'Priority wins' : 'SRTF wins'}</div>
    `;
    grid.appendChild(card);
  });
  const wtDiv = document.getElementById('wt-bars');
  wtDiv.innerHTML = '';
  const maxW = Math.max(...ps.map(p => Math.max(prRes.wt[p.id], sfRes.wt[p.id])), 1);
  ps.forEach((p, i) => {
    const c = PAL[i % PAL.length];
    const prW = prRes.wt[p.id], sfW = sfRes.wt[p.id];
    const row = document.createElement('div');
    row.className = 'wt-row';
    row.innerHTML = `
      <div class="wt-name"><span class="clr" style="background:${c}"></span>PID ${p.id}</div>
      <div class="wt-bar-row"><span class="wt-label" style="color:#c0392b">PR</span><div class="wt-track"><div class="wt-fill" style="width:${Math.round(prW / maxW * 100)}%;background:#e74c3c"></div></div><span class="wt-val" style="color:#c0392b">${prW}</span></div>
      <div class="wt-bar-row"><span class="wt-label" style="color:#1a5c8a">SF</span><div class="wt-track"><div class="wt-fill" style="width:${Math.round(sfW / maxW * 100)}%;background:#2980b9"></div></div><span class="wt-val" style="color:#1a5c8a">${sfW}</span></div>
    `;
    wtDiv.appendChild(row);
  });
}

// ─── ANALYSIS RENDER ─────────────────────────────────────────────────────
// ─── MEMBER 6: Technical Writer & QA -> Analysis Questions & Conclusion ─
function stdDev(arr) {
  const m = arr.reduce((s, v) => s + v, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function renderAnalysis(ps, prRes, sfRes, prAvg, sfAvg, rule) {
  const ctr = document.getElementById('aq-container');
  ctr.innerHTML = '';
  const prWTs = ps.map(p => prRes.wt[p.id]);
  const prMean = prAvg.avgWT;
  const prMax = Math.max(...prWTs);
  const threshold = parseFloat(document.getElementById('starv-threshold')?.value ?? 2.5);
  const starvation = prMax > prMean * threshold && ps.length > 2;
  const hiPriP = rule === 'lower' ? ps.reduce((b, p) => p.pri < b.pri ? p : b) : ps.reduce((b, p) => p.pri > b.pri ? p : b);
  const loPriP = rule === 'lower' ? ps.reduce((b, p) => p.pri > b.pri ? p : b) : ps.reduce((b, p) => p.pri < b.pri ? p : b);
  const shortP = ps.reduce((b, p) => p.bt < b.bt ? p : b);

  const q3Yes = prRes.rt[hiPriP.id] <= sfRes.rt[hiPriP.id];
  const q4Yes = sfRes.ft[shortP.id] <= prRes.ft[shortP.id];

  const qs = [
    { q: 'Which algorithm produced the lower average waiting time?', a: prAvg.avgWT <= sfAvg.avgWT ? `Priority Scheduling (${prAvg.avgWT.toFixed(2)})` : `SRTF (${sfAvg.avgWT.toFixed(2)})` },
    { q: 'Which algorithm produced the lower average response time?', a: prAvg.avgRT <= sfAvg.avgRT ? `Priority Scheduling (${prAvg.avgRT.toFixed(2)})` : `SRTF (${sfAvg.avgRT.toFixed(2)})` },
    { q: 'Did priority values improve treatment of urgent processes?', a: `${q3Yes ? 'YES' : 'NO'}. PID ${hiPriP.id} (Priority ${hiPriP.pri}) had a Response Time of ${prRes.rt[hiPriP.id]} in Priority vs ${sfRes.rt[hiPriP.id]} in SRTF.` },
    { q: 'Did SRTF favor short jobs more aggressively?', a: `${q4Yes ? 'YES' : 'NO'}. PID ${shortP.id} (Burst ${shortP.bt}) finished at T=${sfRes.ft[shortP.id]} in SRTF vs T=${prRes.ft[shortP.id]} in Priority.` },
    { q: 'Which algorithm would you recommend for this workload, and why?', a: starvation ? `SRTF is recommended to avoid the starvation of PID ${loPriP.id}.` : `Priority is recommended if "urgent" tasks must be guaranteed immediate CPU access.` }
  ];

  qs.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'aq-card';
    card.innerHTML = `
      <div class="aq-num">Q${i + 1}</div>
      <div class="aq-content">
        <div class="aq-q">${item.q}</div>
        <div class="aq-a">${item.a}</div>
      </div>
    `;
    ctr.appendChild(card);
  });

  const conc = document.getElementById('conc-card');
  const winA = prAvg.avgWT <= sfAvg.avgWT ? 'Priority' : 'SRTF';
  conc.innerHTML = `
    <h3>SIMULATION CONCLUSION</h3>
    <div class="conc-item">
      <span class="conc-arrow">\u2192</span>
      <span><strong>Efficiency:</strong> In this scenario, <strong>${winA}</strong> was more efficient in terms of average waiting time.</span>
    </div>
    <div class="conc-item">
      <span class="conc-arrow">\u2192</span>
      <span><strong>Fairness:</strong> SRTF appeared fairer to shorter tasks, while Priority was "fairer" to urgent tasks but risked <strong>Starvation</strong>.</span>
    </div>
    <div class="conc-item">
      <span class="conc-arrow">\u2192</span>
      <span><strong>Trade-off:</strong> The main trade-off observed is <strong>Policy-driven Urgency</strong> (Priority) versus <strong>Shortest-job Efficiency</strong> (SRTF).</span>
    </div>
  `;
  const warn = document.getElementById('pr-starv');
  if (starvation) warn.classList.add('show'); else warn.classList.remove('show');
}

function runSim() {
  const errMsg = document.getElementById('error-msg');
  const errs = validate();
  if (errs.length) { errMsg.innerHTML = errs.join('<br>'); return; }
  errMsg.innerHTML = '';

  const rule = 'lower';
  const tieRule = 'fcfs';
  const prRes = simPriority(procs, rule, tieRule);
  const sfRes = simSRTF(procs);

  document.getElementById('pr-rule-lbl').textContent = `lower pri wins \u00b7 tie: FCFS`;
  renderGantt(prRes.gantt, procs, 'pr-gantt', 'pr-ticks', 'pr-leg');
  renderGantt(sfRes.gantt, procs, 'sf-gantt', 'sf-ticks', 'sf-leg');

  const prAvg = renderRTable('pr-rtable', procs, prRes);
  const sfAvg = renderRTable('sf-rtable', procs, sfRes);
  renderCompare(procs, prAvg, sfAvg, prRes, sfRes);
  renderAnalysis(procs, prRes, sfRes, prAvg, sfAvg, rule);

  document.getElementById('results').style.display = 'block';
}

function goTab(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
}

renderTable();

document.getElementById('starv-threshold')?.addEventListener('input', function() {
  const v = parseFloat(this.value).toFixed(1);
  document.getElementById('starv-val').textContent = v + 'x';
  const formula = document.getElementById('starv-formula');
  if (formula) formula.textContent = v + '×';
  maybeRun();
});
