/* ============================================================
 * app.js  (v3)
 * 唯一数据源：exercises-dataset-main/data/exercises.json (1324 条)
 *  - 列表卡片：180×180 缩略图（image）
 *  - 详情页：GIF 动图（gif_url）替代 3D viewer；中文步骤 instruction_steps.zh
 *  - 分类：BODY_PARTS（16 一级）+ 二级（classification.js 打标）
 * ============================================================ */

const DATA_URL = 'data/exercises-dataset-main/data/exercises.json';
const MEDIA_PREFIX = 'data/exercises-dataset-main/';

/* ================= 常量 ================= */
/* 器械分组顺序（右侧瀑布流按此排序；未知装备归"其他"最后） */
const EQUIP_GROUP_ORDER = [
  {key:'bodyweight',       label:'自重'},
  {key:'dumbbell',         label:'哑铃'},
  {key:'barbell',          label:'杠铃'},
  {key:'kettlebell',       label:'壶铃'},
  {key:'cable',            label:'绳索'},
  {key:'resistance_band',  label:'弹力带'},
  {key:'machine',          label:'器械'},
  {key:'other',            label:'其他'}
];
/* ================= SVG 图标（Lucide 风格，stroke 一致） ================= */
const ICONS = {
  lockOpen: '<svg viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>',
  lockClosed: '<svg viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 15v2.5"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.6-4.6"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V13M12 16.2h.01"/></svg>'
};

/* ================= 状态 ================= */
let curSide  = 'chest';   // 默认选中内容最丰富的分类（无"全部"）
let curSub   = 'all';
let curKeyword = '';
let sideExpanded = {};
let dataLoaded = false;

/* ================= 工具 ================= */
function partByKey(key){ return (window.BODY_PARTS||[]).find(p=>p.key===key) || null; }
function mediaPath(p){ return p ? MEDIA_PREFIX + p : ''; }

function countByBodyPart(key){
  if (key === 'all') return (window.EXERCISES||[]).length;
  const g = partByKey(key);
  if (!g) return 0;
  return (window.EXERCISES||[]).filter(ex => g.match(ex)).length;
}
function countBySub(partKey, subKey){
  const p = partByKey(partKey);
  if (!p) return 0;
  return (window.EXERCISES||[]).filter(ex =>
    ex.body_part === partKey && ex.body_subpart === subKey
  ).length;
}

/* ================= 筛选 ================= */
function matchExercise(ex){
  if (curKeyword){
    const kw = curKeyword.toLowerCase();
    const hay = ((ex.name_zh||'') + ' ' + (ex.name||'') + ' ' + (ex.id||'') + ' ' + (ex.target||'') + ' ' + (ex.equipment||'')).toLowerCase();
    if (!hay.includes(kw)) return false;
  }

  const part = partByKey(curSide);
  if (!part) return false;
  if (!part.match(ex)) return false;
  if (curSub !== 'all' && ex.body_subpart !== curSub) return false;
  return true;
}
function filteredList(){ return (window.EXERCISES||[]).filter(matchExercise); }

