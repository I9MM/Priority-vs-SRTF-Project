function validate() {
  const errs = [];
  document.querySelectorAll('#ptbody input').forEach(el => el.classList.remove('err'));
  if (procs.length < 2) { errs.push('Need at least 2 processes.'); return errs; }
  
  const pidSet = new Set();
  procs.forEach(p => {
    if (!Number.isInteger(p.id) || p.id < 1) { 
      errs.push(`PID must be a positive integer \u2265 1, got: ${p.id}`); 
      const el = document.getElementById(`id-${p.id}`); 
      if (el) el.classList.add('err'); 
    }
    if (pidSet.has(p.id)) { 
      errs.push(`Duplicate PID detected: ${p.id}`); 
      const el = document.getElementById(`id-${p.id}`); 
      if (el) el.classList.add('err'); 
    }
    pidSet.add(p.id);
  });
  
  procs.forEach(p => {
    if (p.at < 0) { errs.push(`PID ${p.id}: Arrival Time cannot be negative.`); const el = document.getElementById(`at-${p.id}`); if (el) el.classList.add('err'); }
    if (!Number.isInteger(p.bt) || p.bt < 1) { errs.push(`PID ${p.id}: Burst Time must be a positive integer \u2265 1.`); const el = document.getElementById(`bt-${p.id}`); if (el) el.classList.add('err'); }
    if (!Number.isInteger(p.pri) || p.pri < 1) { errs.push(`PID ${p.id}: Priority must be a positive integer \u2265 1.`); const el = document.getElementById(`pri-${p.id}`); if (el) el.classList.add('err'); }
  });
  return errs;
}

function renderGantt(gantt, ps, barId, ticksId, legId) {
  const bar = document.getElementById(barId);
  const tksEl = document.getElementById(ticksId);
  const legEl = document.getElementById(legId);
  bar.innerHTML = tksEl.innerHTML = legEl.innerHTML = '';
  const colors = {};
  ps.forEach((p,i) => colors[p.id] = PAL[i%PAL.length]);
  const total = gantt[gantt.length-1].end;
  const scale = Math.max(30, Math.min(60, 800/total));
  let ticks = new Set();
  gantt.forEach(s => { ticks.add(s.start); ticks.add(s.end); });
  ticks = [...ticks].sort((a,b)=>a-b);
  gantt.forEach(seg => {
    const w = (seg.end-seg.start)*scale;
    const d = document.createElement('div');
    d.className = 'gantt-block' + (seg.pid==='idle' ? ' idle' : '');
    d.style.width = w+'px';
    if (seg.pid!=='idle') d.style.backgroundColor = colors[seg.pid];
    d.textContent = seg.pid!=='idle' ? seg.pid : '';
    bar.appendChild(d);
  });
  tksEl.style.width = (total*scale)+'px';
  ticks.forEach(t => {
    const sp = document.createElement('span');
    sp.className = 'timeline-tick';
    sp.style.left = (t*scale)+'px';
    sp.textContent = t;
    tksEl.appendChild(sp);
  });
  ps.forEach((p,i) => {
    const li = document.createElement('div');
    li.className = 'legend-item';
    li.innerHTML = `<span class="clr" style="background:${colors[p.id]}"></span>PID ${p.id} (pri:${p.pri}, bt:${p.bt})`;
    legEl.appendChild(li);
  });
}
// ─── MEMBER 4: Gantt Chart & Validation -> Input Validation ──────────
function validate() {
  const errs = [];
  document.querySelectorAll('#ptbody input').forEach(el => el.classList.remove('err'));
  if (procs.length < 2) { errs.push('Need at least 2 processes.'); return errs; }
  
  const pidSet = new Set();
  procs.forEach(p => {
    if (!Number.isInteger(p.id) || p.id < 1) { 
      errs.push(`PID must be a positive integer \u2265 1, got: ${p.id}`); 
      const el = document.getElementById(`id-${p.id}`); 
      if (el) el.classList.add('err'); 
    }
    if (pidSet.has(p.id)) { 
      errs.push(`Duplicate PID detected: ${p.id}`); 
      const el = document.getElementById(`id-${p.id}`); 
      if (el) el.classList.add('err'); 
    }
    pidSet.add(p.id);
  });
  
  procs.forEach(p => {
    if (p.at < 0) { errs.push(`PID ${p.id}: Arrival Time cannot be negative.`); const el = document.getElementById(`at-${p.id}`); if (el) el.classList.add('err'); }
    if (!Number.isInteger(p.bt) || p.bt < 1) { errs.push(`PID ${p.id}: Burst Time must be a positive integer \u2265 1.`); const el = document.getElementById(`bt-${p.id}`); if (el) el.classList.add('err'); }
    if (!Number.isInteger(p.pri) || p.pri < 1) { errs.push(`PID ${p.id}: Priority must be a positive integer \u2265 1.`); const el = document.getElementById(`pri-${p.id}`); if (el) el.classList.add('err'); }
  });
  return errs;
}


