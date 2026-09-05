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
  const bufferDimsRef = useRef({ width: 0, height: 0, dpr: 0 });

  const drawCanonical = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    const isHorizontal = orientation === 'horizontal';
    const corridorHeight = DESKTOP_CORRIDOR_HEIGHT;
    const corridorWidth = MOBILE_CORRIDOR_WIDTH;
    const isCorridor = SCENES[sceneId].isCorridor;

    if (isHorizontal) {
      const centerY = Math.round(height / 2);
      const topY = centerY - corridorHeight / 2;
      const bottomY = topY + corridorHeight;

      // Track center guide line
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      const viewStart = currentPixelOffset;
      const viewEnd = currentPixelOffset + width;

      // ----------------------------------------------------
      // CASE 1: CORRIDOR SCENES (musk, forbes400, global, finale)
      // ----------------------------------------------------
      if (isCorridor) {
        // Upper and lower boundary rail lines
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, topY);
        ctx.lineTo(width, topY);
        ctx.moveTo(0, bottomY);
        ctx.lineTo(width, bottomY);
        ctx.stroke();

        const fortuneStart = 0;
        const fortuneEnd = sceneLayout.totalPixels;

        // Draw main fortune corridor if intersecting viewport
        if (fortuneEnd > viewStart && fortuneStart < viewEnd) {
          const renderX = Math.max(0, fortuneStart - viewStart);
          const renderW = Math.min(width, fortuneEnd - viewStart) - renderX;

          // Main filled corridor with rich, solid contrast
          ctx.fillStyle = '#141419';
          ctx.fillRect(renderX, topY, renderW, corridorHeight);

          // Corridor outer stroke
          ctx.strokeStyle = '#3f3f46';
          ctx.lineWidth = 2;
          ctx.strokeRect(renderX, topY, renderW, corridorHeight);

          // Leading edge indicator
          if (fortuneEnd >= viewStart && fortuneEnd <= viewEnd) {
            const endX = fortuneEnd - viewStart;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(endX, topY);
            ctx.lineTo(endX, bottomY);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('END OF FORTUNE', endX + 8, topY + 20);
          }
        }

        // Draw Beat 30 Finale Slices if in finale scene
        if (sceneId === 'finale') {
          const finaleData = calculateFinalePackage();
          let sliceOffsetUSD = 0;

          for (const item of finaleData.items) {
            const sliceStartPx = usdToScenePixel(sliceOffsetUSD, sceneId, 'horizontal');
            const sliceWidthPx = usdToScenePixel(item.totalCost, sceneId, 'horizontal');
            const screenX = sliceStartPx - viewStart;

            if (screenX + sliceWidthPx > 0 && screenX < width) {
              ctx.fillStyle = item.color;
              ctx.fillRect(Math.max(0, screenX), topY, Math.min(sliceWidthPx, width - screenX), corridorHeight);

              // Slice separator
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(screenX + sliceWidthPx, topY);
              ctx.lineTo(screenX + sliceWidthPx, bottomY);
              ctx.stroke();

              // Visible label on package
              if (sliceWidthPx > 80 && screenX > -sliceWidthPx && screenX < width) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 13px sans-serif';
                ctx.fillText(item.name, Math.max(12, screenX + 12), topY + 36);
                ctx.font = '11px monospace';
                ctx.fillText(formatCurrency(item.totalCost, { compact: true }), Math.max(12, screenX + 12), topY + 54);
              }
            }

            sliceOffsetUSD += item.totalCost;
          }

          // Boundary line between package and remainder
          const carveEndPx = usdToScenePixel(finaleData.packageTotal, sceneId, 'horizontal');
          const carveScreenX = carveEndPx - viewStart;
          if (carveScreenX >= 0 && carveScreenX <= width) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(carveScreenX, topY - 20);
            ctx.lineTo(carveScreenX, bottomY + 20);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('← $190B PACKAGE (2.9%) | $6.41T REMAINDER (97.1%) →', carveScreenX + 8, topY - 8);
          }
        }

        // Draw embedded comparison shapes for Musk / Forbes400
        for (const beat of sceneLayout.beats) {
          const beatPx = usdToScenePixel(beat.offsetInParentUSD, sceneId, 'horizontal');
          const screenX = beatPx - viewStart;

          if (screenX >= -150 && screenX <= width + 150) {
            const isSelected = activeBeat?.id === beat.id;

            // If beat has a comparison shape slice
            if (beat.comparisonUSD && beat.comparisonUSD > 0 && beat.shapeType === 'slice') {
              const sliceWPx = usdToScenePixel(beat.comparisonUSD, sceneId, 'horizontal');
              ctx.fillStyle = beat.shapeColor;
              ctx.globalAlpha = isSelected ? 0.95 : 0.75;
              ctx.fillRect(Math.max(0, screenX), topY, Math.min(sliceWPx, width - screenX), corridorHeight);
              ctx.globalAlpha = 1.0;

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(screenX, topY, sliceWPx, corridorHeight);
            }

            // Pin marker line
            ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.45)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.setLineDash(isSelected ? [] : [4, 4]);
            ctx.beginPath();
            ctx.moveTo(screenX, topY - 24);
            ctx.lineTo(screenX, bottomY + 24);
            ctx.stroke();
            ctx.setLineDash([]);

            // Pin badge
            ctx.fillStyle = isSelected ? '#f59e0b' : '#3f3f46';
            ctx.beginPath();
            ctx.arc(screenX, topY - 8, isSelected ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = isSelected ? '#ffffff' : '#a1a1aa';
            ctx.font = isSelected ? 'bold 12px sans-serif' : '11px sans-serif';
            ctx.fillText(beat.title, screenX + 10, topY - 8);
          }
        }

        // Wealth scale tick marks
        const tickStepUSD = sceneLayout.totalUSD > 1_000_000_000_000 
          ? 500_000_000_000 
          : sceneLayout.totalUSD > 100_000_000_000 
          ? 50_000_000_000 
          : 10_000_000_000;

        const firstTickIndex = Math.floor((viewStart * (sceneLayout.totalUSD / sceneLayout.totalPixels)) / tickStepUSD);
        const lastTickIndex = Math.ceil((viewEnd * (sceneLayout.totalUSD / sceneLayout.totalPixels)) / tickStepUSD);

        ctx.fillStyle = '#71717a';
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
            ctx.moveTo(screenX, bottomY);
            ctx.lineTo(screenX, bottomY + 10);
            ctx.stroke();

            ctx.fillText(formatCurrency(tickUSD, { compact: true }), screenX + 4, bottomY + 22);
          }
        }
      } 
      // ----------------------------------------------------
      // CASE 2: AUTHORED SHAPE SCENES (ordinary, ladder)
      // ----------------------------------------------------
      else {
        // Draw each beat as an actual filled, proportional shape!
        for (const beat of sceneLayout.beats) {
          const screenX = beat.editorialPlacementPx - viewStart;
          if (screenX < -600 || screenX > width + 600) continue;

          const isSelected = activeBeat?.id === beat.id;

          // SPECIAL CASE 1: The $1,000 pixel
          if (beat.shapeType === 'pixel') {
            // Draw exact 1px pixel
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(Math.round(screenX), Math.round(centerY), 1, 1);

            // Draw clean locator reticle around the pixel (separate from monetary area)
            ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            ctx.arc(screenX + 0.5, centerY + 0.5, 12, 0, Math.PI * 2);
            ctx.stroke();

            // Crosshair marks
            ctx.beginPath();
            ctx.moveTo(screenX - 18, centerY + 0.5);
            ctx.lineTo(screenX - 4, centerY + 0.5);
            ctx.moveTo(screenX + 5, centerY + 0.5);
            ctx.lineTo(screenX + 19, centerY + 0.5);
            ctx.moveTo(screenX + 0.5, centerY - 18);
            ctx.lineTo(screenX + 0.5, centerY - 4);
            ctx.moveTo(screenX + 0.5, centerY + 5);
            ctx.lineTo(screenX + 0.5, centerY + 19);
            ctx.stroke();

            // Dimension label
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '10px monospace';
            ctx.fillText('1 px × 1 px', screenX - 28, centerY + 30);
          }

          // SPECIAL CASE 2: Filled Squares ($27k, $84k, $193k, $300k, $3.35M, $1M, $10M, $100M)
          else if (beat.shapeType === 'square') {
            const side = beat.shapeWidth;
            const drawX = screenX - side / 2;
            const drawY = centerY - side / 2;

            // Draw filled shape with strong contrast
            ctx.fillStyle = beat.shapeColor;
            ctx.fillRect(drawX, drawY, side, side);

            ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(drawX, drawY, side, side);

            // Subtle glow if selected
            if (isSelected) {
              ctx.strokeStyle = beat.shapeColor;
              ctx.lineWidth = 4;
              ctx.strokeRect(drawX - 2, drawY - 2, side + 4, side + 4);
            }

            // Dimension label below shape
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '10px monospace';
            const dimText = `${side.toFixed(side < 10 ? 1 : 0)}px × ${side.toFixed(side < 10 ? 1 : 0)}px`;
            ctx.fillText(dimText, drawX, drawY + side + 16);

            // If this beat references earlier beats, draw them side-by-side!
            if (beat.referenceBeatIds?.includes('beat-04') && beat.id !== 'beat-04') {
              // Draw median family net worth square ($193k, 13.89px) beside it for visual comparison!
              const refSide = 13.89;
              const refX = drawX - refSide - 16;
              const refY = centerY - refSide / 2;

              ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
              ctx.fillRect(refX, refY, refSide, refSide);
              ctx.strokeStyle = '#60a5fa';
              ctx.lineWidth = 1;
              ctx.strokeRect(refX, refY, refSide, refSide);

              ctx.fillStyle = '#60a5fa';
              ctx.font = '9px monospace';
              ctx.fillText('Median Family', refX - 10, refY - 8);
              ctx.fillText('($193k)', refX - 10, refY + refSide + 12);
            }
          }

          // SPECIAL CASE 3: $1 Billion corridor in ladder scene
          else if (beat.shapeType === 'corridor') {
            const startX = screenX;
            const corrW = beat.shapeWidth;
            const top = centerY - corridorHeight / 2;

            ctx.fillStyle = '#141419';
            ctx.fillRect(startX, top, corrW, corridorHeight);

            ctx.strokeStyle = isSelected ? '#f59e0b' : '#3f3f46';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, top, corrW, corridorHeight);

            // Right at the mouth of the corridor: Draw the $1M square (31.6px) sitting at the entrance!
            const milSide = 31.62;
            const milX = startX + 16;
            const milY = centerY - milSide / 2;

            ctx.fillStyle = '#10b981';
            ctx.fillRect(milX, milY, milSide, milSide);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(milX, milY, milSide, milSide);

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('$1M (1,000 px²)', milX, milY - 8);

            // And also draw the $193k square right beside the $1M square!
            const netW = 13.89;
            const netX = milX + milSide + 12;
            const netY = centerY - netW / 2;

            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(netX, netY, netW, netW);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(netX, netY, netW, netW);

            ctx.fillStyle = '#60a5fa';
            ctx.font = '10px monospace';
            ctx.fillText('$193k', netX, netY - 8);
          }
        }
      }
    } else {
      // ----------------------------------------------------
      // MOBILE VERTICAL TRACK
      // ----------------------------------------------------
      const centerX = Math.round(width / 2);
      const leftX = centerX - corridorWidth / 2;
      const rightX = leftX + corridorWidth;

      const viewStart = currentPixelOffset;
      const viewEnd = currentPixelOffset + height;

      if (isCorridor) {
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, 0);
        ctx.lineTo(leftX, height);
        ctx.moveTo(rightX, 0);
        ctx.lineTo(rightX, height);
        ctx.stroke();

        const fortuneStart = 0;
        const fortuneEnd = sceneLayout.totalPixels;

        if (fortuneEnd > viewStart && fortuneStart < viewEnd) {
          const renderY = Math.max(0, fortuneStart - viewStart);
          const renderH = Math.min(height, fortuneEnd - viewStart) - renderY;

          ctx.fillStyle = '#141419';
          ctx.fillRect(leftX, renderY, corridorWidth, renderH);

          ctx.strokeStyle = '#3f3f46';
          ctx.lineWidth = 2;
          ctx.strokeRect(leftX, renderY, corridorWidth, renderH);
        }
      } else {
        // Mobile authored shapes
        for (const beat of sceneLayout.beats) {
          const screenY = beat.editorialPlacementPx - viewStart;
          if (screenY < -300 || screenY > height + 300) continue;

          const isSelected = activeBeat?.id === beat.id;

          if (beat.shapeType === 'pixel') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(centerX, Math.round(screenY), 1, 1);

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX + 0.5, screenY + 0.5, 12, 0, Math.PI * 2);
            ctx.stroke();
          } else if (beat.shapeType === 'square') {
            const side = beat.shapeWidth;
            const drawX = centerX - side / 2;
            const drawY = screenY - side / 2;

            ctx.fillStyle = beat.shapeColor;
            ctx.fillRect(drawX, drawY, side, side);

            ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(drawX, drawY, side, side);
          }
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
    ctx.fillStyle = 'rgba(18, 18, 22, 0.95)';
    ctx.fillRect(renderX - 24, renderY - 50, overview.overviewWidth + 48, overview.overviewHeight + 90);

    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1;
    ctx.strokeRect(renderX - 24, renderY - 50, overview.overviewWidth + 48, overview.overviewHeight + 90);

    // Header label
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PROPORTIONAL OVERVIEW', renderX, renderY - 26);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '11px sans-serif';
    ctx.fillText('(Showing true relative proportions · Not drawn at 1 CSS px² = $1,000)', renderX + 180, renderY - 26);

    // Parent rectangle
    ctx.fillStyle = '#1c1c24';
    ctx.fillRect(renderX, renderY, overview.overviewWidth, overview.overviewHeight);

    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(renderX, renderY, overview.overviewWidth, overview.overviewHeight);

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

      const carveW = (finaleData.packageTotal / sceneLayout.totalUSD) * overview.overviewWidth;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(renderX + carveW, renderY);
      ctx.lineTo(renderX + carveW, renderY + overview.overviewHeight);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(
        `Package: $190B (${finaleData.packagePercentage.toFixed(1)}%)`,
        renderX,
        renderY - 8
      );

      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(
        `Remainder: $6.41T (${finaleData.remainderPercentage.toFixed(1)}%)`,
        renderX + Math.max(carveW + 16, 160),
        renderY - 8
      );
    }
  }, [sceneId, orientation, sceneLayout]);

  // Main render loop: update backing buffer ONLY when dimensions/DPR change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    // Only resize canvas backing buffer when dimensions or DPR change!
    if (
      bufferDimsRef.current.width !== targetW ||
      bufferDimsRef.current.height !== targetH ||
      bufferDimsRef.current.dpr !== dpr
    ) {
      canvas.width = targetW;
      canvas.height = targetH;
      bufferDimsRef.current = { width: targetW, height: targetH, dpr };
    }

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
