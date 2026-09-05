'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { SceneId, SCENES, StoryBeat } from '@/data/story';
import {
  usdToScenePixel,
  getOverviewScale,
  LayoutOrientation,
  SceneLayout,
} from '@/lib/scene-geometry';
import {
  calculateFinalePackage,
  formatCurrency,
  DESKTOP_CORRIDOR_HEIGHT,
  MOBILE_CORRIDOR_WIDTH,
} from '@/lib/wealth-math';
import styles from './WealthCanvas.module.css';

interface WealthCanvasProps {
  sceneId: SceneId;
  sceneLayout: SceneLayout;
  currentPixelOffset: number; // Logical offset in pixels along scroll axis
  orientation: LayoutOrientation;
  isOverviewMode: boolean;
  activeBeat: StoryBeat | null;
  onSelectBeat?: (beat: StoryBeat) => void;
}

export function WealthCanvas({
  sceneId,
  sceneLayout,
  currentPixelOffset,
  orientation,
  isOverviewMode,
  activeBeat,
}: WealthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawCanonical = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    const isHorizontal = orientation === 'horizontal';
    const corridorHeight = DESKTOP_CORRIDOR_HEIGHT;
    const corridorWidth = MOBILE_CORRIDOR_WIDTH;

    // Background track line
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1;

    if (isHorizontal) {
      const centerY = Math.round(height / 2);
      const topY = centerY - corridorHeight / 2;

      // Draw horizontal track guide lines
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(width, topY);
      ctx.moveTo(0, topY + corridorHeight);
      ctx.lineTo(width, topY + corridorHeight);
      ctx.stroke();

      // Screen viewport X range in scene logical coordinates:
      const viewStart = currentPixelOffset;
      const viewEnd = currentPixelOffset + width;

      // Fortune rectangle bounds
      const fortuneStart = 0;
      const fortuneEnd = sceneLayout.totalPixels;

      // Check intersection
      if (fortuneEnd > viewStart && fortuneStart < viewEnd) {
        const renderX = Math.max(0, fortuneStart - viewStart);
        const renderW = Math.min(width, fortuneEnd - viewStart) - renderX;

        // Corridor fill
        ctx.fillStyle = '#121216';
        ctx.fillRect(renderX, topY, renderW, corridorHeight);

        // Corridor border
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(renderX, topY, renderW, corridorHeight);

        // Subtle leading edge highlight
        if (fortuneEnd >= viewStart && fortuneEnd <= viewEnd) {
          const endX = fortuneEnd - viewStart;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(endX, topY);
          ctx.lineTo(endX, topY + corridorHeight);
          ctx.stroke();
        }
      }

      // Draw Beat 30 Finale Slices if in finale or forbes400 scene
      if (sceneId === 'finale' || sceneId === 'forbes400') {
        const finaleData = calculateFinalePackage();
        let sliceOffsetUSD = 0;

        for (const item of finaleData.items) {
          const sliceStartPx = usdToScenePixel(sliceOffsetUSD, sceneId, 'horizontal');
          const sliceWidthPx = usdToScenePixel(item.totalCost, sceneId, 'horizontal');
          const screenX = sliceStartPx - viewStart;

          if (screenX + sliceWidthPx > 0 && screenX < width) {
            ctx.fillStyle = item.color;
            ctx.globalAlpha = 0.85;
            ctx.fillRect(Math.max(0, screenX), topY, Math.min(sliceWidthPx, width - screenX), corridorHeight);
            ctx.globalAlpha = 1.0;

            // Slice divider line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(screenX + sliceWidthPx, topY);
            ctx.lineTo(screenX + sliceWidthPx, topY + corridorHeight);
            ctx.stroke();

            // Label if wide enough
            if (sliceWidthPx > 60 && screenX > -sliceWidthPx && screenX < width) {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 12px monospace';
              ctx.fillText(item.name, Math.max(10, screenX + 8), topY + 24);
            }
          }

          sliceOffsetUSD += item.totalCost;
        }
      }

      // Draw embedded comparison markers
      for (const beat of sceneLayout.beats) {
        const beatPx = usdToScenePixel(beat.offsetInParentUSD, sceneId, 'horizontal');
        const screenX = beatPx - viewStart;

        if (screenX >= -100 && screenX <= width + 100) {
          const isSelected = activeBeat?.id === beat.id;

          // Vertical marker pin
          ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.setLineDash(isSelected ? [] : [4, 4]);

          ctx.beginPath();
          ctx.moveTo(screenX, topY - 30);
          ctx.lineTo(screenX, topY + corridorHeight + 30);
          ctx.stroke();
          ctx.setLineDash([]);

          // Marker top pin badge
          ctx.fillStyle = isSelected ? '#f59e0b' : '#27272a';
          ctx.beginPath();
          ctx.arc(screenX, topY - 10, isSelected ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();

          // Marker label
          ctx.fillStyle = isSelected ? '#f4f1ea' : '#a1a1aa';
          ctx.font = `${isSelected ? 'bold ' : ''}11px monospace`;
          ctx.fillText(beat.title, screenX + 8, topY - 8);
        }
      }

      // Wealth scale tick marks (every $10B, $50B, etc. based on fortune magnitude)
      const tickStepUSD = sceneLayout.totalUSD > 1_000_000_000_000 
        ? 500_000_000_000 
        : sceneLayout.totalUSD > 100_000_000_000 
        ? 50_000_000_000 
        : 10_000_000_000;

      const firstTickIndex = Math.floor((viewStart * (sceneLayout.totalUSD / sceneLayout.totalPixels)) / tickStepUSD);
      const lastTickIndex = Math.ceil((viewEnd * (sceneLayout.totalUSD / sceneLayout.totalPixels)) / tickStepUSD);

      ctx.fillStyle = '#52525b';
      ctx.font = '10px monospace';

      for (let t = Math.max(1, firstTickIndex); t <= lastTickIndex; t++) {
        const tickUSD = t * tickStepUSD;
        if (tickUSD >= sceneLayout.totalUSD) break;

        const tickPx = usdToScenePixel(tickUSD, sceneId, 'horizontal');
        const screenX = tickPx - viewStart;

        if (screenX >= 0 && screenX <= width) {
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenX, topY + corridorHeight);
          ctx.lineTo(screenX, topY + corridorHeight + 12);
          ctx.stroke();

          ctx.fillText(formatCurrency(tickUSD, { compact: true }), screenX + 4, topY + corridorHeight + 24);
        }
      }
    } else {
      // Mobile Vertical Track
      const centerX = Math.round(width / 2);
      const leftX = centerX - corridorWidth / 2;

      ctx.beginPath();
      ctx.moveTo(leftX, 0);
      ctx.lineTo(leftX, height);
      ctx.moveTo(leftX + corridorWidth, 0);
      ctx.lineTo(leftX + corridorWidth, height);
      ctx.stroke();

      const viewStart = currentPixelOffset;
      const viewEnd = currentPixelOffset + height;

      const fortuneStart = 0;
      const fortuneEnd = sceneLayout.totalPixels;

      if (fortuneEnd > viewStart && fortuneStart < viewEnd) {
        const renderY = Math.max(0, fortuneStart - viewStart);
        const renderH = Math.min(height, fortuneEnd - viewStart) - renderY;

        ctx.fillStyle = '#121216';
        ctx.fillRect(leftX, renderY, corridorWidth, renderH);

        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(leftX, renderY, corridorWidth, renderH);
      }

      // Comparison markers on mobile
      for (const beat of sceneLayout.beats) {
        const beatPx = usdToScenePixel(beat.offsetInParentUSD, sceneId, 'vertical');
        const screenY = beatPx - viewStart;

        if (screenY >= -50 && screenY <= height + 50) {
          const isSelected = activeBeat?.id === beat.id;
          ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = isSelected ? 2 : 1;

          ctx.beginPath();
          ctx.moveTo(leftX - 20, screenY);
          ctx.lineTo(leftX + corridorWidth + 20, screenY);
          ctx.stroke();

          ctx.fillStyle = isSelected ? '#f4f1ea' : '#a1a1aa';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(beat.title, leftX + 8, screenY - 6);
        }
      }
    }
  }, [orientation, sceneId, sceneLayout, currentPixelOffset, activeBeat]);

  const drawOverview = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    const overview = getOverviewScale(sceneId, width, height, orientation);
    const centerX = width / 2;
    const centerY = height / 2;

    const renderX = centerX - overview.overviewWidth / 2;
    const renderY = centerY - overview.overviewHeight / 2;

    // Outer background box
    ctx.fillStyle = 'rgba(18, 18, 22, 0.9)';
    ctx.fillRect(renderX - 20, renderY - 40, overview.overviewWidth + 40, overview.overviewHeight + 80);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.strokeRect(renderX - 20, renderY - 40, overview.overviewWidth + 40, overview.overviewHeight + 80);

    // Scaled parent rectangle
    ctx.fillStyle = '#1c1c24';
    ctx.fillRect(renderX, renderY, overview.overviewWidth, overview.overviewHeight);

    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(renderX, renderY, overview.overviewWidth, overview.overviewHeight);

    // If finale or forbes400, draw carved-out 2.9% package slices
    if (sceneId === 'finale' || sceneId === 'forbes400') {
      const finaleData = calculateFinalePackage();
      let sliceUSD = 0;

      for (const item of finaleData.items) {
        const itemFraction = item.totalCost / sceneLayout.totalUSD;
        const sliceW = overview.overviewWidth * itemFraction;
        const sliceX = renderX + (sliceUSD / sceneLayout.totalUSD) * overview.overviewWidth;

        ctx.fillStyle = item.color;
        ctx.fillRect(sliceX, renderY, Math.max(2, sliceW), overview.overviewHeight);

        sliceUSD += item.totalCost;
      }

      // Divider line showing the carve-out boundary
      const carveW = (finaleData.packageTotal / sceneLayout.totalUSD) * overview.overviewWidth;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(renderX + carveW, renderY);
      ctx.lineTo(renderX + carveW, renderY + overview.overviewHeight);
      ctx.stroke();

      // Annotations
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(
        `Package: $190B (${finaleData.packagePercentage.toFixed(1)}%)`,
        renderX,
        renderY - 12
      );

      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(
        `Remainder: $6.41T (${finaleData.remainderPercentage.toFixed(1)}%)`,
        renderX + Math.max(carveW + 20, 140),
        renderY - 12
      );
    } else {
      // Draw comparisons as pins on overview
      for (const beat of sceneLayout.beats) {
        const fraction = beat.offsetInParentUSD / sceneLayout.totalUSD;
        const beatX = renderX + fraction * overview.overviewWidth;

        ctx.strokeStyle = activeBeat?.id === beat.id ? '#f59e0b' : 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = activeBeat?.id === beat.id ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(beatX, renderY - 8);
        ctx.lineTo(beatX, renderY + overview.overviewHeight + 8);
        ctx.stroke();
      }

      // Title
      ctx.fillStyle = '#f4f1ea';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(
        `${SCENES[sceneId].title} — Overview`,
        renderX,
        renderY - 14
      );
    }

    // Current viewport indicator on overview
    const currentFraction = currentPixelOffset / sceneLayout.totalPixels;
    const currentX = renderX + currentFraction * overview.overviewWidth;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, renderY - 16);
    ctx.lineTo(currentX, renderY + overview.overviewHeight + 16);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = '10px monospace';
    ctx.fillText('YOU ARE HERE', currentX - 35, renderY + overview.overviewHeight + 28);
  }, [sceneId, orientation, sceneLayout, currentPixelOffset, activeBeat]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);

    if (isOverviewMode) {
      drawOverview(ctx, rect.width, rect.height);
    } else {
      drawCanonical(ctx, rect.width, rect.height);
    }

    ctx.restore();
  }, [drawCanonical, drawOverview, isOverviewMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className={styles.canvas}
      aria-hidden="true"
    />
  );
}
