/**
 * 判断是否为外部链接
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 验证URL是否合法
 * @param {string} url
 * @returns {boolean}
 */
export function validURL(url: string): boolean {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * 验证字符串是否为小写字母
 * @param {string} str
 * @returns {boolean}
 */
export function validLowerCase(str: string): boolean {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * 验证字符串是否为大写字母
 * @param {string} str
 * @returns {boolean}
 */
export function validUpperCase(str: string): boolean {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * 验证字符串是否只包含字母
 * @param {string} str
 * @returns {boolean}
 */
export function validAlphabets(str: string): boolean {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * 验证电子邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function validEmail(email: string): boolean {
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * 验证是否为字符串
 * @param {string} str
 * @returns {boolean}
 */
export function isString(str: any): boolean {
  return typeof str === 'string' || str instanceof String
}

/**
 * 验证是否为数组
 * @param {Array} arg
 * @returns {boolean}
 */
export function isArray(arg: any): boolean {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

/**
 * 判断是否为Iconify图标
 * @param icon 图标名称
 * @returns 是否为Iconify图标
 */
export function isIconify(icon: string): boolean {
  return icon && icon.includes(':')
}