/* ================= 渲染：侧边导航（一级 + 折叠二级，无"全部"无计数） ================= */
function renderSideNav(){
  const nav = document.getElementById('sideNav');
  const expandedKey = sideExpanded[curSide] ? curSide : null;

  const html = (window.BODY_PARTS||[]).map(g=>{
    if (g.key === 'all') return ''; // 去掉"全部"分类
    const cnt = countByBodyPart(g.key);
    if (cnt === 0) return ''; // 空组隐藏
    const hasSub = g.sub && g.sub.length;
    const isOpen = expandedKey === g.key;
    const isActive = (g.key === curSide && curSub === 'all');

    let row = `
      <div class="side-item side-level1${isActive?' active':''}" data-side="${g.key}">
        ${hasSub ? `<span class="caret${isOpen?' open':''}" data-toggle="${g.key}">▸</span>` : '<span class="caret-spacer"></span>'}
        <span class="side-label">${g.label}</span>
      </div>`;

    if (hasSub && isOpen){
      row += `<div class="sub-list">
        ${g.sub.map(s=>{
          const subCnt = countBySub(g.key, s.key);
          if (subCnt === 0) return '';
          const subActive = (g.key === curSide && curSub === s.key);
          return `<div class="side-item side-level2${subActive?' active':''}"
                       data-side="${g.key}" data-sub="${s.key}">
            <span class="dot"></span>
            <span class="side-label">${s.label}</span>
          </div>`;
        }).join('')}
      </div>`;
    }
    return row;
  }).join('');
  nav.innerHTML = html;

  nav.querySelectorAll('.side-level1').forEach(el=>{
    el.onclick = (e)=>{
      const k = el.dataset.side;
      if (e.target && e.target.dataset && e.target.dataset.toggle === k){
        sideExpanded[k] = !sideExpanded[k];
        renderSideNav();
        return;
      }
      const wasOpen = sideExpanded[k];
      if (k === curSide && curSub === 'all' && wasOpen){
        sideExpanded[k] = false;
        renderSideNav();
        return;
      }
      curSide = k; curSub = 'all';
      sideExpanded[k] = true;
      renderSideNav(); renderList();
    };
  });
  nav.querySelectorAll('.side-level2').forEach(el=>{
    el.onclick = (e)=>{
      e.stopPropagation();
      curSide = el.dataset.side;
      curSub  = el.dataset.sub || 'all';
      sideExpanded[curSide] = true;
      renderSideNav(); renderList();
    };
  });
}

/* ================= 渲染：动作网格（分类 + 卡片交替瀑布流，两列） ================= */
function renderList(){
  const list = filteredList();
  const title = document.getElementById('sectionTitle');
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('empty');

  const part = partByKey(curSide);
  const parts = [];
  if (part) parts.push(part.label);
  if (curSub !== 'all'){
    const subP = part && part.sub.find(s=>s.key===curSub);
    if (subP) parts.push('· '+subP.label);
  }
  if (curKeyword) parts.push('· "'+curKeyword+'"');
  title.textContent = parts.join(' ') || '';

  // 按器械分组（顺序固定；未知装备归"其他"）
  const groups = EQUIP_GROUP_ORDER.map(g=>({ key:g.key, label:g.label, items:[] }));
  list.forEach(ex=>{
    const g = groups.find(x=>x.key===ex.equip_key) || groups.find(x=>x.key==='other') || groups[groups.length-1];
    g.items.push(ex);
  });
  const visible = groups.filter(g=>g.items.length);

  const cardHtml = (ex)=>{
    const targetLabel = (window.TARGET_LABELS||{})[ex.target] || ex.target || '';
    const zhName = ex.name_zh || ex.name || '';
    return `
    <article class="card" onclick="App.openDetail('${ex.id}')">
      <div class="thumb">
        <img src="${mediaPath(ex.image)}" alt="${zhName}" loading="lazy"
             onerror="this.parentElement.classList.add('noimg')">
      </div>
      <div class="card-title">${zhName}</div>
      <div class="card-muscle">${targetLabel}</div>
    </article>`;
  };

  grid.innerHTML = visible.map(g=>`
    <div class="equip-group">
      <h3 class="group-title"><span class="gt-bar"></span>${g.label}</h3>
      <div class="grid">${g.items.map(cardHtml).join('')}</div>
    </div>`).join('');

  empty.classList.toggle('hidden', list.length>0);
}

