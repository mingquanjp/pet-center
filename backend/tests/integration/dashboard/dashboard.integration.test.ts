import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import {
  cleanupIntegrationTestData,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";
import {
  loginAsOwner,
  loginAsStaff,
  loginAsDoctor,
  loginAsAdmin,
} from "../helpers/integration-test-auth.js";

describe("INTX-DASHBOARD - Dashboard API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
  });

  afterAll(cleanupIntegrationTestData);

  // ─── Staff dashboard ───────────────────────────────────────────────────────
  it("INTX-DASHBOARD-001 - GET /dashboards/staff/overview - staff gets dashboard overview", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/dashboards/staff/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-DASHBOARD-002 - GET /dashboards/staff/overview - staff can pass taskLimit query", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/dashboards/staff/overview")
      .query({ taskLimit: 5 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-DASHBOARD-003 - GET /dashboards/staff/overview - admin can also access staff overview", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/dashboards/staff/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Doctor dashboard ─────────────────────────────────────────────────────
  it("INTX-DASHBOARD-004 - GET /dashboards/doctor/overview - doctor gets dashboard overview", async () => {
    const token = await loginAsDoctor();
    const res = await request(app)
      .get("/api/v1/dashboards/doctor/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-DASHBOARD-005 - GET /dashboards/doctor/overview - doctor can pass examLimit and activityLimit", async () => {
    const token = await loginAsDoctor();
    const res = await request(app)
      .get("/api/v1/dashboards/doctor/overview")
      .query({ examLimit: 3, activityLimit: 2 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── Admin dashboard ──────────────────────────────────────────────────────
  it("INTX-DASHBOARD-006 - GET /dashboards/admin/overview - admin gets admin dashboard overview", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/dashboards/admin/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-DASHBOARD-007 - GET /dashboards/admin/overview - admin can pass date range", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/dashboards/admin/overview")
      .query({ startDate: "2026-01-01", endDate: "2026-06-30" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-DASHBOARD-008 - GET /dashboards/admin/activity-logs - admin gets activity logs", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/dashboards/admin/activity-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-DASHBOARD-009 - GET /dashboards/admin/activity-logs - admin can filter by date and paginate", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/dashboards/admin/activity-logs")
      .query({ startDate: "2026-01-01", endDate: "2026-12-31", page: 1, limit: 10 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── Owner dashboard ──────────────────────────────────────────────────────
  it("INTX-DASHBOARD-010 - GET /owner/dashboard - owner gets own dashboard", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-DASHBOARD-011 - GET /owner/dashboard/activity-logs - owner gets own activity logs", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/dashboard/activity-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ─── Auth checks ──────────────────────────────────────────────────────────
  it("INTX-DASHBOARD-012 - GET /dashboards/staff/overview - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/dashboards/staff/overview");
    expect(res.status).toBe(401);
  });

  it("INTX-DASHBOARD-013 - GET /dashboards/doctor/overview - returns 403 when staff tries to access doctor endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/dashboards/doctor/overview")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-DASHBOARD-014 - GET /dashboards/admin/overview - returns 403 when staff tries to access admin endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/dashboards/admin/overview")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-DASHBOARD-015 - GET /owner/dashboard - returns 403 when staff tries to access owner endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/owner/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  // ─── Validation checks ────────────────────────────────────────────────────
  it("INTX-DASHBOARD-016 - GET /dashboards/admin/overview - returns 400 when startDate > endDate", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/dashboards/admin/overview")
      .query({ startDate: "2026-12-31", endDate: "2026-01-01" })
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
