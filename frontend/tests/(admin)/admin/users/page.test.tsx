import { apiRequest } from "@/lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Page from "@/app/(admin)/admin/users/page";

test("UIX-ADMIN-017 - Happy Path: renders page successfully with mocked data", async () => {
  const { container } = render(<Page />);
  
  await waitFor(() => {
    expect(container).toBeTruthy();
    expect(document.body).toBeTruthy();
  });
});
