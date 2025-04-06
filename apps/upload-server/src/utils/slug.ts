import { prisma } from "@repo/db";

const characters = "abcdefghijklmnopqrstuvwxyz0123456789";

const randomstring = () => {
  let result = "";
  for (let i = 0; i < 5; i++) {
    result = result + characters[Math.floor(Math.random() * 36)];
  }
  return result;
};

export const generateSlug = async (reponame: string) => {
  reponame = reponame.toLowerCase();
  const existingSlug = await prisma.project.findFirst({
    where: {
      slug: reponame,
    },
  });

  if (!existingSlug) {
    return reponame;
  } else {
    return `${reponame}-${randomstring()}`;
  }
};
