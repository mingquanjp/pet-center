"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { OwnerAppointmentDatePicker } from "../../components/owner/OwnerAppointmentDatePicker";
import { OwnerAppointmentSummaryCard } from "../../components/owner/OwnerAppointmentSummaryCard";
import {
  OwnerAppointmentNoteBox,
  OwnerAppointmentSymptomBox,
} from "../../components/owner/OwnerAppointmentTextAreas";
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
import {
  buildScheduledAt,
  getMinAppointmentDateInputValue,
  getVietnamDateInputValue,
} from "../../utils/appointment-format";

function getDefaultAppointmentDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getVietnamDateInputValue(date);
}

function normalizeRequestedAppointmentDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const today = getVietnamDateInputValue();
  return value >= today ? value : "";
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
  return (
    <Suspense fallback={<OwnerCreateAppointmentLoading />}>
      <OwnerCreateAppointmentContent />
    </Suspense>
  );
}

function OwnerCreateAppointmentLoading() {
  return (
    <div className="w-full">
      <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-text-secondary">
        Đang tải dữ liệu tạo lịch hẹn...
      </Card>
    </div>
  );
}

function OwnerCreateAppointmentContent() {
  const searchParams = useSearchParams();
  const requestedPetId = searchParams.get("petId") ?? "";
  const requestedExamTypeId = searchParams.get("examTypeId") ?? "";
  const requestedDate = normalizeRequestedAppointmentDate(searchParams.get("date") ?? "");
  const [formValues, setFormValues] =
    useState<CreateOwnerAppointmentFormValues>(() => ({
      ...defaultFormValues,
      petId: requestedPetId,
      examTypeId: requestedExamTypeId,
      appointmentDate: requestedDate || defaultFormValues.appointmentDate,
    }));
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
    if (!formValues.petId && !requestedPetId && pets[0]) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({ ...currentValues, petId: pets[0].id }));
      });
    }
  }, [formValues.petId, pets, requestedPetId]);

  useEffect(() => {
    if (formValues.petId && pets.length > 0 && !pets.some((pet) => pet.id === formValues.petId)) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({ ...currentValues, petId: pets[0]?.id ?? "" }));
      });
    }
  }, [formValues.petId, pets]);

  useEffect(() => {
    if (!formValues.examTypeId && !requestedExamTypeId && examTypes[0]) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({
          ...currentValues,
          examTypeId: examTypes[0].id,
        }));
      });
    }
  }, [examTypes, formValues.examTypeId, requestedExamTypeId]);

  useEffect(() => {
    setFormValues((currentValues) => ({
      ...currentValues,
      petId: requestedPetId || currentValues.petId,
      examTypeId: requestedExamTypeId || currentValues.examTypeId,
      appointmentDate: requestedDate || currentValues.appointmentDate,
    }));
  }, [requestedDate, requestedExamTypeId, requestedPetId]);

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
      return;
    }

    if (formValues.timeSlot) {
      void Promise.resolve().then(() => {
        setFormValues((currentValues) => ({
          ...currentValues,
          timeSlot: "",
        }));
      });
    }
  }, [formValues.timeSlot, timeSlots]);

  useEffect(() => {
    const minAppointmentDate = getMinAppointmentDateInputValue();
    if (formValues.appointmentDate >= minAppointmentDate) {
      return;
    }

    void Promise.resolve().then(() => {
      setFormValues((currentValues) => ({
        ...currentValues,
        appointmentDate: minAppointmentDate,
      }));
    });
  }, [formValues.appointmentDate]);

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
      const message = Object.values(validation.errors)[0] ?? "Vui lòng kiểm tra lại thông tin.";
      setValidationMessage(message);
      toast.error(message);
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
      toast.success("Tạo lịch hẹn khám thành công");
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error
        ? error.message
        : "Không thể tạo lịch hẹn. Vui lòng thử lại sau.";
      toast.error(message);
      setValidationMessage(message);
    }
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-text-secondary">
          Đang tải dữ liệu tạo lịch hẹn...
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full">
        <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-danger-text">
          Không thể tải dữ liệu tạo lịch hẹn.
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="heading-lg text-petcenter-text">Tạo lịch hẹn khám</h1>
        <p className="body-lg mt-2 text-petcenter-text-secondary">
          Chọn thú cưng, loại hình khám và thời gian phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <BookingSection number="1" title="Chọn thú cưng">
            <OwnerPetSelection
              pets={pets}
              selectedPetId={formValues.petId}
              onSelect={(petId) => updateFormValues({ petId })}
            />
          </BookingSection>

          <BookingSection number="2" title="Loại hình khám">
            <OwnerExamTypeSelection
              examTypes={examTypes}
              selectedExamTypeId={formValues.examTypeId}
              onSelect={(examTypeId) => updateFormValues({ examTypeId })}
            />
          </BookingSection>

          <BookingSection number="3" title="Thời gian khám">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </BookingSection>

          <BookingSection number="4" title="Triệu chứng (nếu có)">
            <OwnerAppointmentSymptomBox
              symptomDescription={formValues.symptomDescription}
              onSymptomDescriptionChange={(symptomDescription) =>
                updateFormValues({ symptomDescription })
              }
            />
          </BookingSection>

          <BookingSection number="5" title="Ghi chú thêm">
            <OwnerAppointmentNoteBox
              note={formValues.note}
              onNoteChange={(note) => updateFormValues({ note })}
            />
          </BookingSection>

          {validationMessage ? (
            <p className="body-sm rounded-[0.75rem] bg-petcenter-danger-bg p-3 text-petcenter-danger-text">
              {validationMessage}
            </p>
          ) : null}
        </div>

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

function BookingSection({
  children,
  number,
  title,
}: {
  children: React.ReactNode;
  number: string;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[rgba(189,201,197,0.3)] bg-white p-[25px] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[rgba(0,94,83,0.1)] px-2 text-[11px] font-semibold leading-[14px] tracking-[0.02em] text-[#005E53]">
          {number}
        </span>
        <h2 className="text-lg font-semibold leading-[26px] text-[#1B1C15]">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
