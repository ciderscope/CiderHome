import { HttpError } from "../src/lib/http";

describe("HttpError", () => {
  it("porte un statut HTTP et un message", () => {
    const error = new HttpError(403, "Refuse");
    expect(error.status).toBe(403);
    expect(error.message).toBe("Refuse");
  });
});
