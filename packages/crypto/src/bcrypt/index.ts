import bcrypt from "bcryptjs";

export const hash = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

export const compare = (password: string, hashedPassword: string) => {
    const result = bcrypt.compareSync(password, hashedPassword);
    return result;
}
