import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PawPrint, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-petcenter-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <PawPrint className="h-7 w-7 text-petcenter-primary" />
          <span className="text-xl font-bold tracking-tight text-petcenter-primary">
            PetCenter
          </span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-medium text-petcenter-text-secondary">
          <Link href="#hero" className="text-petcenter-primary font-semibold transition-colors hover:text-petcenter-primary">Trang chủ</Link>
          <Link href="#services" className="transition-colors hover:text-petcenter-primary">Dịch vụ</Link>
          <Link href="#benefits" className="transition-colors hover:text-petcenter-primary">Lợi ích</Link>
          <Link href="#process" className="transition-colors hover:text-petcenter-primary">Quy trình</Link>
          <Link href="#contact" className="transition-colors hover:text-petcenter-primary">Liên hệ</Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button
            asChild
            variant="ghost"
            className="text-petcenter-text hover:text-petcenter-primary hover:bg-petcenter-primary/10"
          >
            <Link href="/login">
              Đăng nhập
            </Link>
          </Button>
          <Button
            asChild
            className="bg-petcenter-cta text-white hover:bg-petcenter-cta-hover shadow-sm border-0"
          >
            <Link href="/register">
              Đăng ký
            </Link>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden text-petcenter-primary">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
