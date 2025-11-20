# AdSense API Integration Documentation

本文档详细说明如何使用 AdSense API 为 Seller JSON Explorer 项目enriching数据。

## 📊 概览

**目标**: 为 1,029,504 个 Google AdSense sellers 补充域名信息

**数据来源**:
1. **Sellers.json** (Google 官方): 146,779 个 sellers (14.26%) 已有 domain
2. **AdSense API** (Cloudflare Workers): 补充剩余 882,725 个 sellers (85.74%)

**API 信息**:
- URL: `https://adsense-api.lively-sound-ed65.workers.dev`
- 端点: `GET /api/domains?pubId=pub-XXXXXXXX`
- 认证: `Authorization: Bearer {API_KEY}`
- Rate Limit: **100 RPM** (每分钟 100 次请求)
- 缓存: 24小时 TTL (KV缓存)

## 🗄️ 数据库架构

### 扩展的表结构

#### `sellers` 表新增字段

```sql
ALTER TABLE seller_adsense.sellers
ADD COLUMN adsense_api_checked BOOLEAN DEFAULT FALSE,
ADD COLUMN adsense_api_last_check TIMESTAMP,
ADD COLUMN adsense_api_status VARCHAR(50),  -- 'success', 'not_found', 'error', 'pending'
ADD COLUMN adsense_api_domain_count INTEGER DEFAULT 0,
ADD COLUMN adsense_api_error_message TEXT;

-- 索引优化
CREATE INDEX idx_sellers_adsense_checked ON seller_adsense.sellers(adsense_api_checked);
CREATE INDEX idx_sellers_adsense_status ON seller_adsense.sellers(adsense_api_status);
```

#### `seller_domains` 表扩展

```sql
-- 添加 updated_at (如未存在)
ALTER TABLE seller_adsense.seller_domains
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 唯一约束 (防止重复)
ALTER TABLE seller_adsense.seller_domains
ADD CONSTRAINT unique_seller_domain UNIQUE (seller_id, domain);

-- 索引优化
CREATE INDEX idx_seller_domains_source ON seller_adsense.seller_domains(detection_source);
CREATE INDEX idx_seller_domains_confidence ON seller_adsense.seller_domains(confidence_score);
```

### 数据源标识

**`detection_source` 取值**:
- `sellers_json` - 仅来自 Google sellers.json
- `adsense_api` - 仅来自 AdSense API
- `both` - **双重确认** (两个来源都有,最高可信度)

**`confidence_score` 规则**:
- `1.0` - 双重确认 (`both`) 或 sellers.json
- `0.95` - 仅 AdSense API

## 🚀 使用指南

### 1. 数据库迁移

首次运行需要执行 schema 迁移:

```bash
npm run adsense:migrate
```

这将:
- 添加所有必需的字段和索引
- 创建唯一约束防止重复
- 创建监控视图 (`domain_coverage_stats`, `adsense_api_progress`)

### 2. 运行 Enrichment

#### 模式 A: 填补缺失数据 (优先级最高)

处理没有 domain 的 882,725 个 sellers:

```bash
# 测试运行 (dry-run, 不写入数据库)
npm run adsense:enrich -- --mode fill-missing --limit 10 --dry-run

# 小批量运行 (1000 个)
npm run adsense:enrich -- --mode fill-missing --limit 1000

# 全量运行 (所有未处理的)
npm run adsense:enrich -- --mode fill-missing

# 后台运行 (推荐生产环境)
nohup npm run adsense:enrich -- --mode fill-missing > logs/adsense-fill.log 2>&1 &
```

**预计时间**: 约 6.13 天 (24小时连续运行)

#### 模式 B: 验证已有数据

验证 sellers.json 中已有 domain 的 146,779 个 sellers:

```bash
# 测试运行
npm run adsense:enrich -- --mode verify-existing --limit 10 --dry-run

# 全量运行
npm run adsense:enrich -- --mode verify-existing
```

**预计时间**: 约 1.02 天

**目的**:
- 将 sellers.json 数据升级为 `both` (双重确认)
- 发现 AdSense API 中新增的 domain
- 提升数据可信度

#### 模式 C: 全量处理

处理所有 sellers (不推荐,除非从头开始):

```bash
npm run adsense:enrich -- --mode all --limit 1000
```

**预计时间**: 约 7.15 天

### 3. 恢复中断的任务

如果脚本中断,可以使用 `--resume` 继续:

```bash
npm run adsense:enrich -- --mode fill-missing --resume
```

这将仅处理 `adsense_api_status IS NULL` 或 `= 'pending'` 的 sellers。

