import type { BatchCrypto, EncryptedPayload, PrivateBatchPayload } from "@/types";

// Fixed, source-visible demo key. Never use with actual supplier data.
const demoKey = new Uint8Array([27, 99, 89, 44, 3, 140, 31, 61, 88, 47, 92, 138, 38, 41, 17, 7, 110, 139, 12, 25, 96, 2, 78, 218, 62, 158, 11, 202, 91, 53, 9, 117]);
const base64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const bytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export class DemoBatchCrypto implements BatchCrypto {
  private async key() { return crypto.subtle.importKey("raw", demoKey, "AES-GCM", false, ["encrypt", "decrypt"]); }
  async encrypt(payload: PrivateBatchPayload): Promise<EncryptedPayload> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(JSON.stringify(payload));
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await this.key(), data));
    return { provider: "demo-aes-gcm", formatVersion: 1, serialized: `demo-aes-gcm:v1:${base64(iv)}:${base64(encrypted)}` };
  }
  async decrypt(payload: EncryptedPayload): Promise<PrivateBatchPayload> {
    if (payload.provider !== "demo-aes-gcm") throw new Error("Unsupported demo payload");
    const [marker, version, ivText, dataText] = payload.serialized.split(":");
    if (marker !== "demo-aes-gcm" || version !== "v1" || !ivText || !dataText) throw new Error("Invalid demo payload");
    const iv = bytes(ivText);
    const data = bytes(dataText);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, await this.key(), new Uint8Array(data));
    return JSON.parse(new TextDecoder().decode(decrypted)) as PrivateBatchPayload;
  }
  async encryptBatch(payload: PrivateBatchPayload): Promise<EncryptedPayload> {
    return this.encrypt(payload);
  }
  async decryptBatch(payload: EncryptedPayload): Promise<PrivateBatchPayload> {
    return this.decrypt(payload);
  }
}
