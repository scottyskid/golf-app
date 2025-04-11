import { describe, it, expect } from "@jest/globals";
import request from "supertest";

import { app } from "../../../src/app";

describe("Health Check API", () => {
    it("should return 200 OK with status message", async () => {
        const response = await request(app).get("/health").expect("Content-Type", /json/).expect(200);

        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBe("OK");
    });
});
