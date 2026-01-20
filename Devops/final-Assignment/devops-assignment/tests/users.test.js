const request = require("supertest");
const app = require("../src/app");

describe("User API", () => {
  it("should fail when name is missing", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "test@test.com" });

    expect(res.statusCode).toBe(400);
  });
});
