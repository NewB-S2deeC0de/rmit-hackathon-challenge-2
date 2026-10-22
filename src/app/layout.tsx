import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScopeZero — Privacy-Preserving PCF Platform',
  description:
    'Hệ thống chia sẻ Dấu chân Carbon Sản phẩm (PCF) với bảo mật dữ liệu E2EE TideCloak và Quản trị đa quản trị viên QEA.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
