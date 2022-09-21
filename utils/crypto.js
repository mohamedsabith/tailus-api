import Crypto from "crypto";

const { SECRET_KEY, SECRET_IV } = process.env;

const encryptionMethod = "aes-256-cbc";
const KEY = Crypto.createHash("sha512")
  .update(SECRET_KEY, "utf-8")
  .digest("hex")
  .substring(0, 32);
const IV = Crypto.createHash("sha512")
  .update(SECRET_IV, "utf-8")
  .digest("hex")
  .substring(0, 16);

const Encrypt = (text) => {
  const cipher = Crypto.createCipheriv(encryptionMethod, KEY, IV);
  return `${cipher.update(text, "utf-8", "hex")}${cipher.final("hex")}`;
};

const Decrypt = (encryptedData) => {
  const decipher = Crypto.createDecipheriv(encryptionMethod, KEY, IV);
  return `${decipher.update(encryptedData, "hex", "utf-8")}${decipher.final(
    "utf-8"
  )}`;
};

export { Encrypt, Decrypt };
