import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Heart, Syringe } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section id="hero" className="mx-auto max-w-[1280px] px-6 py-16 md:py-24 lg:px-8 scroll-mt-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-petcenter-text sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Quản lý chăm sóc thú cưng toàn diện tại <span className="text-petcenter-primary">PetCenter</span>
          </h1>
          <p className="max-w-lg text-lg text-petcenter-text-secondary sm:text-xl">
            Đặt lịch khám, theo dõi hồ sơ sức khỏe, spa, lưu trú và hóa đơn trong một nền tảng duy nhất, hiện đại và bảo mật.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <Button
              asChild
              size="lg"
              className="bg-petcenter-cta text-white hover:bg-petcenter-cta-hover h-12 px-8 text-base shadow-sm border-0"
            >
              <Link href="/register">
                Đặt lịch ngay
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary/5 h-12 px-8 text-base"
            >
              <Link href="#services">
                Khám phá dịch vụ
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 border-t border-petcenter-border text-sm text-petcenter-text-secondary font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-petcenter-primary" />
              <span>24/7 hỗ trợ lưu trú</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-petcenter-primary" />
              <span>Hồ sơ sức khỏe online</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-petcenter-primary" />
              <span>Đội ngũ chuyên nghiệp</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#97f3e2] to-[#c5ecc9] rounded-[32px] opacity-30 blur-2xl"></div>
          <div className="relative aspect-[4/3] w-full rounded-2xl border border-white/40 bg-white/60 p-2 shadow-2xl backdrop-blur-sm lg:aspect-square">
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-petcenter-background">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP8bgYxyfHfkGwJSZINlz4FiBkH-Vv7JHwKhTdF5RyI1DpnQ1AtOFbTtztROdO8GcsP-xKsJBtWiTkEL63jZWEj44DiMdaBvqppkNosn76xhJQtBrY7jIPrp8G-7eV2z4DMIkk9s4hgK-KYN8X7pTQJHEEpn2GGNAtk8Cqa5uJpR2tMHnQ2fc6sLj7gRddGcWPyzuH7N2qsK6k9DuzyZFe4ix7Ox7BVRC5TLzsvD8IWXt-a2kYdm89tUCNvMkfA4Fi0RhZsAb__-w"
                alt="Happy dog at clinic"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-6 top-8 animate-bounce" style={{ animationDuration: '3s' }}>
              <Card className="flex items-center gap-3 border-petcenter-border/50 bg-white/95 p-3 shadow-lg backdrop-blur-md rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f3ee] text-[#00796b]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-petcenter-text-muted">Hôm nay</p>
                  <p className="text-sm font-medium text-petcenter-text">Lịch hẹn lúc 14:00</p>
                </div>
              </Card>
            </div>

            <div className="absolute -right-6 bottom-16">
              <Card className="flex items-center gap-3 border-petcenter-border/50 bg-white/95 p-3 shadow-lg backdrop-blur-md rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff3e3] text-[#2e7d32]">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-petcenter-text-muted">Sức khỏe</p>
                  <p className="text-sm font-medium text-petcenter-text">Khỏe mạnh</p>
                </div>
              </Card>
            </div>

            <div className="absolute right-4 top-32">
              <Badge className="bg-[#fde2e2] text-[#b91c1c] hover:bg-[#fde2e2] shadow-sm px-3 py-1 border-none">
                <Syringe className="mr-1 h-3 w-3" />
                Nhắc tiêm phòng
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
