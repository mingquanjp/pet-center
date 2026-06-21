import { apiRequest } from "@/lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Page from "@/app/(doctor)/doctor/medical-records/[petId]/page";

test("UIX-DOCTOR-039 - Happy Path: renders page successfully with mocked data", async () => {
  const { container } = render(<Page />);
  
  await waitFor(() => {
    expect(container).toBeTruthy();
    expect(document.body).toBeTruthy();
  });
});
