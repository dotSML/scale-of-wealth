import React from 'react';
import { WealthScroller } from '@/components/wealth/WealthScroller';

export const metadata = {
  title: 'Wealth, shown to scale',
  description: 'A physical scale visualization of extreme wealth inequality. 1 px² = $1,000.',
};

export default function HomePage() {
  return (
    <main>
      <WealthScroller />
    </main>
  );
}
