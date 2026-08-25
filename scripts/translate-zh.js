/* ============================================================
 * translate-zh.js — 给 exercises-dataset-main 补充中文动作名
 * 读 data/exercises-dataset-main/data/exercises.json
 * 为每条记录添加 name_zh（词根词典翻译 + override 人工修正）
 * 用法: node scripts/translate-zh.js
 * ============================================================ */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'exercises-dataset-main', 'data', 'exercises.json');

/* ============ 词典（按词长度降序匹配，先长后短） ============ */
const DICT = [
  // —— 装备（长词优先）——
  ['upper body ergometer','上肢测功仪'], ['elliptical machine','椭圆机'], ['stepmill machine','楼梯机'],
  ['skierg machine','滑雪机'], ['stationary bike','固定单车'], ['stability ball','瑜伽球'],
  ['medicine ball','药球'], ['smith machine','史密斯机'], ['resistance band','弹力带'],
  ['bosu ball','波速球'], ['olympic barbell','奥杠'], ['wheel roller','健腹轮'],
  ['kettlebell','壶铃'], ['dumbbell','哑铃'], ['barbell','杠铃'], ['trap bar','六角杠'],
  ['ez barbell','EZ杠铃'], ['body weight','自重'], ['weighted','负重'], ['cable','绳索'],
  ['band','弹力带'], ['rope','绳索'], ['roller','泡沫轴'], ['hammer','锤'], ['tire','轮胎'],
  ['sled machine','雪橇机'], ['assisted','辅助'], ['with towel','毛巾辅助'], ['with ball','球辅助'],
  // —— 复合动作（两词以上优先）——
  ['bench press','卧推'], ['shoulder press','肩推'], ['overhead press','过顶推举'],
  ['push-up','俯卧撑'], ['push up','俯卧撑'], ['pull-up','引体向上'], ['pull up','引体向上'],
  ['chin-up','反握引体向上'], ['chin up','反握引体向上'], ['deadlift','硬拉'],
  ['hip thrust','臀推'], ['calf raise','提踵'], ['heel raise','提踵'], ['toe touch','触脚尖'],
  ['good morning','早安式'], ['leg raise','举腿'], ['leg raises','举腿'], ['mountain climber','登山跑'],
  ['jumping jack','开合跳'], ['jumping jacks','开合跳'], ['lateral raise','侧平举'],
  ['front raise','前平举'], ['rear delt','后束'], ['hammer curl','锤式弯举'],
  ['preacher curl','牧师凳弯举'], ['concentration curl','集中弯举'], ['reverse curl','反握弯举'],
  ['reverse-grip','反握'], ['overhand','正握'], ['underhand','反握'], ['close-grip','窄握'],
  ['wide-grip','宽握'], ['cross-over','交叉'], ['cross over','交叉'], ['single-arm','单臂'],
  ['single arm','单臂'], ['one-arm','单臂'], ['one arm','单臂'], ['alternating','交替'],
  ['triceps extension','三头臂屈伸'], ['triceps dip','三头臂屈伸'], ['chest dip','双杠臂屈伸'],
  ['dip (kneeling)','跪姿臂屈伸'], ['leg press','腿举'], ['knee raise','提膝'], ['knee raises','提膝'],
  ['side bend','侧屈'], ['side plank','侧平板支撑'], ['plank','平板支撑'], ['back lever','背悬垂'],
  ['front lever','前悬垂'], ['hyperextension','背伸展'], ['back extension','背伸展'],
  ['leg curl','腿弯举'], ['leg extension','腿屈伸'], ['hip abduction','髋外展'],
  ['hip abduction','髋外展'], ['hip adduction','髋内收'], ['hip flexor','髋屈肌'],
  ['hip flexors','髋屈肌'], ['russian twist','俄罗斯转体'], ['trunk rotation','躯干旋转'],
  ['trunk twist','躯干扭转'], ['good mornings','早安式'], ['squat','深蹲'], ['deadlift','硬拉'],
  ['lunge','弓步'], ['lunges','弓步'], ['split squat','分腿蹲'], ['bulgarian split squat','保加利亚分腿蹲'],
  ['wall sit','靠墙静蹲'], ['leg press','腿举'], ['step-up','上台阶'], ['step up','上台阶'],
  ['step-down','下台阶'], ['step down','下台阶'], ['glute bridge','臀桥'], ['bridge','臀桥'],
  ['bird dog','鸟狗式'], ['dead bug','死虫式'], ['wall slide','墙滑'], ['wall push-up','墙俯卧撑'],
  ['wall push up','墙俯卧撑'], ['shoulder tap','肩触'], ['pike push-up','折体俯卧撑'],
  ['pike push up','折体俯卧撑'], ['diamond push-up','钻石俯卧撑'], ['diamond push up','钻石俯卧撑'],
  ['archer push-up','弓箭手俯卧撑'], ['archer push up','弓箭手俯卧撑'], ['archer pull-up','弓箭手引体'],
  ['archer pull up','弓箭手引体'], ['pullover','上拉'], ['face pull','面拉'], ['face pull','面拉'],
  ['lateral pulldown','侧下拉'], ['pulldown','下拉'], ['lat pulldown','高位下拉'],
  ['chest press','胸推'], ['cable fly','绳索飞鸟'], ['cable fly','绳索飞鸟'], ['fly','飞鸟'],
  ['flies','飞鸟'], ['chest fly','夹胸'], ['chest squeeze','胸夹'], ['chest stretch','胸部拉伸'],
  ['back stretch','背部拉伸'], ['leg stretch','腿部拉伸'], ['calf stretch','小腿拉伸'],
  ['hamstring stretch','腘绳肌拉伸'], ['quadriceps stretch','股四头肌拉伸'], ['quads stretch','股四头肌拉伸'],
  ['hip stretch','髋部拉伸'], ['glute stretch','臀部拉伸'], ['glutes stretch','臀部拉伸'],
  ['shoulder stretch','肩部拉伸'], ['neck stretch','颈部拉伸'], ['arm stretch','手臂拉伸'],
  ['triceps stretch','三头拉伸'], ['biceps stretch','二头拉伸'], ['adductor stretch','内收肌拉伸'],
  ['piriformis stretch','梨状肌拉伸'], ['stretch','拉伸'], ['stretching','拉伸'],
  ['yoga','瑜伽'], ['twist','扭转'], ['rotation','旋转'], ['rotations','旋转'],
  ['abduction','外展'], ['adduction','内收'], ['extension','臂屈伸'], ['curl','弯举'],
  ['curls','弯举'], ['row','划船'], ['rows','划船'], ['shrug','耸肩'], ['shrugs','耸肩'],
  ['swing','摆荡'], ['swings','摆荡'], ['clean','高翻'], ['snatch','抓举'], ['jerk','挺举'],
  ['press','推举'], ['push','推'], ['pull','拉'], ['kickback','俯身臂屈伸'], ['kickbacks','俯身臂屈伸'],
  ['dip','臂屈伸'], ['dips','臂屈伸'], ['sit-up','仰卧起坐'], ['sit up','仰卧起坐'], ['sit-ups','仰卧起坐'],
  ['crunch','卷腹'], ['crunches','卷腹'], ['crunchy','卷腹'], ['hold','支撑'], ['holds','支撑'],
  ['march','行军步'], ['skater','滑冰步'], ['skaters','滑冰步'], ['jump','跳'], ['jumps','跳'],
  ['hop','单脚跳'], ['hops','单脚跳'], ['burpee','波比跳'], ['burpees','波比跳'], ['lunge','弓步'],
  ['balance','平衡'], ['bend','屈体'], ['bends','屈体'], ['circle','绕环'], ['circles','绕环'],
  ['roll','滚动'], ['rolls','滚动'], ['walk','走'], ['walks','走'], ['step','踏步'], ['steps','踏步'],
  ['climb','攀爬'], ['climbs','攀爬'], ['pike','折体'], ['tuck','团身'], ['straddle','分腿'],
  ['hanging','悬垂'], ['hangs','悬垂'], ['hang','悬垂'],
  // —— 身体部位 ——
  ['pectoralis major','胸大肌'], ['pectorals','胸肌'], ['pectoral','胸肌'], ['chest','胸部'],
  ['latissimus dorsi','背阔肌'], ['lats','背阔肌'], ['lat','背阔肌'], ['back','背部'],
  ['trapezius','斜方肌'], ['traps','斜方肌'], ['rhomboids','菱形肌'], ['rhomboid','菱形肌'],
  ['erector spinae','竖脊肌'], ['quadratus lumborum','腰方肌'], ['serratus anterior','前锯肌'],
  ['levator scapulae','肩胛提肌'], ['rotator cuff','肩袖'], ['deltoid','三角肌'], ['deltoids','三角肌'],
  ['front delt','前束'], ['rear delt','后束'], ['gluteus maximus','臀大肌'], ['gluteus medius','臀中肌'],
  ['gluteus','臀肌'], ['glutes','臀部'], ['glute','臀部'], ['hamstring','腘绳肌'], ['hamstrings','腘绳肌'],
  ['quadriceps','股四头肌'], ['quads','股四头肌'], ['rectus femoris','股直肌'],
  ['gastrocnemius','腓肠肌'], ['soleus','比目鱼肌'], ['calf','小腿'], ['calves','小腿'],
  ['adductor','内收肌'], ['adductors','内收肌'], ['abductor','外展肌'], ['abductors','外展肌'],
  ['iliopsoas','髂腰肌'], ['psoas','腰大肌'], ['piriformis','梨状肌'], ['biceps','二头肌'],
  ['triceps','三头肌'], ['forearm','前臂'], ['forearms','前臂'], ['abdominals','腹肌'],
  ['abdominal','腹部'], ['abs','腹肌'], ['oblique','腹斜肌'], ['obliques','腹斜肌'],
  ['transverse abdominis','腹横肌'], ['core','核心'], ['spine','脊柱'], ['neck','颈部'],
  ['shoulder','肩部'], ['shoulders','肩部'], ['elbow','肘部'], ['wrist','手腕'], ['ankle','脚踝'],
  ['ankles','脚踝'], ['knee','膝部'], ['knees','膝部'], ['hip','髋部'], ['hips','髋部'],
  ['leg','腿'], ['legs','腿部'], ['arm','手臂'], ['arms','手臂'], ['feet','双脚'], ['foot','脚'],
  ['hand','手'], ['hands','双手'], ['toe','脚尖'], ['toes','脚尖'], ['heel','脚跟'], ['heels','脚跟'],
  // —— 修饰词 ——
  ['incline','上斜'], ['decline','下斜'], ['flat','平板'], ['seated','坐姿'], ['standing','站姿'],
  ['lying','仰卧'], ['prone','俯卧'], ['side-lying','侧卧'], ['side lying','侧卧'], ['side','侧向'],
  ['kneeling','跪姿'], ['half','半程'], ['full','全程'], ['straight','直'], ['bent','屈'],
  ['lateral','侧向'], ['rear','后'], ['front','前'], ['lower','下'], ['upper','上'], ['high','高'],
  ['low','低'], ['deep','深'], ['wide','宽'], ['narrow','窄'], ['open','开'], ['closed','闭'],
  ['single','单'], ['double','双'], ['both','双'], ['two','双'], ['one','单'], ['other','另一侧'],
  ['left','左侧'], ['right','右侧'], ['alternate','交替'], ['alternating','交替'],
  ['forward','向前'], ['backward','向后'], ['upward','向上'], ['downward','向下'],
  ['horizontal','水平'], ['vertical','垂直'], ['diagonal','对角'], ['circular','环绕'],
  ['explosive','爆发式'], ['controlled','控制式'], ['strict','严格'], ['fast','快速'],
  ['slow','慢速'], ['dynamic','动态'], ['static','静态'], ['active','主动'], ['passive','被动'],
  ['reverse','反向'], ['inverted','倒置'], ['assisted','辅助'], ['unassisted','无辅助'],
  ['weighted','负重'], ['bodyweight','自重'], ['body weight','自重'], ['with','带'], ['and','和'],
  ['air','空中'], ['wall','靠墙'], ['floor','地面'], ['ground','地面'], ['ball','球'],
  ['bar','杠'], ['bench','长凳'], ['chair','椅子'], ['box','跳箱'], ['step','台阶'],
  ['machine','器械'], ['cable','绳索'], ['smith','史密斯'], ['towel','毛巾'],
  // —— 常见动作名词根 ——
  ['press-up','俯卧撑'], ['press up','俯卧撑'], ['push-up','俯卧撑'], ['push up','俯卧撑'],
  ['press','推举'], ['pull','拉'], ['curl','弯举'], ['raise','平举'], ['raises','平举'],
  ['fly','飞鸟'], ['flies','飞鸟'], ['row','划船'], ['rows','划船'], ['pull-up','引体向上'],
  ['chin-up','反握引体'], ['deadlift','硬拉'], ['squat','深蹲'], ['squats','深蹲'], ['lunge','弓步'],
  ['lunges','弓步'], ['sit-up','仰卧起坐'], ['sit up','仰卧起坐'], ['crunch','卷腹'],
  ['crunches','卷腹'], ['plank','平板支撑'], ['bridge','臀桥'], ['dip','臂屈伸'], ['dips','臂屈伸'],
  ['extension','伸展'], ['extensions','伸展'], ['stretch','拉伸'], ['stretches','拉伸'],
  ['twist','扭转'], ['twists','扭转'], ['rotation','旋转'], ['rotations','旋转'],
  ['swing','摆荡'], ['swings','摆荡'], ['shrug','耸肩'], ['shrugs','耸肩'], ['jump','跳跃'],
  ['jumps','跳跃'], ['hop','跳'], ['hops','跳'], ['walk','行走'], ['walking','行走'],
  ['step','踏步'], ['stepping','踏步'], ['march','行进'], ['marching','行进'], ['climb','爬'],
  ['climbing','爬'], ['roll','滚动'], ['rolling','滚动'], ['hold','支撑'], ['holds','支撑'],
  ['touch','触'], ['touches','触'], ['reach','够'], ['reaches','够'], ['lift','提举'],
  ['lifts','提举'], ['raise','抬起'], ['raises','抬起'], ['kick','踢'], ['kicks','踢'],
  ['punch','冲拳'], ['punches','冲拳'], ['slam','砸'], ['slams','砸'], ['throw','抛'],
  ['throws','抛'], ['catch','接'], ['pass','传'], ['passes','传'], ['bounce','弹'],
  ['bounces','弹'], ['toss','轻抛'], ['tosses','轻抛'],
  // —— 数字/符号 ——
  ['3/4','3/4'], ['45°','45度'], ['45','45度'], ['90/90','90/90'], ['90 degree','90度'],
  ['180','180度'], ['360','360度'], ['(male)','（男）'], ['(female)','（女）'],
  ['(with towel)','（毛巾）'], ['(kneeling)','（跪姿）'], ['v. 2',''], ['v.2',''],
  // —— 二轮补充（高频未识别词）——
  ['throw down','抛落'], ['bent over','俯身'], ['stiff leg','直腿'], ['stiff-leg','直腿'],
  ['skull crusher','碎颅式'], ['skull-crusher','碎颅式'], ['pallof press','帕洛夫推举'],
  ['hack squat','哈克深蹲'], ['zercher squat','泽奇深蹲'], ['jefferson deadlift','杰斐逊硬拉'],
  ['guillotine press','断头台式卧推'], ['drag curl','拖拽弯举'], ['reverse hyper','反向背伸展'],
  ['reverse hyperextension','反向背伸展'], ['internal rotation','内旋'], ['external rotation','外旋'],
  ['bicycle crunch','空中蹬车卷腹'], ['jack knife','折刀'], ['jack-knife','折刀'],
  ['knife hold','折刀支撑'], ['wall walk','墙行走'], ['pistol squat','手枪深蹲'],
  ['glute ham raise','臀腿后抬'], ['glute-ham raise','臀腿后抬'], ['leg raise','举腿'],
  ['toe raise','提脚尖'], ['hip hinge','髋铰链'], ['dead hang','静悬垂'],
  ['scapular pull-up','肩胛引体'], ['scapular push-up','肩胛俯卧撑'], ['inverted row','反向划船'],
  ['landmine press','地雷管推举'], ['landmine','地雷管'], ['turkish get-up','土耳其起立'],
  ['turkish sit-up','土耳其起立'], ['suitcase carry','提箱行走'], ['farmer carry','农夫行走'],
  ['farmer walk','农夫行走'], ['bear crawl','熊爬'], ['crab walk','蟹行'], ['duck walk','鸭步'],
  ['zottman curl','佐特曼弯举'], ['spider curl','蜘蛛弯举'], ['bayesian curl','贝叶斯弯举'],
  ['cable curl','绳索弯举'], ['barber curl','理发椅弯举'], ['cambered bar','弧形杠'],
  ['romanian deadlift','罗马尼亚硬拉'], ['stiff leg deadlift','直腿硬拉'],
  ['sumo deadlift','相扑硬拉'], ['trap bar deadlift','六角杠硬拉'], ['snatch grip','抓举握'],
  ['clean grip','高翻握'], ['front squat','前蹲'], ['back squat','后蹲'], ['box squat','箱式深蹲'],
  ['goblet squat','高脚杯深蹲'], ['overhead squat','过顶深蹲'], ['sissy squat','西斯深蹲'],
  ['bulgarian squat','保加利亚蹲'], ['split jump','分腿跳'], ['jump squat','跳跃深蹲'],
  ['squat jump','深蹲跳'], ['broad jump','立定跳远'], ['long jump','跳远'], ['box jump','跳箱'],
  ['depth jump','深度跳'], ['lateral lunge','侧弓步'], ['reverse lunge','后撤弓步'],
  ['walking lunge','行走弓步'], ['curtsy lunge','屈膝礼弓步'], ['barbell lunge','杠铃弓步'],
  ['dumbbell lunge','哑铃弓步'], ['hip thrust','臀推'], ['glute kickback','臀踢'],
  ['donkey kick','驴踢'], ['fire hydrant','消防栓'], ['clamshell','蚌式'], ['clams','蚌式'],
  ['leg lowering','举腿下落'], ['leg lowers','举腿下落'], ['flutter kick','交替打腿'],
  ['scissor kick','剪刀踢'], ['superman','超人式'], ['cobra','眼镜蛇式'], ['cat cow','猫牛式'],
  ['child pose','婴儿式'], ['childs pose','婴儿式'], ['downward dog','下犬式'],
  ['upward dog','上犬式'], ['warrior','战士式'], ['tree pose','树式'], ['mountain pose','山式'],
  ['low lunge','低弓步'], ['half moon','半月式'], ['butterfly','蝴蝶式'], ['seated forward','坐姿前屈'],
  ['forward fold','前屈'], ['hamstring fold','腘绳前屈'], ['figure four','四字拉伸'],
  ['pigeon pose','鸽子式'], ['happy baby','快乐婴儿式'], ['shoulder bridge','肩桥'],
  ['shoulder stand','肩倒立'], ['handstand','手倒立'], ['headstand','头倒立'],
  ['wall handstand','靠墙手倒立'], ['handstand push-up','倒立俯卧撑'], ['cartwheel','侧手翻'],
  ['somersault','前滚翻'], ['rollout','滚轮'], ['ab rollout','健腹轮'], ['ab wheel','健腹轮'],
  ['wheel rollout','健腹轮'], ['russian twist','俄罗斯转体'], ['windmill','风车'],
  ['turkish get-up','土耳其起立'], ['suitcase deadlift','提箱硬拉'], ['snatch','抓举'],
  ['clean and jerk','高翻挺举'], ['clean and press','高翻推举'], ['muscle-up','双力臂'],
  ['muscle up','双力臂'], ['kipping','摆动式'], ['toes to bar','触杠举腿'], ['toes-to-bar','触杠举腿'],
  ['leg tuck','团身举腿'], ['hollow hold','空心支撑'], ['hollow body','空心体'],
  ['arch hold','弓形支撑'], ['candlestick','烛台式'], ['l-sit','L字支撑'], ['v-sit','V字支撑'],
  ['dragon flag','龙旗'], ['front lever','前水平'], ['back lever','后水平'], ['planche','俄挺'],
  ['human flag','人体旗'], ['muscle snatch','肌肉抓举'], ['push jerk','推挺'], ['split jerk','分腿挺'],
  ['power clean','力量翻'], ['power snatch','力量抓'], ['hang clean','悬垂翻'], ['hang snatch','悬垂抓'],
  ['high pull','高拉'], ['upright row','直立划船'], ['face pull','面拉'], ['face-pull','面拉'],
  ['bent-over row','俯身划船'], ['pendlay row','潘德雷划船'], ['yates row','耶茨划船'],
  ['seal row','海豹划船'], ['meadows row','梅多斯划船'], ['chest supported row','胸托划船'],
  ['cable row','绳索划船'], ['seated row','坐姿划船'], ['single arm row','单臂划船'],
  ['renegade row','叛徒划船'], ['t bar row','T杠划船'], ['t-bar row','T杠划船'],
  ['lat pulldown','高位下拉'], ['straight arm pulldown','直臂下拉'], ['straight-arm pulldown','直臂下拉'],
  ['close grip pulldown','窄握下拉'], ['behind neck pulldown','颈后下拉'],
  ['neutral grip','中立握'], ['pronated grip','正握'], ['supinated grip','反握'],
  ['mixed grip','混合握'], ['hook grip','锁握'], ['false grip','空握'], ['thumbless','无拇指握'],
  ['cuff','肩袖'], ['internal','内旋'], ['external','外旋'], ['blaster','哑铃摆'], ['pov','视角'],
  ['astride','分腿'], ['parallel','平行'], ['sitted','坐姿'], ['seated','坐姿'], ['twisting','扭转'],
  ['plyo','爆发式'], ['rollerer','滚轮'], ['skull','碎颅'], ['hack','哈克'], ['zercher','泽奇'],
  ['guillotine','断头台式'], ['jefferson','杰斐逊'], ['drag','拖拽'], ['stiff','直腿'],
  ['overhead','过顶'], ['bicycle','单车'], ['fixed','固定'], ['wheel','轮'], ['jack','折刀'],
  ['knife','折刀'], ['male','男'], ['female','女'], ['board','板'], ['through','贯穿'],
  ['down','下落'], ['over','上方'], ['grip','握距'], ['close','窄'], ['wide','宽'],
  ['pushdown','下压'], ['pressdown','下压'], ['extension','伸展'], ['extensions','伸展'],
  ['raise','抬起'], ['raises','抬起'], ['lowering','下落'], ['lowers','下落'], ['pullover','上拉'],
  ['plank','平板支撑'], ['bird','鸟'], ['dog','狗式'], ['bug','虫式'], ['tuck','团身'],
  ['pike','折体'], ['straddle','分腿'], ['split','分腿'], ['kneel','跪'], ['kneeling','跪姿'],
  ['walking','行走'], ['standing','站姿'], ['seated','坐姿'], ['lying','仰卧'], ['prone','俯卧'],
  ['supine','仰卧'], ['dorsal','背向'], ['ventral','腹向'], ['oblique','腹斜肌'],
  ['rectus','腹直肌'], ['transverse','腹横肌'], ['serratus','前锯肌'], ['scapulae','肩胛'],
  ['scapula','肩胛'], ['trapezius','斜方肌'], ['trap','斜方肌'], ['deltoid','三角肌'],
  ['bicep','二头'], ['biceps','二头'], ['tricep','三头'], ['triceps','三头'], ['forearm','前臂'],
  ['forearms','前臂'], ['gastrocnemius','腓肠肌'], ['soleus','比目鱼肌'], ['tibialis','胫骨前肌'],
  ['tibial','胫骨'], ['shin','胫骨'], ['achilles','跟腱'], ['patellar','髌骨'], ['iliotibial','髂胫束'],
  ['piriformis','梨状肌'], ['psoas','腰大肌'], ['iliopsoas','髂腰肌'], ['glute','臀肌'],
  ['glutes','臀部'], ['glut','臀'], ['quads','股四头'], ['quad','股四头'], ['hamstring','腘绳'],
  ['hamstrings','腘绳'], ['adductors','内收'], ['adductor','内收'], ['abductors','外展'],
  ['abductor','外展'], ['calf','小腿'], ['calves','小腿'], ['neck','颈部'], ['shoulders','肩部'],
  ['shoulder','肩部'], ['elbows','肘部'], ['elbow','肘部'], ['wrists','手腕'], ['wrist','手腕'],
  ['ankles','脚踝'], ['ankle','脚踝'], ['knees','膝部'], ['knee','膝部'], ['hips','髋部'],
  ['hip','髋部'], ['spine','脊柱'], ['core','核心'], ['abs','腹肌'], ['abdominals','腹肌'],
  ['abdominal','腹部'], ['body','身体'], ['torso','躯干'], ['trunk','躯干'], ['upper body','上半身'],
  ['lower body','下半身'], ['full body','全身'], ['legs','腿部'], ['leg','腿部'], ['arms','手臂'],
  ['arm','手臂'], ['hands','双手'], ['hand','单手'], ['feet','双脚'], ['foot','单脚'],
  ['toes','脚尖'], ['toe','脚尖'], ['heels','脚跟'], ['heel','脚跟'], ['fingers','手指'],
  ['toes','脚尖'], ['toe','脚尖'], ['heels','脚跟'], ['heel','脚跟'], ['fingers','手指'],
  ['with',''], ['without','无'], ['and','和'], ['or','或'], ['the',''], ['a',''], ['of',''],
  // —— 三轮补充（高频残留）——
  ['exercise ball','瑜伽球'], ['stability','稳定'], ['on','上'], ['to',''], ['up',''],
  ['ups',''], ['behind neck','颈后'], ['behind head','头后'], ['behind','后'],
  ['military press','军式推举'], ['military','军式'], ['arnold press','阿诺德推举'],
  ['arnold','阿诺德'], ['french press','法式推举'], ['french','法式'], ['zottman','佐特曼'],
  ['sumo deadlift','相扑硬拉'], ['sumo squat','相扑深蹲'], ['sumo','相扑'], ['frog','青蛙式'],
  ['pelvic tilt','骨盆倾斜'], ['pelvic','骨盆'], ['tilt','倾斜'], ['donkey kick','驴踢'],
  ['donkey','驴'], ['chin tuck','下巴后缩'], ['chin','下巴'], ['neutral grip','中立握'],
  ['neutral','中立'], ['inverse row','反向划船'], ['inverse','反向'], ['suspended','悬挂式'],
  ['suspension','悬挂'], ['palms','掌心'], ['palm','掌心'], ['revers','反向'],
  ['inner','内侧'], ['outer','外侧'], ['against wall','靠墙'], ['against','靠'],
  ['attachment','附件'], ['parallel bars','双杠'], ['bars','双杠'], ['bar','杠'],
  ['sled push','雪橇机推'], ['sled drag','雪橇机拖'], ['sled','雪橇机'], ['ez bar','EZ杠'],
  ['ez barbell','EZ杠铃'], ['ez','EZ'], ['cross body','交叉身体'], ['cross','交叉'],
  ['run','跑'], ['running','跑步'], ['rollerout','滚轮'], ['rollout','滚轮'],
  ['support','支撑'], ['stance','站姿'], ['split stance','分腿站'], ['head','头'],
  ['renegade','叛徒'], ['cable attachment','绳索附件'], ['in',''], ['onstability','瑜伽球上'],
  ['exercise','动作'], ['plate loaded','杠铃片加载'], ['plate','杠铃片'], ['loaded','负重'],
  ['isometric','等长'], ['iso','等长'], ['paused','停顿'], ['tempo','节奏'], ['slow','慢速'],
  ['bottoms up','底端停顿'], ['bottom','底部'], ['bottoms','底部'], ['raise','抬起'],
  ['raises','抬起'], ['presses','推举'], ['pressing','推举'], ['pulls','拉'], ['lift','提举'],
  ['lifts','提举'], ['lifting','提举'], ['drag','拖拽'], ['drop','下落'], ['dropping','下落'],
  ['squatting','下蹲'], ['squat','深蹲'], ['squats','深蹲'], ['pose','姿势'], ['poses','姿势'],
  ['range','幅度'], ['extended','延伸'], ['extend','延伸'], ['raised','抬高'], ['twisted','扭转'],
  ['twisting','扭转'], ['twist','扭转'], ['skullcrusher','碎颅式'], ['skull crusher','碎颅式'],
  ['skullcrushers','碎颅式'], ['rocky','洛奇式'], ['bradford','布拉德福德'], ['skier','滑雪式'],
  ['skierg','滑雪机'], ['speed','速度'], ['rocking','摇摆'], ['thruster','火箭推'],
  ['thrusters','火箭推'], ['basic','基础'], ['battling ropes','战绳'], ['battling','战绳'],
  ['ropes','战绳'], ['pin','插销'], ['rack','深蹲架'], ['racks','深蹲架'], ['military','军式'],
  ['palms-in','掌心相对'], ['palms up','掌心向上'], ['palms down','掌心向下'],
  ['overhand grip','正握'], ['underhand grip','反握'], ['close grip','窄握'], ['wide grip','宽握'],
  // —— 四轮补充（lever 等最后残留）——
  ['lever','水平'], ['levers','水平'], ['bent-over','俯身'], ['bent over','俯身'], ['bent','屈'],
  ['over',''], ['under','下方'], ['underhand','反握'], ['from','从'], ['pull ups','引体向上'],
  ['pull ups','引体向上'], ['bodyweight','自重'], ['body weight','自重'], ['bottoms up','底端停顿'],
  ['bottoms','底部'], ['stabilization','稳定'], ['stabilization','稳定'], ['butt','臀部'],
  ['concentration curl','集中弯举'], ['concentration','集中'], ['variation','变式'],
  ['pulley','滑轮'], ['judo','柔道式'], ['flip','翻转'], ['motion','动作'], ['middle','中部'],
  ['rotational','旋转式'], ['pro','专业版'], ['stirrups','马镫'], ['drive','驱动'],
  ['crossover','交叉'], ['elevated','抬高'], ['russian','俄罗斯'], ['pike','折体'],
  ['dead hang','静悬垂'], ['hang','悬垂'], ['hangs','悬垂'], ['hanging','悬垂'],
  ['curl-up','卷腹'], ['curl up','卷腹'], ['jackknife','折刀'], ['jack knife','折刀'],
  ['bicycle','单车'], ['flutter','交替'], ['kick','踢'], ['kicks','踢'], ['scissors','剪刀式'],
  ['stir the pot','搅拌锅'], ['stirring','搅拌'], ['pot','锅'], ['dead bug','死虫式'],
  ['bird dog','鸟狗式'], ['bird-dog','鸟狗式'], ['side-lying','侧卧'], ['clamshell','蚌式'],
  ['shell','蚌式'], ['fire hydrant','消防栓式'], ['hydrant','消防栓式'], ['wall sit','靠墙静蹲'],
  ['wall slide','墙滑'], ['wall press','靠墙推'], ['wall push','靠墙推'], ['wall walk','墙行走'],
  ['wall','靠墙'], ['banded','弹力带'], ['band','弹力带'], ['resistance','阻力'],
  ['isometric hold','等长支撑'], ['isometric','等长'], ['iso','等长'], ['paused','停顿'],
  ['tempo','节奏'], ['tempos','节奏'], ['3-0-3','3-0-3节奏'], ['3-1-1','3-1-1节奏'],
  ['x-band','X弹力带'], ['x band','X弹力带'], ['club','棒铃'], ['clubbell','棒铃'],
  ['mace','锤铃'], ['steel','钢'], ['rope','绳'], ['chain','链条'], ['chains','链条'],
  // —— 五轮：连字符/复数/术语变体 ——
  ['y-raise','Y字平举'], ['y raise','Y字平举'], ['t-raise','T字平举'], ['t-raise','T字平举'],
  ['w-raise','W字平举'], ['pull-ups','引体向上'], ['pullups','引体向上'], ['chin-ups','反握引体'],
  ['push-ups','俯卧撑'], ['pushups','俯卧撑'], ['sit-ups','仰卧起坐'], ['crunches','卷腹'],
  ['squats','深蹲'], ['lunges','弓步'], ['deadlifts','硬拉'], ['rows','划船'], ['curls','弯举'],
  ['raises','平举'], ['flyes','飞鸟'], ['extensions','伸展'], ['stretches','拉伸'],
  ['presses','推举'], ['bottoms-up','底端停顿'], ['bottoms up','底端停顿'],
  ['body-up','身体上抬'], ['body up','身体上抬'], ['butt-ups','臀上抬'], ['butt ups','臀上抬'],
  ['v-bar','V形杠'], ['v bar','V形杠'], ['sz-bar','SZ杠'], ['sz bar','SZ杠'],
  ['ez-bar','EZ杠'], ['ez bar','EZ杠'], ['clean-grip','高翻握'], ['clean grip','高翻握'],
  ['crossovers','交叉'], ['crossover','交叉'], ['wrist roller','腕滚轮'], ['wrist rollerer','腕滚轮'],
  ['wrist roll','腕绕环'], ['arm blaster','手臂固定带'], ['blaster','固定带'],
  ['landmine','地雷管'], ['landmine press','地雷管推举'], ['pin press','插销推举'],
  ['rack pull','架拉'], ['rack pulls','架拉'], ['behind the neck','颈后'], ['behind-neck','颈后'],
  ['behind back','背后'], ['behind-head','头后'], ['head','头'], ['feet-elevated','垫脚'],
  ['feet elevated','垫脚'], ['elevated feet','垫脚'], ['deficit','垫高'], ['deficits','垫高'],
  ['flat bench','平板凳'], ['incline bench','上斜凳'], ['decline bench','下斜凳'],
  ['grip','握距'], ['overhand','正握'], ['underhand','反握'], ['mixed','混合'], ['hook','锁握'],
  ['neutral','中立'], ['pronated','正握'], ['supinated','反握'], ['double overhand','正握'],
  ['alternating grip','混合握'], ['thick bar','粗杠'], ['fat bar','粗杠'], ['fat grip','粗握把'],
  ['farmer','农夫'], ['suitcase','提箱'], ['carry','行走'], ['carries','行走'], ['walk','行走'],
  ['walks','行走'], ['bear','熊'], ['crawl','爬行'], ['crawls','爬行'], ['crab','蟹'],
  ['duck','鸭'], ['fire','消防'], ['hydrant','栓式'], ['skater','滑冰式'], ['skaters','滑冰式'],
  ['mountain','登山'], ['climber','爬'], ['climbers','爬'], ['burpee','波比'], ['burpees','波比'],
  ['tuck jump','团身跳'], ['tuck jumps','团身跳'], ['star jump','星跳'], ['star jumps','星跳'],
  ['squat jump','深蹲跳'], ['squat jumps','深蹲跳'], ['jump squat','跳跃深蹲'],
  ['broad jump','立定跳'], ['broad jumps','立定跳'], ['box jump','跳箱'], ['box jumps','跳箱'],
  ['pistol','手枪'], ['sissy','西斯'], ['goblet','高脚杯'], ['front','前'], ['zercher','泽奇'],
  ['hack','哈克'], ['jefferson','杰斐逊'], ['romanian','罗马尼亚'], ['sumo','相扑'],
  ['conventional','传统式'], ['trap bar','六角杠'], ['stiff-leg','直腿'], ['stiff leg','直腿'],
  ['straight-leg','直腿'], ['straight leg','直腿'], ['single-leg','单腿'], ['single leg','单腿'],
  ['double-leg','双腿'], ['double leg','双腿'], ['one-leg','单腿'], ['one leg','单腿'],
  ['two-leg','双腿'], ['two leg','双腿'], ['bent-leg','屈腿'], ['bent leg','屈腿'],
  ['straight-arm','直臂'], ['straight arm','直臂'], ['bent-arm','屈臂'], ['bent arm','屈臂'],
  ['long arm','长臂'], ['short arm','短臂'], ['high','高'], ['low','低'], ['middle','中'],
  ['inner','内'], ['outer','外'], ['side','侧'], ['front','前'], ['rear','后'], ['upper','上'],
  ['lower','下'], ['top','顶部'], ['bottom','底部'], ['deep','深'], ['shallow','浅'],
  ['full','全程'], ['half','半程'], ['partial','部分'], ['quarter','四分之一'],
  ['seated','坐姿'], ['standing','站姿'], ['lying','仰卧'], ['prone','俯卧'], ['supine','仰卧'],
  ['kneeling','跪姿'], ['crouching','蹲姿'], ['squatting','下蹲'], ['all fours','四肢跪姿'],
  ['on toes','踮脚'], ['on heels','脚跟'], ['on knees','跪姿'], ['on elbows','肘撑'],
  ['on forearms','前臂撑'], ['on hands','手撑'], ['with weight','负重'], ['without weight','无负重']
];

