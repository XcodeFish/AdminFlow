#!/bin/bash

# 自动监测并删除 ._* 文件的脚本
# 作用：监控指定目录，当发现 ._* 文件时自动删除
# 使用方法：./clean_dotunderscore.sh <要监控的目录路径>

# 检查参数
if [ $# -eq 0 ]; then
  echo "用法: $0 <要监控的目录路径>"
  echo "例如: $0 ."
  exit 1
fi

# 获取要监控的目录
WATCH_DIR="$1"

# 检查目录是否存在
if [ ! -d "$WATCH_DIR" ]; then
  echo "错误: 目录 '$WATCH_DIR' 不存在"
  exit 1
fi

echo "开始监控目录: $WATCH_DIR"
echo "按 Ctrl+C 停止监控"

# 先执行一次清理，删除已存在的 ._* 文件
find "$WATCH_DIR" -name "._*" -delete
echo "已清理现有的 ._* 文件"

# 使用 fswatch 监控目录变化，当有变化时执行删除命令
fswatch -0 "$WATCH_DIR" | while read -d "" event
do
  # 检查是否有新的 ._* 文件生成
  DOT_FILES_COUNT=$(find "$WATCH_DIR" -name "._*" | wc -l)
  
  if [ $DOT_FILES_COUNT -gt 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 主人 我发现 $DOT_FILES_COUNT 个 ._* 文件，正在删除..."
    find "$WATCH_DIR" -name "._*" -delete
    echo "删除完成"
  fi
done