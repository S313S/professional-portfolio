# CareerDetailSection 按钮覆盖修复案例

## 说明

这份文档用于训练与复盘，记录的是：

- 用户是如何逐步表达需求的
- 我在每一轮是如何做外显分析与实现决策的
- 遇到问题后采用了什么处理方式

这不是内部逐字思维转录，而是可用于训练的工程化工作总结。

## 项目背景

- 项目路径：`/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio`
- 主要模块：`src/components/CareerDetailSection.tsx`
- 目标问题：桌面端左侧三个纸片按钮没有与背景图中的纸片区域完全重合

## 对话过程摘要

### 第 1 轮

用户要求：

> 在 `CareerDetailSection` 页面，将图片中按钮的位置移动到跟实际的背景图重叠。

我先做的事：

- 搜索并定位 `CareerDetailSection` 组件
- 读取桌面端布局实现
- 确认左侧三个按钮的定位逻辑

我的外显判断：

- 这是桌面端布局问题，不是移动端问题
- 原实现中，左侧按钮位于一个额外的小容器里
- 按钮的百分比定位相对这个小容器计算，导致发生二次缩放，所以整体漂到左上角

采取的动作：

- 先补一个渲染回归测试
- 然后把按钮从“小容器内定位”改为“主舞台坐标系定位”

### 第 2 轮

用户补充：

> 不是只要压在背景图对应纸片区域上，而是要完全覆盖掉背景图对应纸片区域。

我的外显判断：

- 需求从“粗略重叠”升级成“覆盖式对齐”
- 不能再只靠大致百分比微调，需要更接近背景图真实纸片范围

采取的动作：

- 把图片填充方式改成完整铺满按钮框
- 将按钮改为更接近整张纸片的覆盖尺寸

### 第 3 轮

用户继续追问：

> 你是怎么判断左侧三个按钮跟背景图中需要覆盖的纸片区域是否覆盖一致的呢？

我的回答策略：

- 解释“同一坐标系”原则
- 说明之前是用背景图整体坐标而不是小容器坐标
- 说明当时仍然不是像素级精确，只是工程上的比例对齐

### 第 4 轮

用户进一步明确：

> 目前的效果并不好，我要的是视觉上 100% 像素级重合。同时，为了保险，请将你此次为了修复问题而做的相关代码进行注释，并且告知我在哪里，后续方便我手动去代码里直接修改。

我的外显判断：

- 纯靠 CSS 百分比肉眼微调已经不够
- 需要把“可调参数”显式暴露出来
- 需要给用户一个后续可手调的稳定入口

采取的动作：

- 读取背景图和三个按钮素材的真实像素尺寸
- 将桌面端按钮定位从“百分比猜测”切换为“背景图像素锁定”
- 在代码里加入明确注释
- 把可手调区域集中到一个参数表中

### 第 5 轮

用户逐步反馈修复结果：

- `careerDetail_share_icon.png` 已修复成功
- `workExperience` 和 `industryKnowledge` 仍未完全覆盖

后续的工作模式变成：

- 不再改定位算法
- 只微调 `workExperience` 和 `industryKnowledge` 的像素框
- 每一轮都根据用户截图反馈，调整 `x / y / width / height`

## 我是怎么思考和处理问题的

这里记录的是外显工程思路，不是内部逐字推理。

### 1. 先确认问题属于哪一层

我先区分问题是：

- 数据问题
- 素材问题
- 布局坐标系问题
- 图片缩放策略问题

结论是：

- 第一阶段的根因主要是布局坐标系错误
- 后续阶段的根因主要是对覆盖框的估计不够精确

### 2. 先修坐标系，再修像素框

我没有一开始就不停改数值，而是先处理结构性问题：

- 先把按钮从错误的小容器坐标系里移出来
- 让按钮和背景图参考同一个舞台坐标系

这样做的原因是：

- 如果坐标系不对，后面的所有微调都是不稳定的
- 先修结构，再微调数值，后续维护成本更低

### 3. 当百分比方案不够时，切换到像素锁定方案

用户明确提出要“视觉上 100% 像素级重合”后，我判断：

- 百分比布局适合相对定位
- 但不适合这种“覆盖背景图里已有烘焙素材”的需求

因此改为：

- 使用背景原图尺寸
- 用背景图中的原始像素框来定义三个按钮的目标区域
- 再通过 `object-cover` 的实际缩放比例，把这些像素框换算成浏览器中的真实位置

### 4. 把可调参数从实现逻辑里剥离出来

用户后续需要自己手动改，所以我把最关键的可变部分收束为一个参数区：

- `CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS`

这样后续手调时：

