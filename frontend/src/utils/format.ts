/**
 * 日期格式化工具
 * @param date 日期对象或日期字符串
 * @param format 格式化模板，默认yyyy-MM-dd HH:mm:ss
 */
export function formatDate(
  date: Date | string | undefined,
  format = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!date) return '-'

  const d = new Date(date)
  // 检查日期是否有效
  if (isNaN(d.getTime())) return '-'

  const o: Record<string, number> = {
    'M+': d.getMonth() + 1, // 月份
    'd+': d.getDate(), // 日
    'H+': d.getHours(), // 小时
    'm+': d.getMinutes(), // 分
    's+': d.getSeconds(), // 秒
    'q+': Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds() // 毫秒
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  }

  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] + '' : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }

  return format
}
