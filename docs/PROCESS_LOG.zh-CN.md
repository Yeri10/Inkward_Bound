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
