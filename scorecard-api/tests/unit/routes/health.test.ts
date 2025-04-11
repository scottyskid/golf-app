import { describe, it } from "@jest/globals";
import { assert } from "chai";
import request from "supertest";

import { app } from "../../../src/app";

describe("Health Check API", () => {
    it("should return 200 OK with status message", async () => {
        const response = await request(app).get("/health").expect("Content-Type", /json/).expect(200);

        assert.property(response.body, "status");
        assert.equal(response.body.status, "OK");
    });
});
