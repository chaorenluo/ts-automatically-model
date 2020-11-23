#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '../../../')

interface AutomaticConfig{
    entry:string,
    output:string,
    fileName:string
}

let automaticConfig:AutomaticConfig;

let stateData = {}

const resolve = (url):string => {
    return path.join(__dirname, "../../../src/"+url);
}

const isObject = (data):boolean => {
    return Object.prototype.toString.call(data) == "[object Object]"
}

const isArray = (data):boolean => {
    return Array.isArray(data)
}

const isBasic = (data):boolean => {
    const type = typeof data;
    return type != 'object' && type != 'undefined';
}

const isFunction = (data):boolean => {
    return Object.prototype.toString.call(data) == "[object Function]"
}

const mkdirSync = () => {
    const { output } = automaticConfig;
    const dirpath =resolve(output)
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split("/").forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                //如果在linux系统中，第一个dirname的值为空，所以赋值为"/"
                if(dirname){
                    pathtmp = dirname;
                }else{
                    pathtmp = "/";
                }
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp)) {
                    return false;
                }
            }
        });
    }else{

    }
    return true;
}

const deconstruction = (data) => {
    if (!data) {
        throw new Error('参数无效,是个空值');
    }
    if (typeof data !== 'object') {
        throw new Error('参数无效,请传入一个对象');
    }
    let new_data = {};
    if (isObject(data)) {
        for (let key in data) {
            if (isBasic(data[key])) {
                new_data[key]=typeof data[key]
            } else if (isArray(data[key])) {
                let obj = deconstruction(data[key]);
                new_data[key] = isObject(obj) ?  [obj] : obj ;
            } else if(isObject(data[key])) {
                new_data[key] = deconstruction(data[key]);
            }
        }
    } else {
        let obj = data[0]
        if (!isObject(obj)) {
            return `Array<${typeof data[0]}>`
        }
        return deconstruction(obj)
    }
    return new_data;
}

const firstCapital= (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
}

const decompositionData = (loadData) => {
    if (isObject(loadData)) {
        for (let key in loadData) {
            if (!isBasic(loadData[key])) {
                let name = isArray(loadData[key]) ? `Array<${firstCapital(key)}_Item>` : `${firstCapital(key)}_Item`;
                let new_data = JSON.parse(JSON.stringify(loadData[key]));
                loadData[key] = name;
                let item = isArray(new_data) ? new_data[0] : new_data;
                stateData[`${firstCapital(key)}_Item`] = item;
                decompositionData(item)
            }
        }
    }
}

const createInterface = (data:any, name:string) => {
    name = firstCapital(name);
    let file = JSON.stringify(data, null, '\t').replace(/"/g, '')
    const { output,fileName } = automaticConfig;
    mkdirSync();
    const url =resolve(output+"/"+firstCapital(fileName))
    fs.writeFileSync(url, `\n\nexport interface ${name ? name : fileName}${file}`,{flag:'a'})
}

const middleProcessing = (data,name?) => {
    if (name) {
        createInterface(data,name)
    } else {
        for (let key in data) {
            createInterface(data[key],key)
        }
    }
}

//删除文件
const deleteFolderRecursive = (name:string, type?) => {
    const { output } = automaticConfig;
    const url =resolve(output+"/"+name)
    let files = [];
    /**
     * 判断给定的路径是否存在
     */
    if (fs.existsSync(url)) {
        /**
         * 返回文件和子目录的数组
         */
        if (type) {
            fs.unlinkSync(url);
        } else {
            files = fs.readdirSync(url);
            files.forEach(function (file, index) {

                const curPath = path.join(url, file);
                console.log(curPath);
                /**
                 * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
                 */
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);

                } else {
                    fs.unlinkSync(curPath);
                }
            });
            /**
             * 清除文件夹
             */
            fs.rmdirSync(url);
        }

    }
}

const start = (res,name) =>{
    deleteFolderRecursive(automaticConfig.fileName,true)
    const loadData = deconstruction(res.data);
    decompositionData(loadData);
    console.log(stateData)
    middleProcessing(stateData);
    middleProcessing(loadData,name);
}

const initConfig = () => {
    let res = fs.readFileSync(filePath + "/automatic.config.json");
    res = JSON.parse(res);
    if (res) {

        let arg = process.argv.splice(2);
        automaticConfig = { ...automaticConfig, ...res, fileName: arg[0] + '.ts' };
        const entry = resolve(automaticConfig.entry);
        console.log('res---',entry)
        import(entry).then((res)=>{
            console.log(res.default,arg[0])
            const data = res.default;
            if(data[arg[0]]){
                data[arg[0]]().then(res=>{
                    start(res,arg[0])
                })
            }else{
                throw new Error(`没找到${arg[0]}方法`)
            }
        })

    } else {
        throw new Error('请配置automatic-config.json文件')
    }
}
initConfig()

