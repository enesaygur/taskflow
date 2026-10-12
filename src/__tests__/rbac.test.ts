import request from "supertest";
import app from "../app";
import { addMember, bearer, createOrg, createUser } from "../test/helpers";

const setup = async () => {
  const owner = await createUser("owner@test.com");
  const admin = await createUser("admin@test.com");
  const member = await createUser("member@test.com");
  const outsider = await createUser("outsider@test.com");
  const org = await createOrg(owner.id);
  await addMember(org.id, admin.id, "ADMIN");
  await addMember(org.id, member.id, "MEMBER");
  return { owner, admin, member, outsider, org };
};

describe("role based access control", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/organizations");
    expect(res.status).toBe(401);
  });

  it("lets an admin invite members", async () => {
    const { admin, org } = await setup();

    const res = await request(app)
      .post(`/organizations/${org.id}/invites`)
      .set("Authorization", bearer(admin.id))
      .send({ email: "new@test.com", role: "MEMBER" });

    expect(res.status).toBe(201);
  });

  it("stops a member from inviting", async () => {
    const { member, org } = await setup();

    const res = await request(app)
      .post(`/organizations/${org.id}/invites`)
      .set("Authorization", bearer(member.id))
      .send({ email: "new@test.com", role: "MEMBER" });

    expect(res.status).toBe(403);
  });

  it("stops a non-member from inviting", async () => {
    const { outsider, org } = await setup();

    const res = await request(app)
      .post(`/organizations/${org.id}/invites`)
      .set("Authorization", bearer(outsider.id))
      .send({ email: "new@test.com", role: "MEMBER" });

    expect(res.status).toBe(403);
  });

  it("stops a member from creating projects but lets them list projects", async () => {
    const { member, org } = await setup();

    const create = await request(app)
      .post(`/organizations/${org.id}/projects`)
      .set("Authorization", bearer(member.id))
      .send({ name: "Secret project" });
    const list = await request(app)
      .get(`/organizations/${org.id}/projects`)
      .set("Authorization", bearer(member.id));

    expect(create.status).toBe(403);
    expect(list.status).toBe(200);
  });

  it("lets only the owner start a checkout", async () => {
    const { admin, member, org } = await setup();

    for (const user of [admin, member]) {
      const res = await request(app)
        .post(`/organizations/${org.id}/billing/checkout`)
        .set("Authorization", bearer(user.id))
        .send({ plan: "PRO" });

      expect(res.status).toBe(403);
    }
  });
});