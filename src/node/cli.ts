import { cac } from "cac";
import path = require("path");
import { resolve } from "path";
import { build } from "./build";
import { createDevServer } from "./dev";

const version = require("../../package.json").version;

// 声明命令的名称和版本号
const cli = cac("island-2").version(version).help();

cli
  .command("[root]", "start dev server")
  .alias("dev")
  .action(async (root: string) => {
    // 添加以下逻辑
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

cli.parse();
