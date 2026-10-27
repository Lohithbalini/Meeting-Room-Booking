const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startTestApp, stopTestApp, resetData, register, getApp, TEST_ENV } = require("./helpers");

beforeAll(async () => {
  await startTestApp();
});

afterAll(async () => {
  await stopTestApp();
});

beforeEach(async () => {
  await resetData();
});

describe("authentication", () => {
  test("registers a user and returns a safe profile plus JWT", async () => {
    const response = await register();
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("user@example.com");
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.token).toBeTruthy();
  });

  test("rejects duplicate email registration with 409", async () => {
    await register();
    const response = await register();
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("EMAIL_EXISTS");
  });

  test("rejects incorrect password with 401", async () => {
    await register();
    const response = await request(getApp()).post("/api/auth/login").send({
      email: "user@example.com",
      password: "wrong-password",
    });
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_CREDENTIALS");
  });

  test("asks unregistered emails to register instead of treating them as a bad password", async () => {
    const response = await request(getApp()).post("/api/auth/login").send({
      email: "new-user@example.com",
      password: "secret123",
    });
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("USER_NOT_FOUND");
    expect(response.body.error).toBe("Please register to login.");
  });

  test("rejects missing authentication token", async () => {
    const response = await request(getApp()).get("/api/rooms");
    expect(response.status).toBe(401);
  });

  test("rejects invalid or expired tokens", async () => {
    const invalid = await request(getApp())
      .get("/api/rooms")
      .set("Authorization", "Bearer not-a-token");
    expect(invalid.status).toBe(401);

    const expired = jwt.sign({}, TEST_ENV.jwtSecret, { subject: "507f1f77bcf86cd799439011", expiresIn: -10 });
    const expiredResponse = await request(getApp())
      .get("/api/rooms")
      .set("Authorization", `Bearer ${expired}`);
    expect(expiredResponse.status).toBe(401);
  });
});
