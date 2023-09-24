import { readFile } from "fs/promises";
import { Plugin } from "vite";
import { DEFAULT_HTML_PATH } from "../constants";

export function pluginIndexHtml(): Plugin {
  return {
    name: "island:index-html",
    apply: "serve",
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          let html = await readFile(DEFAULT_HTML_PATH, "utf-8");
          console.log("config-server---", req.url);
          try {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(html);
            console.log("res ", res.getHeaders());
          } catch (e) {
            console.log("error ", req.url);
            return next(e);
          }
        });
      };
    },
  };
}
