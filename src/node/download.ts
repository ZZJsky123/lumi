import downloadGitRepo from "download-git-repo";
import { join } from "path";
import { promisify } from "util";
import cyan from "chalk";

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
  try {
    const res = await fn(...args);
    console.log("加载成功...");
    return res;
  } catch (error) {
    // 加载失败
    // spinner.fail(`request fail, refetching ${error}`);
    await sleep(1000);
    console.log("加载失败，重新拉取");
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
    const templateUrl = `zhurong-cli/${repo}${tag ? "#" + tag : ""}`;
    // 调用 downloadGitRepo 方法将对应模板下载到指定目录
    console.log(join(process.cwd(), this.target));
    await loading(
      "downloading template, please wait",
      this.downloadGitRepo,
      templateUrl,
      this.target
    );
  }

  async create() {
    // console.log(this.name, this.target);
    const repoName = "";
    const version = "1.0.0";
    await this.downLoad(repoName, version);
    // 模板使用提示
    console.log(`\r\nSuccessfully created project ${cyan(this.name)}`);
    console.log(`\r\n  cd ${cyan(this.name)}`);
    // console.log("  npm install\r\n");
    // console.log("  npm run dev\r\n");
  }
}

export default Creator;
