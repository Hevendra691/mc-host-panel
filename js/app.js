const BACKEND = ""; // set to your backend URL like https://free-mc-backend.onrender.com

async function apiPost(path, body, token){ return fetch((BACKEND||'')+path,{method:'POST',headers:{'Content-Type':'application/json', 'Authorization': token? 'Bearer '+token:''}, body: JSON.stringify(body)}).then(r=>r.json()); }
async function apiGet(path, token){ return fetch((BACKEND||'')+path,{headers:{'Authorization': token? 'Bearer '+token:''}}).then(r=>r.json()); }

if(document.getElementById('srv_version')){
  (async ()=>{
    try{
      const r = await apiGet('/api/mc/versions', localStorage.getItem('fhmc_token'));
      const sel = document.getElementById('srv_version');
      if(r && r.versions) r.versions.slice(0,10).forEach(v=>{ const o=document.createElement('option'); o.value=o.textContent=v; sel.appendChild(o); });
    }catch(e){ console.log(e); }
  })();

  document.getElementById('createBtn').onclick = async ()=>{
    const name = document.getElementById('srv_name').value || 'fhmc';
    const version = document.getElementById('srv_version').value || '1.20.2';
    const software = document.getElementById('srv_soft').value || 'paper';
    const plugins = document.getElementById('srv_plugins').value.split(',').map(x=>x.trim()).filter(x=>x);
    const token = localStorage.getItem('fhmc_token');
    const res = await apiPost('/api/server/create', { name, version, software, plugins, mods:[] }, token);
    document.getElementById('output').textContent = JSON.stringify(res, null, 2);
  };

  document.getElementById('refreshFiles').onclick = async ()=>{
    const token = localStorage.getItem('fhmc_token');
    const r = await apiGet('/api/files', token);
    const el = document.getElementById('files');
    if(r.ok){ el.innerHTML = r.files.map(f=>`<div><a href="${(BACKEND||'')+f.url}" target="_blank">${f.name}</a></div>`).join(''); }
  };
}

if(document.getElementById('upBtn')){
  document.getElementById('upBtn').onclick = async ()=>{
    const f = document.getElementById('upload').files[0];
    if(!f) return alert('choose');
    const fd = new FormData(); fd.append('file', f);
    const token = localStorage.getItem('fhmc_token');
    const res = await fetch((BACKEND||'')+'/api/files/upload',{ method:'POST', headers: { 'Authorization': token? 'Bearer '+token:'' }, body: fd }).then(r=>r.json());
    alert(JSON.stringify(res));
  };
}

if(document.getElementById('console')){
  const socket = (window.io)? io((BACKEND||'') + "/console") : null;
  const consoleEl = document.getElementById('console');
  const SERVER_ID = localStorage.getItem('fhmc_console_server') || 'demo';
  if(socket){
    socket.on('connect', ()=>{ socket.emit('join', { serverId: SERVER_ID }); });
    socket.on('stdout', d=>{ consoleEl.textContent += d; consoleEl.scrollTop = consoleEl.scrollHeight; });
    socket.on('stderr', d=>{ consoleEl.textContent += '[ERR] '+d; consoleEl.scrollTop = consoleEl.scrollHeight; });
    document.getElementById('send').onclick = ()=>{ const cmd = document.getElementById('cmd').value; socket.emit('cmd', cmd); document.getElementById('cmd').value=''; };
  } else { consoleEl.textContent = 'Socket.io not loaded or BACKEND not set.'; }
}
