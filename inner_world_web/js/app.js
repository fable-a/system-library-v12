const ACOLS=[{h:'#7B9E8F'},{h:'#B07A6B'},{h:'#7A8FA8'},{h:'#9B8DB0'},{h:'#B09A70'},{h:'#8CA87A'},{h:'#A87A8C'},{h:'#6A8C99'}];
const GCOLS=[{h:'#7B9E8F'},{h:'#7A8FA8'},{h:'#9B8DB0'},{h:'#B09A70'},{h:'#B07A6B'},{h:'#8CA87A'}];
const TCOLS=[{h:'#7B9E8F'},{h:'#7A8FA8'},{h:'#9B8DB0'},{h:'#B09A70'},{h:'#B07A6B'},{h:'#8CA87A'},{h:'#A87A8C'}];
const PAGE_W=300,PAGE_H=420;
let S={
  screen:'onboarding',activeId:null,galSel:null,search:'',
  onboarded:false,obStep:0,obAlters:[],obDraft:null,obImporting:false,
  alters:[],groups:[],books:[],conversations:[],events:[],projects:[],
  polls:[],announcements:[],entities:[],relationships:[],todoLists:[],questions:[],registries:[],
  qnaDetailId:null,qnaSearch:'',regDetailId:null,
  settings:{departmentsEnabled:true},
  nav:'dashboard',navCollapsed:false,navOpen:{people:true,tools:true,directories:true},
  libFilter:'all',grpTypeTab:'all',grpDetailId:null,grpDetailTab:'info',
  bookId:null,bookSpread:0,bookZoom:100,bookViewMode:false,bookOnePage:false,_bookState:{},
  commTab:'direct',activeConvId:null,composeAttachments:[],
  activeTodoListId:null,selectedProfileId:null,profileEdit:null,
  relOpenEntityId:null,relFilterType:'all',relSearch:'',relShipSearch:'',
  newsTab:'announcements',newsRead:{},
  calView:'month',calMonth:new Date().getMonth(),calYear:new Date().getFullYear(),
  calSelDate:new Date().toISOString().slice(0,10),
  calFilterTypes:['appointment','therapy','birthday','meeting','reminder','fronting','inner','other'],
  calLayers:['scheduled','plans','journal'],
  mapLayer:'locations',mapMode:'view',mapPan:{x:0,y:0},mapZoom:1,
  mapConnectSource:null,mapSelected:null,mapCustomLabels:[],
  mapLayers:{
    locations:{positions:{},backboards:{},connections:[]},
    connections:{positions:{},backboards:{},connections:[]},
    departments:{positions:{},backboards:{},connections:[]},
    relations:{positions:{},connections:[]}
  },
  pbSearch:'',pbSelectedTopic:null,
  projDetailId:null,projDetailTab:'overview',
  coFrontId:null,coFrontSwapPending:false,
  _dashAddBlock:null,rsMeta:{},
  activeId:null,
};;
function ga(id){return S.alters.find(a=>a.id===id);}
function gg(id){return S.groups.find(g=>g.id===id);}
function gb(id){return S.books.find(b=>b.id===id);}
function gc(id){return S.conversations.find(c=>c.id===id);}
function gtl(id){return S.todoLists.find(l=>l.id===id);}
function gq(id){return S.questions.find(q=>q.id===id);}
function greg(id){return S.registries.find(r=>r.id===id);}
function ini(n){return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
/* Return the display content for an alter avatar: a photo <img> if set, else initials.
   Call this INSTEAD of ini(alter.name) for alter avatars. */
function aAv(a){if(!a)return'';if(a.photo)return`<img class="av-photo" src="${a.photo}" alt="">`;return ini(a.name);}
function buildPhotoUploader(a,canEdit){
  if(!canEdit){
    // Read-only display
    if(a.photo)return`<div class="photo-uploader"><div class="photo-preview"><img src="${a.photo}"></div><div class="photo-upload-text"><div class="photo-upload-title">Photo set</div><div class="photo-upload-sub">Only ${a.name} can change this.</div></div></div>`;
    return`<div class="photo-uploader"><div class="photo-preview">${ini(a.name)}</div><div class="photo-upload-text"><div class="photo-upload-title">No photo</div><div class="photo-upload-sub">Only ${a.name} can add one.</div></div></div>`;
  }
  return`<div class="photo-uploader">
    <div class="photo-preview">${a.photo?`<img src="${a.photo}">`:ini(a.name)}</div>
    <div class="photo-upload-text">
      <div class="photo-upload-title">${a.photo?'Your profile photo':'No photo yet'}</div>
      <div class="photo-upload-sub">${a.photo?'Appears everywhere your avatar shows.':'Upload an image — it\'ll replace your initials in every avatar.'}</div>
    </div>
    <div class="photo-upload-actions">
      <button class="mbtn-s" onclick="triggerPhotoUpload('${a.id}')">${a.photo?'Replace':'Upload'}</button>
      ${a.photo?`<button class="mbtn-s" style="color:var(--warm);" onclick="removePhoto('${a.id}')">Remove</button>`:''}
    </div>
  </div>`;
}
function triggerPhotoUpload(alterId){
  window._photoTargetId=alterId;
  const inp=document.getElementById('photoInp');
  if(inp){inp.value='';inp.click();}
}
function handlePhotoUpload(ev){
  const file=ev.target.files&&ev.target.files[0];
  if(!file){return;}
  if(!file.type.startsWith('image/')){toast('Please pick an image file');return;}
  if(file.size>5*1024*1024){toast('Image too large (max 5MB)');return;}
  const aid=window._photoTargetId||S.activeId;
  // Must be the active alter (only you can change your own)
  if(aid!==S.activeId){toast("You can only change your own photo");return;}
  const reader=new FileReader();
  reader.onload=(e)=>{
    const dataUrl=e.target.result;
    // Resize to 256×256 max via canvas to keep storage small
    const img=new Image();
    img.onload=()=>{
      const MAX=256;
      let w=img.width,h=img.height;
      const scale=Math.min(1,MAX/Math.max(w,h));
      w=Math.round(w*scale);h=Math.round(h*scale);
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
      const out=canvas.toDataURL('image/jpeg',0.85);
      const a=ga(aid);if(!a)return;
      a.photo=out;
      // Also update edit buffer if applicable
      if(S.profileEdit&&S.selectedProfileId===aid)S.profileEdit.photo=out;
      render();toast('Photo updated');
    };
    img.src=dataUrl;
  };
  reader.readAsDataURL(file);
}
async function removePhoto(aid){
  if(aid!==S.activeId){toast("You can only change your own photo");return;}
  const a=ga(aid);if(!a)return;
  if(!await confirmDialog('Remove your profile photo? You can upload a new one any time.','Remove photo'))return;
  delete a.photo;
  if(S.profileEdit&&S.selectedProfileId===aid)delete S.profileEdit.photo;
  render();toast('Photo removed');
}
function abg(c){return c+'28';}
function me(){return ga(S.activeId);}
/* ── CONFIRM DIALOG ── */
function confirmDialog(msg,title){
  return new Promise(resolve=>{
    const overlay=document.createElement('div');overlay.className='confirm-overlay';
    const modal=document.createElement('div');modal.className='confirm-modal';
    modal.innerHTML=`<div class="confirm-modal-bar" id="cmd-bar"><span class="confirm-modal-title">${title||'Confirm'}</span><button onclick="this.closest('.confirm-modal').remove();document.querySelector('.confirm-overlay')?.remove();_confirmResolve&&_confirmResolve(false);" style="border:none;background:transparent;cursor:pointer;font-size:16px;color:var(--ink-s);">×</button></div><div class="confirm-modal-body">${msg}</div><div class="confirm-modal-btns"><button class="mbtn-s" onclick="this.closest('.confirm-modal').remove();document.querySelector('.confirm-overlay')?.remove();_confirmResolve&&_confirmResolve(false);">Cancel</button><button class="mbtn-p" onclick="this.closest('.confirm-modal').remove();document.querySelector('.confirm-overlay')?.remove();_confirmResolve&&_confirmResolve(true);">Confirm</button></div>`;
    window._confirmResolve=resolve;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    // Drag support
    const bar=modal.querySelector('#cmd-bar');
    let dx=0,dy=0,mx=0,my=0;
    bar.onmousedown=e=>{mx=e.clientX;my=e.clientY;document.onmousemove=e=>{dx=e.clientX-mx;dy=e.clientY-my;mx=e.clientX;my=e.clientY;modal.style.transform='none';modal.style.left=(modal.offsetLeft+dx)+'px';modal.style.top=(modal.offsetTop+dy)+'px';};document.onmouseup=()=>{document.onmousemove=null;document.onmouseup=null;};};
  });
}
/* ── GLOBAL UNDO ── */
// A simple action-based undo stack (separate from the map's own undo)
// Each entry is {type, data} describing how to reverse a specific action
let _undoStack=[];
let _redoStack=[];
const MAX_UNDO=50;
function pushUndo(action){
  _undoStack.push(action);
  if(_undoStack.length>MAX_UNDO)_undoStack.shift();
  _redoStack=[];
}
function undoLast(){
  if(!_undoStack.length){toast('Nothing to undo');return;}
  const action=_undoStack.pop();
  const redoAction=applyUndo(action);
  if(redoAction)_redoStack.push(redoAction);
  rc();
  toast('Undone');
}
function redoLast(){
  if(!_redoStack.length){toast('Nothing to redo');return;}
  const action=_redoStack.pop();
  const undoAction=applyUndo(action);
  if(undoAction)_undoStack.push(undoAction);
  rc();
  toast('Redone');
}
function applyUndo(action){
  if(!action)return null;
  switch(action.type){
    // Alter actions
    case 'addAlter':{const i=S.alters.findIndex(a=>a.id===action.alter.id);if(i>-1)S.alters.splice(i,1);return{type:'removeAlter',alter:action.alter};}
    case 'removeAlter':{S.alters.push(action.alter);return{type:'addAlter',alter:action.alter};}
    // Group actions
    case 'addGroup':{const i=S.groups.findIndex(g=>g.id===action.group.id);if(i>-1)S.groups.splice(i,1);S.conversations=S.conversations.filter(c=>!(c.type==='group'&&c.groupId===action.group.id));if(S.grpDetailId===action.group.id)S.grpDetailId=null;return{type:'removeGroup',group:action.group};}
    case 'removeGroup':{S.groups.push(action.group);return{type:'addGroup',group:action.group};}
    // Book actions
    case 'addBook':{const i=S.books.findIndex(b=>b.id===action.book.id);if(i>-1)S.books.splice(i,1);if(S.bookId===action.book.id)S.bookId=null;return{type:'removeBook',book:action.book};}
    case 'removeBook':{S.books.push(action.book);return{type:'addBook',book:action.book};}
    // Project actions
    case 'addProject':{const i=S.projects.findIndex(p=>p.id===action.project.id);if(i>-1)S.projects.splice(i,1);if(S.projDetailId===action.project.id)S.projDetailId=null;return{type:'removeProject',project:action.project};}
    case 'removeProject':{S.projects.push(action.project);return{type:'addProject',project:action.project};}
    // Poll actions
    case 'addPoll':{const i=S.polls.findIndex(p=>p.id===action.poll.id);if(i>-1)S.polls.splice(i,1);return{type:'removePoll',poll:action.poll};}
    case 'removePoll':{S.polls.push(action.poll);return{type:'addPoll',poll:action.poll};}
    // Announcement actions
    case 'addAnnouncement':{const i=S.announcements.findIndex(a=>a.id===action.ann.id);if(i>-1)S.announcements.splice(i,1);return{type:'removeAnnouncement',ann:action.ann};}
    case 'removeAnnouncement':{S.announcements.push(action.ann);return{type:'addAnnouncement',ann:action.ann};}
    // Entity (relation) actions
    case 'addEntity':{const i=S.entities.findIndex(e=>e.id===action.entity.id);if(i>-1)S.entities.splice(i,1);if(S.relOpenEntityId===action.entity.id)S.relOpenEntityId=null;return{type:'removeEntity',entity:action.entity};}
    case 'removeEntity':{S.entities.push(action.entity);return{type:'addEntity',entity:action.entity};}
    // Todo list actions
    case 'addTodoList':{const i=S.todoLists.findIndex(l=>l.id===action.list.id);if(i>-1)S.todoLists.splice(i,1);if(S.activeTodoListId===action.list.id)S.activeTodoListId=null;return{type:'removeTodoList',list:action.list};}
    case 'removeTodoList':{S.todoLists.push(action.list);return{type:'addTodoList',list:action.list};}
    // Nickname actions
    case 'removeNickname':{const a=ga(action.alterId)||(S.profileEdit?.id===action.alterId?S.profileEdit:null);if(a){if(!a.nicknames)a.nicknames=[];a.nicknames.splice(action.idx,0,action.nick);}return{type:'addNickname',alterId:action.alterId,nick:action.nick,idx:action.idx};}
    case 'addNickname':{const a=ga(action.alterId)||(S.profileEdit?.id===action.alterId?S.profileEdit:null);if(a&&a.nicknames){const i=a.nicknames.indexOf(action.nick);if(i>-1)a.nicknames.splice(i,1);}return{type:'removeNickname',alterId:action.alterId,nick:action.nick,idx:action.idx};}
    // Field edits (generic state snapshot restore)
    case 'stateSnapshot':{const prev=action.prev;const next=JSON.stringify({alters:S.alters,groups:S.groups,books:S.books,projects:S.projects,polls:S.polls,announcements:S.announcements,entities:S.entities,todoLists:S.todoLists});Object.assign(S,JSON.parse(prev));return{type:'stateSnapshot',prev:next};}
  }
  return null;
}
// Global keyboard handler for Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
window.addEventListener('keydown',(e)=>{
  // Don't intercept when typing in an input/textarea/contenteditable
  const tag=e.target.tagName;
  const isEditing=tag==='INPUT'||tag==='TEXTAREA'||e.target.isContentEditable;
  if(isEditing)return;
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key==='z'){e.preventDefault();undoLast();}
  if((e.ctrlKey||e.metaKey)&&(e.shiftKey&&e.key==='z'||e.key==='y')){e.preventDefault();redoLast();}
});
// BroadcastChannel lets multiple tabs/windows stay in sync without a server.
// Every save broadcasts the new state. Every window listens and re-renders if
// the incoming state is newer than what it has.
let _bch = null;
let _windowId = Math.random().toString(36).slice(2); // unique ID per window
function initBroadcast(){
  try{
    _bch = new BroadcastChannel('system_library_sync');
    _bch.onmessage = (ev) => {
      const msg = ev.data;
      if(!msg || msg.windowId === _windowId) return; // ignore our own broadcasts
      if(msg.type === 'state_update' && msg.savedAt > (_lastSaveAt||0)){
        // Incoming state is newer — merge it in
        try{
          Object.keys(msg.state).forEach(k => { if(msg.state[k]!==undefined) S[k]=msg.state[k]; });
          _lastSaveAt = msg.savedAt;
          // Don't re-broadcast (would cause loop). Just re-render.
          applyTheme();
          document.getElementById('root').innerHTML=buildApp();
          updateSaveIndicator();
        }catch(e){ console.warn('Sync render error:',e); }
      }
      if(msg.type === 'alter_switch'){
        // Another window switched alter — follow it
        if(msg.activeId && ga(msg.activeId)){
          S.activeId = msg.activeId;
          applyTheme();
          document.getElementById('root').innerHTML=buildApp();
          updateSaveIndicator();
        }
      }
    };
  }catch(e){
    // BroadcastChannel not available (e.g. file:// without a server) — silently skip
    _bch = null;
  }
}
function broadcastState(){
  if(!_bch) return;
  try{
    _bch.postMessage({type:'state_update', windowId:_windowId, savedAt:_lastSaveAt, state:S});
  }catch(e){}
}
function broadcastAlterSwitch(activeId){
  if(!_bch) return;
  try{
    _bch.postMessage({type:'alter_switch', windowId:_windowId, activeId});
  }catch(e){}
}
const STORAGE_KEY='inner_world_v1';
const STORAGE_SCHEMA=1;
let _saveQueued=false;let _lastSaveAt=0;let _saveStatus='idle';let _saveHideTimer=null;