### 4. 监控进度

#### 通过 API 监控

```bash
curl http://localhost:3000/api/enrichment/status | jq .
```

**返回信息**:
```json
{
  "timestamp": "2025-10-23T...",
  "coverage": {
    "totalSellers": 1029504,
    "sellersWithDomains": 146779,
    "coveragePercentage": "14.26",
    "breakdown": {
      "fromSellersJsonOnly": 146779,
      "fromAdSenseApiOnly": 0,
      "fromBothSources": 0
    },
    "totalVerifiedDomains": 0
  },
  "processing": {
    "total": 1029504,
    "processed": 0,
    "pending": 1029504,
    "progressPercentage": "0.00",
    "statusBreakdown": [...]
  },
  "performance": {
    "processedLastHour": 0,
    "estimatedHoursRemaining": null,
    "estimatedDaysRemaining": null
  },
  "errors": {
    "topErrors": [],
    "totalErrors": 0
  }
}
```

#### 通过数据库视图监控

```sql
-- 查看整体覆盖率
SELECT * FROM seller_adsense.domain_coverage_stats;

-- 查看处理进度
SELECT * FROM seller_adsense.adsense_api_progress;

-- 查看最近错误
SELECT
  adsense_api_error_message,
  COUNT(*) as count
FROM seller_adsense.sellers
WHERE adsense_api_status = 'error'
GROUP BY adsense_api_error_message
ORDER BY count DESC
LIMIT 10;
```

#### 查看 Checkpoint

脚本每处理 5000 个 sellers 会保存 checkpoint:

```bash
cat logs/adsense-checkpoint.json
```

## 📈 API 调用量计算

### 场景 1: 填补缺失数据 (882,725 个)

```
总请求数: 882,725
Rate Limit: 100 RPM

每分钟: 100 个
每小时: 6,000 个
每天 (24h): 144,000 个

预计完成时间:
- 24h 连续运行: 6.13 天
- 12h 每天: 12.26 天
```

### 场景 2: 验证已有数据 (146,779 个)

```
总请求数: 146,779
预计完成时间: 1.02 天 (24h) 或 2.04 天 (12h/天)
```

### 场景 3: 全量处理 (1,029,504 个)

```
总请求数: 1,029,504
预计完成时间: 7.15 天 (24h) 或 14.30 天 (12h/天)
```

## 🔄 数据合并逻辑

### UPSERT 策略

使用 PostgreSQL 的 `ON CONFLICT` 实现智能合并:

```sql
INSERT INTO seller_adsense.seller_domains
  (seller_id, domain, detection_source, confidence_score, first_detected)
VALUES ($1, $2, 'adsense_api', 0.95, CURRENT_DATE)
ON CONFLICT (seller_id, domain)
DO UPDATE SET
  detection_source = CASE
    WHEN seller_adsense.seller_domains.detection_source = 'sellers_json'
    THEN 'both'  -- 升级为双重确认
    ELSE seller_adsense.seller_domains.detection_source
  END,
  confidence_score = CASE
    WHEN seller_adsense.seller_domains.detection_source = 'sellers_json'
    THEN 1.0  -- 最高可信度
    ELSE seller_adsense.seller_domains.confidence_score
  END,
  updated_at = NOW();
```

**逻辑说明**:
1. **新 domain**: 直接插入,标记为 `adsense_api`, confidence = 0.95
2. **重复 domain** (已存在于 sellers.json):
   - `detection_source` 升级为 `both`
   - `confidence_score` 升级为 `1.0`
   - 更新 `updated_at`

## ⚠️ 注意事项与限制

### 1. API 网络问题

如果遇到大量 network errors:
- 检查 API 是否在线: `curl https://adsense-api.lively-sound-ed65.workers.dev/health`
- 检查 SOAX 代理配额是否用完
- 降低并发 (修改 `REQUESTS_PER_MINUTE`)

### 2. Rate Limiting

- 脚本使用 95 RPM (保留 5% 安全margin)
- 遇到 429 错误会自动 exponential backoff
- 如需加速,可提高 API 的 rate limit 配额

### 3. 数据一致性

- sellers.json 数据每日更新
- AdSense API 数据可能有延迟
- `both` 状态的 domain 可信度最高

### 4. 错误处理

**常见错误状态**:
- `not_found` (404): Publisher ID 不存在,不会重试
- `error` (5xx): 服务器错误,最多重试 3 次
- `network_error`: 网络超时,最多重试 3 次

查看失败的 sellers:

