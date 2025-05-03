// scripts/generate-component-map.js
const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 读取现有映射文件(如果存在)
const mapFilePath = path.resolve(__dirname, '../src/utils/component-map.ts')
let existingMappings = {}

try {
  if (fs.existsSync(mapFilePath)) {
    const content = fs.readFileSync(mapFilePath, 'utf8')
    // 提取现有映射
    const mapObjectMatch = content.match(/const ComponentMap: Record<string, any> = {([\s\S]*?)}/)
    if (mapObjectMatch && mapObjectMatch[1]) {
      const mapLines = mapObjectMatch[1].trim().split('\n')
      mapLines.forEach((line) => {
        const match = line.match(/'([^']+)':\s*(\w+),?/)
        if (match) {
          existingMappings[match[1]] = match[2]
        }
      })
    }
    console.log(`📝 读取到${Object.keys(existingMappings).length}个现有映射`)
  }
} catch (error) {
  console.error('读取现有映射失败:', error)
}

// 扫描views目录下所有Vue组件
const viewsDir = path.resolve(__dirname, '../src/views')
const componentFiles = glob.sync('**/*.vue', { cwd: viewsDir })

// 生成映射对象
const mappings = { ...existingMappings } // 保留现有映射
componentFiles.forEach((file) => {
  const componentPath = file.replace(/\.vue$/, '')
  const importVar = componentPath.replace(/[^a-zA-Z0-9_]/g, '_')
  mappings[componentPath] = importVar
})

// 生成导入语句
const imports = Object.entries(mappings)
  .map(([path, importVar]) => `import ${importVar} from '@/views/${path}.vue';`)
  .join('\n')

// 生成映射对象
const mapObject = Object.entries(mappings)
  .map(([path, importVar]) => `  '${path}': ${importVar},`)
  .join('\n')

// 生成最终代码
const code = `/**
 * 组件映射文件 - 由脚本自动生成，包含手动添加的映射
 * 上次生成时间: ${new Date().toLocaleString()}
 */
${imports}

const ComponentMap: Record<string, any> = {
${mapObject}
}

export default ComponentMap;

export * from './component-utils';
`

// 写入文件
fs.writeFileSync(mapFilePath, code)
console.log(`✅ 组件映射文件已生成，共${Object.keys(mappings).length}个映射`)
