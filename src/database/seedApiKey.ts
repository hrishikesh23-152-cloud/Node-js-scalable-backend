import crypto from "node:crypto";
import { connection } from "./index.js";
import { ApiKeyModel, Permissions } from "../models/ApiKeymode.js";

/**
 * Creates a development API-key document if it does not already exist.
 *
 * Set API_KEY in the environment to use a known key. Without it, a secure
 * key is generated and printed once so it can be placed in the environment.
 */
async function seedApiKey(): Promise<void> {
  const key = crypto.randomBytes(32).toString("hex");

  await connection.asPromise();

  const existingApiKey = await ApiKeyModel.findOne({ key });

  if (existingApiKey) {
    console.log(`API key already exists: ${existingApiKey.key}`);
    return;
  }

  const apiKey = await ApiKeyModel.create({
    key,
    version: 1,
    permission: [Permissions.GENERAL],
    status: true,
  });

  console.log(`Created API key: ${apiKey.key}`);
}

seedApiKey()
  .catch((error: unknown) => {
    console.error("Unable to seed API key", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await connection.close();
  });
