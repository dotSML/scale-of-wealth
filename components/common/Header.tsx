'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/" className={styles.titleLink}>
            <span className={styles.title}>THE SCALE OF WEALTH</span>
          </Link>
          <span className={styles.scaleBadge}>1 px² = $1,000</span>
        </div>

        <nav className={styles.nav} aria-label="Main Navigation">
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Scale Explorer
          </Link>
          <Link 
            href="/read" 
            className={`${styles.navLink} ${pathname === '/read' ? styles.active : ''}`}
            aria-current={pathname === '/read' ? 'page' : undefined}
          >
            Narrative Text
          </Link>
          <Link 
            href="/sources" 
            className={`${styles.navLink} ${pathname === '/sources' ? styles.active : ''}`}
            aria-current={pathname === '/sources' ? 'page' : undefined}
          >
            Sources & Snapshot
          </Link>
          <a
            href="https://github.com/dotSML/scale-of-wealth"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="GitHub Repository"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
