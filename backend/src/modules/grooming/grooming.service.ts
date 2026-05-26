import type { AuthUser } from "../../shared/types/auth.js";
import * as groomingRepository from "./grooming.repository.js";

export async function listAvailableServices(_authUser: AuthUser) {
  return groomingRepository.findActiveGroomingServices();
}
