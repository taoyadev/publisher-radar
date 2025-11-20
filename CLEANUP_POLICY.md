# Sellers.json Cleanup Policy

## 自动清理策略 (Auto-Cleanup Policy)

为了节省磁盘空间，sellers.json文件在导入数据库后会被自动删除。

To save disk space, sellers.json files are automatically deleted after importing to the database.

---

## 清理时机 (Cleanup Timing)

### 1. VPS导入后自动清理 (Auto-cleanup after VPS import)

VPS导入脚本 (`scripts/import-vps.js`) 在成功导入数据后会自动删除 `/tmp/sellers.json`。

```bash
# VPS上的导入流程
cd /tmp
curl -o sellers.json https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json
node ~/seller-json/scripts/import-vps.js  # 导入后自动删除文件
```

### 2. 每日更新无需清理 (Daily updates don't require cleanup)

每日更新脚本 (`scripts/daily-update.ts`) 直接从URL获取数据，不下载到本地文件，因此无需清理。

```bash
npm run daily:update  # 在内存中处理，无临时文件
```

### 3. 手动清理脚本 (Manual cleanup script)

如果需要手动清理残留的sellers.json文件，可以运行清理脚本：

```bash
./scripts/cleanup-sellers-json.sh
```

**清理位置 (Cleanup locations):**
- `/tmp/sellers.json` - VPS临时位置
- `~/sellers.json` - 用户主目录
- `~/Downloads/sellers.json` - 下载目录
- `/var/tmp/sellers.json` - 备用临时位置

---

## 文件大小 (File Size)

sellers.json原文件大小约 **110MB**，包含超过100万条记录。

- **压缩前**: ~110 MB
- **导入数据库后**: ~209 MB (包含索引)
- **清理后节省**: ~110 MB

---

## 重要提醒 (Important Notes)

### ⚠️ 导入完成后必须清理 (Must cleanup after import)

1. **VPS空间有限**: VPS的 `/tmp` 目录空间有限，及时清理可避免磁盘满
2. **数据已在数据库**: 导入后数据已安全存储在PostgreSQL，原文件不再需要
3. **可重新下载**: 如需原文件，随时可从Google官方源重新下载

### ✅ 自动化最佳实践 (Automation best practices)

在Cron任务或自动化脚本中，确保导入成功后执行清理：

```bash
#!/bin/bash
# VPS导入示例

# 1. 下载
curl -o /tmp/sellers.json https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json

# 2. 导入（已包含自动清理）
node /path/to/scripts/import-vps.js

# 3. 验证清理
if [ -f "/tmp/sellers.json" ]; then
    echo "警告: sellers.json未被清理"
    rm /tmp/sellers.json
fi
```

---

## 清理脚本详情 (Cleanup Script Details)

### `scripts/import-vps.js`

**功能**: VPS上的批量导入脚本，导入完成后自动删除 `/tmp/sellers.json`

**清理代码**:
```javascript
// 6. Cleanup sellers.json file
console.log('\n🧹 Cleaning up sellers.json...');
try {
  fs.unlinkSync('/tmp/sellers.json');
  console.log('✅ Deleted /tmp/sellers.json');
} catch (error) {
  console.warn('⚠️  Could not delete /tmp/sellers.json:', error.message);
}
```

### `scripts/cleanup-sellers-json.sh`

**功能**: 手动清理脚本，扫描并删除多个位置的sellers.json

**使用方法**:
```bash
# 本地执行
./scripts/cleanup-sellers-json.sh

# VPS执行
ssh vps-supabase "/path/to/cleanup-sellers-json.sh"
```

**输出示例**:
```
🧹 Cleaning up sellers.json files...
==================================
📁 Found: /tmp/sellers.json (Size: 110M)
✅ Deleted: /tmp/sellers.json
⏭️  Not found: /home/user/sellers.json
⏭️  Not found: /home/user/Downloads/sellers.json
⏭️  Not found: /var/tmp/sellers.json

==================================
📊 Cleanup Summary:
   Deleted: 1 files
   Not found: 3 files
✨ Cleanup complete!
```

---

## 数据安全 (Data Safety)

- ✅ **数据库备份**: 数据已安全存储在PostgreSQL数据库
- ✅ **可恢复性**: 原文件可随时从Google CDN重新下载
- ✅ **快照记录**: 每日快照记录在 `daily_snapshots` 表中
- ✅ **版本控制**: 通过 `first_seen_date` 和 `updated_at` 跟踪变更

---

## 相关文档 (Related Documentation)

- [README.md](README.md) - 项目主文档
- [DAILY_MONITORING.md](DAILY_MONITORING.md) - 每日监控系统
- [PROJECT_COMPLETION_SUMMARY.md](PROJECT_COMPLETION_SUMMARY.md) - 项目完成总结

---

**最后更新**: 2025-10-15
**状态**: ✅ 已实现并测试通过
