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
    <div className="bracket-window flex w-full flex-col rounded-lg border-2 border-[#162B49] bg-[var(--page-bg)] shadow-xl min-h-[400px] max-h-[min(75vh,520px)] md:min-h-[740px] md:max-h-[min(90vh,1120px)]">
      <div className="flex min-h-[44px] shrink-0 items-center justify-between border-b border-[#162B49] bg-[#162B49] px-2 py-1.5 text-[#F8F1E0] md:min-h-[72px] md:px-3 md:py-2">
        <span className="text-xs font-semibold md:text-sm">{title}</span>
      </div>
      <div className="bracket-window-scroll min-h-0 flex-1 overflow-auto p-2">
        <div className="h-full w-full min-h-[260px] md:min-h-[680px]">
          {children}
        </div>
      </div>
    </div>
  );
}
