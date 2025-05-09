import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: "node",
  target: "node18",
  treeshake: true,
  external: [
    // External packages that shouldn't be bundled
    "shared",
    // Node.js built-in modules that should not be bundled
    "fs",
    "path",
    "os",
    "crypto",
    "stream",
    "util",
    "events",
    "buffer",
    // Add other built-in modules your app might use
    // External libraries that cause issues when bundled
    "dotenv",
  ],
  env: {
    NODE_ENV: process.env.NODE_ENV || "production",
  },
  noExternal: ["@prisma/client"],
});
