#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path')

let arg = process.argv.splice(2);
const pathfile = path.resolve(__dirname, '../src');
if(!arg){
    throw Error("请输入要生成文件的接口名称")
}
exec(`ts-node main.ts ${arg}`, { cwd: pathfile }, (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    if(stderr){
        console.log(`执行失败: ${stderr}`);
    }else{
        console.log(`执行成功: ${stdout}`);
    }
});


