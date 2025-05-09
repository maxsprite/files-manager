import fs from "fs";
import path from "path";

const rootEnvExample = path.resolve(".env.example");
const rootEnvFile = path.resolve(".env");

if (fs.existsSync(rootEnvExample) && !fs.existsSync(rootEnvFile)) {
  fs.copyFileSync(rootEnvExample, rootEnvFile);
  console.log("Created .env from .env.example in root directory");
}

const dirs = ["apps", "packages"];

dirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((subdir) => {
      const envExample = path.join(dir, subdir, ".env.example");
      const envFile = path.join(dir, subdir, ".env");

      if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
        fs.copyFileSync(envExample, envFile);
        console.log(
          `Created .env from .env.example in ${path.join(dir, subdir)}`,
        );
      }
    });
  }
});
