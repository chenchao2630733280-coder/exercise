# 训迹 · 动作库 H5（v2）

> **唯一数据源**：[`data/exercises-dataset-main/`](./data/exercises-dataset-main/)（1,324 个动作，数据 + 缩略图 + GIF 动图）
> **产品演进路线**：[`docs/PRODUCT_ROADMAP.md`](./docs/PRODUCT_ROADMAP.md)
> **单一真源设计文档**：[`docs/AI健身教练-产品设计总文档.md`](./docs/AI健身教练-产品设计总文档.md)

## 数据源（data/exercises-dataset-main）

| 内容 | 位置 | 说明 |
|---|---|---|
| 动作数据 | `data/exercises.json` | 1,324 条，含 10 语言说明（中文 `instruction_steps.zh`）、目标肌群、器械 |
| 缩略图 | `images/*.jpg` | 每动作 180×180 |
| 动图 | `videos/*.gif` | 每动作 180×180 动画 GIF |

- 数据/文案 MIT；**媒体 © Gym visual**（页面已保留版权标注）
- 前端 **fetch 异步加载** JSON，运行时打标分类，不复制数据

## 分类体系（16 一级 + 二级）

一级按截图口径（胸/背/肩/二头/三头/前臂/腿/臀/小腿/腹/核心稳定/斜方肌/前锯肌/颈/功能性/拉伸），由 `js/classification.js` 依据数据集 `body_part` + `target` + 名称启发自动归类；二级对应 idea 文档肌肉失衡映射（如 胸 → 上胸/中下胸）。

## 目录结构

```
.
├── index.html               # 入口：列表 + 详情（GIF 动图 + 中文要点）
├── server.js                # 本地静态服务（node http，零依赖）
├── package.json             # 元信息（npm start）
├── README.md
├── css/
│   └── style.css            # 样式（侧栏折叠 / 缩略图卡片 / GIF 详情 / 占位页）
├── js/
│   ├── app.js               # 列表/详情渲染 + 数据加载（v3）
│   └── classification.js    # 分类配置 + 运行时打标（v3）
├── data/
│   └── exercises-dataset-main/   # 唯一数据源（JSON + images + videos + LICENSE）
├── docs/                    # 产品文档
│   ├── PRODUCT_ROADMAP.md        # 集成后的路线图
│   ├── AI健身教练-产品设计总文档.md  # 设计单一真源
│   └── 脑暴.md                    # 推导过程记录
└── .workbuddy/              # 项目记忆（系统目录，勿删）
```

## 跑起来

```bash
npm start        # 或 node server.js
# 浏览器访问 http://localhost:3000
```

## 版本历史

- v2（2026-08-25）：数据源切换为 exercises-dataset-main（1324 条）；GIF 替代 3D viewer；清理 three.js / 采集工具 / 旧数据；目录整理为 css/js/data/docs 结构
- v1（2026-08-18）：3D 动作库（three.js + GLB 模型 + 203 条内置数据）
