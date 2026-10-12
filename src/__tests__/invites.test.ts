import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";
import { addMember, bearer, createOrg, createUser } from "../test/helpers";
import type { Plan } from "@prisma/client";

const setupOrgWithThreeMembers = async (plan: Plan) => {
  const owner = await createUser("owner@test.com");
  const org = await createOrg(owner.id, plan);
  const m1 = await createUser("m1@test.com");
  const m2 = await createUser("m2@test.com");
  await addMember(org.id, m1.id);
  await addMember(org.id, m2.id);
  return { owner, org };
};

const createInviteFor = (
  email: string,
  organizationId: string,
  invitedById: string,
) =>
  prisma.invite.create({
    data: {
      email,
      token: `token-${email}`,
      role: "MEMBER",
      organizationId,
      invitedById,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

const memberCount = (organizationId: string) =>
  prisma.organizationMember.count({ where: { organizationId } });

describe("accepting invites", () => {
  it("rejects the 4th member on the FREE plan", async () => {
    const { owner, org } = await setupOrgWithThreeMembers("FREE");
    const newcomer = await createUser("new@test.com");
    const invite = await createInviteFor("new@test.com", org.id, owner.id);

    const res = await request(app)
      .post("/invites/accept")
      .set("Authorization", bearer(newcomer.id))
      .send({ token: invite.token });

    expect(res.status).toBe(403);
    expect(await memberCount(org.id)).toBe(3);
  });

  it("allows a 4th member on the ENTERPRISE plan", async () => {
    const { owner, org } = await setupOrgWithThreeMembers("ENTERPRISE");
    const newcomer = await createUser("new@test.com");
    const invite = await createInviteFor("new@test.com", org.id, owner.id);

    const res = await request(app)
      .post("/invites/accept")
      .set("Authorization", bearer(newcomer.id))
      .send({ token: invite.token });

    expect(res.status).toBe(200);
    expect(await memberCount(org.id)).toBe(4);
  });

  it("does not let another user accept someone else's invite", async () => {
    const { owner, org } = await setupOrgWithThreeMembers("ENTERPRISE");
    const intruder = await createUser("intruder@test.com");
    const invite = await createInviteFor("new@test.com", org.id, owner.id);

    const res = await request(app)
      .post("/invites/accept")
      .set("Authorization", bearer(intruder.id))
      .send({ token: invite.token });

    const after = await prisma.invite.findUnique({ where: { id: invite.id } });

    expect(res.status).toBe(403);
    expect(after?.accepted).toBe(false);
    expect(await memberCount(org.id)).toBe(3);
  });
});