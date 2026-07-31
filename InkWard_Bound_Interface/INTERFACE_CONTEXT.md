# Inkward Bound — 界面交接文档(给 AI 生成工具的上下文)

这份文档用于把浏览器界面的现状交给外部 AI 工具协作**重做视觉层**。
把整份文档粘贴给对方,再附上要改的文件,它就有足够上下文而不会破坏系统。

---

## 0. 一句话说明这个项目

一个交互装置:观众在浏览器画布上按住并移动手指,浏览器把这个手势换算成一个 0→1 的
**收敛值 `c`**,通过 WebSocket 发给 TouchDesigner,由 TD 实时 scrub 播放一段墨水扩散视频。

`c = 0` 是墨水离散的状态,`c = 1` 是墨水凝结的状态。手势越久、越稳、越不躁动,`c` 越接近 1。

**浏览器画布本身也是作品的一部分**——它用粒子流场同步演示"离散 → 凝结"这个过程。
需要重做的就是这一层。

---

## 1. 文件结构

```
InkWard_Bound_Interface/
├── app.js              # Express 静态服务 + WebSocket 广播中继（55 行）
├── package.json
└── public/
    ├── index.html      # canvas 容器 + 两套 HUD（33 行）
    ├── sketch.js       # 全部前端逻辑（338 行）
    ├── style.css       # HUD 样式（85 行）
    └── p5.js           # p5.js 库，勿动
```

技术栈:**原生 p5.js**(全局模式)+ 原生 WebSocket。没有构建步骤、没有打包器、没有框架。
`index.html` 直接用 `<script>` 引入 `p5.js` 和 `sketch.js`。

> 重要:请保持"无构建步骤"这一点。这个项目要在展览现场用一台 Mac 直接跑,
> 引入 npm 构建链会增加现场失败的可能。可以用 CDN 引入额外库,但不要引入需要编译的方案。

---

## 2. 绝对不能改的部分(改了会拆掉整个系统)

### 2.1 发给 TouchDesigner 的 JSON 数据契约

`sketch.js` 第 29–42 行,以 30fps 发送。TouchDesigner 那边按字段名解析,**字段名和取值范围都不能变**:

```json
{
  "event":      "down" | "move" | "up" | "frame",
  "isTouching": true,
  "x":          0.5,      // 0..1，归一化坐标
  "y":          0.5,      // 0..1
  "duration":   2.4,      // 秒
  "speed":      0.12,     // 0..1，已按 SPEED_MAX=600 归一化
  "stability":  0.88,     // 0..1
  "agitation":  0.16,     // 0..1
  "clickCount": 1,
  "c":          0.42,     // 0..1  ← 最关键的字段
  "state":      "search",
  "timestamp":  1782864000000
}
```

`state` 的五个合法取值:`autonomous` / `disturbance` / `search` / `return_` / `rediffusion`
(注意 `return_` 带下划线,因为 `return` 是保留字)。

### 2.2 c 值引擎(`updateState()`,第 284–333 行)

```js
cTarget = min(duration/18, 1)*0.7 + stability*0.3 - agitation*0.2   // 钳制 0..1
cValue += (cTarget - cValue) * 0.06     // 按住时平滑逼近
cValue -= 0.012                          // 松手时线性衰减
```

权重 `0.7 + 0.3 = 1.0` 是刻意的:只有这样,一次足够长且稳定的按压才能让 `c` 真正到达 1.0,
而 TouchDesigner 那边视频帧号是 `index = c * 480`——`c` 到不了 1,视频就永远播不到最后一帧。
**不要改这些系数。**

### 2.3 WebSocket 连接逻辑(第 10–22 行)

自动按页面协议切换 `ws:` / `wss:`,断线后每 2 秒重连。现场演出靠这个容错。

### 2.4 `app.js` 整个文件

它只是个广播中继,不含业务逻辑。重做视觉完全不需要碰它。

---

## 3. 可以自由重做的部分

### 3.1 粒子系统(`Particle` 类,第 79–159 行)

当前实现:180 个粒子在 Perlin 噪声流场里运动,叠加向心引力和触摸斥力。

