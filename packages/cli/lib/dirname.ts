import url from 'node:url'

export default function __dirname(importMetaUrl: string) {
  return url.fileURLToPath(new URL('.', importMetaUrl))
}
