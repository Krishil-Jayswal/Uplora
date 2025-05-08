import fs from "fs";
import path from "path";

export const listAllFiles = (dirname: string) => {
  let files: string[] = [];

  const dirContents = fs.readdirSync(dirname);
  dirContents.forEach((content) => {
    const fullContentPath = path.join(dirname, content);
    if (fs.statSync(fullContentPath).isDirectory()) {
      files = files.concat(listAllFiles(fullContentPath));
    } else {
      files.push(fullContentPath);
    }
  });

  return files;
};

export const clearOutputDir = (rootDir: string, thresholdAge: number) => {
  const outputDir = path.join(rootDir, "output");
  if (!fs.existsSync(outputDir)) {
    return;
  }

  const dirContents = fs.readdirSync(outputDir);
  dirContents.forEach((content) => {
    const fullContentPath = path.join(outputDir, content);
    fs.stat(fullContentPath, (err, stats) => {
      if (err) {
        console.error(
          "Error in clearring output directory: ",
          content,
          " - ",
          err,
        );
      }
      const ageOfContent =
        (Date.now() - stats.birthtime.getTime()) / (1000 * 60);
      if (ageOfContent > thresholdAge) {
        fs.rm(fullContentPath, { recursive: true, force: true }, (err) => {
          if (err) {
            console.error(
              "Error in clearring output directory: ",
              content,
              " - ",
              err,
            );
          }
        });
      }
    });
  });
};
