import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-[#00796b]/10 to-[#d8f3ee]/30">
      <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-petcenter-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/4 rounded-full bg-petcenter-cta opacity-5 blur-3xl"></div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center lg:px-8">
        <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-5xl text-petcenter-text">
          Sẵn sàng chăm sóc thú cưng tốt hơn?
        </h2>
        <p className="mb-10 text-lg text-petcenter-text-secondary sm:text-xl">
          Bắt đầu với PetCenter để đặt lịch, theo dõi sức khỏe và quản lý dịch vụ toàn diện cho thú cưng của bạn.
        </p>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-petcenter-cta text-white hover:bg-petcenter-cta-hover h-14 px-10 text-lg shadow-lg border-0"
          >
            <Link href="/register">
              Đặt lịch ngay
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white border-petcenter-border text-petcenter-text hover:bg-petcenter-background h-14 px-10 text-lg shadow-sm">
            Liên hệ tư vấn
          </Button>
        </div>
      </div>
    </section>
  );
}
