import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const DEMO_PASSWORD = "Demo1234!";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "demo-owner@taskflow.demo" },
  });
  if (existing) {
    console.log("Demo data already exists, skipping.");
    return;
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const newUser = (email: string) =>
    prisma.user.create({ data: { email, password, isEmailVerified: true } });

  const owner = await newUser("demo-owner@taskflow.demo");
  const admin = await newUser("demo-admin@taskflow.demo");
  const member = await newUser("demo-member@taskflow.demo");

  const org = await prisma.organization.create({
    data: {
      name: "Acme Inc (demo)",
      members: {
        create: [
          { userId: owner.id, role: "OWNER" },
          { userId: admin.id, role: "ADMIN" },
          { userId: member.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project = await prisma.project.create({
    data: { name: "Website Redesign", organizationId: org.id, createdById: owner.id },
  });

  const bug = await prisma.label.create({
    data: { name: "Bug", color: "#DC2626", projectId: project.id },
  });
  const feature = await prisma.label.create({
    data: { name: "Feature", color: "#0F766E", projectId: project.id },
  });

  const base = { projectId: project.id, createdById: owner.id };

  await prisma.task.create({
    data: {
      ...base, title: "Fix broken contact form", status: "TODO", priority: "HIGH", position: 0,
      labels: { create: [{ labelId: bug.id }] },
      assignees: { create: [{ userId: member.id }] },
    },
  });
  await prisma.task.create({
    data: { ...base, title: "Write launch announcement", status: "TODO", priority: "MEDIUM", position: 1 },
  });
  await prisma.task.create({
    data: {
      ...base, title: "Design new landing page", status: "IN_PROGRESS", priority: "HIGH", position: 0,
      labels: { create: [{ labelId: feature.id }] },
      assignees: { create: [{ userId: admin.id }] },
    },
  });
  await prisma.task.create({
    data: { ...base, title: "Set up analytics", status: "DONE", priority: "LOW", position: 0 },
  });

  console.log("Demo data created.");
  console.log(`Login: demo-owner@taskflow.demo / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());