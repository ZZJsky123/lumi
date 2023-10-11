import * as downloadGitRepo from "download-git-repo";
import { promisify } from "util";
import { dynamicImport } from "../utils/common";

function sleep(n) {
  return new Promise((resolve: any, reject) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
}

export async function loading(message, fn, ...args) {
  // const spinner = ora(message);
  // spinner.start();
  // const res = await fn(...args);
  // spinner.succeed('加载成功');
  // return res;
  console.log("请求参数:", args);
  try {
    const res = await fn(...args);
    console.log("加载成功...");
    return res;
  } catch (error) {
    // 加载失败
    // spinner.fail(`request fail, refetching ${error}`);
    await sleep(1000);
    console.log(`加载失败，重新拉取: ${error}`);
    // 重新拉取
    return loading(message, fn, ...args);
  }
}

class Creator {
  name: string;
  target: string;
  downloadGitRepo: () => void;
  constructor(name: string, target) {
    this.name = name;
    this.target = target;
    this.downloadGitRepo = promisify(downloadGitRepo);
  }

  async downLoad(repo, tag) {
    console.log(repo, tag);
    // 模板下载地址
    const templateUrl = `ZZJsky123/lumi#main`;
    // 调用 downloadGitRepo 方法将对应模板下载到指定目录
    console.log("目标文件夹:------", this.target);
    await loading(
      "downloading template, please wait",
      this.downloadGitRepo,
      templateUrl,
      this.target
    );
  }

  async create() {
    // console.log(this.name, this.target);
    const chalk = await dynamicImport("chalk");
    console.log("开始创建模板项目-------");
    const customChalk = new chalk.Chalk({ level: 2 });
    const repoName = "lumi";
    const version = "1.0.0";
    await this.downLoad(repoName, version);

    // 模板使用提示
    console.log(
      `\r\nSuccessfully created project ${customChalk.blue(this.name)}`
    );
    // console.log("  npm install\r\n");
    // console.log("  npm run dev\r\n");
  }
}

export default Creator;
