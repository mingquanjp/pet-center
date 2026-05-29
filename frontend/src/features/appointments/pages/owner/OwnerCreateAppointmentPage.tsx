"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { OwnerAppointmentDatePicker } from "../../components/owner/OwnerAppointmentDatePicker";
import { OwnerAppointmentSummaryCard } from "../../components/owner/OwnerAppointmentSummaryCard";
import { OwnerAppointmentTextAreas } from "../../components/owner/OwnerAppointmentTextAreas";
import { OwnerAppointmentTimeSlots } from "../../components/owner/OwnerAppointmentTimeSlots";
import { OwnerCreateAppointmentSuccessModal } from "../../components/owner/OwnerCreateAppointmentSuccessModal";
import { OwnerExamTypeSelection } from "../../components/owner/OwnerExamTypeSelection";
import { OwnerPetSelection } from "../../components/owner/OwnerPetSelection";
import { useCreateOwnerAppointment } from "../../hooks/useCreateOwnerAppointment";
import { useOwnerCreateAppointmentData } from "../../hooks/useOwnerCreateAppointmentData";
import { validateCreateOwnerAppointmentForm } from "../../schemas/create-owner-appointment.schema";
import {
  CreateOwnerAppointmentFormValues,
  CreateOwnerAppointmentResult,
} from "../../types/appointment.types";
import { buildScheduledAt } from "../../utils/appointment-format";

function getDefaultAppointmentDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

const defaultFormValues: CreateOwnerAppointmentFormValues = {
  petId: "",
  examTypeId: "",
  appointmentDate: getDefaultAppointmentDate(),
  timeSlot: "10:00",
  symptomDescription: "",
  note: "",
};

export function OwnerCreateAppointmentPage() {
  const [formValues, setFormValues] =
    useState<CreateOwnerAppointmentFormValues>(defaultFormValues);
  const [createdAppointment, setCreatedAppointment] =
    useState<CreateOwnerAppointmentResult | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const { createAppointment, isPending } = useCreateOwnerAppointment();
  const { examTypes, isError, isLoading, pets, timeSlots } =
    useOwnerCreateAppointmentData(formValues.appointmentDate, formValues.examTypeId || undefined);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === formValues.petId),
    [formValues.petId, pets]
  );
  const selectedExamType = useMemo(
    () => examTypes.find((examType) => examType.id === formValues.examTypeId),
    [examTypes, formValues.examTypeId]
  );

  const isSubmitDisabled =
    !formValues.petId ||
    !formValues.examTypeId ||
    !formValues.appointmentDate ||
    !formValues.timeSlot;

  useEffect(() => {
    if (!formValues.petId && pets[0]) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({ ...currentValues, petId: pets[0].id }));
      });
    }
  }, [formValues.petId, pets]);

  useEffect(() => {
    if (!formValues.examTypeId && examTypes[0]) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({
          ...currentValues,
          examTypeId: examTypes[0].id,
        }));
      });
    }
  }, [examTypes, formValues.examTypeId]);

  useEffect(() => {
    const selectedSlot = timeSlots.find((slot) => slot.value === formValues.timeSlot);
    if (selectedSlot && !selectedSlot.disabled) {
      return;
    }

    const firstAvailableSlot = timeSlots.find((slot) => !slot.disabled);
    if (firstAvailableSlot) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({
          ...currentValues,
          timeSlot: firstAvailableSlot.value,
        }));
      });
    }
  }, [formValues.timeSlot, timeSlots]);

  function updateFormValues(nextValues: Partial<CreateOwnerAppointmentFormValues>) {
    setValidationMessage("");
    setFormValues((currentValues) => ({
      ...currentValues,
      ...nextValues,
    }));
  }

  async function handleSubmit() {
    const validation = validateCreateOwnerAppointmentForm(formValues);

    if (!validation.isValid) {
      setValidationMessage(Object.values(validation.errors)[0] ?? "Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      const result = await createAppointment({
        petId: formValues.petId,
        examTypeId: formValues.examTypeId,
        scheduledAt: buildScheduledAt(formValues.appointmentDate, formValues.timeSlot),
        symptomDescription: formValues.symptomDescription.trim() || undefined,
        note: formValues.note.trim() || undefined,
      });

      setCreatedAppointment(result);
      setIsSuccessModalOpen(true);
    } catch {
      setValidationMessage("Không thể tạo lịch hẹn. Vui lòng thử lại sau.");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] p-6 md:p-8">
        <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-text-secondary">
          Đang tải dữ liệu tạo lịch hẹn...
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[1440px] p-6 md:p-8">
        <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-danger-text">
          Không thể tải dữ liệu tạo lịch hẹn.
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] p-6 md:p-8">
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="heading-lg text-petcenter-text">Tạo lịch hẹn khám</h1>
        <p className="body-lg mt-2 text-petcenter-text-secondary">
          Chọn thú cưng, loại hình khám và thời gian phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="gap-0 rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 md:p-8">
          <div className="flex flex-col gap-6">
            <OwnerPetSelection
              pets={pets}
              selectedPetId={formValues.petId}
              onSelect={(petId) => updateFormValues({ petId })}
            />
            <Divider />
            <OwnerExamTypeSelection
              examTypes={examTypes}
              selectedExamTypeId={formValues.examTypeId}
              onSelect={(examTypeId) => updateFormValues({ examTypeId })}
            />
            <Divider />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <OwnerAppointmentDatePicker
                value={formValues.appointmentDate}
                onChange={(appointmentDate) => updateFormValues({ appointmentDate })}
              />
              <OwnerAppointmentTimeSlots
                timeSlots={timeSlots}
                selectedTimeSlot={formValues.timeSlot}
                onSelect={(timeSlot) => updateFormValues({ timeSlot })}
              />
            </div>
            <Divider />
            <OwnerAppointmentTextAreas
              note={formValues.note}
              symptomDescription={formValues.symptomDescription}
              onNoteChange={(note) => updateFormValues({ note })}
              onSymptomDescriptionChange={(symptomDescription) =>
                updateFormValues({ symptomDescription })
              }
            />
            {validationMessage ? (
              <p className="body-sm rounded-[0.75rem] bg-petcenter-danger-bg p-3 text-petcenter-danger-text">
                {validationMessage}
              </p>
            ) : null}
          </div>
        </Card>

        <OwnerAppointmentSummaryCard
          appointmentDate={formValues.appointmentDate}
          examType={selectedExamType}
          isSubmitDisabled={isSubmitDisabled}
          isSubmitting={isPending}
          pet={selectedPet}
          timeSlot={formValues.timeSlot}
          onSubmit={handleSubmit}
        />
      </div>

      <OwnerCreateAppointmentSuccessModal
        appointment={createdAppointment}
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
      />
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="label-md mb-6 text-petcenter-text-secondary">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/owner/appointments" className="transition hover:text-petcenter-primary">
            Lịch hẹn
          </Link>
        </li>
        <li className="flex items-center gap-2 text-petcenter-text">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          Tạo lịch hẹn
        </li>
      </ol>
    </nav>
  );
}

function Divider() {
  return <hr className="border-petcenter-border" />;
}
