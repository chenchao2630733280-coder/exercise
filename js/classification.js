/* ==========================================================
 * classification.js  (v3)
 * 适配 exercises-dataset-main 唯一数据源
 * 数据字段：body_part(10枚举) / target / equipment / name
 * 一级 = 截图 16 类；二级 = idea 文档肌肉失衡映射
 * ========================================================== */

/* ================= 装备归一化（数据集 28 种 → 分组 key） ================= */
const EQUIP_TAB_KEY = {
  'barbell':'barbell', 'olympic barbell':'barbell', 'trap bar':'barbell', 'ez barbell':'barbell',
  'dumbbell':'dumbbell',
  'kettlebell':'kettlebell',
  'cable':'cable', 'rope':'cable',
  'body weight':'bodyweight', 'assisted':'bodyweight',
  'band':'resistance_band', 'resistance band':'resistance_band',
  'leverage machine':'machine', 'smith machine':'machine', 'sled machine':'machine',
  'upper body ergometer':'machine', 'skierg machine':'machine', 'stationary bike':'machine',
  'elliptical machine':'machine', 'stepmill machine':'machine',
  'stability ball':'machine', 'bosu ball':'machine',
  /* 杂项（无法归入明确器械组）→ 其他 */
  'weighted':'other', 'medicine ball':'other', 'hammer':'other', 'tire':'other',
  'roller':'other', 'wheel roller':'other'
};
function equipKey(equip){
  const k = EQUIP_TAB_KEY[(equip||'').toLowerCase()];
  return k || 'other';
}

/* ================= 装备中文标签（数据集原文 → 中文） ================= */
const EQUIP_LABELS = {
  'body weight':'自重', 'dumbbell':'哑铃', 'barbell':'杠铃', 'kettlebell':'壶铃',
  'cable':'绳索', 'rope':'绳索', 'band':'弹力带', 'resistance band':'弹力带',
  'leverage machine':'器械', 'smith machine':'史密斯机', 'stability ball':'瑜伽球',
  'bosu ball':'波速球', 'weighted':'负重', 'ez barbell':'EZ杠铃', 'assisted':'辅助',
  'sled machine':'雪橇机', 'medicine ball':'药球', 'roller':'泡沫轴', 'hammer':'锤',
  'tire':'轮胎', 'trap bar':'六角杠', 'olympic barbell':'奥杠',
  'wheel roller':'健腹轮', 'upper body ergometer':'上肢测功仪', 'skierg machine':'滑雪机',
  'stationary bike':'固定单车', 'elliptical machine':'椭圆机', 'stepmill machine':'楼梯机'
};

/* ================= target 中文标签 ================= */
const TARGET_LABELS = {
  'abs':'腹肌', 'pectorals':'胸肌', 'biceps':'肱二头肌', 'triceps':'肱三头肌',
  'glutes':'臀肌', 'delts':'三角肌', 'upper back':'上背', 'lats':'背阔肌',
  'calves':'小腿', 'quads':'股四头肌', 'forearms':'前臂', 'hamstrings':'腘绳肌',
  'cardiovascular system':'心肺', 'spine':'脊柱', 'traps':'斜方肌',
  'adductors':'内收肌', 'abductors':'外展肌', 'serratus anterior':'前锯肌',
  'levator scapulae':'肩胛提肌'
};

/* ================= 一级分类（截图 16 类） =================
 * match(ex)：由数据集 body_part / target / name 判定
 * 顺序即优先级：窄分类（serratus/traps/glutes/biceps/triceps）在前，
 * 宽分类（back/legs/waist）在后，避免被宽分类抢走
 */
