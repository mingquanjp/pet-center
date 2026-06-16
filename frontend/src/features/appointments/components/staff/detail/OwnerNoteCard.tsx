import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Props {
  note?: string;
  symptom?: string;
}

export function OwnerNoteCard({ note, symptom }: Props) {
  const displayNote = note || symptom;

  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-cta/10 flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5 text-petcenter-cta" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">
            Ghi chú từ chủ nuôi
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {displayNote ? (
          <div className="bg-petcenter-warning-bg/50 p-5 rounded-2xl text-petcenter-text text-base border border-petcenter-cta/20 whitespace-pre-line leading-relaxed shadow-sm relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-petcenter-cta rounded-l-2xl"></div>
            <div className="italic text-petcenter-text-secondary pl-2">
              &quot;{displayNote}&quot;
            </div>
          </div>
        ) : (
          <div className="bg-petcenter-background/50 p-5 rounded-2xl text-petcenter-text-muted text-base border border-petcenter-border/50 italic flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4 opacity-50" />
            Không có ghi chú nào được thêm.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