function toast(msg,duration){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer=setTimeout(()=>el.classList.remove('show'),duration||2800);
}
function updateSaveIndicator(){
  const el=document.getElementById('save-ind');
  if(!el)return;
  el.classList.remove('saving','saved','error');
  const lbl=el.querySelector('.save-ind-lbl');
  if(_saveStatus==='saving'){el.classList.add('saving');if(lbl)lbl.textContent='Saving…';el.title='Writing changes to local storage';el.onclick=null;}
  else if(_saveStatus==='error'){el.classList.add('error');if(lbl)lbl.textContent='Save failed — click to retry';el.title='Storage might be full or blocked. Click to try again.';el.onclick=()=>{saveState();updateSaveIndicator();};}
  else{el.classList.add('saved');if(lbl){const when=_lastSaveAt?saveAgeStr():'';lbl.textContent=when?'Saved '+when:'Saved';}el.title='Auto-saved locally to your browser';el.onclick=null;}
}
function saveAgeStr(){
  if(!_lastSaveAt)return'';
  const diff=Date.now()-_lastSaveAt;
  if(diff<5000)return'just now';
  if(diff<60000)return Math.floor(diff/1000)+'s ago';
  if(diff<3600000)return Math.floor(diff/60000)+'m ago';
  return Math.floor(diff/3600000)+'h ago';
}
function saveState(){
  _saveStatus='saving';updateSaveIndicator();
  try{
    const data={v:STORAGE_SCHEMA,savedAt:Date.now(),state:S};
    const s=JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY,s);
    _lastSaveAt=Date.now();_saveStatus='ok';
    broadcastState(); // notify other windows
  }catch(e){
    _saveStatus='error';
    console.warn('Save failed:',e);
  }
  updateSaveIndicator();
}
function queueSave(){
  if(_saveQueued)return;
  _saveQueued=true;
  setTimeout(()=>{_saveQueued=false;saveState();},200);
}
// Refresh the "saved X ago" label periodically so it reflects current age
setInterval(()=>{if(_saveStatus==='ok')updateSaveIndicator();},15000);
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return false;
    const data=JSON.parse(raw);
    if(!data||!data.state)return false;
    if(data.v!==STORAGE_SCHEMA){
      console.warn('Schema mismatch — keeping defaults');
      return false;
    }
    // Merge — keep defaults for anything missing in saved state (forward-compat)
    const defaults={...S};
    Object.keys(defaults).forEach(k=>{
      if(data.state[k]!==undefined)S[k]=data.state[k];
    });
    // Patch mapLayers: ensure all current layers exist (handles state from older versions)
    const mlDef={locations:{positions:{},backboards:{},connections:[]},connections:{positions:{},backboards:{},connections:[]},departments:{positions:{},backboards:{},connections:[]},relations:{positions:{},connections:[]}};
    Object.keys(mlDef).forEach(k=>{if(!S.mapLayers[k])S.mapLayers[k]=mlDef[k];});
    // Ensure mapLayer points to a valid layer
    if(!S.mapLayers[S.mapLayer])S.mapLayer='locations';
    return true;
  }catch(e){
    console.warn('Load failed:',e);
    return false;
  }
}
async function clearSavedData(){
  if(!await confirmDialog('Clear all saved data? This will reset everything to defaults and cannot be undone.','Clear data'))return;
  localStorage.removeItem(STORAGE_KEY);
  // Reset state to blank and trigger onboarding
  S.alters=[];S.books=[];S.events=[];S.projects=[];S.polls=[];S.groups=[];
  S.conversations=[];S.entities=[];S.todoLists=[];S.announcements=[];
  S.onboarded=false;S.screen='onboarding';S.obStep=0;S.obAlters=[];S.obImporting=false;
  S.rsMeta={};
  S.mapLayers={locations:{positions:{},backboards:{},connections:[]},connections:{positions:{},backboards:{},connections:[]},departments:{positions:{},backboards:{},connections:[],hierarchy:{}},relations:{positions:{},connections:[]}};
  render();
}
function downloadBackup(){
  try{
    const data={v:STORAGE_SCHEMA,savedAt:Date.now(),state:S};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='inner-world-backup-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Backup downloaded');
  }catch(e){toast('Backup failed');console.warn(e);}
}
function importBackup(ev){
  const file=ev.target.files&&ev.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=async(e)=>{
    try{
      const data=JSON.parse(e.target.result);
      if(!data||!data.state){toast('Invalid backup file');return;}
      if(data.v!==STORAGE_SCHEMA){toast('Backup version mismatch');return;}
      if(!await confirmDialog('Replace all current data with this backup? This cannot be undone.','Restore backup'))return;
      Object.keys(S).forEach(k=>{if(data.state[k]!==undefined)S[k]=data.state[k];});
      if(!ga(S.activeId)){const first=(S.alters||[])[0];S.activeId=first?first.id:null;}
      S.screen='gallery';S.galSel=null;
      saveState();render();toast('Backup restored');
    }catch(err){toast('Failed to read backup');console.warn(err);}
  };
  reader.readAsText(file);
}
function getStorageInfo(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return{saved:false,size:0,when:null};
    const bytes=new Blob([raw]).size;
    const data=JSON.parse(raw);
    return{saved:true,size:bytes,when:data.savedAt||null};
  }catch(e){return{saved:false,size:0,when:null};}
}
function formatBytes(b){if(b<1024)return b+' B';if(b<1024*1024)return (b/1024).toFixed(1)+' KB';return (b/1024/1024).toFixed(2)+' MB';}
function applyTheme(){const LEGACY={sage:'library',sunset:'library',midnight:'cathedral',nature:'cozy'};const a=me();let t=(a&&a.theme)||'library';let m=(a&&a.mode)||'light';t=LEGACY[t]||t;if(S.profileEdit&&S.selectedProfileId===S.activeId){let pt=S.profileEdit.theme||t;let pm=S.profileEdit.mode||m;pt=LEGACY[pt]||pt;t=pt;m=pm;}document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-mode',m);}
function render(){applyTheme();document.getElementById('root').innerHTML=buildApp();queueSave();updateSaveIndicator();if(S.bookId)requestAnimationFrame(initBookCanvases);}
function rc(){
  applyTheme();
  if(S.screen==='gallery'){
    const root=document.getElementById('root');
    if(root)root.innerHTML=buildApp();
    const inp=document.getElementById('gal-search-inp');
    if(inp&&document.activeElement!==inp){/* don't steal focus */}
    queueSave();return;
  }
  const el=document.getElementById('content-area');if(el)el.innerHTML=buildContent();queueSave();
  if(S.bookId)requestAnimationFrame(initBookCanvases);
}
function buildApp(){if(S.screen==='onboarding')return buildOnboarding();if(S.screen==='gallery')return buildGallery();return `${buildTopbar()}<div class="shell">${buildSidenav()}<div class="content" id="content-area">${buildContent()}</div></div>`;}
function buildTopbar(){
  const a=me();
  const isTauri=!!(window.__TAURI__||window.__TAURI_INTERNALS__);
  const extraBtns=`<div style="display:flex;gap:4px;"><button class="help-btn" title="New window" onclick="openNewWindow()" style="font-size:13px;">&#x29C9;</button><button class="help-btn" title="New tab" onclick="openNewTab()" style="font-size:11px;">&#x229E;</button></div>`;
  const winCtrls=isTauri?`<div class="win-ctrls"><button class="win-ctrl" title="Minimize" onclick="winMin()">&#x2013;</button><button class="win-ctrl" title="Maximize" onclick="winMax()">&#x25A1;</button><button class="win-ctrl wc-close" title="Close" onclick="winClose()">&#x2715;</button></div>`:'';
  return `<div class="topbar"><div data-tauri-drag-region style="flex:1;height:100%;display:flex;align-items:center;"><div class="wm">System Library</div></div><div class="topbar-right"><div class="save-ind" id="save-ind" title="Auto-saved to your browser"><div class="save-ind-dot"></div><span class="save-ind-lbl">Saved</span></div><button class="help-btn" title="Take a tour" onclick="openTourPicker()">?</button><div class="fronting-chip"><div class="fchip-dot"></div><span class="fchip-lbl">Fronting:</span><span class="fchip-name">${a.name}</span></div><button class="tbtn" onclick="goGallery()">&#x21C4; Switch alter</button>${extraBtns}${winCtrls}</div></div>`;
}
/* ── WINDOW CONTROLS (Tauri 2) ──
   In Tauri 2 with decorations:false, the OS chrome is absent.
   We call window controls via __TAURI_INTERNALS__.invoke() which is
   the lowest-level synchronous IPC available in every Tauri 2 window. */
function _tauriInvoke(cmd,args){
  try{
    if(window.__TAURI_INTERNALS__?.invoke)
      return window.__TAURI_INTERNALS__.invoke(cmd,args||{});
    if(window.__TAURI__?.tauri?.invoke)
      return window.__TAURI__.tauri.invoke(cmd,args||{});
  }catch(e){console.warn('Tauri invoke failed:',cmd,e);}
  return Promise.resolve();
}
function winMin(){if(window.__TAURI__?.window?.getCurrent)window.__TAURI__.window.getCurrent().minimize();else _tauriInvoke('plugin:window|minimize',{label:'main'});}
function winMax(){if(window.__TAURI__?.window?.getCurrent)window.__TAURI__.window.getCurrent().toggleMaximize();else _tauriInvoke('plugin:window|toggle_maximize',{label:'main'});}
function winClose(){if(window.__TAURI__?.window?.getCurrent)window.__TAURI__.window.getCurrent().close();else _tauriInvoke('plugin:window|close',{label:'main'});}
/* New window — spawns a full native window (Tauri only) */
function openNewWindow(){
  if(window.__TAURI_INTERNALS__||window.__TAURI__){
    _tauriInvoke('plugin:webview|create_webview_window',{
      label:'win-'+Date.now(),
      url:'index.html',
      title:'System Library',
      width:1280,height:800,
      minWidth:900,minHeight:600,
      decorations:false,
      transparent:true,
    }).catch(()=>{
      // fallback if webview plugin not available
      _tauriInvoke('tauri|create_window',{
        label:'win-'+Date.now(),
        url:'index.html',
        title:'System Library',
        width:1280,height:800,
      });
    });
    return;
  }
  // Browser fallback
  window.open(location.href,'_blank','width=1280,height=800,menubar=no,toolbar=no,location=no');
}
/* New tab — browser-style, opens the app URL in a new browser tab.
   In Tauri this opens in the system browser since Tauri has no tab concept. */
function openNewTab(){
  window.open(location.href,'_blank');
}
function buildSidenav(){
  const a=me();
  const unread=countUnread();
  const ni=(id,label,badge)=>niHtml(id,label,badge);
  const newsBadge=unread>0?`${unread}`:'';

  // PEOPLE — where most info gets added: groups, relationships, profiles
  const peopleItems=[
    ni('groups','Groups'),
    ni('relationships','Relationships'),
    ni('relations','Relations'),
    ni('registry','Registry'),
    ni('profiles','Profiles'),
    ni('communication','Communication'),
  ].join('');

  // TOOLS — active working sections
  const toolItems=[
    ni('projects','Projects'),
    ni('todos','To-do lists'),
    ni('calendar','Calendar'),
    ni('library','Library'),
    ni('voting','Polls'),
    ni('qna','Q&A'),
  ].join('');

  // DIRECTORIES — read/view sections derived from the rest of the app
  const dirItems=[
    ni('phonebook','Phonebook'),
    ni('news','News',newsBadge),
    ni('map','System map'),
  ].join('');

  const group=(id,label,count,body)=>{
    return `<div class="sn-sec"><span class="sn-item-label">${label}</span></div><div class="sn-group-body">${body}</div>`;
  };

  const cf=S.coFrontId?ga(S.coFrontId):null;
  const swapPending=S.coFrontSwapPending;

  // Co-fronting block HTML
  const coFrontBlock=cf
    ? `<div class="sn-cofront">
        <div class="sn-cofront-lbl">Co-fronting</div>
        <div class="sn-cofront-row">
          <div class="sn-cofront-av" style="background:${abg(cf.color)};color:${cf.color}">${aAv(cf)}</div>
          <div style="flex:1;min-width:0;">
            <div class="sn-cofront-name">${cf.name}</div>
            <div class="sn-cofront-role">${cf.role||cf.pronouns||''}</div>
          </div>
          <button onclick="S.coFrontId=null;S.coFrontSwapPending=false;render()" title="Remove co-front" style="border:none;background:transparent;color:var(--ink-s);cursor:pointer;font-size:14px;padding:0 2px;flex-shrink:0;">×</button>
        </div>
        ${swapPending
          ? `<div style="font-size:11px;color:var(--ink-m);margin-top:7px;margin-bottom:4px;">Switch to <b>${cf.name}</b> as active?</div>
             <div class="sn-swap-confirm">
               <button class="sn-swap-yes" onclick="confirmCoFrontSwap()">✓ Confirm</button>
               <button class="sn-swap-no" onclick="S.coFrontSwapPending=false;render()">Cancel</button>
             </div>`
          : `<button class="sn-swap-btn" onclick="S.coFrontSwapPending=true;render()">⇄ Switch to ${cf.name}</button>`
        }
      </div>`
    : `<button class="sn-add-cofront" onclick="openCoFrontPicker()" title="Set a co-fronting alter">+ Co-fronting alter</button>`;

  return `<div class="sidenav${S.navCollapsed?' collapsed':''}" style="width:${S.navCollapsed?'48px':'185px'};min-width:${S.navCollapsed?'48px':'185px'};">
    <button class="sn-collapse-btn" onclick="S.navCollapsed=!S.navCollapsed;render()" title="${S.navCollapsed?'Expand sidebar':'Collapse sidebar'}">${S.navCollapsed?'▶':'◀'}</button>
    <div class="sn-active">
      <div class="sn-lbl">Fronting</div>
      <div style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="S.nav='profiles';S.selectedProfileId=S.activeId;render()" title="View ${a.name}'s profile">
        <div class="sn-av" style="background:${abg(a.color)};color:${a.color}">${aAv(a)}</div>
        <div><div class="sn-name">${a.name}</div><div class="sn-sub">${a.role}</div></div>
      </div>
    </div>
    ${coFrontBlock}
    ${ni('dashboard','Dashboard')}
    ${group('people','People',5,peopleItems)}
    ${group('tools','Tools',5,toolItems)}
    ${group('directories','Directories',3,dirItems)}
    <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--brd);margin-top:18px;">
      ${ni('settings','Settings')}
      ${ni('preferences','Preferences')}
    </div>
  </div>`;
}
function niHtml(id,label,badge){const act=S.nav===id?' act':'';const b=badge?`<span class="sn-badge">${badge}</span>`:'';return`<div class="sn-item${act}" onclick="navTo('${id}')" title="${label}"><span class="sn-item-label">${label}</span>${b}</div>`;}
/* ── FLAGS ── */
const FLAG_PRESETS=[
  {id:'real',label:'Is this real?',cls:'flag-real',ico:'❓'},
  {id:'false',label:'Has false information',cls:'flag-false',ico:'⚠'},
  {id:'info',label:'Needs more info',cls:'flag-info',ico:'ℹ'},
];
function flagClass(f){const p=FLAG_PRESETS.find(x=>x.id===f.preset);return p?p.cls:'flag-custom';}
function flagIco(f){const p=FLAG_PRESETS.find(x=>x.id===f.preset);return p?p.ico:'🏷';}
function buildFlagsDisplay(item,canEdit,onAddFn,onRemoveFn){
  const flags=item.flags||[];
  return`<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
    ${flags.map((f,i)=>`<span class="flag-chip ${flagClass(f)}" title="${f.label}">${flagIco(f)} ${f.label}${canEdit?` <span onclick="${onRemoveFn}(${i})" style="cursor:pointer;margin-left:2px;opacity:.7;font-size:12px;">×</span>`:''}</span>`).join('')}
    ${canEdit?`<button class="flag-btn" onclick="toggleFlagPanel('${item.id}')">+ Flag</button>`:''}
  </div>
  <div id="flag-panel-${item.id}" style="display:none;">
    <div class="flag-panel">
      <div style="font-size:11px;color:var(--ink-s);font-weight:500;text-transform:uppercase;letter-spacing:.5px;">Preset flags</div>
      <div class="flag-preset-row">
        ${FLAG_PRESETS.map(p=>`<button class="flag-preset-btn" onclick="addFlag('${item.id}','${p.id}','${p.label}','${onAddFn === 'addAlterFlag' ? 'alter':'group'}')">${p.ico} ${p.label}</button>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--ink-s);font-weight:500;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;">Custom</div>
      <div style="display:flex;gap:6px;">
        <input id="flag-custom-${item.id}" placeholder="Custom flag label…" style="flex:1;padding:6px 9px;border:1px solid var(--brd-s);border-radius:var(--rsm);font-size:12px;font-family:var(--font-sans);background:var(--white);color:var(--ink);outline:none;" onkeydown="if(event.key==='Enter')addFlag('${item.id}','custom',document.getElementById('flag-custom-${item.id}').value,'${onAddFn === 'addAlterFlag' ? 'alter':'group'}')">
        <button class="mbtn-s" style="padding:6px 10px;font-size:12px;" onclick="addFlag('${item.id}','custom',document.getElementById('flag-custom-${item.id}').value,'${onAddFn === 'addAlterFlag' ? 'alter':'group'}')">Add</button>
      </div>
    </div>
  </div>`;
}
function toggleFlagPanel(id){
  const el=document.getElementById('flag-panel-'+id);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}
function addFlag(itemId,preset,label,kind){
  if(!label||!label.trim())return;
  const item=kind==='alter'?ga(itemId):gg(itemId);
  if(!item)return;
  if(!item.flags)item.flags=[];
  item.flags.push({preset,label:label.trim()});
  queueSave();rc();
}
function removeAlterFlag(idx){
  const a=S.profileEdit||ga(S.selectedProfileId);
  if(!a||!a.flags)return;
  a.flags.splice(idx,1);
  if(S.profileEdit)S.profileEdit.flags=[...(a.flags)];
  queueSave();rc();
}
function removeGroupFlag(gid,idx){
  const g=gg(gid);if(!g||!g.flags)return;
  g.flags.splice(idx,1);queueSave();rc();
}
function toggleNavGroup(id){S.navOpen[id]=!S.navOpen[id];render();}

/* ── CO-FRONTING ── */
function openCoFrontPicker(){
  // Show a small modal to pick the co-fronting alter
  const others=sortedAlters(S.alters).filter(a=>a.id!==S.activeId);
  document.getElementById('mods').innerHTML=`<div class="modal-bg">
    <div class="modal" style="width:360px;">
      <h3>Set co-fronting alter</h3>
      <p style="font-size:13px;color:var(--ink-m);">Choose who's co-fronting. You can swap between the two quickly from the sidebar.</p>
      <div class="share-search" style="margin-bottom:6px;">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>
        <input placeholder="Search alters…" oninput="filterCoFrontList(this.value)" id="cf-search">
      </div>
      <div class="share-pick-list" id="cf-list" style="max-height:260px;">
        ${others.map(a=>`<div class="spi" onclick="setCoFront('${a.id}')">
          <div class="spi-av" style="background:${abg(a.color)};color:${a.color}">${aAv(a)}</div>
          <div style="flex:1"><span class="spi-name">${a.name}</span><span class="spi-sub"> · ${a.role}</span></div>
        </div>`).join('')}
      </div>
      <div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button></div>
    </div>
  </div>`;
}
function filterCoFrontList(q){
  const ql=q.toLowerCase();
  const items=document.querySelectorAll('#cf-list .spi');
  items.forEach(el=>{
    const name=el.querySelector('.spi-name')?.textContent?.toLowerCase()||'';
    const role=el.querySelector('.spi-sub')?.textContent?.toLowerCase()||'';
    el.style.display=(!ql||name.includes(ql)||role.includes(ql))?'':'none';
  });
}
function setCoFront(alterId){
  S.coFrontId=alterId;
  S.coFrontSwapPending=false;
  closeMod();
  render();
  toast(ga(alterId)?.name+' set as co-fronting');
}
function confirmCoFrontSwap(){
  const prevActive=S.activeId;
  const prevCoFront=S.coFrontId;
  if(!prevCoFront||!ga(prevCoFront))return;

  // Swap: co-front becomes active, active becomes co-front
  S.activeId=prevCoFront;
  S.coFrontId=prevActive;
  S.coFrontSwapPending=false;

  // Check if the new active alter can see the current section
  // Sections that are always accessible: dashboard, profiles, phonebook, map, news, settings
  const alwaysOpen=['dashboard','profiles','phonebook','map','news','settings','calendar','library','voting','qna','registry'];
  const newAlter=ga(S.activeId);

  // For groups, relationships, relations, communication, todos, projects — check access
  // Simple rule: if section is always-open, stay. Otherwise check if new alter has access.
  let stayInSection=alwaysOpen.includes(S.nav);

  if(!stayInSection){
    // Check section-specific access
    if(S.nav==='groups'){
      // Stay if the new alter is in at least one group, or groups are open-access
      stayInSection=S.groups.some(g=>g.access==='open'||g.members.includes(S.activeId));
    } else if(S.nav==='todos'){
      stayInSection=S.todoLists.some(l=>l.owner===S.activeId||l.access==='open'||(l.sharedWith||[]).includes(S.activeId));
    } else if(S.nav==='projects'){
      stayInSection=S.projects.some(p=>!p.members||p.members.length===0||p.members.includes(S.activeId));
    } else if(S.nav==='communication'){
      stayInSection=S.conversations.some(c=>c.participants?.includes(S.activeId));
    } else {
      // relationships, relations, voting — generally open, stay
      stayInSection=true;
    }
  }

  // If viewing a specific project detail, check access to that project
  if(S.projDetailId){
    const p=gproj(S.projDetailId);
    if(p&&p.members&&p.members.length>0&&!p.members.includes(S.activeId)){
      S.projDetailId=null;
      stayInSection=false;
    }
  }

  if(!stayInSection){
    S.nav='dashboard';
  }

  applyTheme();
  saveState();
  broadcastAlterSwitch(S.activeId);
  render();
  toast('Switched to '+newAlter?.name);
}
function buildContent(){if(S.nav==='dashboard')return buildDash();if(S.nav==='profiles')return buildProfiles();if(S.nav==='preferences')return buildPreferences();if(S.nav==='library')return S.bookId?buildBookReader():buildLibrary();if(S.nav==='todos')return buildTodos();if(S.nav==='groups')return S.grpDetailId?buildGroupDetail():buildGroups();if(S.nav==='communication')return buildComm();if(S.nav==='relations')return buildRelations();if(S.nav==='calendar')return buildCalendar();if(S.nav==='news')return buildNews();if(S.nav==='map'){try{return buildSystemMap();}catch(e){console.error('Map error:',e);S.nav='dashboard';return buildDash();}}if(S.nav==='phonebook')return buildPhonebook();if(S.nav==='relationships')return buildRelationships();if(S.nav==='projects')return S.projDetailId?buildProjectDetail():buildProjects();if(S.nav==='voting')return buildVoting();if(S.nav==='qna')return S.qnaDetailId?buildQnaDetail():buildQnaList();if(S.nav==='registry')return S.regDetailId?buildRegistryDetail():buildRegistryList();if(S.nav==='settings')return buildSettings();return`<div style="padding:40px;color:var(--ink-s);font-size:14px;text-align:center;">Coming soon.</div>`;}
/* ── CUSTOM DASHBOARD ── */
/* Tile types:
  shortcut  — nav section link  {nav}
  project   — specific project  {projId}
  book      — specific book     {bookId}
  todolist  — specific list     {listId}
  calendar  — upcoming events   {}
  progress  — project progress  {projId}
  note      — freeform note     {text}
  clock     — date & time       {}
*/
function defaultDashboard(){
  return {
    editMode:false,
    blocks:[
      {id:'blk-1',label:'People',tiles:[
        {id:'dt-groups',    type:'shortcut',w:1,nav:'groups',       label:'Groups',       ico:'◉'},
        {id:'dt-rel',       type:'shortcut',w:1,nav:'relationships', label:'Relationships',ico:'♥'},
        {id:'dt-relations', type:'shortcut',w:1,nav:'relations',     label:'Relations',    ico:'🌐'},
        {id:'dt-profiles',  type:'shortcut',w:1,nav:'profiles',      label:'Profiles',     ico:'👤'},
        {id:'dt-comm',      type:'shortcut',w:1,nav:'communication', label:'Communication',ico:'💬'},
        {id:'dt-polls',     type:'shortcut',w:1,nav:'voting',        label:'Polls',        ico:'🗳'},
        {id:'dt-map',       type:'shortcut',w:1,nav:'map',           label:'System map',   ico:'🗺'},
        {id:'dt-cal-wgt',   type:'calendar', w:2},
        {id:'dt-clock1',    type:'clock',    w:1},
      ]},
      {id:'blk-2',label:'Tools',tiles:[
        {id:'dt-projects',  type:'shortcut',w:1,nav:'projects',  label:'Projects',   ico:'📁'},
        {id:'dt-todos',     type:'shortcut',w:1,nav:'todos',     label:'To-do lists',ico:'✅'},
        {id:'dt-calendar',  type:'shortcut',w:1,nav:'calendar',  label:'Calendar',   ico:'📅'},
        {id:'dt-library',   type:'shortcut',w:1,nav:'library',   label:'Library',    ico:'📚'},
        {id:'dt-news',      type:'shortcut',w:1,nav:'news',      label:'News',       ico:'📣'},
        {id:'dt-phonebook', type:'shortcut',w:1,nav:'phonebook', label:'Phonebook',  ico:'📞'},
        {id:'dt-note1',     type:'note',     w:3,text:''},
      ]},
      {id:'blk-3',label:'Notes & widgets',tiles:[
        {id:'dt-note2',     type:'note',     w:3,text:''},
        {id:'dt-clock2',    type:'clock',    w:1},
        {id:'dt-note3',     type:'note',     w:2,text:''},
      ]},
    ]
  };
}
function getDash(){
  const a=me();
  if(!a.dashboard)a.dashboard=defaultDashboard();
  // Migrate old flat tiles format to blocks format
  if(a.dashboard.tiles&&!a.dashboard.blocks){
    const old=a.dashboard.tiles;
    a.dashboard=defaultDashboard();
    a.dashboard.editMode=false;
  }
  if(!a.dashboard.blocks)a.dashboard.blocks=defaultDashboard().blocks;
  return a.dashboard;
}
const SECTION_OPTS=[
  {nav:'profiles',label:'Profiles',ico:'👤'},
  {nav:'phonebook',label:'Phonebook',ico:'📞'},
  {nav:'communication',label:'Communication',ico:'💬'},
  {nav:'groups',label:'Groups',ico:'◉'},
  {nav:'relationships',label:'Relationships',ico:'♥'},
  {nav:'relations',label:'Relations',ico:'🌐'},
  {nav:'voting',label:'Polls',ico:'🗳'},
  {nav:'qna',label:'Q&A',ico:'❓'},
  {nav:'registry',label:'Registry',ico:'📋'},
  {nav:'map',label:'System map',ico:'🗺'},
  {nav:'todos',label:'To-do lists',ico:'✅'},
  {nav:'calendar',label:'Calendar',ico:'📅'},
  {nav:'news',label:'News',ico:'📣'},
  {nav:'library',label:'Library',ico:'📚'},
  {nav:'projects',label:'Projects',ico:'📁'},
];
function buildDash(){
  const a=me();
  const dash=getDash();
  const editMode=dash.editMode;
  const today=new Date();
  const blocksHtml=dash.blocks.map(blk=>{
    const tilesHtml=blk.tiles.map(t=>{
      const span=Math.min(t.w||1,3);
      const content=buildDashTile(t,editMode);
      const editBtns=editMode?`
        <button class="ct-edit-remove" onclick="event.stopPropagation();removeDashTileFromBlock('${blk.id}','${t.id}')" title="Remove">×</button>
        <div class="ct-size-btns">
          ${span>1?`<button class="ct-size-btn" onclick="event.stopPropagation();resizeDashTile('${blk.id}','${t.id}',-1)">−</button>`:''}
          <span class="ct-size-btn" style="cursor:default;">${span}w</span>
          ${span<3?`<button class="ct-size-btn" onclick="event.stopPropagation();resizeDashTile('${blk.id}','${t.id}',1)">+</button>`:''}
        </div>`:'';
      return`<div class="cdash-tile${editMode?' edit-mode':''}" style="grid-column:span ${span};">${content}${editBtns}</div>`;
    }).join('');
    const addBtn=editMode?`<div style="grid-column:1/-1;"><button class="cdash-add-chip" style="width:100%;justify-content:center;" onclick="openDashAddPanel('${blk.id}')">+ Add tile to ${blk.label}</button></div>`:'';
    return`<div class="cdash-block">${blk.label?`<div class="cdash-block-lbl">${blk.label}</div>`:''}${tilesHtml}${addBtn}</div>`;
  }).join('');
  const addPanel=editMode&&S._dashAddBlock?buildDashAddPanel(S._dashAddBlock):'';
  return`<div class="cdash">
    <div class="cdash-header">
      <div><div class="cdash-greeting">Welcome, ${a.name}.</div><div class="cdash-date">${today.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})}</div></div>
      <button class="cdash-edit-btn${editMode?' active':''}" onclick="toggleDashEdit()">${editMode?'✓ Done editing':'✎ Edit layout'}</button>
    </div>
    <div class="cdash-blocks">${blocksHtml}</div>
    ${addPanel}
  </div>`;
}
function buildDashAddPanel(blkId){
  return`<div class="cdash-add-zone" id="dash-add-panel">
    <span style="font-size:12px;color:var(--ink-s);width:100%;margin-bottom:4px;">Add to block — Sections</span>
    ${SECTION_OPTS.map(s=>`<div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','shortcut','${s.nav}')"><span class="chip-ico">${s.ico}</span>${s.label}</div>`).join('')}
    <span style="font-size:12px;color:var(--ink-s);width:100%;margin-top:6px;margin-bottom:4px;">Widgets</span>
    <div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','calendar')"><span class="chip-ico">📅</span>Upcoming events</div>
    <div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','clock')"><span class="chip-ico">🕐</span>Clock</div>
    <div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','note')"><span class="chip-ico">📝</span>Quick note</div>
    ${S.projects.length?S.projects.map(p=>`<div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','project','${p.id}')"><span class="chip-ico">📁</span>${p.title}</div><div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','progress','${p.id}')"><span class="chip-ico">📊</span>${p.title} %</div>`).join(''):''}
    ${S.todoLists.length?S.todoLists.map(l=>`<div class="cdash-add-chip" onclick="addDashTileToBlock('${blkId}','todolist','${l.id}')"><span class="chip-ico">✅</span>${l.name}</div>`).join(''):''}
    <button class="cdash-add-chip" style="margin-left:auto;border-color:var(--warm);color:var(--warm);" onclick="S._dashAddBlock=null;rc()">✕ Close</button>
  </div>`;
}
function buildDashTile(t,editMode){
  const today=new Date();
  function oc(js){return editMode?'':js;}
  switch(t.type){
    case 'shortcut':{
      const nav=t.nav;const opt=SECTION_OPTS.find(s=>s.nav===nav)||{label:nav,ico:'\u2B21'};
      return`<div class="ct-shortcut" onclick="${oc("navTo('"+nav+"')")}">
        <div class="ct-s-ico" style="background:${abg(me().color)};color:${me().color}">${opt.ico}</div>
        <div class="ct-s-name">${t.label||opt.label}</div>
      </div>`;
    }
    case 'clock':{
      if(!editMode)setTimeout(()=>{document.querySelectorAll('.dash-clock').forEach(el=>{const n=new Date();el.textContent=n.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'});});},60000-(Date.now()%60000));
      return`<div class="ct-clock"><div class="ct-clock-time dash-clock">${today.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})}</div><div class="ct-clock-date">${today.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})}</div></div>`;
    }
    case 'calendar':{
      const upcoming=S.events.filter(ev=>ev.date>=today.toISOString().slice(0,10)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
      return`<div class="ct-calendar"><div class="ct-cal-title">Upcoming</div>${upcoming.length===0?'<div style="font-size:11px;color:var(--ink-s);font-style:italic;">No events</div>':upcoming.map(ev=>{const d=new Date(ev.date+'T00:00');return'<div class="ct-cal-item"><span class="ct-cal-date">'+d.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+'</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ev.title+'</span></div>';}).join('')}</div>`;
    }
    case 'project':{
      const p=gproj(t.projId);if(!p)return'<div class="ct-shortcut" style="opacity:.5;pointer-events:none">Project removed</div>';
      const goProj=oc("navTo('projects');setTimeout(()=>{S.projDetailId='"+p.id+"';rc();},50)");
      return`<div class="ct-shortcut" onclick="${goProj}"><div class="ct-s-ico" style="background:${abg(p.color)};color:${p.color}">📁</div><div class="ct-s-name">${p.title}</div><div class="ct-s-desc">${p.status}</div></div>`;
    }
    case 'progress':{
      const p=gproj(t.projId);if(!p)return'<div class="ct-progress" style="opacity:.5"><div class="ct-prog-name">Project removed</div></div>';
      const prog=pProgress(p);const done=(p.tasks||[]).filter(tk=>tk.done).length;const total=(p.tasks||[]).length;
      const goProj=oc("navTo('projects');setTimeout(()=>{S.projDetailId='"+p.id+"';rc();},50)");
      return`<div class="ct-progress"><div class="ct-prog-name" onclick="${goProj}">${p.title}</div><div class="ct-prog-bar-wrap"><div class="ct-prog-bar" style="width:${prog}%"></div></div><div class="ct-prog-meta">${prog}% · ${done}/${total} tasks</div></div>`;
    }
    case 'todolist':{
      const l=gtl(t.listId);if(!l)return'<div class="ct-todo" style="opacity:.5"><div>List removed</div></div>';
      const items=(l.items||[]).slice(0,5);const done=l.items.filter(i=>i.done).length;
      const goTodo=oc("S.activeTodoListId='"+l.id+"';navTo('todos')");
      return`<div class="ct-todo" onclick="${goTodo}"><div class="ct-todo-title"><span>${l.name}</span><span>${done}/${l.items.length}</span></div>${items.map(i=>'<div class="ct-todo-item"><div class="ct-todo-check'+(i.done?' done':'')+'"></div><span style="'+(i.done?'text-decoration:line-through;opacity:.5':'')+'">'+(i.text||'')+'</span></div>').join('')}${l.items.length>5?'<div style="font-size:10px;color:var(--ink-s);">+'+(l.items.length-5)+' more</div>':''}</div>`;
    }
    case 'note':{
      return`<div class="ct-note"><div class="ct-note-title">Note</div><textarea placeholder="Write something…" oninput="updateDashNote('${t.id}',this.value);event.stopPropagation()" onclick="event.stopPropagation()" style="flex:1;min-height:40px;">${t.text||''}</textarea></div>`;
    }
    default: return'<div style="padding:10px;font-size:11px;color:var(--ink-s);">Unknown tile</div>';
  }
}
function toggleDashEdit(){const d=getDash();d.editMode=!d.editMode;if(!d.editMode)S._dashAddBlock=null;rc();}
function openDashAddPanel(blkId){S._dashAddBlock=blkId;rc();}
function addDashTileToBlock(blkId,type,ref){
  const d=getDash();
  const blk=d.blocks.find(b=>b.id===blkId);if(!blk)return;
  const id='dt-'+Date.now();
  const tile={id,type,w:1};
  if(type==='shortcut'){const opt=SECTION_OPTS.find(s=>s.nav===ref);tile.nav=ref;tile.label=opt?.label||ref;tile.ico=opt?.ico||'⬡';}
  else if(type==='project'||type==='progress')tile.projId=ref;
  else if(type==='todolist')tile.listId=ref;
  else if(type==='note')tile.text='';
  tile._blkId=blkId;
  blk.tiles.push(tile);
  S._dashAddBlock=null;rc();
}
function removeDashTileFromBlock(blkId,tileId){
  const d=getDash();const blk=d.blocks.find(b=>b.id===blkId);
  if(blk)blk.tiles=blk.tiles.filter(t=>t.id!==tileId);rc();
}
function resizeDashTile(blkId,tileId,delta){
  const d=getDash();const blk=d.blocks.find(b=>b.id===blkId);if(!blk)return;
  const t=blk.tiles.find(x=>x.id===tileId);if(t){t.w=Math.max(1,Math.min(3,(t.w||1)+delta));rc();}
}
function updateDashNote(tileId,val,blkId){
  const d=getDash();
  for(const blk of d.blocks){const t=blk.tiles.find(x=>x.id===tileId);if(t){t.text=val;queueSave();return;}}
}
// Keep old function names as aliases for any callers
function addDashTile(type,ref){const d=getDash();addDashTileToBlock(d?.blocks?.[0]?.id||'blk-1',type,ref);}
function removeDashTile(id){const d=getDash();for(const b of d.blocks){const i=b.tiles.findIndex(t=>t.id===id);if(i>-1){b.tiles.splice(i,1);rc();return;}}}
function buildProfiles(){
  if(!S.selectedProfileId)S.selectedProfileId=S.activeId;
  const selId=S.selectedProfileId;const alter=selId?ga(selId):null;const buf=S.profileEdit;const display=buf||alter;const isActive=selId===S.activeId;return `<div class="prof-layout"><div class="prof-list">${sortedAlters(S.alters).map(a=>`<div class="prof-item${selId===a.id?' act':''}" onclick="selectProfile('${a.id}')"><div class="prof-av" style="background:${abg(a.color)};color:${a.color}">${aAv(a)}</div><div style="flex:1"><div style="font-size:13px;font-weight:500;color:var(--ink)">${a.name}</div><div style="font-size:11px;color:var(--ink-s)">${a.role}</div></div>${a.id===S.activeId?`<div style="width:7px;height:7px;border-radius:50%;background:var(--sage);flex-shrink:0;"></div>`:''}</div>`).join('')}<div style="padding:10px;"><button class="add-bcard" style="min-height:40px;border-radius:var(--rsm);" onclick="openNewAlterModal()">+ Add alter</button></div></div>${display?`<div class="profile-panel"><div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:20px;"><div class="big-pic-wrap${display.photo?' av-has-photo':''}" style="position:relative;width:76px;height:76px;border-radius:50%;background:${abg(display.color)};color:${display.color};display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:500;font-family:var(--font-serif);flex-shrink:0;overflow:hidden;">${aAv(display)}${isActive?`<div class="big-pic-edit" onclick="triggerPhotoUpload('${display.id}')">✎</div>`:''}</div><div><div class="pname-lg">${display.name}</div><div style="display:flex;gap:7px;align-items:center;margin-top:6px;flex-wrap:wrap;"><span class="status-pill ${isActive?'sp-active':'sp-inactive'}">${isActive?'Currently fronting':'Not fronting'}</span><span style="font-size:12px;color:var(--ink-s)">${display.pronouns} · ${display.role}${display.age?' · Age '+display.age:''}</span>${!isActive?`<button class="tbtn" style="font-size:11px;padding:3px 8px;" onclick="openDMToAlter('${selId}')">💬 Message</button>`:''}</div></div></div>${isActive?`<div class="notice notice-edit">✦ Editing as ${display.name} — profile is unlocked.</div>`:`<div class="notice notice-lock">🔒 Switch to ${display.name} as fronting alter to edit.</div>`}${buildProfileStats(selId)}<div class="sec-lbl">Identity</div><div class="field-grid"><div class="field"><label>Name</label><input value="${display.name}" ${isActive?'':'disabled'} oninput="pbuf('name',this.value)"></div><div class="field"><label>Pronouns</label><input value="${display.pronouns}" ${isActive?'':'disabled'} oninput="pbuf('pronouns',this.value)"></div><div class="field"><label>Role</label><input value="${display.role}" ${isActive?'':'disabled'} oninput="pbuf('role',this.value)"></div><div class="field"><label>Age</label><input value="${display.age||''}" ${isActive?'':'disabled'} oninput="pbuf('age',this.value)"></div></div><div class="sec-lbl">Nicknames &amp; alt names</div><div style="margin-bottom:16px;">${buildNicknamesEditor(display,isActive)}</div><div class="sec-lbl">Flags</div><div style="margin-bottom:16px;">${buildFlagsDisplay(display,isActive,'addAlterFlag','removeAlterFlag')}</div><div class="sec-lbl">Profile photo</div><div style="margin-bottom:16px;">${buildPhotoUploader(display,isActive)}</div><input type="file" id="photoInp" accept="image/*" style="display:none;" onchange="handlePhotoUpload(event)"><div class="sec-lbl">Colour</div><div class="col-row" style="margin-bottom:16px;">${ACOLS.map(c=>`<div class="csw${display.color===c.h?' on':''}${isActive?'':' dis'}" style="background:${c.h};${!isActive?'opacity:.4;cursor:not-allowed;':''}" ${isActive?`onclick="pbuf('color','${c.h}');rc()"`:''} ></div>`).join('')}</div><div class="sec-lbl">Traits</div><div style="margin-bottom:16px;">${buildTraitEditor(display,isActive,selId)}</div><div style="height:1px;background:var(--brd);margin-bottom:16px;"></div><div style="font-size:12px;color:var(--ink-s);margin-bottom:14px;padding:8px 12px;background:var(--paper);border-radius:var(--rsm);">Theme, appearance &amp; book view preferences → <button class="tbtn" style="font-size:11px;padding:3px 8px;" onclick="navTo('preferences')">Open Preferences</button></div><div class="sec-lbl">Notes</div><div class="field" style="margin-bottom:12px;"><textarea ${isActive?'':'disabled'} oninput="pbuf('notes',this.value)">${display.notes||''}</textarea></div><div class="field-grid"><div class="field"><div class="sec-lbl">Triggers</div><textarea ${isActive?'':'disabled'} oninput="pbuf('triggers',this.value)">${display.triggers||''}</textarea></div><div class="field"><div class="sec-lbl">Comforts</div><textarea ${isActive?'':'disabled'} oninput="pbuf('comforts',this.value)">${display.comforts||''}</textarea></div></div>${isActive?`<div style="display:flex;gap:8px;margin-top:16px;"><button class="mbtn-p" onclick="saveProfile()">Save profile</button>${buf?`<button class="mbtn-s" onclick="S.profileEdit=null;rc()">Discard</button>`:''}</div>`:''}</div>`:`<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-s);font-size:13px;">Select a profile</div>`}</div>`;}
function buildProfileStats(alterId){
  const msgCount=S.conversations.reduce((n,c)=>n+(c.messages||[]).filter(m=>m.from===alterId).length,0);
  const pollCount=(S.polls||[]).filter(p=>p.createdBy===alterId).length;
  const annCount=(S.announcements||[]).filter(a=>a.author===alterId).length;
  const myGroups=(S.groups||[]).filter(g=>(g.members||[]).includes(alterId));
  const myRegs=(S.registries||[]).filter(r=>(r.members||[]).includes(alterId));
  const statItems=[
    {val:msgCount,lbl:'Messages sent'},
    {val:pollCount,lbl:'Polls created'},
    {val:annCount,lbl:'Announcements'},
  ];
  const statsHtml=statItems.map(s=>`<div class="stat-chip"><div class="stat-chip-val">${s.val}</div><div class="stat-chip-lbl">${s.lbl}</div></div>`).join('');
  const groupsHtml=myGroups.length
    ?myGroups.map(g=>`<span class="membership-tag" onclick="S.grpDetailId='${g.id}';navTo('groups')" style="cursor:pointer;" title="Go to ${g.name}">${g.name}</span>`).join('')
    :`<span style="font-size:12px;color:var(--ink-s);font-style:italic;">None yet</span>`;
  const regsHtml=myRegs.length
    ?myRegs.map(r=>`<span class="membership-tag" onclick="S.regDetailId='${r.id}';navTo('registry')" style="cursor:pointer;" title="Go to ${r.title}">${r.title}</span>`).join('')
    :`<span style="font-size:12px;color:var(--ink-s);font-style:italic;">None yet</span>`;
  return `<div style="margin-bottom:16px;"><div class="sec-lbl" style="margin-bottom:8px;">Stats</div><div class="prof-stats-row">${statsHtml}</div></div>`
    +`<div style="margin-bottom:16px;"><div class="sec-lbl" style="margin-bottom:10px;">Member of</div>`
    +`<div style="margin-bottom:9px;"><div style="font-size:10px;color:var(--ink-s);text-transform:uppercase;letter-spacing:.5px;font-weight:500;margin-bottom:5px;">Groups</div><div class="membership-tags">${groupsHtml}</div></div>`
    +`<div><div style="font-size:10px;color:var(--ink-s);text-transform:uppercase;letter-spacing:.5px;font-weight:500;margin-bottom:5px;">Registries</div><div class="membership-tags">${regsHtml}</div></div></div>`
    +`<div style="height:1px;background:var(--brd);margin-bottom:16px;"></div>`;
}
function buildTraitEditor(display,canEdit,alterId){
  const traits=display.traits||[];
  if(!canEdit)return`<div class="tags-wrap">${traits.map(t=>`<span class="tag">${t}</span>`).join('')}${!traits.length?'<span style="font-size:12px;color:var(--ink-s)">No traits</span>':''}</div>`;
  // Collect all existing traits from other alters for suggestions
  const allTraits=[...new Set(S.alters.filter(a=>a.id!==alterId).flatMap(a=>a.traits||[]))].filter(t=>!traits.includes(t)).sort();
  const suggestionsHtml=allTraits.length?`<div id="trait-sugg-${alterId}" style="display:none;flex-wrap:wrap;gap:4px;margin-top:6px;padding:6px 8px;background:var(--paper);border-radius:var(--rsm);border:1px solid var(--brd-s);">
    <div style="font-size:10px;color:var(--ink-s);text-transform:uppercase;letter-spacing:.5px;font-weight:500;width:100%;margin-bottom:3px;">From other alters</div>
    ${allTraits.map(t=>`<span class="tag" style="cursor:pointer;opacity:.7;" onclick="addTraitFromSugg('${alterId}','${t.replace(/'/g,"&#39;")}')" title="Add this trait">${t} +</span>`).join('')}
  </div>`:'';
  return`<div class="tags-wrap">${traits.map((t,i)=>`<span class="tag">${t}<span class="tag-x" onclick="removeTrait(${i})">×</span></span>`).join('')}<input class="tag-inp" id="trait-inp-${alterId}" placeholder="Add trait…" onkeydown="traitKey(event,'${alterId}')" onfocus="showTraitSugg('${alterId}')" onblur="setTimeout(()=>hideTraitSugg('${alterId}'),200)"></div>${suggestionsHtml}`;
}
function showTraitSugg(aid){const el=document.getElementById('trait-sugg-'+aid);if(el)el.style.display='flex';}
function hideTraitSugg(aid){const el=document.getElementById('trait-sugg-'+aid);if(el)el.style.display='none';}
function addTraitFromSugg(aid,trait){
  if(!S.profileEdit)S.profileEdit=JSON.parse(JSON.stringify(ga(S.selectedProfileId)));
  if(!S.profileEdit.traits)S.profileEdit.traits=[];
  if(!S.profileEdit.traits.includes(trait))S.profileEdit.traits.push(trait);
  rc();setTimeout(()=>{const i=document.getElementById('trait-inp-'+aid);if(i)i.focus();},0);
}
const THEMES=[
  {id:'library',label:'Library',swatches:['#6B5240','#EDE5D8','#4A6358']},
  {id:'cozy',label:'Cozy',swatches:['#7A8F7E','#FAF6F0','#B87E6A']},
  {id:'journal',label:'Journal',swatches:['#5C4832','#F5F0E6','#4A5C4A']},
  {id:'cathedral',label:'Cathedral',swatches:['#7A6A52','#F8F7F5','#A09280']},
];
function buildPreferences(){
  const a=me();
  const prefs=a.prefs||{};
  return`<div style="padding:28px;max-width:560px;">
    <div style="font-family:var(--font-serif);font-size:22px;color:var(--ink);margin-bottom:4px;">Preferences</div>
    <div style="font-size:13px;color:var(--ink-s);margin-bottom:24px;">Settings saved to <b>${a.name}</b> — each alter has their own.</div>

    <div class="sec-lbl" style="margin-bottom:10px;">Theme &amp; appearance</div>
    <div style="margin-bottom:24px;">${buildThemePicker(a,true,true)}</div>

    <div style="height:1px;background:var(--brd);margin-bottom:20px;"></div>

    <div class="sec-lbl" style="margin-bottom:4px;">Your profile</div>
    <div style="font-size:12px;color:var(--ink-s);margin-bottom:14px;">These appear on your profile. Each alter has their own.</div>
    <div class="field-grid" style="margin-bottom:14px;">
      <div class="field"><label>Name</label><input value="${a.name}" oninput="prefUpdateAlter('name',this.value)"></div>
      <div class="field"><label>Pronouns</label><input value="${a.pronouns||''}" oninput="prefUpdateAlter('pronouns',this.value)"></div>
      <div class="field"><label>Nickname</label><input value="${(a.nicknames||[])[0]||''}" placeholder="Display nickname…" oninput="prefUpdateNickname(this.value)"></div>
      <div class="field"><label>Age</label><input value="${a.age||''}" placeholder="—" oninput="prefUpdateAlter('age',this.value)" style="width:80px;"></div>
    </div>
    <div style="font-size:11px;color:var(--ink-s);text-transform:uppercase;letter-spacing:.5px;font-weight:500;margin-bottom:8px;">Profile colour</div>
    <div class="col-row" style="margin-bottom:24px;">${ACOLS.map(c=>`<div class="csw${a.color===c.h?' on':''}" style="background:${c.h}" onclick="prefUpdateAlter('color','${c.h}');rc()"></div>`).join('')}</div>

    <div style="height:1px;background:var(--brd);margin-bottom:20px;"></div>

    <div class="sec-lbl" style="margin-bottom:4px;">Book view mode</div>
    <div style="font-size:12px;color:var(--ink-s);margin-bottom:10px;">Choose how pages turn when reading books.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;">
      <button class="view-mode-btn${!prefs.bookCarousel?' on':''}" onclick="setPref('bookCarousel',false)">
        <span style="font-size:16px;">📖</span> Spread view<br><span style="font-size:10px;font-weight:400;color:var(--ink-s);">Two pages side by side</span>
      </button>
      <button class="view-mode-btn${prefs.bookCarousel?' on':''}" onclick="setPref('bookCarousel',true)">
        <span style="font-size:16px;">◀▶</span> Carousel view<br><span style="font-size:10px;font-weight:400;color:var(--ink-s);">Pages slide in from the side</span>
      </button>
    </div>

    <div style="height:1px;background:var(--brd);margin-bottom:20px;"></div>

    <div class="sec-lbl" style="margin-bottom:4px;">Dashboard</div>
    <div style="font-size:12px;color:var(--ink-s);margin-bottom:10px;">Customise your dashboard layout from the Dashboard section.</div>
    <button class="tbtn" onclick="navTo('dashboard');setTimeout(()=>{const d=getDash();d.editMode=true;rc();},100)">✎ Edit dashboard layout</button>
  </div>`;
}
function setPref(key,val){
  const a=me();
  if(!a.prefs)a.prefs={};
  a.prefs[key]=val;
  if(key==='bookCarousel'){}// no extra side effects needed
  // Theme changes go through pbuf still
  queueSave();rc();
}
function prefUpdateAlter(field,val){
  const a=me();if(!a)return;
  a[field]=val;
  queueSave();
  if(field==='theme'||field==='mode'||field==='color')applyTheme();
}
function prefUpdateNickname(val){
  const a=me();if(!a)return;
  if(!a.nicknames)a.nicknames=[];
  const trimmed=val.trim();
  if(trimmed){a.nicknames[0]=trimmed;}
  else if(a.nicknames.length>0){a.nicknames.shift();}
  queueSave();
}
function buildThemePicker(display,canEdit,direct){
  // direct=true  → writes straight to the alter via prefUpdateAlter (used in Preferences)
  // direct=false → writes to the pending profileEdit buffer via pbuf (used in Profiles)
  const LEGACY={sage:'library',sunset:'library',midnight:'cathedral',nature:'cozy'};
  const rawTheme=display.theme||'library';
  const curTheme=LEGACY[rawTheme]||rawTheme;
  const curMode=display.mode||'light';
  const setTheme=direct?`prefUpdateAlter('theme',`:`pbuf('theme',`;
  const setMode =direct?`prefUpdateAlter('mode',` :`pbuf('mode',`;
  const themeCards=THEMES.map(t=>{
    const on=curTheme===t.id;
    const dis=!canEdit;
    return`<div class="theme-card${on?' on':''}" style="${dis?'opacity:.5;cursor:not-allowed;':''}" ${canEdit?`onclick="${setTheme}'${t.id}');rc()"`:''}>
      <div class="theme-swatches">${t.swatches.map(s=>`<div class="theme-sw" style="background:${s};"></div>`).join('')}</div>
      <div class="theme-card-label">${t.label}</div>
    </div>`;
  }).join('');
  const modeToggle=`<div class="mode-toggle" style="${!canEdit?'opacity:.5;pointer-events:none;':''}">
    <button class="mode-btn${curMode==='light'?' on':''}" ${canEdit?`onclick="${setMode}'light');rc()"`:''}>☀ Light</button>
    <button class="mode-btn${curMode==='dark'?' on':''}" ${canEdit?`onclick="${setMode}'dark');rc()"`:''}>☾ Dark</button>
  </div>`;
  return`<div class="theme-picker">
    <div class="theme-grid">${themeCards}</div>
    ${modeToggle}
  </div>`;
}
function pbuf(f,v){if(!S.profileEdit)S.profileEdit=JSON.parse(JSON.stringify(ga(S.selectedProfileId)));S.profileEdit[f]=v;}
function removeTrait(idx){if(!S.profileEdit)S.profileEdit=JSON.parse(JSON.stringify(ga(S.selectedProfileId)));S.profileEdit.traits.splice(idx,1);rc();}
function traitKey(e,aid){if((e.key==='Enter'||e.key===',')&&e.target.value.trim()){e.preventDefault();const v=e.target.value.trim().replace(/,$/,'');if(!S.profileEdit)S.profileEdit=JSON.parse(JSON.stringify(ga(S.selectedProfileId)));if(!S.profileEdit.traits.includes(v))S.profileEdit.traits.push(v);rc();setTimeout(()=>{const i=document.getElementById('trait-inp-'+aid);if(i)i.focus();},0);}}
function openDMToAlter(alterId){
  // Open or create a DM conversation with this alter, then navigate to comms
  const ex=S.conversations.find(c=>c.type==='direct'&&c.participants.includes(S.activeId)&&c.participants.includes(alterId));
  if(ex){S.activeConvId=ex.id;navTo('communication');return;}
  const id='conv-'+Date.now();
  S.conversations.push({id,type:'direct',participants:[S.activeId,alterId],messages:[]});
  S.activeConvId=id;S.commTab='direct';navTo('communication');
}
function sortedAlters(alters){
  const active=alters.filter(a=>a.id===S.activeId);
  const rest=alters.filter(a=>a.id!==S.activeId).sort((a,b)=>a.name.localeCompare(b.name));
  return [...active,...rest];
}
function saveProfile(){if(!S.profileEdit)return;const i=S.alters.findIndex(a=>a.id===S.selectedProfileId);if(i<0)return;S.alters[i]=JSON.parse(JSON.stringify(S.profileEdit));S.profileEdit=null;render();toast('Profile saved');}
function buildNicknamesEditor(display,isActive){
  const nicks=display.nicknames||[];
  if(!isActive){
    if(nicks.length===0)return`<div style="font-size:12px;color:var(--ink-s);font-style:italic;">No nicknames set.</div>`;
    return`<div style="display:flex;flex-wrap:wrap;gap:6px;">${nicks.map(n=>`<span class="nick-tag">${n}</span>`).join('')}</div>`;
  }
  return`<div class="nick-editor" onclick="document.getElementById('nick-inp').focus()">
    ${nicks.map((n,i)=>`<span class="nick-tag">${n}<span class="nick-tag-x" onclick="removeNickname(${i})">×</span></span>`).join('')}
    <input id="nick-inp" class="pb-tag-inp" style="border:none;background:transparent;min-width:120px;" placeholder="Add nickname…" onkeydown="nickKeydown(event)">
  </div>
  <div style="font-size:11px;color:var(--ink-s);margin-top:4px;">Press Enter or comma to add. These names are searchable across the whole app.</div>`;
}
function nickKeydown(e){
  if(e.key==='Enter'||e.key===','||e.key===';'){
    e.preventDefault();
    const v=e.target.value.trim().replace(/,/g,'');
    if(!v)return;
    addNickname(v);
    e.target.value='';
  }
}
function addNickname(name){
  if(!S.profileEdit)return;
  if(!S.profileEdit.nicknames)S.profileEdit.nicknames=[];
  if(!S.profileEdit.nicknames.includes(name)){
    S.profileEdit.nicknames.push(name);
    // Re-render just the nicknames section without losing focus
    const el=document.querySelector('.nick-editor');
    if(el){
      const nicks=S.profileEdit.nicknames;
      const tagsHtml=nicks.map((n,i)=>`<span class="nick-tag">${n}<span class="nick-tag-x" onclick="removeNickname(${i})">×</span></span>`).join('');
      const inp=el.querySelector('#nick-inp');
      const inpHtml=inp?inp.outerHTML:`<input id="nick-inp" class="pb-tag-inp" style="border:none;background:transparent;min-width:120px;" placeholder="Add nickname…" onkeydown="nickKeydown(event)">`;
      el.innerHTML=tagsHtml+inpHtml;
      el.querySelector('#nick-inp')?.focus();
    }
    queueSave();
  }
}
function removeNickname(idx){
  if(!S.profileEdit||!S.profileEdit.nicknames)return;
  pushUndo({type:'removeNickname',alterId:S.selectedProfileId,nick:S.profileEdit.nicknames[idx],idx});
  S.profileEdit.nicknames.splice(idx,1);
  rc();
}
function profileHasChanges(){
  if(!S.profileEdit)return false;
  const orig=ga(S.selectedProfileId);
  if(!orig)return false;
  // Quick compare — serialise both and check equality
  const a=JSON.stringify(orig);
  const b=JSON.stringify(S.profileEdit);
  return a!==b;
}
async function selectProfile(id){
  if(profileHasChanges()&&S.selectedProfileId&&id!==S.selectedProfileId){
    if(!await confirmDialog('Discard unsaved profile edits?','Unsaved changes'))return;
  }
  S.selectedProfileId=id;S.profileEdit=null;rc();
}
function canSeeBook(b){if(b.viewPerm==='all')return true;if(b.ownerType==='alter'&&b.owner===S.activeId)return true;if(b.ownerType==='group'){const g=gg(b.owner);if(g&&g.members.includes(S.activeId))return true;}if((b.sharedAlters||[]).includes(S.activeId))return true;const myGids=S.groups.filter(g=>g.members.includes(S.activeId)).map(g=>g.id);if((b.sharedGroups||[]).some(gid=>myGids.includes(gid)))return true;return false;}
function buildLibrary(){const visible=S.books.filter(b=>canSeeBook(b));const filtered=S.libFilter==='all'?visible:S.libFilter==='mine'?visible.filter(b=>b.ownerType==='alter'&&b.owner===S.activeId):visible.filter(b=>b.ownerType==='group');const owName=(b)=>{if(b.ownerType==='alter'){const a=ga(b.owner);return a?a.name:'?';}const g=gg(b.owner);return g?g.name:'?';};return `<div style="padding:24px;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;"><div class="lib-title">Library</div><div class="srch"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search…" oninput="S.search=this.value;rc()"></div></div><div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap;">${['all','mine','group'].map(f=>`<button class="fchip${S.libFilter===f?' on':''}" onclick="S.libFilter='${f}';rc()">${f==='all'?'All books':f==='mine'?'My books':'Group books'}</button>`).join('')}</div><div class="book-grid">${filtered.filter(b=>!S.search||b.title.toLowerCase().includes(S.search.toLowerCase())).map(b=>`<div class="bcard" onclick="openBook('${b.id}')"><div class="bcard-spine" style="background:${b.color}"></div><div class="bcard-body"><div class="bcard-title">${b.title}</div><div class="bcard-owner">by ${owName(b)}</div><div class="bcard-tags"><span class="btag" style="background:${b.color}28;color:${b.color}">${b.ownerType==='group'?'group':'personal'}</span><span class="btag" style="background:var(--paper-d);color:var(--ink-s)">${b.chapters.length} ch.</span>${b.viewPerm==='all'?`<span class="btag" style="background:#EAF3DE;color:#3B6D11">all</span>`:''}</div></div></div>`).join('')}<div class="add-bcard" onclick="openNewBookModal()"><div style="width:22px;height:22px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;">+</div><span>New book</span></div></div></div>`;}
function getAllPages(b){const pages=[];pages.push({type:'cover',title:b.title,subtitle:b.subtitle||'',color:b.color,bookId:b.id});let pgNum=1;b.chapters.forEach((ch,ci)=>{ch.pages.forEach((pg,pi)=>{pages.push({type:'content',content:pg.content,num:pgNum++,ci,pi,attachments:pg.attachments||[]});});});return pages;}
function canEditBook(b){if(b.editPerm==='owner'){if(b.ownerType==='alter')return b.owner===S.activeId;return S.groups.find(g=>g.id===b.owner)?.members.includes(S.activeId);}if(b.editPerm==='members'){if(b.ownerType==='group')return S.groups.find(g=>g.id===b.owner)?.members.includes(S.activeId);return b.owner===S.activeId;}return false;}
function isBookOwner(b){if(b.ownerType==='alter')return b.owner===S.activeId;return S.groups.find(g=>g.id===b.owner)?.members.includes(S.activeId);}
/* ── CANVAS BOOK ENGINE ── */
const BOOK_PAGE_W=595,BOOK_PAGE_H=842,SPREAD_GAP=32;
const BC_INK=['#1A1A1A','#555555','#AAAAAA','#C85250','#2D6A9F','#3A9467','#D4921D','#8B5CF6'];
let _bc={tool:'pen',color:'#1A1A1A',width:3,textSize:16,drawing:false,stroke:null,activeCi:-1,activePi:-1};
let _bcUndo={},_bcRedo={},_bcText=null,_bcBlurTimer=null,_bookAnimating=false;

function initCanvasPage(pg){if(!pg.strokes)pg.strokes=[];if(!pg.textBlocks)pg.textBlocks=[];if(!pg.background)pg.background='lined';return pg;}
function bcPageKey(ci,pi){return ci+'-'+pi;}
function bcPushUndo(bid,ci,pi,strokes,textBlocks){const k=bcPageKey(ci,pi);if(!_bcUndo[k])_bcUndo[k]=[];_bcUndo[k].push({strokes:JSON.parse(JSON.stringify(strokes)),textBlocks:JSON.parse(JSON.stringify(textBlocks||[]))});if(_bcUndo[k].length>200)_bcUndo[k].shift();if(!_bcRedo[k])_bcRedo[k]=[];_bcRedo[k]=[];}
function getCurrentContentPage(b){
  if(_bc.activeCi>=0&&_bc.activePi>=0&&b.chapters[_bc.activeCi]&&b.chapters[_bc.activeCi].pages[_bc.activePi])
    return{ci:_bc.activeCi,pi:_bc.activePi};
  const allPages=getAllPages(b);
  const visCount=S.bookOnePage?1:2;
  for(let i=0;i<visCount;i++){const pg=allPages[S.bookSpread+i];if(pg&&pg.type==='content')return{ci:pg.ci,pi:pg.pi};}
  return{ci:-1,pi:-1};
}
function jumpToCanvasPage(bid,ci,pi){const b=gb(bid);if(!b)return;const allPages=getAllPages(b);const idx=allPages.findIndex(p=>p.type==='content'&&p.ci===ci&&p.pi===pi);if(idx>=0){S.bookSpread=idx;rc();}}

function drawBackground(ctx,type,w,h){
  ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,w,h);
  if(type==='lined'){
    const lH=36;ctx.strokeStyle='rgba(170,190,215,0.55)';ctx.lineWidth=1;
    for(let y=lH;y<h;y+=lH){ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(w-24,y);ctx.stroke();}
    ctx.strokeStyle='rgba(220,140,140,0.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(72,0);ctx.lineTo(72,h);ctx.stroke();
  }else if(type==='dotted'){
    ctx.fillStyle='rgba(170,175,200,0.75)';const gap=26;
    for(let x=gap;x<w;x+=gap)for(let y=gap;y<h;y+=gap){ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();}
  }else if(type==='grid'){
    ctx.strokeStyle='rgba(175,185,215,0.35)';ctx.lineWidth=1;const gap=28;
    for(let x=gap;x<w;x+=gap){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=gap;y<h;y+=gap){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  }
}

function drawStroke(ctx,stroke){
  const pts=stroke.points;if(!pts||pts.length<1)return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(stroke.tool==='eraser'){ctx.globalCompositeOperation='destination-out';ctx.strokeStyle='rgba(0,0,0,1)';ctx.lineWidth=stroke.width*3;}
  else if(stroke.tool==='marker'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=0.35;ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width*5;}
  else if(stroke.tool==='pencil'){ctx.globalAlpha=0.72;ctx.strokeStyle=stroke.color;ctx.lineWidth=Math.max(1,stroke.width*0.7);}
  else{ctx.globalAlpha=1;ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width;}
  if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,Math.max(ctx.lineWidth/2,1),0,Math.PI*2);ctx.fillStyle=ctx.strokeStyle;ctx.fill();}
  else{ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length-1;i++){const mx=(pts[i].x+pts[i+1].x)/2,my=(pts[i].y+pts[i+1].y)/2;ctx.quadraticCurveTo(pts[i].x,pts[i].y,mx,my);}ctx.lineTo(pts[pts.length-1].x,pts[pts.length-1].y);ctx.stroke();}
  ctx.restore();
}

