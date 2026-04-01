import React, { useState, useCallback, useRef } from 'react';

const DEFAULT_RIGHT_WIDTH = 400;
const MIN_WIDTH = 260;
const MAX_WIDTH = 680;

interface ResizablePanelLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function ResizablePanelLayout({ left, right }: ResizablePanelLayoutProps): React.ReactElement {
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const widthRef = useRef(rightWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = widthRef.current;

    function onMouseMove(ev: MouseEvent) {
      // dragging handle left → right panel grows; right → shrinks
      const delta = startX - ev.clientX;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
      widthRef.current = next;
      setRightWidth(next);
    }

    function onMouseUp() {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ userSelect: isDragging ? 'none' : undefined, cursor: isDragging ? 'col-resize' : undefined }}
    >
      {/* Left panel — takes remaining space */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {left}
      </div>

      {/* ── Drag handle ── */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          w-1.5 flex-shrink-0 relative cursor-col-resize
          transition-colors duration-150
          ${isDragging ? 'bg-[#E24B4A]' : 'bg-gray-100 hover:bg-[#E24B4A]/50'}
        `}
        title="Drag to resize"
      >
        {/* Three-dot grip indicator */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          flex flex-col gap-[3px] transition-opacity duration-150
          ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-[3px] h-[3px] rounded-full bg-gray-400" />
          ))}
        </div>
      </div>

      {/* Right panel — fixed draggable width */}
      <div
        className="flex-shrink-0 overflow-y-auto bg-white"
        style={{ width: rightWidth }}
      >
        {right}
      </div>
    </div>
  );
}
