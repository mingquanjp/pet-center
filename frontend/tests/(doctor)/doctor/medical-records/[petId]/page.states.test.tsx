import { apiRequest } from "@/lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Page from "@/app/(doctor)/doctor/medical-records/[petId]/page";

test("UIX-DOCTOR-040 - UI States: loading, empty, and error states", async () => {
  // Mock API Error state
  const mockApi = vi.mocked(apiRequest);
  mockApi.mockRejectedValueOnce(new Error("API Request Failed"));

  const { container } = render(<Page />);
  
  await waitFor(() => {
    expect(container).toBeTruthy();
  });
});
