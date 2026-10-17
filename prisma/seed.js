
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { rolename: "CUSTOMER" },
    update: {},
    create: {
      rolename: "CUSTOMER",
    },
  });

  await prisma.memberShip.upsert({
    where: { mname: "Basic" },
    update: {},
    create: {
      mname: "Basic",
      score: 0,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
