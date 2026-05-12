# 友人帐 Supabase 公开共享留言册设计

## 背景

当前友人帐使用代码内置 seed 留言和浏览器 `localStorage` 保存访客进度。这样的实现适合本地互动，但不适合长期保存公开留言：发版时 seed 内容会随代码变化，访客换设备或清理浏览器数据也会丢失自己的留言。

目标是把“访客留言册”接入 Supabase 数据库，让所有访客看到同一套公开留言，并让真实留言独立于前端代码发布周期。

## 推荐方案

采用“前端直连 Supabase + Row Level Security”的静态站方案。

- Supabase 保存公开留言记录。
- 前端使用 publishable/anon key 读取和新增留言。
- RLS 只开放匿名 `select` 和 `insert`。
- 前端不开放 `update` 和 `delete`。
- `localStorage` 继续保存小游戏进度、头像选择、草稿和失败待同步记录。

这个方案符合当前 Vite 静态作品集结构，不需要额外部署服务。Supabase 官方文档说明 publishable key 可以暴露在网页中，但必须依赖 RLS 和权限策略保护数据；`@supabase/supabase-js` 是浏览器端访问 Supabase 的官方客户端。

## 数据模型

创建表 `public.friend_book_entries`：

```sql
create table public.friend_book_entries (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  identity_intro text not null,
  portfolio_review text not null,
  latest_game_id text,
  avatar_id text,
  latest_medal_id text,
  latest_date text,
  client_id text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

约束：

```sql
alter table public.friend_book_entries
  add constraint friend_book_entries_nickname_length
  check (char_length(nickname) between 1 and 32);

alter table public.friend_book_entries
  add constraint friend_book_entries_identity_intro_length
  check (char_length(identity_intro) between 1 and 160);

alter table public.friend_book_entries
  add constraint friend_book_entries_portfolio_review_length
  check (char_length(portfolio_review) between 1 and 220);

alter table public.friend_book_entries
  add constraint friend_book_entries_latest_game_id_check
  check (
    latest_game_id is null
    or latest_game_id in ('between-two-pages', 'moon-run', 'one-stroke-mark')
  );
```

索引：

```sql
create index friend_book_entries_published_created_at_idx
  on public.friend_book_entries (is_published, created_at);
```

RLS：

```sql
alter table public.friend_book_entries enable row level security;

create policy "public can read published friend book entries"
  on public.friend_book_entries
  for select
  to anon
  using (is_published = true);

create policy "public can insert friend book entries"
  on public.friend_book_entries
  for insert
  to anon
  with check (
    is_published = true
    and char_length(nickname) between 1 and 32
    and char_length(identity_intro) between 1 and 160
    and char_length(portfolio_review) between 1 and 220
  );

grant select, insert on public.friend_book_entries to anon;
```

## 前端数据流

新增仓储层，例如 `src/components/FriendBookFinalSection.supabase.ts`：

- 读取环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`。
- 未配置 Supabase 时返回 `disabled` 状态，页面沿用 seed + localStorage。
- `fetchFriendBookEntries()` 从 Supabase 读取 `is_published = true` 的记录，按 `created_at` 正序返回，映射成现有 `FriendBookGuestbookEntry`。
- `createFriendBookEntry()` 插入新留言，成功后返回数据库生成的记录。
- 捕获网络错误，不阻断现有小游戏流程。

页面行为：

1. 首屏先按现有逻辑展示本地 seed 或缓存，避免空白等待。
2. hydration 后异步拉取 Supabase 留言。
3. 拉取成功且返回非空时，用 Supabase 记录替换留言册展示。
4. 拉取失败时保留本地展示，并显示短提示。
5. 用户提交留言时先写 Supabase。
6. 写入成功后把新记录合并进页面，并同步一份到 `localStorage` 缓存。
7. 写入失败时把表单内容保存成待同步草稿，明确提示“未公开发布”。

## 本地数据边界

继续留在 `localStorage` 的数据：

- 小游戏完成次数和奖章。
- 当前选择头像。
- 表单草稿。
- 最近一次成功拉取的公开留言缓存。
- 写入失败的待同步草稿。

进入 Supabase 的数据：

- 公开展示用的留言行。
- 昵称、身份介绍、作品评价。
- 最近游戏、头像、奖章、展示日期。
- 创建和更新时间。

## 错误处理

- Supabase 未配置：页面保持现状，不报错。
- 读取失败：保留本地缓存或 seed，展示轻量状态文案。
- 写入失败：不把记录伪装成已公开留言，只保留草稿并提示稍后重试。
- 数据校验失败：前端限制长度，数据库 constraint 做最后防线。
- 数据滥用：第一阶段不做公开删除入口，由 Supabase 后台人工隐藏或删除。

## 测试策略

- 纯逻辑测试：验证 Supabase row 与 `FriendBookGuestbookEntry` 的双向映射。
- 仓储测试：验证未配置环境变量时禁用、读取成功、写入成功、错误返回。
- 组件渲染测试：验证 Supabase 数据可替换 seed 展示，失败时保留 fallback。
- 类型检查：运行 `npm run lint`。
- 构建验证：运行 `npm run build`。

## 后续增强

- 增加 Edge Function 做限流、敏感词和审核。
- 增加管理页，用 service role 或受保护 API 隐藏留言。
- 增加 Realtime，让多位访客同时打开页面时自动看到新留言。