/* ================= 详情页 ================= */
function renderDetail(ex){
  const zhName = ex.name_zh || ex.name || '';
  document.getElementById('dName').textContent = zhName;
  document.getElementById('dLock').innerHTML = ex.locked ? ICONS.lockClosed : ICONS.lockOpen;

  const steps = (ex.instruction_steps && ex.instruction_steps.zh) || [];
  const targetZh = (window.TARGET_LABELS||{})[ex.target] || ex.target || '';
  const groupZh  = (window.TARGET_LABELS||{})[ex.muscle_group] || ex.muscle_group || '';
  const secZh = (ex.secondary_muscles||[]).map(s=>(window.TARGET_LABELS||{})[s]||s);

  const pointList = steps.length ? `
    <div class="point-list">
      ${steps.map((s,i)=>`
        <div class="point">
          <div class="point-no">${i+1}</div>
          <div class="point-text">${s}</div>
        </div>`).join('')}
    </div>` : `<p style="color:var(--dim)">该动作暂无中文分步说明。</p>`;

  const part = partByKey(ex.body_part);
  const sub  = part && part.sub && part.sub.find(s=>s.key===ex.body_subpart);
  // 分类并入 eyebrow 行（不单独占一行）
  const crumbLabel = (part && part.key !== 'all')
    ? (part.label + (sub ? ' › ' + sub.label : ''))
    : '';

  const equipLabel = (window.EQUIP_LABELS||{})[ex.equipment] || ex.equipment || '';

  const primaryTags = `<span class="muscle-tag"><span class="dot"></span>${targetZh}</span>`;
  const secondaryTags = secZh.map(s=>`<span class="muscle-tag sec"><span class="dot"></span>${s}</span>`).join('');

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-head">
      <div class="eyebrow">${crumbLabel || '动作学习预览'}</div>
      <h1>${zhName}</h1>
      <p class="subline">${equipLabel} · ${targetZh}${groupZh?(' · '+groupZh):''}</p>
    </div>

    <!-- 01 动图 -->
    <section class="panel">
      <div class="num">01</div>
      <h2>动作演示</h2>
      <div class="gif-box">
        <img src="${mediaPath(ex.gif_url)}" alt="${zhName}">
        <span class="gif-tag">动 图</span>
        <div class="gif-attr">© Gym visual — gymvisual.com</div>
      </div>
    </section>

    <!-- 02 动作要点 -->
    <section class="panel">
      <div class="num">02</div>
      <h2>动作要点</h2>
      <p class="panel-lead">跟着步骤做，注意每个环节的发力与呼吸。</p>
      ${pointList}
    </section>

    <!-- 03 训练肌群 -->
    <section class="panel">
      <div class="num">03</div>
      <h2>训练肌群</h2>
      <p class="panel-lead">目标肌群重点发力，协同肌群辅助稳定。</p>
      <div class="muscle-tags">${primaryTags}${secondaryTags}</div>
    </section>`;
}

/* ================= App 命名空间 ================= */
const App = {
  openDetail(id){
    const ex = (window.EXERCISES||[]).find(e=>e.id===id);
    if(!ex) return;
    renderDetail(ex);
    document.getElementById('listPage').classList.add('hidden');
    document.getElementById('detailPage').classList.remove('hidden');
    window.scrollTo(0,0);
  },
  closeDetail(){
    document.getElementById('detailPage').classList.add('hidden');
    document.getElementById('listPage').classList.remove('hidden');
    window.scrollTo(0,0);
  },
  switchNav(page){
    const pages = ['list','train','challenge','history','mine'];
    const ids = {list:'listPage', train:'trainPage', challenge:'challengePage', history:'historyPage', mine:'minePage'};
    pages.forEach(p=>document.getElementById(ids[p]).classList.add('hidden'));
    document.getElementById(ids[page]).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
    window.scrollTo(0,0);
  }
};

/* ================= 数据加载 ================= */
async function loadData(){
  const box = document.getElementById('grid');
  const tip = document.getElementById('loadTip');
  tip.classList.remove('hidden');
  try {
    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error('HTTP '+resp.status);
    const data = await resp.json();
    if (!Array.isArray(data)) throw new Error('bad json');
    window.EXERCISES = window.enrichExerciseList(data);
    dataLoaded = true;
    tip.classList.add('hidden');
    renderSideNav();
    renderList();
  } catch(err){
    tip.classList.add('hidden');
    box.innerHTML = `<div class="empty"><div class="empty-icon">${ICONS.alert}</div><div>数据加载失败：${err.message||err}<br>请先执行 <b>node server.js</b> 启动本地服务。</div></div>`;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderSideNav();
  renderList();
  loadData();

  let timer = null;
  document.getElementById('searchInput').addEventListener('input', e=>{
    clearTimeout(timer);
    timer = setTimeout(()=>{
      curKeyword = e.target.value.trim();
      renderList();
    }, 180);
  });

  document.querySelectorAll('.nav-item').forEach(n=>{
    n.onclick = ()=>App.switchNav(n.dataset.page);
  });
  document.getElementById('trainFloatBtn').onclick = ()=>App.switchNav('train');
  document.getElementById('plusBtn').onclick = ()=>{
    App.switchNav('list');
    window.scrollTo({top:0,behavior:'smooth'});
  };
});
