import { generateKeyPair, encryptPassword, encryptMessage, decryptMessage } from "@/lib/encryption"
import { describe, it, expect } from "vitest"

describe("Encryption Utilities", () => {
  describe("generateKeyPair", () => {
    it("should generate a key pair with public and private keys", async () => {
      const keyPair = await generateKeyPair()

      expect(keyPair).toHaveProperty("publicKey")
      expect(keyPair).toHaveProperty("privateKey")
      expect(keyPair.publicKey).toMatch(/^pk_/)
      expect(keyPair.privateKey).toMatch(/^sk_/)
    })

    it("should generate unique key pairs each time", async () => {
      const keyPair1 = await generateKeyPair()
      const keyPair2 = await generateKeyPair()

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey)
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey)
    })
  })

  describe("encryptPassword", () => {
    it("should encrypt a password", async () => {
      const password = "securePassword123"
      const encryptedPassword = await encryptPassword(password)

      expect(encryptedPassword).toMatch(/^hashed_/)
      expect(encryptedPassword).toContain(password)
    })

    it("should produce different hashes for different passwords", async () => {
      const password1 = "password1"
      const password2 = "password2"

      const hash1 = await encryptPassword(password1)
      const hash2 = await encryptPassword(password2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("encryptMessage", () => {
    it("should encrypt a message using recipient public key", async () => {
      const message = "Hello, this is a secret message!"
      const recipientPublicKey = "pk_recipient123"

      const encryptedMessage = await encryptMessage(message, recipientPublicKey)

      expect(encryptedMessage).toMatch(/^encrypted_/)
      expect(encryptedMessage).toContain(recipientPublicKey.slice(0, 8))
    })

    it("should produce different encrypted messages for the same content with different keys", async () => {
      const message = "Same message"
      const publicKey1 = "pk_recipient1"
      const publicKey2 = "pk_recipient2"

      const encrypted1 = await encryptMessage(message, publicKey1)
      const encrypted2 = await encryptMessage(message, publicKey2)

      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe("decryptMessage", () => {
    it("should decrypt an encrypted message", async () => {
      const originalMessage = "Secret message to decrypt"
      const publicKey = "pk_recipient123"

      // Encrypt the message first
      const encryptedMessage = await encryptMessage(originalMessage, publicKey)

      // Then decrypt it
      const decryptedMessage = await decryptMessage(encryptedMessage)

      expect(decryptedMessage).toBe(originalMessage)
    })

    it("should return the original message if not encrypted", async () => {
      const plainMessage = "This is not encrypted"

      const result = await decryptMessage(plainMessage)

      expect(result).toBe(plainMessage)
    })
  })
})
