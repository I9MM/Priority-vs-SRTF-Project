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