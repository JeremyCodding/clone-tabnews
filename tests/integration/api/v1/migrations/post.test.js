import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(403);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar essa ação.",
          action:
            'Verifique se o seu usuário possui a feature "create:migrations"',
          statusCode: 403,
        });
      });
    });
  });
  describe("Default User", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const createdUser = await orchestrator.createUser({});
        const activatedCreatedUser = await orchestrator.activateUser(
          createdUser.id,
        );

        const sessionObjectCreatedUser = await orchestrator.createSession(
          activatedCreatedUser.id,
        );
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `session_id=${sessionObjectCreatedUser.token}`,
            },
          },
        );
        expect(response.status).toBe(403);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar essa ação.",
          action:
            'Verifique se o seu usuário possui a feature "create:migrations"',
          statusCode: 403,
        });
      });
    });
  });
  describe("Privileged User", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const createdUser = await orchestrator.createUser({});
        const activatedCreatedUser = await orchestrator.activateUser(
          createdUser.id,
        );

        await orchestrator.addFeaturesToUser(createdUser, [
          "create:migrations",
        ]);

        const sessionObjectCreatedUser = await orchestrator.createSession(
          activatedCreatedUser.id,
        );
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `session_id=${sessionObjectCreatedUser.token}`,
            },
          },
        );
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody)).toBe(true);
      });
    });
  });
});
