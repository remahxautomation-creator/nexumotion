/**
 * Creates or updates the admin account.
 *
 * prisma/seed.ts also does this, but it generates several hundred demo
 * products alongside — fine for a scratch database, ruinous for the live one,
 * which is why the admin never got created when the real catalogue was
 * imported. This does only the account.
 *
 * There is no default password. seed.ts falls back to "ChangeMe-Admin1", which
 * is committed and therefore public; an account that can edit the catalogue and
 * read every order should never be reachable with a credential from the repo.
 * ADMIN_PASSWORD is required and the script refuses to run without it.
 *
 * Idempotent — re-running resets the password rather than erroring, which is
 * also how you rotate it.
 *
 * Run: ADMIN_PASSWORD='...' npx tsx scripts/create-admin.ts [--commit] [--email you@domain]
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const COMMIT = process.argv.includes("--commit");

const emailFlag = process.argv.indexOf("--email");
const EMAIL = (
  emailFlag > -1 ? process.argv[emailFlag + 1] : "admin@nexumotion.com"
)
  .toLowerCase()
  .trim();

async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error(
      "ADMIN_PASSWORD is not set.\n" +
        "Run:  ADMIN_PASSWORD='your-password' npx tsx scripts/create-admin.ts --commit"
    );
    process.exit(1);
  }
  if (password.length < 12) {
    console.error(`ADMIN_PASSWORD is ${password.length} characters. Use at least 12.`);
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { id: true, role: true },
  });

  console.log(`email  : ${EMAIL}`);
  console.log(`action : ${existing ? "update existing user (password reset)" : "create new admin"}`);
  if (existing && existing.role !== "ADMIN") {
    console.log(`note   : promoting from ${existing.role} to ADMIN`);
  }

  if (!COMMIT) {
    console.log("\nDRY RUN — re-run with --commit.");
    return;
  }

  // Cost 12 to match what the credentials provider verifies against.
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password: hash, role: "ADMIN" },
    create: {
      email: EMAIL,
      name: "Admin",
      role: "ADMIN",
      country: "Egypt",
      password: hash,
    },
  });

  const check = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { email: true, role: true, password: true },
  });
  const ok = !!check?.password && (await bcrypt.compare(password, check.password));

  console.log(`\nrole   : ${check?.role}`);
  console.log(`login  : ${ok ? "password verifies" : "PASSWORD DOES NOT VERIFY"}`);
  if (!ok) process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(String(e).slice(0, 400));
    process.exit(1);
  });
