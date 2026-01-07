import fg from "fast-glob";
import { transformAsync } from "@babel/core";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import process from "process";

async function convertFile(file) {
  const code = await readFile(file, "utf8");
  const result = await transformAsync(code, {
    filename: file,
    presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
    babelrc: false,
    configFile: false,
    sourceMaps: false,
  });

  if (!result || typeof result.code !== "string") {
    console.error(`Failed to transform ${file}`);
    return;
  }

  const newFile = file.replace(/\.tsx$/i, ".jsx");
  await writeFile(newFile, result.code, "utf8");
  console.log(`Converted: ${path.relative(process.cwd(), file)} -> ${path.relative(process.cwd(), newFile)}`);
}

async function run() {
  const patterns = [
    "src/**/*.tsx",
    // If you have other source roots, add them here explicitly
  ];

  const entries = await fg(patterns, {
    absolute: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
    ],
  });
  if (!entries.length) {
    console.log("No .tsx files found to convert.");
    return;
  }

  console.log(`Found ${entries.length} .tsx files. Converting...`);
  for (const file of entries) {
    try {
      await convertFile(file);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }

  console.log("Conversion finished. Please review the created .jsx files. Original .tsx files are left in place for safety.");
  console.log("After verification you can remove the .tsx files (git rm) if desired.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
