import React from 'react';
import { Header } from '@/components/common/Header';
import { WealthScroller } from '@/components/wealth/WealthScroller';

export default function HomePage() {
  return (
    <main>
      <Header />
      <WealthScroller />
    </main>
  );
}
