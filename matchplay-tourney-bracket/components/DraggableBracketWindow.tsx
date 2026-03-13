"use client";

interface BracketWindowProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A static window panel for a bracket. The bracket content inside (SVG) remains
 * pannable/draggable via the library's SVGViewer; the window itself does not move.
 */
export default function BracketWindow({
  title,
  children,
}: BracketWindowProps) {
  return (
    <div className="bracket-window flex w-full flex-col rounded-lg border-2 border-[#EBAD21] bg-[#162B49] shadow-xl min-h-[480px] max-h-[min(105vh,780px)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#EBAD21] bg-[#0d1f35] px-3 py-2 text-[#F8F1E0]">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="bracket-window-scroll min-h-0 flex-1 overflow-auto p-2">
        <div className="h-full w-full min-h-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}
