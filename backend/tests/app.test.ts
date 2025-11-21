import request from "supertest";

// Mock Supabase before importing app
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: "123" } }, error: null }),
    },
  }),
}));

import app from "../src/app";

describe("General API", () => {
  it("GET / should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Scale & Sell API is running");
  });
});
