# Excalicord 设计系统规范

> **版本**：1.0
> **更新日期**：2026-03-23
> **文档位置**：`/Users/caiyuanjie/Desktop/Projects/excalicord4/docs/design-system.md`

---

## 目录

1. [设计原则](#1-设计原则)
2. [颜色系统](#2-颜色系统)
3. [字体系统](#3-字体系统)
4. [间距系统](#4-间距系统)
5. [阴影系统](#5-阴影系统)
6. [动效规范](#6-动效规范)
7. [组件规范](#7-组件规范)

---

## 1. 设计原则

### 1.1 核心原则

1. **保持 Excalidraw 美学** — 手绘风格、简洁、专注内容
2. **界面层次分明** — 通过阴影和间距区分层级
3. **操作直观可见** — 工具图标清晰、状态反馈明确
4. **暗色/亮色双主题** — 支持用户偏好

### 1.2 设计价值观

- **清晰优先**：界面元素清晰可见，不模糊
- **高效交互**：减少操作步骤，提高效率
- **一致体验**：整个应用保持一致的设计语言
- **可访问性**：支持键盘导航和屏幕阅读器

---

## 2. 颜色系统

### 2.1 主色调 (Primary)

| Token | 色值 | 用途 |
|-------|------|------|
| primary-50 | #eff6ff | Primary 浅色背景 |
| primary-100 | #dbeafe | Primary 浅色背景 |
| primary-200 | #bfdbfe | Primary 浅色背景 |
| primary-300 | #93c5fd | Primary 浅色背景 |
| primary-400 | #60a5fa | Primary 中等亮度 |
| primary-500 | #3b82f6 | Primary 中等 |
| primary-600 | #2563eb | Primary 主色 |
| primary-700 | #1d4ed8 | Primary 深色 |
| primary-800 | #1e40af | Primary 深色 |
| primary-900 | #1e3a8a | Primary 最深色 |

### 2.2 次要色 (Secondary)

| Token | 色值 | 用途 |
|-------|------|------|
| secondary-50 | #f5f3ff | Secondary 浅色背景 |
| secondary-100 | #ede9fe | Secondary 浅色背景 |
| secondary-500 | #8b5cf6 | Secondary 中等 |
| secondary-600 | #7c3aed | Secondary 主色 |
| secondary-700 | #6d28d9 | Secondary 深色 |

### 2.3 强调色 (Accent)

| Token | 色值 | 用途 |
|-------|------|------|
| accent-50 | #fffbeb | Accent 浅色背景 |
| accent-100 | #fef3c7 | Accent 浅色背景 |
| accent-500 | #f59e0b | Accent 中等 |
| accent-600 | #d97706 | Accent 主色（录制状态） |

### 2.4 功能色

| Token | 色值 | 用途 |
|-------|------|------|
| success-500 | #10b981 | 成功状态 |
| success-600 | #059669 | 成功状态深色 |
| error-500 | #ef4444 | 错误状态 |
| error-600 | #dc2626 | 错误状态深色 |
| warning-500 | #f59e0b | 警告状态 |
| warning-600 | #d97706 | 警告状态深色 |

### 2.5 中性色

| Token | 亮色模式 | 暗色模式 | 用途 |
|-------|---------|---------|------|
| bg-primary | #ffffff | #0a0a0a | 主背景 |
| bg-secondary | #f9fafb | #171717 | 次要背景 |
| bg-tertiary | #f3f4f6 | #262626 | 卡片/面板背景 |
| canvas-bg | #fafafa | #1a1a1a | 白板背景 |
| border-default | #e5e7eb | #303030 | 默认边框 |
| border-strong | #d1d5db | #525252 | 强调边框 |
| text-primary | #111827 | #fafafa | 主文本 |
| text-secondary | #6b7280 | #a1a1aa | 次要文本 |
| text-tertiary | #9ca3af | #71717a | 辅助文本 |

---

## 3. 字体系统

### 3.1 字体家族

| Token | 值 | 用途 |
|-------|-----|------|
| font-sans | Inter, system-ui, sans-serif | 主字体 |
| font-mono | JetBrains Mono, Consolas, monospace | 代码字体 |

### 3.2 字号

| Token | 值 | 用途 |
|-------|-----|------|
| text-xs | 12px / 0.75rem | 标签、注释 |
| text-sm | 14px / 0.875rem | 次要文本、按钮 |
| text-base | 16px / 1rem | 正文 |
| text-lg | 18px / 1.125rem | 较大正文 |
| text-xl | 20px / 1.25rem | 标题 H3 |
| text-2xl | 24px / 1.5rem | 标题 H2 |
| text-3xl | 30px / 1.875rem | 标题 H1 |
| text-4xl | 36px / 2.25rem | 大标题 |

### 3.3 字重

| Token | 值 | 用途 |
|-------|-----|------|
| font-normal | 400 | 正文 |
| font-medium | 500 | 按钮、标签 |
| font-semibold | 600 | 小标题 |
| font-bold | 700 | 大标题 |

### 3.4 行高

| Token | 值 | 用途 |
|-------|-----|------|
| leading-tight | 1.25 | 标题 |
| leading-normal | 1.5 | 正文 |
| leading-relaxed | 1.625 | 较长文本 |

---

## 4. 间距系统

### 4.1 基础间距

基于 4px 网格系统：

| Token | 值 | 用途 |
|-------|-----|------|
| space-0 | 0 | 无间距 |
| space-1 | 4px | 基础单位 |
| space-2 | 8px | 紧凑间距 |
| space-3 | 12px | 组件内间距-小 |
| space-4 | 16px | 组件内间距-中 |
| space-5 | 20px | 组件内间距-大 |
| space-6 | 24px | 组件外间距 |
| space-8 | 32px | 页面边距 |
| space-10 | 40px | 区块间距 |
| space-12 | 48px | 大区块间距 |
| space-16 | 64px | 页面级别间距 |

### 4.2 布局间距

| Token | 值 | 用途 |
|-------|-----|------|
| header-height | 48px | 顶部导航栏 |
| sidebar-width | 64px | 幻灯片导航 |
| panel-width | 280px | 右侧面板 |
| controlbar-height | 64px | 录制控制栏 |

---

## 5. 阴影系统

### 5.1 阴影级别

| Token | 值 | 用途 |
|-------|-----|------|
| shadow-xs | 0 1px 2px rgba(0,0,0,0.05) | 轻微阴影 |
| shadow-sm | 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) | 卡片阴影 |
| shadow-md | 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06) | 面板阴影 |
| shadow-lg | 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05) | 弹出阴影 |
| shadow-xl | 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04) | 模态阴影 |
| shadow-2xl | 0 25px 50px rgba(0,0,0,0.25) | 最大阴影 |

### 5.2 特殊阴影

| Token | 值 | 用途 |
|-------|-----|------|
| shadow-camera-bubble | 0 4px 12px rgba(0,0,0,0.15) | 摄像头气泡 |
| shadow-recording | 0 0 0 3px rgba(239,68,68,0.4) | 录制状态 |

---

## 6. 动效规范

### 6.1 时长

| Token | 值 | 用途 |
|-------|-----|------|
| duration-fast | 150ms | 微交互 |
| duration-normal | 250ms | 面板展开 |
| duration-slow | 300ms | 页面切换 |
| duration-slower | 500ms | 复杂动画 |

### 6.2 缓动函数

| Token | 值 | 用途 |
|-------|-----|------|
| easing-default | cubic-bezier(0, 0, 0.2, 1) | 默认 |
| easing-in | cubic-bezier(0.4, 0, 1, 1) | 进入 |
| easing-out | cubic-bezier(0, 0, 0.2, 1) | 退出 |
| easing-in-out | cubic-bezier(0.4, 0, 0.2, 1) | 双向 |
| easing-bounce | cubic-bezier(0.68, -0.55, 0.265, 1.55) | 弹性 |

### 6.3 录制脉冲动画

```css
@keyframes recording-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

.recording-indicator {
  animation: recording-pulse 1s ease-in-out infinite;
}
```

---

## 7. 组件规范

### 7.1 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| radius-none | 0 | 无圆角 |
| radius-sm | 4px | 小按钮、标签 |
| radius-md | 8px | 按钮、输入框 |
| radius-lg | 12px | 卡片、面板 |
| radius-xl | 16px | 摄像头气泡 |
| radius-2xl | 24px | 大面板 |
| radius-full | 9999px | 全圆角（头像） |

### 7.2 图标尺寸

| Token | 值 | 用途 |
|-------|-----|------|
| icon-sm | 16px | 小图标 |
| icon-md | 20px | 中等图标 |
| icon-lg | 24px | 大图标 |
| icon-xl | 32px | 特大图标 |

---

*文档版本：1.0*
*最后更新：2026-03-23*
