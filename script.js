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
