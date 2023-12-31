import { build as viteBuild, InlineConfig } from "vite";
import type { RollupOutput } from "rollup";
import pluginReact from "@vitejs/plugin-react";
import { SERVER_ENTRY_PATH, CLIENT_ENTRY_PATH } from "./constants";
import { join } from "path";
import * as fs from "fs-extra";

export async function bundle(root: string) {
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: "production",
    root,
    // 注意加上这个插件，自动注入 import React from 'react'，避免 React is not defined 的错误
    plugins: [pluginReact()],
    build: {
      ssr: isServer,
      outDir: isServer ? ".temp" : "build",
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm",
        },
      },
    },
  });

  console.log(`Building client + server bundles...`);

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(resolveViteConfig(false)),
      // server build
      viteBuild(resolveViteConfig(true)),
    ]);

    // console.log(`clientBundle`, clientBundle, " serverBundle", serverBundle);
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log("error:", e);
  }
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle: RollupOutput
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  const clientCssChunk = clientBundle.output.find((chunk) => {
    return chunk.type === "asset" && /\.css$/.test(chunk.fileName);
  });
  console.log("clientCssChunk", clientCssChunk);
  console.log(`Rendering page in server side...`);
  const appHtml = render();
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>title</title>
    <meta name="description" content="xxx">
    <script type="module" src="/${clientChunk?.fileName}"></script>
    <link rel="stylesheet" type="text/css" href="/${clientCssChunk?.fileName}"></link>
  </head>
  <body>
    <div id="root">${appHtml}</div>
  </body>
</html>`.trim();
  await fs.ensureDir(join(root, "build"));
  await fs.writeFile(join(root, "build/index.html"), html);
  await fs.remove(join(root, ".temp"));
}

export async function build(root: string = process.cwd()) {
  const [clientBundle, serverBundle] = await bundle(root);

  // 2. 引入 server-entry 模块
  const serverEntryPath = join(root, ".temp", "ssr-entry.js");
  const { render } = require(serverEntryPath);
  // 3. 服务端渲染，产出 HTML
  await renderPage(render, root, clientBundle);
}