```sql
SELECT seller_id, adsense_api_error_message
FROM seller_adsense.sellers
WHERE adsense_api_status = 'error'
ORDER BY adsense_api_last_check DESC
LIMIT 100;
```

重新处理失败的 sellers:

```bash
# 将 error 状态重置为 pending
UPDATE seller_adsense.sellers
SET adsense_api_status = 'pending',
    adsense_api_checked = FALSE
WHERE adsense_api_status = 'error';

# 重新运行
npm run adsense:enrich -- --mode fill-missing --resume
```

## 📊 性能优化建议

### 1. 数据库优化

已自动创建的索引:
- `idx_sellers_adsense_checked`
- `idx_sellers_adsense_status`
- `idx_seller_domains_source`
- `idx_seller_domains_confidence`

### 2. 批量处理

脚本使用批次大小 100:
- 每次从数据库拉取 100 个 sellers
- 逐个调用 API (受 rate limit 限制)
- 批量更新数据库

### 3. 并发优化

如需更快速度:
1. 提高 API rate limit (需联系 API 提供商)
2. 在多台服务器上并行运行 (分片处理)
3. 使用 PostgreSQL 连接池 (已实现)

## 🗂️ 文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `scripts/migrate-adsense-schema.ts` | 数据库迁移脚本 |
| `scripts/enrich-adsense-data.ts` | 主处理脚本 |
| `src/lib/adsense-api.ts` | API 客户端 |
| `src/lib/rate-limiter.ts` | Rate limiter 实现 |
| `app/api/enrichment/status/route.ts` | 监控 API |
| `ADSENSE_INTEGRATION.md` | 本文档 |

### 日志文件

| 路径 | 说明 |
|------|------|
| `logs/adsense-enrichment.log` | 主日志 |
| `logs/adsense-checkpoint.json` | 进度 checkpoint |

### 环境变量

在 `.env.local` 中配置:

```bash
ADSENSE_API_KEY=P3sWFTu+rv86zHiK+fBxMTXB44w7TigJzzgUZdvFbec=
```

## 🎯 快速开始 (Quick Start)

```bash
# 1. 确保 SSH tunnel 已连接
ps aux | grep "ssh.*54322"

# 2. 运行数据库迁移
npm run adsense:migrate

# 3. 测试 API (10 个 sellers)
npm run adsense:enrich -- --mode fill-missing --limit 10 --dry-run

# 4. 开始小批量处理 (1000 个)
npm run adsense:enrich -- --mode fill-missing --limit 1000

# 5. 监控进度
curl localhost:3000/api/enrichment/status | jq .

# 6. 全量后台运行
nohup npm run adsense:enrich -- --mode fill-missing > logs/adsense-fill.log 2>&1 &

# 7. 查看日志
tail -f logs/adsense-fill.log

# 8. 完成后验证已有数据
npm run adsense:enrich -- --mode verify-existing
```

## ❓ 常见问题 (FAQ)

### Q1: 脚本中断后如何恢复?

```bash
npm run adsense:enrich -- --mode fill-missing --resume
```

### Q2: 如何查看当前进度?

```bash
curl localhost:3000/api/enrichment/status | jq '.processing'
```

或查询数据库:

```sql
SELECT adsense_api_status, COUNT(*)
FROM seller_adsense.sellers
GROUP BY adsense_api_status;
```

### Q3: 如何加速处理?

1. 提高 API rate limit (需联系 API 提供商)
2. 分片并行处理 (多服务器)
3. 优化数据库连接池 (已默认优化)

### Q4: 重复数据如何处理?

使用 `unique_seller_domain` 约束 + UPSERT 逻辑自动处理:
- 新 domain → 插入
- 重复 domain → 升级为 `both`

### Q5: API 费用是多少?

- 1,029,504 次请求
- 具体费用请咨询 API 提供商

### Q6: 如何定期更新?

添加到 `scripts/daily-update.ts`:

```typescript
// 每日自动处理新增的 sellers
await enrichNewSellers();
```

或设置 cron job:

```bash
# 每日凌晨 3 点运行
0 3 * * * cd /path/to/seller-json && npm run adsense:enrich -- --mode fill-missing --resume
```

## 📞 支持

遇到问题请:
1. 检查日志: `logs/adsense-enrichment.log`
2. 查看 checkpoint: `logs/adsense-checkpoint.json`
3. 查询数据库视图: `seller_adsense.domain_coverage_stats`
4. 联系 API 提供商 (Cloudflare Workers / SOAX)

---

**更新时间**: 2025-10-23
**版本**: 1.0.0
