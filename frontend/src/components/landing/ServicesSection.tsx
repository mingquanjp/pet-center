import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Sparkles, Home, Syringe } from "lucide-react";

export function ServicesSection() {
  return (
    <section id="services" className="bg-white py-16 md:py-24 border-y border-petcenter-border/60 scroll-mt-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4 bg-[#d8f3ee] text-[#00796b] hover:bg-[#d8f3ee]/80 border-none">
            Dịch vụ cốt lõi
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-petcenter-text">Dịch vụ của chúng tôi</h2>
          <p className="mt-4 max-w-2xl text-lg text-petcenter-text-secondary">
            Chăm sóc toàn diện từ y tế đến làm đẹp, đảm bảo thú cưng của bạn luôn khỏe mạnh và hạnh phúc.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Khám bệnh",
              desc: "Chẩn đoán và điều trị bệnh lý chuyên sâu với thiết bị hiện đại.",
              icon: Stethoscope,
            },
            {
              title: "Spa",
              desc: "Dịch vụ tắm, cắt tỉa lông, vệ sinh chuyên nghiệp và tận tâm.",
              icon: Sparkles,
            },
            {
              title: "Lưu trú",
              desc: "Khách sạn thú cưng tiện nghi, an toàn với chế độ chăm sóc 24/7.",
              icon: Home,
            },
            {
              title: "Tiêm phòng",
              desc: "Lịch tiêm chủng đầy đủ, vắc xin phòng ngừa bệnh chuẩn quốc tế.",
              icon: Syringe,
            },
          ].map((service, idx) => (
            <Card key={idx} className="group cursor-pointer border-[#e6e8dd] bg-white transition-all hover:-translate-y-1 hover:border-petcenter-primary/30 hover:shadow-lg rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="flex flex-col items-center p-8 text-center pt-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d8f3ee] text-[#00796b] transition-transform group-hover:scale-110 shadow-inner">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-petcenter-text">{service.title}</h3>
                <p className="text-sm text-petcenter-text-secondary leading-relaxed">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
