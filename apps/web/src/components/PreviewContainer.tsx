import { useRef, useState, useEffect, useCallback } from "react";
import type { PreviewDevice } from "@muse/core";
import { PREVIEW_DEVICES } from "@muse/core";

interface PreviewContainerProps {
  device: PreviewDevice
  children: React.ReactNode
}

function getDeviceWidth(device: PreviewDevice): number | null {
  const deviceConfig = PREVIEW_DEVICES.find(d => d.id === device);
  return deviceConfig?.width ?? null;
}

export function PreviewContainer({ device, children }: PreviewContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const deviceWidth = getDeviceWidth(device);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [handleResize]);

  // Desktop mode - no constraints, but needs scroll container
  if (!deviceWidth) {
    return <div className="h-full overflow-y-auto">{children}</div>;
  }

  // Calculate scale based on available width
  const padding = 48; // 24px padding on each side
  const availableWidth = (containerWidth ?? 0) - padding;
  const scale = availableWidth > 0 && availableWidth < deviceWidth
    ? availableWidth / deviceWidth
    : 1;

  return (
    <div
      ref={containerRef}
      className="h-full flex justify-center items-start p-6 bg-[var(--muse-border)]"
    >
      <div
        className="bg-bg shadow-lg origin-top overflow-auto"
        style={{
          width: deviceWidth,
          maxHeight: scale < 1 ? `calc(100% / ${scale})` : "100%",
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