- 不必理解整套换算逻辑
- 只需要修改 `x / y / width / height`

### 5. 每轮只做最小必要改动

在后续多轮微调中，我刻意遵循：

- 已经对齐的 `sharingJourney` 不再动
- 只调 `workExperience`
- 只调 `industryKnowledge`
- 定位算法不再动

这样可以避免：

- 修一个，坏另一个
- 每轮变更范围过大，难以归因

## 遇到的问题，以及我是怎么处理的

### 问题 1：一开始误以为只需要“重叠”，不是“完全覆盖”

现象：

- 用户最初的描述可以理解成“压上去”
- 后续用户明确要“完全覆盖”

处理方式：

- 接收需求升级
- 从相对定位微调切换为覆盖式对齐思路

### 问题 2：单纯使用百分比定位，无法稳定做到像素级重合

现象：

- 纸片按钮和背景图纸片有明显偏差
- 不同纸片的偏差方向不一致

处理方式：

- 停止继续纯靠百分比硬调
- 改成“背景图像素锁定”方案

### 问题 3：需要直接使用图像匹配，但本地分析环境受限

现象：

- 试图用本地图像库时发现 `PIL`、`cv2`、`numpy` 不可用
- 使用 Playwright 时，沙箱环境下浏览器启动受到限制

处理方式：

- 先退回到可行的基础方法：读取图片像素尺寸
- 然后申请一次受控的 Playwright 运行
- 通过浏览器侧 `canvas` 做局部图像匹配，得到更接近真实背景纸片的像素框

### 问题 4：图像匹配第一次命中了错误区域

现象：

- `industryKnowledge` 初次匹配到了错误的中间纸片区域

处理方式：

- 收紧搜索窗口
- 把三个按钮拆开，分不同纵向区间单独匹配
- 避免模板在错误区域上得到局部最优解

### 问题 5：用户需要后续自己修改

现象：

- 用户不仅要修好，还要求后续能手动维护

处理方式：

- 在代码里加注释
- 明确指出唯一应该手调的参数区
- 在回复中给出精确文件位置

## 最终采用的实现方案

### 核心方案

桌面端左侧三个按钮采用“背景图像素锁定”方案：

1. 背景图以 `object-cover` 方式渲染
2. 根据当前舞台尺寸，计算背景图实际显示时的缩放比例与裁切偏移
3. 使用背景图原始像素框来换算每个按钮的 `left / top / width / height`
4. 将这三个按钮作为独立 overlay 层渲染在背景图上

### 参数入口

手动可调区域位于：

- [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L160)

其中这段最关键：

```ts
const CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS: Record<CareerDetailTabKey, PixelRect>
```

用户后续需要修改时，只改：

- `x`
- `y`
- `width`
- `height`

### 换算逻辑位置

换算逻辑位于：

- [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L185)

主要函数：

- `getCoveredImageFrame`
- `getDesktopTabStyle`

### overlay 渲染位置

桌面端 overlay 渲染位于：

- [`src/components/CareerDetailSection.tsx`](/Users/xiaoci/Downloads/Workspace/VibeCoding/personal_brand/professional-portfolio/src/components/CareerDetailSection.tsx#L322)

用于识别的标记：

- `data-career-detail-tab-overlay="desktop"`
- `data-career-detail-tab-positioning="background-pixel-lock"`

## 验证方式

每轮修改后，我都做了两个层级的验证：

### 1. 单元/渲染测试

执行：

```bash
node --import tsx --test src/components/CareerDetailSection.logic.test.ts src/components/CareerDetailSection.render.test.tsx
```

目的：

- 保证滚动吸附逻辑未被破坏
- 保证桌面端 overlay 结构仍存在

### 2. 类型检查

执行：

```bash
npm run lint
```

目的：

- 保证新增的像素锁定逻辑没有引入 TypeScript 错误

## 这个案例里的可训练点

### 可学习的做法

- 先修结构性根因，再做数值微调
- 当用户目标升级时，及时切换方案而不是继续硬调旧方案
- 把“可变参数”和“稳定算法”分开
- 每轮只改最小必要范围，避免回归
- 给用户留下明确的后续手调入口

### 需要注意的点

- 不要把“视觉接近”误判成“像素级重合”
- 不要在坐标系仍然错误时就开始大量调数字
- 图像匹配结果如果不合理，要优先怀疑搜索窗口，而不是直接采用

## 可作为训练数据的结论

这是一个典型的前端视觉对齐修复案例，适合训练以下能力：

- 需求逐轮澄清
- 根因定位
- 从百分比布局切换到像素锁定方案
- 用户反馈驱动的最小迭代修复
- 为后续人工维护预留参数化入口

