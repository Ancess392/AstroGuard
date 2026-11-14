import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'

const output = new URL('../dist/', import.meta.url)
const files = (await readdir(output, { recursive: true, withFileTypes: true }))
  .filter((file) => file.isFile() && file.name !== 'sw.js')
  .map((file) => join(file.parentPath, file.name))
const root = fileURLToPath(output)
const assets = files.map((file) => relative(root, file).replaceAll('\\', '/')).sort()
const template = await readFile(new URL('./service-worker.js', import.meta.url), 'utf8')
const hash = createHash('sha256').update(template)
for (const asset of assets) hash.update(asset).update(await readFile(new URL(asset, output)))
const worker = template.replace('__VERSION__', hash.digest('hex').slice(0, 16)).replace('__ASSETS__', JSON.stringify(assets))
await writeFile(new URL('sw.js', output), worker)
console.log(`Offline cache generated for ${assets.length} production files.`)
