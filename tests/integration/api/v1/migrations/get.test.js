import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar essa ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migrations"',
        statusCode: 403,
      });
    });
  });
  describe("Default User", () => {
    test("Retrieving pending migrations", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedCreatedUser = await orchestrator.activateUser(
        createdUser.id,
      );

      const sessionObjectCreatedUser = await orchestrator.createSession(
        activatedCreatedUser.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObjectCreatedUser.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar essa ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migrations"',
        statusCode: 403,
      });
    });
  });
  describe("Privileged User", () => {
    test("Retrieving pending migrations", async () => {
      const privilegedUser = await orchestrator.createUser({});
      const activatedPrivilegedUser = await orchestrator.activateUser(
        privilegedUser.id,
      );

      await orchestrator.addFeaturesToUser(privilegedUser, ["read:migrations"]);

      const sessionObjectPrivilegedUser = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObjectPrivilegedUser.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
