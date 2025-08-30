import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Hatchways',
    template: '%s | Hatchways',
  },
  description: 'Hatchways - Your Personal AI Powered Mock Interviewer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Footer is automatically included on all pages except the homepage */}
      {/* The homepage has its own footer with the special styling */}
    </>
  );
}