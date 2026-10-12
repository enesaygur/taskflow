import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";
import { createUser } from "../test/helpers";

describe("auth", () => {
  it("rejects registering the same email twice", async () => {
    const body = { email: "a@test.com", password: "password123" };

    const first = await request(app).post("/auth/register").send(body);
    const second = await request(app).post("/auth/register").send(body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
  });

  it("does not store the password in plain text", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "a@test.com", password: "password123" });

    const user = await prisma.user.findUnique({
      where: { email: "a@test.com" },
    });

    expect(user?.password).not.toBe("password123");
  });

  it("blocks login until the email is verified", async () => {
    await createUser("a@test.com", { verified: false });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "a@test.com", password: "password123" });

    expect(res.status).toBe(403);
  });

  it("returns the same error for a wrong password and an unknown email", async () => {
    await createUser("a@test.com");

    const wrongPassword = await request(app)
      .post("/auth/login")
      .send({ email: "a@test.com", password: "wrong-password" });
    const unknownEmail = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it("allows a refresh token to be used only once (rotation)", async () => {
    await createUser("a@test.com");

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "a@test.com", password: "password123" });
    const oldCookie = login.headers["set-cookie"];

    const first = await request(app).post("/auth/refresh").set("Cookie", oldCookie);
    const second = await request(app).post("/auth/refresh").set("Cookie", oldCookie);

    expect(first.status).toBe(200);
    expect(second.status).toBe(401);
  });
});