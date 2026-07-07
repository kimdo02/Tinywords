import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** PIN을 salt와 함께 scrypt로 해시 ("salt:hash" 형태) */
export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** 저장된 해시와 입력 PIN 비교 (타이밍 세이프) */
export function verifyPin(pin: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(pin, salt, 64);
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}
