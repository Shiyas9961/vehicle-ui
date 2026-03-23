import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      json: async () => ({ status: "ok" }),
    })
    .mockResolvedValueOnce({
      json: async () => [
        { id: 1, number: "VH-101", type: "truck", status: "active" },
      ],
    });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders vehicle command center heading", async () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /vehicle command center/i })).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: /vh-101/i })).toBeInTheDocument();
});
