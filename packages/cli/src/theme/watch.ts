import chokidar from 'chokidar'
import debug from 'debug'
import build, { BuildOptions } from './build'

const log = debug('watch')

let watcher: chokidar.FSWatcher | null = null

export default async function watch(input: string, opts: BuildOptions) {
  if (watcher) {
    log(`Closing previous watcher...`)

    await watcher.close()

    watcher = null
  }

  console.log('Running builder in watch mode')

  watcher = chokidar.watch(input)

  const doit = async () => {
    await build(input, opts)

    console.log('Successfully rebuilt themes')
  }

  watcher.on('change', doit)
  watcher.on('ready', doit)
}
