import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const run = (command) => console.log(execSync(command).toString('utf8'))

const NEW_VERSION = process.env.npm_package_version

// update manifest.json with target version
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
manifest.version = NEW_VERSION
writeFileSync('manifest.json', JSON.stringify(manifest, null, '\t'))
// update manifest.json on the demo
copyFileSync('manifest.json', 'demo/.obsidian/plugins/components/manifest.json')

// update versions.json with target version and minAppVersion
const versions = JSON.parse(readFileSync('versions.json', 'utf8'))
versions[NEW_VERSION] = manifest.minAppVersion
writeFileSync('versions.json', JSON.stringify(versions, null, '\t'))

// feedback
console.log('🦋  Generated changes')
run('git status --porcelain')

// feedback
console.log('⧗  Committing changes')
run('git config user.name "github-actions[bot]"')
run('git config user.email "github-actions[bot]@users.noreply.github.com"')
run(
    'git commit demo/.obsidian/plugins/components/* manifest.json versions.json -m"chore: sync plugin manifest"',
)

// feedback
console.log('⧗  Pushing changes')
run('git push')
console.log('✔  Applied changes')
