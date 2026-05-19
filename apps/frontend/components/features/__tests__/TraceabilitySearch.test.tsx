import { render, screen } from "@testing-library/react";
import { TraceabilitySearch } from "../TraceabilitySearch";

describe("TraceabilitySearch", () => {
  it("rend le formulaire de recherche", () => {
    render(<TraceabilitySearch />);
    expect(screen.getByRole("button", { name: "Rechercher" })).toBeInTheDocument();
    expect(screen.getByText("Graphe de tracabilite")).toBeInTheDocument();
  });
});