**关键设计:每一个视觉参数都被 `c` 调制**,让画面自己演示离散→凝结。
重做时可以换任何视觉形式,但请保留"参数随 c 连续变化"这个原则:

| 参数 | c = 0（离散） | c = 1（凝结） | 代码位置 |
|---|---|---|---|
| 噪声尺度 `noiseScale` | 0.0035（细碎） | 0.0012（大结构） | 97 |
| 移动速度 `spd` | 2.8 | 0.4（变慢） | 98 |
| 噪声演进速度 | 0.012 | 0.003 | 99 |
| 向心引力 `pull` | 0 | 0.035（收拢） | 116 |
| 触摸作用方向 `dir` | 1（排斥） | -0.3（轻微吸引） | 127 |
| 粒子不透明度 | 30 | 110 | 153 |
| 粒子半径 | r | r + 0.8 | 154 |
| 拖影残留 | 22（短拖尾） | 8（长拖尾） | 179 |

另外:`agitation > 0.4` 时给速度叠加高斯噪声抖动(第 135–138 行),这是"人为扰动"状态的视觉表达。

### 3.2 两套 HUD

- `#hud` —— 底部状态条,给创作者调试用:C / STAB / AGIT / DUR + 连接指示灯 `#ws-dot`
- `#sys-hud` —— 浮层系统面板,给观众看的:按住时淡入,松手后在衰减期间保持可见

**如果重做 HUD,必须保留这些 element id**,因为 `updateState()` 每帧用
`document.getElementById()` 直接写入(第 315–332 行):

```
v-c  v-s  v-a  v-d  state-txt          （底部条）
sys-c  sys-s  sys-a  sys-d  sys-state  （浮层面板）
ws-dot                                  （连接指示灯，className: try/on/off）
sys-hud                                 （靠 .visible class 控制淡入淡出）
```

如果想改成别的结构,请同步修改 `updateState()` 里对应的 DOM 写入代码。

### 3.3 状态配色

第 71–77 行,五个状态各有一个色值,目前只用于给 `#state-txt` 上色。
可以扩展成整体主题色。

```js
autonomous:  '#1a1a22'   disturbance: '#221010'   search: '#101622'
return_:     '#141e1e'   rediffusion: '#0e0e14'
```

---

## 4. 已知 bug(重做时顺手修掉)

**坐标系不一致。** `createCanvas(windowWidth, windowHeight - HUD_H)` 已经减过一次
`HUD_H`(第 163 行),但 `Particle.update()` 里 `zone = height - HUD_H` **又减了一次**
(第 96 行)。造成两个后果:

1. 粒子活动区比画布短 36px,画布底部 36px 完全没有粒子
2. 第 193 行画触摸光圈用的是 `touchY * height`(完整画布高),而粒子受力中心用的是
   `touchY * zone`——**光圈画的位置和粒子实际被排斥的中心最多差 36px**,越靠下差得越多

修法:统一坐标系,`zone` 直接等于 `height`(因为 canvas 高度已经扣过 HUD 了)。
这个 bug 不影响发给 TD 的数据,只影响浏览器端视觉。

---

## 5. 交互行为参考

- **鼠标和触摸都支持**,两套事件走同样的 `startTouch` / `moveTouch` / `endTouch`(第 224–281 行)
- **按 `F` 进出全屏**(第 217–222 行)
- **连点检测**:380ms 内的连续点击累加 `clickCount`,超时归 1(第 256 行)
- **闲置提示**:未触摸且 `c < 0.1` 时,画面中央闪烁显示 "HOLD TO SEARCH"(第 205–211 行)
- 所有事件处理函数都 `return false`,用于阻止移动端的默认滚动/缩放行为

---

## 6. 本地运行

```bash
cd InkWard_Bound_Interface
npm ci
npm start
# 浏览器打开 http://localhost:3000
```

不需要 TouchDesigner 也能开发视觉——WebSocket 连不上时 `sendTouchData()` 会直接返回,
`c` 值引擎和粒子系统照常运行,底部指示灯显示为断开(红色)。
