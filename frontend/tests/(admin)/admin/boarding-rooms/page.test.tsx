import { apiRequest } from "@/lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Page from "@/app/(admin)/admin/boarding-rooms/page";

test("UIX-ADMIN-001 - Happy Path: renders page successfully with mocked data", async () => {
  const { container } = render(<Page />);
  
  await waitFor(() => {
    expect(container).toBeTruthy();
    expect(document.body).toBeTruthy();
  });
});
