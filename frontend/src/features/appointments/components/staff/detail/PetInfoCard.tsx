import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffAppointmentDetail } from "../../../types/appointment.types";
import { Info, Weight, Cat, Dog, Calendar } from "lucide-react";
import Image from "next/image";

interface Props {
  pet: StaffAppointmentDetail["pet"];
}

export function PetInfoCard({ pet }: Props) {
  const isDog = pet.species === "Dog";
  const isCat = pet.species === "Cat";

  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <Dog className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Thông tin thú cưng</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-5 p-1">
          {pet.imageUrl ? (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-petcenter-border/50 ring-4 ring-petcenter-background/50">
              <Image src={pet.imageUrl} alt={pet.name} fill className="object-cover" sizes="96px" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-petcenter-background to-petcenter-border/30 flex items-center justify-center text-3xl font-bold text-petcenter-primary shadow-sm border border-petcenter-border/50 ring-4 ring-petcenter-background/50">
              {pet.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-lg font-bold text-petcenter-text tracking-tight">{pet.name}</span>
              </div>
              <div className="text-sm font-medium text-petcenter-text-muted mt-0.5 flex items-center gap-1.5">
                {isDog ? <Dog className="w-3.5 h-3.5" /> : isCat ? <Cat className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                {isDog ? "Chó" : isCat ? "Mèo" : "Khác"}{pet.breed ? ` • ${pet.breed}` : ""}
              </div>
            </div>
            
            <div className="flex gap-3">
              {pet.ageText && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-petcenter-background/70 rounded-xl border border-petcenter-border/50 text-petcenter-text text-sm font-medium">
                  <Calendar className="w-3.5 h-3.5 text-petcenter-text-muted" />
                  {pet.ageText}
                </div>
              )}
              {pet.weightText && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-petcenter-background/70 rounded-xl border border-petcenter-border/50 text-petcenter-text text-sm font-medium">
                  <Weight className="w-3.5 h-3.5 text-petcenter-text-muted" />
                  {pet.weightText}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
