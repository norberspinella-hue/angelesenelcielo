import { useState, useCallback, useRef, useEffect } from 'react';
import { ViewportState, clampPan, MAX_ZOOM, MIN_ZOOM, ZOOM_FACTOR, getPanToCenterPremiumZone } from '@/lib/mural/gridMath';

export function useMuralViewport(initialWidth = 1200, initialHeight = 800) {
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    zoom: 1, // Start at 1x
    width: initialWidth,
    height: initialHeight,
  });

  const viewportRef = useRef(viewport);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Multi-touch tracking for pinch-to-zoom on mobile
  const touchStartDist = useRef<number | null>(null);
  const touchStartZoom = useRef<number>(1);
  const touchStartMidpoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartViewport = useRef<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 1 });
  const isPinching = useRef(false);
  const hasMovedSignificantly = useRef(false);

  // Initialize centered on premium zone
  useEffect(() => {
    if (viewport.width > 0 && viewport.height > 0) {
      setViewport(prev => {
        const centerPan = getPanToCenterPremiumZone(prev.width, prev.height, prev.zoom);
        return {
          ...prev,
          x: centerPan.x,
          y: centerPan.y,
        };
      });
    }
  }, [viewport.width, viewport.height]); // Run once size is known

  const updateViewportSize = useCallback((w: number, h: number) => {
    setViewport(prev => ({
      ...prev,
      width: w,
      height: h,
    }));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle mouse / pen with pointer events; touch is handled with touch events
    if (e.pointerType === 'touch') return;
    isDragging.current = true;
    hasMovedSignificantly.current = false;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedSignificantly.current = true;
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setViewport(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      const clamped = clampPan(newX, newY, prev.width, prev.height, prev.zoom);
      return { ...prev, x: clamped.x, y: clamped.y };
    });
  }, []);

  const handlePointerUp = useCallback((e?: React.PointerEvent) => {
    if (e && e.pointerType === 'touch') return;
    isDragging.current = false;
  }, []);

  // Multi-touch gestures for mobile touchscreens
  const handleTouchStart = useCallback((e: TouchEvent, canvasRect?: DOMRect) => {
    const rect = canvasRect || (e.target as HTMLElement)?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 1) {
      isDragging.current = true;
      isPinching.current = false;
      hasMovedSignificantly.current = false;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length >= 2) {
      isDragging.current = false;
      isPinching.current = true;
      hasMovedSignificantly.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchStartDist.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartZoom.current = viewportRef.current.zoom;
      touchStartViewport.current = {
        x: viewportRef.current.x,
        y: viewportRef.current.y,
        zoom: viewportRef.current.zoom,
      };
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
      touchStartMidpoint.current = { x: midX, y: midY };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent, canvasRect?: DOMRect) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvasRect || (e.target as HTMLElement)?.getBoundingClientRect();
    if (!rect) return;

    if (isPinching.current && e.touches.length >= 2 && touchStartDist.current && touchStartDist.current > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scaleDelta = currentDist / touchStartDist.current;

      const currMidX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const currMidY = (t1.clientY + t2.clientY) / 2 - rect.top;

      let newZoom = touchStartZoom.current * scaleDelta;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      // Calculate world coordinate anchored under the start midpoint
      const startSlotSize = 16 * touchStartViewport.current.zoom; // BASE_SLOT = 16
      const worldX = (touchStartMidpoint.current.x - touchStartViewport.current.x) / startSlotSize;
      const worldY = (touchStartMidpoint.current.y - touchStartViewport.current.y) / startSlotSize;

      // Position that world coordinate at current midpoint in new zoom
      const newSlotSize = 16 * newZoom;
      const newX = currMidX - worldX * newSlotSize;
      const newY = currMidY - worldY * newSlotSize;

      const clamped = clampPan(newX, newY, viewportRef.current.width, viewportRef.current.height, newZoom);

      setViewport(prev => ({
        ...prev,
        zoom: newZoom,
        x: clamped.x,
        y: clamped.y,
      }));
    } else if (isDragging.current && e.touches.length === 1 && !isPinching.current) {
      const t = e.touches[0];
      const dx = t.clientX - lastMousePos.current.x;
      const dy = t.clientY - lastMousePos.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedSignificantly.current = true;
      }

      lastMousePos.current = { x: t.clientX, y: t.clientY };

      setViewport(prev => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;
        const clamped = clampPan(newX, newY, prev.width, prev.height, prev.zoom);
        return { ...prev, x: clamped.x, y: clamped.y };
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging.current = true;
      touchStartDist.current = null;
      setTimeout(() => {
        isPinching.current = false;
      }, 150);
    } else if (e.touches.length === 0) {
      isDragging.current = false;
      touchStartDist.current = null;
      setTimeout(() => {
        isPinching.current = false;
      }, 150);
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent, canvasRect?: DOMRect) => {
    e.preventDefault(); // Prevent default browser scrolling
    
    // Determine the point under the cursor to zoom towards
    let rect = canvasRect;
    if (!rect) {
      const target = (e.currentTarget || e.target) as HTMLElement;
      if (target && typeof target.getBoundingClientRect === 'function') {
        rect = target.getBoundingClientRect();
      } else {
        return; // Unable to determine rect
      }
    }
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let zoomDelta = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    
    // Handle pinch-to-zoom on trackpads (ctrlKey is true)
    if (e.ctrlKey) {
      zoomDelta = 1 - e.deltaY * 0.01;
    }

    setViewport(prev => {
      let newZoom = prev.zoom * zoomDelta;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      
      const ratio = newZoom / prev.zoom;
      
      // Calculate new pan to keep the point under cursor stable
      const newX = mx - (mx - prev.x) * ratio;
      const newY = my - (my - prev.y) * ratio;
      
      const clamped = clampPan(newX, newY, prev.width, prev.height, newZoom);

      return {
        ...prev,
        zoom: newZoom,
        x: clamped.x,
        y: clamped.y
      };
    });
  }, []);

  const centerOnCoord = useCallback((col: number, row: number, targetZoom?: number) => {
    setViewport(prev => {
      const zoom = targetZoom || prev.zoom;
      const slotSize = 16 * zoom; // Assuming BASE_SLOT is 16
      const centerX = prev.width / 2;
      const centerY = prev.height / 2;
      
      const newX = centerX - (col * slotSize);
      const newY = centerY - (row * slotSize);
      const clamped = clampPan(newX, newY, prev.width, prev.height, zoom);
      
      return {
        ...prev,
        zoom,
        x: clamped.x,
        y: clamped.y
      };
    });
  }, []);

  const zoomIn = useCallback(() => {
    setViewport(prev => {
      const newZoom = Math.min(MAX_ZOOM, prev.zoom * ZOOM_FACTOR);
      const ratio = newZoom / prev.zoom;
      const centerX = prev.width / 2;
      const centerY = prev.height / 2;
      
      const newX = centerX - (centerX - prev.x) * ratio;
      const newY = centerY - (centerY - prev.y) * ratio;
      
      const clamped = clampPan(newX, newY, prev.width, prev.height, newZoom);
      return { ...prev, zoom: newZoom, x: clamped.x, y: clamped.y };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => {
      const newZoom = Math.max(MIN_ZOOM, prev.zoom / ZOOM_FACTOR);
      const ratio = newZoom / prev.zoom;
      const centerX = prev.width / 2;
      const centerY = prev.height / 2;
      
      const newX = centerX - (centerX - prev.x) * ratio;
      const newY = centerY - (centerY - prev.y) * ratio;
      
      const clamped = clampPan(newX, newY, prev.width, prev.height, newZoom);
      return { ...prev, zoom: newZoom, x: clamped.x, y: clamped.y };
    });
  }, []);

  return {
    viewport,
    setViewport,
    updateViewportSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    centerOnCoord,
    zoomIn,
    zoomOut,
    isPinching,
    hasMovedSignificantly,
  };
}
