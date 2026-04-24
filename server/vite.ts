import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const port = parseInt(process.env.PORT || "3000", 10);
  const serverOptions = {
    middlewareMode: true,
    hmr: false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Ищем index.html в корне (на уровень выше папки server)
      const clientTemplate = path.resolve(__dirname, "..", "index.html");

      if (!fs.existsSync(clientTemplate)) {
         // Если нет в корне, ищем в подпапке client
         const fallbackTemplate = path.resolve(__dirname, "..", "client", "index.html");
         if (!fs.existsSync(fallbackTemplate)) {
            throw new Error(`Could not find index.html at ${clientTemplate} or ${fallbackTemplate}`);
         }
         var finalPath = fallbackTemplate;
      } else {
         var finalPath = clientTemplate;
      }

      let template = await fs.promises.readFile(finalPath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
