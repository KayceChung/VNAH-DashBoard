import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VNAH Dashboard",
  description: "Quản lý hồ sơ & xuất báo cáo PDF bảo mật cho VNAH",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
