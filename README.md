
# ts-automatic-model

> typescript 的模型构建工具

## 需要的依赖

``` bash
# 安装
npm install ts-node -g;
npm install automatically-model -D;

# 外部配置文件和项目同级
创建 automatic.config.json
可以配置两个属性
{
  "entry":"/api/index.ts",
  "output":"/model"
}

entry
你请求api的文件路径，以src目录为起始目录，这个文件包含了你所有请求api的方法并且一定要把他export default
出来，不然插件读取不到

例如api.ts：const domes = () => axios.get('/node/game/game_detail?gid=158');
export default {
   domes
}

output
生成模型文件的路径，以src目录为起始目录


# 运行
automatic-model xxxx
xxxx 代表你请求api文件里面export default出来的方法名称，xxx也代码你生成模型文件的名称

例如
api.ts
export default {
   domes
}
automatic-model domes


```


