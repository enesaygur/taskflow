import request from "supertest";
import app from "../app";

describe("health check", () => {
  it("GET / returns the API running message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("TaskFlow");
  });
});