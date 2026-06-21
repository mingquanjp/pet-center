import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

// Mock env
vi.mock("../../../src/config/env.js", async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    env: {
      ...original.env,
      CLOUDINARY_CLOUD_NAME: "test_cloud",
      CLOUDINARY_API_KEY: "test_key",
      CLOUDINARY_API_SECRET: "test_secret",
      CLOUDINARY_UPLOAD_FOLDER: "test_folder"
    }
  };
});

// Mock cloudinary config & functions
vi.mock("../../../src/config/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn((options: any, callback: any) => {
        return {
          end: vi.fn(() => callback(null, {
            public_id: "pet-center/test_public_id",
            url: "http://res.cloudinary.com/test_cloud/image/upload/v1/pet-center/test_public_id.jpg",
            secure_url: "https://res.cloudinary.com/test_cloud/image/upload/v1/pet-center/test_public_id.jpg",
            width: 800,
            height: 600,
            format: "jpg",
            bytes: 50000,
            resource_type: "image"
          }))
        };
      })
    },
    utils: {
      private_download_url: vi.fn(() => "https://private-download.com/signed-url")
    }
  }
}));

describe("uploads happy path API integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-UPLOADS-347 - POST /uploads/image uploads an image file successfully", async () => {
    const token = await loginAsOwner();
    const buffer = Buffer.from("fake-image-binary-data");

    const response = await request(app)
      .post("/api/v1/uploads/image")
      .attach("file", buffer, "milo.jpg")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      publicId: "pet-center/test_public_id",
      url: expect.stringContaining("cloudinary.com"),
      secureUrl: expect.stringContaining("cloudinary.com")
    });
  });

  it("INTX-UPLOADS-350 - POST /uploads/file uploads a document file successfully", async () => {
    const token = await loginAsOwner();
    const buffer = Buffer.from("fake-pdf-binary-data");

    const response = await request(app)
      .post("/api/v1/uploads/file")
      .attach("file", buffer, "contract.pdf")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.publicId).toBe("pet-center/test_public_id");
  });

  it("INTX-UPLOADS-353 - POST /uploads/file/view-url retrieves private download view url", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .post("/api/v1/uploads/file/view-url")
      .send({ url: "https://res.cloudinary.com/test_cloud/raw/upload/v123/pet-center/doc.pdf" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ url: "https://private-download.com/signed-url" });
  });
});
