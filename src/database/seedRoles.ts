import { connection } from "./index.js";
import Role, { RoleCode } from "../models/rolemodel.js";

/**
 * Creates default USER and ADMIN roles if they do not already exist.
 */
async function seedRoles(): Promise<void> {
  await connection.asPromise();

  for (const code of Object.values(RoleCode)) {
    const existingRole = await Role.findOne({ code });
    if (existingRole) {
      console.log(`Role already exists: ${code}`);
    } else {
      const created = await Role.create({ code, status: true });
      console.log(`Created role: ${created.code} (${created._id})`);
    }
  }
}

seedRoles()
  .catch((error: unknown) => {
    console.error("Unable to seed roles", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await connection.close();
  });
