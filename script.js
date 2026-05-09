function addProc() {
  procs.push({id: pidCounter++, at:0, bt:5, pri:1});
  renderTable();
}

function removeProc(id) {
  procs = procs.filter(p => p.id !== id);
  renderTable();
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
      <td><input type="number" value="${p.id}"  onchange="upd(${p.id},'id',+this.value)"  id="id-${p.id}" style="width:60px;"></td>
      <td><input type="number" value="${p.at}"  onchange="upd(${p.id},'at',+this.value)"  id="at-${p.id}"></td>
      <td><input type="number" value="${p.bt}"  onchange="upd(${p.id},'bt',+this.value)"  id="bt-${p.id}"></td>
      <td><input type="number" value="${p.pri}" onchange="upd(${p.id},'pri',+this.value)" id="pri-${p.id}"></td>
      <td><button class="del-btn" onclick="removeProc(${p.id})">\u00d7</button></td>
    `;
    tb.appendChild(tr);
  });
}

function upd(id, field, val) {
  const p = procs.find(x => x.id === id);
  if (p) p[field] = val;
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
