import { Textarea } from "@/components/ui/textarea";

interface OwnerAppointmentTextAreasProps {
  note: string;
  symptomDescription: string;
  onNoteChange: (value: string) => void;
  onSymptomDescriptionChange: (value: string) => void;
}

export function OwnerAppointmentTextAreas({
  note,
  onNoteChange,
  onSymptomDescriptionChange,
  symptomDescription,
}: OwnerAppointmentTextAreasProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <OwnerAppointmentSymptomBox
        symptomDescription={symptomDescription}
        onSymptomDescriptionChange={onSymptomDescriptionChange}
      />
      <OwnerAppointmentNoteBox note={note} onNoteChange={onNoteChange} />
    </div>
  );
}

export function OwnerAppointmentSymptomBox({
  onSymptomDescriptionChange,
  symptomDescription,
}: Pick<OwnerAppointmentTextAreasProps, "symptomDescription" | "onSymptomDescriptionChange">) {
  return (
    <Textarea
      id="symptom-description"
      value={symptomDescription}
      onChange={(event) => onSymptomDescriptionChange(event.target.value)}
      placeholder="Mô tả các dấu hiệu bất thường của thú cưng..."
      className="min-h-[86px] resize-none rounded-lg border-[#BDC9C5] bg-[#FBFAEE] px-[13px] py-[13px] text-sm leading-5 text-[#1B1C15] placeholder:text-[#6B7280] focus-visible:ring-0"
    />
  );
}

export function OwnerAppointmentNoteBox({
  note,
  onNoteChange,
}: Pick<OwnerAppointmentTextAreasProps, "note" | "onNoteChange">) {
  return (
    <Textarea
      id="appointment-note"
      value={note}
      onChange={(event) => onNoteChange(event.target.value)}
      placeholder="Các yêu cầu đặc biệt khác..."
      className="min-h-[86px] resize-none rounded-lg border-[#BDC9C5] bg-[#FBFAEE] px-[13px] py-[13px] text-sm leading-5 text-[#1B1C15] placeholder:text-[#6B7280] focus-visible:ring-0"
    />
  );
}
