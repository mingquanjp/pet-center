import Link from "next/link";
import { PawPrint, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#00210c] py-16 text-white/90">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#97f3e2]">
              <PawPrint className="h-8 w-8" />
              <span className="text-2xl font-bold">PetCenter</span>
            </div>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Nền tảng quản lý dịch vụ chăm sóc thú cưng chuyên nghiệp, hiện đại, mang lại sự an tâm tuyệt đối cho chủ nuôi.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Dịch vụ</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li><Link href="#" className="transition-colors hover:text-[#97f3e2]">Khám chữa bệnh</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#97f3e2]">Spa & Làm đẹp</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#97f3e2]">Khách sạn lưu trú</Link></li>
              <li><Link href="#" className="transition-colors hover:text-[#97f3e2]">Tiêm phòng định kỳ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-[#97f3e2]" />
                <span>Số 1, Đại Cồ Việt, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-[#97f3e2]" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-[#97f3e2]" />
                <span>petcenter.support@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Giờ làm việc</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Thứ 2 - Thứ 6:</span>
                <span>08:00 - 20:00</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Thứ 7 - CN:</span>
                <span>09:00 - 18:00</span>
              </li>
              <li className="flex justify-between pt-1 font-medium text-[#ffddb8]">
                <span>Cấp cứu 24/7:</span>
                <span>1900 9999</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row">
          <p>© 2024 PetCenter. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-white">Điều khoản</Link>
            <Link href="#" className="transition-colors hover:text-white">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
