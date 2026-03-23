# Excalicord 产品策划方案

> **项目概述**：基于 Excalidraw 无限白板的视频录制与演示平台
> **版本**：1.0
> **更新日期**：2026-03-23
> **文档位置**：`/Users/caiyuanjie/Desktop/Projects/excalicord4/docs/product-spec.md`

---

## 目录

1. [产品定位与核心功能](#1-产品定位与核心功能)
2. [用户界面设计](#2-用户界面设计)
3. [交互设计规范](#3-交互设计规范)
4. [市场策略与定价](#4-市场策略与定价)
5. [视觉设计规范](#5-视觉设计规范)
6. [设计系统与 Design Tokens](#6-设计系统与-design-tokens)
7. [组件规范与 Storybook](#7-组件规范与-storybook)
8. [自动化视觉回归测试](#8-自动化视觉回归测试)
9. [Figma 原型与协作](#9-figma-原型与协作)
10. [MDX 交互式文档](#10-mdx-交互式文档)

---

## 1. 产品定位与核心功能

### 1.1 产品定位

**Excalicord** — 一款专为内容创作者、教育工作者和企业培训师设计的**白板视频创作平台**。它将 Excalidraw 的无限白板体验与专业视频录制能力结合，让用户能够轻松创建具有视觉冲击力的演示视频。

### 1.2 目标用户画像

| 用户类型 | 核心需求 | 使用场景 |
|---------|---------|---------|
| 在线教育者 | 录制课程、制作教学内容 | 老师录制数学/物理等需要绘图讲解的课程 |
| 技术博主 | 技术分享、代码演示 | 程序员录制教程、技术演讲 |
| 企业培训师 | 员工培训、产品演示 | 制作内部培训视频、销售演示 |
| 内容创作者 | 短视频创作、社交媒体内容 | YouTube短视频、抖音内容创作 |

### 1.3 核心功能矩阵

```
┌─────────────────────────────────────────────────────────────┐
│                      Excalicord 核心功能                      │
├─────────────────────────────────────────────────────────────┤
│  🎨 无限白板    │ Excalidraw 引擎 │ 手绘动画 │ 无限画布      │
├─────────────────────────────────────────────────────────────┤
│  📹 视频录制    │ 摄像头气泡      │ 屏幕注解  │ 音视频同步    │
├─────────────────────────────────────────────────────────────┤
│  🤖 AI 虚拟形象  │ 虚拟主播       │ 多种形象  │ 代替真人摄像头 │
├─────────────────────────────────────────────────────────────┤
│  ✨ 美颜滤镜    │ 基础美颜        │ 磨皮美白  │ 瘦脸调整      │
├─────────────────────────────────────────────────────────────┤
│  📤 多种导出    │ MP4 (H.264)    │ WebM     │ GIF          │
├─────────────────────────────────────────────────────────────┤
│  📑 幻灯片导航  │ 帧标记         │ 场景切换  │ 自动播放      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 用户界面设计

### 2.1 整体布局架构

```
┌────────────────────────────────────────────────────────────────────┐
│  Header Bar (48px)                                                │
│  [Logo] [Project Name] [Auto-save Status]    [Share] [Export] [⋮]│
├──────────┬───────────────────────────────────────────────┬─────────┤
│          │                                               │         │
│  Slide   │                                               │  Right  │
│  Rail    │           Excalidraw Canvas                  │  Panel  │
│  (64px)  │           (无限白板)                          │  (280px)│
│          │                                               │         │
│  [1]     │    ┌──────────┐                              │ Toolbar │
│  [2]     │    │ Camera   │                              │ ──────  │
│  [3]     │    │ Bubble   │                              │ Draw    │
│  [+]     │    └──────────┘                              │ Text    │
│          │                                               │ Shapes  │
│          │                                               │ Image   │
│          │                                               │ ──────  │
│          │                                               │ Beautify│
│          │                                               │ Effects │
├──────────┴───────────────────────────────────────────────┴─────────┤
│  Recording Control Bar (64px)                                     │
│  [⏺ Record] [⏸ Pause] [⏹ Stop]  [⏱ 00:05:23]  [Camera] [Mic]   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 界面层次说明

| 层次 | 组件 | 职责 |
|-----|------|-----|
| L1 | Excalidraw Canvas | 无限白板核心，绘图、手写、导入图片 |
| L2 | Camera Bubble Overlay | 摄像头气泡，可拖拽、缩放、样式切换 |
| L3 | Recording Controls | 录制控制栏，开始/暂停/停止/预览 |
| L4 | Slide Navigation Rail | 幻灯片导航条，快速切换场景 |
| L5 | Right Toolbar Panel | 右侧工具面板，绘图工具、美颜设置 |

### 2.3 关键交互设计

#### 摄像头气泡交互
- 拖拽：按住气泡顶部区域拖动
- 缩放：右下角缩放手柄
- 样式切换：右键菜单或设置面板
- 位置预设：左下角、右下角、左上角、右上角、画布中心

#### 录制流程交互
```
录制流程：
1. 点击 [Record] → 3秒倒计时
2. 开始录制 → 画布操作+摄像头同步记录
3. 点击 [Pause] → 暂停当前段
4. 再次点击 [Record] → 继续录制下一段
5. 点击 [Stop] → 停止录制，进入预览
6. 预览界面 → 可回放、重新录制或导出
```

#### 幻灯片导航交互
- 点击缩略图：跳转到对应场景
- 拖拽缩略图：调整场景顺序
- 双击缩略图：重命名场景
- 右键菜单：复制、删除、插入新场景

---

## 3. 交互设计规范

### 3.1 颜色系统

| 用途 | 色值 | 说明 |
|-----|------|-----|
| Primary | #2563EB | 主色调，按钮、链接、焦点状态 |
| Secondary | #7C3AED | 次要色，AI功能、特殊操作 |
| Accent | #F59E0B | 强调色，录制状态、警示 |
| Success | #10B981 | 成功状态 |
| Error | #EF4444 | 错误状态 |
| Background | #FFFFFF | 主背景 |
| Surface | #F3F4F6 | 卡片/面板背景 |
| Canvas BG | #FAFAFA | 白板背景 |
| Text Primary | #111827 | 主文本 |
| Text Secondary | #6B7280 | 次要文本 |

### 3.2 字体系统

| 用途 | 字体 | 字号/字重 |
|-----|------|---------|
| 标题 H1 | Inter | 24px / 700 |
| 标题 H2 | Inter | 20px / 600 |
| 正文 | Inter | 14px / 400 |
| 按钮 | Inter | 14px / 500 |
| 标签 | Inter | 12px / 500 |
| 代码 | JetBrains Mono | 13px / 400 |

### 3.3 间距系统

- 基础单位：4px
- 间距递进：4, 8, 12, 16, 24, 32, 48, 64
- 组件内间距：12px (小)、16px (中)、24px (大)
- 组件外间距：8px (小)、16px (中)、24px (大)

### 3.4 动效规范

| 动效类型 | 时长 | 缓动函数 | 使用场景 |
|---------|------|---------|---------|
| 微交互 | 150ms | ease-out | 按钮悬停、点击反馈 |
| 面板展开 | 250ms | ease-in-out | 侧边栏展开、菜单弹出 |
| 页面切换 | 300ms | ease-in-out | 场景切换、视图切换 |
| 录制脉冲 | 1000ms | ease-in-out | 录制中状态指示（循环） |

---

## 4. 市场策略与定价

### 4.1 竞品分析

| 竞品 | 定位 | 优势 | 劣势 |
|-----|------|-----|-----|
| Loom | 屏幕录制 | 简单易用、集成丰富 | 白板能力弱、无AI虚拟形象 |
| Vidyard | 企业视频 | 强大的分析功能 | 界面复杂、价格高 |
| Doceri | 白板教学 | 专业的教学工具 | 只能在iPad使用 |
| Excalidraw | 无限白板 | 体验优秀、开源免费 | 无录制能力 |

### 4.2 差异化定位

**"Excalidraw 原生体验 + 专业视频能力"**
- 不是把白板当作附加功能，而是让白板成为视频创作的核心
- 保留 Excalidraw 的手绘美学和无限画布体验
- 专业视频能力（多格式导出、摄像头气泡、AI虚拟形象）

### 4.3 订阅计划设计

```
┌────────────────┬─────────────┬─────────────┬─────────────┐
│    功能        │    免费      │    专业      │    团队      │
│                │   $0/月     │   $19/月    │   $49/月    │
├────────────────┼─────────────┼─────────────┼─────────────┤
│ 录制时长       │  10分钟/月   │  60分钟/月   │  300分钟/月  │
│ 项目数量       │  3个        │  无限        │  无限        │
│ 导出格式       │  MP4 720p   │  MP4 1080p  │  全部格式    │
│ 摄像头气泡     │  ✓          │  ✓          │  ✓          │
│ AI 虚拟形象   │  ✗          │  ✓          │  ✓          │
│ 基础美颜       │  ✗          │  ✓          │  ✓          │
│ 品牌去除       │  ✗          │  ✗          │  ✓          │
│ 团队协作       │  ✗          │  ✗          │  ✓          │
│ 优先支持       │  社区        │  邮件        │  专属        │
│ API 访问       │  ✗          │  ✗          │  ✓          │
└────────────────┴─────────────┴─────────────┴─────────────┘
```

### 4.4 用量计费（超出配额）

- 录制时长：$0.05/分钟
- 额外导出：$0.10/次
- 存储空间：$0.10/GB/月

---

## 5. 视觉设计规范

### 5.1 设计原则

1. **保持 Excalidraw 美学** — 手绘风格、简洁、专注内容
2. **界面层次分明** — 通过阴影和间距区分层级
3. **操作直观可见** — 工具图标清晰、状态反馈明确
4. **暗色/亮色双主题** — 支持用户偏好

### 5.2 图标系统

- 使用 Lucide Icons（与 Excalidraw 一致）
- 图标尺寸：16px (小)、20px (中)、24px (大)
- 图标粗细：1.5px stroke

### 5.3 品牌视觉

- Logo：融合 Excalidraw 手绘风格 + 录制按钮元素
- 品牌色：#2563EB (Primary Blue)
- Slogan：**"Turn Your Ideas Into Videos"**

---

## 6. 设计系统与 Design Tokens

### 6.1 设计系统架构

```
design-system/
├── tokens/
│   ├── colors.json          # 颜色 Token
│   ├── typography.json      # 字体 Token
│   ├── spacing.json         # 间距 Token
│   ├── shadows.json         # 阴影 Token
│   └── motion.json          # 动效 Token
├── figma/
│   ├── components/          # Figma 组件库
│   └── variables/           # Figma 变量（同步自 tokens）
├── code/
│   ├── css/
│   │   └── variables.css    # CSS 变量（自动生成）
│   ├── tailwind/
│   │   └── theme.ts         # Tailwind 配置（自动生成）
│   └── types/
│       └── tokens.ts         # TypeScript 类型（自动生成）
└── storybook/
    └── stories/              # Storybook 组件故事
```

### 6.2 Color Tokens

```json
{
  "color": {
    "primary": {
      "50": { "value": "#eff6ff", "description": "Primary 50" },
      "100": { "value": "#dbeafe", "description": "Primary 100" },
      "500": { "value": "#3b82f6", "description": "Primary 500" },
      "600": { "value": "#2563eb", "description": "Primary 600" },
      "700": { "value": "#1d4ed8", "description": "Primary 700" }
    },
    "accent": {
      "value": "#f59e0b",
      "description": "录制状态、警示"
    },
    "canvas": {
      "light": { "value": "#fafafa", "description": "白板背景-亮色" },
      "dark": { "value": "#1a1a1a", "description": "白板背景-暗色" }
    }
  }
}
```

### 6.3 Typography Tokens

```json
{
  "font": {
    "family": {
      "sans": { "value": "Inter, system-ui, sans-serif" },
      "mono": { "value": "JetBrains Mono, monospace" }
    },
    "size": {
      "xs": { "value": "12px" },
      "sm": { "value": "14px" },
      "base": { "value": "16px" },
      "lg": { "value": "18px" },
      "xl": { "value": "20px" },
      "2xl": { "value": "24px" }
    },
    "weight": {
      "normal": { "value": "400" },
      "medium": { "value": "500" },
      "semibold": { "value": "600" },
      "bold": { "value": "700" }
    }
  }
}
```

### 6.4 Spacing Tokens

```json
{
  "spacing": {
    "1": { "value": "4px", "description": "基础单位" },
    "2": { "value": "8px", "description": "组件内间距-小" },
    "3": { "value": "12px", "description": "组件内间距-中" },
    "4": { "value": "16px", "description": "组件内间距-大" },
    "6": { "value": "24px", "description": "组件外间距" },
    "8": { "value": "32px", "description": "页面边距" }
  }
}
```

### 6.5 Motion Tokens

```json
{
  "motion": {
    "duration": {
      "fast": { "value": "150ms", "description": "微交互" },
      "normal": { "value": "250ms", "description": "面板展开" },
      "slow": { "value": "300ms", "description": "页面切换" }
    },
    "easing": {
      "default": { "value": "ease-out" },
      "inOut": { "value": "ease-in-out" },
      "bounce": { "value": "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
    }
  }
}
```

---

## 7. 组件规范与 Storybook

### 7.1 组件分类

| 类别 | 示例组件 | 说明 |
|-----|---------|-----|
| Primitives | Button, Input, Dialog | 基础 UI 组件 |
| Canvas | ExcalidrawCanvas, CameraBubble | 画布相关组件 |
| Recording | RecordingControls, PreviewPlayer | 录制相关组件 |
| Slides | SlideRail, SlideThumbnail | 幻灯片组件 |
| Layout | Header, MainLayout, RightPanel | 布局组件 |

### 7.2 组件开发规范

```typescript
// 组件文件结构
components/
├── ui/
│   └── button/
│       ├── Button.tsx           # 组件实现
│       ├── Button.stories.tsx   # Storybook 故事
│       ├── Button.test.tsx      # 单元测试
│       └── index.ts              # 导出
```

### 7.3 Storybook 故事模板

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Recording: Story = {
  args: {
    variant: 'primary',
    children: '开始录制',
    leftIcon: '⏺',
  },
};
```

### 7.4 Design QA 检查清单

每个组件完成后需检查：
- [ ] 颜色符合 Design Token
- [ ] 字体符合 Typography Token
- [ ] 间距符合 Spacing Token
- [ ] 支持暗色/亮色主题
- [ ] 支持键盘导航
- [ ] 支持屏幕阅读器
- [ ] 动效符合 Motion Token
- [ ] 有对应的 Storybook 故事
- [ ] 有单元测试覆盖

---

## 8. 自动化视觉回归测试

### 8.1 测试工具选型

| 工具 | 用途 | 说明 |
|-----|-----|-----|
| Playwright | 视觉回归测试 | 截图对比、组件截图 |
| Chromatic | Storybook 视觉测试 | 云端视觉diff |
| Percy | CI/CD 集成测试 | 自动视觉回归 |

### 8.2 测试策略

```typescript
// visual-tests/components/Button.visual.test.ts
import { test, expect } from '@playwright/test';
import { serialize } from 'css-snapshot';

test.describe('Button Visual Regression', () => {
  test('primary button matches design', async ({ page }) => {
    await page.goto('/iframe.html?id=ui-button--primary');
    const button = page.locator('button');

    // 验证样式
    const styles = await button.evaluate(el => serialize(window.getComputedStyle(el)));
    expect(styles).toMatchSnapshot('button-primary.css');
  });

  test('recording button in dark mode', async ({ page }) => {
    await page.goto('/iframe.html?id=ui-button--recording');
    await page.emulateMedia({ colorScheme: 'dark' });

    await expect(page).toHaveScreenshot('button-recording-dark.png');
  });
});
```

### 8.3 CI/CD 集成

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build-storybook
      - uses: chromaui/action@v10
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

---

## 9. Figma 原型与协作

### 9.1 Figma 文件结构

```
Excalicard Design/
├── 📄 Cover (项目封面)
├── 📋 Design System (设计规范)
│   ├── 🎨 Colors
│   ├── 📝 Typography
│   ├── 📐 Spacing
│   ├── 🔳 Components
│   └── 🎬 Interactions
├── 📱 Screens (页面设计)
│   ├── Dashboard
│   ├── Canvas Editor
│   ├── Recording View
│   └── Settings
└── 📐 Prototype (可交互原型)
    └── Recording Flow
```

### 9.2 关键交互流程设计

| 流程 | Figma Prototype 链接 | 视频演示 |
|-----|---------------------|---------|
| 录制流程 | [链接] | [视频] |
| 导出流程 | [链接] | [视频] |
| 幻灯片导航 | [链接] | [视频] |
| 摄像头气泡调整 | [链接] | [视频] |

---

## 10. MDX 交互式文档

### 10.1 文档结构

```
docs/
├── getting-started/
│   ├── installation.mdx
│   └── quick-start.mdx
├── components/
│   ├── button.mdx
│   ├── camera-bubble.mdx
│   └── recording-controls.mdx
├── guides/
│   ├── recording-guide.mdx
│   └── export-guide.mdx
└── api/
    ├── hooks/
    │   ├── useSlides.mdx
    │   └── useRecording.mdx
    └── services/
        ├── video-recorder.mdx
        └── beauty-filter.mdx
```

### 10.2 MDX 文档示例

```mdx
# CameraBubble 组件

摄像头气泡组件，用于在画布上显示摄像头画面。

## 基本用法

```tsx live
function Demo() {
  const [position, setPosition] = useState({ x: 100, y: 100 });

  return (
    <CameraBubble
      stream={mockStream}
      position={position}
      onPositionChange={setPosition}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| stream | MediaStream | null | 视频流 |
| position | { x: number, y: number } | { x: 0, y: 0 } | 位置 |
| size | { width: number, height: number } | { width: 200, height: 150 } | 尺寸 |

## 设计规格

- **气泡形状**: 圆角矩形 (border-radius: 12px)
- **边框**: 2px solid white, 带阴影
- **位置**: 可拖拽，吸附到预设位置（左下/右下/左上/右上）
```

---

*方案版本：1.0*
*最后更新：2026-03-23*
