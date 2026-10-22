import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScopeZero — Buyer',
  description: 'Kết quả phát thải sản phẩm do nhà cung cấp tự khai báo.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