/* 排序：长词优先 */
DICT.sort((a,b)=>b[0].length - a[0].length);

/* 人工修正表（自动翻译不佳的高频动作） */
const OVERRIDE = {
  'air bike': '空中单车',
  'all fours squad stretch': '四肢跪姿臀部拉伸',
  'alternate heel touchers': '交替触脚跟',
  'arm slingers hanging bent knee legs': '悬垂屈膝摆腿',
  'arm slingers hanging straight legs': '悬垂直腿摆臂',
  'arms apart circular toe touch (male)': '分臂环绕触脚尖',
  'arms overhead full sit-up (male)': '双臂过头仰卧起坐',
  'back and forth step': '前后踏步',
  'back pec stretch': '背部胸肌拉伸',
  'back lever': '后水平',
  'assisted motion russian twist': '辅助俄罗斯转体'
};

/* ============ 翻译 ============ */
function translateName(name){
  const lower = name.toLowerCase();
  if (OVERRIDE[lower]) return OVERRIDE[lower];

  let out = lower;
  // 括号内容整体翻译（inner 查词典；查不到则拆词）
  out = out.replace(/\(([^)]*)\)/g, (m, inner)=>{
    const direct = DICT.find(([en])=>en===inner);
    if (direct) return '（'+direct[1]+'）';
    const words = inner.split(' ').map(w=>{
      const hit = DICT.find(([en])=>en===w);
      return hit ? hit[1] : w;
    }).join('');
    return '（'+words+'）';
  });

  // 贪心最长匹配替换（词边界）
  for (const [en, zh] of DICT){
    if (en.includes('(')) continue;
    const re = new RegExp('(?<=^|\\s)' + en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?=\\s|$)', 'g');
    out = out.replace(re, zh);
  }
  // 清理：多余空格 / 空括号 / 版本号 / 首尾 / 中文间空格
  out = out.replace(/\s+/g, ' ')
           .replace(/（\s*）/g, '')
           .replace(/\s+$/g,'').replace(/^\s+/g,'')
           .replace(/([\u4e00-\u9fff0-9])\s+(?=[\u4e00-\u9fff])/g, '$1')
           .replace(/([\u4e00-\u9fff])\s+(?=[A-Za-z0-9])/g, '$1');
  return out.trim();
}

/* ============ 主流程 ============ */
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let done = 0, unmapped = new Set();
data.forEach(e=>{
  const zh = translateName(e.name);
  e.name_zh = zh;
  // 收集仍未翻译的英文 token（长度>2）
  (zh.match(/[a-z]{3,}/g)||[]).forEach(t=>unmapped.add(t));
  done++;
});
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log(`翻译完成: ${done} 条，已写回 ${DATA_FILE}`);
console.log(`未识别英文 token ${unmapped.size} 个:`);
[...unmapped].slice(0,40).forEach(t=>console.log('  -', t));
