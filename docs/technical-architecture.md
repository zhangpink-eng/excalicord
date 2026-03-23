# Excalicord 技术架构方案

> **版本**：1.0
> **更新日期**：2026-03-23
> **文档位置**：`/Users/caiyuanjie/Desktop/Projects/excalicord4/docs/technical-architecture.md`

---

## 目录

1. [系统架构总览](#1-系统架构总览)
2. [界面层架构](#2-界面层架构)
3. [逻辑层架构](#3-逻辑层架构)
4. [服务层架构](#4-服务层架构)
5. [数据流设计](#5-数据流设计)
6. [关键技术选型](#6-关键技术选型)

---

## 1. 系统架构总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              客户端 (Browser)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  UI Layer   │  │ Logic Layer │  │   Service   │  │  External   │        │
│  │             │  │             │  │    Layer    │  │   APIs      │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ Excalidraw  │  │   APP.tsx   │  │VideoRecorder│  │  Supabase   │        │
│  │   Canvas    │  │ useSlides   │  │ FFmpegWasm  │  │  Auth       │        │
│  │             │  │ useMedia    │  │ Beautify    │  │  Database   │        │
│  │ Camera      │  │ useRecording│  │ AI Avatar   │  │  Storage    │        │
│  │ Bubble      │  │ AuthContext │  │ i18n        │  │  Edge Fn    │        │
│  │             │  │             │  │             │  │             │        │
│  │ Slide       │  │             │  │             │  │  Stripe     │        │
│  │ Navigation  │  │             │  │             │  │  Payments   │        │
│  │             │  │             │  │             │  │             │        │
│  │ Recording   │  │             │  │             │  │  Vercel     │        │
│  │ Controls    │  │             │  │             │  │  Deployment │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────────────────────┤
│                           数据流与模块通信                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  APP.tsx (状态协调中心)                                             │   │
│  │  ├── 持有全局状态 (slides, currentSlide, recordingState)            │   │
│  │  ├── 分发事件给各服务                                                │   │
│  │  └── 协调 UI 更新                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 界面层架构

### 2.1 目录结构

```
src/
├── components/
│   ├── canvas/
│   │   ├── ExcalidrawCanvas.tsx      # Excalidraw 画布封装
│   │   ├── CameraBubble.tsx          # 摄像头气泡组件
│   │   ├── CameraBubbleSettings.tsx  # 气泡设置面板
│   │   └── CanvasOverlay.tsx         # 画布覆盖层（工具栏）
│   │
│   ├── slides/
│   │   ├── SlideRail.tsx            # 幻灯片导航条
│   │   ├── SlideThumbnail.tsx        # 幻灯片缩略图
│   │   └── SlideMarker.tsx          # 场景标记点
│   │
│   ├── recording/
│   │   ├── RecordingControls.tsx     # 录制控制栏
│   │   ├── RecordingTimer.tsx        # 录制计时器
│   │   ├── PreviewPlayer.tsx         # 预览播放器
│   │   └── ExportDialog.tsx          # 导出对话框
│   │
│   ├── auth/
│   │   ├── AuthProvider.tsx          # Auth Context Provider
│   │   ├── LoginForm.tsx             # 登录表单
│   │   └── UserMenu.tsx              # 用户菜单
│   │
│   ├── layout/
│   │   ├── Header.tsx                # 顶部导航栏
│   │   ├── MainLayout.tsx            # 主布局容器
│   │   └── RightPanel.tsx            # 右侧工具面板
│   │
│   └── ui/                           # shadcn/ui 组件
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       └── ...
│
├── hooks/
│   ├── useSlides.ts                  # 幻灯片状态管理
│   ├── useMediaDevices.ts            # 摄像头/麦克风设备管理
│   ├── useRecording.ts                # 录制状态管理
│   ├── useExport.ts                   # 导出逻辑
│   └── useAuth.ts                    # 认证状态
│
├── services/
│   ├── video/
│   │   ├── VideoRecorder.ts          # 视频录制器
│   │   ├── VideoConverter.ts         # 视频格式转换
│   │   ├── AudioManager.ts           # 音频管理
│   │   └── FrameCapture.ts           # 帧捕获
│   │
│   ├── beauty/
│   │   ├── BeautyFilter.ts           # 美颜滤镜
│   │   └── BeautySettings.ts         # 美颜参数
│   │
│   ├── ai/
│   │   ├── AvatarService.ts          # AI 虚拟形象
│   │   └── AvatarConfig.ts           # 形象配置
│   │
│   ├── i18n/
│   │   ├── index.ts                  # 国际化入口
│   │   └── locales/
│   │       ├── en.json
│   │       └── zh-CN.json
│   │
│   └── api/
│       ├── supabase.ts               # Supabase 客户端
│       ├── stripe.ts                 # Stripe 客户端
│       └── analytics.ts              # PostHog 分析
│
├── contexts/
│   ├── AuthContext.tsx               # 认证上下文
│   ├── ProjectContext.tsx             # 项目上下文
│   └── RecordingContext.tsx          # 录制上下文
│
├── lib/
│   ├── utils.ts                      # 工具函数
│   ├── cn.ts                         # className 合并
│   └── constants.ts                  # 常量定义
│
└── types/
    ├── canvas.ts                     # 画布相关类型
    ├── slides.ts                     # 幻灯片类型
    ├── recording.ts                  # 录制类型
    └── user.ts                      # 用户类型
```

---

## 3. 逻辑层架构

### 3.1 APP.tsx 总指挥架构

```typescript
// APP.tsx - 状态协调中心
function APP() {
  // 全局状态
  const [project, setProject] = useState<Project | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');

  // 设备状态
  const { cameraStream, micStream } = useMediaDevices();
  const cameraBubbleRef = useRef<CameraBubbleHandle>(null);

  // 录制器引用
  const recorderRef = useRef<VideoRecorder>(null);

  // 事件处理
  const handleRecordStart = () => {
    // 1. 初始化录制器
    // 2. 开始捕获帧
    // 3. 开始录音
    // 4. 更新状态
  };

  const handleExport = async (format: ExportFormat) => {
    // 1. 收集所有帧
    // 2. 调用 VideoConverter
    // 3. 上传到 Supabase Storage
    // 4. 返回下载链接
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SlideRail slides={slides} />
        <div className="canvas-area">
          <ExcalidrawCanvas onFrameCapture={handleFrame} />
          <CameraBubble ref={cameraBubbleRef} stream={cameraStream} />
        </div>
        <RightPanel />
      </div>
      <RecordingControls
        state={recordingState}
        onRecord={handleRecordStart}
        onPause={handleRecordPause}
        onStop={handleRecordStop}
        onExport={handleExport}
      />
    </div>
  );
}
```

### 3.2 Hooks 职责划分

| Hook | 职责 | 公共 API |
|-----|------|---------|
| `useSlides` | 管理幻灯片状态、添加/删除/重排序 | `slides`, `currentSlide`, `addSlide()`, `removeSlide()`, `reorderSlides()` |
| `useMediaDevices` | 管理摄像头/麦克风设备 | `cameraStream`, `micStream`, `selectCamera()`, `selectMic()`, `devices` |
| `useRecording` | 管理录制状态、帧捕获 | `state`, `duration`, `startRecording()`, `pauseRecording()`, `stopRecording()` |
| `useExport` | 处理视频导出 | `isExporting`, `progress`, `exportVideo()`, `cancelExport()` |
| `useAuth` | 管理认证状态 | `user`, `isLoading`, `signIn()`, `signOut()`, `subscription` |

---

## 4. 服务层架构

### 4.1 服务通信图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            服务层通信架构                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐         ┌──────────────┐                           │
│   │ VideoRecorder│◄───────►│  AudioManager │                           │
│   │              │ 同步    │              │                           │
│   └──────┬───────┘         └──────┬───────┘                           │
│          │                        │                                    │
│          │ 合并音视频流            │                                    │
│          ▼                        │                                    │
│   ┌──────────────┐                │                                    │
│   │VideoConverter│◄───────────────┘                                    │
│   │  (FFmpeg)    │                                                │
│   └──────┬───────┘                                                │
│          │                                                        │
│          │ 编码格式转换                                             │
│          ▼                                                        │
│   ┌──────────────┐                                                │
│   │  BeautyFilter│ (可选，在录制时或导出时应用)                      │
│   │              │                                                │
│   └──────────────┘                                                │
│          │                                                        │
│          ▼                                                        │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │ Supabase     │◄───►│ Stripe       │◄───►│ AI Avatar    │       │
│   │ Storage      │     │ Payments     │     │ Service      │       │
│   └──────────────┘     └──────────────┘     └──────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 核心服务详细设计

#### VideoRecorder.ts

```typescript
// 职责：捕获画布帧和音频，合成视频流
class VideoRecorder {
  private canvas: HTMLCanvasElement;
  private audioContext: AudioContext;
  private videoEncoder: VideoEncoder;
  private audioEncoder: AudioEncoder;

  // 状态
  private isRecording: boolean = false;
  private startTime: number = 0;
  private frames: EncodedVideoChunk[] = [];

  // 公共方法
  async startRecording(canvas: HTMLCanvasElement, audioStream: MediaStream): Promise<void>;
  async pauseRecording(): Promise<void>;
  async resumeRecording(): Promise<void>;
  async stopRecording(): Promise<Blob>;
  getDuration(): number;

  // 私有方法
  private captureFrame(): void;
  private encodeVideoFrame(frame: VideoFrame): void;
  private encodeAudioChunk(chunk: AudioData): void;
  private muxStreams(): Promise<Blob>;
}
```

#### VideoConverter.ts

```typescript
// 职责：使用 FFmpeg.wasm 进行视频格式转换
class VideoConverter {
  private ffmpeg: FFmpeg;
  private isLoaded: boolean = false;

  // 公共方法
  async load(): Promise<void>;  // 加载 FFmpeg WASM
  async convert(
    inputBlob: Blob,
    options: ConvertOptions
  ): Promise<Blob>;
  async exportToMP4(frames: Blob[], audio: Blob): Promise<Blob>;
  async exportToWebM(frames: Blob[], audio: Blob): Promise<Blob>;
  async exportToGIF(frames: Blob[]): Promise<Blob>;
  onProgress(callback: (progress: number) => void): void;
  async cancel(): Promise<void>;

  // 格式选项
  interface ConvertOptions {
    format: 'mp4' | 'webm' | 'gif';
    quality: 'low' | 'medium' | 'high' | 'ultra';
    fps: number;           // 目标帧率
    width?: number;        // 输出宽度
    height?: number;       // 输出高度
    crf?: number;          // 质量参数 (0-51)
  }
}
```

#### BeautyFilter.ts

```typescript
// 职责：提供美颜滤镜功能
class BeautyFilter {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;

  // 公共方法
  applyBeautyFilter(
    imageData: ImageData,
    settings: BeautySettings
  ): ImageData;

  // 美颜类型
  interface BeautySettings {
    smoothing: number;      // 磨皮强度 0-100
    whitening: number;      // 美白强度 0-100
    faceSlimming: number;   // 瘦脸强度 0-100
    skinTone: number;        // 肤色调整 0-100
  }
}
```

#### AvatarService.ts

```typescript
// 职责：AI 虚拟形象生成和管理
class AvatarService {
  // 支持的虚拟形象类型
  type AvatarType = 'illustrated' | 'photorealistic' | 'anime';

  // 公共方法
  async generateAvatar(
    image: ImageData,
    type: AvatarType
  ): Promise<MediaStream>;

  async selectAvatar(presetId: string): Promise<MediaStream>;
  listPresets(): AvatarPreset[];

  // 预设形象
  interface AvatarPreset {
    id: string;
    name: string;
    type: AvatarType;
    thumbnail: string;
    modelUrl: string;
  }
}
```

---

## 5. 数据流设计

### 5.1 录制数据流

```
┌──────────────────────────────────────────────────────────────────────┐
│                         录制数据流                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Excalidraw Canvas                                                   │
│  ┌─────────────┐                                                     │
│  │  SVG/Canvas │ ◄──── 用户绘制操作                                   │
│  └──────┬──────┘                                                     │
│         │ render                                                     │
│         ▼                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐            │
│  │ FrameCapture│────►│ VideoEncoder│────►│ Encoded     │            │
│  │ (60fps 采样)│     │ (WebCodecs) │     │ VideoChunks │            │
│  └─────────────┘     └─────────────┘     └──────┬──────┘            │
│                                                  │                    │
│  MediaStream (麦克风)                            │                    │
│  ┌─────────────┐     ┌─────────────┐            │                    │
│  │ AudioContext│────►│ AudioEncoder│────────────┘                    │
│  │             │     │ (WebCodecs) │            │                    │
│  └─────────────┘     └─────────────┘            │                    │
│                                                  │                    │
│         ┌───────────────────────────────────────┘                    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────┐                                                     │
│  │  VideoMuxer │ ◄─── 合成音视频                                     │
│  │  (FFmpeg)   │                                                     │
│  └──────┬──────┘                                                     │
│         │                                                            │
│         ▼                                                             │
│  ┌─────────────┐                                                     │
│  │  .webm     │                                                     │
│  │  (录制文件) │                                                     │
│  └─────────────┘                                                     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 导出数据流

```
┌──────────────────────────────────────────────────────────────────────┐
│                         导出数据流                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  录制文件 (.webm)                                                     │
│  ┌─────────────┐                                                     │
│  │   Raw Video │                                                     │
│  └──────┬──────┘                                                     │
│         │ decode                                                     │
│         ▼                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐            │
│  │  VideoDecoder│────►│ BeautyFilter│────►│VideoEncoder │            │
│  │  (WebCodecs) │     │ (可选)       │     │ (H.264/VP9) │            │
│  └─────────────┘     └─────────────┘     └──────┬──────┘            │
│                                                  │                    │
│  音频文件                                         │ encode            │
│  ┌─────────────┐                                 │                    │
│  │   .webm     │                                 │                    │
│  └──────┬──────┘                                 │                    │
│         │ decode                                 │                    │
│         ▼                                         │                    │
│  ┌─────────────┐                                 │                    │
│  │AudioDecoder │─────────────────────────────────┘                    │
│  └─────────────┘                                                       │
│                                                                       │
│         ┌───────────────────────────────────────┘                    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────┐                                                     │
│  │  FFmpeg     │ ◄─── 合成最终视频                                   │
│  │  Muxer      │                                                     │
│  └──────┬──────┘                                                     │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐             │
│  │  .mp4       │────►│  Supabase   │────►│  Download   │             │
│  │  (最终文件)  │     │  Storage    │     │  URL        │             │
│  └─────────────┘     └─────────────┘     └─────────────┘             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. 关键技术选型

| 技术领域 | 选型 | 版本 | 说明 |
|---------|-----|------|-----|
| 前端框架 | React | 19.x | Server Components, Actions, use() |
| 类型系统 | TypeScript | 5.x | 严格模式 |
| 白板引擎 | @excalidraw/excalidraw | latest | 无限画布 |
| 视频录制 | WebCodecs API | - | VideoEncoder/VideoDecoder |
| 视频转换 | @ffmpeg/ffmpeg | 0.12.x | 浏览器内 FFmpeg |
| 状态管理 | Zustand | 5.x | 轻量级状态管理 |
| UI 组件 | shadcn/ui | - | 基于 Radix + Tailwind |
| 样式方案 | Tailwind CSS | 3.x | 原子化 CSS |
| 后端服务 | Supabase | - | Auth, Database, Storage, Edge Functions |
| 支付服务 | Stripe | - | 订阅管理 |
| 部署平台 | Vercel | - | 前端部署 |
| 域名管理 | Namecheap | - | 域名注册 |
| 数据分析 | PostHog | - | 产品分析 |
| 国际化 | i18next | - | 多语言支持 |
| 图标 | Lucide React | - | 与 Excalidraw 一致 |

---

*文档版本：1.0*
*最后更新：2026-03-23*
