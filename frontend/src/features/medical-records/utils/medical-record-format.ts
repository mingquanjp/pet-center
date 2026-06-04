import { DoctorMedicalRecord } from "../types/medical-record.types";

export function formatMedicalRecordDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getPetDisplayName(record: DoctorMedicalRecord): string {
  const details = [record.pet.breed, record.pet.species].filter(Boolean).join(" / ");

  return details ? `${record.pet.name} (${details})` : record.pet.name;
}

export function getPetSpeciesLabel(species: DoctorMedicalRecord["pet"]["species"]): string {
  const speciesLabel = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác",
  };

  return speciesLabel[species];
}
