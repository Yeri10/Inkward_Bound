# Inkward Bound — 开发流程日志

**中文** | [English](PROCESS_LOG.md)

## 目的

本日志记录 Inkward Bound 在浏览器界面、WebSocket 中继、部署和 TouchDesigner 系统之间的开发过程。它参考 Pippin Barr 的 [The Artist Is Present 2](https://github.com/pippinbarr/the-artist-is-present-2/blob/master/press/README.md) 所采用的过程文档方法：项目介绍不仅展示最终成果，还应链接到过程记录和 Git 历史。

每条记录分别说明：

1. 开发意图或问题；
2. 已完成的工作；
3. 决策及其原因；
4. 仓库中已有的证据；
5. 反思与下一步测试。

## 证据索引

- [完整 Git 提交历史](https://github.com/Yeri10/Inkward_Bound/commits/main)
- [当前浏览器界面](../InkWard_Bound_Interface/public/sketch.js)
- [当前服务器与 WebSocket 中继](../InkWard_Bound_Interface/app.js)
- [当前 TouchDesigner 系统](../InWard%20Bound%20System/InWard%20Bound%20System.toe)
- [TouchDesigner 迭代备份](../InWard%20Bound%20System/Backup)
- [Dataset 拍摄与制作日志](../ink_dataset/DATASET_CAPTURE_LOG.zh-CN.md)
- [Render 在线部署](https://inkward-bound.onrender.com)

## 开发时间线

### 2026 年 5 月 31 日 — 第一版装置草图与初始建模

**开发意图**

将“意识碎片、熵增与重新收敛”的概念转化为空间装置结构，并初步定义观众输入、屏幕分工与声音变化之间的关系。

**已完成工作**

- 绘制第一版装置草图，将互动数据与概念含义对应：按住时长对应注意持续时间，触摸稳定性对应内在静止，点击频率对应躁动，松开对应意识再次逸散，触摸位置对应召回方向。
- 提出将这些数据转换为收敛值，用于控制意识碎片重新聚合的强度。
- 规划声音状态：高熵状态使用破碎呼吸、数字噪声和不稳定频率；低熵状态逐渐变慢、变清晰并接近静默。
- 建立第一版 3D 装置模型：两块主要屏幕、多个小型屏幕和一块交互屏幕沿垂直线缆主干密集排列。
- 输出正面与侧向视角的两张建模图。

**设计决策**

第一版采用多屏密集堆叠，而不是单屏结构。暴露的线缆和不规则屏幕排列用于表现意识碎片、信息纠缠与不稳定状态；下方横向屏幕被定义为观众交互入口，上方主要屏幕承担墨迹扩散和潜在空间视觉，小屏幕用于显示漂移的意识碎片。

**证据**

- [第一版装置概念手绘草图](images/2026-05-31-initial-installation-concept-sketch.jpg)
- [第一版装置建模正面视图](images/2026-05-31-initial-installation-model-front.png)
- [第一版装置建模侧向视图](images/2026-05-31-initial-installation-model-angle.png)
- 本机文件创建时间：两张建模图分别为 2026-05-31 17:41 和 17:45，手绘草图为 2026-05-31 22:04（BST）。文件未包含可读取的内嵌 EXIF 日期，因此该日期依据本机文件系统时间。

**反思 / 下一步**

第一版已经提出多屏、交互数据和熵状态之间的关系，但屏幕数量较多、层级较密，观众界面、主要视觉输出和系统状态之间的功能边界仍不清晰。后续版本应简化屏幕层级，并明确不同屏幕的观看对象和作用。

---

### 2026 年 6 月 8 日 — 建立项目仓库

**开发意图**

在整合可运行原型之前，为项目建立版本控制空间。

**已完成工作**

- 初始化 Git 仓库。
- 添加用于文件处理的 Git attributes。

**证据**

- Commit [`64278d5`](https://github.com/Yeri10/Inkward_Bound/commit/64278d5) — `Initial commit`

**反思 / 下一步**

这个提交建立了仓库，但尚未呈现设计或技术过程。下一步是开始制作并测试装置原型。

---

### 2026 年 6 月 10 日 — 建立网页与 TouchDesigner 的完整数据桥接

**开发意图**

将浏览器界面与 TouchDesigner 整合成一个完整的交互系统，确立网页作为轻量输入层、TouchDesigner 负责视觉处理和装置输出的技术架构。

**已完成工作**

- 建立 Express 静态服务器（`server.js`，port `3000`）和 WebSocket 中继（port `9980`）。
- 完成 p5.js 粒子界面（`sketch.js`）：180 个粒子响应 Perlin 噪声，支持鼠标与触摸输入。
- 在浏览器端计算位置、持续时间、速度、稳定性、躁动程度、点击次数和 `c` 值，通过 WebSocket 发送给 TouchDesigner。
- 加入底部 HUD，实时显示连接状态与交互数值。
- 在 TouchDesigner 中搭建接收链路：`ws_touch_input` → `ws_parser` → `touch_store` → `c_value_chop`。
- 验证端到端数据流通：`touch_store` 的 `timestamp` 字段随浏览器触摸实时更新。

**技术决策**

浏览器不只发送原始坐标，而是先计算更高层级的行为数据（`stability`、`agitation`、`c` 值）。这样 TouchDesigner 通过一个稳定的数据接口，就能将静止、躁动等交互特征直接映射到视觉参数，避免在 TD 端重复计算。

WebSocket 使用 Node.js 中继，而不是让 TD 直接作为 WebSocket 服务端。测试发现 TD 的 WebSocket DAT 在客户端模式（连接到外部中继）下回调机制更可靠。

**关键 bug 修复**

点击画布无反应。根本原因是 p5.js 封装函数（`rand`、`noiseFn` 等）在 p5 初始化之前就被定义，导致静默失败。解决方案是删除所有封装函数，直接使用 p5 全局函数，并将 `connectWS()` 移入 `setup()` 内部调用。

**相关文件与证据**

- `InkWard_Bound_Interface/server.js`（该阶段使用的文件名，后续已重命名为 `app.js`）
- [`InkWard_Bound_Interface/public/sketch.js`](../InkWard_Bound_Interface/public/sketch.js)
- [`InkWard_Bound_Interface/public/index.html`](../InkWard_Bound_Interface/public/index.html)
- `系统搭建测试记录/td数据接收.mov`（屏幕录像：TD 接收到实时数据；当前未存入仓库）
- `系统搭建测试记录/使用TD的粒子噪声系统测试c_value_chop的输出.mov`（当前未存入仓库）
- 项目作者补充的回顾性过程记录；后续代码与 TouchDesigner 文件集中保存在 Commit [`c0e3e20`](https://github.com/Yeri10/Inkward_Bound/commit/c0e3e20) 中。

**反思**

这个阶段的工作量较大，几个方向同时推进。下一步应将 TouchDesigner 的每次修改分开记录，并附截图说明网络结构或视觉变化，让迭代过程更清晰可追溯。

---

### 2026 年 6 月 12 日 — 第二版装置概念重构

**开发意图**

重新组织第一版密集垂直堆叠的多屏结构，建立更清晰的主体框架，并将主要视觉空间与观众交互入口分开。

**视觉修改**

- 将第一版的单根垂直线缆主干改为可独立站立的矩形金属框架。
- 在框架内部使用多层黑色和半透明平面，形成具有深度的主视觉区域。
- 将三块渐变小屏分布在框架边缘，继续表达漂移的意识碎片。
- 将彩色交互屏从主体结构中分离，放置在独立基座上，使观众输入与主视觉输出形成明确分工。
- 保留悬浮、错位和重叠的视觉语言，但开始建立更清晰的结构边界。

**设计决策**

这次修改不是“从单屏变为双屏”，而是从第一版的多屏密集堆叠，转向“主体视觉框架 + 独立交互终端”的空间组织。分离后的交互终端为观众提供明确入口，主体框架则专注呈现意识碎片、扩散和收敛。

**证据**

- [第二版装置概念图](images/2026-06-12-second-version-concept.png)
- 本机文件创建时间：2026-06-12 21:08（BST）。文件未提供可读取的内嵌 EXIF 日期，日期依据本机文件系统时间。

**反思 / 下一步**

第二版已经明确主体与交互终端的关系，但内部平面、小屏和基座仍然较多。后续需要通过连续建模测试逐步删减组件，确认哪些元素真正参与概念表达。

---

### 2026 年 6 月 22–29 日 — 墨水扩散 Dataset 拍摄

**开发意图**

拍摄不同材料和外力作用下的墨水扩散形态，为装置的黑白墨迹视觉、Latent Atlas 素材和 TouchDesigner 状态变化建立实物参考。

**已完成工作**

- 在 6 月 22、26、29 日完成三组实验。
- 使用相机与手机拍摄，并测试两个手机灯和傍晚柔光。
- 比较水、墨水、盐/盐水、洗手液，以及筷子、小棍子和滴管产生的视觉差异。
- 测试自然扩散、向四周搅动、中间小范围搅动和滴管操作。
- 于 7 月 1 日将代表帧整理为 8 张带参数说明的 contact sheets。

**证据**

- [Dataset 拍摄与制作日志](../ink_dataset/DATASET_CAPTURE_LOG.zh-CN.md)
- [Dataset contact sheets](images/dataset_record/)

**反思 / 下一步**

现有记录能够证明材料、工具、设备和灯光变量，但原始文件数量、分辨率、帧率、材料用量及筛选淘汰过程仍需补充。下一步应将代表形态与具体 TouchDesigner 状态或 Latent Atlas 分类建立可测试的映射。

---

### 2026 年 6 月 23–25 日 — 第二版视觉结构的连续删减与调整

**开发意图**

通过连续三次建模输出，测试框架、屏幕、中央视觉体和交互终端的组合方式，逐步减少不必要的结构。

**视觉迭代**

- **6 月 23 日：** 将主体扩展为较开放的双框架结构，加入黑色中央体、多个悬浮屏幕、独立彩色终端以及额外白色模块，测试不同组件在空间中的距离和方向。
- **6 月 24 日：** 减少外部基座与部分中央组件，使结构更开放；将彩色终端靠近主体，强化主体与交互界面的联系。
- **6 月 25 日：** 继续减少渐变屏和中央白色体的数量，保留主要框架、黑色背景体、少量碎片屏幕与彩色交互终端。

**设计决策**

这三次修改采用逐步删减的方法：不再通过增加屏幕表达复杂性，而是依靠框架、空隙、半透明层和少量错位屏幕表达意识碎片。交互终端继续保持在主体外部，以维持功能区分。

**证据**

- [6 月 23 日视觉测试](images/2026-06-23-installation-visual-study-03.png)
- [6 月 24 日视觉测试](images/2026-06-24-installation-visual-study-04.png)
- [6 月 25 日视觉测试](images/2026-06-25-installation-visual-study-05.png)
- 本机文件创建时间分别为 2026-06-23 16:09、2026-06-24 18:25 和 2026-06-25 22:03（BST）。

**反思 / 下一步**

连续删减使视觉中心更明确，但主体仍由多个相互独立的框架和平面构成。下一步需要把结构进一步收束为一个可制造、可布线且具有明确观看方向的整体框架。

---

### 2026 年 6 月 30 日 — 将原型与 TouchDesigner 迭代集中存入仓库

**开发意图**

将 6 月 10 日开始形成的数据桥接原型、浏览器代码和 TouchDesigner 迭代版本集中纳入 Git 版本控制。

**已完成工作**

- 加入 TouchDesigner 第 1–8 个编号版本。
- 加入当前 `.toe` 系统文件。
- 加入已经开发的 p5.js 浏览器界面、状态模型和 HUD。
- 加入已经开发的 Express 服务器与 WebSocket 中继。

**技术决策**

这次提交的重点是保存此前的开发成果，而不是代表所有功能都在 6 月 30 日当天完成。

**证据**

- Commit [`c0e3e20`](https://github.com/Yeri10/Inkward_Bound/commit/c0e3e20) — `I add some files`
- [`sketch.js`](../InkWard_Bound_Interface/public/sketch.js)
- [TouchDesigner 备份文件](../InWard%20Bound%20System/Backup)

**反思 / 下一步**

这个提交包含大量工作，但范围过大，无法清楚显示开发顺序，提交信息也没有准确描述内容。编号 `.toe` 文件能说明发生过迭代，但二进制文件无法提供可读 diff。今后的 TouchDesigner 修改应分别提交，并附加截图和网络或视觉变化说明。

---

### 2026 年 6 月 30 日 — 明确 Node 入口文件

**问题**

部署入口文件需要与应用命名及 npm 配置保持一致。

**已完成工作**

- 将 `server.js` 重命名为 `app.js`。
- 更新 `package.json` 中的 `main` 字段和 `npm start` 命令。

**证据**

- Commit [`c5fc728`](https://github.com/Yeri10/Inkward_Bound/commit/c5fc728) — `I change some codes`

**反思 / 下一步**

源文件与 package 配置已经一致，但第一次 Render 部署暴露了另一个问题：服务最初从错误的工作目录寻找入口文件。

---

### 2026 年 6 月 30 日 — 调整为兼容 Render 的 WebSocket 网络结构

**问题**

本地原型的 HTTP 与 WebSocket 使用不同端口，但 Render Web Service 的公网 HTTP 和 WebSocket 流量必须进入同一个公开监听端口。HTTPS 页面还要求使用安全 WebSocket。

**已完成工作**

- 创建由 Express 和 `WebSocketServer` 共用的 HTTP server。
- 使用 Render 提供的 `PORT` 环境变量，并监听 `0.0.0.0`。
- 删除独立的公网 WebSocket 端口 `9980`。
- 让浏览器在本地自动使用 `ws://`，在 HTTPS 环境自动使用 `wss://`。
- 中继数据时保留文本和二进制消息类型。

**技术决策**

现在由同一来源提供网页，并完成 WebSocket 协议升级。这避免了写死的部署端口，使浏览器和 TouchDesigner 可以通过 Render 域名的 `443` 端口连接。

**证据**

- Commit [`42c9a6d`](https://github.com/Yeri10/Inkward_Bound/commit/42c9a6d) — `change network port`
- [`app.js`](../InkWard_Bound_Interface/app.js)

**反思 / 下一步**

部署配置和应用网络结构现已对齐。下一步证据应包括：Render 成功部署截图、浏览器 HUD 连接成功截图，以及 TouchDesigner WebSocket DAT 收到 JSON 的画面。

---

### 2026 年 7 月 1 日 — TouchDesigner 第 9 版与展示控制

**开发意图**

保留新的 TouchDesigner 迭代版本，并让浏览器界面能够在没有浏览器栏的情况下展示。

**已完成工作**

- 将 TouchDesigner 第 8 版归档到 `Backup/`。
- 添加第 9 版并更新当前 `.toe` 文件。
- 添加 `F` 键全屏切换。
- 保持画布随浏览器窗口变化自动调整。

**证据**

- Commit [`1bc18a2`](https://github.com/Yeri10/Inkward_Bound/commit/1bc18a2) — `add some codes`
- [`InWard Bound System.9.toe`](../InWard%20Bound%20System/InWard%20Bound%20System.9.toe)
- [`sketch.js`](../InkWard_Bound_Interface/public/sketch.js) 中的全屏处理函数

**反思 / 下一步**

编号 `.toe` 文件和全屏代码已保存，但提交没有说明 TouchDesigner 第 8 版与第 9 版之间的视觉差异。下一条记录应加入对比截图或简短录屏。

---

### 2026 年 7 月 1 日 — 框架收束与半透明包覆测试

**开发意图**

把此前分散的双框架和悬浮平面整合为一个更完整的装置体量，并测试半透明材料如何影响内部视觉的可见性。

**视觉修改**

- 凌晨版本将上下横梁与四根立柱连接为完整矩形框架，减少外围渐变屏和独立模块，把主要视觉集中在框架内部。
- 保留外置彩色交互屏，使观众输入界面与内部生成视觉继续分离。
- 21:03 的 Blender 工作截图记录了正式渲染前的建模现场：完整框架、小型渐变屏、外置彩色屏和侧面模块已经放置在同一场景中，并在渲染视图中检查材质、位置和阴影关系。
- 晚间版本在框架表面加入大面积半透明包覆层，使内部白色视觉体变为模糊、发光的形态。
- 结构语言从“多个碎片并置”进一步转向“碎片被容纳在一个半透明空间中”。

**设计决策**

完整框架提高了结构可制造性，也提供了悬挂屏幕、隐藏布线和固定半透明材料的共同边界。半透明表面让内部图像不能被一次完全读取，与项目关于意识显现、逸散和重新聚合的概念更一致。

**证据**

- [7 月 1 日框架收束测试](images/2026-07-01-installation-frame-study-06.png)
- [7 月 1 日 Blender 建模过程截图](images/2026-07-01-blender-frame-work-in-progress.png)
- [7 月 1 日半透明包覆测试](images/2026-07-01-installation-enclosure-study-07.png)
- 本机文件创建时间依次为 2026-07-01 01:50、21:03 和 21:10（BST）；最后一张图于 21:28 修改。

**反思 / 下一步**

当前方向比早期多屏堆叠更统一，但半透明材料的实际透光率、投影亮度、屏幕固定方式、散热和维护空间仍需通过实体材料测试确认。

### 2026 年 7 月 2 日 — 墨水数据集 LoRA 打标

**开发意图**

为 `ink_dataset/` 中的 101 张实拍墨水照片完成 LoRA 训练打标，使训练出的模型能够生成可由收束值导航的 pre-baked latent atlas。

**已完成工作**

- 通过拼接缩略图逐张核对图像，为每张图写同名 `.txt` caption（kohya / AI Toolkit 格式）。
- 确定 caption 结构：`inkwb, <状态短语>, <阶段短语>, <单图形态描述>, monochrome, high contrast`。
- 按帧在实验序列中的位置分配时间阶段短语（`early / developing / advanced / final phase`），例如 `1-1.jpg` → `1-4.jpg` 为同一次扩散过程。
- 将 `04_gathering_ink/3-2-.jpg` 改名为 `3-2.jpg`。
- 在 [`ink_dataset/README.md`](../ink_dataset/README.md) 与 [`ink_dataset/README.zh-CN.md`](../ink_dataset/README.zh-CN.md) 中记录结构说明。
- 归并数据集文档：将 `DATASET_CAPTURE_LOG`（中英）从 `docs/` 移入 `ink_dataset/`，使拍摄、打标与训练证据集中在图像旁边。
- 更新主 README 与本日志中的全部交叉引用，并修复此前 `docs/images/dataset` → `docs/images/dataset_record` 改名导致的 contact sheet 图片链接失效。

**决策及原因**

选用无既有语义的触发词 `inkwb` 吸收整体风格、避免与既有概念冲突；caption 采用自然语言以兼容 Flux / SDXL 类训练。把序列位置编码为阶段短语，使拍摄的时间推进变为可提示控制的参数，直接映射 c 值轴（如 `final phase of gathering` 对应临时回流）。接近全黑的帧予以保留，阶段短语使其作为扩散终态具有语义价值。

**证据**

- `ink_dataset/` 四个子文件夹中的 101 个 `.txt` caption 文件。
- [`ink_dataset/README.zh-CN.md`](../ink_dataset/README.zh-CN.md) — 结构、caption 格式与 c 值映射。

**反思 / 下一步**

Caption 已与图像一一对应并通过完整性验证，但效果尚未检验。下一步先跑一轮 LoRA 训练，评估状态与阶段词汇在生成中是否真正可控，再批量产出 atlas 图像。

---

### 2026 年 7 月 6 日 — 从 The-Latent-Mycelium 迁移 LoRA 训练管线

**开发意图**

复用此前项目 [The-Latent-Mycelium](https://github.com/Yeri10/The-Latent-Mycelium) 已验证的 SD 1.5 训练管线，为 `inkwb` LoRA 搭建训练基础设施，而不是从零构建。

**已完成工作**

- 审读 The-Latent-Mycelium，确认可复用部分：diffusers LoRA 训练脚本、conda 环境、生成器类、NDI 发送与缓冲播放代码，以及 `mycelium_lora_structure_v1`（80 张图）成功训练的超参数。
- 新建 `training/`：`train_text_to_image_lora.py`（原样复制）、`prepare_dataset.py` 和训练 README。
- `prepare_dataset.py` 将 `ink_dataset/` 的 kohya 式 caption 转换为 diffusers 格式（`training/dataset/images/` 最长边 1024 px + `metadata.jsonl`）；已运行并生成 101 条记录。

**决策及原因**

沿用 mycelium 超参数（512 分辨率、rank 16、lr 5e-5、batch 1 + 梯度累积 4、12 epochs）作为已验证的起点。禁用 `random_flip`，因为墨水 caption 编码了左右方位。映射层后续重写：PM2.5 → density/tangle 短语改为 c 值 → 状态/阶段/视角短语，正好对应 7 月 2 日定义的 caption 词汇。

**证据**

- [`training/README.md`](../training/README.md)、[`training/prepare_dataset.py`](../training/prepare_dataset.py)
- `training/dataset/metadata.jsonl` — 由 caption 生成的 101 条记录。

**反思 / 下一步**

管线尚未在本数据集上实测。下一步：在 Mac Studio 上跑 `inkwb_lora_v1`，用训练 README 的清单评估（状态 / 阶段 / 视角可控性），再决定 caption 词汇是否需要二次调整，然后批量生成 latent atlas。

---

### 2026 年 7 月 6 日 — 首次训练复盘：容器特征泄漏进触发词

**问题**

`inkwb_lora_v1` 的首批预览图复现了拍摄容器的特征——缸壁、弧形容器底、水面线和气泡。原因是这些反复出现的特征没有写进 caption，被模型吸收进了触发词。

**已完成工作**

- 为全部 101 条 caption 增加容器语境部分：`inside a shallow pale basin`（01）/ `inside a clear water tank`（02–04），并对明显可见的图补充 `curved basin rim visible`、`water surface line at the top`、`reflective tank floor below`。
- 在 notebook 的 Inference Test cell 加入负面提示（glass、tank、vessel walls、rim、surface line、reflection、bubbles）。
- 更新 ink_dataset README 的 caption 格式说明，重新生成含 Container 列的 `ink_dataset_captions.xlsx`。

**决策及原因**

先不裁剪照片，而是把容器特征绑定到明确的 caption 词汇上，生成时用负面提示排除。裁剪保留为 v2 预览仍受污染时的后备方案，因为裁剪会同时改变形态描述所依赖的构图信息（留白、方位）。

**证据**

- [v1 预览：缸壁与水面线](images/2026-07-06-inkwb-lora-v1-baseline-01-container-leak.png)、[v1 预览：弧形容器底](images/2026-07-06-inkwb-lora-v1-baseline-02-container-leak.png)
- `ink_dataset/` 全部 caption 文件；[`ink_dataset/README.zh-CN.md`](../ink_dataset/README.zh-CN.md) 格式表。
- [`training/Inkward Bound LoRA Training.ipynb`](../training/Inkward%20Bound%20LoRA%20Training.ipynb) 中的负面提示。

**反思 / 下一步**

重跑 `prepare_dataset.py`，训练 `inkwb_lora_v2`，用相同 seed 与 v1 预览对比。若容器特征仍存在，则在 `prepare_dataset.py` 中加入逐图裁剪，并同步修改受影响 caption 的方位词。

---

### 2026 年 7 月 6 日 — v1/v2 预览对比：真实感、prompt 调整与验收标准

**问题**

对比两次训练的 phase-control 预览发现 v1 看起来比 v2 更"真实"。v1 的真实感很大程度上正来自泄漏的容器特征——水面折射、玻璃光泽和高光反射本身就是摄影证据，去掉容器时它们也被一并去掉。v2 的负面提示同时存在误伤：`glass`、`reflection` 这类宽泛词压掉了密实墨水的湿润光泽。v2 预览仍残留缸壁和底部墨渍横条。另外，相同 seed 下四个阶段 prompt 生成的图几乎一致，说明阶段词单独使用可控性很弱。

**已完成工作**

- 收窄负面提示至具体特征（`tank walls, basin rim, water surface line, bubbles, table edge, dark smears at the bottom edge`），去掉 `glass / reflection / vessel`。
- 所有测试 prompt 加入正面摄影词（`macro photograph, wet glossy ink, soft light`），把真实感变为明确要求而非依赖容器泄漏。
- 强化 phase-control prompt：每个阶段词配对相应的形态描述（小墨团下沉 → 墨叶下漂 → 重块凝聚 → 墨丘沉底）。
- 仅修改 prompt，无需重训即可重新评估。

**决策及原因**

真实感不是训练目标。为 LoRA 定义了验收标准，按重要性排序：（1）词汇可控——状态、阶段、视角各自产生可区分的结果，c 值导航依赖于此；（2）风格干净——容器特征仅在 prompt 提及时出现；（3）seed 多样性——同一 prompt 换 seed 产生不同构图；（4）不过拟合——生成图不是训练照片的复印。真实感只需在观展距离下成立，且 atlas 经人工筛选，60–70% 可用率即足够。

**证据**

- [v1 阶段预览：early](images/2026-07-06-inkwb-lora-v1-phase-early.png)、[v1 阶段预览：final](images/2026-07-06-inkwb-lora-v1-phase-final.png) —— 摄影感由泄漏的容器线索承载；early 与 final 几乎一致。
- [v2 阶段预览：early](images/2026-07-06-inkwb-lora-v2-phase-early.png)、[v2 阶段预览：final](images/2026-07-06-inkwb-lora-v2-phase-final.png) —— 更干净但更平；残留缸壁与底部墨渍横条。
- [v1 完整预览总览](images/2026-07-06-inkwb-lora-v1-preview-sheet.png) —— 第一次训练的 baseline、状态、阶段、视角四组。
- [v2 完整预览总览](images/2026-07-06-inkwb-lora-v2-preview-sheet.png) —— caption 修正后的同四组。
- [`training/Inkward Bound LoRA Training.ipynb`](../training/Inkward%20Bound%20LoRA%20Training.ipynb) 更新后的 Inference Test cell。

**完整评估（查看 v1、v2 全部预览组后补充）**

对比完整预览集修正了此前的判断。v1：状态可分且具有摄影级"水中感"，视角切换有效（俯拍圆渍 vs 侧拍漏斗），阶段无差异，容器不受控泄漏。v2：状态仍可分但漂向"纸上水墨"审美，视角失效（两个 prompt 都生成扁平墨渍），阶段依旧无差异，容器泄漏大减但残留画面黑边。关键认识：v1 的水中质感和有效视角正是由泄漏的容器语境承载的；v2 把语境绑定到词汇后，不写这些词的 prompt 就完全失去水下空间。修正方向不是封杀容器，而是主动使用这些词——已在全部侧视 prompt 中加入 `suspended in clear water` 锚点，并在负面提示中加入 `paper texture, ink on paper, photo border, dark frame edges`。

**反思 / 下一步**

用加了水体锚点的 prompt 重跑 Inference Test。v2 的 caption 修正把容器语境从不可控泄漏变成了推理时的开关，这正是预期行为——待解决的是阶段可控性（两次训练均无差异；若形态配对仍不够则回训练侧）以及确认水体锚点能否恢复视角切换。可控性过关后，固定 3–4 个 seed 生成 4 状态 × 4 阶段评估矩阵，随后进入 latent atlas 批量生成。

---

### 2026 年 7 月 6 日 — v3 实测密度打标：为阶段轴提供视觉锚点

**开发意图**

解决两次训练中阶段轴均无差异的问题。抽象阶段词（`early / developing / final phase`）无法给文本编码器提供视觉锚点，而序列中真正随时间变化的是墨水覆盖率。

**已完成工作**

- 编写 `training/measure_ink_coverage.py`：测量每张图的暗像素占比（灰度阈值 100），按五档写入覆盖率短语，从 `sparse ink traces, mostly clear water` 到 `ink almost filling the entire frame`。可重复运行，自动替换旧密度短语。
- 应用到全部 101 条 caption。五档分布：10 / 19 / 36 / 15 / 21，且序列内按预期递进（如 `01/1-1 → 1-4`：dense → dense → heavy → filling）。
- 更新 notebook 的 phase-control 与评估矩阵 prompt，使每个阶段词配对相应的实测密度短语。
- 在 ink_dataset README 中记录新的 caption 组成部分。

**决策及原因**

密度由测量而非人眼判断分配：短语来自真实的暗像素占比，保证每条 caption 的描述客观成立。阶段词与密度短语并存，生成时两套词汇都可使用。

**证据**

- [`training/measure_ink_coverage.py`](../training/measure_ink_coverage.py)；`ink_dataset/` 全部更新后的 caption。
- [`ink_dataset/README.zh-CN.md`](../ink_dataset/README.zh-CN.md) 格式表。

**反思 / 下一步**

重跑 `prepare_dataset.py` 并训练 `inkwb_lora_v3`，用评估矩阵检验阶段轴。若密度短语能有效控制覆盖率，c 值映射可直接使用它们（低 c → 稀疏/湍流，高 c → 浓重/凝聚）。

---

### 2026 年 7 月 6 日 — v3 评估：风格与多样性通过，阶段小幅改善，状态随 seed 塌缩

**开发意图**

用评估矩阵 cell（固定 seed 的 4 状态 × 4 阶段 + seed 多样性条）按验收标准检验以密度分档 caption 训练的 `inkwb_lora_v3`。

**结果**

- 风格干净：通过。`suspended in clear water` 锚点 + 正面摄影词找回了湿润的水中光泽；所有预览均无容器特征和纸纹理。
- 多样性：通过。三个 seed 构图明显不同，无复印训练图迹象。
- 阶段轴：小幅改善。seed 42 的 gathering 行出现可见的密度递进（early 帧较亮、后续渐重）——三次训练中阶段词第一次对画面产生影响——但推进仍然细微。
- 状态轴：部分 seed 退步。seed 42 下四状态可区分；seed 123 下整个矩阵塌缩为近乎相同的垂帘状构图。
- Caption 长度检查：CLIP token 估算最长约 70,低于 77 上限，训练期截断不能解释塌缩。

**诊断与决策**

seed 相关塌缩的可能原因是 prompt 共享后缀过重（水体锚点 + 三个摄影短语 + 风格标签）在推理时稀释了状态短语。这是生成侧问题，不计划重训。对策：需要状态区分时精简摄影后缀；atlas 生成时多扫 seed——atlas 为策展式筛选，seed 级塌缩只降低可用率。

**证据**

- [v3 状态 × 阶段矩阵，seed 42](images/2026-07-06-inkwb-lora-v3-matrix-seed42.png) —— 状态可分，阶段轻微递进。
- [v3 状态 × 阶段矩阵，seed 123](images/2026-07-06-inkwb-lora-v3-matrix-seed123.png) —— 该 seed 下状态塌缩。
- [v3 状态 × 阶段矩阵，seed 777](images/2026-07-06-inkwb-lora-v3-matrix-seed777.png) —— 供与 v4 同 seed 对比。
- [v3 seed 多样性条](images/2026-07-06-inkwb-lora-v3-diversity.png)、[v3 baseline](images/2026-07-06-inkwb-lora-v3-baseline.png)。
- [v3 完整预览总览](images/2026-07-06-inkwb-lora-v3-preview-sheet.png) —— baseline、状态、阶段、视角四组。

**反思 / 下一步**

v3 已可开始试验性 atlas 生成：按状态扫 seed、人工筛选可用图，用实测密度短语驱动覆盖率。同时测试精简共享摄影后缀能否在塌缩 seed 上恢复状态区分。

---

### 2026 年 7 月 6 日 — v4 实验：精简 caption

**开发意图**

测试更短的 caption 能否改善状态区分。v3 caption 估算最长约 70 CLIP token，精简可减少大量共享 token 对注意力的稀释。

**已完成工作**

- 为 `prepare_dataset.py` 加入 `--trim` 开关：构建训练数据时删除抽象阶段短语（时间轴由实测密度短语承担）和全数据集共有的风格标签（由触发词吸收）。源 caption 文件不动，随时可去掉开关重建 v3 版数据。
- 最长 caption 估算从约 70 降至约 61 token。
- notebook 更新：Dataset Validation 增加 `TRIM_CAPTIONS` 开关，输出目录改为 `training/runs/inkwb_lora_v4`，validation prompt 改写为精简词汇。

**判定标准**

用精简 caption 训练 v4，与 v3 做相同 seed 的评估矩阵对比。若状态区分改善（尤其在此前塌缩的 seed 上）且不损失水中质感与密度可控性，则采用 v4；否则将 `TRIM_CAPTIONS` 设回 `False`，继续用 v3 生成 atlas。

**证据**

- [`training/prepare_dataset.py`](../training/prepare_dataset.py)（`trim_caption`）、[`training/Inkward Bound LoRA Training.ipynb`](../training/Inkward%20Bound%20LoRA%20Training.ipynb)。

**结果与决定（v4 训练后补充）**

用精简 caption 训练 v4，并在 seed 42 / 123 / 777 上评估。状态区分在最关键处改善：v3 下完全塌缩的 seed 123，现在 diffusion 与 settling 两行清晰可分；seed 777 的 settling 行（从水面层垂下的柱状）是至今最强的状态表达。水中质感与 seed 多样性保持。遗留问题：disturbance 与 gathering 在所有 seed 下仍难以区分——属于数据层面的混淆（两类素材都含相似的浓团形态）；密度/阶段列在行内变化依然很小。**决定：采用 v4。** atlas 生成脚本已切换到 v4 权重并改用精简词汇表；鉴于 prompt 侧密度控制弱，脚本现在会把每张生成图的实测暗像素覆盖率写入 manifest，atlas 筛选时按实测值重新归档，而不依赖 prompt。

**证据**

- [v4 矩阵 seed 42](images/2026-07-06-inkwb-lora-v4-matrix-seed42.png)、[seed 123](images/2026-07-06-inkwb-lora-v4-matrix-seed123.png)、[seed 777](images/2026-07-06-inkwb-lora-v4-matrix-seed777.png)
- [v4 多样性条](images/2026-07-06-inkwb-lora-v4-diversity.png)、[v4 完整预览总览](images/2026-07-06-inkwb-lora-v4-preview-sheet.png)
- [`training/generate_atlas.py`](../training/generate_atlas.py) —— v4 词汇表与实测覆盖率 manifest。

**反思 / 下一步**

用 v4 进入 atlas 候选图生成。disturbance 与 gathering 的区分若对装置重要，需要数据层面的解法（补拍更具区分度的素材），而非继续调整 caption；密度改由测量输出解决，不再依赖 prompt 控制。

---

## 当前验证清单

仓库能够证明代码和版本历史。下一次完整系统测试应补充以下运行证据：

- [ ] Render 显示构建成功并运行服务。
- [ ] 浏览器能够打开公网地址。
- [ ] 浏览器 HUD 的连接指示灯变绿。
- [ ] TouchDesigner WebSocket DAT 连接到 `inkward-bound.onrender.com:443`。
- [ ] TouchDesigner 收到 `down`、`move`、`up` 和 `frame` JSON 消息。
- [ ] `F` 进入全屏，`F` 或 `Esc` 退出全屏。
- [ ] 缓慢稳定的按压与快速躁动的移动产生明显不同的结果。

## 后续文档规范

每次有实质性开发时：

1. 创建范围明确、信息具体的提交，例如 `Map stability to particle convergence in TouchDesigner`。
2. 在结束开发前补充一条带日期的流程记录。
3. 写明意图、实现、结果、失败或限制以及下一步。
4. 视觉修改应在 `docs/images/` 中加入截图或简短录屏。
5. 在流程记录中链接图片和对应 Commit。
6. 未解决的技术任务使用 GitHub Issues，并链接相关 Commit。

不要提交 `node_modules` 等生成依赖；保留 `package.json` 和 `package-lock.json` 即可提供可复现的依赖证据。

Dataset 拍摄单独记录在 [Dataset 拍摄与制作日志](../ink_dataset/DATASET_CAPTURE_LOG.zh-CN.md) 中，以便清晰展示拍摄条件、授权、素材筛选和处理决策，同时避免软件开发时间线过度膨胀。

## 记录模板

```markdown
### YYYY-MM-DD — 简短、具体的标题

**开发意图 / 问题**

本次探索或修复什么？

**已完成工作**

- 具体的实现或设计修改。

**决策及原因**

做出了什么选择？为什么？

**证据**

- Commit: [`abcdef0`](https://github.com/Yeri10/Inkward_Bound/commit/abcdef0)
- 截图或视频：`docs/images/YYYY-MM-DD-description.png`
- 测试结果或相关源文件。

**反思 / 下一步**

什么有效、什么仍不确定、下一步测试什么？
```