const BODY_PARTS = [
  { key:'all', label:'全部', sub:[], match:()=>true },

  // 前锯肌（窄，back 中 target=serratus anterior）
  { key:'serratus', label:'前锯肌', sub:[{ key:'serratus_all', label:'整体', muscleHint:[] }],
    match:(ex)=> (ex.target||'') === 'serratus anterior' },

  // 斜方肌（back 中 target=traps 或耸肩）
  { key:'traps', label:'斜方肌', sub:[
      { key:'traps_up', label:'上束', muscleHint:[] },
      { key:'traps_mid', label:'中束', muscleHint:[] },
      { key:'traps_dn', label:'下束', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'back'
      && ((ex.target||'') === 'traps' || /shrug|耸肩/i.test(ex.name||'')) },

  // 背（back 中非斜方肌/前锯肌的其余）
  { key:'back', label:'背部', sub:[
      { key:'lats',            label:'背阔', muscleHint:[] },
      { key:'mid_back',        label:'中背', muscleHint:[] },
      { key:'spinal_erectors', label:'竖脊', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'back'
      && !((ex.target||'') === 'serratus anterior')
      && !((ex.target||'') === 'traps')
      && !/shrug|耸肩/i.test(ex.name||'') },

  // 胸
  { key:'chest', label:'胸部', sub:[
      { key:'upper_chest',     label:'上胸',   muscleHint:[] },
      { key:'mid_lower_chest', label:'中下胸', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'chest' },

  // 肩
  { key:'shoulder', label:'肩部', sub:[
      { key:'deltoid_ant', label:'前束', muscleHint:[] },
      { key:'deltoid_mid', label:'中束', muscleHint:[] },
      { key:'deltoid_pos', label:'后束', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'shoulders' },

  // 二头 / 三头（upper arms 按 target 拆）
  { key:'biceps', label:'二头', sub:[
      { key:'biceps_long',  label:'长头', muscleHint:[] },
      { key:'biceps_short', label:'短头', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'upper arms' && (ex.target||'') === 'biceps' },
  { key:'triceps', label:'三头', sub:[
      { key:'triceps_long', label:'长头',   muscleHint:[] },
      { key:'triceps_lat',  label:'外侧头', muscleHint:[] },
      { key:'triceps_med',  label:'内侧头', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'upper arms' && (ex.target||'') === 'triceps' },

  // 前臂（lower arms）
  { key:'forearms', label:'前臂', sub:[{ key:'forearms_all', label:'整体', muscleHint:[] }],
    match:(ex)=> ex.body_part_raw === 'lower arms' },

  // 臀（upper legs 中 target=glutes）
  { key:'glutes', label:'臀部', sub:[
      { key:'glute_max', label:'臀大', muscleHint:[] },
      { key:'glute_med', label:'臀中', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'upper legs' && (ex.target||'') === 'glutes' },

  // 腿（upper legs 中非臀）
  { key:'legs', label:'腿部', sub:[
      { key:'quads',      label:'股四头', muscleHint:[] },
      { key:'hamstrings', label:'腘绳',   muscleHint:[] },
      { key:'adductors',  label:'内收',   muscleHint:[] },
      { key:'abductors',  label:'外展',   muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'upper legs' && (ex.target||'') !== 'glutes' },

  // 小腿（lower legs）
  { key:'calves', label:'小腿', sub:[
      { key:'gastroc', label:'腓肠',   muscleHint:[] },
      { key:'soleus',  label:'比目鱼', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'lower legs' },

  // 核心稳定（waist 中的核心稳定类动作，按名字启发）
  { key:'core', label:'核心稳定', sub:[
      { key:'anti_ext', label:'抗伸展', muscleHint:[] },
      { key:'anti_rot', label:'抗旋转', muscleHint:[] },
      { key:'anti_lat', label:'抗侧屈', muscleHint:[] }
    ],
    match:(ex)=> {
      if (ex.body_part_raw !== 'waist') return false;
      const n = (ex.name||'').toLowerCase();
      return /plank|pallof|hollow|dead bug|bird dog|dead-bug|bird-dog|rotation|旋转|march/i.test(n);
    } },

  // 腹部（waist 其余）
  { key:'abs', label:'腹部', sub:[
      { key:'rectus', label:'腹直', muscleHint:[] },
      { key:'oblq',   label:'腹斜', muscleHint:[] },
      { key:'trans',  label:'腹横', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'waist' },

  // 有氧（数据集 body_part=cardio）
  { key:'functional', label:'有氧', sub:[{ key:'func_all', label:'整体', muscleHint:[] }],
    match:(ex)=> ex.body_part_raw === 'cardio' },

  // 颈
  { key:'neck', label:'颈部', sub:[
      { key:'neck_flex', label:'颈屈', muscleHint:[] },
      { key:'neck_ext',  label:'颈伸', muscleHint:[] }
    ],
    match:(ex)=> ex.body_part_raw === 'neck' },

  // 拉伸（数据集无独立分类，保留占位；未来若有 stretch 数据接入）
  { key:'stretch', label:'拉伸', sub:[
      { key:'stretch_upper', label:'上肢', muscleHint:[] },
      { key:'stretch_lower', label:'下肢', muscleHint:[] },
      { key:'stretch_trunk', label:'躯干', muscleHint:[] }
    ],
    match:()=>false }
];

/* ================= 二级打标（target + 名字启发） ================= */
function classifyExercise(ex){
  // 兼容：body_part_raw 未设置时（未经过 enrichExerciseList）以当前 body_part 为原始值
  if (ex.body_part_raw === undefined) ex.body_part_raw = ex.body_part;
  const name = (ex.name||'').toLowerCase();
  const id   = (ex.id  ||'').toLowerCase();
  const hit  = (s)=> name.includes(s) || id.includes(s);

  let body_part = null, body_subpart = null;
  for (const g of BODY_PARTS){
    if (g.key === 'all') continue;
    if (g.match(ex)){ body_part = g.key; break; }
  }
  if (!body_part) body_part = 'functional'; // 兜底

  const target = (ex.target||'').toLowerCase();

  if (body_part === 'chest'){
    body_subpart = hit('incl') || hit('上斜') ? 'upper_chest' : 'mid_lower_chest';
  }
  else if (body_part === 'back'){
    if (target === 'lats')                    body_subpart = 'lats';
    else if (target === 'spine')              body_subpart = 'spinal_erectors';
    else if (target === 'upper back')         body_subpart = 'mid_back';
    else if (hit('row') || hit('划船'))        body_subpart = 'mid_back';
    else                                      body_subpart = 'mid_back';
  }
  else if (body_part === 'traps'){
    body_subpart = hit('shrug') || hit('耸肩') ? 'traps_up' : 'traps_mid';
  }
  else if (body_part === 'shoulder'){
    if (hit('rear') || hit('后'))                 body_subpart = 'deltoid_pos';
    else if (hit('front') || hit('前') || hit('press')) body_subpart = 'deltoid_ant';
    else if (hit('lateral') || hit('侧'))          body_subpart = 'deltoid_mid';
    else                                          body_subpart = 'deltoid_mid';
  }
  else if (body_part === 'biceps'){
    body_subpart = hit('preacher') || hit('集中') || hit('concentration') ? 'biceps_short' : 'biceps_long';
  }
  else if (body_part === 'triceps'){
    if (hit('overhead') || hit('碎颅') || hit('skull')) body_subpart = 'triceps_long';
    else if (hit('kickback') || hit('俯身'))             body_subpart = 'triceps_med';
    else                                                body_subpart = 'triceps_lat';
  }
  else if (body_part === 'legs'){
    if (target === 'quads')                   body_subpart = 'quads';
    else if (target === 'hamstrings')         body_subpart = 'hamstrings';
    else if (target === 'adductors')          body_subpart = 'adductors';
    else if (target === 'abductors')          body_subpart = 'abductors';
    else if (target === 'calves')             body_subpart = 'calves';
    else                                      body_subpart = 'quads';
  }
  else if (body_part === 'glutes'){
    body_subpart = hit('medius') || hit('臀中') ? 'glute_med' : 'glute_max';
  }
  else if (body_part === 'calves'){
    body_subpart = hit('seated') || hit('坐姿') || hit('leg press') ? 'soleus' : 'gastroc';
  }
  else if (body_part === 'abs'){
    if (hit('oblique') || hit('侧') || hit('twist') || hit('扭转')) body_subpart = 'oblq';
    else if (hit('transverse'))                 body_subpart = 'trans';
    else                                        body_subpart = 'rectus';
  }
  else if (body_part === 'core'){
    if (hit('pallof') || hit('rotation') || hit('旋转') || hit('bird dog') || hit('bird-dog'))
                                                body_subpart = 'anti_rot';
    else if (hit('side') || hit('侧'))          body_subpart = 'anti_lat';
    else                                        body_subpart = 'anti_ext';
  }
  else if (body_part === 'serratus')   body_subpart = 'serratus_all';
  else if (body_part === 'forearms')   body_subpart = 'forearms_all';
  else if (body_part === 'functional') body_subpart = 'func_all';
  else if (body_part === 'neck')       body_subpart = 'neck_ext';
  else if (body_part === 'stretch')    body_subpart = 'stretch_trunk';

  return { body_part, body_subpart };
}

/* ================= 暴露 ================= */
function enrichExerciseList(list){
  (list||[]).forEach(ex => {
    ex.body_part_raw = ex.body_part; // 原始数据集枚举（10 类）
    const c = classifyExercise(ex);
    ex.body_part    = c.body_part;
    ex.body_subpart = c.body_subpart;
    ex.equip_key    = equipKey(ex.equipment);
  });
  return list;
}

window.BODY_PARTS = BODY_PARTS;
window.EQUIP_LABELS = EQUIP_LABELS;
window.TARGET_LABELS = TARGET_LABELS;
window.equipKey = equipKey;
window.classifyExercise = classifyExercise;
window.enrichExerciseList = enrichExerciseList;