function drawTextBlocks(ctx,textBlocks){
  (textBlocks||[]).forEach(tb=>{
    ctx.save();
    ctx.font=`${tb.italic?'italic ':''} ${tb.bold?'bold ':''} ${tb.fontSize||16}px ${tb.fontFamily||'sans-serif'}`;
    ctx.fillStyle=tb.color||'#1A1A1A';ctx.globalAlpha=1;
    const lines=(tb.text||'').split('\n');const lh=(tb.fontSize||16)*1.5;
    lines.forEach((ln,i)=>ctx.fillText(ln,tb.x,tb.y+i*lh));
    ctx.restore();
  });
}

function renderPageCanvas(canvas,page){
  if(!canvas)return;
  const dpr=window.devicePixelRatio||1;
  const ctx=canvas.getContext('2d');
  ctx.save();ctx.scale(dpr,dpr);
  drawBackground(ctx,page.background||'lined',BOOK_PAGE_W,BOOK_PAGE_H);
  (page.strokes||[]).forEach(s=>drawStroke(ctx,s));
  drawTextBlocks(ctx,page.textBlocks);
  ctx.restore();
}

function initBookCanvases(){
  const b=gb(S.bookId);if(!b)return;
  const dpr=window.devicePixelRatio||1;
  document.querySelectorAll('.book-canvas-page canvas[data-ci][data-pi]').forEach(canvas=>{
    const ci=+canvas.dataset.ci,pi=+canvas.dataset.pi;
    if(isNaN(ci)||isNaN(pi))return;
    canvas.width=BOOK_PAGE_W*dpr;canvas.height=BOOK_PAGE_H*dpr;
    canvas.style.width=BOOK_PAGE_W+'px';canvas.style.height=BOOK_PAGE_H+'px';
    if(b.chapters[ci]&&b.chapters[ci].pages[pi])renderPageCanvas(canvas,initCanvasPage(b.chapters[ci].pages[pi]));
  });
  const tW=66,tH=93;
  b.chapters.forEach((ch,ci)=>{ch.pages.forEach((pg,pi)=>{
    const tc=document.getElementById('thumb-canvas-'+ci+'-'+pi);if(!tc)return;
    tc.width=tW*dpr;tc.height=tH*dpr;tc.style.width=tW+'px';tc.style.height=tH+'px';
    const page=initCanvasPage(pg);const ctx=tc.getContext('2d');
    ctx.save();ctx.scale(dpr*tW/BOOK_PAGE_W,dpr*tH/BOOK_PAGE_H);
    drawBackground(ctx,page.background||'lined',BOOK_PAGE_W,BOOK_PAGE_H);
    (page.strokes||[]).forEach(s=>drawStroke(ctx,s));
    drawTextBlocks(ctx,page.textBlocks);
    ctx.restore();
  });});
}

function refreshMainCanvas(){
  const b=gb(S.bookId);if(!b)return;
  let ci=_bc.activeCi,pi=_bc.activePi;
  if(ci<0||pi<0){const cp=getCurrentContentPage(b);ci=cp.ci;pi=cp.pi;}
  if(ci<0||pi<0)return;
  const canvas=document.querySelector(`canvas[data-ci="${ci}"][data-pi="${pi}"]`);
  if(canvas)renderPageCanvas(canvas,initCanvasPage(b.chapters[ci].pages[pi]));
  const dpr=window.devicePixelRatio||1;const tW=66,tH=93;
  const tc=document.getElementById('thumb-canvas-'+ci+'-'+pi);
  if(tc){
    tc.width=tW*dpr;tc.height=tH*dpr;tc.style.width=tW+'px';tc.style.height=tH+'px';
    const page=b.chapters[ci].pages[pi];const ctx=tc.getContext('2d');
    ctx.save();ctx.scale(dpr*tW/BOOK_PAGE_W,dpr*tH/BOOK_PAGE_H);
    drawBackground(ctx,page.background||'lined',BOOK_PAGE_W,BOOK_PAGE_H);
    (page.strokes||[]).forEach(s=>drawStroke(ctx,s));
    drawTextBlocks(ctx,page.textBlocks);
    ctx.restore();
  }
}

function getBookCoords(e,canvas){
  const rect=canvas.getBoundingClientRect();
  return{x:(e.clientX-rect.left)*(BOOK_PAGE_W/rect.width),y:(e.clientY-rect.top)*(BOOK_PAGE_H/rect.height)};
}

function bookCvsDown(e){
  const canvas=e.target;if(!canvas||!canvas.dataset)return;
  const ci=+canvas.dataset.ci,pi=+canvas.dataset.pi;if(isNaN(ci)||isNaN(pi))return;
  const b=gb(S.bookId);if(!b)return;
  _bc.activeCi=ci;_bc.activePi=pi;
  const page=initCanvasPage(b.chapters[ci].pages[pi]);
  if(page.locked){toast('Page is locked');return;}
  e.preventDefault();
  if(_bc.tool==='text'){bookStartText(e,canvas,ci,pi);return;}
  bookCommitText(b,ci,pi);
  const{x,y}=getBookCoords(e,canvas);
  _bc.drawing=true;
  _bc.stroke={id:'sk-'+Date.now(),tool:_bc.tool,color:_bc.color,width:_bc.width,points:[{x,y}]};
  canvas.setPointerCapture(e.pointerId);
  bcPushUndo(b.id,ci,pi,page.strokes,page.textBlocks);
}

function bookCvsMove(e){
  if(!_bc.drawing||!_bc.stroke)return;
  const canvas=e.target;if(!canvas)return;
  e.preventDefault();
  const{x,y}=getBookCoords(e,canvas);
  _bc.stroke.points.push({x,y});
  const pts=_bc.stroke.points;
  const dpr=window.devicePixelRatio||1;
  const ctx=canvas.getContext('2d');
  ctx.save();ctx.scale(dpr,dpr);
  drawStroke(ctx,{..._bc.stroke,points:pts.slice(Math.max(0,pts.length-4))});
  ctx.restore();
}

function bookCvsUp(e){
  if(_bc.tool==='text'&&_bcText){setTimeout(()=>{if(_bcText)_bcText.el.focus();},0);return;}
  if(!_bc.drawing||!_bc.stroke)return;
  _bc.drawing=false;
  const b=gb(S.bookId);if(!b)return;
  const ci=_bc.activeCi,pi=_bc.activePi;if(ci<0||pi<0)return;
  b.chapters[ci].pages[pi].strokes.push(_bc.stroke);
  _bc.stroke=null;
  queueSave();refreshMainCanvas();
}

function hitTestTextBlock(textBlocks,x,y,canvas){
  if(!canvas){canvas=document.querySelector('.book-canvas-page canvas[data-ci]');}
  if(!canvas)return -1;
  const ctx=canvas.getContext('2d');
  for(let i=textBlocks.length-1;i>=0;i--){
    const tb=textBlocks[i];const fs=tb.fontSize||16;const lh=fs*1.5;
    const lines=(tb.text||'').split('\n');
    const yTop=tb.y-fs*1.2;const yBot=tb.y+(lines.length-1)*lh+fs*0.4;
    if(y<yTop||y>yBot)continue;
    ctx.font=`${tb.italic?'italic ':''} ${tb.bold?'bold ':''} ${fs}px ${tb.fontFamily||'sans-serif'}`;
    const maxW=Math.max(...lines.map(ln=>ctx.measureText(ln).width));
    if(x>=tb.x-8&&x<=tb.x+maxW+8)return i;
  }
  return -1;
}

function bookStartText(e,canvas,ci,pi){
  const b=gb(S.bookId);if(!b)return;
  bookCommitText(b,ci,pi);
  const{x,y}=getBookCoords(e,canvas);
  const page=initCanvasPage(b.chapters[ci].pages[pi]);
  const hitIdx=hitTestTextBlock(page.textBlocks,x,y,canvas);
  let existing=null;
  if(hitIdx>=0){
    bcPushUndo(b.id,ci,pi,page.strokes,page.textBlocks);
    existing=page.textBlocks.splice(hitIdx,1)[0];
    _bc.textSize=existing.fontSize||16;
    const _sl=document.querySelector('.bc-width-slider');const _lb=document.getElementById('bc-w-lbl');
    if(_sl)_sl.value=_bc.textSize;if(_lb)_lb.textContent=_bc.textSize+'px';
    refreshMainCanvas();
  }
  const fs=existing?existing.fontSize:(_bc.textSize||16);
  const col=existing?existing.color:_bc.color;
  const cx=existing?existing.x:x;
  const cy=existing?existing.y-fs:y;
  const cssX=cx;
  const cssY=cy;
  const wrap=canvas.parentElement;if(!wrap)return;
  const ta=document.createElement('textarea');
  ta.className='book-text-editor';
  ta.style.cssText='left:'+cssX+'px;top:'+cssY+'px;font-size:'+fs+'px;color:'+col+';height:'+(fs*3.5)+'px;';
  if(existing)ta.value=existing.text;
  ta.placeholder='Type here…';
  wrap.appendChild(ta);
  ta.addEventListener('pointerdown',ev=>ev.stopPropagation());
  _bcText={el:ta,cx,cy,ci,pi,bid:b.id,fontSize:fs,color:col,isEdit:hitIdx>=0};
  ta.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if(_bcBlurTimer){clearTimeout(_bcBlurTimer);_bcBlurTimer=null;}ta.remove();_bcText=null;if(existing){page.textBlocks.splice(hitIdx,0,existing);refreshMainCanvas();}}});
  ta.addEventListener('focus',()=>{if(_bcBlurTimer){clearTimeout(_bcBlurTimer);_bcBlurTimer=null;}});
  ta.addEventListener('blur',()=>{_bcBlurTimer=setTimeout(()=>{_bcBlurTimer=null;const bb=gb(S.bookId);if(bb)bookCommitText(bb,ci,pi);},200);});
  requestAnimationFrame(()=>{if(_bcText&&_bcText.el===ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);}});
}

function bookCommitText(b,ci,pi){
  if(!_bcText||_bcText.bid!==b.id||_bcText.ci!==ci||_bcText.pi!==pi)return;
  const text=_bcText.el.value.trim();
  const{cx,cy,fontSize,color,isEdit}=_bcText;
  _bcText.el.remove();_bcText=null;
  if(!text)return;
  const page=initCanvasPage(b.chapters[ci].pages[pi]);
  if(!isEdit)bcPushUndo(b.id,ci,pi,page.strokes,page.textBlocks);
  page.textBlocks.push({id:'tb-'+Date.now(),x:cx,y:cy+fontSize,text,fontSize,color,bold:false,italic:false,fontFamily:'sans-serif'});
  queueSave();refreshMainCanvas();
}

function setBookTool(t){
  _bc.tool=t;
  document.querySelectorAll('.btool[data-tool]').forEach(el=>el.classList.toggle('act',el.dataset.tool===t));
  document.querySelectorAll('.book-canvas-page canvas').forEach(c=>{
    c.className='';
    if(t==='text')c.classList.add('cur-text');
    else if(t==='eraser')c.classList.add('cur-eraser');
  });
  const wrap=document.querySelector('.bc-width-wrap');
  if(wrap){
    if(t==='text'){
      const fs=_bc.textSize||16;
      wrap.innerHTML=`<span>Font</span><input type="range" class="bc-width-slider" min="8" max="96" value="${fs}" oninput="setBookTextSize(this.value)"><span id="bc-w-lbl">${fs}px</span>`;
    }else{
      wrap.innerHTML=`<span>Size</span><input type="range" class="bc-width-slider" min="1" max="20" value="${_bc.width}" oninput="setBookWidth(this.value)"><span id="bc-w-lbl">${_bc.width}px</span>`;
    }
  }
}
function setBookColor(c){_bc.color=c;document.querySelectorAll('.bc-swatch').forEach(el=>el.classList.toggle('act',el.dataset.c===c));}
function setBookWidth(w){_bc.width=+w;const lbl=document.getElementById('bc-w-lbl');if(lbl)lbl.textContent=w+'px';}
function setBookTextSize(s){_bc.textSize=+s;const lbl=document.getElementById('bc-w-lbl');if(lbl)lbl.textContent=s+'px';}
function setBookBg(type){const b=gb(S.bookId);if(!b)return;const{ci,pi}=getCurrentContentPage(b);if(ci<0)return;const page=initCanvasPage(b.chapters[ci].pages[pi]);page.background=type;queueSave();refreshMainCanvas();document.querySelectorAll('.btool[data-bg]').forEach(el=>el.classList.toggle('act',el.dataset.bg===type));}

function bookUndo(){
  const b=gb(S.bookId);if(!b)return;const{ci,pi}=getCurrentContentPage(b);if(ci<0)return;
  const k=bcPageKey(ci,pi);const page=b.chapters[ci].pages[pi];
  if(!_bcUndo[k]||!_bcUndo[k].length)return;
  if(!_bcRedo[k])_bcRedo[k]=[];
  _bcRedo[k].push({strokes:JSON.parse(JSON.stringify(page.strokes||[])),textBlocks:JSON.parse(JSON.stringify(page.textBlocks||[]))});
  const prev=_bcUndo[k].pop();page.strokes=prev.strokes;page.textBlocks=prev.textBlocks;
  queueSave();refreshMainCanvas();
}
function bookRedo(){
  const b=gb(S.bookId);if(!b)return;const{ci,pi}=getCurrentContentPage(b);if(ci<0)return;
  const k=bcPageKey(ci,pi);const page=b.chapters[ci].pages[pi];
  if(!_bcRedo[k]||!_bcRedo[k].length)return;
  if(!_bcUndo[k])_bcUndo[k]=[];
  _bcUndo[k].push({strokes:JSON.parse(JSON.stringify(page.strokes||[])),textBlocks:JSON.parse(JSON.stringify(page.textBlocks||[]))});
  const next=_bcRedo[k].pop();page.strokes=next.strokes;page.textBlocks=next.textBlocks;
  queueSave();refreshMainCanvas();
}

function buildBookCanvasToolbar(b){
  if(!canEditBook(b))return'';
  const{ci,pi}=getCurrentContentPage(b);
  const hasContent=ci>=0;
  const pg=hasContent?initCanvasPage(b.chapters[ci].pages[pi]):null;
  const tools=[{t:'pen',ico:'✒'},{t:'pencil',ico:'✏️'},{t:'marker',ico:'🖍'},{t:'eraser',ico:'⊘'},{t:'text',ico:'T'}];
  const toolBtns=tools.map(({t,ico})=>`<button class="btool${_bc.tool===t?' act':''}" data-tool="${t}" onclick="setBookTool('${t}')" title="${t}">${ico}</button>`).join('');
  const swatches=BC_INK.map(c=>`<div class="bc-swatch${_bc.color===c?' act':''}" data-c="${c}" style="background:${c}" onclick="setBookColor('${c}')"></div>`).join('');
  const bgs=[{t:'blank',ico:'□'},{t:'lined',ico:'≡'},{t:'dotted',ico:'·'},{t:'grid',ico:'⊞'}];
  const bgBtns=bgs.map(({t,ico})=>`<button class="btool${pg&&pg.background===t?' act':''}" data-bg="${t}" onclick="setBookBg('${t}')" style="font-size:13px;">${ico}</button>`).join('');
  const locked=pg?!!pg.locked:false;
  return`<div class="book-canvas-tb">
    ${toolBtns}
    <div class="bct-sep"></div>
    <div class="bc-color-row">${swatches}<div class="bc-rainbow"><input type="color" id="bc-clr-inp" oninput="setBookColor(this.value)"></div></div>
    <div class="bct-sep"></div>
    <div class="bc-width-wrap">${_bc.tool==='text'?`<span>Font</span><input type="range" class="bc-width-slider" min="8" max="96" value="${_bc.textSize||16}" oninput="setBookTextSize(this.value)"><span id="bc-w-lbl">${_bc.textSize||16}px</span>`:`<span>Size</span><input type="range" class="bc-width-slider" min="1" max="20" value="${_bc.width}" oninput="setBookWidth(this.value)"><span id="bc-w-lbl">${_bc.width}px</span>`}</div>
    <div class="bct-sep"></div>
    <span style="font-size:11px;color:var(--ink-s);">BG</span>${bgBtns}
    <div class="bct-sep"></div>
    <button class="btool" onclick="bookUndo()" title="Undo (Ctrl+Z)">↩</button>
    <button class="btool" onclick="bookRedo()" title="Redo (Ctrl+Y)">↪</button>
    ${hasContent?`<div class="bct-sep"></div>
    <button class="btool${locked?' act':''}" onclick="togglePageLock('${b.id}',${ci},${pi})" title="${locked?'Unlock':'Lock'} page">${locked?'🔒':'🔓'}</button>
    <button class="btool" onclick="deleteCurrentBookPage('${b.id}',${ci},${pi})" style="color:var(--warm)" title="Delete page">🗑</button>`:''}
  </div>`;
}

function renderSpreadSlot(b,allPages,pageIdx,isOwner){
  if(pageIdx<0||pageIdx>=allPages.length)
    return`<div class="bk-slot" style="width:${BOOK_PAGE_W}px;height:${BOOK_PAGE_H}px;background:transparent;"></div>`;
  const pg=allPages[pageIdx];
  if(pg.type==='content'){
    const{ci,pi}=pg;
    return`<div class="bk-slot"><div class="book-canvas-page" style="width:${BOOK_PAGE_W}px;height:${BOOK_PAGE_H}px;"><canvas data-ci="${ci}" data-pi="${pi}" onpointerdown="bookCvsDown(event)" onpointermove="bookCvsMove(event)" onpointerup="bookCvsUp(event)" onpointerleave="bookCvsUp(event)"></canvas></div></div>`;
  }
  const inner=`<div style="display:flex;flex-direction:column;justify-content:flex-end;min-height:400px;"><div style="width:44px;height:5px;background:${b.color};border-radius:2px;margin-bottom:12px;"></div><div class="ptitle">${isOwner?`<span contenteditable="true" style="outline:none;" oninput="updateBookMeta('${b.id}','title',this.innerText)">${b.title}</span>`:b.title}</div><div class="psub">${isOwner?`<span contenteditable="true" style="outline:none;" oninput="updateBookMeta('${b.id}','subtitle',this.innerText)">${b.subtitle||''}</span>`:b.subtitle||''}</div></div>`;
  return`<div class="bk-slot"><div class="book-static-page" style="width:${BOOK_PAGE_W}px;min-height:${BOOK_PAGE_H}px;">${inner}</div></div>`;
}

