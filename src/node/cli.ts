import { cac } from "cac";
import path = require("path");
import { resolve } from "path";
import { build } from "./build";
import { createDevServer } from "./dev";
import Creator from "./download";
import * as fs from "fs-extra";

const version = require("../../package.json").version;

// 声明命令的名称和版本号
const cli = cac("island-2").version(version).help();

cli
  .command("[root]", "start dev server")
  .alias("dev")
  .action(async (root: string) => {
    root = root ? path.resolve(root) : process.cwd();
    const server = await createDevServer(root);
    await server.listen();
    server.printUrls();
  });

cli
  .command("build [root]", "build for production")
  .action(async (root: string) => {
    try {
      root = resolve(root);
      console.log("build 绝对路径", root);
      await build(root);
    } catch (e) {
      console.log(e);
    }
  });

cli.command("create <projectName>").action(async (projectName) => {
  const workdir = process.cwd();
  const targetDir = path.join(workdir, projectName);
  if (fs.existsSync(targetDir)) {
    console.log("目标文件以及存在，强制删除中...");
    await fs.remove(targetDir);
  }
  const creator = new Creator(projectName, targetDir);
  await creator.create();
});

cli.parse();
