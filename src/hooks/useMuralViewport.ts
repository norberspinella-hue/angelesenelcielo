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

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

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
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setViewport(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      const clamped = clampPan(newX, newY, prev.width, prev.height, prev.zoom);
      return { ...prev, x: clamped.x, y: clamped.y };
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
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
    updateViewportSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    centerOnCoord,
    zoomIn,
    zoomOut
  };
}
