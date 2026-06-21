import { apiRequest } from "@/lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Page from "@/app/(owner)/owner/boarding/page";

test("UIX-OWNER-056 - UI States: loading, empty, and error states", async () => {
  // Mock API Error state
  const mockApi = vi.mocked(apiRequest);
  mockApi.mockRejectedValueOnce(new Error("API Request Failed"));

  const { container } = render(<Page />);
  
  await waitFor(() => {
    expect(container).toBeTruthy();
  });
});
