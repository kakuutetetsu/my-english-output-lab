# My English Output Lab

科研语境下的个人英语主动输出训练网站。React + TypeScript + Vite，静态托管于 GitHub Pages；没有 Supabase 配置时所有学习功能在本地运行。

## 本地启动

安装 Node.js 22.18 或更高版本，在本目录运行：

```sh
npm ci
npm run dev
```

构建与验证：

```sh
npm test
npm run build
```

`dist/` 是部署产物。不要通过双击 index.html 使用；ES modules 和 PWA 需要 HTTP/HTTPS。配置使用相对 base，支持 `/my-english-output-lab/` 子路径。导航使用应用状态，不依赖服务器 URL 重写。

## 每日使用

1. 在记忆卡片中复习到期条目或学习新卡。完全不会：10 分钟后；不太熟悉：24 小时后；认识：2 天起逐次加倍，最长 180 天。连续三次“认识”显示为已掌握，忘记即重置。
2. 在固定搭配、阅读词汇、易混淆词中搜索、收藏、阅读例句；点击对比词进入释义选择、填空和纠错。
3. 从 22 节句型课选择适合的阶段，完成翻译与句型迁移。
4. 在输出工作室完成中文翻译、搭配造句、句型扩展、纠错或四种考试场景的短回答。先写一句或两句，再添加原因与例子。
5. 输出文本保存为练习历史。参考答案不是唯一正确答案；应用没有接入 AI 评分，不自动判定自由表达的语法正确性或考试分数。

## 内容与来源

- `src/data/source.json`：131 个原文块，包含全部 28 张表、标题、说明与原题；档案页面可全文阅读。
- `src/data/items.json`：193 条手册条目。每条拥有稳定 ID、原始表格行、来源位置、分类、例句与释义。want/hope/plan 拆成独立条目；相同表达在不同表中保留独立语境。
- `src/data/exercises.json`：12 道原始自测题及答案。
- `src/data/grammar.ts`：22 个新增课程及考试迁移话题。
- 教学补充字段（替换表达、错误提醒、词性、中文译文）为本次编辑补充；原始行在 `original` 保留。近义表达依语境使用，不保证可逐词互换。
- `previous_reading: document-claimed` 表示手册标注为以前讨论过，没有原始对话可核验。其他条目为 unknown，不宣称来自你的历史错题。
- 已纠正：原 `not ... but ...` 对应例句误用了 `not only ... but also ...`。原句与译文保留于 original/source，修订说明见 correction。
- 分类澄清：`spend time doing` 不属于介词后 doing；`have difficulty (in) doing` 的 in 可省略，已独立分类。

新增词汇时在 JSON 添加独立 ID（不要重用或修改已有 ID），填写所有教学字段、source 和 source_ref；新增语法课放入 grammar.ts。更新后执行测试和构建。

## 本地保存与备份

进度保存在浏览器 localStorage，包含复习事件、收藏变更、输出历史、草稿和每日目标。页面刷新保留。多个标签页通过 storage 事件合并。JSON 导入先校验版本和事件格式，再按事件 ID 合并，不覆盖旧数据；取消收藏也作为事件保留。

游客和每个登录账号使用独立空间。游客数据不自动上传：先在游客空间导出备份，登录后导入，才会同步该数据。清除站点数据、换浏览器或卸载浏览器可能丢失本地进度，应定期导出。文件大于 20 MB 或含超过 200,000 个事件时拒绝导入。存储失败会提示立即导出，当前会话数据仍保留在内存。

## Supabase 配置

当前发布选择本地模式。以下配置由你创建项目后启用；仓库不包含任何实际凭据。

1. 在 Supabase 控制台创建项目。进入 SQL Editor，执行 `supabase/schema.sql`。
2. 表 `public.learning_events` 开启 RLS，SELECT 和 INSERT 都要求 `auth.uid() = user_id`。匿名角色没有权限；登录用户也不能修改或删除历史事件。客户端使用追加事件并去重同步。
3. Authentication → Providers 中启用 Email。Authentication → URL Configuration 将 Site URL 设为 `https://kakuutetetsu.github.io/my-english-output-lab/`，将同一地址加入 Redirect URLs。开发时可额外加入 `http://localhost:5173/`，不要把任意通配域名加入允许列表。
4. Project Settings → API 获取 Project URL 和 **publishable key 或 anon 公钥**。禁止使用 secret/service_role 密钥。前端公钥本身可公开，用户数据隔离依赖 RLS。
5. 本地复制 `.env.example` 为 `.env.local`，填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，重启开发服务器。
6. GitHub 仓库 Settings → Secrets and variables → Actions → New repository secret，创建同名两个 Secrets。重新运行 Deploy English Output Lab 工作流。
7. 打开网站“同步与备份”，输入邮箱获取 Magic Link。邮件链接打开后进入该账号空间。不同设备登录同一账号，点击立即同步即可合并。

同步上传不可变事件，按 200 条分批；下载按 1000 条分页。并发离线事件根据 UUID 合并，同一收藏以最新时间的事件为准；设备时钟应准确。联网、登录和新增记录时触发同步，也可手动同步。失败保留本地数据并显示原因。云端并非浏览器关闭后的后台服务。

### RLS 验收（配置后必须执行）

建立两个测试账号 A、B。A 插入自己的事件应成功，查询 B 的记录应为空；A 尝试插入 `user_id=B` 应报权限错误；未登录调用表应被拒绝。在两台设备分别离线练习，恢复联网并同步，双方新记录均应保留。当前没有配置真实 Supabase 项目，因此本交付不声称已完成在线 Auth、RLS 或跨设备实测。

## GitHub Pages 部署

仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。推送 main 后 `.github/workflows/deploy.yml` 执行 `npm ci`、测试、构建、上传和部署。也可以在 Actions → Deploy English Output Lab → Run workflow 手动运行。

首次不设置任何 Supabase Secrets 也可成功构建本地模式。等待工作流 deploy job 成功，再访问上述 Pages 地址；只有源码推送成功不代表网站上线。

## PWA 与离线

构建阶段生成 manifest 与 Service Worker，预缓存界面、学习资料、字体以外的本地资产和图标。使用系统字体，无外部字体依赖。首次在线打开并完成缓存后可离线使用。Android 支持浏览器安装；iOS/iPadOS 用 Safari 分享 → 添加到主屏幕。不同系统可能清理站点缓存，不能把缓存当作永久备份。

## 验证范围

自动测试覆盖原文表格行完整性、稳定 ID 唯一性、原始自测题、复习间隔、掌握重置、多设备事件合并、取消收藏及备份损坏拒绝。生产构建会执行 TypeScript 类型检查。部署与界面验收情况见 `VALIDATION.md`。

配置依据：[Vite 静态部署](https://vite.dev/guide/static-deploy)、[Supabase Magic Link](https://supabase.com/docs/reference/javascript/auth-signinwithotp)、[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)。
