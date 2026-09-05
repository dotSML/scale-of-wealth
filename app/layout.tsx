import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Scale of Wealth — A Visual and Physical Exploration',
  description: 'An editorial visualization of extreme wealth concentration. 1 pixel² equals $1,000. Experience the physical distance of modern inequality through true mathematical scale.',
  keywords: ['wealth inequality', 'billionaires', 'visual scale', 'Elon Musk', 'Jeff Bezos', 'Forbes 400'],
  openGraph: {
    title: 'The Scale of Wealth',
    description: 'Explore wealth inequality drawn to physical scale: 1 pixel² = $1,000.',
    type: 'website',
    url: 'https://scale-of-wealth.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Scale of Wealth',
    description: 'Explore wealth inequality drawn to physical scale: 1 pixel² = $1,000.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
