import { useRef, useEffect, useCallback } from "react";
import { hsvToHex } from "./utils";
import styles from "./ColorPicker.module.css";

interface ColorAreaProps {
  hue: number
  saturation: number
  brightness: number
  onChange: (s: number, v: number) => void
}

export function ColorArea({ hue, saturation, brightness, onChange }: ColorAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // draw gradient when hue changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // horizontal: white to hue color (saturation)
    const hueColor = hsvToHex({ h: hue, s: 100, v: 100 });
    const gradientH = ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, "#ffffff");
    gradientH.addColorStop(1, hueColor);
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, width, height);

    // vertical: transparent to black (brightness)
    const gradientV = ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, "rgba(0,0,0,0)");
    gradientV.addColorStop(1, "#000000");
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  const updateFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;
      onChange(s, v);
    },
    [onChange],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updateFromPosition(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      updateFromPosition(e.clientX, e.clientY);
    },
    [updateFromPosition],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    let newS = saturation;
    let newV = brightness;

    switch (e.key) {
      case "ArrowLeft":
        newS = Math.max(0, saturation - step);
        break;
      case "ArrowRight":
        newS = Math.min(100, saturation + step);
        break;
      case "ArrowUp":
        newV = Math.min(100, brightness + step);
        break;
      case "ArrowDown":
        newV = Math.max(0, brightness - step);
        break;
      default:
        return;
    }

    e.preventDefault();
    onChange(newS, newV);
  };

  return (
    <div
      ref={containerRef}
      className={styles.colorArea}
      onMouseDown={handleMouseDown}
      tabIndex={0}
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(saturation)}%, Brightness ${Math.round(brightness)}%`}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} width={200} height={150} className={styles.colorAreaCanvas} />
      <div
        className={styles.colorAreaIndicator}
        style={{
          left: `${saturation}%`,
          top: `${100 - brightness}%`,
        }}
      />
    </div>
  );
}
