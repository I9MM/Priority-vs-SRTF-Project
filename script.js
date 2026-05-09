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
