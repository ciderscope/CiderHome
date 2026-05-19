import { hasPermission } from "../permissions";

describe("permissions UI", () => {
  it("autorise le responsable cuverie a approuver un transfert", () => {
    expect(hasPermission("cellar_manager", "transfer:approve")).toBe(true);
  });

  it("masque l approbation pour un operateur", () => {
    expect(hasPermission("operator", "transfer:approve")).toBe(false);
  });
});
