export function ProcessSection() {
  return (
    <section id="process" className="bg-[#f1efe2] py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-petcenter-text">
            Chăm sóc thú cưng dễ dàng trong 3 bước
          </h2>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-petcenter-primary/30 z-0"></div>

          {[
            {
              step: "1",
              title: "Tạo hồ sơ thú cưng",
              desc: "Nhập thông tin cơ bản để chúng tôi cá nhân hóa lộ trình chăm sóc.",
              color: "text-petcenter-primary",
              bg: "bg-petcenter-primary/10",
            },
            {
              step: "2",
              title: "Đặt lịch dịch vụ",
              desc: "Chọn ngày giờ và dịch vụ mong muốn chỉ với vài thao tác đơn giản.",
              color: "text-petcenter-cta",
              bg: "bg-petcenter-cta/20",
            },
            {
              step: "3",
              title: "Theo dõi & Nhận thông báo",
              desc: "Cập nhật tình trạng liên tục và nhận nhắc nhở lịch khám tiếp theo.",
              color: "text-petcenter-primary",
              bg: "bg-petcenter-primary/10",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#f1efe2] bg-white shadow-md relative">
                <div className={`absolute inset-2 rounded-full ${item.bg}`}></div>
                <span className={`relative z-10 text-3xl font-bold ${item.color}`}>{item.step}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-petcenter-text">{item.title}</h3>
              <p className="max-w-[280px] text-sm text-petcenter-text-secondary leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