// ─── MEMBER 2: Priority Scheduling -> Preemptive Priority Logic ───────> Michael
function simPriority(ps, rule, tieRule) {
  const rem = {}, ft = {}, wt = {}, tat = {}, rt = {};
  const gantt = [];
  const done = new Set();
  ps.forEach(p => rem[p.id] = p.bt);
  let t = 0, iter = 0, maxIter = ps.reduce((s,p)=>s+p.bt,0)*2+200;
  while (done.size < ps.length && iter++ < maxIter) {
    const avail = ps.filter(p => p.at <= t && !done.has(p.id));
    if (!avail.length) {
      const nextAt = Math.min(...ps.filter(p=>!done.has(p.id)).map(p=>p.at));
      gantt.push({pid:'idle',start:t,end:nextAt}); t = nextAt; continue;
    }
    avail.sort((a,b) => {
      const pa = rule==='lower' ? a.pri : -a.pri;
      const pb = rule==='lower' ? b.pri : -b.pri;
      if (pa!==pb) return pa-pb;
      return tieRule==='fcfs' ? a.at-b.at||a.id-b.id : a.id-b.id;
    });
    const p = avail[0];
    rt[p.id] = t - p.at;
    gantt.push({pid:p.id,start:t,end:t+p.bt});
    t += p.bt; ft[p.id] = t; done.add(p.id);
    tat[p.id] = ft[p.id] - p.at; wt[p.id] = tat[p.id] - p.bt;
  }
  return {gantt,ft,wt,tat,rt};
}

// ─── MEMBER 5: Data Analyst -> Comparative Analysis Results Rendering ──────> Ganna
function renderCompare(ps, prAvg, sfAvg, prRes, sfRes) {
  const grid = document.getElementById('cmp-grid');
  grid.innerHTML = '';
  const metrics = [
    {lbl:'AVG WAITING TIME', pr:prAvg.avgWT, sf:sfAvg.avgWT},
    {lbl:'AVG TURNAROUND TIME', pr:prAvg.avgTAT, sf:sfAvg.avgTAT},
    {lbl:'AVG RESPONSE TIME', pr:prAvg.avgRT, sf:sfAvg.avgRT},
  ];
  metrics.forEach(m => {
    const prWins = m.pr <= m.sf;
    const total = m.pr+m.sf||1;
    const prPct = Math.round(m.sf/total*100);
    const card = document.createElement('div');
    card.className = 'cmp-card';
    card.innerHTML = `
      <div class="cc-lbl">${m.lbl}</div>
      <div class="cc-row"><span class="cc-name">Priority</span><span class="cc-num cc-pr">${m.pr.toFixed(2)}${prWins?' \u2713':''}</span></div>
      <div class="cc-row"><span class="cc-name">SRTF</span><span class="cc-num cc-sf">${m.sf.toFixed(2)}${!prWins?' \u2713':''}</span></div>
      <div class="cc-bar">
        <div class="cc-bar-pr" style="width:${prPct}%"></div>
        <div class="cc-bar-sf" style="width:${100-prPct}%"></div>
      </div>
      <div class="cc-winner">${prWins?'Priority wins':'SRTF wins'}</div>
    `;
    grid.appendChild(card);
  });
  const wtDiv = document.getElementById('wt-bars');
  wtDiv.innerHTML = '';
  const maxW = Math.max(...ps.map(p=>Math.max(prRes.wt[p.id],sfRes.wt[p.id])),1);
  ps.forEach((p,i) => {
    const c = PAL[i%PAL.length];
    const prW = prRes.wt[p.id], sfW = sfRes.wt[p.id];
    const row = document.createElement('div');
    row.className = 'wt-row';
    row.innerHTML = `
      <div class="wt-name"><span class="clr" style="background:${c}"></span>PID ${p.id}</div>
      <div class="wt-bar-row"><span class="wt-label" style="color:#c0392b">PR</span><div class="wt-track"><div class="wt-fill" style="width:${Math.round(prW/maxW*100)}%;background:#e74c3c"></div></div><span class="wt-val" style="color:#c0392b">${prW}</span></div>
      <div class="wt-bar-row"><span class="wt-label" style="color:#1a5c8a">SF</span><div class="wt-track"><div class="wt-fill" style="width:${Math.round(sfW/maxW*100)}%;background:#2980b9"></div></div><span class="wt-val" style="color:#1a5c8a">${sfW}</span></div>
    `;
    wtDiv.appendChild(row);
  });
}


// ─── ANALYSIS RENDER ─────────────────────────────────────────────────────
// ─── MEMBER 6: Technical Writer & QA -> Analysis Questions & Conclusion ─
function stdDev(arr) {
  const m = arr.reduce((s,v)=>s+v,0)/arr.length;
  return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length);
}

