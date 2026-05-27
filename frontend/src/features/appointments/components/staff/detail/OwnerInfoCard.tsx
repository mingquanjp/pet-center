import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaffAppointmentDetail } from "../../../types/appointment.types";
import { Phone, Mail, User } from "lucide-react";

interface Props {
  owner: StaffAppointmentDetail["owner"];
}

export function OwnerInfoCard({ owner }: Props) {
  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Thông tin chủ nuôi</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-petcenter-background to-petcenter-border/40 flex items-center justify-center text-xl font-bold text-petcenter-primary shadow-sm border border-petcenter-border/50">
            {owner.fullName.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-petcenter-text tracking-tight">{owner.fullName}</div>
            <div className="text-sm font-medium text-petcenter-text-muted mt-0.5">Khách hàng</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mb-6 bg-petcenter-background/40 p-4 rounded-xl border border-petcenter-border/40">
          {owner.phoneNumber && (
            <div className="flex items-center gap-3 text-petcenter-text-secondary text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-petcenter-border/30">
                <Phone className="w-3.5 h-3.5 text-petcenter-primary" />
              </div>
              <span>{owner.phoneNumber}</span>
            </div>
          )}
          {owner.email && (
            <div className="flex items-center gap-3 text-petcenter-text-secondary text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-petcenter-border/30">
                <Mail className="w-3.5 h-3.5 text-petcenter-primary" />
              </div>
              <span className="truncate">{owner.email}</span>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-2">
          <Button 
            variant="outline" 
            className="w-full border-petcenter-primary/30 text-petcenter-primary hover:bg-petcenter-primary hover:text-white rounded-xl h-11 font-semibold text-sm transition-all shadow-sm"
            asChild
          >
            <a href={`tel:${owner.phoneNumber || ""}`}>
              <Phone className="w-4 h-4 mr-2" />
              Liên hệ
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
