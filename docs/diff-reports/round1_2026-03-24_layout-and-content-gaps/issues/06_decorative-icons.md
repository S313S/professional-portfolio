# 问题 #6: 缺少纹章和锚装饰图标

- **严重程度**: 🟡主要
- **类别**: 结构
- **文件**: `src/components/CareerDetailSection.tsx`
- **代码位置**: 第 374 行（eyebrow 上方）和第 389 行（supportingTitle 上方）

## 期望效果

- CHRONICLE 眉标（eyebrow）上方应有一个纹章/盾牌图标
- 辅助标题（supportingTitle）前应有一个锚/指南针图标
- 图标为装饰性质，棕色半透明，与复古档案风格一致

## 当前问题

两处均无装饰图标，文字直接显示。

## 修复指令

有两种方案，任选其一：

**方案 A：使用 Lucide React（项目已安装，推荐）**

```tsx
import { Anchor, Shield } from 'lucide-react';

// 第 374 行 eyebrow <p> 之前插入：
<Shield className="mb-2 h-6 w-6 text-[#7f6854]/40" />

// 第 389 行 supportingTitle <h4> 之前插入：
<Anchor className="mb-2 h-5 w-5 text-[#7f6854]/40" />
```

**方案 B：使用自定义图片素材（如果素材已就位）**

```tsx
// 第 374 行 eyebrow <p> 之前插入：
<img src="/images/careerDetail_crest.png" alt="" className="mb-2 h-8 w-auto opacity-60" />

// 第 389 行 supportingTitle <h4> 之前插入：
<img src="/images/careerDetail_anchor.png" alt="" className="mb-2 h-6 w-auto opacity-60" />
```

如果 `/public/images/` 下已有 `careerDetail_crest.png` 和 `careerDetail_anchor.png`，优先使用方案 B；否则使用方案 A。

## 验证方式

- 运行 `npm run dev`，确认 CHRONICLE 眉标上方出现纹章图标
- 确认辅助标题上方出现锚图标
- 确认图标颜色为棕色半透明，与整体风格协调
- 确认图标不影响文字排版和间距

## 不要修改

- 三栏布局结构（标签页 | 内容 | 面板）
- 背景图片和 #ece2d0 色调
- Playfair Display 衬线字体
- 标签页切换交互功能
- 滚动吸附行为
- 移动端响应式布局
- 眉标和辅助标题的文字内容
- 图标以外的卡片内部元素

---

> 修复完成后，请将你的思路和操作步骤写入：
> `fix-logs/06_decorative-icons_log.md`
>
> 日志格式：
> 1. **理解**：你对这个问题的理解
> 2. **分析**：你检查了哪些代码，发现了什么
> 3. **方案**：你选择的修复方案及原因
> 4. **改动**：具体修改了哪些文件的哪些行
> 5. **验证**：你如何确认修复成功
> 6. **遗留**：是否有未解决的问题或担忧
