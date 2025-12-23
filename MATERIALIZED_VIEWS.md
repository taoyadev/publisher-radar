# Materialized Views 维护指南

## 问题背景

### 症状
- 域名详情页面返回 500 Internal Server Error
- 新添加的域名（通过 AdSense API 或其他来源）无法访问
- `fetchDomainDetail` 查询失败

### 根本原因
PublisherRadar 使用多个物化视图来提升查询性能：

1. **all_domains_mv** - 聚合所有数据源的域名（sellers.json + Host.io + AdSense API）
2. **domain_aggregation_view** - 域名统计聚合视图
3. **publisher_list_view** - 发布者列表视图
4. **tld_aggregation_view** - TLD 统计聚合视图

**关键问题**: 物化视图不会自动更新。当新数据写入 `seller_domains` 表时，物化视图中不会包含这些新数据，导致查询失败。

## 解决方案

### 1. 代码修复 (已完成)

修复 `src/lib/ssg-queries.ts` 中的 `fetchDomainDetail` fallback 查询：

**之前** (使用不存在的表):
```typescript
FROM seller_adsense.seller_domains sd
LEFT JOIN seller_adsense.similarweb_analytics sa ON sd.id = sa.seller_domain_id
```

**之后** (使用 all_domains 视图):
```typescript
FROM seller_adsense.all_domains ad
```

### 2. 物化视图刷新

#### 手动刷新
```bash
npm run db:refresh-views
```

#### 查看刷新脚本
脚本位置: `scripts/refresh-materialized-views.ts`

刷新顺序:
1. `all_domains_mv` (7-8秒)
2. `domain_aggregation_view` (6-7秒)
3. `publisher_list_view` (15秒+, 可能超时)
4. `tld_aggregation_view` (8-9秒)

#### 刷新时机

**必须刷新的场景**:
1. ✅ 运行 AdSense enrichment 后 (`npm run adsense:enrich`)
2. ✅ 运行 daily update 后 (`npm run daily:update`)
3. ✅ 手动导入数据后
4. ✅ 检测到域名页面 404/500 错误时

**推荐自动化**:
在 `scripts/daily-update.ts` 末尾添加刷新调用：

```typescript
import { refreshMaterializedViews } from './refresh-materialized-views';

// ... daily update logic ...

// Refresh materialized views after update
await refreshMaterializedViews();
```

## publisher_list_view 超时问题

### 问题
`publisher_list_view` 有超过 113 万行数据，刷新可能超过 15 秒的 statement_timeout 限制。

### 临时解决方案
1. 跳过 `publisher_list_view` 刷新不会影响域名页面功能
2. 只刷新关键视图: `all_domains_mv`, `domain_aggregation_view`, `tld_aggregation_view`

### 长期解决方案
1. 增加数据库 `statement_timeout` 配置
2. 为 `publisher_list_view` 添加更多索引
3. 考虑使用增量刷新策略
4. 在低流量时段（凌晨）刷新大型视图

## 监控建议

### 检查视图是否过期
```sql
-- 检查最后刷新时间（如果有 stats 表）
SELECT schemaname, matviewname, last_refresh
FROM pg_matviews
WHERE schemaname = 'seller_adsense';

-- 对比行数
SELECT
  (SELECT COUNT(*) FROM seller_adsense.seller_domains) as source_count,
  (SELECT COUNT(*) FROM seller_adsense.all_domains) as view_count;
```

### 告警设置
建议在以下情况下发送告警：
- 域名页面 500 错误率 > 1%
- `all_domains` 视图行数 < `seller_domains` 表行数的 95%
- 最后一次视图刷新时间 > 24 小时

## 快速诊断清单

当域名页面出现错误时：

```bash
# 1. 检查 SSH 隧道
ps aux | grep "ssh.*54322" | grep -v grep

# 2. 测试数据库连接
npm run db:test  # (如果有的话)

# 3. 检查域名是否在视图中
npx tsx -e "
import { query } from './src/lib/db';
const domain = 'example.com';
query('SELECT * FROM seller_adsense.all_domains WHERE domain = \$1', [domain])
  .then(r => console.log('Found:', r.rows.length))
  .finally(() => process.exit(0));
"

# 4. 刷新视图
npm run db:refresh-views

# 5. 重新测试
curl -I "https://publisherradar.com/domain/[domain]"
```

## 参考

- 相关文件: `src/lib/ssg-queries.ts:355-399`
- 刷新脚本: `scripts/refresh-materialized-views.ts`
- Package.json 命令: `db:refresh-views`
- 数据库 schema: `seller_adsense.*_view`, `seller_adsense.*_mv`