function buildBookReader(){
  const b=gb(S.bookId);if(!b){S.bookId=null;return buildLibrary();}
  const allPages=getAllPages(b);
  if(!S.bookSpread)S.bookSpread=0;
  S.bookSpread=Math.min(S.bookSpread,allPages.length-1);
  const canEdit=canEditBook(b);const isOwner=isBookOwner(b);
  const onePage=S.bookOnePage;
  const visCount=onePage?1:2;
  const leftPage=allPages[S.bookSpread]||null;
  const rightPage=onePage?null:(allPages[S.bookSpread+1]||null);
  const curCi=leftPage&&leftPage.ci>=0?leftPage.ci:(rightPage&&rightPage&&rightPage.ci>=0?rightPage.ci:0);
  const chapTabs=b.chapters.map((ch,i)=>`<div class="chap-tab${curCi===i?' act':''}" onclick="jumpToChapter('${b.id}',${i})">${b.chapters.length>1?`${i+1}. `:''}${ch.title}</div>`).join('');
  const pgR=Math.min(S.bookSpread+visCount,allPages.length);
  const pgLabel=(!onePage&&pgR>S.bookSpread+1)?`${S.bookSpread+1}–${pgR} / ${allPages.length}`:`${S.bookSpread+1} / ${allPages.length}`;
  const spreadToggle=`<button class="tbtn${!onePage?' act':''}" onclick="S.bookOnePage=false;rc()" title="Two-page spread" style="font-size:14px;">⧉</button><button class="tbtn${onePage?' act':''}" onclick="S.bookOnePage=true;rc()" title="Single page" style="font-size:14px;">▭</button>`;
  const toolbar=`<div class="book-toolbar"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><div class="book-back" onclick="S.bookId=null;rc()">&#8592; Library</div><div class="book-name">${b.title}</div><div class="book-chap-tabs" style="border-bottom:none;padding:0;">${chapTabs}${isOwner?`<div class="chap-tab-add" onclick="addChapter('${b.id}')">+</div>`:''}</div></div><div class="book-nav-group">${spreadToggle}${isOwner?`<button class="tbtn" onclick="openEditBookModal('${b.id}')">&#9881;</button>`:''}<div style="width:1px;height:16px;background:var(--brd-s);"></div><button class="nav-arr" onclick="bookPrev()" ${S.bookSpread===0?'disabled':''}>&#8592;</button><span class="pg-ind">${pgLabel}</span><button class="nav-arr" onclick="bookNext(${allPages.length})" ${S.bookSpread>=allPages.length-1?'disabled':''}>&#8594;</button></div></div>`;
  const canvasTb=canEdit?buildBookCanvasToolbar(b):'';
  const visSet=new Set();
  for(let i=0;i<visCount;i++){const pg=allPages[S.bookSpread+i];if(pg&&pg.type==='content')visSet.add(`${pg.ci}-${pg.pi}`);}
  let thumbsHtml='';let tn=0;
  b.chapters.forEach((ch,ci)=>{
    if(b.chapters.length>1)thumbsHtml+=`<div class="book-thumb-chap">${ci+1}. ${ch.title}</div>`;
    ch.pages.forEach((pg,pi)=>{tn++;const key=`${ci}-${pi}`;thumbsHtml+=`<div class="book-thumb-item" onclick="jumpToCanvasPage('${b.id}',${ci},${pi})"><canvas class="book-thumb-canvas${visSet.has(key)?' act':''}" id="thumb-canvas-${ci}-${pi}"></canvas><div class="book-thumb-num">${tn}</div></div>`;});
  });
  const thumbAdd=canEdit?`<div class="book-thumb-add" onclick="addBookPage('${b.id}')">+<div style="font-size:11px;margin-top:4px;">page</div></div>`:'';
  const GAP=onePage?0:SPREAD_GAP;
  const SLOT_W=BOOK_PAGE_W+GAP;
  const WINDOW_W=onePage?BOOK_PAGE_W:2*BOOK_PAGE_W+SPREAD_GAP;
  const offsets=onePage?[-1,0,1]:[-1,0,1,2];
  const slots=offsets.map(o=>renderSpreadSlot(b,allPages,S.bookSpread+o,isOwner)).join('');
  const mainHtml=`<div class="book-spread-outer"><div class="book-spread-window" style="width:${WINDOW_W}px;height:${BOOK_PAGE_H+64}px;overflow:hidden;display:flex;align-items:center;"><div class="book-spread-track" id="bk-track" style="gap:${GAP}px;transform:translateX(${-SLOT_W}px)">${slots}</div></div></div>`;
  return`<div class="book-reader">${toolbar}${canvasTb}<div class="book-canvas-layout"><div class="book-thumb-strip">${thumbsHtml}${thumbAdd}</div>${mainHtml}</div></div>`;
}
function togglePageLock(bid,ci,pi){const b=gb(bid);if(!b||!b.chapters[ci]||!b.chapters[ci].pages[pi])return;const pg=b.chapters[ci].pages[pi];pg.locked=!pg.locked;queueSave();rc();toast(pg.locked?'Page locked':'Page unlocked');}
function savePC(bid,ci,pi,el){const b=gb(bid);if(b&&b.chapters[ci]&&b.chapters[ci].pages[pi])b.chapters[ci].pages[pi].content=el.innerHTML;}
function ef(cmd,val){document.execCommand(cmd,false,val||null);}
function updateBookMeta(bid,field,val){const b=gb(bid);if(b)b[field]=val;}
function addBookPage(bid){
  const b=gb(bid);if(!b)return;
  const allPages=getAllPages(b);
  const cur=allPages[Math.min(S.bookSpread,allPages.length-1)];
  const ci=cur&&cur.ci>=0?cur.ci:b.chapters.length-1;
  const pi=cur&&cur.pi>=0?cur.pi:b.chapters[ci].pages.length-1;
  b.chapters[ci].pages.splice(pi+1,0,{content:'',strokes:[],textBlocks:[],background:'lined',attachments:[]});
  const newAll=getAllPages(b);
  const newIdx=newAll.findIndex(p=>p.type==='content'&&p.ci===ci&&p.pi===pi+1);
  if(newIdx>=0)S.bookSpread=newIdx;
  rc();toast('Page added');
}
function jumpToChapter(bid,ci){
  const b=gb(bid);if(!b||!b.chapters[ci])return;
  const allPages=getAllPages(b);
  const idx=allPages.findIndex(p=>p.type==='content'&&p.ci===ci);
  if(idx>=0){S.bookSpread=idx;rc();}
}
async function deleteBookPage(bid,ci,pi){
  const b=gb(bid);if(!b)return;
  if(!b.chapters[ci]||!b.chapters[ci].pages[pi])return;
  if(!await confirmDialog('Delete this page? This cannot be undone.','Delete page'))return;
  b.chapters[ci].pages.splice(pi,1);
  if(b.chapters[ci].pages.length===0)b.chapters[ci].pages.push({content:'',strokes:[],textBlocks:[],background:'lined',attachments:[]});
  const allPages=getAllPages(b);S.bookSpread=Math.max(0,Math.min(S.bookSpread,allPages.length-1));
  rc();toast('Page deleted');
}
async function deleteCurrentBookPage(bid,ci,pi){await deleteBookPage(bid,ci,pi);}
function addChapter(bid){const b=gb(bid);if(!b)return;const t=prompt('Chapter title:');if(!t)return;b.chapters.push({id:'ch-'+Date.now(),title:t,pages:[{content:'',strokes:[],textBlocks:[],background:'lined',attachments:[]}]});const allPages=getAllPages(b);S.bookSpread=allPages.length-1;rc();}
function buildTodos(){const lst=S.activeTodoListId?gtl(S.activeTodoListId):null;return `<div class="todo-layout"><div class="todo-sidebar"><div style="padding:8px 12px;border-bottom:1px solid var(--brd);display:flex;align-items:center;gap:8px;"><div style="font-family:var(--font-serif);font-size:17px;color:var(--ink);flex:1;">To-do lists</div><button class="tbtn" onclick="openNewTodoListModal()">+ New list</button></div><div style="flex:1;overflow-y:auto;">${S.todoLists.map(l=>`<div class="todo-list-item${S.activeTodoListId===l.id?' act':''}" onclick="S.activeTodoListId='${l.id}';rc()"><div class="todo-list-color" style="background:${l.color}"></div><div class="todo-list-name">${l.name}</div><div class="todo-list-count">${l.items.filter(i=>!i.done).length}</div></div>`).join('')}</div></div><div class="todo-main">${lst?`<div><div style="padding:18px 24px 14px;border-bottom:1px solid var(--brd);display:flex;align-items:center;gap:10px;"><div style="width:12px;height:12px;border-radius:50%;background:${lst.color};flex-shrink:0;"></div><div style="font-family:var(--font-serif);font-size:20px;color:var(--ink);flex:1;">${lst.name}</div><span style="font-size:12px;color:var(--ink-s)">${lst.items.filter(i=>i.done).length}/${lst.items.length} done</span><button class="tbtn" onclick="openEditTodoListModal('${lst.id}')">✎</button><button class="tbtn" style="color:var(--warm)" onclick="deleteTodoList('${lst.id}')">🗑</button></div><div class="todo-items">${lst.items.map((item,idx)=>`<div class="todo-item"><div class="todo-item-top"><div class="todo-check${item.done?' done':''}" onclick="toggleTodo('${lst.id}',${idx})">${item.done?`<svg viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" style="width:10px;height:10px;"><path d="M2 5l2.5 2.5L8 3"/></svg>`:''}</div><div class="todo-text${item.done?' done':''}" contenteditable="true" oninput="updateTodoText('${lst.id}',${idx},this.innerText)" onkeydown="todoKeydown(event,'${lst.id}',${idx})">${item.text}</div><button class="todo-item-del" onclick="deleteTodoItem('${lst.id}',${idx})">×</button></div></div>`).join('')}<div class="todo-add-item" onclick="addTodoItem('${lst.id}')"><div style="width:16px;height:16px;border-radius:3px;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:12px;">+</div><span>Add item</span></div></div></div>`:`<div class="todo-empty"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--ink-s)"><rect x="4" y="4" width="20" height="20" rx="3"/><path d="M9 14h10M9 9h10M9 19h6"/></svg><span>Select a list</span></div>`}</div></div>`;}
function openEditTodoListModal(lid){
  const l=gtl(lid);if(!l)return;
  window._tlEdit=lid;window._tc=l.color;
  document.getElementById('mods').innerHTML=`<div class="modal-bg"><div class="modal"><h3>Edit list</h3>
    <div class="mf"><label>Name</label><input id="tln" value="${(l.name||'').replace(/"/g,'&quot;')}"></div>
    <div class="mf"><label>Colour</label><div class="color-row">${TCOLS.map(c=>`<div class="csw${c.h===window._tc?' on':''}" style="background:${c.h}" id="tcsw${c.h.replace('#','')}" onclick="stc('${c.h}')"></div>`).join('')}</div></div>
    <div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doSaveTodoListEdit()">Save</button></div>
  </div></div>`;
}
function doSaveTodoListEdit(){
  const lid=window._tlEdit;const l=gtl(lid);if(!l)return;
  const newName=(document.getElementById('tln')?.value||'').trim();
  if(!newName){toast('Name cannot be empty');return;}
  l.name=newName;l.color=window._tc||l.color;
  closeMod();rc();toast('List updated');
}
async function deleteTodoList(lid){
  const l=gtl(lid);if(!l)return;
  const itemCount=(l.items||[]).length;
  const detail=itemCount>0?` This will also delete ${itemCount} item${itemCount!==1?'s':''}.`:'';
  if(!await confirmDialog('Delete list "'+l.name+'"?'+detail,'Delete list'))return;
  pushUndo({type:'addTodoList',list:JSON.parse(JSON.stringify(l))});
  S.todoLists=S.todoLists.filter(x=>x.id!==lid);
  if(S.activeTodoListId===lid){S.activeTodoListId=S.todoLists[0]?.id||null;}
  rc();toast('List deleted');
}
function toggleTodo(lid,idx){const l=gtl(lid);if(l){l.items[idx].done=!l.items[idx].done;rc();}}
function updateTodoText(lid,idx,text){const l=gtl(lid);if(l&&l.items[idx])l.items[idx].text=text;}
async function deleteTodoItem(lid,idx){
  const l=gtl(lid);if(!l)return;
  const item=l.items[idx];
  if(item&&item.text&&item.text.trim()){
    if(!await confirmDialog('Delete "'+( item.text.length>50?item.text.slice(0,50)+'…':item.text)+'"?','Delete item'))return;
  }
  l.items.splice(idx,1);rc();
}
function addTodoItem(lid){const l=gtl(lid);if(!l)return;l.items.push({id:'ti-'+Date.now(),text:'',done:false});rc();setTimeout(()=>{const items=document.querySelectorAll('.todo-text');const last=items[items.length-1];if(last)last.focus();},50);}
function todoKeydown(e,lid,idx){if(e.key==='Enter'){e.preventDefault();addTodoItem(lid);}if(e.key==='Backspace'&&e.target.innerText===''){e.preventDefault();deleteTodoItem(lid,idx);}}
function buildGroups(){const filtered=(S.grpTypeTab==='all'?S.groups:S.groups.filter(g=>g.type===S.grpTypeTab)).sort((a,b)=>a.name.localeCompare(b.name));return `<div class="grp-wrap"><div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;"><div class="grp-title">Groups</div><button class="tbtn" onclick="openNewGroupModal()">+ New group</button></div><div class="grp-type-tabs">${['all','location',...(S.settings?.departmentsEnabled!==false?['department']:[]),'role'].map(t=>`<div class="gtt${S.grpTypeTab===t?' act':''}" onclick="S.grpTypeTab='${t}';rc()">${t==='all'?'All':t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}</div><div class="grp-grid">${filtered.map(g=>{const im=g.members.includes(S.activeId);return`<div class="gcard" onclick="openGroupDetail('${g.id}')"><div class="gcard-head"><div class="gcard-ico" style="background:${abg(g.color)};color:${g.color}">${g.type==='location'?'◉':g.type==='department'?'◈':'◎'}</div><div><div class="gcard-name">${g.name}</div><div class="gcard-type">${g.type}${g.parentId?` · in ${gg(g.parentId)?.name||""}`:""}</div></div></div><div class="gcard-meta"><span class="gpill ${g.access==='open'?'gpill-open':'gpill-inv'}">${g.access==='open'?'Open':'Invite only'}</span><span class="gpill" style="background:var(--paper-d);color:var(--ink-s)">${g.members.length} members</span>${im?`<span class="gpill gpill-mem">Joined</span>`:''}</div></div>`;}).join('')}<div class="add-gcard" onclick="openNewGroupModal()"><div style="width:22px;height:22px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:16px;">+</div><span>New group</span></div></div></div>`;}
function buildGroupDetail(){const g=gg(S.grpDetailId);if(!g){S.grpDetailId=null;return buildGroups();}const im=g.members.includes(S.activeId);const tab=S.grpDetailTab;return`<div class="gd-wrap"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;"><div class="book-back" onclick="S.grpDetailId=null;rc()">← Groups</div></div><div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;"><div style="width:46px;height:46px;border-radius:var(--r);background:${abg(g.color)};color:${g.color};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${g.type==='location'?'◉':g.type==='department'?'◈':'◎'}</div><div style="flex:1"><div class="gd-name">${g.name}</div><div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;"><span class="gpill ${g.access==='open'?'gpill-open':'gpill-inv'}">${g.access==='open'?'Open':'Invite only'}</span><span class="gpill" style="background:var(--paper-d);color:var(--ink-s)">${g.type}</span>${im?`<span class="gpill gpill-mem">Member</span>`:''}</div></div><div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end;">${im?`<button class="tbtn" onclick="openEditGroupModal('${g.id}')">✎ Edit</button>`:''}${!im&&g.access==='open'?`<button class="tbtn" onclick="joinGroup('${g.id}')">Join</button>`:''}${im?`<button class="tbtn" style="color:var(--warm)" onclick="leaveGroup('${g.id}')">Leave</button>`:''}${im?`<button class="tbtn" style="color:var(--warm)" onclick="deleteGroup('${g.id}')">🗑 Delete</button>`:''}</div></div><div class="gd-tabs">${['info','members','books'].map(t=>`<div class="gdt${tab===t?' act':''}" onclick="S.grpDetailTab='${t}';rc()">${t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}</div>${tab==='info'?buildGrpInfo(g,im):''}${tab==='members'?buildGrpMembers(g,im):''}${tab==='books'?buildGrpBooks(g):''}</div>`;}
function openEditGroupModal(gid){
  const g=gg(gid);if(!g)return;
  window._gcEdit=gid;window._gc=g.color;
  document.getElementById('mods').innerHTML=`<div class="modal-bg"><div class="modal"><h3>Edit group</h3><div class="mf"><label>Name</label><input id="egn" value="${(g.name||'').replace(/"/g,'&quot;')}"></div><div class="mf"><label>Access</label><select id="ega"><option value="open"${g.access==='open'?' selected':''}>Open</option><option value="invite"${g.access==='invite'?' selected':''}>Invite only</option></select></div><div class="mf"><label>Description</label><textarea id="egd">${g.desc||''}</textarea></div>${g.type==='location'?`<div class="mf"><label>Location</label><textarea id="egloc">${g.location||''}</textarea></div>`:''}<div class="mf"><label>Founded</label><input id="egfound" value="${(g.founded||'').replace(/"/g,'&quot;')}"></div><div class="mf"><label>Colour</label><div class="color-row">${GCOLS.map(c=>`<div class="csw${c.h===window._gc?' on':''}" style="background:${c.h}" id="egcsw${c.h.replace('#','')}" onclick="seditgc('${c.h}')"></div>`).join('')}</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="saveEditGroup()">Save</button></div></div></div>`;
}
function seditgc(h){window._gc=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const e=document.getElementById('egcsw'+h.replace('#',''));if(e)e.classList.add('on');}
function saveEditGroup(){
  const gid=window._gcEdit;const g=gg(gid);if(!g)return;
  const newName=(document.getElementById('egn')?.value||'').trim();
  if(!newName){toast('Group name cannot be empty');return;}
  g.name=newName;
  g.access=document.getElementById('ega').value;
  g.desc=(document.getElementById('egd')?.value||'').trim();
  if(g.type==='location')g.location=(document.getElementById('egloc')?.value||'').trim();
  g.founded=(document.getElementById('egfound')?.value||'').trim();
  g.color=window._gc||g.color;
  // Update the linked group conversation name if it exists
  const gc=S.conversations.find(c=>c.type==='group'&&c.groupId===gid);
  if(gc)gc.name=newName;
  closeMod();rc();toast('Group updated');
}
async function deleteGroup(gid){
  const g=gg(gid);if(!g)return;
  const memberCount=g.members.length;
  const msg='Delete "'+g.name+'"? This will remove the group, its conversation'+(memberCount>1?' ('+memberCount+' members)':'')+', and all references to it. This cannot be undone.';
  if(!await confirmDialog(msg,'Delete group'))return;
  // Remove from groups
  S.groups=S.groups.filter(x=>x.id!==gid);
  // Remove its conversation
  S.conversations=S.conversations.filter(c=>!(c.type==='group'&&c.groupId===gid));
  // Clean up references in books
  S.books.forEach(b=>{
    if(b.ownerType==='group'&&b.owner===gid){b.ownerType='alter';b.owner=S.activeId;}
    if(b.sharedGroups)b.sharedGroups=b.sharedGroups.filter(x=>x!==gid);
  });
  // Clean up calendar event attendees / visibility
  S.events.forEach(e=>{
    if(e.attendees)e.attendees=e.attendees.filter(x=>x!==gid);
  });
  // Clean up poll eligibility
  S.polls.forEach(p=>{
    if(p.eligibleGroups)p.eligibleGroups=p.eligibleGroups.filter(x=>x!==gid);
  });
  S.grpDetailId=null;
  closeMod();rc();toast('Group deleted');
}
function buildGrpInfo(g,canEdit){
  const d=!canEdit;
  const isLoc=g.type==='location';
  const isDept=g.type==='department';
  // Location: parent location picker
  const otherLocs=S.groups.filter(x=>x.type==='location'&&x.id!==g.id);
  const parentPicker=isLoc?`<div class="inf"><label>Inside location <span style="font-size:10px;color:var(--ink-s);font-weight:400;">· nested within</span></label>${d?`<div style="font-size:13px;color:var(--ink);padding:4px 0;">${otherLocs.find(l=>l.id===g.parentId)?.name||'— None —'}</div>`:`<select onchange="ug('${g.id}','parentId',this.value)"><option value="">— None (top level) —</option>${otherLocs.map(l=>`<option value="${l.id}"${g.parentId===l.id?' selected':''}>${l.name}</option>`).join('')}</select>`}</div>
  ${buildChildLocations(g.id)}`:'';
  // Department: leads section
  const leads=isDept?buildDeptLeads(g,canEdit):'';
  return`<div class="inf"><label>Description</label><textarea ${d?'disabled':''} oninput="ug('${g.id}','desc',this.value)">${g.desc}</textarea></div>
    ${isLoc?`<div class="inf"><label>Location notes</label><input ${d?'disabled':''} value="${g.location||''}" oninput="ug('${g.id}','location',this.value)"></div>`:''}
    ${parentPicker}
    ${leads}
    <div class="inf"><label>Founded</label><input ${d?'disabled':''} value="${g.founded||''}" oninput="ug('${g.id}','founded',this.value)"></div>
    <div style="margin-top:12px;"><div class="sec-lbl" style="margin-bottom:6px;">Flags</div>${buildFlagsDisplay(g,canEdit,'addGroupFlag',(i)=>'removeGroupFlag(\''+g.id+'\','+i+')')}</div>
    ${canEdit?`<div style="margin-top:10px"><button class="mbtn-p" onclick="toast('Saved')">Save</button></div>`:`<div style="font-size:12px;color:var(--ink-s);margin-top:8px;">🔒 Join to edit.</div>`}`;
}
function buildChildLocations(parentId){
  const children=S.groups.filter(g=>g.type==='location'&&g.parentId===parentId);
  if(!children.length)return'';
  return`<div class="inf"><label>Locations within this</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${children.map(c=>`<button class="fchip" style="background:${abg(c.color)};color:${c.color};border:none;cursor:pointer;" onclick="S.grpDetailId='${c.id}';rc()">◉ ${c.name}</button>`).join('')}</div></div>`;
}
function buildDeptLeads(g,canEdit){
  const leads=g.leads||[];
  const leadAlters=leads.map(id=>ga(id)).filter(Boolean);
  return`<div class="inf"><label>Department leads <span style="font-size:10px;color:var(--ink-s);font-weight:400;">· who's in charge</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
      ${leadAlters.map(a=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:${abg(a.color)};color:${a.color};font-size:12px;font-weight:500;">
        ${a.name}${canEdit?`<span style="cursor:pointer;margin-left:2px;" onclick="removeDeptLead('${g.id}','${a.id}')">×</span>`:''}
      </span>`).join('')}
      ${canEdit?`<button class="mbtn-s" style="padding:3px 10px;font-size:11px;" onclick="openDeptLeadPicker('${g.id}')">+ Add lead</button>`:''}
    </div>
  </div>`;
}
function openDeptLeadPicker(gid){window._dlGid=gid;window._dlQ='';renderDeptLeadPicker();}
function renderDeptLeadPicker(){const gid=window._dlGid;const g=gg(gid);if(!g)return;const existing=g.leads||[];const q=(window._dlQ||'').toLowerCase();const available=sortedAlters(g.members.map(id=>ga(id)).filter(Boolean).filter(a=>!existing.includes(a.id))).filter(a=>!q||a.name.toLowerCase().includes(q));document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Add department lead</h3><div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search members..." value="'+(window._dlQ||'')+'" oninput="window._dlQ=this.value;renderDeptLeadPicker()"></div><div class="share-pick-list">'+(available.length===0?'<div style="padding:10px;font-size:12px;color:var(--ink-s);">'+(q?'No matches.':'All members are already leads, or no members in this department.')+'</div>':available.map(a=>'<div class="spi" onclick="addDeptLead(\''+gid+'\',\''+a.id+'\')"><div class="spi-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div><div style="flex:1"><span class="spi-name">'+a.name+'</span><span class="spi-sub"> · '+a.role+'</span></div></div>').join(''))+'</div><div class="mbtns"><button class="mbtn-s" onclick="closeMod()">Close</button></div></div></div>';_refocusModalSearch();
}
function addDeptLead(gid,alterId){const g=gg(gid);if(!g)return;if(!g.leads)g.leads=[];if(!g.leads.includes(alterId))g.leads.push(alterId);closeMod();rc();queueSave();}
function removeDeptLead(gid,alterId){const g=gg(gid);if(!g||!g.leads)return;g.leads=g.leads.filter(id=>id!==alterId);rc();queueSave();}
function buildGrpMembers(g,c){return`<div class="member-list">${g.members.map(id=>{const a=ga(id);if(!a)return'';return`<div class="mem-row"><div class="mem-av" style="background:${abg(a.color)};color:${a.color}">${aAv(a)}</div><div style="flex:1"><div class="mem-name">${a.name}</div><div style="font-size:11px;color:var(--ink-s)">${a.role}</div></div>${id===S.activeId?`<span class="mem-badge">You</span>`:''}</div>`;}).join('')}${c&&g.access==='invite'?`<button class="tbtn" style="margin-top:6px" onclick="toast('Invite coming soon')">+ Invite</button>`:''}</div>`;}
function buildGrpBooks(g){const books=S.books.filter(b=>b.ownerType==='group'&&b.owner===g.id);const im=g.members.includes(S.activeId);return`<div class="book-grid">${books.map(b=>`<div class="bcard" onclick="navTo('library');openBook('${b.id}')"><div class="bcard-spine" style="background:${b.color}"></div><div class="bcard-body"><div class="bcard-title">${b.title}</div></div></div>`).join('')}${im?`<div class="add-bcard" onclick="openNewBookModalForGroup('${g.id}')"><div style="width:22px;height:22px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;">+</div><span>New book for group</span></div>`:''}</div>`;}
function buildComm(){const myConvs=S.conversations.filter(c=>{if(c.type==='direct')return c.participants.includes(S.activeId);if(c.type==='group')return c.participants.includes(S.activeId);return false;});const filtered=S.commTab==='direct'?myConvs.filter(c=>c.type==='direct'):myConvs.filter(c=>c.type==='group');const conv=S.activeConvId?gc(S.activeConvId):null;const cname=(c)=>{if(c.type==='group')return c.name;const o=c.participants.find(p=>p!==S.activeId);const a=ga(o);return a?a.name:'?';};const ccol=(c)=>{if(c.type==='group'&&c.groupId){const g=gg(c.groupId);return g?g.color:'#9B8DB0';}if(c.type==='group')return'#9B8DB0';const o=c.participants.find(p=>p!==S.activeId);const a=ga(o);return a?a.color:'#9A9A95';};const cprev=(c)=>{const last=c.messages[c.messages.length-1];if(!last)return'No messages';const s=ga(last.from);const txt=(last.html||last.text||'').replace(/<[^>]*>/g,'');return`${s&&last.from!==S.activeId?s.name+': ':''}${txt.slice(0,36)}${txt.length>36?'…':''}`;};return`<div class="comm-layout"><div class="conv-list"><div class="conv-list-top"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div class="comm-title" style="flex:1;">Communication</div><button class="tbtn" onclick="${S.commTab==='direct'?'openNewDirectModal()':'openNewGCModal()'}">+ New ${S.commTab==='direct'?'conversation':'group chat'}</button></div><div class="conv-tabs"><div class="ctab${S.commTab==='direct'?' act':''}" onclick="S.commTab='direct';S.activeConvId=null;rc()">Direct</div><div class="ctab${S.commTab==='group'?' act':''}" onclick="S.commTab='group';S.activeConvId=null;rc()">Groups</div></div></div><div class="conv-scroll">${filtered.map(c=>`<div class="conv-item${S.activeConvId===c.id?' act':''}" onclick="S.activeConvId='${c.id}';rc()"><div class="conv-av${c.type==='group'?' grp':''}" style="background:${abg(ccol(c))};color:${ccol(c)}">${ini(cname(c))}</div><div class="conv-info"><div class="conv-name">${cname(c)}</div><div class="conv-preview">${cprev(c)}</div></div></div>`).join('')}</div></div>${conv?buildChatArea(conv):`<div class="chat-area"><div class="no-conv"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--ink-s)"><path d="M3 5h22v14H17l-5 4v-4H3z"/></svg><span>Select a conversation</span></div></div>`}</div>`;}
function buildChatArea(conv){const cname=conv.type==='group'?conv.name:(()=>{const o=conv.participants.find(p=>p!==S.activeId);const a=ga(o);return a?a.name:'?';})();const ccol=conv.type==='group'&&conv.groupId?(()=>{const g=gg(conv.groupId);return g?g.color:'#9B8DB0';})():conv.type==='group'?'#9B8DB0':(()=>{const o=conv.participants.find(p=>p!==S.activeId);const a=ga(o);return a?a.color:'#9A9A95';})();const csub=conv.type==='group'?`${conv.participants.length} participants`:(ga(conv.participants.find(p=>p!==S.activeId))?.role||'');const attRow=S.composeAttachments.length?`<div class="att-row">${S.composeAttachments.map((a,i)=>`<span class="att-pill">📖 ${a.title}<span class="att-x" onclick="removeAtt(${i})"> ×</span></span>`).join('')}</div>`:'';return`<div class="chat-area"><div class="chat-header"><div class="chat-hav${conv.type==='group'?' grp':''}" style="background:${abg(ccol)};color:${ccol}">${ini(cname)}</div><div><div style="font-size:14px;font-weight:500;color:var(--ink)">${cname}</div><div style="font-size:11px;color:var(--ink-s)">${csub}</div></div></div><div class="chat-messages" id="chat-msgs">${conv.messages.map(msg=>{const isMe=msg.from===S.activeId;const sender=ga(msg.from);const senderColor=sender?.color||'#9A9A95';const html=msg.html||msg.text||'';return`<div class="msg-row ${isMe?'me':'them'}"><div class="msg-av" style="background:${abg(senderColor)};color:${senderColor}">${aAv(sender)||ini(sender?.name||'?')}</div><div class="msg-content">${!isMe?`<div class="msg-sender">${sender?.name||'?'}</div>`:''}<div class="msg-bubble ${isMe?'me-bub':'them-bub'}" style="${isMe?'background:'+ccol:''}">${html}</div>${(msg.attachments||[]).map(a=>`<div class="msg-att ${isMe?'':'them-att'}" onclick="openAttachment('${a.type||'book'}','${a.id}')">${a.type==='event'?'📅':'📖'} ${a.title}</div>`).join('')}<div class="msg-meta">${msg.ts}</div></div></div>`;}).join('')}</div><div class="compose-area"><div class="compose-fmt"><button class="cfmt" id="cfmt-b" onclick="toggleFmt('bold','cfmt-b')"><b>B</b></button><button class="cfmt" id="cfmt-i" onclick="toggleFmt('italic','cfmt-i')"><i>I</i></button><button class="cfmt" id="cfmt-u" onclick="toggleFmt('underline','cfmt-u')"><u>U</u></button><div class="cfmt-sep"></div><button class="cfmt" onclick="fmtCompose('insertUnorderedList')">• list</button><button class="cfmt" onclick="fmtCompose('insertOrderedList')">1. list</button><div class="cfmt-sep"></div><button class="cfmt" style="font-size:11px;width:auto;padding:0 6px;" onclick="openAttachModal()">+ Attach</button></div>${attRow}<div class="compose-row"><div class="compose-div" id="compose-div" contenteditable="true" data-placeholder="Write a message…" onkeydown="handleCK(event,'${conv.id}')"></div><button class="send-btn" onclick="sendMsg('${conv.id}')"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" stroke-width="2"><path d="M1 6.5h11M8 3l4 3.5-4 3.5"/></svg></button></div></div></div>`;}
function toggleFmt(cmd,btnId){const div=document.getElementById('compose-div');if(div)div.focus();document.execCommand(cmd,false,null);const btn=document.getElementById(btnId);if(btn)btn.classList.toggle('on');}
function fmtCompose(cmd){const div=document.getElementById('compose-div');if(div)div.focus();document.execCommand(cmd,false,null);}
function buildGallery(){
  const q=S.search.toLowerCase();
  const allFiltered=S.alters.filter(a=>!q||a.name.toLowerCase().includes(q)||a.role.toLowerCase().includes(q)||(a.nicknames||[]).some(n=>n.toLowerCase().includes(q)));
  const filtered=S.activeId?sortedAlters(allFiltered):allFiltered.slice().sort((a,b)=>a.name.localeCompare(b.name));
  const sel=S.galSel?ga(S.galSel):null;
  const sc=sel?sel.color:'var(--sage)';
  const noActive=!S.activeId;

  // Build topbar
  const isTauri=!!(window.__TAURI__||window.__TAURI_INTERNALS__);
  const galWinCtrls=isTauri?`<div class="win-ctrls"><button class="win-ctrl" title="Minimize" onclick="winMin()">&#x2013;</button><button class="win-ctrl" title="Maximize" onclick="winMax()">&#x25A1;</button><button class="win-ctrl wc-close" title="Close" onclick="winClose()">&#x2715;</button></div>`:'';
  const topbar=`<div class="topbar"><div data-tauri-drag-region style="flex:1;height:100%;display:flex;align-items:center;"><div class="wm">System Library</div></div><div class="topbar-right">${noActive?'':'<button class="tbtn" onclick="goGallery()">&#x21C4; Switch alter</button>'}${galWinCtrls}</div></div>`;

  // Sticky bar: search always visible + confirm when selected
  const stickyBar=`<div class="gal-sticky">
    <div class="gal-search-row">
      ${noActive?'<div class="gal-pick-title">Pick who is fronting</div>':''}
      <div class="srch" style="flex:1;margin-left:auto;">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>
        <input placeholder="Search alters..." value="${S.search}" oninput="S.search=this.value;filterGalCards(this.value)" id="gal-search-inp">
      </div>
    </div>
    ${sel?`<div class="confirm-bar sel" style="--_sc:${sc}">
      <div class="cbar-l">
        <div class="cbar-av" style="background:${abg(sel.color)};color:${sel.color}">${aAv(sel)}</div>
        <div class="cbar-txt">Set <b>${sel.name}</b> as fronting?</div>
      </div>
      <button class="confirm-btn vis" style="background:${sc}" onclick="confirmSwitch()">Confirm &amp; enter</button>
    </div>`:''}
  </div>`;

  // Grid
  const cards=filtered.map(a=>{
    const isSel=S.galSel===a.id;
    const isCur=S.activeId===a.id;
    const flagsHtml=(a.flags||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px;">${(a.flags||[]).slice(0,2).map(f=>`<span class="flag-chip ${flagClass(f)}" style="font-size:10px;padding:2px 6px;">${flagIco(f)} ${f.label}</span>`).join('')}${(a.flags||[]).length>2?`<span style="font-size:10px;color:var(--ink-s)">+${a.flags.length-2}</span>`:''}</div>`:'';
    const curBadge=isCur?`<div style="font-size:11px;font-weight:500;color:${a.color};margin-top:2px;">Currently fronting</div>`:'';
    return`<div class="acard${isSel?' sel':''}${isCur?' cur':''}" data-aid="${a.id}" style="border-color:${isSel?a.color:'rgba(92,122,110,0.15)'}" onclick="toggleGalSel('${a.id}')">
      <div class="cbadge" style="background:${a.color}"></div>
      <div class="acard-av" style="background:${abg(a.color)};color:${a.color}">${aAv(a)}</div>
      <div class="acard-name">${a.name}</div>
      <div class="acard-sub">${a.role||'—'}</div>
      <div class="acard-sub">${a.pronouns||''}${a.age?' · '+a.age:''}</div>
      ${flagsHtml}${curBadge}
    </div>`;
  }).join('');

  return `<div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">${topbar}<div class="gal-wrap">
    ${stickyBar}
    <div class="gal-scroll">
      <div class="gal-grid">
        ${cards}
        <div class="add-acard" onclick="openNewAlterModal()">
          <div style="width:24px;height:24px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:17px;">+</div>
          <span>Add alter</span>
        </div>
      </div>
    </div>
  </div>`;
}
function goGallery(){S.galSel=null;S.search='';S.screen='gallery';render();}
function toggleGalSel(id){
  const prev=S.galSel;
  S.galSel=(prev===id)?null:id;
  document.querySelectorAll('.acard[data-aid]').forEach(el=>{
    const aid=el.getAttribute('data-aid');
    if(aid===id){el.classList.toggle('sel',S.galSel===id);el.style.borderColor=S.galSel===id?(ga(id)?.color||''):'rgba(92,122,110,0.15)';}
    else if(aid===prev&&prev!==id){el.classList.remove('sel');el.style.borderColor='rgba(92,122,110,0.15)';}
  });
  const sticky=document.querySelector('.gal-sticky');
  if(sticky){
    let bar=sticky.querySelector('.confirm-bar');
    if(S.galSel){
      const sel=ga(S.galSel);
      if(!bar){bar=document.createElement('div');bar.className='confirm-bar sel';sticky.appendChild(bar);}
      bar.innerHTML=`<div class="cbar-l"><div class="cbar-av" style="background:${abg(sel.color)};color:${sel.color}">${aAv(sel)}</div><div class="cbar-txt">Set <b>${sel.name}</b> as fronting?</div></div><button class="confirm-btn vis" style="background:${sel.color}" onclick="confirmSwitch()">Confirm &amp; enter</button>`;
    }else{if(bar)bar.remove();}
  }
  queueSave();
}

function filterGalCards(q){
  S.search=q;
  const ql=q.toLowerCase();
  document.querySelectorAll('.acard[data-aid]').forEach(el=>{
    const aid=el.getAttribute('data-aid');
    const a=ga(aid);
    if(!a){el.style.display='none';return;}
    const match=!ql||a.name.toLowerCase().includes(ql)||a.role.toLowerCase().includes(ql)||(a.nicknames||[]).some(n=>n.toLowerCase().includes(ql));
    el.style.display=match?'':'none';
  });
}
function confirmSwitch(){
  if(!S.galSel)return;
  S.activeId=S.galSel;S.galSel=null;S.screen='main';S.nav='dashboard';
  S.profileEdit=null;S.coFrontSwapPending=false;
  broadcastAlterSwitch(S.activeId);
  render();
  const a=ga(S.activeId);
  if(a)toast(a.name+' is now fronting');
}
function openBook(id){
  const wasOpen=S.bookId===id;
  S.bookId=id;
  if(!wasOpen){
    const saved=S._bookState?.[id];
    if(saved?.spread!=null){
      S.bookSpread=saved.spread;
    }else{
      const b=gb(id);
      const firstContent=b?getAllPages(b).findIndex(p=>p.type==='content'):-1;
      S.bookSpread=firstContent>=0?firstContent:0;
    }
    S.bookZoom=saved?.zoom||fitBookZoom();
    S.bookViewMode=false;
    _bc.activeCi=-1;_bc.activePi=-1;
  }
  S.nav='library';render();
}
function saveBookState(){
  if(!S.bookId)return;
  if(!S._bookState)S._bookState={};
  S._bookState[S.bookId]={spread:S.bookSpread,zoom:S.bookZoom};
  queueSave();
}
function bookZoom(d){S.bookZoom=Math.max(50,Math.min(200,S.bookZoom+d));saveBookState();rc();}
// Single-page stepping: S.bookSpread is the left-page index (0-based across all pages)
// Each ← or → moves by exactly 1 page, so the view shifts like a sliding window
function bookPrev(){
  if(_bookAnimating||S.bookSpread<=0)return;
  _bookAnimating=true;
  if(_bcText){const b=gb(S.bookId);if(b)bookCommitText(b,_bcText.ci,_bcText.pi);}
  const track=document.getElementById('bk-track');
  if(!track){S.bookSpread=Math.max(S.bookSpread-1,0);saveBookState();rc();_bookAnimating=false;return;}
  track.style.transition='transform 0.35s cubic-bezier(0.4,0,0.2,1)';
  track.style.transform='translateX(0px)';
  setTimeout(()=>{_bookAnimating=false;_bc.activeCi=-1;_bc.activePi=-1;S.bookSpread=Math.max(S.bookSpread-1,0);saveBookState();rc();},360);
}
function bookNext(tot){
  if(_bookAnimating||S.bookSpread>=tot-1)return;
  _bookAnimating=true;
  if(_bcText){const b=gb(S.bookId);if(b)bookCommitText(b,_bcText.ci,_bcText.pi);}
  const track=document.getElementById('bk-track');
  if(!track){S.bookSpread=Math.min(S.bookSpread+1,tot-1);saveBookState();rc();_bookAnimating=false;return;}
  const GAP=S.bookOnePage?0:SPREAD_GAP;const SLOT_W=BOOK_PAGE_W+GAP;
  track.style.transition='transform 0.35s cubic-bezier(0.4,0,0.2,1)';
  track.style.transform=`translateX(${-2*SLOT_W}px)`;
  setTimeout(()=>{_bookAnimating=false;_bc.activeCi=-1;_bc.activePi=-1;S.bookSpread=Math.min(S.bookSpread+1,tot-1);saveBookState();rc();},360);
}
function fitBookZoom(){
  const avail=(window.innerWidth-(S.navCollapsed?48:185))-80;
  const pagesW=PAGE_W*2;
  return Math.max(40,Math.min(150,Math.floor((avail/pagesW)*100)));
}
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter')return;
  const modal=document.querySelector('#mods .modal');
  if(!modal)return;
  const tgt=e.target;const tag=tgt.tagName;
  if(tag==='TEXTAREA'||tgt.isContentEditable)return;
  if(tag!=='INPUT'&&tag!=='SELECT')return;
  e.preventDefault();
  const focusable=Array.from(modal.querySelectorAll(
    'input[type=text],input[type=date],input[type=time],input:not([type]),select'
  )).filter(el=>!el.closest('.color-row')&&!el.disabled);
  const idx=focusable.indexOf(tgt);
  if(idx>=0&&idx<focusable.length-1){focusable[idx+1].focus();}
  else{const btn=modal.querySelector('.mbtn-p');if(btn)btn.click();}
});
document.addEventListener('keydown',function(e){
  if(!S.bookId||!document.querySelector('.book-canvas-page canvas[data-ci]'))return;
  if(e.target&&(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT'||e.target.isContentEditable))return;
  if(e.ctrlKey&&!e.shiftKey&&e.key==='z'){e.preventDefault();bookUndo();}
  if(e.ctrlKey&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){e.preventDefault();bookRedo();}
});


function openNewDirectModal(){window._dmt=null;window._dmQ='';renderDMModal();}
function renderDMModal(){const q=(window._dmQ||'').toLowerCase();const alters=sortedAlters(S.alters).filter(a=>a.id!==S.activeId&&(!q||a.name.toLowerCase().includes(q)));document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>New conversation</h3><div class="share-search" style="margin-bottom:6px;"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search alters..." value="'+(window._dmQ||'')+'" oninput="window._dmQ=this.value;renderDMModal()"></div><div class="share-pick-list">'+alters.map(a=>'<div class="spi'+(window._dmt===a.id?' on':'')+'" id="dm-'+a.id+'" onclick="pickDM(\''+a.id+'\')"><div class="spi-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div><div style="flex:1"><span class="spi-name">'+a.name+'</span><span class="spi-sub"> · '+a.role+'</span></div></div>').join('')+'</div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="dnd()">Start</button></div></div></div>';_refocusModalSearch();}
function pickDM(id){window._dmt=id;document.querySelectorAll('#mods .spi').forEach(e=>e.classList.remove('on'));const el=document.getElementById('dm-'+id);if(el)el.classList.add('on');}
function dnd(){const tid=window._dmt;if(!tid)return;const ex=S.conversations.find(c=>c.type==='direct'&&c.participants.includes(S.activeId)&&c.participants.includes(tid));if(ex){S.activeConvId=ex.id;closeMod();rc();return;}const id='conv-'+Date.now();S.conversations.push({id,type:'direct',participants:[S.activeId,tid],messages:[]});S.activeConvId=id;S.commTab='direct';closeMod();rc();}
function openNewGCModal(){window._gcP=[];window._gcTab=0;window._gcQ='';renderGCModal();}
function renderGCModal(){const tabs=['All alters','By role','By location','By department'];const q=(window._gcQ||'').toLowerCase();let items=[];const tab=window._gcTab;if(tab===0){items=S.alters.filter(a=>a.id!==S.activeId).sort((a,b)=>a.name.localeCompare(b.name));}else{const tm={1:'role',2:'location',3:'department'};items=S.groups.filter(g=>g.type===tm[tab]).map(g=>({isGroup:true,...g}));}if(q)items=items.filter(i=>i.name.toLowerCase().includes(q));document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:450px;"><h3>New group chat</h3><div class="mf"><label>Chat name</label><input id="gcn" placeholder="e.g. Planning crew..."></div><div class="mf"><label>Participants</label><div class="share-tabs">'+tabs.map((t,i)=>'<div class="stab'+(window._gcTab===i?' act':'')+'" onclick="window._gcTab='+i+';renderGCModal()">'+t+'</div>').join('')+'</div><div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search..." value="'+(window._gcQ||'')+'" oninput="window._gcQ=this.value;renderGCSearchOnly()"></div><div class="share-pick-list" id="gc-pick-list">'+items.map(item=>{const pk=window._gcP.includes(item.id);const isG=item.isGroup;return'<div class="spi'+(pk?' on':'')+'" onclick="toggleGCP(\''+item.id+'\')"><div class="spi-av'+(isG?' sq':'')+'" style="background:'+abg(item.color)+';color:'+item.color+'">'+ini(item.name)+'</div><div style="flex:1"><span class="spi-name">'+item.name+'</span><span class="spi-sub"> · '+(isG?item.type+' · '+item.members.length+' members':item.role)+'</span></div><div class="spi-check">'+(pk?'<svg viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" style="width:8px;height:8px;"><path d="M2 5l2.5 2.5L8 3"/></svg>':'')+'</div></div>';}).join('')+'</div><div class="share-selected-pills">'+window._gcP.map(id=>{const a=ga(id)||gg(id);if(!a)return'';return'<span class="spill">'+a.name+'<span class="spill-x" onclick="toggleGCP(\''+id+'\')"> ×</span></span>';}).join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="dngc()">Create chat</button></div></div></div>';}
function renderGCSearchOnly(){const q=(window._gcQ||'').toLowerCase();const tab=window._gcTab;let items=[];if(tab===0){items=S.alters.filter(a=>a.id!==S.activeId).sort((a,b)=>a.name.localeCompare(b.name));}else{const tm={1:'role',2:'location',3:'department'};items=S.groups.filter(g=>g.type===tm[tab]).map(g=>({isGroup:true,...g}));}if(q)items=items.filter(i=>i.name.toLowerCase().includes(q));const list=document.getElementById('gc-pick-list');if(!list)return;list.innerHTML=items.map(item=>{const pk=window._gcP.includes(item.id);const isG=item.isGroup;return'<div class="spi'+(pk?' on':'')+'" onclick="toggleGCP(\''+item.id+'\')"><div class="spi-av'+(isG?' sq':'')+'" style="background:'+abg(item.color)+';color:'+item.color+'">'+ini(item.name)+'</div><div style="flex:1"><span class="spi-name">'+item.name+'</span><span class="spi-sub"> · '+(isG?item.type+' · '+item.members.length+' members':item.role)+'</span></div><div class="spi-check">'+(pk?'<svg viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" style="width:8px;height:8px;"><path d="M2 5l2.5 2.5L8 3"/></svg>':'')+'</div></div>';}).join('');const inp=document.querySelector('#mods .share-search input');if(inp){const len=inp.value.length;inp.focus();inp.setSelectionRange(len,len);}}
function toggleGCP(id){const i=window._gcP.indexOf(id);if(i>-1)window._gcP.splice(i,1);else window._gcP.push(id);renderGCModal();}
function dngc(){const name=(document.getElementById('gcn')?.value||'').trim();if(!name)return;let parts=[S.activeId];window._gcP.forEach(id=>{const g=gg(id);if(g){g.members.forEach(m=>{if(!parts.includes(m))parts.push(m);});}else if(!parts.includes(id))parts.push(id);});const id='conv-gc-'+Date.now();S.conversations.push({id,type:'group',groupId:null,name,participants:parts,messages:[]});S.activeConvId=id;S.commTab='group';closeMod();rc();toast('Chat created');}


function openNewBookModal(){openBookModal(null);}
function openNewBookModalForGroup(gid){openBookModal(gid);}
function openBookModal(presetGroupId){window._bShareTab=0;window._bShareQ='';window._bSharedAlters=[];window._bSharedGroups=[];window._bColor=GCOLS[0].h;window._bViewPerm='owner';window._bkBufTitle='';window._bkBufSub='';window._bkBufOwn='';window._bkBufPerm='owner';if(presetGroupId){window._bOwnerType='group';window._bOwner=presetGroupId;}renderBookModal(presetGroupId);}
function sbookc(h){window._bColor=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const e=document.getElementById('bcsw'+h.replace('#',''));if(e)e.classList.add('on');}
function seditbc(h){window._bColor=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const e=document.getElementById('becsw'+h.replace('#',''));if(e)e.classList.add('on');}
function renderBookModal(presetGroupId){
  const buf={title:document.getElementById('bt')?.value??(window._bkBufTitle||''),subtitle:document.getElementById('bsub')?.value??(window._bkBufSub||''),owner:document.getElementById('bown')?.value??(window._bkBufOwn||''),perm:document.getElementById('bperm')?.value??(window._bkBufPerm||'owner')};
  window._bkBufTitle=buf.title;window._bkBufSub=buf.subtitle;window._bkBufOwn=buf.owner;window._bkBufPerm=buf.perm;
  const mg=S.groups.filter(g=>g.members.includes(S.activeId));const vp=window._bViewPerm||'owner';
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:460px;"><h3>New book</h3><div class="mf"><label>Title</label><input id="bt" placeholder="Book title..." value="'+buf.title.replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Subtitle</label><input id="bsub" placeholder="e.g. System record..." value="'+buf.subtitle.replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Owner</label><select id="bown"><option value="alter:'+S.activeId+'"'+(!presetGroupId&&(buf.owner===''||buf.owner===('alter:'+S.activeId))?' selected':'')+'>Me ('+me().name+')</option>'+mg.map(g=>'<option value="group:'+g.id+'"'+((buf.owner===('group:'+g.id))||(presetGroupId===g.id&&buf.owner==='')?' selected':'')+'>'+g.name+'</option>').join('')+'</select></div><div class="mf"><label>Edit permissions</label><select id="bperm"><option value="owner"'+(buf.perm==='owner'?' selected':'')+'>Owner only</option><option value="members"'+(buf.perm==='members'?' selected':'')+'>All members</option></select></div><div class="mf"><label>View access</label><select id="bvperm" onchange="window._bViewPerm=this.value;renderBookShareSection(\''+(presetGroupId||'')+'\')"><option value="owner"'+(vp==='owner'?' selected':'')+'>Owner / members only</option><option value="shared"'+(vp==='shared'?' selected':'')+'>Selected alters &amp; groups</option><option value="all"'+(vp==='all'?' selected':'')+'>Everyone (all alters)</option></select></div><div class="mf" id="book-share-section"></div><div class="mf"><label>Colour</label><div class="color-row">'+GCOLS.map(c=>'<div class="csw'+(window._bColor===c.h?' on':'')+'" style="background:'+c.h+'" id="bcsw'+c.h.replace('#','')+'" onclick="sbookc(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doNewBook()">Create book</button></div></div></div>';
}
function renderBookShareSection(presetGroupId){
  const vp=window._bViewPerm||'owner';
  const vtab=window._bShareTab||0;
  const tabs=['Alters','Groups'];
  const q=(window._bShareQ||'').toLowerCase();
  let items=vtab===0?sortedAlters(S.alters).filter(a=>!q||a.name.toLowerCase().includes(q)):S.groups.filter(g=>!q||g.name.toLowerCase().includes(q));
  const isG=(item)=>item.members!==undefined;
  const sec=document.getElementById('book-share-section');
  if(!sec)return;
  if(vp!=='shared'){sec.innerHTML='';return;}
  sec.innerHTML='<div class="share-tabs">'+tabs.map((t,i)=>'<div class="stab'+(vtab===i?' act':'')+'" onclick="window._bShareTab='+i+';renderBookShareSection(\''+(presetGroupId||'')+'\')">'+t+'</div>').join('')+'</div>'
    +'<div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search..." value="'+(window._bShareQ||'')+'" oninput="window._bShareQ=this.value;renderBookShareSection(\''+(presetGroupId||'')+'\')"></div>'
    +'<div class="share-pick-list">'+items.map(item=>{const grp=isG(item);const pk=grp?window._bSharedGroups.includes(item.id):window._bSharedAlters.includes(item.id);return'<div class="spi'+(pk?' on':'')+'" onclick="toggleBShare(\''+(grp?'group':'alter')+'\',\''+item.id+'\')"><div class="spi-av'+(grp?' sq':'')+'" style="background:'+abg(item.color)+';color:'+item.color+'">'+ini(item.name)+'</div><div style="flex:1"><span class="spi-name">'+item.name+'</span><span class="spi-sub"> · '+(grp?item.type:item.role)+'</span></div></div>';}).join('')+'</div>'
    +'<div class="share-selected-pills">'+[...window._bSharedAlters.map(id=>{const a=ga(id);return a?'<span class="spill">'+a.name+'<span class="spill-x" onclick="toggleBShare(\'alter\',\''+id+'\')"> ×</span></span>':'';}), ...window._bSharedGroups.map(id=>{const g=gg(id);return g?'<span class="spill">'+g.name+'<span class="spill-x" onclick="toggleBShare(\'group\',\''+id+'\')"> ×</span></span>':'';}),].join('')+'</div>';
}
function toggleBShare(type,id){if(type==='alter'){const i=window._bSharedAlters.indexOf(id);if(i>-1)window._bSharedAlters.splice(i,1);else window._bSharedAlters.push(id);}else{const i=window._bSharedGroups.indexOf(id);if(i>-1)window._bSharedGroups.splice(i,1);else window._bSharedGroups.push(id);}renderBookShareSection(window._bOwnerType==='group'?window._bOwner:null);}
function doNewBook(){const title=(document.getElementById('bt')?.value||'').trim();if(!title)return;const subtitle=(document.getElementById('bsub')?.value||'').trim();const perm=document.getElementById('bperm')?.value||'owner';const ownVal=document.getElementById('bown')?.value||('alter:'+S.activeId);const[ownerType,owner]=ownVal.split(':');const vp=window._bViewPerm||'owner';const id='bk-'+Date.now();S.books.push({id,title,subtitle,owner,ownerType,color:window._bColor||GCOLS[0].h,editPerm:perm,viewPerm:vp,sharedAlters:[...window._bSharedAlters],sharedGroups:[...window._bSharedGroups],chapters:[{id:'ch-1',title:'Chapter 1',pages:[{content:'Start writing here.',attachments:[]}]}]});pushUndo({type:'addBook',book:S.books[S.books.length-1]});closeMod();S.nav='library';S.bookId=id;S.bookSpread=0;S.bookZoom=fitBookZoom();render();toast('Book created');}
function openEditBookModal(bid){const b=gb(bid);if(!b)return;window._beEdit=bid;window._bColor=b.color;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:440px;"><h3>Book settings</h3><div class="mf"><label>Title</label><input id="bet" value="'+(b.title||'').replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Subtitle</label><input id="besub" value="'+(b.subtitle||'').replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Edit permissions</label><select id="beperm"><option value="owner"'+(b.editPerm==='owner'?' selected':'')+'>Owner only</option><option value="members"'+(b.editPerm==='members'?' selected':'')+'>All members</option></select></div><div class="mf"><label>Colour</label><div class="color-row">'+GCOLS.map(c=>'<div class="csw'+(c.h===window._bColor?' on':'')+'" style="background:'+c.h+'" id="becsw'+c.h.replace('#','')+'" onclick="seditbc(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" style="color:var(--warm);margin-right:auto;" onclick="deleteBook(\''+bid+'\')">🗑 Delete book</button><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doSaveBookEdit()">Save</button></div></div></div>';}
function doSaveBookEdit(){const bid=window._beEdit;const b=gb(bid);if(!b)return;const title=(document.getElementById('bet')?.value||'').trim();if(!title){toast('Title cannot be empty');return;}b.title=title;b.subtitle=(document.getElementById('besub')?.value||'').trim();b.editPerm=document.getElementById('beperm').value;b.color=window._bColor||b.color;closeMod();rc();toast('Book updated');}
async function deleteBook(bid){const b=gb(bid);if(!b)return;if(!await confirmDialog('Delete book "'+b.title+'"? This cannot be undone.','Delete book'))return;pushUndo({type:'addBook',book:JSON.parse(JSON.stringify(b))});S.books=S.books.filter(x=>x.id!==bid);S.projects.forEach(p=>{if(p.linkedBooks)p.linkedBooks=p.linkedBooks.filter(x=>x!==bid);});S.bookId=null;closeMod();S.nav='library';render();toast('Book deleted');}
function renderNewGroupModal(){
  const t=window._gType||'location';const showLoc=t==='location';
  const prevName=document.getElementById('gn')?.value||'';const prevDesc=document.getElementById('gd')?.value||'';const prevLoc=document.getElementById('gloc')?.value||window._gLocBuf||'';const prevAccess=document.getElementById('ga')?.value||'open';
  if(prevLoc)window._gLocBuf=prevLoc;
  const otherLocs=S.groups.filter(g=>g.type==='location');
  const parentPicker=showLoc&&otherLocs.length?'<div class="mf"><label>Inside location</label><select id="gparent"><option value="">— None (top level) —</option>'+otherLocs.map(l=>'<option value="'+l.id+'">'+l.name+'</option>').join('')+'</select></div>':'';
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>New group</h3><div class="mf"><label>Name</label><input id="gn" placeholder="Group name..." value="'+prevName.replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Type</label><select id="gt" onchange="window._gType=this.value;renderNewGroupModal()"><option value="location"'+(t==='location'?' selected':'')+'>Location</option><option value="department"'+(t==='department'?' selected':'')+'>Department</option><option value="role"'+(t==='role'?' selected':'')+'>Role</option></select></div><div class="mf"><label>Access</label><select id="ga"><option value="open"'+(prevAccess==='open'?' selected':'')+'>Open</option><option value="invite"'+(prevAccess==='invite'?' selected':'')+'>Invite only</option></select></div><div class="mf"><label>Description</label><textarea id="gd" placeholder="What is this group about?">'+prevDesc+'</textarea></div>'+(showLoc?'<div class="mf"><label>Location notes</label><textarea id="gloc" placeholder="e.g. Northern meadow...">'+prevLoc+'</textarea></div>'+parentPicker:'')+'<div class="mf"><label>Colour</label><div class="color-row">'+GCOLS.map(c=>'<div class="csw'+(c.h===window._gc?' on':'')+'" style="background:'+c.h+'" id="gsw'+c.h.replace('#','')+'" onclick="sgc(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="dng()">Create</button></div></div></div>';
}
function sgc(h){window._gc=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const e=document.getElementById('gsw'+h.replace('#',''));if(e)e.classList.add('on');}
function dng(){const name=(document.getElementById('gn')?.value||'').trim();if(!name)return;const id='grp-'+Date.now();const type=document.getElementById('gt').value;const loc=type==='location'?(document.getElementById('gloc')?.value||window._gLocBuf||'').trim():'';const parentId=type==='location'?(document.getElementById('gparent')?.value||''):'';const ng={id,name,type,color:window._gc||GCOLS[0].h,access:document.getElementById('ga').value,desc:(document.getElementById('gd')?.value||'').trim(),members:[S.activeId],location:loc,parentId,leads:[],founded:'',flags:[]};S.groups.push(ng);pushUndo({type:'addGroup',group:ng});const gcid='conv-grp-'+Date.now();S.conversations.push({id:gcid,type:'group',groupId:id,name,participants:[S.activeId],messages:[]});window._gLocBuf='';closeMod();S.nav='groups';S.grpDetailId=id;S.grpDetailTab='info';render();toast('Group created');}
function openNewAlterModal(){window._ac=ACOLS[0].h;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Add alter</h3><div class="mf"><label>Name</label><input id="an" placeholder="e.g. River"></div><div class="mf"><label>Pronouns</label><input id="ap" placeholder="e.g. they/them"></div><div class="mf"><label>Role</label><input id="ar" placeholder="e.g. Protector..."></div><div class="mf"><label>Colour</label><div class="color-row">'+ACOLS.map(c=>'<div class="csw'+(c.h===window._ac?' on':'')+'" style="background:'+c.h+'" id="asw'+c.h.replace('#','')+'" onclick="sac(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="dna()">Add alter</button></div></div></div>';}
function sac(h){window._ac=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const e=document.getElementById('asw'+h.replace('#',''));if(e)e.classList.add('on');}
function dna(){const name=(document.getElementById('an')?.value||'').trim();if(!name)return;const id='alter-'+Date.now();const newAlter={id,name,pronouns:(document.getElementById('ap')?.value||'—').trim(),role:(document.getElementById('ar')?.value||'Unknown').trim(),color:window._ac||ACOLS[0].h,age:'',traits:[],notes:'',triggers:'',comforts:'',theme:'library',mode:'light',expertise:[],nicknames:[]};S.alters.push(newAlter);pushUndo({type:'addAlter',alter:newAlter});S.galSel=id;closeMod();render();toast(name+' added');}
function openNewTodoListModal(){window._tc=TCOLS[0].h;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>New to-do list</h3><div class="mf"><label>Name</label><input id="tln" placeholder="List name..."></div><div class="mf"><label>Colour</label><div class="color-row">'+TCOLS.map(c=>'<div class="csw'+(c.h===window._tc?' on':'')+'" style="background:'+c.h+'" id="tcsw'+c.h.replace('#','')+'" onclick="stc(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="dntl()">Create</button></div></div></div>';}
function stc(h){window._tc=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const e=document.getElementById('tcsw'+h.replace('#',''));if(e)e.classList.add('on');}
function dntl(){const name=(document.getElementById('tln')?.value||'').trim();if(!name)return;const id='tl-'+Date.now();S.todoLists.push({id,name,color:window._tc||TCOLS[0].h,items:[]});S.activeTodoListId=id;closeMod();rc();toast('List created');}

function doSaveTodoList(lid){const l=gtl(lid);if(!l)return;l.name=(document.getElementById('tln')?.value||'').trim()||l.name;l.color=window._tc||l.color;closeMod();rc();}

function closeMod(){document.getElementById('mods').innerHTML='';window._modalDirty=false;}
window.addEventListener('input',(e)=>{if(!e.target)return;const mods=document.getElementById('mods');if(mods&&mods.contains(e.target)&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.isContentEditable)){window._modalDirty=true;}});
async function confirmCloseMod(){if(window._modalDirty){if(!await confirmDialog('Discard your changes? Anything you typed will be lost.','Discard changes'))return;}closeMod();}
/* After replacing a search modal's innerHTML, call this to restore keyboard focus
   on the search input so the user can keep typing without clicking again. */
function _refocusModalSearch(){const inp=document.querySelector('#mods .share-search input');if(!inp)return;const len=inp.value.length;inp.focus();inp.setSelectionRange(len,len);}


/* ── SETTINGS ── */
function buildSettings(){
  const info=getStorageInfo();
  const when=info.when?new Date(info.when):null;
  const whenStr=when?when.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})+' at '+when.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'}):'never';
  return '<div class="settings-page"><div class="settings-title">Settings</div><div class="settings-sub">Manage saved data and backups.</div>'
    +'<div class="settings-card"><div class="settings-card-title">System features</div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title">Departments</div><div class="settings-row-sub">Department groups and the Departments layer of the system map. Disable if your system doesn\'t use departments.</div></div>'
    +'<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" '+(S.settings?.departmentsEnabled!==false?'checked':'')+' onchange="S.settings.departmentsEnabled=this.checked;queueSave();rc();" style="width:16px;height:16px;cursor:pointer;"><span style="font-size:13px;color:var(--ink-m);">'+(S.settings?.departmentsEnabled!==false?'On':'Off')+'</span></label></div></div>'
    +'<div class="settings-card"><div class="settings-card-title">Saved data</div><div class="settings-card-desc">Your changes are automatically saved to your browser. Data stays on this device only.</div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title">Storage status</div><div class="settings-row-sub">'+(info.saved?'Saved locally · '+formatBytes(info.size)+' · last saved '+whenStr:'Nothing saved yet')+'</div></div><span class="settings-storage-badge'+(info.size>2*1024*1024?' warn':'')+'">'+(info.saved?'✓ Active':'— Idle')+'</span></div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title">Export data</div><div class="settings-row-sub">Full backup, selected sections, or individual items. JSON, CSV, or plain text.</div></div><button class="mbtn-s" onclick="openExportModal()">Export…</button></div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title">Import data</div><div class="settings-row-sub">Replace everything or merge in selected items from a JSON backup.</div></div><button class="mbtn-s" onclick="openImportModal()">Import…</button></div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title" style="color:var(--warm);">Clear all saved data</div><div class="settings-row-sub">Wipe everything and reset to defaults. This cannot be undone.</div></div><button class="mbtn-s" style="color:var(--warm);border-color:var(--warm-m);" onclick="clearSavedData()">Clear</button></div></div>'
    +'<div class="settings-card"><div class="settings-card-title">About</div><div class="settings-card-desc">System Library — everything lives in your browser\'s local storage. Nothing is sent anywhere.</div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title">Alters</div><div class="settings-row-sub">'+S.alters.length+' alter'+(S.alters.length!==1?'s':'')+' in the system</div></div></div>'
    +'<div class="settings-row"><div class="settings-row-label"><div class="settings-row-title">Content</div><div class="settings-row-sub">'+S.books.length+' books · '+S.events.length+' events · '+S.projects.length+' projects · '+S.polls.length+' polls</div></div></div></div></div>';
}

function openExportModal(){
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:480px;"><h3>Export data</h3><p>Download a full backup of your system data.</p><div class="mbtns"><button class="mbtn-s" onclick="closeMod()">Cancel</button><button class="mbtn-p" onclick="runFullExport()">Download full backup</button></div></div></div>';
}
function runFullExport(){const data={v:STORAGE_SCHEMA,savedAt:Date.now(),kind:'full',state:S};downloadFile('inner-world-backup-'+todayStamp()+'.json',JSON.stringify(data,null,2));toast('Full backup downloaded');closeMod();}
function openImportModal(){window._ioImportData=null;renderImportModal();}
function renderImportModal(){
  const hasFile=!!window._ioImportData;
  const d=window._ioImportData;
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:480px;"><h3>Import data</h3>'
    +(!hasFile?'<p>Pick a JSON backup file to restore from.</p><label style="display:flex;align-items:center;gap:10px;padding:14px;border:2px dashed var(--brd-s);border-radius:var(--r);cursor:pointer;background:var(--paper);">📁 Choose file<input type="file" accept=".json" style="display:none;" onchange="handleImportFileSelect(event)"></label>'
    :'<div class="io-preview-note">'+(d.sourceFormat?'Detected '+d.sourceFormat+' export.':'Found a '+(d.kind||'full')+' backup.'+(d.savedAt?' Saved '+relTime(d.savedAt):''))+'</div>'
    +'<div class="mf"><label>Import mode</label><div style="display:flex;gap:6px;"><button class="mbtn-s'+(window._ioImportMode==='replace'?' on':'')+'" onclick="window._ioImportMode=\'replace\';renderImportModal()">Replace all</button><button class="mbtn-s'+(window._ioImportMode==='add'?' on':'')+'" onclick="window._ioImportMode=\'add\';renderImportModal()">Add to existing</button></div></div>')
    +'<div class="mbtns"><button class="mbtn-s" onclick="closeMod()">Cancel</button>'
    +(hasFile?'<button class="mbtn-p" onclick="runImport()">Import</button>':'')+'</div></div></div>';
}
window._ioImportMode='replace';
function handleImportFileSelect(ev){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=(e)=>{
    try{
      const raw=JSON.parse(e.target.result);
      let state=null;let sourceFormat=null;
      if(raw.members&&Array.isArray(raw.members)){state=convertSimplyPluralExport(raw);sourceFormat=raw.id?'PluralKit':'Simply Plural';}
      else if(raw.state&&(raw.v||raw.savedAt||raw.kind)){state=raw.state;}
      else if(raw.alters&&Array.isArray(raw.alters)){state=raw;}
      else{toast('Unrecognised file format');return;}
      window._ioImportData={state,sourceFormat,v:raw.v,savedAt:raw.savedAt,kind:raw.kind};
      renderImportModal();
    }catch(err){toast('Could not read file — make sure it\'s valid JSON');}
  };
  reader.readAsText(file);
}
function runImport(){
  const d=window._ioImportData;if(!d||!d.state){toast('No file loaded');return;}
  const mode=window._ioImportMode||'replace';
  const imported=d.state;
  if(mode==='replace'){
    Object.keys(S).forEach(k=>{if(imported[k]!==undefined)S[k]=imported[k];});
    if(!ga(S.activeId)){const first=(S.alters||[])[0];S.activeId=first?first.id:null;}
    S.screen='gallery';S.galSel=null;
    saveState();closeMod();render();
    toast('Imported '+S.alters.length+' alters — pick who\'s fronting');
  }else{
    let added=0;
    if(imported.alters)imported.alters.forEach(a=>{if(!ga(a.id)){S.alters.push(a);added++;}});
    if(imported.groups)imported.groups.forEach(g=>{if(!gg(g.id)){S.groups.push(g);added++;}});
    saveState();closeMod();render();
    toast('Added '+added+' items');
  }
}
function downloadFile(name,content,mime='application/json'){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);}
function todayStamp(){return new Date().toISOString().slice(0,10);}
function spColorToHex(c){if(!c||typeof c!=='string')return'#7B9E8F';c=c.trim();if(c.startsWith('#'))return c.slice(0,7);if(/^[0-9a-fA-F]{8}$/.test(c))return'#'+c.slice(2,8);if(/^[0-9a-fA-F]{6}$/.test(c))return'#'+c;return'#7B9E8F';}
function convertSimplyPluralExport(sp){
  const state={alters:[],groups:[],polls:[]};
  const cfMap={};(sp.customFields||[]).forEach(cf=>{cfMap[cf._id]=cf.name||'';});
  const memberIdMap={};
  (sp.members||[]).forEach((m,i)=>{
    const newId='alter-sp-'+(m._id||('m'+i));
    memberIdMap[m._id]=newId;
    let age='';const customLines=[];
    Object.entries(m.info||{}).forEach(([k,v])=>{if(!v)return;const lbl=cfMap[k]||k;const lblLow=lbl.toLowerCase();if(lblLow==='age'||lblLow==='apparent age'){age=String(v);}else{customLines.push(lbl+': '+v);}});
    const notes=[m.desc||'',...customLines].filter(Boolean).join('\n');
    state.alters.push({id:newId,name:m.name||'Unnamed',pronouns:(m.pronouns||'').trim()||'—',role:(m.role||'').trim(),color:spColorToHex(m.color),age,traits:[],notes,triggers:'',comforts:'',theme:'library',mode:'light',expertise:[],nicknames:[...(m.pronouns_additional||[]),...(m.display_name&&m.display_name!==m.name?[m.display_name]:[])],flags:[]});
  });
  (sp.groups||[]).forEach((g,i)=>{const memberIds=(g.members||[]).map(mid=>memberIdMap[mid]).filter(Boolean);state.groups.push({id:'grp-sp-'+(g._id||('g'+i)),name:g.name||'Unnamed group',type:'role',color:spColorToHex(g.color),access:'open',desc:g.desc||'',members:memberIds.length>0?memberIds:state.alters.map(a=>a.id),location:'',founded:'',flags:[]});});
  return state;
}


/* ── ONBOARDING ── */
function buildOnboarding(){
  const step=S.obStep||0;
  let inner;
  if(S.obImporting)inner=buildObImport();
  else if(step===0)inner=buildObWelcome();
  else if(step===1)inner=buildObAlterForm();
  else if(step===2)inner=buildObDone();
  const pips=[0,1,2].map(i=>'<div class="ob-step-pip'+(i<step?' done':i===step?' on':'')+'"></div>').join('');
  return '<div class="ob-page"><div class="ob-card">'+(!S.obImporting?'<div class="ob-step-pip-row">'+pips+'</div>':'')+inner+'</div></div>';
}
function buildObWelcome(){
  return '<div class="ob-welcome-ico">✦</div>'
    +'<div class="ob-title">Welcome to System Library</div>'
    +'<div class="ob-sub">A private space to track your system — profiles, relationships, inner-world spaces, projects, and whatever else matters. Everything stays on your device.</div>'
    +'<div class="ob-actions" style="flex-direction:column;gap:8px;">'
    +'<button class="ob-btn-primary" onclick="obNext()">Create profiles manually →</button>'
    +'<button class="ob-btn-secondary" onclick="S.obImporting=true;render()" style="display:flex;align-items:center;justify-content:center;gap:7px;"><span style="font-size:15px;">⬆</span> Import from PluralKit, Simply Plural, or a backup</button>'
    +'</div>';
}
function buildObImport(){
  const d=window._ioImportData;
  const hasFile=!!d;
  const isFirstRun=!S.onboarded||S.alters.length===0;
  const fmt=hasFile?(d.sourceFormat||'System Library backup'):'';
  const fileBtn=`<label style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 18px;border:2px dashed var(--brd-s);border-radius:var(--r);cursor:pointer;font-size:14px;color:var(--ink-m);background:var(--paper);">
    <span style="font-size:20px;">${hasFile?'✓':'📂'}</span>
    ${hasFile?`<span style="color:var(--sage);font-weight:500;">File loaded — ${fmt}</span>`:'<span>Choose a JSON export file\u2026</span>'}
    <input type="file" accept=".json" style="display:none;" onchange="obHandleImportFile(event)">
  </label>`;
  const addBtn=(!isFirstRun&&hasFile)?`<button class="ob-btn-secondary" onclick="obDoImport(false)">Add to existing alters</button>`:'';
  const confirmBtn=hasFile?`<button class="ob-btn-primary" onclick="obDoImport(true)">Import &amp; continue \u2192</button>`:'';
  return `<div class="ob-title">Import your system</div>
    <div class="ob-sub">Import from <b>PluralKit</b>, <b>Simply Plural</b>, or a <b>System Library backup</b>.</div>
    <div style="margin:14px 0;">${fileBtn}</div>
    <div class="ob-actions">
      <button class="ob-btn-secondary" onclick="S.obImporting=false;window._ioImportData=null;render()">← Back</button>
      ${addBtn}${confirmBtn}
    </div>`;
}

function obDoImport(replace){
  try{obRunImport(replace?'replace':'add');}
  catch(e){alert('Import error: '+e.message+'\n'+e.stack);}
}
function buildObAlterForm(){
  if(!S.obDraft)S.obDraft={name:'',pronouns:'',role:'',color:ACOLS[0].h,photo:null};
  const d=S.obDraft;const added=S.obAlters||[];
  return '<div class="ob-title">'+(added.length===0?'Create your first alter':'Add another alter')+'</div>'
    +'<div class="ob-sub">'+(added.length===0?'Start with whoever feels most natural. You can add more after.':'You can add as many as you like — or finish now.')+'</div>'
    +(added.length>0?'<div class="ob-added-list">'+added.map((a,i)=>'<div class="ob-added-row"><div class="ob-added-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+(a.photo?'<img src="'+a.photo+'">':ini(a.name))+'</div><div class="ob-added-info"><div class="ob-added-name">'+a.name+'</div><div class="ob-added-role">'+(a.role||'—')+(a.pronouns?' · '+a.pronouns:'')+'</div></div><span class="ob-added-x" onclick="obRemoveAdded('+i+')">×</span></div>').join('')+'</div>':'')
    +'<div class="ob-field"><div class="ob-field-label">Name</div><input id="obName" placeholder="What do they go by?" value="'+d.name.replace(/"/g,'&quot;')+'" oninput="S.obDraft.name=this.value"></div>'
    +'<div class="ob-fields-row"><div class="ob-field"><div class="ob-field-label">Pronouns</div><input id="obPro" placeholder="e.g. she/her" value="'+d.pronouns.replace(/"/g,'&quot;')+'" oninput="S.obDraft.pronouns=this.value"></div><div class="ob-field"><div class="ob-field-label">Role</div><input id="obRole" placeholder="e.g. Protector" value="'+d.role.replace(/"/g,'&quot;')+'" oninput="S.obDraft.role=this.value"></div></div>'
    +'<div class="ob-field"><div class="ob-field-label">Colour</div><div class="ob-color-row">'+ACOLS.map(c=>'<div class="ob-color-sw'+(d.color===c.h?' on':'')+'" style="background:'+c.h+'" onclick="S.obDraft.color=\''+c.h+'\';render()"></div>').join('')+'</div></div>'
    +'<div class="ob-actions"><button class="ob-btn-secondary" onclick="S.obStep=0;S.obDraft=null;render()">← Back</button>'
    +(added.length>0?'<button class="ob-btn-secondary" onclick="obAddAlter(true)">Save &amp; add another</button>':'')
    +'<button class="ob-btn-primary" onclick="obAddAlter(false)">'+(added.length===0?'Save &amp; continue':'Save &amp; finish')+'</button></div>'
    +(added.length>=1?'<div class="ob-skip-link" onclick="obFinish()">Skip — finish setup</div>':'');
}
function buildObDone(){
  const count=S.obAlters?.length||S.alters.length;
  return '<div class="ob-welcome-ico">✓</div><div class="ob-title">All set</div>'
    +'<div class="ob-sub">'+count+' alter'+(count!==1?'s':'')+' ready. You can edit profiles, add photos, and adjust details any time from <b>Profiles</b>.</div>'
    +'<div class="ob-actions"><button class="ob-btn-primary" onclick="obEnterApp()">Enter the app →</button></div>';
}
function obNext(){S.obStep=(S.obStep||0)+1;render();}
function obAddAlter(addAnother){
  if(!S.obDraft)S.obDraft={name:'',pronouns:'',role:'',color:ACOLS[0].h,photo:null};
  // Sync current input values into draft before processing
  const ni=document.getElementById('obName');const pi=document.getElementById('obPro');const ri=document.getElementById('obRole');
  if(ni)S.obDraft.name=ni.value;if(pi)S.obDraft.pronouns=pi.value;if(ri)S.obDraft.role=ri.value;
  const d=S.obDraft;if(!d)return;
  if(!S.obAlters)S.obAlters=[];
  const name=(d.name||'').trim()||('Alter '+(S.obAlters.length+1));
  S.obAlters.push({id:'alter-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name,pronouns:(d.pronouns||'').trim()||'—',role:(d.role||'').trim()||'Unknown',color:d.color||ACOLS[0].h,photo:d.photo||undefined,age:'',traits:[],notes:'',triggers:'',comforts:'',theme:'library',mode:'light',expertise:[]});
  S.obDraft={name:'',pronouns:'',role:'',color:ACOLS[(S.obAlters.length)%ACOLS.length].h,photo:null};
  if(addAnother){render();return;}
  obFinish();
}
function obRemoveAdded(i){S.obAlters.splice(i,1);render();}
function obHandleImportFile(ev){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=(e)=>{
    try{
      const raw=JSON.parse(e.target.result);
      let state=null;let sourceFormat=null;
      if(raw.members&&Array.isArray(raw.members)){state=convertSimplyPluralExport(raw);sourceFormat=raw.id?'PluralKit':'Simply Plural';}
      else if(raw.state&&(raw.v||raw.savedAt||raw.kind)){state=raw.state;}
      else if(raw.alters&&Array.isArray(raw.alters)){state=raw;}
      else{toast('Unrecognised file format');return;}
      window._ioImportData={state,sourceFormat,v:raw.v,savedAt:raw.savedAt,kind:raw.kind};
      render();
    }catch(err){toast('Could not read file');}
  };
  reader.readAsText(file);
}
function obRunImport(mode){
  const d=window._ioImportData;if(!d||!d.state){toast('No file loaded');return;}
  const imported=d.state;
  if(mode==='add'){if(imported.alters)S.alters=[...S.alters,...imported.alters];if(imported.groups)S.groups=[...S.groups,...imported.groups];toast('Added '+(imported.alters||[]).length+' alters');}
  else{if(imported.alters&&imported.alters.length>0)S.alters=[...imported.alters];if(imported.groups&&imported.groups.length>0)S.groups=[...imported.groups];toast('Imported '+S.alters.length+' alters — pick who\'s fronting');}
  S.activeId=null;window._ioImportData=null;S.obImporting=false;
  delete S.obStep;delete S.obDraft;delete S.obAlters;
  S.onboarded=true;S.screen='gallery';S.galSel=null;render();
}
function obFinish(){
  if(!S.obAlters||S.obAlters.length===0){
    S.obAlters=[{id:'alter-'+Date.now(),name:'Unnamed',pronouns:'—',role:'Unknown',color:ACOLS[0].h,age:'',traits:[],notes:'',triggers:'',comforts:'',theme:'library',mode:'light',expertise:[],nicknames:[]}];
  }
  S.alters=[...S.obAlters];
  S.activeId=null;S.onboarded=true;S.screen='gallery';S.galSel=null;
  delete S.obStep;delete S.obDraft;delete S.obAlters;
  render();toast('Welcome — pick who is fronting');
}
function obEnterApp(){
  S.onboarded=true;S.obImporting=false;
  delete S.obStep;delete S.obDraft;delete S.obAlters;
  if(!ga(S.activeId)){S.screen='gallery';S.galSel=null;}
  else{S.screen='main';S.nav='dashboard';}
  render();toast('Welcome');
}
function obEnterAppAndTour(){obEnterApp();}
function openTourPicker(){toast('Tour coming soon');}


/* ── SYSTEM MAP ── */
const DEFAULT_CONN_LABELS=[{label:'knows of',style:'dotted',dash:'2 4'},{label:'friends',style:'dashed',dash:'5 3'},{label:'close',style:'solid',dash:'0'},{label:'partners',style:'double',dash:'0'},{label:'boss–employee',style:'boss',dash:'0'}];
const DEFAULT_RELATIONS_LABELS=[{label:'acquaintance',style:'dotted',dash:'2 4'},{label:'friend',style:'dashed',dash:'5 3'},{label:'close friend',style:'solid',dash:'0'},{label:'family',style:'solid',dash:'0'},{label:'partner',style:'double',dash:'0'},{label:'therapist',style:'boss',dash:'0'},{label:'caregiver',style:'boss',dash:'0'},{label:'colleague',style:'dashed',dash:'5 3'}];
const MAP_LAYERS=[{id:'locations',label:'Locations',ico:'◉',desc:'Where alters are in the inner world',groupType:'location'},{id:'connections',label:'Connections',ico:'◈',desc:'Inner system connections'},{id:'relations',label:'Relations',ico:'🌐',desc:'Connections to the outer world'},{id:'departments',label:'Departments',ico:'◆',desc:'Work areas and info flow',groupType:'department'}];
function layerData(){return S.mapLayers[S.mapLayer];}
function layerMeta(){return MAP_LAYERS.find(l=>l.id===S.mapLayer);}
function getLayerGroupNodes(){const meta=layerMeta();if(!meta.groupType)return[];return S.groups.filter(g=>g.type===meta.groupType);}
function _hasOverlap(positions){
  // Returns true if enough node pairs are within 56px (node diameter) — indicates old stacked layout
  const pts=Object.values(positions);if(pts.length<2)return false;
  const lim=Math.max(3,Math.ceil(pts.length*0.1));let n=0;
  for(let i=0;i<pts.length&&n<=lim;i++)for(let j=i+1;j<pts.length&&n<=lim;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;if(dx*dx+dy*dy<56*56)n++;}
  return n>lim;
}
function ensureMapPositions(){
  if(!S.mapLayers[S.mapLayer]){S.mapLayer='locations';}
  const ld=layerData();if(!ld.positions)ld.positions={};if(!ld.backboards)ld.backboards={};if(!ld.connections)ld.connections=[];
  const existing=Object.keys(ld.positions);const missing=S.alters.map(a=>a.id).filter(id=>!existing.includes(id));
  if(missing.length){const cols=Math.max(1,Math.ceil(Math.sqrt(missing.length)));missing.forEach((id,si)=>{const col=si%cols;const row=Math.floor(si/cols);ld.positions[id]={x:120+col*130,y:120+row*130};});}
  getLayerGroupNodes().forEach((g,i)=>{if(!ld.backboards[g.id])ld.backboards[g.id]={x:220+i*350,y:360,w:320,h:200};});
  if(S.mapLayer==='relations'){
    const existingE=Object.keys(ld.positions).filter(id=>ge(id));
    const missingE=S.entities.map(e=>e.id).filter(id=>!existingE.includes(id)&&!ld.positions[id]);
    if(missingE.length){const cols=Math.max(1,Math.ceil(Math.sqrt(missingE.length)));missingE.forEach((id,si)=>{const col=si%cols;const row=Math.floor(si/cols);ld.positions[id]={x:700+col*130,y:120+row*130};});}
  }
  // Silently fix layouts saved with old overlapping algorithm
  if(_hasOverlap(ld.positions))autoLayoutMap(true);
}
function ensureAltersInBackboards(){if(S.mapLayer==='connections'||S.mapLayer==='relations')return;const ld=layerData();S.alters.forEach(a=>{const home=getHomeBackboard(a.id);if(!home)return;const p=ld.positions[a.id]||{x:0,y:0};const margin=30;const minX=home.x-home.w/2+margin;const maxX=home.x+home.w/2-margin;const minY=home.y-home.h/2+margin;const maxY=home.y+home.h/2-margin;if(p.x<minX||p.x>maxX||p.y<minY||p.y>maxY){const myGroup=S.groups.find(g=>g.type===layerMeta().groupType&&g.members.includes(a.id));if(myGroup){const siblings=myGroup.members;const idx=siblings.indexOf(a.id);const angle=(idx/Math.max(siblings.length,1))*Math.PI*2;const r=Math.min(home.w,home.h)/3.5;ld.positions[a.id]={x:home.x+Math.cos(angle)*r,y:home.y+Math.sin(angle)*r};}}});}
let _mapUndo=[];let _mapRedo=[];
function mapSnapshot(){return JSON.stringify({layers:S.mapLayers,cl:S.mapCustomLabels});}
function mapPushUndo(){_mapUndo.push(mapSnapshot());if(_mapUndo.length>50)_mapUndo.shift();_mapRedo=[];}
function mapUndo(){if(!_mapUndo.length)return;_mapRedo.push(mapSnapshot());const prev=JSON.parse(_mapUndo.pop());S.mapLayers=prev.layers;S.mapCustomLabels=prev.cl;rc();}
function mapRedo(){if(!_mapRedo.length)return;_mapUndo.push(mapSnapshot());const nxt=JSON.parse(_mapRedo.pop());S.mapLayers=nxt.layers;S.mapCustomLabels=nxt.cl;rc();}
function buildSystemMap(){
  ensureMapPositions();ensureAltersInBackboards();
  const ld=layerData();const groups=getLayerGroupNodes();const meta=layerMeta();
  const shortcuts=buildMapShortcuts();
  return '<div class="map-page">'
    +'<div class="map-layer-tabs">'+MAP_LAYERS.filter(l=>l.id!=="departments"||S.settings?.departmentsEnabled!==false).map(l=>'<div class="map-layer-tab'+(S.mapLayer===l.id?' act':'')+'" onclick="switchMapLayer(\''+l.id+'\')"><span class="map-layer-tab-ico">'+l.ico+'</span>'+l.label+'</div>').join('')+'</div>'
    +'<div class="map-controls"><span class="map-title">'+meta.label+'</span>'
    +'<div class="map-mode-toggle"><button class="map-mode-btn'+(S.mapMode==='view'?' on':'')+'" onclick="setMapMode(\'view\')">View</button>'
    +(S.mapLayer!=='locations'?'<button class="map-mode-btn'+(S.mapMode==='connect'?' on':'')+'" onclick="setMapMode(\'connect\')">'+(S.mapLayer==='departments'?'Info flow':'Connect')+'</button>':'')
    +'</div><button class="map-action-btn" onclick="autoLayoutMap()">⟳ Auto-arrange</button>'
    +'<div style="display:flex;gap:4px;"><button class="map-icon-btn" onclick="mapUndo()" '+(_mapUndo.length===0?'disabled':'')+'>↶</button><button class="map-icon-btn" onclick="mapRedo()" '+(_mapRedo.length===0?'disabled':'')+'>↷</button></div>'
    +(S.mapMode==='connect'?'<span class="map-hint">'+(S.mapLayer==='departments'?'Click two departments to set info flow':S.mapLayer==='relations'?'Click two nodes (alter or person) to connect':'Click two alters to connect')+'</span>':'')
    +'<span style="margin-left:auto;font-size:11px;color:var(--ink-s);">'+(S.mapLayer==='relations'?S.alters.length+' alters · '+S.entities.length+' people · '+ld.connections.length+' links':S.alters.length+' alters · '+groups.length+' groups · '+ld.connections.length+' links')+'</span></div>'
    +(shortcuts?'<div class="map-shortcuts">'+shortcuts+'</div>':'')
    +'<div class="map-canvas-wrap"><div class="map-grid-bg"></div>'
    +'<div class="map-canvas'+(S.mapMode==='connect'?' connect-mode':'')+'" id="map-canvas" onmousedown="startMapPan(event)" onwheel="handleMapWheel(event)" style="touch-action:none;">'
    +'<svg class="map-svg" id="map-svg"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-s)" fill-opacity="0.7"/></marker><marker id="arrow-sel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--warm)"/></marker></defs>'
    +'<g id="map-conn-group" style="transform:translate('+S.mapPan.x+'px,'+S.mapPan.y+'px) scale('+S.mapZoom+');transform-origin:0 0;">'+ld.connections.map(c=>buildConnSvg(c)).join('')+'</g></svg>'
    +'<div class="map-nodes" id="map-nodes-layer" style="transform:translate('+S.mapPan.x+'px,'+S.mapPan.y+'px) scale('+S.mapZoom+');transform-origin:0 0;">'+groups.map(g=>buildBackboardHtml(g)).join('')+S.alters.map(a=>buildAlterNodeHtml(a)).join('')+(S.mapLayer==='relations'?S.entities.map(e=>buildEntityNodeHtml(e)).join(''):'')+'</div>'
    +'</div>'+(S.mapConnectSource?'<div class="map-conn-hint">Now click a second '+(S.mapLayer==='departments'?'department':S.mapLayer==='relations'?'node':'alter')+' → <button class="map-conn-cancel" onclick="S.mapConnectSource=null;rc()">Cancel</button></div>':'')
    +'<div class="map-zoom-ctrl"><button class="map-zoom-btn" onclick="mapZoom(0.1)">+</button><button class="map-zoom-btn" onclick="mapZoom(-0.1)">−</button><button class="map-zoom-btn" onclick="mapResetView()" style="font-size:11px;">⌂</button></div>'
    +'</div></div>';
}
function buildMapShortcuts(){
  if(S.mapLayer==='locations'){const locs=S.groups.filter(g=>g.type==='location');if(!locs.length)return'';return'<span style="font-size:11px;color:var(--ink-s);margin-right:6px;">Jump to:</span>'+locs.map(g=>'<button class="map-shortcut-btn" onclick="jumpToMapGroup(\''+g.id+'\')" style="border-color:'+g.color+';color:'+g.color+';">◉ '+g.name+'</button>').join('');}
  if(S.mapLayer==='departments'){const depts=S.groups.filter(g=>g.type==='department');if(!depts.length)return'';return'<span style="font-size:11px;color:var(--ink-s);margin-right:6px;">Jump to:</span>'+depts.map(g=>'<button class="map-shortcut-btn" onclick="jumpToMapGroup(\''+g.id+'\')" style="border-color:'+g.color+';color:'+g.color+';">◆ '+g.name+'</button>').join('');}
  if(S.mapLayer==='connections'){return'<button class="map-shortcut-btn" onclick="navTo(\'relationships\')" style="border-color:var(--sage-m);color:var(--sage);">♥ View Relationships</button>';}
  if(S.mapLayer==='relations'){return'<button class="map-shortcut-btn" onclick="navTo(\'relations\')" style="border-color:var(--ink-s);color:var(--ink-m);">🌐 View Relations</button>';}
  return'';
}
function jumpToMapGroup(gid){const ld=layerData();const bb=ld.backboards[gid];if(!bb)return;const canvas=document.getElementById('map-canvas');if(!canvas)return;const rect=canvas.getBoundingClientRect();S.mapPan={x:rect.width/2-bb.x*S.mapZoom,y:rect.height/2-bb.y*S.mapZoom};const nodesLayer=document.getElementById('map-nodes-layer');const connGroup=document.getElementById('map-conn-group');const t='translate('+S.mapPan.x+'px,'+S.mapPan.y+'px) scale('+S.mapZoom+')';if(nodesLayer)nodesLayer.style.transform=t;if(connGroup)connGroup.style.transform=t;}
function autoLayoutMap(silent){
  if(!silent)mapPushUndo();const ld=layerData();const meta=layerMeta();
  const STEP=130; // px between node centres — safely larger than any node
  const gridPlace=(ids,ox,oy)=>{const cols=Math.max(1,Math.ceil(Math.sqrt(ids.length)));ids.forEach((id,i)=>{ld.positions[id]={x:ox+(i%cols)*STEP,y:oy+Math.floor(i/cols)*STEP};});};
  const circlePlace=(ids,cx,cy,r)=>{ids.forEach((id,i)=>{const angle=(i/Math.max(ids.length,1))*Math.PI*2-Math.PI/2;ld.positions[id]={x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r};});};
  if(S.mapLayer==='relations'){
    // Left column: alters in a grid; right column: entities in a grid
    const Na=S.alters.length;const Ne=S.entities.length;
    const aCols=Math.max(1,Math.ceil(Math.sqrt(Na)));const leftH=Math.ceil(Na/aCols)*STEP;
    S.alters.forEach((a,i)=>{ld.positions[a.id]={x:80+(i%aCols)*STEP,y:80+Math.floor(i/aCols)*STEP};});
    const eCols=Math.max(1,Math.ceil(Math.sqrt(Ne)));
    S.entities.forEach((e,i)=>{ld.positions[e.id]={x:80+aCols*STEP+180+(i%eCols)*STEP,y:80+Math.floor(i/eCols)*STEP};});
  }else if(meta.groupType){
    const groups=getLayerGroupNodes();const BB_W=300,BB_H=220,BB_PAD=50,BB_GAP=40;
    const bbCols=3;
    groups.forEach((g,gi)=>{const col=gi%bbCols;const row=Math.floor(gi/bbCols);ld.backboards[g.id]={x:80+col*(BB_W+BB_GAP)+BB_W/2,y:80+row*(BB_H+BB_GAP)+BB_H/2,w:BB_W,h:BB_H};});
    const bbRows=Math.ceil(groups.length/bbCols);const baseY=80+bbRows*(BB_H+BB_GAP)+40;
    const homeless=S.alters.filter(a=>!getHomeBackboard(a.id));
    gridPlace(homeless.map(a=>a.id),80,groups.length?baseY:80);
    S.alters.filter(a=>getHomeBackboard(a.id)).forEach(a=>{const home=getHomeBackboard(a.id);const members=S.alters.filter(x=>getHomeBackboard(x.id)===home);const idx=members.indexOf(a);const perRow=Math.max(1,Math.floor((home.w-BB_PAD*2)/74));ld.positions[a.id]={x:home.x-home.w/2+BB_PAD+(idx%perRow)*74+30,y:home.y-home.h/2+BB_PAD+Math.floor(idx/perRow)*74+30};});
  }else{
    const N=S.alters.length;
    if(N<=16){const r=Math.max(180,Math.ceil(N*100/(2*Math.PI)));circlePlace(S.alters.map(a=>a.id),500,r+100,r);}
    else{gridPlace(S.alters.map(a=>a.id),80,80);}
  }
  if(silent)return; // caller (buildSystemMap) renders once with updated positions
  rc();toast('Auto-arranged');
}
function getLabelStyle(label){const preset=[...DEFAULT_CONN_LABELS,...DEFAULT_RELATIONS_LABELS].find(l=>l.label===label);if(preset)return preset;return{label:label||'',style:'custom',dash:'0'};}
function buildConnSvg(c){
  const ld=layerData();const isDept=S.mapLayer==='departments';
  const getPos=(id)=>{if(isDept){const bb=ld.backboards[id];return bb?{x:bb.x,y:bb.y}:null;}return ld.positions[id];};
  const p1=getPos(c.from);const p2=getPos(c.to);if(!p1||!p2)return'';
  const mx=(p1.x+p2.x)/2;const my=(p1.y+p2.y)/2;
  const sel=S.mapSelected&&S.mapSelected.type==='connection'&&S.mapSelected.id===c.id;
  const styleInfo=getLabelStyle(c.label);const strokeColor=sel?'var(--warm)':'var(--ink-s)';
  const markerEnd=c.directed?(sel?'url(#arrow-sel)':'url(#arrow)'):'';
  if(styleInfo.style==='boss'){const dx=p2.x-p1.x;const dy=p2.y-p1.y;const len=Math.sqrt(dx*dx+dy*dy)||1;const ux=dx/len;const uy=dy/len;const arrowSize=12;const ex=p2.x-ux*arrowSize;const ey=p2.y-uy*arrowSize;const px=-uy*5;const py=ux*5;return'<line x1="'+p1.x+'" y1="'+p1.y+'" x2="'+ex+'" y2="'+ey+'" stroke="'+(sel?'var(--warm)':'var(--ink)')+'" stroke-width="2.5" stroke-opacity="0.85"/><polygon points="'+p2.x+','+p2.y+' '+(ex+px)+','+(ey+py)+' '+(ex-px)+','+(ey-py)+'" fill="'+(sel?'var(--warm)':'var(--ink)')+'" opacity="0.85"/>'+( c.label?buildConnLabel(mx,my,c,sel):'');}
  if(styleInfo.style==='double'){const dx=p2.x-p1.x;const dy=p2.y-p1.y;const len=Math.sqrt(dx*dx+dy*dy)||1;const ox=-dy/len*3;const oy=dx/len*3;return'<line x1="'+(p1.x+ox)+'" y1="'+(p1.y+oy)+'" x2="'+(p2.x+ox)+'" y2="'+(p2.y+oy)+'" stroke="'+strokeColor+'" stroke-width="1.8" stroke-opacity="0.6" marker-end="'+markerEnd+'"/><line x1="'+(p1.x-ox)+'" y1="'+(p1.y-oy)+'" x2="'+(p2.x-ox)+'" y2="'+(p2.y-oy)+'" stroke="'+strokeColor+'" stroke-width="1.8" stroke-opacity="0.6"/>'+(c.label?buildConnLabel(mx,my,c,sel):'');}
  return'<line x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'" stroke="'+strokeColor+'" stroke-width="1.8" stroke-opacity="0.6" stroke-dasharray="'+styleInfo.dash+'" marker-end="'+markerEnd+'"/>'+(c.label?buildConnLabel(mx,my,c,sel):'');
}
function buildConnLabel(mx,my,c,sel){return'<g transform="translate('+mx+','+my+')" style="cursor:pointer;pointer-events:auto;" onclick="selectMapThing(\'connection\',\''+c.id+'\');event.stopPropagation();"><rect x="-34" y="-10" width="68" height="18" rx="9" fill="var(--white)" stroke="'+(sel?'var(--warm)':'var(--brd)')+'"/><text x="0" y="3" text-anchor="middle" font-size="10" fill="var(--ink-m)" font-family="Arial">'+c.label+(c.directed?' →':'')+'</text></g>';}
function buildBackboardHtml(g){
  const ld=layerData();const b=ld.backboards[g.id];if(!b)return'';
  const sel=S.mapSelected&&S.mapSelected.type==='place'&&S.mapSelected.id===g.id;const isDept=S.mapLayer==='departments';
  return '<div class="map-backboard'+(sel?' selected':'')+'" data-id="'+g.id+'" style="left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px;--_bb:'+g.color+';--_bbg:'+g.color+'14;'+(S.mapMode==='connect'&&isDept?'cursor:crosshair;':'')+'" onmousedown="mapBackboardMouseDown(event,\''+g.id+'\')" onclick="if(S.mapMode===\'connect\'&&S.mapLayer===\'departments\'){event.stopPropagation();mapBackboardConnectClick(event,\''+g.id+'\');}" ondblclick="event.stopPropagation();openPlaceFromMap(\''+g.id+'\')">'
    +'<div class="map-backboard-label" style="border-color:'+g.color+'55;color:'+g.color+';">'+(isDept?'◆':'◉')+' '+g.name+'<span class="map-backboard-sub">· '+g.members.length+' alter'+(g.members.length!==1?'s':'')+((g.leads||[]).length?' · '+(g.leads||[]).map(id=>ga(id)?.name).filter(Boolean).join(', ')+' (lead'+(g.leads.length!==1?'s':'')+')':'')+'</span></div></div>';
}
function mapBackboardConnectClick(e,id){if(S.mapLayer!=='departments')return;const ld=layerData();e.stopPropagation();if(!S.mapConnectSource){S.mapConnectSource=id;rc();return;}if(S.mapConnectSource===id){S.mapConnectSource=null;rc();return;}const existing=ld.connections.find(c=>(c.from===S.mapConnectSource&&c.to===id)||(c.from===id&&c.to===S.mapConnectSource));if(existing){const src=S.mapConnectSource;S.mapConnectSource=null;openConnLabelModal(existing.id,src,id,false);return;}mapPushUndo();const newId='mc-'+Date.now();ld.connections.push({id:newId,from:S.mapConnectSource,to:id,label:'shares with',directed:true});const src=S.mapConnectSource;S.mapConnectSource=null;openConnLabelModal(newId,src,id,true);}
function buildAlterNodeHtml(a){const ld=layerData();const p=ld.positions[a.id]||{x:400,y:260};const isConnSrc=S.mapConnectSource===a.id;const sel=S.mapSelected&&S.mapSelected.type==='alter'&&S.mapSelected.id===a.id;return'<div class="map-node map-node-alter'+(isConnSrc?' connect-source':sel?' selected':'')+'" data-id="'+a.id+'" style="left:'+p.x+'px;top:'+p.y+'px;" onmousedown="mapNodeMouseDown(event,\''+a.id+'\',\'alter\')" ondblclick="event.stopPropagation();openAlterFromMap(\''+a.id+'\')"><div class="map-node-shape" style="background:'+abg(a.color)+';color:'+a.color+';">'+aAv(a)+'</div><div class="map-node-label">'+a.name+'</div><div class="map-node-sub">'+a.role+'</div></div>';}
function buildEntityNodeHtml(e){const ld=layerData();const p=ld.positions[e.id]||{x:700,y:260};const isConnSrc=S.mapConnectSource===e.id;const sel=S.mapSelected&&S.mapSelected.type==='entity'&&S.mapSelected.id===e.id;const typ=et(e.type);return'<div class="map-node map-node-entity'+(isConnSrc?' connect-source':sel?' selected':'')+'" data-id="'+e.id+'" style="left:'+p.x+'px;top:'+p.y+'px;" onmousedown="mapEntityNodeMouseDown(event,\''+e.id+'\')" ondblclick="event.stopPropagation();navTo(\'relations\')"><div class="map-node-shape map-entity-shape" style="background:'+abg(e.color)+';color:'+e.color+';border-radius:6px;">'+ini(e.name)+'</div><div class="map-node-label">'+e.name+'</div><div class="map-node-sub">'+typ.label+'</div></div>';}
function mapEntityNodeMouseDown(e,id){
  e.stopPropagation();const ld=layerData();
  if(S.mapMode==='connect'&&S.mapLayer==='relations'){
    e.preventDefault();
    if(!S.mapConnectSource){S.mapConnectSource=id;rc();return;}
    if(S.mapConnectSource===id){S.mapConnectSource=null;rc();return;}
    const existing=ld.connections.find(c=>(c.from===S.mapConnectSource&&c.to===id)||(c.from===id&&c.to===S.mapConnectSource));
    if(existing){const src=S.mapConnectSource;S.mapConnectSource=null;openConnLabelModal(existing.id,src,id,false);return;}
    mapPushUndo();const newId='mc-'+Date.now();
    ld.connections.push({id:newId,from:S.mapConnectSource,to:id,label:'',directed:false});
    const src=S.mapConnectSource;S.mapConnectSource=null;openConnLabelModal(newId,src,id,true);return;
  }
  if(S.mapMode==='view'){selectMapThing('entity',id);}
}
function getMapNodeName(id){
  if(S.mapLayer==='departments')return gg(id)?.name||'?';
  const a=ga(id);if(a)return a.name;
  const e=ge(id);if(e)return e.name;
  return'?';
}
function switchMapLayer(id){S.mapLayer=id;S.mapConnectSource=null;S.mapSelected=null;rc();}
function setMapMode(m){S.mapMode=m;S.mapConnectSource=null;S.mapSelected=null;rc();}
function mapZoom(delta){S.mapZoom=Math.max(0.25,Math.min(3,S.mapZoom+delta));rc();}
function mapZoomAt(delta,clientX,clientY){const canvas=document.getElementById('map-canvas');if(!canvas)return mapZoom(delta);const rect=canvas.getBoundingClientRect();const mouseX=clientX-rect.left;const mouseY=clientY-rect.top;const oldZoom=S.mapZoom;const newZoom=Math.max(0.25,Math.min(3,oldZoom+delta));S.mapPan={x:mouseX-(mouseX-S.mapPan.x)*(newZoom/oldZoom),y:mouseY-(mouseY-S.mapPan.y)*(newZoom/oldZoom)};S.mapZoom=newZoom;const nodesLayer=document.getElementById('map-nodes-layer');const connGroup=document.getElementById('map-conn-group');const t='translate('+S.mapPan.x+'px,'+S.mapPan.y+'px) scale('+S.mapZoom+')';if(nodesLayer)nodesLayer.style.transform=t;if(connGroup)connGroup.style.transform=t;queueSave();}
function handleMapWheel(e){e.preventDefault();mapZoomAt(e.deltaY>0?-0.08:0.08,e.clientX,e.clientY);}
function mapResetView(){S.mapZoom=1;S.mapPan={x:0,y:0};rc();}
function selectMapThing(type,id){S.mapSelected={type,id};rc();}
function openAlterFromMap(id){S.nav='profiles';S.selectedProfileId=id;render();}
function openPlaceFromMap(id){S.grpDetailId=id;S.grpDetailTab='info';S.nav='groups';render();}
let _mapDrag=null;
function mapNodeMouseDown(e,id,kind){
  e.stopPropagation();const ld=layerData();
  if(S.mapMode==='connect'&&kind==='alter'&&S.mapLayer!=='departments'){e.preventDefault();if(!S.mapConnectSource){S.mapConnectSource=id;rc();return;}if(S.mapConnectSource===id){S.mapConnectSource=null;rc();return;}const existing=ld.connections.find(c=>(c.from===S.mapConnectSource&&c.to===id)||(c.from===id&&c.to===S.mapConnectSource));if(existing){const src=S.mapConnectSource;S.mapConnectSource=null;openConnLabelModal(existing.id,src,id,false);return;}mapPushUndo();const newId='mc-'+Date.now();ld.connections.push({id:newId,from:S.mapConnectSource,to:id,label:'',directed:false});const src=S.mapConnectSource;S.mapConnectSource=null;openConnLabelModal(newId,src,id,true);return;}
  if(S.mapMode==='view'){selectMapThing('alter',id);}
}
function getHomeBackboard(alterId){if(S.mapLayer==='connections'||S.mapLayer==='relations')return null;const ld=layerData();const meta=layerMeta();if(!meta.groupType)return null;const group=S.groups.find(g=>g.type===meta.groupType&&g.members.includes(alterId));if(!group)return null;return ld.backboards[group.id];}
let _bbDrag=null;
function mapBackboardMouseDown(e,id){
  e.stopPropagation();const ld=layerData();
  if(S.mapMode==='connect'&&S.mapLayer==='departments'){e.preventDefault();mapBackboardConnectClick(e,id);return;}
  if(S.mapMode==='view'){selectMapThing('place',id);return;}
}
let _mapPan=null;
function mapPanCleanup(){document.removeEventListener('mousemove',mapPanMove);document.removeEventListener('mouseup',mapPanEnd);_mapPan=null;const canvas=document.getElementById('map-canvas');if(canvas)canvas.classList.remove('dragging-pan');}
function startMapPan(e){if(e.button!==0)return;if(e.target.closest('.map-node'))return;if(e.target.closest('.map-backboard'))return;if(e.target.closest('.map-zoom-ctrl'))return;const tag=e.target.tagName;if(tag==='line'||tag==='rect'||tag==='text'||tag==='path'||tag==='polygon')return;if(e.target.closest('g[onclick]'))return;if(S.mapMode==='view'&&S.mapSelected){S.mapSelected=null;rc();return;}_mapPan={startX:e.clientX,startY:e.clientY,origX:S.mapPan.x,origY:S.mapPan.y,moved:false};document.addEventListener('mousemove',mapPanMove);document.addEventListener('mouseup',mapPanEnd);}
function mapPanMove(e){if(!_mapPan)return;const dx=e.clientX-_mapPan.startX;const dy=e.clientY-_mapPan.startY;if(!_mapPan.moved&&Math.sqrt(dx*dx+dy*dy)<4)return;_mapPan.moved=true;const canvas=document.getElementById('map-canvas');if(canvas&&!canvas.classList.contains('dragging-pan'))canvas.classList.add('dragging-pan');S.mapPan={x:_mapPan.origX+dx,y:_mapPan.origY+dy};const layer=document.getElementById('map-nodes-layer');const svg=document.getElementById('map-conn-group');const t='translate('+S.mapPan.x+'px,'+S.mapPan.y+'px) scale('+S.mapZoom+')';if(layer)layer.style.transform=t;if(svg)svg.style.transform=t;}
function mapPanEnd(){mapPanCleanup();}
function openConnLabelModal(connId,fromId,toId,isNew){window._clConn=connId;const fromName=getMapNodeName(fromId);const toName=getMapNodeName(toId);renderConnLabelModal(fromName,toName,isNew,S.mapLayer==='departments');}
function renderConnLabelModal(fromName,toName,isNew,isDept){
  const ld=layerData();const conn=ld.connections.find(c=>c.id===window._clConn);if(!conn){closeMod();return;}
  const isRel=S.mapLayer==='relations';
  const curLabel=conn.label;const allLabels=isDept?[{label:'shares with',style:'solid',dash:'0'},{label:'reports to',style:'dashed',dash:'5 3'},{label:'coordinates',style:'dotted',dash:'2 4'},...S.mapCustomLabels]:isRel?[...DEFAULT_RELATIONS_LABELS,...S.mapCustomLabels]:[...DEFAULT_CONN_LABELS,...S.mapCustomLabels];
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:400px;"><h3>'+(isNew?'New ':'Edit ')+(isDept?'info flow':'connection')+'</h3><p><b>'+fromName+'</b> '+(conn.directed?'→':'—')+' <b>'+toName+'</b></p>'
    +(isDept?'<div class="mf"><label>Direction</label><div class="ann-compose-scope" style="margin-bottom:0;"><button class="ann-scope-btn'+(conn.directed?' on':'')+'" onclick="setConnDir(true)">→ One-way ('+fromName+' shares)</button><button class="ann-scope-btn'+(!conn.directed?' on':'')+'" onclick="setConnDir(false)">↔ Mutual</button></div></div>':'')
    +'<div class="mf"><label>'+(isDept?'Flow type':'Connection type')+'</label><div class="cl-options">'+allLabels.map(l=>'<div class="cl-option'+(curLabel===l.label?' on':'')+'" onclick="pickConnLabel(\''+l.label.replace(/'/g,"\\'")+"', "+isDept+')">'
    +'<svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="var(--ink-m)" stroke-width="1.8" stroke-dasharray="'+l.dash+'"/></svg>'
    +'<span class="cl-lbl">'+l.label+'</span></div>').join('')+'</div>'
    +'<div class="cl-custom-add"><input id="clCustom" placeholder="Custom label..." onkeydown="if(event.key===\'Enter\'){addCustomLabel('+isDept+');}"><button class="mbtn-s" onclick="addCustomLabel('+isDept+')">+ Add</button></div></div>'
    +'<div class="mbtns">'+(isNew?'<button class="mbtn-s" onclick="cancelNewConn();closeMod()">Cancel</button>':'<button class="mbtn-s" style="color:var(--warm)" onclick="deleteConn(\''+window._clConn+'\')">Remove</button>')+'<button class="mbtn-p" onclick="closeMod()">Done</button></div></div></div>';
}
function setConnDir(directed){const ld=layerData();const c=ld.connections.find(cc=>cc.id===window._clConn);if(!c)return;mapPushUndo();c.directed=directed;const isDept=S.mapLayer==='departments';renderConnLabelModal(getMapNodeName(c.from),getMapNodeName(c.to),false,isDept);}
function pickConnLabel(label,isDept){const ld=layerData();mapPushUndo();const c=ld.connections.find(cc=>cc.id===window._clConn);if(c)c.label=label;renderConnLabelModal(getMapNodeName(c.from),getMapNodeName(c.to),false,isDept);}
function addCustomLabel(isDept){const inp=document.getElementById('clCustom');const val=(inp?.value||'').trim();if(!val)return;if(![...DEFAULT_CONN_LABELS,...DEFAULT_RELATIONS_LABELS,...S.mapCustomLabels].some(l=>l.label===val)){mapPushUndo();S.mapCustomLabels.push({label:val,style:'solid',dash:'0'});}const ld=layerData();const c=ld.connections.find(cc=>cc.id===window._clConn);if(c){mapPushUndo();c.label=val;}renderConnLabelModal(getMapNodeName(c?.from),getMapNodeName(c?.to),false,isDept);}
function cancelNewConn(){const ld=layerData();ld.connections=ld.connections.filter(c=>c.id!==window._clConn);rc();}
async function deleteConn(id){const ld=layerData();const conn=ld.connections.find(c=>c.id===id);if(!conn)return;const fromName=getMapNodeName(conn.from);const toName=getMapNodeName(conn.to);if(!await confirmDialog('Remove connection between '+fromName+' and '+toName+'?','Remove connection'))return;mapPushUndo();ld.connections=ld.connections.filter(c=>c.id!==id);S.mapSelected=null;closeMod();rc();toast('Removed');}


/* ── CALENDAR ── */
const EVENT_TYPES=[{id:'appointment',label:'Appointment',cls:'etype-appointment',hex:'#1A4A73'},{id:'therapy',label:'Therapy',cls:'etype-therapy',hex:'#185FA5'},{id:'birthday',label:'Birthday',cls:'etype-birthday',hex:'#A32D2D'},{id:'meeting',label:'Meeting',cls:'etype-meeting',hex:'#534AB7'},{id:'reminder',label:'Reminder',cls:'etype-reminder',hex:'#854F0B'},{id:'fronting',label:'Fronting',cls:'etype-fronting',hex:'#5C7A6E'},{id:'inner',label:'Inner-world',cls:'etype-inner',hex:'#3B6D11'},{id:'other',label:'Other',cls:'etype-other',hex:'#5F5E5A'}];
const EVENT_COLOURS=['#1A4A73','#185FA5','#534AB7','#7B3FA8','#A32D2D','#C05050','#D47B2A','#854F0B','#3B6D11','#5C7A6E','#2E7D5E','#1A6E5A','#5F5E5A','#8C6E5A','#6B4F7A','#3D3D3D'];
const CAL_LAYERS=[
  {id:'scheduled',label:'Scheduled',icon:'📅',color:'#1A4A73',desc:'Fixed appointments & dates'},
  {id:'plans',label:'Plans',icon:'💡',color:'#3B6D11',desc:'Ideas & tentative planning'},
  {id:'journal',label:'Journal',icon:'📓',color:'#854F0B',desc:'What actually happened'}
];
function evColor(ev){return ev.color||et2(ev.type).hex;}
function calLayerMeta(ev){return CAL_LAYERS.find(l=>l.id===(ev.layer||'scheduled'))||CAL_LAYERS[0];}
function evLayerStyle(ev){const l=ev.layer||'scheduled';const c=evColor(ev);if(l==='plans')return'background:'+c+'18;border:1.5px dashed '+c+';color:'+c+';';if(l==='journal')return'background:'+c+'cc;font-style:italic;';return'background:'+c+';';}
function evLayerTitle(ev){const l=ev.layer||'scheduled';if(l==='plans')return'◌ '+ev.title;if(l==='journal')return'✓ '+ev.title;return ev.title;}
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAY_SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function gev(id){return S.events.find(e=>e.id===id);}
function et2(type){return EVENT_TYPES.find(t=>t.id===type)||EVENT_TYPES[EVENT_TYPES.length-1];}
function ymd(y,m,d){return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function todayStr(){return new Date().toISOString().slice(0,10);}
function allEventsForView(){
  const events=[...S.events.filter(canSeeEvent)];
  const year=S.calYear;
  S.entities.forEach(ent=>{const bd=ent.fields.birthday?.value||'';const m=bd.match(/(\d{1,2})\s+(\w+)/)||bd.match(/(\w+)\s+(\d{1,2})/);if(m){const num=m[1].match(/^\d+$/)?parseInt(m[1]):parseInt(m[2]);const name=m[1].match(/^\d+$/)?m[2]:m[1];const mi=MONTH_NAMES.findIndex(mn=>mn.toLowerCase().startsWith(name.toLowerCase().slice(0,3)));if(mi>=0&&num>=1&&num<=31){const exists=events.some(e=>e.type==='birthday'&&(e.relations||[]).includes(ent.id)&&e.date.startsWith(String(year)));if(!exists)events.push({id:'auto-bd-'+ent.id+'-'+year,title:ent.name+"'s birthday",type:'birthday',date:ymd(year,mi,num),startTime:'',endTime:'',description:'Auto-pulled from Relations.',location:'',attendees:[],relations:[ent.id],visibility:'system',createdBy:'system',auto:true});}}});
  return events.filter(e=>S.calFilterTypes.includes(e.type)&&S.calLayers.includes(e.layer||'scheduled'));
}
function canSeeEvent(e){if(e.visibility==='system')return true;if(e.createdBy===S.activeId)return true;return(e.attendees||[]).includes(S.activeId);}
function eventsOnDate(dateStr){return allEventsForView().filter(e=>e.date===dateStr).sort((a,b)=>(a.startTime||'00:00').localeCompare(b.startTime||'00:00'));}
function buildCalendar(){
  const v=S.calView;let label='';
  if(v==='month')label=MONTH_NAMES[S.calMonth]+' '+S.calYear;
  else if(v==='week'){const wk=weekStart(S.calSelDate);const we=new Date(wk);we.setDate(we.getDate()+6);label=wk.getDate()+' '+MONTH_NAMES[wk.getMonth()].slice(0,3)+' – '+we.getDate()+' '+MONTH_NAMES[we.getMonth()].slice(0,3)+' '+we.getFullYear();}
  else{const dd=new Date(S.calSelDate);label=WEEKDAY_SHORT[dd.getDay()]+', '+dd.getDate()+' '+MONTH_NAMES[dd.getMonth()]+' '+dd.getFullYear();}
  return '<div class="cal-page">'
    +'<div class="cal-controls"><span class="cal-title">Calendar</span>'
    +'<div class="cal-nav"><button class="nav-arr" onclick="calPrev()">←</button><span class="cal-label">'+label+'</span><button class="nav-arr" onclick="calNext()">→</button><button class="cal-today-btn" onclick="calToday()">Today</button></div>'
    +'<div class="cal-view-toggle"><button class="cal-view-btn'+(v==='month'?' on':'')+'" onclick="S.calView=\'month\';rc()">Month</button><button class="cal-view-btn'+(v==='week'?' on':'')+'" onclick="S.calView=\'week\';rc()">Week</button><button class="cal-view-btn'+(v==='day'?' on':'')+'" onclick="S.calView=\'day\';rc()">Day</button></div>'
    +'<div class="cal-filter-chips">'+EVENT_TYPES.map(t=>'<button class="fchip-btn'+(S.calFilterTypes.includes(t.id)?' on':'')+'" onclick="toggleCalFilter(\''+t.id+'\')" style="'+(S.calFilterTypes.includes(t.id)?'background:'+t.hex+'22;color:'+t.hex+';border-color:'+t.hex+'66;':'')+'">' +t.label+'</button>').join('')+'</div>'
    +'<div class="cal-layer-chips"><span class="cal-layer-label">Layers:</span>'+CAL_LAYERS.map(l=>'<button class="fchip-btn'+(S.calLayers.includes(l.id)?' on':'')+'" onclick="toggleCalLayer(\''+l.id+'\')" style="'+(S.calLayers.includes(l.id)?'background:'+l.color+'22;color:'+l.color+';border-color:'+l.color+'66;':'')+'" title="'+l.desc+'">'+l.icon+' '+l.label+'</button>').join('')+'</div>'
    +'<button class="tbtn" style="margin-left:auto;" onclick="openNewEventModal()">+ New event</button></div>'
    +'<div class="cal-body">'+(v==='month'?buildMonthView():v==='week'?buildWeekView():buildDayView())+'</div></div>';
}
function toggleCalFilter(t){const i=S.calFilterTypes.indexOf(t);if(i>-1)S.calFilterTypes.splice(i,1);else S.calFilterTypes.push(t);rc();}
function toggleCalLayer(l){const i=S.calLayers.indexOf(l);if(i>-1)S.calLayers.splice(i,1);else S.calLayers.push(l);rc();}
function setEvLayer(l){window._evLayer=l;document.querySelectorAll('#mods .ev-layer-btn').forEach(b=>{b.classList.toggle('on',b.dataset.layer===l);});}
function calPrev(){if(S.calView==='month'){if(S.calMonth===0){S.calMonth=11;S.calYear--;}else S.calMonth--;}else if(S.calView==='week'){const d=new Date(S.calSelDate);d.setDate(d.getDate()-7);S.calSelDate=d.toISOString().slice(0,10);S.calYear=d.getFullYear();S.calMonth=d.getMonth();}else{const d=new Date(S.calSelDate);d.setDate(d.getDate()-1);S.calSelDate=d.toISOString().slice(0,10);S.calYear=d.getFullYear();S.calMonth=d.getMonth();}rc();}
function calNext(){if(S.calView==='month'){if(S.calMonth===11){S.calMonth=0;S.calYear++;}else S.calMonth++;}else if(S.calView==='week'){const d=new Date(S.calSelDate);d.setDate(d.getDate()+7);S.calSelDate=d.toISOString().slice(0,10);S.calYear=d.getFullYear();S.calMonth=d.getMonth();}else{const d=new Date(S.calSelDate);d.setDate(d.getDate()+1);S.calSelDate=d.toISOString().slice(0,10);S.calYear=d.getFullYear();S.calMonth=d.getMonth();}rc();}
function calToday(){const t=new Date();S.calYear=t.getFullYear();S.calMonth=t.getMonth();S.calSelDate=t.toISOString().slice(0,10);rc();}
function buildMonthView(){
  const first=new Date(S.calYear,S.calMonth,1);const startDay=first.getDay();const gridStart=new Date(first);gridStart.setDate(gridStart.getDate()-startDay);const today=todayStr();let cells='';
  for(let i=0;i<42;i++){const d=new Date(gridStart);d.setDate(gridStart.getDate()+i);const ds=d.toISOString().slice(0,10);const otherMo=d.getMonth()!==S.calMonth;const isToday=ds===today;const evs=eventsOnDate(ds);const shown=evs.slice(0,3);const more=evs.length-3;cells+='<div class="mo-cell'+(otherMo?' other-mo':'')+(isToday?' today':'')+'" onclick="openNewEventOnDate(\''+ds+'\',true)"><div class="mo-cell-num">'+d.getDate()+'</div>'+shown.map(ev=>'<div class="mo-ev" style="'+evLayerStyle(ev)+'" onclick="event.stopPropagation();openEventDetail(\''+ev.id+'\')">'+evLayerTitle(ev)+'</div>').join('')+(more>0?'<div class="mo-ev-more">+'+more+' more</div>':'')+'</div>';}
  return '<div class="mo-weekdays">'+WEEKDAY_SHORT.map(w=>'<div class="mo-wd">'+w+'</div>').join('')+'</div><div class="mo-grid">'+cells+'</div>';
}
function weekStart(dateStr){const d=new Date(dateStr);d.setDate(d.getDate()-d.getDay());return d;}
function buildWeekView(){
  const ws=weekStart(S.calSelDate);const today=todayStr();const hours=Array.from({length:24},(_,i)=>i);const days=Array.from({length:7},(_,i)=>{const d=new Date(ws);d.setDate(ws.getDate()+i);return d;});const SB=15;
  let adCells='';
  days.forEach(d=>{const ds=d.toISOString().slice(0,10);const adEvs=eventsOnDate(ds).filter(ev=>!ev.startTime);let cellBg='';if(adEvs.length===1){cellBg='background:'+evColor(adEvs[0])+'20;border-top:2px solid '+evColor(adEvs[0])+';';}else if(adEvs.length>1){const stops=adEvs.map((ev,i)=>evColor(ev)+' '+Math.round(i*100/adEvs.length)+'%, '+evColor(ev)+' '+Math.round((i+1)*100/adEvs.length)+'%').join(', ');cellBg='background:linear-gradient(to bottom,'+stops+');opacity:.5;';}adCells+='<div style="border-right:1px solid var(--brd);padding:2px 3px;min-height:22px;cursor:pointer;'+cellBg+'" onclick="openNewEventOnDate(\''+ds+'\',true)">'+adEvs.map(ev=>'<div class="wk-allday-ev" style="'+evLayerStyle(ev)+'" onclick="event.stopPropagation();openEventDetail(\''+ev.id+'\')">'+evLayerTitle(ev)+'</div>').join('')+'</div>';});
  let cols='';
  days.forEach(d=>{const ds=d.toISOString().slice(0,10);const dayEvs=eventsOnDate(ds).filter(ev=>ev.startTime);const adBg=eventsOnDate(ds).filter(ev=>!ev.startTime);let colBgStyle='';if(adBg.length===1)colBgStyle='background:'+evColor(adBg[0])+'12;';else if(adBg.length>1)colBgStyle='background:var(--sage-l);';const evHtml=dayEvs.map(ev=>{const[sh,sm]=ev.startTime.split(':').map(Number);const[eh,em]=(ev.endTime||(Math.min(sh+1,23)+':'+String(sm).padStart(2,'0'))).split(':').map(Number);const top=(sh+sm/60)*48;const h=Math.max(20,((eh+em/60)-(sh+sm/60))*48);return'<div class="wk-ev" style="'+evLayerStyle(ev)+';top:'+top+'px;height:'+h+'px;" onclick="event.stopPropagation();openEventDetail(\''+ev.id+'\')"><div class="wk-ev-title">'+evLayerTitle(ev)+'</div>'+(h>28?'<div class="wk-ev-time">'+ev.startTime+(ev.endTime?' – '+ev.endTime:'')+'</div>':'')+'</div>';}).join('');cols+='<div class="wk-col" style="'+colBgStyle+'" onclick="openNewEventOnDate(\''+ds+'\',false,event)">'+hours.map(h=>'<div class="wk-hr-slot" onclick="event.stopPropagation();openNewEventOnDate(\''+ds+'\',false,event,'+h+')"></div>').join('')+evHtml+'</div>';});
  return '<div style="display:flex;border-bottom:1px solid var(--brd);background:var(--white);"><div style="width:50px;flex-shrink:0;border-right:1px solid var(--brd);"></div><div style="flex:1;display:grid;grid-template-columns:repeat(7,1fr);padding-right:'+SB+'px;">'+days.map(d=>{const ds=d.toISOString().slice(0,10);const isT=ds===today;return'<div class="wk-dayhdr'+(isT?' today':'')+'" onclick="S.calSelDate=\''+ds+'\';S.calView=\'day\';rc()"><div class="wk-dayname">'+WEEKDAY_SHORT[d.getDay()]+'</div><div class="wk-daynum">'+d.getDate()+'</div></div>';}).join('')+'</div></div>'
    +'<div style="display:flex;border-bottom:1px solid var(--brd);"><div style="width:50px;flex-shrink:0;border-right:1px solid var(--brd);background:var(--paper);font-size:9px;color:var(--ink-s);padding:3px;text-align:center;display:flex;align-items:center;justify-content:center;min-height:22px;">ALL<br>DAY</div><div style="flex:1;display:grid;grid-template-columns:repeat(7,1fr);padding-right:'+SB+'px;">'+adCells+'</div></div>'
    +'<div class="wk-scroll-body"><div class="wk-hrcol">'+hours.map(h=>'<div class="wk-hr-label">'+(h===0?'12 am':h<12?h+' am':h===12?'12 pm':(h-12)+' pm')+'</div>').join('')+'</div>'+cols+'</div>';
}
function buildDayView(){
  const ds=S.calSelDate;const evs=eventsOnDate(ds).filter(ev=>ev.startTime);const allDay=eventsOnDate(ds).filter(ev=>!ev.startTime);const hours=Array.from({length:24},(_,i)=>i);
  const adHtml=allDay.length?'<div style="padding:10px 14px;border-bottom:1px solid var(--brd);background:var(--paper);cursor:pointer;" onclick="openNewEventOnDate(\''+ds+'\',true)"><div style="font-size:10px;color:var(--ink-s);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">All day</div><div style="display:flex;flex-wrap:wrap;gap:5px;">'+allDay.map(ev=>'<span style="padding:3px 9px;border-radius:4px;'+evLayerStyle(ev)+';font-size:12px;font-weight:500;cursor:pointer;" onclick="event.stopPropagation();openEventDetail(\''+ev.id+'\')">'+evLayerTitle(ev)+'</span>').join('')+'</div></div>':'';
  const evHtml=evs.map(ev=>{const[sh,sm]=ev.startTime.split(':').map(Number);const[eh,em]=(ev.endTime||(Math.min(sh+1,23)+':'+String(sm).padStart(2,'0'))).split(':').map(Number);const top=(sh+sm/60)*60;const h=Math.max(30,((eh+em/60)-(sh+sm/60))*60);return'<div class="day-ev" style="'+evLayerStyle(ev)+';top:'+top+'px;height:'+h+'px;" onclick="openEventDetail(\''+ev.id+'\')"><div class="day-ev-title">'+evLayerTitle(ev)+'</div><div class="day-ev-meta">'+ev.startTime+(ev.endTime?' – '+ev.endTime:'')+(ev.location?' · '+ev.location:'')+'</div></div>';}).join('');
  return adHtml+'<div class="day-grid"><div class="day-hrcol">'+hours.map(h=>'<div class="day-hr-label">'+(h===0?'12 am':h<12?h+' am':h===12?'12 pm':(h-12)+' pm')+'</div>').join('')+'</div><div class="day-col">'+hours.map(h=>'<div class="day-hr-slot" onclick="openNewEventOnDate(\''+ds+'\',false,event,'+h+')"></div>').join('')+evHtml+'</div></div>';
}
function openNewEventOnDate(ds,allDay,e,hour){openEventModal(null,ds,allDay===true,hour!=null?hour:null);}
function openEventDetail(eid){
  const ev=gev(eid)||allEventsForView().find(e=>e.id===eid);if(!ev)return;
  const t=et2(ev.type);const creator=ga(ev.createdBy);const dateD=new Date(ev.date+'T00:00');
  const dateStr=WEEKDAY_SHORT[dateD.getDay()]+', '+dateD.getDate()+' '+MONTH_NAMES[dateD.getMonth()]+' '+dateD.getFullYear();
  const lm=calLayerMeta(ev);
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:440px;">'
    +'<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;"><div style="width:5px;min-height:40px;border-radius:3px;background:'+t.hex+';flex-shrink:0;"></div><div style="flex:1;"><h3 style="margin-bottom:5px;">'+ev.title+'</h3><div style="display:flex;gap:5px;flex-wrap:wrap;"><span class="ev-type-badge" style="background:'+t.hex+'22;color:'+t.hex+'">'+t.label+'</span><span class="ev-type-badge" style="background:'+lm.color+'22;color:'+lm.color+';">'+lm.icon+' '+lm.label+'</span></div></div></div>'
    +'<div class="ev-detail-body"><div class="ev-row"><div class="ev-row-ico">📅</div><div class="ev-row-val">'+dateStr+(ev.startTime?' · '+ev.startTime+(ev.endTime?' – '+ev.endTime:''):' · All day')+'</div></div>'
    +(ev.location?'<div class="ev-row"><div class="ev-row-ico">📍</div><div class="ev-row-val">'+ev.location+'</div></div>':'')
    +(ev.description?'<div class="ev-row"><div class="ev-row-ico">📝</div><div class="ev-row-val">'+ev.description+'</div></div>':'')
    +'<div class="ev-row"><div class="ev-row-ico">'+(ev.visibility==='system'?'🌐':'🔒')+'</div><div class="ev-row-val">'+(ev.visibility==='system'?'Visible to all alters':'Personal event')+(ev.auto?' · auto-pulled from Relations':creator?' · created by '+creator.name:'')+'</div></div></div>'
    +'<div class="ev-actions"><button class="ev-action-btn" onclick="shareEventToChat(\''+ev.id+'\')">✉ Share in chat</button>'
    +(!ev.auto?'<button class="ev-action-btn" onclick="openEditEventModal(\''+ev.id+'\')">✎ Edit</button>':'')
    +(!ev.auto&&ev.createdBy===S.activeId?'<button class="ev-action-btn" style="color:var(--warm);" onclick="deleteEvent(\''+ev.id+'\')">🗑 Delete</button>':'')
    +'<button class="ev-action-btn" style="margin-left:auto;" onclick="closeMod()">Close</button></div></div></div>';
}
function openEditEventModal(eid){openEventModal(eid);}
function openNewEventModal(presetDate){openEventModal(null,presetDate||S.calSelDate||todayStr(),false,null);}
function openEventModal(eid,presetDate,presetAllDay,presetHour){
  const existing=eid?gev(eid):null;
  window._evEid=eid;window._evAttendees=existing?[...(existing.attendees||[])]:[S.activeId];window._evRelations=existing?[...(existing.relations||[])]:[];
  window._evShareTab=0;window._evShareQ='';window._evAllDay=existing?(!existing.startTime&&!existing.endTime):presetAllDay===true;
  window._evPresetHour=presetHour;window._evColor=existing?.color||'';window._evLayer=existing?.layer||'scheduled';window._evBuf={};
  renderEventModal(presetDate);
}
function renderEventModal(presetDate){
  const eid=window._evEid;const existing=eid?gev(eid):null;
  const defaultDate=existing?existing.date:(presetDate||S.calSelDate||todayStr());
  const isAllDay=window._evAllDay;const ph=window._evPresetHour;const buf=window._evBuf||{};
  const defStart=buf.start!=null?buf.start:(existing?existing.startTime:(ph!=null?String(ph).padStart(2,'0')+':00':''));
  const defEnd=buf.end!=null?buf.end:(existing?existing.endTime:(ph!=null?String(Math.min(ph+1,23)).padStart(2,'0')+':00':''));
  const defTitle=buf.title!=null?buf.title:(existing?existing.title:'');
  const defDate=buf.date!=null?buf.date:defaultDate;
  const defLoc=buf.loc!=null?buf.loc:(existing?existing.location||'':'');
  const defDesc=buf.desc!=null?buf.desc:(existing?existing.description||'':'');
  const selColor=window._evColor||'';const defType=buf.type!=null?buf.type:(existing?existing.type:'appointment');const defVis=buf.vis!=null?buf.vis:(existing?existing.visibility:'system');
  const tabs=['Alters','Relations'];const q=(window._evShareQ||'').toLowerCase();const tab=window._evShareTab||0;
  let items=tab===0?sortedAlters(S.alters).filter(a=>!q||a.name.toLowerCase().includes(q)):S.entities.filter(e=>!q||e.name.toLowerCase().includes(q));
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:460px;">'
    +'<h3>'+(existing?'Edit event':'New event')+'</h3>'
    +'<div class="mf"><label>Title</label><input id="evTitle" placeholder="Event title..." value="'+defTitle.replace(/"/g,'&quot;')+'" oninput="(window._evBuf=window._evBuf||{}).title=this.value"></div>'
    +'<div class="mf"><label>Date</label><input type="date" id="evDate" value="'+defDate+'" oninput="(window._evBuf=window._evBuf||{}).date=this.value" onclick="this.showPicker&&this.showPicker()" style="cursor:pointer;padding:7px 10px;border:1px solid var(--brd-s);border-radius:var(--rsm);font-size:14px;font-family:var(--font-sans);background:var(--white);color:var(--ink);outline:none;width:100%;"></div>'
    +'<div class="mf" style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;"><label style="flex-shrink:0;min-width:32px;font-size:13px;">Time</label>'
    +'<input type="time" id="evStart" value="'+defStart+'" style="flex:1;min-width:0;padding:7px 8px;border:1px solid var(--brd-s);border-radius:var(--rsm);font-size:14px;font-family:var(--font-sans);background:var(--white);color:'+(isAllDay?'var(--ink-s)':'var(--ink)')+';outline:none;" '+(isAllDay?'disabled':'')+' oninput="(window._evBuf=window._evBuf||{}).start=this.value">'
    +'<span style="color:var(--ink-s);flex-shrink:0;">–</span>'
    +'<input type="time" id="evEnd" value="'+defEnd+'" style="flex:1;min-width:0;padding:7px 8px;border:1px solid var(--brd-s);border-radius:var(--rsm);font-size:14px;font-family:var(--font-sans);background:var(--white);color:'+(isAllDay?'var(--ink-s)':'var(--ink)')+';outline:none;" '+(isAllDay?'disabled':'')+' oninput="(window._evBuf=window._evBuf||{}).end=this.value">'
    +'<button type="button" class="mbtn-s" style="padding:5px 10px;font-size:11px;white-space:nowrap;flex-shrink:0;'+(isAllDay?'background:var(--sage);color:white;border-color:var(--sage);':'')+'" onclick="evToggleAllDay()">All day</button></div>'
    +'<div class="mf"><label>Type</label><select id="evType" oninput="(window._evBuf=window._evBuf||{}).type=this.value">'+EVENT_TYPES.map(t=>'<option value="'+t.id+'"'+(defType===t.id?' selected':'')+'>'+t.label+'</option>').join('')+'</select></div>'
    +'<div class="mf"><label>Colour <span style="font-size:10px;color:var(--ink-s);font-weight:400;">override type colour</span></label>'
    +'<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;"><div style="width:22px;height:22px;border-radius:4px;border:2px solid '+(!selColor?'var(--sage)':'var(--brd-s)')+';background:var(--paper);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;" title="Use type colour" onclick="evPickColor(\'\')">x</div>'
    +EVENT_COLOURS.map(h=>'<div style="width:22px;height:22px;border-radius:4px;background:'+h+';cursor:pointer;border:2px solid '+(selColor===h?'white':'transparent')+';box-shadow:'+(selColor===h?'0 0 0 2px '+h:'none')+';" onclick="evPickColor(\''+h+'\')"></div>').join('')+'</div></div>'
    +'<div class="mf"><label>Location</label><input id="evLoc" placeholder="Optional..." value="'+defLoc.replace(/"/g,'&quot;')+'" oninput="(window._evBuf=window._evBuf||{}).loc=this.value"></div>'
    +'<div class="mf"><label>Notes</label><textarea id="evDesc" style="min-height:50px;resize:vertical;" oninput="(window._evBuf=window._evBuf||{}).desc=this.value">'+defDesc+'</textarea></div>'
    +'<div class="mf"><label>Visibility</label><select id="evVis" oninput="(window._evBuf=window._evBuf||{}).vis=this.value"><option value="system"'+(defVis==='system'?' selected':'')+'>System-wide</option><option value="personal"'+(defVis==='personal'?' selected':'')+'>Personal only</option></select></div>'
    +'<div class="mf"><label>Layer</label><div class="ann-compose-scope" style="margin-bottom:0;">'+CAL_LAYERS.map(l=>'<button class="ann-scope-btn ev-layer-btn'+(window._evLayer===l.id?' on':'')+'" data-layer="'+l.id+'" onclick="setEvLayer(\''+l.id+'\')">'+l.icon+' '+l.label+'</button>').join('')+'</div></div>'
    +'<div class="mf"><label>Who</label><div class="share-tabs">'+tabs.map((tl,i)=>'<div class="stab'+(tab===i?' act':'')+'" onclick="window._evShareTab='+i+';renderEventModal(\''+(presetDate||'')+'\')">'+tl+'</div>').join('')+'</div>'
    +'<div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search..." value="'+(window._evShareQ||'')+'" oninput="window._evShareQ=this.value;renderEventModal(\''+(presetDate||'')+'\')"></div>'
    +'<div class="share-pick-list" style="max-height:130px;">'+items.map(item=>{const isRel=tab===1;const picked=isRel?window._evRelations.includes(item.id):window._evAttendees.includes(item.id);return'<div class="spi'+(picked?' on':'')+'" onclick="toggleEvParticipant(\''+(isRel?'rel':'alt')+'\',\''+item.id+'\',\''+(presetDate||'')+'\')"><div class="spi-av" style="background:'+abg(item.color)+';color:'+item.color+'">'+ini(item.name)+'</div><div style="flex:1"><span class="spi-name">'+item.name+'</span><span class="spi-sub"> · '+(isRel?(item.type||''):item.role)+'</span></div></div>';}).join('')+'</div>'
    +'<div class="share-selected-pills">'+window._evAttendees.map(id=>{const a=ga(id);return a?'<span class="spill">'+a.name+'<span class="spill-x" onclick="toggleEvParticipant(\'alt\',\''+id+'\',\''+(presetDate||'')+'\')"> ×</span></span>':''}).join('')+'</div></div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doSaveEvent()">'+(existing?'Save':'Create')+'</button></div></div></div>';
}
function toggleEvParticipant(type,id,presetDate){if(type==='rel'){const i=window._evRelations.indexOf(id);if(i>-1)window._evRelations.splice(i,1);else window._evRelations.push(id);}else{const i=window._evAttendees.indexOf(id);if(i>-1)window._evAttendees.splice(i,1);else window._evAttendees.push(id);}renderEventModal(presetDate);}
function evPickColor(h){window._evColor=h;document.querySelectorAll('#mods [onclick^="evPickColor"]').forEach(el=>{const m=el.getAttribute('onclick').match(/evPickColor\('([^']*)'\)/);const elH=m?m[1]:'';if(!elH){el.style.border='2px solid '+(h?'var(--brd-s)':'var(--sage)');}else{el.style.border='2px solid '+(elH===h?'white':'transparent');el.style.boxShadow=elH===h?'0 0 0 2px '+elH:'none';}});}
function evToggleAllDay(){window._evAllDay=!window._evAllDay;const s=document.getElementById('evStart');const e=document.getElementById('evEnd');const btn=document.querySelector('#mods button[onclick="evToggleAllDay()"]');if(!s||!e)return;if(window._evAllDay){window._evBuf=window._evBuf||{};window._evBuf._savedStart=s.value;window._evBuf._savedEnd=e.value;s.value='';e.value='';s.disabled=true;e.disabled=true;s.style.opacity='.4';e.style.opacity='.4';if(btn){btn.style.background='var(--sage)';btn.style.color='white';btn.style.borderColor='var(--sage)';}}else{s.value=window._evBuf?._savedStart||'';e.value=window._evBuf?._savedEnd||'';s.disabled=false;e.disabled=false;s.style.opacity='1';e.style.opacity='1';if(btn){btn.style.background='';btn.style.color='';btn.style.borderColor='';}}}
function doSaveEvent(){
  const title=((document.getElementById('evTitle')?.value)||(window._evBuf?.title)||'').trim();if(!title){toast('Event needs a title');return;}
  const isAllDay=window._evAllDay;
  const data={title,type:document.getElementById('evType')?.value||'appointment',layer:window._evLayer||'scheduled',date:document.getElementById('evDate')?.value||todayStr(),startTime:isAllDay?'':(document.getElementById('evStart')?.value||''),endTime:isAllDay?'':(document.getElementById('evEnd')?.value||''),color:window._evColor||'',location:(document.getElementById('evLoc')?.value||'').trim(),description:(document.getElementById('evDesc')?.value||'').trim(),visibility:document.getElementById('evVis')?.value||'system',attendees:[...window._evAttendees],relations:[...(window._evRelations||[])]};
  window._evBuf={};
  if(window._evEid){const i=S.events.findIndex(e=>e.id===window._evEid);if(i>=0)S.events[i]={...S.events[i],...data};toast('Event updated');}
  else{S.events.push({id:'ev-'+Date.now(),...data,createdBy:S.activeId});toast('Event created');}
  closeMod();saveState();rc();
}
async function deleteEvent(eid){const ev=gev(eid);if(!ev)return;if(!await confirmDialog('Delete "'+ev.title+'"?','Delete event'))return;S.events=S.events.filter(e=>e.id!==eid);S.projects.forEach(p=>{if(p.linkedEvents)p.linkedEvents=p.linkedEvents.filter(x=>x!==eid);});closeMod();rc();toast('Event deleted');}
function shareEventToChat(eid){const ev=gev(eid)||allEventsForView().find(e=>e.id===eid);if(!ev)return;const t=et2(ev.type);const myConvs=S.conversations.filter(c=>c.participants.includes(S.activeId));document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Share event in chat</h3><p>Choose a conversation to post <b>'+ev.title+'</b> to.</p><div class="share-pick-list" style="max-height:240px;">'+myConvs.map(c=>{const nm=c.type==='group'?c.name:(()=>{const o=c.participants.find(p=>p!==S.activeId);return ga(o)?.name||'?';})();return'<div class="spi" onclick="doShareEventToConv(\''+c.id+'\',\''+eid+'\')"><div class="spi-av'+(c.type==='group'?' sq':'')+'" style="background:'+abg(t.hex)+';color:'+t.hex+'">'+ini(nm)+'</div><div style="flex:1"><span class="spi-name">'+nm+'</span></div></div>';}).join('')+'</div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button></div></div></div>';}
function doShareEventToConv(cid,eid){const ev=gev(eid)||allEventsForView().find(e=>e.id===eid);const conv=gc(cid);if(!ev||!conv)return;const t=et2(ev.type);const dateD=new Date(ev.date+'T00:00');const dateStr=WEEKDAY_SHORT[dateD.getDay()]+', '+dateD.getDate()+' '+MONTH_NAMES[dateD.getMonth()];const timeStr=ev.startTime?ev.startTime+(ev.endTime?' – '+ev.endTime:''):'All day';const html='<div style="border-left:3px solid '+t.hex+';padding:2px 0 2px 9px;margin:2px 0;"><div style="font-weight:500;">📅 '+ev.title+'</div><div style="font-size:11px;opacity:.85;">'+dateStr+' · '+timeStr+(ev.location?' · '+ev.location:'')+'</div></div>';conv.messages.push({id:'m'+Date.now(),from:S.activeId,html,attachments:[{type:'event',id:ev.id,title:ev.title}],ts:new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})});S.activeConvId=cid;S.commTab=conv.type;closeMod();S.nav='communication';render();toast('Shared');}


/* ── RELATIONS ── */
const ENTITY_TYPES=[{id:'person',label:'Person',bg:'#EAF0EE',color:'#5C7A6E'},{id:'pet',label:'Pet',bg:'#EAF3DE',color:'#3B6D11'},{id:'online',label:'Online friend',bg:'#E6F1FB',color:'#185FA5'},{id:'fictional',label:'Fictional',bg:'#EEEDFE',color:'#534AB7'},{id:'place',label:'Place',bg:'#FAEEDA',color:'#854F0B'},{id:'organisation',label:'Organisation',bg:'#FAECE7',color:'#993C1D'},{id:'other',label:'Other',bg:'#F1EFE8',color:'#5F5E5A'}];
const RCOLS=[{h:'#7B9E8F'},{h:'#B07A6B'},{h:'#7A8FA8'},{h:'#9B8DB0'},{h:'#B09A70'},{h:'#8CA87A'},{h:'#A87A8C'},{h:'#6A8C99'},{h:'#C4855A'},{h:'#888780'}];
function ge(id){return S.entities.find(e=>e.id===id);}
function et(type){return ENTITY_TYPES.find(t=>t.id===type)||ENTITY_TYPES[ENTITY_TYPES.length-1];}
function buildRelations(){
  const q=S.relSearch.toLowerCase();
  const filtered=S.entities.filter(e=>{if(S.relFilterType!=='all'&&e.type!==S.relFilterType)return false;if(q&&!e.name.toLowerCase().includes(q))return false;return true;}).sort((a,b)=>a.name.localeCompare(b.name));
  const openEnt=S.relOpenEntityId?ge(S.relOpenEntityId):null;
  return '<div class="rel-page"><div class="rel-controls"><span class="rel-title">Relations</span><span class="rel-count">'+S.entities.length+' known</span>'
    +'<div class="rel-search-wrap"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input class="rel-search" placeholder="Search..." value="'+S.relSearch+'" oninput="S.relSearch=this.value;rc()"></div>'
    +'<div class="filter-chips"><button class="fchip-btn'+(S.relFilterType==='all'?' on':'')+'" onclick="S.relFilterType=\'all\';rc()">All</button>'+ENTITY_TYPES.map(t=>'<button class="fchip-btn'+(S.relFilterType===t.id?' on':'')+'" onclick="S.relFilterType=\''+t.id+'\';rc()">'+t.label+'</button>').join('')+'</div>'
    +'<button class="tbtn" style="margin-left:auto;" onclick="openAddEntityModal()">+ Add entry</button></div>'
    +'<div class="rel-gallery">'+filtered.map(e=>{const typ=et(e.type);const isOpen=S.relOpenEntityId===e.id;return'<div class="rel-card'+(isOpen?' open':'')+'" style="'+(isOpen?'border-color:'+e.color+';':'')+'" onclick="toggleRelEntity(\''+e.id+'\')">'
    +'<div class="rel-card-band" style="background:'+e.color+'"></div><div class="rel-card-portrait"><div class="rel-portrait-circle" style="background:'+abg(e.color)+';color:'+e.color+'">'+ini(e.name)+'</div></div>'
    +'<div class="rel-card-info"><div class="rel-card-name">'+e.name+'</div><div class="rel-card-sub">'+(e.fields.relationship?.value||'—')+'</div><div class="rel-card-type" style="background:'+typ.bg+';color:'+typ.color+'">'+typ.label+'</div></div></div>';}).join('')
    +'<div class="rel-add-card" onclick="openAddEntityModal()"><div style="width:30px;height:30px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:18px;">+</div><span>Add entry</span></div></div>'
    +'<div class="rel-profile-panel'+(openEnt?'':' closed')+'" id="rel-panel">'+(openEnt?buildRelProfilePanel(openEnt):'')+'</div></div>';
}
function buildRelProfilePanel(e){
  const typ=et(e.type);
  const fieldRow=(key,label,ph)=>{const f=e.fields[key]||{value:'',by:'',ts:''};return'<div class="rp-field"><div class="rp-field-label">'+label+'</div><div class="rp-val-wrap"><div class="rp-val" contenteditable="true" data-placeholder="'+ph+'" oninput="updateRelField(\''+e.id+'\',\''+key+'\',this.innerText)" onfocus="markRelFieldBy(\''+e.id+'\',\''+key+'\')" onblur="cleanRelField(this,\''+e.id+'\',\''+key+'\')">'+f.value+'</div></div></div>';};
  return '<div class="rp-header"><div class="rp-portrait" style="background:'+abg(e.color)+';color:'+e.color+'">'+ini(e.name)+'</div><div style="flex:1;"><div class="rp-name">'+e.name+'</div><div style="display:flex;gap:6px;margin-top:5px;"><span class="rp-type-badge" style="background:'+typ.bg+';color:'+typ.color+'">'+typ.label+'</span></div></div>'
    +'<div style="display:flex;gap:5px;"><button class="tbtn" onclick="openEditEntityModal(\''+e.id+'\')">✎ Edit</button><button class="tbtn" style="color:var(--warm);" onclick="deleteEntity(\''+e.id+'\')">🗑</button><button class="rp-close" onclick="S.relOpenEntityId=null;rc()">×</button></div></div>'
    +'<div class="rp-body">'+fieldRow('relationship','Relationship to system','e.g. Close friend, therapist...')+fieldRow('birthday','Birthday / date','e.g. 14 March')+fieldRow('firstMet','First met','e.g. School, 2019')+fieldRow('notes','Notes','Anything the system has observed...')+'</div>'
    +'<div class="rp-custom-fields"><div class="rp-custom-title">Likes &amp; dislikes</div>'
    +'<div style="display:flex;gap:12px;flex-wrap:wrap;"><div><div style="font-size:11px;color:var(--ink-s);margin-bottom:4px;">Likes</div><div class="pb-tags">'+((e.likes||[]).map((t,i)=>'<span class="pb-tag">'+ t.text+'<span class="pb-tag-x" onclick="removeEntityTag(\''+e.id+'\',\'likes\','+i+')">×</span></span>').join(''))+'<button class="rp-tag-add" onclick="openAddTagModal(\''+e.id+'\',\'likes\')">+ Add</button></div></div>'
    +'<div><div style="font-size:11px;color:var(--ink-s);margin-bottom:4px;">Dislikes</div><div class="pb-tags">'+((e.dislikes||[]).map((t,i)=>'<span class="pb-tag" style="background:#FAE8E8;color:#A32D2D;">'+ t.text+'<span class="pb-tag-x" onclick="removeEntityTag(\''+e.id+'\',\'dislikes\','+i+')">×</span></span>').join(''))+'<button class="rp-tag-add" onclick="openAddTagModal(\''+e.id+'\',\'dislikes\')">+ Add</button></div></div></div></div>';
}
function removeEntityTag(eid,key,idx){const e=ge(eid);if(!e)return;e[key].splice(idx,1);rc();}
function toggleRelEntity(id){S.relOpenEntityId=S.relOpenEntityId===id?null:id;rc();if(S.relOpenEntityId){setTimeout(()=>{const p=document.getElementById('rel-panel');if(p)p.scrollIntoView({behavior:'smooth',block:'nearest'});},50);}}
function updateRelField(eid,key,val){const e=ge(eid);if(!e)return;if(!e.fields[key])e.fields[key]={value:'',by:'',ts:''};e.fields[key].value=val;}
function cleanRelField(el,eid,key){if(!el.innerText.trim()){el.innerHTML='';updateRelField(eid,key,'');}}
function markRelFieldBy(eid,key){const e=ge(eid);if(!e)return;if(!e.fields[key])e.fields[key]={value:'',by:'',ts:''};e.fields[key].by=S.activeId;e.fields[key].ts=new Date().toLocaleDateString('en-AU',{day:'numeric',month:'short'});}
function openAddEntityModal(){window._rc=RCOLS[0].h;window._rt=S.relFilterType!=='all'?S.relFilterType:'person';document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Add entry</h3><div class="mf"><label>Name</label><input id="rn" placeholder="Their name..."></div><div class="mf"><label>Type</label><select id="rt" onchange="window._rt=this.value">'+ENTITY_TYPES.map(t=>'<option value="'+t.id+'"'+(t.id===window._rt?' selected':'')+'>'+t.label+'</option>').join('')+'</select></div><div class="mf"><label>Colour</label><div class="color-row">'+RCOLS.map(c=>'<div class="csw'+(c.h===window._rc?' on':'')+'" style="background:'+c.h+'" id="rcsw'+c.h.replace('#','')+'" onclick="setRC(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doAddEntity()">Add entry</button></div></div></div>';}
function setRC(h){window._rc=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const el=document.getElementById('rcsw'+h.replace('#',''));if(el)el.classList.add('on');}
function doAddEntity(){const name=(document.getElementById('rn')?.value||'').trim();if(!name)return;const id='e-'+Date.now();S.entities.push({id,name,type:window._rt||'person',color:window._rc||RCOLS[0].h,fields:{relationship:{value:'',by:'',ts:''},birthday:{value:'',by:'',ts:''},firstMet:{value:'',by:'',ts:''},notes:{value:'',by:'',ts:''}},likes:[],dislikes:[],customFields:[]});S.relOpenEntityId=id;closeMod();rc();toast(name+' added');}
function openEditEntityModal(eid){const e=ge(eid);if(!e)return;window._reEdit=eid;window._rt=e.type;window._rc=e.color;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Edit relation</h3><div class="mf"><label>Name</label><input id="rn" value="'+(e.name||'').replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Type</label><select id="rt" onchange="window._rt=this.value">'+ENTITY_TYPES.map(t=>'<option value="'+t.id+'"'+(t.id===e.type?' selected':'')+'>'+t.label+'</option>').join('')+'</select></div><div class="mf"><label>Colour</label><div class="color-row">'+RCOLS.map(c=>'<div class="csw'+(c.h===window._rc?' on':'')+'" style="background:'+c.h+'" id="rcsw'+c.h.replace('#','')+'" onclick="setRC(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doSaveEntityEdit()">Save</button></div></div></div>';}
function doSaveEntityEdit(){const eid=window._reEdit;const e=ge(eid);if(!e)return;const newName=(document.getElementById('rn')?.value||'').trim();if(!newName){toast('Name cannot be empty');return;}e.name=newName;e.type=window._rt||e.type;e.color=window._rc||e.color;closeMod();rc();toast('Updated');}
async function deleteEntity(eid){const e=ge(eid);if(!e)return;if(!await confirmDialog('Delete "'+e.name+'"? This cannot be undone.','Delete relation'))return;S.entities=S.entities.filter(x=>x.id!==eid);if(S.relOpenEntityId===eid)S.relOpenEntityId=null;rc();toast('Relation deleted');}
function openAddTagModal(eid,key){window._tagEid=eid;window._tagKey=key;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Add '+(key==='likes'?'like':'dislike')+'</h3><div class="mf"><input id="taginp" placeholder="e.g. '+(key==='likes'?'Tea, hiking...':'Loud noises...')+'\"></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doAddTag()">Add</button></div></div></div>';setTimeout(()=>document.getElementById('taginp')?.focus(),50);}
function doAddTag(){const val=(document.getElementById('taginp')?.value||'').trim();if(!val)return;const e=ge(window._tagEid);if(!e)return;e[window._tagKey].push({text:val,by:S.activeId,ts:new Date().toLocaleDateString('en-AU',{day:'numeric',month:'short'})});closeMod();rc();toast('Added');}
/* ── PHONEBOOK ── */
function buildPhonebook(){
  const q=(S.pbSearch||'').toLowerCase().trim();const topic=S.pbSelectedTopic;
  const topicCounts={};S.alters.forEach(a=>(a.expertise||[]).forEach(t=>{topicCounts[t]=(topicCounts[t]||0)+1;}));
  const topics=Object.entries(topicCounts).sort((a,b)=>b[1]-a[1]);
  let filtered=sortedAlters(S.alters.slice());
  if(topic)filtered=filtered.filter(a=>(a.expertise||[]).includes(topic));
  if(q)filtered=filtered.filter(a=>a.name.toLowerCase().includes(q)||a.role.toLowerCase().includes(q)||(a.expertise||[]).some(t=>t.toLowerCase().includes(q)));
  return '<div class="pb-page"><div class="pb-controls"><span class="pb-title">Phonebook</span>'
    +'<div class="pb-search-wrap"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input class="pb-search" placeholder="Search by name, role, or topic..." value="'+(S.pbSearch||'')+'" oninput="S.pbSearch=this.value;rc()"></div>'
    +(topic?'<button class="tbtn" onclick="S.pbSelectedTopic=null;rc()">Clear topic: '+topic+' ×</button>':'')+'</div>'
    +'<div class="pb-body">'+(topics.length?'<div class="pb-section-title">Topics</div><div class="pb-topic-chips">'+topics.map(([t,n])=>'<button class="pb-topic-chip'+(topic===t?' on':'')+'" onclick="S.pbSelectedTopic=S.pbSelectedTopic===\''+t.replace(/'/g,"\\'")+'\'?null:\''+t.replace(/'/g,"\\'")+'\';rc()">'+t+'<span class="pb-topic-count">'+n+'</span></button>').join('')+'</div>':'')
    +'<div class="pb-section-title">Alters'+(topic?' · '+topic:q?' · "'+q+'"':'')+'</div>'
    +(filtered.length===0?'<div class="pb-empty">No alters match your search.</div>'
    :'<div class="pb-grid">'+filtered.map(a=>{const canEdit=a.id===S.activeId;return'<div class="pb-card"><div class="pb-card-head"><div class="pb-card-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div><div style="flex:1;min-width:0;"><div class="pb-card-name">'+a.name+'</div><div class="pb-card-role">'+a.role+(a.pronouns?' · '+a.pronouns:'')+'</div></div></div>'
    +'<div class="pb-tags'+(canEdit?' editable':'')+'">'+((a.expertise||[]).map((t,i)=>{const highlight=topic===t||(q&&t.toLowerCase().includes(q));return'<span class="pb-tag'+(highlight?' highlight':'')+'">'+t+(canEdit?'<span class="pb-tag-x" onclick="removePbExpertise(\''+a.id+'\','+i+')">×</span>':'')+'</span>';}).join(''))+(canEdit?'<input class="pb-tag-inp" id="pb-inp-'+a.id+'" placeholder="Add a topic..." onkeydown="pbExpertiseKey(event,\''+a.id+'\')">':'')+'</div>'
    +'<div class="pb-card-actions"><button class="pb-act-btn primary" onclick="pbMessage(\''+a.id+'\')">✉ Message</button><button class="pb-act-btn" onclick="S.nav=\'profiles\';S.selectedProfileId=\''+a.id+'\';render()">View profile</button></div></div>';}).join('')+'</div>')+'</div></div>';
}
function removePbExpertise(aid,idx){const a=ga(aid);if(!a||aid!==S.activeId)return;if(!a.expertise)a.expertise=[];a.expertise.splice(idx,1);rc();}
function pbExpertiseKey(e,aid){if(e.key==='Enter'||e.key===','){e.preventDefault();const v=e.target.value.trim();if(!v)return;const a=ga(aid);if(!a||aid!==S.activeId)return;if(!a.expertise)a.expertise=[];if(!a.expertise.includes(v))a.expertise.push(v);rc();setTimeout(()=>{const inp=document.getElementById('pb-inp-'+aid);if(inp)inp.focus();},0);}}
function pbMessage(aid){if(aid===S.activeId){toast("That's you");return;}const ex=S.conversations.find(c=>c.type==='direct'&&c.participants.includes(S.activeId)&&c.participants.includes(aid));if(ex){S.activeConvId=ex.id;}else{const id='conv-'+Date.now();S.conversations.push({id,type:'direct',participants:[S.activeId,aid],messages:[]});S.activeConvId=id;}S.commTab='direct';S.nav='communication';render();}
/* ── NEWS ── */
function canSeeAnnouncement(an){if(an.scope==='system')return true;if(an.author===S.activeId)return true;if((an.sharedAlters||[]).includes(S.activeId))return true;const myGids=S.groups.filter(g=>g.members.includes(S.activeId)).map(g=>g.id);if((an.sharedGroups||[]).some(gid=>myGids.includes(gid)))return true;return false;}
function generateNotifications(){
  const notifs=[];const myId=S.activeId;const now=Date.now();
  allEventsForView().forEach(ev=>{if(!ev.date)return;const evDate=new Date(ev.date+(ev.startTime?'T'+ev.startTime:'T12:00'));const diff=evDate.getTime()-now;if(diff>0&&diff<1000*60*60*48&&((ev.attendees||[]).includes(myId)||ev.visibility==='system')){const t=et2(ev.type);const hrs=Math.round(diff/1000/60/60);notifs.push({id:'n-ev-'+ev.id,type:'event',icon:'📅',color:t.hex,line1:'<b>'+ev.title+'</b> — upcoming',line2:hrs<24?'In '+hrs+'h · '+(ev.startTime||'all day'):'In '+Math.round(hrs/24)+' days',ts:now-1000,onClick:"openEventDetail('"+ev.id+"')"});}});
  S.conversations.forEach(c=>{if(!c.participants.includes(myId)||!c.messages.length)return;const last=c.messages[c.messages.length-1];if(last.from===myId)return;const sender=ga(last.from);const cname=c.type==='group'?c.name:(ga(c.participants.find(p=>p!==myId))?.name||'?');const ccol=c.type==='group'?'#9B8DB0':(ga(c.participants.find(p=>p!==myId))?.color||'#9A9A95');notifs.push({id:'n-msg-'+c.id+'-'+last.id,type:'message',icon:'💬',color:ccol,line1:'<b>'+(sender?.name||'?')+'</b> in '+cname,line2:(last.html||last.text||'').replace(/<[^>]*>/g,'').slice(0,80),ts:now-2000,onClick:"S.nav='communication';S.activeConvId='"+c.id+"';S.commTab='"+(c.type==='direct'?'direct':'group')+"';render();"});});
  return notifs.sort((a,b)=>b.ts-a.ts);
}
function generateActivity(){
  const items=[];
  S.announcements.forEach(an=>{items.push({type:'announcement',icon:'📣',color:ga(an.author)?.color||'#9A9A95',txt:'<b>'+(ga(an.author)?.name||'?')+'</b> posted <b>'+an.title+'</b>',ts:an.ts});});
  S.events.forEach(ev=>{if(ev.createdBy){const t=et2(ev.type);items.push({type:'event',icon:'📅',color:t.hex,txt:'<b>'+(ga(ev.createdBy)?.name||'?')+'</b> added event <b>'+ev.title+'</b>',ts:parseEventTs(ev)});}});
  S.books.forEach(b=>{items.push({type:'book',icon:'📖',color:b.color,txt:'Book <b>'+b.title+'</b> added to the library',ts:now_from_id(b.id)});});
  S.groups.forEach(g=>{items.push({type:'group',icon:'◉',color:g.color,txt:'Group <b>'+g.name+'</b> created',ts:now_from_id(g.id)});});
  S.conversations.forEach(c=>{c.messages.forEach(m=>{const cname=c.type==='group'?c.name:(ga(c.participants.find(p=>p!==m.from))?.name||'?');items.push({type:'message',icon:'💬',color:ga(m.from)?.color||'#9A9A95',txt:'<b>'+(ga(m.from)?.name||'?')+'</b> messaged '+cname,ts:now_from_ts(m.ts)});});});
  return items.sort((a,b)=>b.ts-a.ts).slice(0,40);
}
function parseEventTs(ev){const m=(ev.id||'').match(/-(\d{10,})$/);if(m)return parseInt(m[1]);try{return new Date(ev.date+'T00:00').getTime();}catch(e){return Date.now();}}
function now_from_id(id){const m=id.match(/-(\d{10,})$/);return m?parseInt(m[1]):Date.now()-86400000*30;}
function now_from_ts(tsStr){if(!tsStr)return Date.now();if(typeof tsStr==='number')return tsStr;if(/^\d{13,}$/.test(String(tsStr)))return parseInt(tsStr);if(/^\d\d:\d\d/.test(tsStr))return Date.now();return Date.now();}
function isRead(id){return !!S.newsRead[S.activeId+':'+id];}
function markRead(id){S.newsRead[S.activeId+':'+id]=true;}
function markNotifRead(id){markRead(id);}
function countUnread(){const anns=S.announcements.filter(canSeeAnnouncement).filter(a=>a.author!==S.activeId&&!isRead(a.id));const notifs=generateNotifications().filter(n=>!isRead(n.id));return anns.length+notifs.length;}
function relTime(ts){if(!ts)return'—';const diff=Date.now()-ts;if(Math.abs(diff)<60000)return'just now';if(diff<0)return new Date(ts).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});if(diff<3600000)return Math.floor(diff/60000)+'m ago';if(diff<86400000)return Math.floor(diff/3600000)+'h ago';if(diff<86400000*7)return Math.floor(diff/86400000)+'d ago';return new Date(ts).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});}
function buildNews(){
  const tab=S.newsTab;const anns=S.announcements.filter(canSeeAnnouncement).sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||b.ts-a.ts);
  const annUnread=anns.filter(a=>a.author!==S.activeId&&!isRead(a.id)).length;const notifs=generateNotifications();const notifUnread=notifs.filter(n=>!isRead(n.id)).length;
  const badge=(n)=>n>0?'<span class="news-tab-badge">'+n+'</span>':'';
  return '<div class="news-page"><div class="news-controls"><span class="news-title">News</span><button class="tbtn" style="margin-left:auto;" onclick="openNewAnnouncementModal()">+ New announcement</button></div>'
    +'<div class="news-tabs"><div class="news-tab'+(tab==='announcements'?' act':'')+'" onclick="S.newsTab=\'announcements\';rc()">Announcements'+badge(annUnread)+'</div><div class="news-tab'+(tab==='notifications'?' act':'')+'" onclick="S.newsTab=\'notifications\';rc()">Notifications'+badge(notifUnread)+'</div><div class="news-tab'+(tab==='activity'?' act':'')+'" onclick="S.newsTab=\'activity\';rc()">Activity</div></div>'
    +'<div class="news-feed"><div class="news-feed-inner">'+(tab==='announcements'?buildAnnouncementsList(anns):tab==='notifications'?buildNotificationsList(notifs):buildActivityList())+'</div></div></div>';
}
function buildAnnouncementsList(anns){
  if(!anns.length)return'<div class="news-empty"><span>No announcements yet</span><button class="tbtn" onclick="openNewAnnouncementModal()">+ Post the first one</button></div>';
  return anns.map(an=>{const author=ga(an.author);const unread=an.author!==S.activeId&&!isRead(an.id);const isAuthor=an.author===S.activeId;const edited=an.editedTs?' · edited '+relTime(an.editedTs):'';return'<div class="ann-post'+(unread?' unread':'')+'" onclick="markRead(\''+an.id+'\');rc()"><div class="ann-head"><div class="ann-av" style="background:'+abg(author?.color||'#9A9A95')+';color:'+(author?.color||'#9A9A95')+'">'+aAv(author)+'</div><div><div class="ann-author">'+(author?.name||'?')+'</div><div class="ann-meta">'+relTime(an.ts)+edited+' · '+(author?.role||'')+'</div></div>'+(an.pinned?'<span class="ann-pin">Pinned</span>':'')+'</div><div class="ann-title">'+an.title+'</div><div class="ann-body">'+an.body+'</div>'+(isAuthor?'<div class="ann-actions" onclick="event.stopPropagation()"><button class="ann-action-btn" onclick="openNewAnnouncementModal(\''+an.id+'\')">✎ Edit</button><button class="ann-action-btn" onclick="togglePinAnnouncement(\''+an.id+'\')">'+(an.pinned?'📌 Unpin':'📌 Pin')+'</button><button class="ann-action-btn" style="color:var(--warm);" onclick="deleteAnnouncement(\''+an.id+'\')">🗑 Delete</button></div>':'')+'</div>';}).join('');
}
function buildNotificationsList(notifs){if(!notifs.length)return'<div class="news-empty"><span>You\'re all caught up</span></div>';return notifs.map(n=>{const unread=!isRead(n.id);return'<div class="notif-row'+(unread?' unread':'')+'" onclick="markRead(\''+n.id+'\');'+n.onClick+'"><div class="notif-ico" style="background:'+abg(n.color)+';color:'+n.color+'">'+n.icon+'</div><div class="notif-body"><div class="notif-line1">'+n.line1+'</div><div class="notif-line2">'+n.line2+' · '+relTime(n.ts)+'</div></div>'+(unread?'<div class="notif-dot"></div>':'')+'</div>';}).join('');}
function buildActivityList(){const acts=generateActivity();if(!acts.length)return'<div class="news-empty"><span>No activity yet</span></div>';let html='';let lastDay=null;acts.forEach(a=>{const d=new Date(a.ts);const isToday=d.toDateString()===new Date().toDateString();const isYest=d.toDateString()===new Date(Date.now()-86400000).toDateString();const day=isToday?'Today':isYest?'Yesterday':d.toLocaleDateString('en-AU',{day:'numeric',month:'short'});if(day!==lastDay){html+='<div class="activity-day">'+day+'</div>';lastDay=day;}html+='<div class="activity-row"><div class="activity-ico" style="background:'+abg(a.color)+';color:'+a.color+'">'+a.icon+'</div><div class="activity-txt">'+a.txt+'</div><div class="activity-time">'+relTime(a.ts)+'</div></div>';});return html;}
function openNewAnnouncementModal(editId){const editing=editId?S.announcements.find(a=>a.id===editId):null;window._anEdit=editId||null;window._anScope=editing?editing.scope:'system';const ti=editing?editing.title:'';const bo=editing?editing.body:'';document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:460px;"><h3>'+(editing?'Edit announcement':'New announcement')+'</h3><div class="mf"><label>Title</label><input id="anT" placeholder="What\'s this about?" value="'+ti.replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Body</label><textarea id="anB" style="min-height:100px;" placeholder="Write your announcement...">'+bo+'</textarea></div><div class="mf"><label>Visibility</label><div class="ann-compose-scope"><button class="ann-scope-btn'+(window._anScope==='system'?' on':'')+'" id="anScSys" onclick="setAnnScope(\'system\')">🌐 System-wide</button><button class="ann-scope-btn'+(window._anScope==='personal'?' on':'')+'" id="anScPer" onclick="setAnnScope(\'personal\')">🔒 Just me (draft)</button></div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doPostAnnouncement()">'+(editing?'Save':'Post')+'</button></div></div></div>';}
function setAnnScope(s){window._anScope=s;document.getElementById('anScSys')?.classList.toggle('on',s==='system');document.getElementById('anScPer')?.classList.toggle('on',s==='personal');}
function doPostAnnouncement(){const title=(document.getElementById('anT')?.value||'').trim();if(!title)return;const body=(document.getElementById('anB')?.value||'').trim();if(!body)return;const scope=window._anScope||'system';if(window._anEdit){const a=S.announcements.find(x=>x.id===window._anEdit);if(a){a.title=title;a.body=body;a.scope=scope;a.editedTs=Date.now();}closeMod();render();toast('Announcement updated');}else{const id='an-'+Date.now();S.announcements.push({id,author:S.activeId,title,body,ts:Date.now(),scope,sharedAlters:[],sharedGroups:[],pinned:false});markRead(id);closeMod();S.newsTab='announcements';S.nav='news';render();toast('Announcement posted');}}
async function deleteAnnouncement(aid){const a=S.announcements.find(x=>x.id===aid);if(!a)return;if(!await confirmDialog('Delete "'+a.title+'"?','Delete announcement'))return;S.announcements=S.announcements.filter(x=>x.id!==aid);rc();toast('Deleted');}
function togglePinAnnouncement(aid){const a=S.announcements.find(x=>x.id===aid);if(!a)return;a.pinned=!a.pinned;rc();}


/* ── VOTING ── */
function gp(id){return S.polls.find(p=>p.id===id);}
function gpoll(pid,oid){const p=gp(pid);if(!p)return null;return p.options.find(o=>o.id===oid);}
function buildVoting(){
  const active=S.polls.filter(p=>p.status==='active').sort((a,b)=>b.ts-a.ts);
  const closed=S.polls.filter(p=>p.status==='closed').sort((a,b)=>b.ts-a.ts);
  return '<div class="vote-page">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">'
    +'<div class="vote-title">Voting</div>'
    +'<button class="tbtn" onclick="openNewPollModal()">+ New poll</button>'
    +'</div>'
    +(active.length?'<div class="vote-section-label">Active polls</div>'+active.map(p=>buildPollCard(p)).join(''):'')
    +(closed.length?'<div class="vote-section-label"'+(active.length?' style="margin-top:28px;"':'')+'>Closed polls</div>'+closed.map(p=>buildPollCard(p)).join(''):'')
    +(!active.length&&!closed.length?'<div class="vote-empty"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--ink-s)"><rect x="4" y="8" width="24" height="16" rx="3"/><path d="M4 14h24M12 19h8"/></svg><span>No polls yet</span><button class="tbtn" onclick="openNewPollModal()">+ Create the first one</button></div>':'')
    +'</div>';
}
function buildPollCard(p){
  const totalVotes=p.options.reduce((sum,o)=>sum+(o.votes||[]).length,0);const isClosed=p.status==='closed';const myVotes=p.options.filter(o=>(o.votes||[]).includes(S.activeId)).map(o=>o.id);const creator=ga(p.createdBy);
  return '<div class="poll-card"><div class="poll-header"><div class="poll-meta"><div class="poll-question">'+p.question+'</div><div class="poll-sub">'+relTime(p.ts)+' · '+(creator?.name||'?')+(p.type==='multi'?' · pick any':'')+'</div></div><div style="display:flex;gap:5px;align-items:flex-start;">'+(p.createdBy===S.activeId&&!isClosed?'<button class="tbtn" onclick="closePoll(\''+p.id+'\')">Close</button>':'')+(p.createdBy===S.activeId?'<button class="tbtn" style="color:var(--warm);" onclick="deletePoll(\''+p.id+'\')">🗑</button>':'')+'</div></div>'
    +'<div class="poll-options">'+p.options.map(o=>{const votes=(o.votes||[]).length;const pct=totalVotes?Math.round(votes/totalVotes*100):0;const myVote=myVotes.includes(o.id);return'<div class="poll-option'+(myVote?' voted':'')+'" onclick="'+(isClosed?'':' castVote(\''+p.id+'\',\''+o.id+'\')' )+'">'
    +'<div class="poll-option-bar" style="width:'+pct+'%;background:'+(myVote?'var(--sage)':'var(--sage-l)')+';"></div>'
    +'<div class="poll-option-label">'+o.text+'</div>'
    +'<div class="poll-option-count">'+pct+'%'+(myVote?' ✓':'')+'</div></div>';}).join('')+'</div>'
    +'<div class="poll-foot">'+totalVotes+' vote'+(totalVotes!==1?'s':'')+' · '+(isClosed?'<span style="color:var(--warm);font-weight:500;">Closed</span>':'<span style="color:var(--sage);">Active</span>')+'</div></div>';
}
function castVote(pid,oid){
  const p=gp(pid);if(!p||p.status==='closed')return;
  if(p.type!=='multi'){p.options.forEach(o=>{o.votes=(o.votes||[]).filter(v=>v!==S.activeId);});}
  const opt=gpoll(pid,oid);if(!opt)return;opt.votes=opt.votes||[];
  if(opt.votes.includes(S.activeId)){opt.votes=opt.votes.filter(v=>v!==S.activeId);}else{opt.votes.push(S.activeId);}
  rc();queueSave();
}
function closePoll(pid){const p=gp(pid);if(!p)return;p.status='closed';rc();toast('Poll closed');}
async function deletePoll(pid){if(!await confirmDialog('Delete this poll? This cannot be undone.','Delete poll'))return;S.polls=S.polls.filter(p=>p.id!==pid);rc();}
function openNewPollModal(){window._pvOpts=['',''];renderPollModal();}
function renderPollModal(){
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:440px;"><h3>New poll</h3>'
    +'<div class="mf"><label>Question</label><input id="pq" placeholder="What do you want to ask?"></div>'
    +'<div class="mf"><label>Type</label><select id="pt"><option value="single">Single choice (pick one)</option><option value="multi">Multiple choice (pick any)</option></select></div>'
    +'<div class="mf"><label>Options</label>'
    +window._pvOpts.map((v,i)=>'<div style="display:flex;gap:5px;margin-bottom:5px;"><input placeholder="Option '+(i+1)+'…" value="'+v.replace(/"/g,'&quot;')+'" oninput="window._pvOpts['+i+']=this.value" style="flex:1;"><button onclick="removePollOption('+i+')" style="border:none;background:transparent;color:var(--ink-s);cursor:pointer;font-size:16px;padding:0 4px;">×</button></div>').join('')
    +'<button class="tbtn" onclick="addPollOption()" style="margin-top:2px;">+ Add option</button></div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doCreatePoll()">Create poll</button></div></div></div>';
}
function addPollOption(){window._pvOpts.push('');renderPollModal();}
function removePollOption(i){if(window._pvOpts.length<=2)return;window._pvOpts.splice(i,1);renderPollModal();}
function doCreatePoll(){const q=(document.getElementById('pq')?.value||'').trim();if(!q)return;const type=document.getElementById('pt').value;const opts=window._pvOpts.filter(v=>v.trim());if(opts.length<2){toast('Need at least 2 options');return;}const id='poll-'+Date.now();S.polls.push({id,question:q,type,createdBy:S.activeId,ts:Date.now(),status:'active',options:opts.map((t,i)=>({id:'o-'+i,text:t,votes:[]}))});closeMod();S.nav='voting';render();toast('Poll created');}
/* ── PROJECTS ── */
function gproj(id){return S.projects.find(p=>p.id===id);}
function pProgress(p){const tasks=p.tasks||[];if(!tasks.length)return 0;return Math.round(tasks.filter(t=>t.done).length/tasks.length*100);}
function buildProjects(){
  const ps=S.projects.slice().sort((a,b)=>a.name.localeCompare(b.name));
  const stc={active:'proj-status-active',paused:'proj-status-paused',done:'proj-status-done',archived:'proj-status-archived'};
  const cards=ps.map(p=>'<div class="proj-card" onclick="openProject(\''+p.id+'\')">'
    +'<div class="proj-card-color" style="background:'+p.color+'"></div>'
    +'<div class="proj-card-body"><div class="proj-card-title">'+p.name+'</div>'
    +(p.description?'<div class="proj-card-desc">'+p.description.slice(0,80)+(p.description.length>80?'…':'')+'</div>':'')
    +'<div style="display:flex;align-items:center;gap:7px;margin-top:6px;flex-wrap:wrap;">'
    +'<span class="proj-status-badge '+(stc[p.status]||'')+'">'+p.status+'</span>'
    +((p.team||[]).length>0?'<span style="font-size:11px;color:var(--ink-s);">'+p.team.length+' member'+(p.team.length!==1?'s':'')+'</span>':'')
    +'</div></div></div>').join('');
  const addCard='<div class="add-proj-card" onclick="openNewProjectModal()"><div style="width:22px;height:22px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:16px;">+</div><span>New project</span></div>';
  return '<div class="proj-page">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
    +'<div class="proj-title">Projects</div>'
    +'<button class="tbtn" onclick="openNewProjectModal()">+ New project</button>'
    +'</div>'
    +'<div class="proj-grid">'+cards+addCard+'</div>'
    +'</div>';
}
function openProject(pid){S.projDetailId=pid;S.projDetailTab='overview';render();}
function buildProjectDetail(){
  const p=gproj(S.projDetailId);if(!p){S.projDetailId=null;return buildProjects();}
  const tab=S.projDetailTab||'overview';const status_cls={active:'proj-status-active',paused:'proj-status-paused',done:'proj-status-done',archived:'proj-status-archived'};
  return '<div class="proj-detail"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;"><div class="book-back" onclick="S.projDetailId=null;render()">← Projects</div><div style="flex:1;"></div><button class="tbtn" onclick="openEditProjectModal(\''+p.id+'\')">✎ Edit</button><button class="tbtn" style="color:var(--warm);" onclick="deleteProject(\''+p.id+'\')">🗑</button></div>'
    +'<div class="proj-detail-head"><div style="width:48px;height:48px;border-radius:var(--r);background:'+p.color+';flex-shrink:0;"></div><div style="flex:1;"><div class="proj-detail-title">'+p.name+'</div><div style="display:flex;gap:6px;margin-top:5px;flex-wrap:wrap;"><span class="proj-status-badge '+(status_cls[p.status]||'')+'">'+p.status+'</span>'+((p.tags||[]).map(t=>'<span class="proj-tag">'+t+'</span>')).join('')+'</div></div></div>'
    +'<div class="proj-tabs">'+['overview','handoffs','members','linked'].map(t=>'<div class="proj-tab'+(tab===t?' act':'')+'" onclick="S.projDetailTab=\''+t+'\';rc()">'+t.charAt(0).toUpperCase()+t.slice(1)+'</div>').join('')+'</div>'
    +(tab==='overview'?'<div class="proj-overview">'
      +'<div class="proj-section-title">Description</div><div class="proj-description">'+p.description+'</div>'
      +(p.targetDate?'<div class="proj-section-title" style="margin-top:14px;">Target date</div><div>'+p.targetDate+'</div>':'')
      +(p.notes?'<div class="proj-section-title" style="margin-top:14px;">Notes</div><div style="white-space:pre-wrap;font-size:13px;color:var(--ink-m);">'+p.notes+'</div>':'')+'</div>':''
    )+(tab==='handoffs'?buildHandoffTab(p):''
    )+(tab==='members'?'<div class="proj-members-list">'+((p.team||[]).length?p.team.map(id=>{const a=ga(id);return a?'<div class="mem-row"><div class="mem-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div><div style="flex:1"><div class="mem-name">'+a.name+'</div><div style="font-size:11px;color:var(--ink-s)">'+a.role+'</div></div><button class="tbtn" style="color:var(--warm);" onclick="removeProjectMember(\''+p.id+'\',\''+id+'\')">Remove</button></div>':'';}).join(''):'<div style="font-size:13px;color:var(--ink-s);padding:8px 0;">No members yet.</div>')
      +'<button class="tbtn" style="margin-top:8px;" onclick="openAddProjectMemberModal(\''+p.id+'\')">+ Add member</button></div>':''
    )+(tab==='linked'?'<div class="proj-linked">'
      +'<div class="proj-section-title">Linked books</div><div style="display:flex;gap:8px;flex-wrap:wrap;">'+((p.linkedBooks||[]).map(bid=>{const b=gb(bid);return b?'<div class="bcard" style="width:120px;" onclick="openBook(\''+bid+'\')"><div class="bcard-spine" style="background:'+b.color+'"></div><div class="bcard-body"><div class="bcard-title">'+b.title+'</div></div></div>':'';}).join(''))+'<div class="add-bcard" style="width:80px;" onclick="openLinkBookToProjectModal(\''+p.id+'\')"><div style="width:18px;height:18px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;">+</div><span>Link</span></div></div>'
      +'<div class="proj-section-title" style="margin-top:14px;">Linked events</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'+((p.linkedEvents||[]).map(eid=>{const ev=gev(eid);return ev?'<span style="padding:4px 9px;border-radius:4px;background:'+evColor(ev)+'22;color:'+evColor(ev)+';font-size:12px;font-weight:500;cursor:pointer;" onclick="openEventDetail(\''+eid+'\')">'+ev.title+'</span>':'';}).join(''))+'</div></div>':'')
    +'</div>';
}
function buildHandoffTab(p){
  const notes=(p.handoffNotes||[]).sort((a,b)=>b.ts-a.ts);
  const pid=p.id;
  let html='<div class="proj-handoff">';
  html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">';
  html+='<div class="proj-section-title" style="flex:1;margin:0;">Handoff notes</div>';
  html+='<button class="tbtn" onclick="openAddHandoffModal(\''+pid+'\')">+ Add note</button>';
  html+='</div>';
  if(notes.length){
    notes.forEach(function(n){
      var a=ga(n.by);
      var ac=a?a.color:'#9A9A95';
      var an=a?a.name:'?';
      html+='<div class="handoff-note">';
      html+='<div class="handoff-note-head">';
      html+='<div class="handoff-av" style="background:'+abg(ac)+';color:'+ac+'">'+aAv(a)+'</div>';
      html+='<div><div style="font-size:13px;font-weight:500;">'+an+'</div>';
      html+='<div style="font-size:11px;color:var(--ink-s);">'+relTime(n.ts)+'</div></div>';
      html+='</div>';
      html+='<div class="handoff-note-body">'+n.content+'</div>';
      html+='</div>';
    });
  }else{
    html+='<div style="font-size:13px;color:var(--ink-s);padding:8px 0;">No handoff notes yet.</div>';
  }
  html+='</div>';
  return html;
}
function openAddHandoffModal(pid){window._hdPid=pid;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Handoff note</h3><div class="mf"><label>What happened / what\'s next?</label><textarea id="hdNote" style="min-height:90px;" placeholder="e.g. Wrote section 3. Next: fix the intro paragraph..."></textarea></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doAddHandoff()">Save note</button></div></div></div>';}
function doAddHandoff(){const p=gproj(window._hdPid);if(!p)return;const content=(document.getElementById('hdNote')?.value||'').trim();if(!content)return;if(!p.handoffNotes)p.handoffNotes=[];p.handoffNotes.push({id:'hd-'+Date.now(),by:S.activeId,ts:Date.now(),content});closeMod();rc();toast('Note added');}
function removeProjectMember(pid,mid){const p=gproj(pid);if(!p)return;p.team=p.team.filter(id=>id!==mid);rc();}
function openAddProjectMemberModal(pid){window._pmPid=pid;window._pmQ='';renderAddProjectMemberModal();}
function renderAddProjectMemberModal(){const p=gproj(window._pmPid);const q=(window._pmQ||'').toLowerCase();const alters=sortedAlters(S.alters).filter(a=>!(p?.team||[]).includes(a.id)&&(!q||a.name.toLowerCase().includes(q)));document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Add member</h3><div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search alters..." value="'+(window._pmQ||'')+'" oninput="window._pmQ=this.value;renderAddProjectMemberModal()"></div><div class="share-pick-list">'+alters.map(a=>'<div class="spi" onclick="addProjectMember(\''+a.id+'\')"><div class="spi-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div><div style="flex:1"><span class="spi-name">'+a.name+'</span><span class="spi-sub"> · '+a.role+'</span></div></div>').join('')+'</div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button></div></div></div>';_refocusModalSearch();}
function addProjectMember(aid){const p=gproj(window._pmPid);if(!p)return;if(!p.team.includes(aid))p.team.push(aid);closeMod();rc();toast('Added');}
function openLinkBookToProjectModal(pid){window._lbPid=pid;window._lbQ='';renderLinkBookToProjectModal();}
function renderLinkBookToProjectModal(){const p=gproj(window._lbPid);const q=(window._lbQ||'').toLowerCase();const books=S.books.filter(b=>!(p?.linkedBooks||[]).includes(b.id)&&(!q||b.title.toLowerCase().includes(q)));document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Link a book</h3><div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input placeholder="Search books..." value="'+(window._lbQ||'')+'" oninput="window._lbQ=this.value;renderLinkBookToProjectModal()"></div><div class="share-pick-list">'+books.map(b=>'<div class="spi" onclick="linkBookToProject(\''+b.id+'\')"><div class="spi-av sq" style="background:'+abg(b.color)+';color:'+b.color+'">📖</div><span class="spi-name">'+b.title+'</span></div>').join('')+'</div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button></div></div></div>';_refocusModalSearch();}
function linkBookToProject(bid){const p=gproj(window._lbPid);if(!p)return;if(!p.linkedBooks)p.linkedBooks=[];if(!p.linkedBooks.includes(bid))p.linkedBooks.push(bid);closeMod();rc();}
const PROJ_COLS=[{h:'#7B9E8F'},{h:'#B07A6B'},{h:'#7A8FA8'},{h:'#9B8DB0'},{h:'#B09A70'},{h:'#8CA87A'}];
function openNewProjectModal(){window._pjC=PROJ_COLS[0].h;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:450px;"><h3>New project</h3><div class="mf"><label>Name</label><input id="pjn" placeholder="Project name..."></div><div class="mf"><label>Description</label><textarea id="pjd" style="min-height:60px;" placeholder="What\'s this project about?"></textarea></div><div class="mf"><label>Status</label><select id="pjs"><option value="active">Active</option><option value="paused">Paused</option><option value="done">Done</option></select></div><div class="mf"><label>Target date</label><input id="pjt" type="date"></div><div class="mf"><label>Colour</label><div class="color-row">'+PROJ_COLS.map(c=>'<div class="csw'+(c.h===window._pjC?' on':'')+'" style="background:'+c.h+'" id="pjcsw'+c.h.replace('#','')+'" onclick="setProjCol(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doCreateProject()">Create</button></div></div></div>';}
function setProjCol(h){window._pjC=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const el=document.getElementById('pjcsw'+h.replace('#',''));if(el)el.classList.add('on');}
function doCreateProject(){const name=(document.getElementById('pjn')?.value||'').trim();if(!name)return;const id='proj-'+Date.now();S.projects.push({id,name,description:(document.getElementById('pjd')?.value||'').trim(),status:document.getElementById('pjs').value,color:window._pjC||PROJ_COLS[0].h,targetDate:document.getElementById('pjt')?.value||'',ts:Date.now(),team:[S.activeId],linkedBooks:[],linkedEvents:[],handoffNotes:[],notes:'',tags:[]});closeMod();S.projDetailId=id;S.projDetailTab='overview';S.nav='projects';render();toast('Project created');}
function openEditProjectModal(pid){const p=gproj(pid);if(!p)return;window._pjC=p.color;window._pjEdit=pid;document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:450px;"><h3>Edit project</h3><div class="mf"><label>Name</label><input id="pjn" value="'+(p.name||'').replace(/"/g,'&quot;')+'"></div><div class="mf"><label>Description</label><textarea id="pjd" style="min-height:60px;">'+p.description+'</textarea></div><div class="mf"><label>Status</label><select id="pjs">'+['active','paused','done','archived'].map(s=>'<option value="'+s+'"'+(p.status===s?' selected':'')+'>'+s.charAt(0).toUpperCase()+s.slice(1)+'</option>').join('')+'</select></div><div class="mf"><label>Target date</label><input id="pjt" type="date" value="'+(p.targetDate||'')+'"></div><div class="mf"><label>Notes</label><textarea id="pjnotes" style="min-height:60px;" placeholder="Internal notes...">'+( p.notes||'')+'</textarea></div><div class="mf"><label>Colour</label><div class="color-row">'+PROJ_COLS.map(c=>'<div class="csw'+(c.h===window._pjC?' on':'')+'" style="background:'+c.h+'" id="pjcsw'+c.h.replace('#','')+'" onclick="setProjCol(\''+c.h+'\')"></div>').join('')+'</div></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doSaveProject()">Save</button></div></div></div>';}
function doSaveProject(){const pid=window._pjEdit;const p=gproj(pid);if(!p)return;p.name=(document.getElementById('pjn')?.value||'').trim()||p.name;p.description=(document.getElementById('pjd')?.value||'').trim();p.status=document.getElementById('pjs').value;p.targetDate=document.getElementById('pjt')?.value||'';p.notes=(document.getElementById('pjnotes')?.value||'').trim();p.color=window._pjC||p.color;closeMod();rc();toast('Project updated');}
async function deleteProject(pid){const p=gproj(pid);if(!p)return;if(!await confirmDialog('Delete project "'+p.name+'"?','Delete project'))return;S.projects=S.projects.filter(x=>x.id!==pid);S.projDetailId=null;render();toast('Project deleted');}
/* ── RELATIONSHIPS ── */
const REL_TYPES=[{id:'friend',label:'Friend',color:'#5C7A6E',icon:'♥'},{id:'close',label:'Close friend',color:'#3B6D11',icon:'♥♥'},{id:'partner',label:'Partner',color:'#A32D2D',icon:'♥♥♥'},{id:'headmate',label:'Headmate',color:'#534AB7',icon:'◈'},{id:'family',label:'Family',color:'#854F0B',icon:'☽'},{id:'conflict',label:'In conflict',color:'#993C1D',icon:'✗'},{id:'neutral',label:'Neutral',color:'#5F5E5A',icon:'○'},{id:'dormant',label:'Dormant/Unknown',color:'#888780',icon:'?'}];
function buildRelationships(){
  const q=(S.relShipSearch||'').toLowerCase();
  const relOf=(id)=>{const r=S.relationships.find(r=>(r.a===S.activeId&&r.b===id)||(r.b===S.activeId&&r.a===id));return r||null;};
  const REL_PRI={partner:0,close:1,friend:2,headmate:3,family:4,conflict:5,neutral:6,dormant:7};
  const all=S.alters.filter(a=>a.id!==S.activeId).sort((a,b)=>a.name.localeCompare(b.name));
  const filtered=q?all.filter(a=>a.name.toLowerCase().includes(q)||a.role.toLowerCase().includes(q)):all;
  const sorted=filtered.slice().sort((a,b)=>{
    const ra=relOf(a.id),rb=relOf(b.id);
    const pa=ra?(REL_PRI[ra.type]??8):8,pb=rb?(REL_PRI[rb.type]??8):8;
    if(pa!==pb)return pa-pb;
    return a.name.localeCompare(b.name);
  });
  return '<div class="ship-page"><div class="ship-controls"><span class="ship-title">Relationships</span>'
    +'<div class="ship-search-wrap"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg><input class="ship-search" placeholder="Search alters..." value="'+(S.relShipSearch||'')+'" oninput="S.relShipSearch=this.value;rc()"></div>'
    +'<span style="font-size:12px;color:var(--ink-s);margin-left:auto;">'+S.alters.length+' alters · '+S.relationships.length+' relationships</span></div>'
    +'<div class="ship-list">'+sorted.map(a=>{const rel=relOf(a.id);const rt=rel?REL_TYPES.find(r=>r.id===rel.type):null;return'<div class="ship-row"><div class="ship-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div>'
    +'<div style="flex:1;min-width:0;"><div class="ship-name">'+a.name+'</div><div class="ship-role">'+a.role+'</div></div>'
    +'<div class="ship-rel" onclick="openRelTypeModal(\''+a.id+'\')">'+(rt?'<span class="ship-rel-badge" style="background:'+rt.color+'22;color:'+rt.color+'">'+rt.icon+' '+rt.label+'</span>':'<span class="ship-rel-none">Set…</span>')+'</div>'
    +(rel?.note?'<div class="ship-note" title="'+rel.note+'">📝</div>':'')+'</div>';}).join('')+'</div></div>';
}
function openRelTypeModal(alterId){window._relBid=alterId;const a=ga(alterId);const ex=S.relationships.find(r=>(r.a===S.activeId&&r.b===alterId)||(r.b===S.activeId&&r.a===alterId));window._relNote=ex?.note||'';document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Relationship with '+a?.name+'</h3><div class="cl-options" style="grid-template-columns:repeat(2,1fr);">'+REL_TYPES.map(rt=>{const isSel=ex?.type===rt.id;return'<div class="cl-option'+(isSel?' on':'')+'" onclick="setRelType(\''+rt.id+'\')"><span style="font-size:15px;color:'+rt.color+'">'+rt.icon+'</span><span class="cl-lbl">'+rt.label+'</span></div>';}).join('')+'</div><div class="mf" style="margin-top:12px;"><label>Note (optional)</label><input id="rel-note" placeholder="e.g. We had a conflict last month..." value="'+(window._relNote||'').replace(/"/g,'&quot;')+'" oninput="window._relNote=this.value"></div><div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button>'+(ex?'<button class="mbtn-s" style="color:var(--warm);" onclick="removeRel(\''+alterId+'\')">Remove</button>':'')+'<button class="mbtn-p" onclick="saveRel()">Save</button></div></div></div>';}
function setRelType(type){window._relType=type;document.querySelectorAll('#mods .cl-option').forEach((el,i)=>{el.classList.toggle('on',REL_TYPES[i]&&REL_TYPES[i].id===type);});}
function saveRel(){const bid=window._relBid;const type=window._relType||(S.relationships.find(r=>(r.a===S.activeId&&r.b===bid)||(r.b===S.activeId&&r.a===bid))?.type||'neutral');const note=(document.getElementById('rel-note')?.value||'').trim();S.relationships=S.relationships.filter(r=>!((r.a===S.activeId&&r.b===bid)||(r.b===S.activeId&&r.a===bid)));S.relationships.push({id:'rel-'+Date.now(),a:S.activeId,b:bid,type,note});closeMod();rc();toast('Relationship updated');}
function removeRel(bid){S.relationships=S.relationships.filter(r=>!((r.a===S.activeId&&r.b===bid)||(r.b===S.activeId&&r.a===bid)));window._relType=null;closeMod();rc();}

/* ── REGISTRY ── */
function buildRegistryList(){
  const regs=S.registries.slice().sort((a,b)=>a.title.localeCompare(b.title));
  const cards=regs.map(r=>'<div class="proj-card" onclick="S.regDetailId=\''+r.id+'\';render()">'
    +'<div class="proj-card-band" style="background:'+r.color+'"></div>'
    +'<div class="proj-card-body">'
    +'<div class="proj-card-title">'+r.title+'</div>'
    +(r.description?'<div class="proj-card-desc">'+r.description.slice(0,80)+(r.description.length>80?'…':'')+'</div>':'')
    +'<div style="font-size:11px;color:var(--ink-s);margin-top:4px;">'+(r.members||[]).length+' member'+((r.members||[]).length!==1?'s':'')+'</div>'
    +'</div></div>').join('');
  const addCard='<div class="add-proj-card" onclick="openNewRegistryModal()"><div style="width:22px;height:22px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:16px;">+</div><span>New registry</span></div>';
  return '<div class="proj-page">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
    +'<div class="proj-title">Registry</div>'
    +'<button class="tbtn" onclick="openNewRegistryModal()">+ New registry</button>'
    +'</div>'
    +'<div class="proj-grid">'+cards+addCard+'</div>'
    +'</div>';
}
function buildRegistryDetail(){
  const r=greg(S.regDetailId);if(!r){S.regDetailId=null;return buildRegistryList();}
  const memberRows=(r.members||[]).map(id=>{
    const a=ga(id);if(!a)return'';
    return '<div class="mem-row">'
      +'<div class="mem-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div>'
      +'<div style="flex:1"><div class="mem-name">'+a.name+'</div><div style="font-size:11px;color:var(--ink-s)">'+a.role+'</div></div>'
      +(id===S.activeId?'<span class="mem-badge">You</span>':'')
      +'<button class="tbtn" style="color:var(--warm);" onclick="removeRegMember(\''+r.id+'\',\''+id+'\')">Remove</button>'
      +'</div>';
  }).join('');
  return '<div class="proj-detail">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">'
    +'<div class="book-back" onclick="S.regDetailId=null;render()">← Registry</div>'
    +'<div style="flex:1;"></div>'
    +'<button class="tbtn" onclick="openEditRegistryModal(\''+r.id+'\')">✎ Edit</button>'
    +'<button class="tbtn" style="color:var(--warm);" onclick="deleteRegistry(\''+r.id+'\')">🗑</button>'
    +'</div>'
    +'<div class="proj-detail-head">'
    +'<div style="width:48px;height:48px;border-radius:var(--r);background:'+r.color+';flex-shrink:0;"></div>'
    +'<div style="flex:1;">'
    +'<div class="proj-detail-title">'+r.title+'</div>'
    +(r.description?'<div style="font-size:13px;color:var(--ink-m);margin-top:6px;line-height:1.55;white-space:pre-wrap;">'+r.description+'</div>':'')
    +'</div></div>'
    +'<div class="proj-section-title" style="margin-top:20px;">Members &middot; '+(r.members||[]).length+'</div>'
    +'<div class="member-list" style="margin-bottom:10px;">'+memberRows+'</div>'
    +'<button class="tbtn" onclick="openAddRegMemberModal(\''+r.id+'\')">+ Add member</button>'
    +'</div>';
}
function openNewRegistryModal(){
  window._regC=GCOLS[0].h;
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:440px;"><h3>New registry</h3>'
    +'<div class="mf"><label>Title</label><input id="regTitle" placeholder="Registry name..."></div>'
    +'<div class="mf"><label>Description <span style="color:var(--ink-s);font-weight:400;">(optional)</span></label><textarea id="regDesc" style="min-height:70px;" placeholder="What is this registry for?"></textarea></div>'
    +'<div class="mf"><label>Colour</label><div class="color-row">'+GCOLS.map(c=>'<div class="csw'+(c.h===window._regC?' on':'')+'" style="background:'+c.h+'" id="regcsw'+c.h.replace('#','')+'" onclick="setRegColor(\''+c.h+'\')"></div>').join('')+'</div></div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doCreateRegistry()">Create</button></div>'
    +'</div></div>';
}
function setRegColor(h){window._regC=h;document.querySelectorAll('#mods .csw').forEach(s=>s.classList.remove('on'));const el=document.getElementById('regcsw'+h.replace('#',''));if(el)el.classList.add('on');}
function doCreateRegistry(){
  const title=(document.getElementById('regTitle')?.value||'').trim();if(!title)return;
  const desc=(document.getElementById('regDesc')?.value||'').trim();
  const id='reg-'+Date.now();
  if(!S.registries)S.registries=[];
  S.registries.push({id,title,description:desc,members:[S.activeId],color:window._regC||GCOLS[0].h,ts:Date.now()});
  closeMod();S.regDetailId=id;S.nav='registry';render();toast('Registry created');
}
function openEditRegistryModal(rid){
  const r=greg(rid);if(!r)return;
  window._regC=r.color;window._regEditId=rid;
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:440px;"><h3>Edit registry</h3>'
    +'<div class="mf"><label>Title</label><input id="regTitle" value="'+(r.title||'').replace(/"/g,'&quot;')+'"></div>'
    +'<div class="mf"><label>Description</label><textarea id="regDesc" style="min-height:70px;">'+(r.description||'')+'</textarea></div>'
    +'<div class="mf"><label>Colour</label><div class="color-row">'+GCOLS.map(c=>'<div class="csw'+(c.h===window._regC?' on':'')+'" style="background:'+c.h+'" id="regcsw'+c.h.replace('#','')+'" onclick="setRegColor(\''+c.h+'\')"></div>').join('')+'</div></div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doSaveRegistry()">Save</button></div>'
    +'</div></div>';
}
function doSaveRegistry(){
  const r=greg(window._regEditId);if(!r)return;
  const title=(document.getElementById('regTitle')?.value||'').trim();
  if(title)r.title=title;
  r.description=(document.getElementById('regDesc')?.value||'').trim();
  r.color=window._regC||r.color;
  closeMod();rc();toast('Saved');
}
function openAddRegMemberModal(rid){window._rmRid=rid;window._rmQ='';renderAddRegMemberModal();}
function renderAddRegMemberModal(){
  const r=greg(window._rmRid);
  const q=(window._rmQ||'').toLowerCase();
  const alters=sortedAlters(S.alters).filter(a=>!(r?.members||[]).includes(a.id)&&(!q||a.name.toLowerCase().includes(q)));
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal"><h3>Add member</h3>'
    +'<div class="share-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>'
    +'<input placeholder="Search alters..." value="'+(window._rmQ||'')+'" oninput="window._rmQ=this.value;renderAddRegMemberModal()"></div>'
    +'<div class="share-pick-list">'+alters.map(a=>'<div class="spi" onclick="addRegMember(\''+a.id+'\')"><div class="spi-av" style="background:'+abg(a.color)+';color:'+a.color+'">'+aAv(a)+'</div><div style="flex:1"><span class="spi-name">'+a.name+'</span><span class="spi-sub"> · '+a.role+'</span></div></div>').join('')+'</div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button></div>'
    +'</div></div>';
  _refocusModalSearch();
}
function addRegMember(aid){
  const r=greg(window._rmRid);if(!r)return;
  if(!r.members)r.members=[];
  if(!r.members.includes(aid))r.members.push(aid);
  closeMod();rc();toast('Added');
}
function removeRegMember(rid,aid){
  const r=greg(rid);if(!r)return;
  r.members=(r.members||[]).filter(id=>id!==aid);rc();
}
async function deleteRegistry(rid){
  if(!await confirmDialog('Delete this registry? This cannot be undone.','Delete registry'))return;
  S.registries=S.registries.filter(r=>r.id!==rid);
  S.regDetailId=null;render();toast('Deleted');
}

/* ── Q&A ── */
function qnaNetVotes(ans){return Object.values(ans.votes||{}).reduce((s,v)=>s+v,0);}
function sortedAnswers(answers){return(answers||[]).slice().sort((a,b)=>qnaNetVotes(b)-qnaNetVotes(a)||b.ts-a.ts);}

function buildQnaList(){
  const q=(S.qnaSearch||'').toLowerCase();
  const qs=S.questions.slice().sort((a,b)=>b.ts-a.ts);
  const filtered=q?qs.filter(x=>x.title.toLowerCase().includes(q)||(x.body||'').toLowerCase().includes(q)):qs;
  const svgQ='<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--ink-s)"><circle cx="16" cy="16" r="12"/><path d="M13 12.5a3.5 3.5 0 0 1 6.5 1.5c0 2.5-3.5 3-3.5 5.5M16 24v.5"/></svg>';
  return '<div class="qna-page">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
    +'<div class="qna-title">Q&amp;A</div>'
    +'<button class="tbtn" onclick="openAskModal()">+ Ask a question</button>'
    +'</div>'
    +'<div class="qna-search-wrap"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>'
    +'<input class="qna-search" placeholder="Search questions..." value="'+(S.qnaSearch||'')+'" oninput="S.qnaSearch=this.value;rc()"></div>'
    +(filtered.length===0
      ?'<div class="qna-empty">'+svgQ+'<span>'+(q?'No questions match your search.':'No questions yet.')+'</span>'+(q?'':'<button class="tbtn" onclick="openAskModal()">+ Ask the first one</button>')+'</div>'
      :'<div class="qna-list">'+filtered.map(x=>{
        const author=ga(x.author);const aCount=(x.answers||[]).length;
        return '<div class="qna-card" onclick="S.qnaDetailId=\''+x.id+'\';rc()">'
          +'<div class="qna-card-left"><div class="qna-ans-count">'+aCount+'</div><div class="qna-ans-label">answer'+(aCount!==1?'s':'')+'</div></div>'
          +'<div class="qna-card-body">'
          +'<div class="qna-card-title">'+x.title+'</div>'
          +(x.body?'<div class="qna-card-excerpt">'+(x.body.length>120?x.body.slice(0,120)+'…':x.body)+'</div>':'')
          +'<div class="qna-card-meta">'
          +'<div class="qna-av" style="background:'+abg(author?.color||'#9A9A95')+';color:'+(author?.color||'#9A9A95')+'">'+aAv(author)+'</div>'
          +'<span>'+(author?.name||'?')+'</span><span class="qna-dot">·</span><span>'+relTime(x.ts)+'</span>'
          +'</div></div></div>';
      }).join('')+'</div>')
    +'</div>';
}

function buildQnaDetail(){
  const x=gq(S.qnaDetailId);
  if(!x){S.qnaDetailId=null;return buildQnaList();}
  const author=ga(x.author);
  const answers=sortedAnswers(x.answers);
  const myVote=(ans)=>(ans.votes||{})[S.activeId]||0;
  const svgUp='<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2l4 6H2z"/></svg>';
  const svgDn='<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 10l4-6H2z"/></svg>';
  return '<div class="qna-page">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">'
    +'<div class="book-back" onclick="S.qnaDetailId=null;rc()">← Q&amp;A</div>'
    +'</div>'
    +'<div class="qna-question-block">'
    +'<div class="qna-question-title">'+x.title+'</div>'
    +(x.body?'<div class="qna-question-body">'+x.body+'</div>':'')
    +'<div class="qna-question-meta">'
    +'<div class="qna-av" style="background:'+abg(author?.color||'#9A9A95')+';color:'+(author?.color||'#9A9A95')+'">'+aAv(author)+'</div>'
    +'<span>'+(author?.name||'?')+'</span><span class="qna-dot">·</span><span>'+relTime(x.ts)+'</span>'
    +(x.author===S.activeId?'<button class="tbtn" style="color:var(--warm);margin-left:auto;" onclick="deleteQuestion(\''+x.id+'\')">🗑 Delete</button>':'')
    +'</div></div>'
    +'<div style="display:flex;align-items:center;gap:10px;margin:20px 0 12px;">'
    +'<div class="qna-section-label">'+answers.length+' answer'+(answers.length!==1?'s':'')+'</div>'
    +'<button class="tbtn" onclick="openAnswerModal(\''+x.id+'\')">+ Write an answer</button>'
    +'</div>'
    +(answers.length===0?'<div class="qna-no-answers">No answers yet — be the first to answer.</div>'
      :'<div class="qna-answers">'+answers.map(ans=>{
        const aauth=ga(ans.author);const net=qnaNetVotes(ans);const mv=myVote(ans);
        return '<div class="qna-answer">'
          +'<div class="qna-vote-col">'
          +'<button class="qna-vote-btn'+(mv===1?' on up':'')+'" onclick="voteAnswer(\''+x.id+'\',\''+ans.id+'\',1)" title="Upvote">'+svgUp+'</button>'
          +'<div class="qna-net'+(net>0?' pos':net<0?' neg':'')+'">'+net+'</div>'
          +'<button class="qna-vote-btn'+(mv===-1?' on down':'')+'" onclick="voteAnswer(\''+x.id+'\',\''+ans.id+'\',-1)" title="Downvote">'+svgDn+'</button>'
          +'</div>'
          +'<div class="qna-answer-body-wrap">'
          +'<div class="qna-answer-text">'+ans.body.replace(/\n/g,'<br>')+'</div>'
          +'<div class="qna-answer-meta">'
          +'<div class="qna-av" style="background:'+abg(aauth?.color||'#9A9A95')+';color:'+(aauth?.color||'#9A9A95')+'">'+aAv(aauth)+'</div>'
          +'<span>'+(aauth?.name||'?')+'</span><span class="qna-dot">·</span><span>'+relTime(ans.ts)+'</span>'
          +(ans.author===S.activeId?'<button class="tbtn" style="color:var(--warm);margin-left:auto;" onclick="deleteAnswer(\''+x.id+'\',\''+ans.id+'\')">🗑</button>':'')
          +'</div></div></div>';
      }).join('')+'</div>')
    +'</div>';
}

function voteAnswer(qid,ansId,dir){
  const q=gq(qid);if(!q)return;
  const ans=(q.answers||[]).find(a=>a.id===ansId);if(!ans)return;
  if(!ans.votes)ans.votes={};
  if(ans.votes[S.activeId]===dir)delete ans.votes[S.activeId];
  else ans.votes[S.activeId]=dir;
  rc();queueSave();
}

function openAskModal(){
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:500px;"><h3>Ask a question</h3>'
    +'<div class="mf"><label>Question</label><input id="qTitle" placeholder="What do you want to know?"></div>'
    +'<div class="mf"><label>Details <span style="color:var(--ink-s);font-weight:400;">(optional)</span></label><textarea id="qBody" style="min-height:80px;" placeholder="Add more context..."></textarea></div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doPostQuestion()">Post question</button></div>'
    +'</div></div>';
}
function doPostQuestion(){
  const title=(document.getElementById('qTitle')?.value||'').trim();if(!title)return;
  const body=(document.getElementById('qBody')?.value||'').trim();
  const id='q-'+Date.now();
  S.questions.push({id,author:S.activeId,title,body,ts:Date.now(),answers:[]});
  closeMod();S.qnaDetailId=id;S.nav='qna';render();toast('Question posted');
}

function openAnswerModal(qid){
  window._ansQid=qid;
  document.getElementById('mods').innerHTML='<div class="modal-bg"><div class="modal" style="width:500px;"><h3>Write an answer</h3>'
    +'<div class="mf"><label>Answer</label><textarea id="ansBody" style="min-height:120px;" placeholder="Share what you know..."></textarea></div>'
    +'<div class="mbtns"><button class="mbtn-s" onclick="confirmCloseMod()">Cancel</button><button class="mbtn-p" onclick="doPostAnswer()">Post answer</button></div>'
    +'</div></div>';
}
function doPostAnswer(){
  const body=(document.getElementById('ansBody')?.value||'').trim();if(!body)return;
  const q=gq(window._ansQid);if(!q)return;
  if(!q.answers)q.answers=[];
  q.answers.push({id:'ans-'+Date.now(),author:S.activeId,body,ts:Date.now(),votes:{}});
  closeMod();rc();toast('Answer posted');
}

async function deleteQuestion(qid){
  if(!await confirmDialog('Delete this question and all its answers? This cannot be undone.','Delete question'))return;
  S.questions=S.questions.filter(q=>q.id!==qid);
  S.qnaDetailId=null;render();toast('Deleted');
}
async function deleteAnswer(qid,ansId){
  if(!await confirmDialog('Delete this answer?','Delete answer'))return;
  const q=gq(qid);if(!q)return;
  q.answers=q.answers.filter(a=>a.id!==ansId);rc();toast('Deleted');
}

/* ── NAVIGATION ── */

async function navTo(section){if(section===S.nav){render();return;}if(S.nav==='profiles'&&profileHasChanges()){if(!await confirmDialog('You have unsaved profile changes. Leave anyway?','Unsaved changes'))return;S.profileEdit=null;}if(S.nav==='map'){mapPanCleanup();}S.nav=section;S.grpDetailId=null;S.projDetailId=null;S.qnaDetailId=null;S.regDetailId=null;render();}

/* ── APP STARTUP ── */
(function(){
  const loaded=loadState();
  if(!loaded||!S.onboarded){
    S.screen='onboarding';S.obStep=0;S.obAlters=[];S.obDraft=null;S.obImporting=false;
  } else {
    if(!ga(S.activeId)){S.screen='gallery';S.galSel=null;}
    else if(S.screen==='onboarding')S.screen='main';
  }
  initBroadcast();
  applyTheme();
  document.getElementById('root').innerHTML=buildApp();
  updateSaveIndicator();
  if(S.bookId)requestAnimationFrame(initBookCanvases);
})();
