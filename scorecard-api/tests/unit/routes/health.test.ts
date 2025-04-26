import { describe, it, expect } from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { HealthModule } from "../../../src/health/health.module";

describe("Health Check API", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [HealthModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix("api/v1");
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should return 200 OK with status message", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/health")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBe("OK");
    });
});
