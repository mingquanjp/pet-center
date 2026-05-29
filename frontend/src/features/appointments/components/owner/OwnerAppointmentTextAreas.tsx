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
      <div>
        <label className="title-md mb-2 block text-petcenter-text" htmlFor="symptom-description">
          5. Triệu chứng (nếu có)
        </label>
        <Textarea
          id="symptom-description"
          value={symptomDescription}
          onChange={(event) => onSymptomDescriptionChange(event.target.value)}
          placeholder="Mô tả các dấu hiệu bất thường của thú cưng..."
          className="body-md min-h-28 rounded-[0.75rem] border-petcenter-border bg-petcenter-card p-3 text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:ring-petcenter-primary/20"
        />
      </div>
      <div>
        <label className="title-md mb-2 block text-petcenter-text" htmlFor="appointment-note">
          6. Ghi chú thêm
        </label>
        <Textarea
          id="appointment-note"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Các yêu cầu đặc biệt khác..."
          className="body-md min-h-24 rounded-[0.75rem] border-petcenter-border bg-petcenter-card p-3 text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:ring-petcenter-primary/20"
        />
      </div>
    </div>
  );
}