function renderAnalysis(ps, prRes, sfRes, prAvg, sfAvg, rule) {
  const ctr = document.getElementById('aq-container');
  ctr.innerHTML = '';
  const prWTs = ps.map(p=>prRes.wt[p.id]);
  const prMean = prAvg.avgWT;
  const prMax = Math.max(...prWTs);
  const starvation = prMax > prMean*2.5 && ps.length > 2;
  const hiPriP = rule==='lower' ? ps.reduce((b,p)=>p.pri<b.pri?p:b) : ps.reduce((b,p)=>p.pri>b.pri?p:b);
  const loPriP = rule==='lower' ? ps.reduce((b,p)=>p.pri>b.pri?p:b) : ps.reduce((b,p)=>p.pri<b.pri?p:b);
  const shortP = ps.reduce((b,p)=>p.bt<b.bt?p:b);

  const qs = [
    {q: 'Which algorithm produced the lower average waiting time?', a: prAvg.avgWT <= sfAvg.avgWT ? `Priority Scheduling (${prAvg.avgWT.toFixed(2)})` : `SRTF (${sfAvg.avgWT.toFixed(2)})`},
    {q: 'Did the Priority algorithm successfully benefit "urgent" processes?', a: `PID ${hiPriP.id} (High Priority) had a Response Time of ${prRes.rt[hiPriP.id]} vs PID ${loPriP.id} which had ${prRes.rt[loPriP.id]}.`},
    {q: 'Which algorithm is better at handling a sudden short process?', a: `SRTF (Preemptive) is better as it can preempt long tasks for short ones. PID ${shortP.id} (Shortest) finished at T=${sfRes.ft[shortP.id]} in SRTF vs T=${prRes.ft[shortP.id]} in Priority.`},
    {q: 'Is there a risk of starvation in the current scenario?', a: starvation ? `YES. PID ${loPriP.id} (Low Priority) waited ${prRes.wt[loPriP.id]} units, significantly longer than average.` : 'NO. Waiting times are relatively balanced.'}
  ];

  qs.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'aq-card';
    card.innerHTML = `
      <div class="aq-num">Q${i+1}</div>
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
      <span>In this specific scenario, <strong>${winA}</strong> was more efficient in terms of average waiting time.</span>
    </div>
    <div class="conc-item">
      <span class="conc-arrow">\u2192</span>
      <span><strong>Priority Scheduling</strong> allowed high-priority tasks to run first but ${starvation?'caused':'risked'} starvation for low-priority ones.</span>
    </div>
    <div class="conc-item">
      <span class="conc-arrow">→</span>
      <span><strong>SRTF</strong> minimized waiting time by always favoring shorter tasks, even if it required preemption.</span>
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
  document.getElementById('page-'+name).classList.add('active');
  if (btn) btn.classList.add('active');
}

function updateTuxMood() {
  const grade = document.getElementById('ta-grade').value;
  const moodContainer = document.getElementById('tux-mood-container');
  const moodText = document.getElementById('tux-mood-text');
  const moodImg = document.getElementById('tux-mood-img');

  if (grade === "") {
    moodText.innerText = "\u0627\u0644\u0628\u0637\u0631\u064a\u0642 Tux \u0641\u064a \u0627\u0646\u062a\u0638\u0627\u0631 \u062a\u0642\u064a\u0645\u0643 \u0644\u064a\u0647 \u064a\u0628\u0645\u0634\u0647\u0646\u062f\u0633/\u0629";
    moodImg.src = "../9171b332c6a0258d4ed3dd104e584eaa.jpg";
    moodContainer.className = "tux-status";
  } else if (grade >= 20) {
    moodText.innerText = "\u0627\u0644\u0628\u0637\u0631\u064a\u0642 TUX \u0634\u0639\u0631 \u0628\u0633\u0639\u0627\u062f\u0629 \u0648\u064a\u0631\u0627\u0643 \u0642\u062f\u0648\u062a\u0647";
    moodImg.src = "../6d4c3664d281859ef39c325565de380f.jpg";
    moodContainer.className = "tux-status happy";
  } else if (grade >= 15) {
    moodText.innerHTML = "\u0627\u0644\u0628\u0637\u0631\u064a\u0642 Tux \u064a\u063a\u0646\u064a \u0648\u0647\u0648\u0627 \u064a\u0634\u0639\u0631 \u0628\u064a \u0627\u0644\u062d\u0632\u0646 <br> \u0645\u0643\u0646\u0634 \u0639\u0634\u0645\u064a \u0643\u062f\u0627 \u064a\u0637\u064a\u0631\u064a ";
    moodImg.src = "../98a2444e6c84165e2dd09e7aa8f42cde.jpg";
    moodContainer.className = "tux-status watching";
  } else {
    moodText.innerText = "\u0627\u0644\u0628\u0637\u0631\u064a\u0642 \u064a\u0631\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u062d\u0627\u0621 Tux";
    moodImg.src = "../0801be6ac485b63e98f86127f6b9d6bb.jpg";
    moodContainer.className = "tux-status angry";
  }
}

renderTable();
