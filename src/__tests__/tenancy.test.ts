import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";
import {
  bearer,
  createOrg,
  createProject,
  createTask,
  createUser,
} from "../test/helpers";

// İki ayrı şirket: A ve B. A'nın bir projesi ve içinde bir task'ı var.
const setupTwoTenants = async () => {
  const ownerA = await createUser("owner-a@test.com");
  const ownerB = await createUser("owner-b@test.com");
  const orgA = await createOrg(ownerA.id);
  const orgB = await createOrg(ownerB.id);
  const projectA = await createProject(orgA.id, ownerA.id, "Project A");
  const taskA = await createTask(projectA.id, ownerA.id, "Secret task of A");
  return { ownerA, ownerB, orgA, orgB, projectA, taskA };
};

describe("tenant isolation: organization data", () => {
  it("lets a member read their own organization's members", async () => {
    const { ownerA, orgA } = await setupTwoTenants();

    const res = await request(app)
      .get(`/organizations/${orgA.id}/members`)
      .set("Authorization", bearer(ownerA.id));

    expect(res.status).toBe(200);
  });

  it("hides another organization's members", async () => {
    const { ownerB, orgA } = await setupTwoTenants();

    const res = await request(app)
      .get(`/organizations/${orgA.id}/members`)
      .set("Authorization", bearer(ownerB.id));

    expect(res.status).toBe(403);
  });

  it("hides another organization's details", async () => {
    const { ownerB, orgA } = await setupTwoTenants();

    const res = await request(app)
      .get(`/organizations/${orgA.id}`)
      .set("Authorization", bearer(ownerB.id));

    expect(res.status).toBe(403);
  });
});

describe("tenant isolation: projects and tasks", () => {
  it("lets an owner list tasks of their own project", async () => {
    const { ownerA, orgA, projectA } = await setupTwoTenants();

    const res = await request(app)
      .get(`/organizations/${orgA.id}/projects/${projectA.id}/tasks`)
      .set("Authorization", bearer(ownerA.id));

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain("Secret task of A");
  });

  it("does not leak another organization's tasks through your own org route", async () => {
    const { ownerB, orgB, projectA } = await setupTwoTenants();

    const res = await request(app)
      .get(`/organizations/${orgB.id}/projects/${projectA.id}/tasks`)
      .set("Authorization", bearer(ownerB.id));

    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain("Secret task of A");
  });

  it("does not let you rename another organization's project", async () => {
    const { ownerB, orgB, projectA } = await setupTwoTenants();

    const res = await request(app)
      .put(`/organizations/${orgB.id}/projects/${projectA.id}`)
      .set("Authorization", bearer(ownerB.id))
      .send({ name: "hacked" });

    const after = await prisma.project.findUnique({
      where: { id: projectA.id },
    });

    expect(res.status).toBe(404);
    expect(after?.name).toBe("Project A");
  });

  it("does not let you archive another organization's task", async () => {
    const { ownerB, orgB, projectA, taskA } = await setupTwoTenants();

    const res = await request(app)
      .delete(
        `/organizations/${orgB.id}/projects/${projectA.id}/tasks/${taskA.id}`,
      )
      .set("Authorization", bearer(ownerB.id));

    const after = await prisma.task.findUnique({ where: { id: taskA.id } });

    expect(res.status).toBe(404);
    expect(after?.isArchived).toBe(false);
  });

  it("does not let you reach another organization's task through your own project", async () => {
    const { ownerB, orgB, taskA } = await setupTwoTenants();
    const projectB = await createProject(orgB.id, ownerB.id, "Project B");

    const res = await request(app)
      .delete(
        `/organizations/${orgB.id}/projects/${projectB.id}/tasks/${taskA.id}`,
      )
      .set("Authorization", bearer(ownerB.id));

    const after = await prisma.task.findUnique({ where: { id: taskA.id } });

    expect(res.status).toBe(404);
    expect(after?.isArchived).toBe(false);
  });

  describe("tenant isolation: cross-links", () => {
    it("does not let you assign someone who is not in the organization", async () => {
      const { ownerA, orgA, projectA, taskA } = await setupTwoTenants();
      const outsider = await createUser("outsider@test.com");

      const res = await request(app)
        .post(
          `/organizations/${orgA.id}/projects/${projectA.id}/tasks/${taskA.id}/assignees`,
        )
        .set("Authorization", bearer(ownerA.id))
        .send({ userId: outsider.id });

      expect(res.status).toBe(400);
      expect(
        await prisma.taskAssignee.count({ where: { taskId: taskA.id } }),
      ).toBe(0);
    });

    it("does not let you attach a label from another project", async () => {
      const { ownerA, ownerB, orgA, orgB, projectA, taskA } =
        await setupTwoTenants();
      const projectB = await createProject(orgB.id, ownerB.id, "Project B");
      const labelB = await prisma.label.create({
        data: { name: "B only", color: "#FF0000", projectId: projectB.id },
      });

      const res = await request(app)
        .post(
          `/organizations/${orgA.id}/projects/${projectA.id}/tasks/${taskA.id}/label`,
        )
        .set("Authorization", bearer(ownerA.id))
        .send({ labelId: labelB.id });

      expect(res.status).toBe(404);
      expect(
        await prisma.taskLabel.count({ where: { taskId: taskA.id } }),
      ).toBe(0);
    });
  });
});
