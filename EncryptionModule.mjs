import crypto from "crypto";
import { EncryptionKey } from "./EncryptionKey.mjs";

const ALGORITHM = "aes-256-cbc"; // strong symmetric encryption
const ENCRYPTION_KEY = EncryptionKey(); // 32 bytes for aes-256
const IV = crypto.randomBytes(16); // initialization vector

// Encrypt function
const encryptData = (data) => {
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    encryptedData: encrypted,
    iv: IV.toString("hex")
  };
};

// Decrypt function ;
const decryptData = (encryptedData, ivHex) => {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};

// Export both encrypt and decrypt functions
export { encryptData, decryptData };
