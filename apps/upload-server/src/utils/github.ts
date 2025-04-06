export const getNameFromRepo = (url: string) => {
    const nameWithGit = url.split("/").pop();
    const name = nameWithGit?.split(".git")[0];
    return name!;
}
