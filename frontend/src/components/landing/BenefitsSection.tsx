import { Badge } from "@/components/ui/badge";
import { Activity, BellRing, ClipboardList, Calendar } from "lucide-react";

export function BenefitsSection() {
  return (
    <section id="benefits" className="mx-auto max-w-[1280px] px-6 py-16 md:py-24 lg:px-8 scroll-mt-20">
      <div className="mb-12">
        <Badge variant="secondary" className="mb-4 bg-[#fff3d8] text-[#b45309] hover:bg-[#fff3d8]/80 border-none">
          Vì sao chọn chúng tôi
        </Badge>
      </div>
      
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-petcenter-text">
            Nền tảng quản lý hiện đại cho trải nghiệm tốt nhất
          </h2>
          {[
            {
              title: "Theo dõi sức khỏe",
              desc: "Cập nhật liên tục các chỉ số sinh tồn và tình trạng sức khỏe qua từng ngày.",
              icon: Activity,
            },
            {
              title: "Nhắc lịch tự động",
              desc: "Hệ thống gửi thông báo nhắc nhở lịch tiêm phòng, tẩy giun và tái khám.",
              icon: BellRing,
            },
            {
              title: "Hồ sơ online",
              desc: "Truy cập hồ sơ bệnh án, lịch sử dịch vụ mọi lúc mọi nơi nhanh chóng.",
              icon: ClipboardList,
            },
            {
              title: "Quản lý trong một nơi",
              desc: "Theo dõi tiến trình spa, lưu trú và các gói dịch vụ chăm sóc tiện lợi.",
              icon: Calendar,
            },
          ].map((benefit, idx) => (
            <div key={idx} className="flex gap-5 rounded-2xl border border-petcenter-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-petcenter-primary/10 text-petcenter-primary">
                <benefit.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-petcenter-text">{benefit.title}</h3>
                <p className="mt-1 text-sm text-petcenter-text-secondary leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative aspect-square w-full lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden border border-petcenter-border shadow-xl bg-white p-4">
          <div className="h-full w-full rounded-2xl overflow-hidden relative bg-[#f7f6ea]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3KjkAyTWZjJPeIPz4Yr3KKsmoTHm5ei6cyF7wUp25JjMubRTyu3MnBoqMdqi0YJm94xQkES5I8rTnVB0SuisT-YU3cg87R63igBIste-YbZ7lTewZH8hRwvheRcsj70EyflDCTWfJdYQpPWM35pWqFJND_9sotNzBpoazOeuJfOc_fAbFZ3r6DYNAdnjUTQYoJWhBx2G-v2mneNARjbOvwsZY7wdski1NHGs2PUTZ8ojRaeXewzcz6LIVhXvJG8yb-5p7tIPFUGI"
              alt="Dashboard Preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
