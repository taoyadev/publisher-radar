# Bug 修复记录

## 2025-12-21: 域名页面 500 错误修复

### 问题描述
- **URL**: https://publisherradar.com/domain/unmapaenlospies.com
- **错误**: Internal Server Error (500)
- **影响**: 新添加的域名（特别是通过 AdSense API enrichment）无法访问

### 根本原因分析

1. **物化视图未同步**
   - 域名存在于 `seller_domains` 表中
   - 但不存在于 `all_domains_mv` 物化视图中
   - 导致 `domain_aggregation_view` 也查询不到数据

2. **代码缺陷**
   - `fetchDomainDetail` 的 fallback 查询引用了不存在的表 `similarweb_analytics`
   - 查询使用 `seller_domains` 而非 `all_domains` 视图
   - 位置: `src/lib/ssg-queries.ts:370-387`

### 修复方案

#### 1. 代码修复 ✅

**文件**: `src/lib/ssg-queries.ts`

**修改前**:
```typescript
const fallbackResult = await query<DomainAggregation>(
  `
  SELECT
    sd.domain,
    COUNT(DISTINCT sd.seller_id) as seller_count,
    array_agg(DISTINCT sd.seller_id ORDER BY sd.seller_id) as seller_ids,
    MAX(sa.search_traffic_monthly) as max_traffic,
    SUM(sa.search_traffic_monthly) as total_traffic,
    MAX(sd.confidence_score) as max_confidence,
    array_agg(DISTINCT sd.detection_source) as detection_sources,
    MIN(sd.first_detected) as first_seen,
    MAX(sd.created_at) as last_updated
  FROM seller_adsense.seller_domains sd
  LEFT JOIN seller_adsense.similarweb_analytics sa ON sd.id = sa.seller_domain_id
  WHERE sd.domain = $1
  GROUP BY sd.domain;
  `,
  [domain]
);
```

**修改后**:
```typescript
const fallbackResult = await query<DomainAggregation>(
  `
  SELECT
    ad.domain,
    COUNT(DISTINCT ad.seller_id) as seller_count,
    array_agg(DISTINCT ad.seller_id ORDER BY ad.seller_id) as seller_ids,
    NULL::bigint as max_traffic,
    NULL::bigint as total_traffic,
    MAX(ad.confidence_score) as max_confidence,
    array_agg(DISTINCT ad.detection_source) as detection_sources,
    MIN(ad.first_detected) as first_seen,
    MAX(ad.created_at) as last_updated
  FROM seller_adsense.all_domains ad
  WHERE ad.domain = $1
  GROUP BY ad.domain;
  `,
  [domain]
);
```

**变更说明**:
- ✅ 移除不存在的 `similarweb_analytics` 表
- ✅ 使用 `all_domains` 视图替代 `seller_domains` 表
- ✅ 使用 NULL 替代不存在的流量字段

#### 2. 物化视图刷新 ✅

**执行命令**:
```bash
npm run db:refresh-views
```

**刷新结果**:
- ✅ `all_domains_mv`: 成功 (7.4秒)
- ✅ `domain_aggregation_view`: 成功 (6.7秒)
- ✅ `tld_aggregation_view`: 成功 (8.7秒)
- ❌ `publisher_list_view`: 超时 (15秒+, 跳过)

**视图行数验证**:
- `publisher_list_view`: 1,136,077 行
- `domain_aggregation_view`: 182,292 行
- `tld_aggregation_view`: 519 行

#### 3. Daily Update 脚本优化 ✅

**文件**: `scripts/daily-update.ts`

**问题**: 调用数据库函数 `refresh_all_materialized_views()` 会超时

**修改**: 使用直接 SQL 查询顺序刷新关键视图

```typescript
const viewsToRefresh = [
  'all_domains_mv',
  'domain_aggregation_view',
  'tld_aggregation_view',
  // Skip publisher_list_view (too large, 113万+ rows)
];

for (const viewName of viewsToRefresh) {
  await pool.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY seller_adsense.${viewName}`);
}
```

#### 4. 刷新脚本优化 ✅

**文件**: `scripts/refresh-materialized-views.ts`

**问题**: 调用数据库函数超时

**修改**: 直接执行 SQL 刷新命令，顺序处理每个视图

### 验证结果

#### 本地测试 ✅
```bash
$ npx tsx test-domain-page.ts
✅ 域名数据获取成功:
{
  "domain": "unmapaenlospies.com",
  "seller_count": "1",
  "seller_ids": ["pub-6456418726996493"],
  "max_confidence": 0.95,
  "detection_sources": ["adsense_api"],
  ...
}
```

#### 生产环境 ✅
```bash
$ curl -I "https://publisherradar.com/domain/unmapaenlospies.com"
HTTP/2 200
date: Sun, 21 Dec 2025 14:03:25 GMT
content-type: text/html; charset=utf-8
```

### 预防措施

1. **定期刷新**: daily-update 脚本现在会自动刷新关键视图
2. **监控告警**: 建议添加视图同步状态监控
3. **文档**: 创建了 `MATERIALIZED_VIEWS.md` 维护指南

### 相关文档

- 📖 [MATERIALIZED_VIEWS.md](./MATERIALIZED_VIEWS.md) - 物化视图维护指南
- 📝 [CLAUDE.md](./CLAUDE.md) - 项目开发指南
- 🔧 `scripts/refresh-materialized-views.ts` - 刷新脚本
- 📊 `src/lib/ssg-queries.ts` - 查询函数库

### 影响范围

- ✅ 域名详情页面 (`/domain/[domain]`)
- ✅ AdSense API enrichment 工作流
- ✅ Daily update 自动化任务
- ⚠️ Publisher 列表页面（视图刷新可能延迟）

### 后续优化建议

1. **publisher_list_view 优化**
   - 添加增量刷新策略
   - 在低流量时段刷新
   - 考虑分区表设计

2. **监控系统**
   - 添加视图刷新状态检查
   - 设置域名 404/500 错误告警
   - 监控视图数据新鲜度

3. **性能优化**
   - 为大型视图添加更多索引
   - 考虑使用 REFRESH MATERIALIZED VIEW 的增量模式
   - 评估是否需要更强大的数据库服务器

---

**修复人员**: Claude Code
**修复时间**: 2025-12-21
**状态**: ✅ 已完成并验证
