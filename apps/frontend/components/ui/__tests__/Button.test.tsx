import { render, screen } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("affiche son libelle", () => {
    render(<Button>Valider</Button>);
    expect(screen.getByRole("button", { name: "Valider" })).toBeInTheDocument();
  });

  it("propage l etat disabled", () => {
    render(<Button disabled>Bloque</Button>);
    expect(screen.getByRole("button", { name: "Bloque" })).toBeDisabled();
  });
});

