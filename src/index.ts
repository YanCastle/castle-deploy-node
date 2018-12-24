import RPC from 'castle-ws-rpc-client';
import { ClientEvent } from 'castle-rpc-client/dist/index';
import { parse } from 'url';
import { env } from 'process'
import * as fs from 'mz/fs'
import { resolve, join } from 'path';
import { spawnSync } from 'child_process';
// import * as SimpleGit from 'simple-git';
const SimpleGit: any = require('simple-git')
const rpc = new RPC('ws://localhost:20002/', 'abc')
rpc.on(ClientEvent.LOGINED, async () => {
    console.log('Logined')
    rpc.subscribe('gogs/push', async (data: any) => {
        console.log(data)
        if (data.repository) {
            let p = parse(data.repository.html_url);
            if (p.pathname) {
                let dir = p.pathname.substr(1);
                let branch = data.ref.split('/').pop()
                let path = resolve(join(env.GIT_DIR || './', dir, branch))
                if (await fs.exists(resolve(path))) {
                    let git = new SimpleGit(path)
                    git.pull()
                    spawnSync('tsc')
                }
            }
            debugger
        }
    })
})