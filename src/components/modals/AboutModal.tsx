import { Info, Hammer, Star, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function AboutModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <header className="p-6 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Info className="text-accent" size={24} />
            <h2 className="text-xl font-bold text-ink">Thông tin ứng dụng</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-all">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-olive uppercase tracking-wider flex items-center gap-2">
              <Hammer size={16} className="text-accent" />
              Công nghệ sử dụng
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'date-fns',      desc: 'Thư viện xử lý thời gian và định dạng ngày tháng mạnh mẽ, chuẩn xác.' },
                { name: 'vn-lunar',      desc: 'Thư viện lõi tính toán Âm lịch Việt Nam dựa trên các công thức thiên văn học.' },
                { name: 'Lucide React',  desc: 'Hệ thống icon hiện đại, tối giản và đồng nhất cho giao diện.' },
                { name: 'Tailwind CSS',  desc: 'Framework CSS tiện ích giúp xây dựng giao diện phản hồi nhanh chóng.' },
              ].map(({ name, desc }) => (
                <div key={name} className="p-3 bg-hover/30 rounded-lg border border-border/50">
                  <div className="text-sm font-bold text-ink">{name}</div>
                  <div className="text-xs text-olive/80">{desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-olive uppercase tracking-wider flex items-center gap-2">
              <Star size={16} className="text-accent" />
              Phương pháp tính toán
            </h3>
            <div className="space-y-4 text-sm text-ink/80 leading-relaxed">
              <p>
                <strong className="text-ink">Thuật toán Âm lịch:</strong> Ứng dụng sử dụng các công thức
                thiên văn học chính xác để xác định các pha của Mặt Trăng và các tiết khí (24 tiết khí),
                đảm bảo sự đồng bộ hoàn hảo với hệ thống lịch truyền thống của Việt Nam.
              </p>
              <p>
                <strong className="text-ink">Đánh giá Ngày Tốt/Xấu:</strong> Hệ thống đánh giá dựa trên sự
                kết hợp giữa <em>Thập Nhị Trực</em> (12 Trực) và <em>Nhị Thập Bát Tú</em> (28 Ngôi sao).
                Mỗi ngày được phân tích các yếu tố cát hung để đưa ra nhận định tổng quát nhất.
              </p>
              <p>
                <strong className="text-ink">Xung khắc tuổi:</strong> Dựa trên quy tắc <em>Lục Xung</em> trong
                Địa Chi (Tý-Ngọ, Sửu-Mùi, Dần-Thân, Mão-Dậu, Thìn-Tuất, Tỵ-Hợi) để cảnh báo người dùng
                về các ngày có thể gây bất lợi cho bản mệnh.
              </p>
            </div>
          </section>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 leading-relaxed italic">
            Lưu ý: Các thông tin về ngày tốt/xấu và đánh giá chỉ mang tính chất tham khảo dựa trên các
            tài liệu cổ học phương Đông. Người dùng nên cân nhắc kỹ trước khi quyết định các việc trọng đại.
          </div>

        </div>

        <footer className="p-6 border-t border-border bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-all active:scale-95"
          >
            Đã hiểu
          </button>
        </footer>

      </div>
    </div>
  );
}
