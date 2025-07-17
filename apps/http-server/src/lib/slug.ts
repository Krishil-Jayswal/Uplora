import { randomInt } from "node:crypto";
import { prisma } from "@repo/db";

/*
    1. Take the repository name as input.
    2. Split it by spaces to extract individual words.
    3. Sanitize each word by:
        - Lowercasing it
        - Removing all non-alphanumeric characters
    4. Join the sanitized words using `-`.
    5. Trim the resulting slug to ensure max 25 characters.
    6. Remove trailing hyphens if any after trimming.
    7. Check if this slug already exists in the database.
    8. If it exists:
        - Append a 4-digit random numeric suffix (e.g., `-2043`)
        - Trim again to 25 characters, and clean trailing `-`
        - Repeat until a unique slug is found.
    9. Return the final unique slug.

 Notes:
 - Final slug only contains lowercase letters, numbers, and hyphens.
 - Very high number of combinations makes collisions rare.
 - The 4-digit suffix gives up to 10,000 fallback options per base slug.
 
*/

const MAX_SLUG_LENGTH = 25;

const sanitize = (word: string) => word.toLowerCase().replace(/[^a-z0-9]/g, "");

const generateBaseSlug = (reponame: string) => {
  const words = reponame.split(/\s+/).map(sanitize).filter(Boolean);
  let slug = words.join("-");
  slug = slug.slice(0, MAX_SLUG_LENGTH);
  return slug.replace(/-+$/g, "");
};

const generateRandomSuffix = () => {
  String(randomInt(10000)).padStart(4, "0");
};

const checkSlugExists = async (slug: string) => {
  const exists = await prisma.project.findFirst({
    where: {
      slug,
    },
  });

  return exists ? true : false;
};

export const generateSlug = async (reponame: string) => {
  try {
    const baseSlug = generateBaseSlug(reponame);
    let finalSlug = baseSlug;

    if (await checkSlugExists(finalSlug)) {
      let suffix = "-" + generateRandomSuffix();
      finalSlug = (baseSlug + suffix)
        .slice(0, MAX_SLUG_LENGTH)
        .replace(/-+$/g, "");

      while (await checkSlugExists(finalSlug)) {
        suffix = "-" + generateRandomSuffix();
        finalSlug = (baseSlug + suffix)
          .slice(0, MAX_SLUG_LENGTH)
          .replace(/-+$/g, "");
      }
    }

    return finalSlug;
  } catch (error) {
    console.error("Error in generating slug: ", (error as Error).message);
    throw error;
  }
};
