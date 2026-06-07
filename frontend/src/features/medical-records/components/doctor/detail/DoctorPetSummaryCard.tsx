import React from "react";
import Image from "next/image";
import { Activity, Mail, MapPin, PawPrint, Phone, User } from "lucide-react";
import { DoctorMedicalRecordPetProfile } from "../../../types/medical-record.types";
import { formatPetGender, formatPetSpecies, getPetAgeLabel } from "../../../utils/medical-record-format";

interface Props {
  pet: DoctorMedicalRecordPetProfile;
}

export function DoctorPetSummaryCard({ pet }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-petcenter-border bg-white shadow-card">
      <div className="flex flex-col gap-8 p-6 md:p-8 lg:flex-row lg:gap-12">
        <div className="flex flex-1 flex-col gap-6 md:flex-row md:gap-8">
          <div className="relative shrink-0">
            <div className="relative z-10 h-28 w-28 rounded-full border border-gray-100 bg-white p-1.5 shadow-sm md:h-32 md:w-32">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-50">
                {pet.avatarUrl ? (
                  <Image src={pet.avatarUrl} alt={pet.petName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <PawPrint className="h-12 w-12 opacity-50" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-petcenter-primary/10 text-petcenter-primary">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <h3 className="mb-4 text-2xl font-bold text-petcenter-text md:text-3xl">{pet.petName}</h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <PetFact label="Loài" value={formatPetSpecies(pet.species)} />
              <PetFact label="Giống" value={pet.breed || "Không rõ"} />
              <PetFact label="Tuổi" value={getPetAgeLabel(pet.birthDate, pet.estimatedAge)} />
              <PetFact label="Giới tính" value={formatPetGender(pet.gender)} />
              <PetFact label="Màu lông" value={pet.furColor || "Không rõ"} />
              <PetFact label="Cân nặng" value={pet.weightKg ? `${pet.weightKg} kg` : "Không rõ"} />
            </div>
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-petcenter-border lg:block" />
        <div className="h-px w-full bg-petcenter-border lg:hidden" />

        <div className="flex shrink-0 flex-col justify-center lg:w-80">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-petcenter-border bg-petcenter-filter">
              <User className="h-4 w-4 text-petcenter-text-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-petcenter-text-secondary">Chủ nuôi</span>
              <span className="text-base font-bold text-petcenter-text">{pet.owner.fullName}</span>
            </div>
          </div>

          <div className="space-y-3 p-1">
            <OwnerLine icon={<Phone className="h-4 w-4" />} value={pet.owner.phoneNumber || "Chưa cập nhật"} />
            {pet.owner.email && <OwnerLine icon={<Mail className="h-4 w-4" />} value={pet.owner.email} />}
            {pet.owner.address && <OwnerLine icon={<MapPin className="mt-0.5 h-4 w-4" />} value={pet.owner.address} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PetFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-petcenter-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-petcenter-text">{value}</span>
    </div>
  );
}

function OwnerLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 text-petcenter-text-secondary">{icon}</span>
      <span className="line-clamp-2 text-sm font-medium leading-tight text-petcenter-text" title={value}>
        {value}
      </span>
    </div>
  );
}
