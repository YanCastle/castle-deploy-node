import RPC from 'castle-ws-rpc-client';
import { ClientEvent } from 'castle-rpc-client/dist/index';
import { parse } from 'url';
import { env } from 'process'
import * as fs from 'mz/fs'
import { resolve, join } from 'path';
import { spawnSync, execSync, exec, ExecOptions } from 'child_process';
// import * as SimpleGit from 'simple-git';
const SimpleGit: any = require('simple-git')
const rpc = new RPC('ws://120.55.56.252:20002/', 'abc1')
rpc.on(ClientEvent.LOGINED, async () => {
    console.log('Logined')
    rpc.subscribe('gogs/push', async (data: any) => {
        console.log(data)
        if (data.repository) {
            let p = parse(data.repository.html_url);
            if (p.pathname) {
                let dir = p.pathname.substr(1);
                let branch = data.ref.split('/').pop()
                let path = resolve(join(env.WORK_DIR || './', dir, branch))
                if (await fs.exists(resolve(path))) {
                    await execAsync('git pull', { cwd: path })
                    await execAsync('tsc', { cwd: path })
                    await execAsync('pm2 reload pm2.json', { cwd: path })
                }
            }
            debugger
        }
    })
})
export function execAsync(cmd: string, options: ExecOptions) {
    return new Promise((s, j) => {
        exec(cmd, options, (err, stdout, stderr) => {
            if (err) { j(stderr) } else { s(stdout) }
        })
    })
}