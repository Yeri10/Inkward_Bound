# 《墨向》—— 浏览器触摸界面

**中文** | [English](README.md)

《墨向》(*Inkward Bound*)装置的输入端。基于 p5.js 的浏览器画布测量触摸,
把手势换算成单一收敛值 `c`(0–1),经 WebSocket 发送给 TouchDesigner,
由后者驱动一段 LoRA 生成的墨水扩散视频在弥散与凝结之间移动。

画布不是一个带读数的控制器。它用自己的材料——一层由大而柔、明暗不一的
节点构成的密度场——同步运行投影上那同一个"弥散 → 凝结"的过程。

## 架构

```
手 → 浏览器 (p5.js sketch) ──ws:// 或 wss://──▶ Node.js 中继
                                                     │
                                                     ▼
                                       TouchDesigner WebSocket DAT
                                                     │
                                                     ▼
                                         由 c 值 scrub 的 LoRA 视频
```

`app.js` 提供静态文件服务,并在同一端口跑一个 WebSocket 广播中继。
浏览器发送的任何消息会被转发到其他所有已连接的客户端——TouchDesigner
就连在同一个地址上。

## 环境要求

- Node.js ≥ 18
- 一个现代浏览器(Chrome / Safari / Firefox)
- TouchDesigner(可选——WebSocket 连不上时 sketch 照样运行,只是没有视频
  被驱动)

## 运行

```bash
npm ci
npm start
```

浏览器打开 `http://localhost:3000`。若要用平板作触摸面,把平板接入同一
网络,改为打开 `http://<这台机器的局域网 IP>:3000`。

在 TouchDesigner 中,把 WebSocket DAT(`ws_touch_input`)的 Network Address
设为 `localhost`,Port 设为 `3000`,不启用 TLS。

线上部署版本(Render):浏览器打开
[inkward-bound.onrender.com](https://inkward-bound.onrender.com),
TouchDesigner 连同一地址、Port 443,启用 TLS。Render 免费实例闲置时会
休眠,首次加载可能需要约一分钟——**展览现场用的是本地部署**。

## 数据契约

浏览器在交互事件与约 30fps 的固定节奏下发送 JSON:

```json
{
  "event":      "down" | "move" | "up" | "frame",
  "isTouching": true,
  "x":          0.5,
  "y":          0.5,
  "duration":   2.4,
  "speed":      0.12,
  "stability":  0.88,
  "agitation":  0.16,
  "clickCount": 1,
  "c":          0.42,
  "state":      "search",
  "timestamp":  1782864000000
}
```

这些字段名是与 TouchDesigner 工程之间的契约,改掉任何一个都会让装置
无声地失效。

## 文件结构

```
InkWard_Bound_Interface/
├── app.js               # Express 服务 + WebSocket 广播中继（55 行）
├── package.json
└── public/
    ├── index.html       # canvas 容器 + 两套 HUD
    ├── sketch.js        # 交互、c 值引擎、密度场
    ├── style.css        # HUD 样式
    └── p5.js            # p5.js v1.11.13——本地打包,勿动
```

`p5.js` 直接放在仓库里而非从 CDN 加载,因为展览现场不联网。
