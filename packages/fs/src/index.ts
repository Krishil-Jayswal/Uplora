import fs  from "fs";
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
}
