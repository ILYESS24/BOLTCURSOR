import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import { type ChatHistoryItem } from '~/lib/persistence';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const [hovering, setHovering] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    function mouseEnter() {
      setHovering(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function mouseLeave() {
      setHovering(false);
    }

    hoverRef.current?.addEventListener('mouseenter', mouseEnter);
    hoverRef.current?.addEventListener('mouseleave', mouseLeave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', mouseEnter);
      hoverRef.current?.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return (
    <div
      ref={hoverRef}
      className="group rounded-lg text-white/90 hover:text-white hover:bg-gray-900/80 overflow-hidden flex justify-between items-center px-3 py-2 transition-colors border border-transparent hover:border-gray-700/60 shadow-sm"
    >
      <a href={`/chat/${item.urlId}`} className="flex w-full relative truncate block">
        {item.description}
        <div className="absolute right-0 z-1 top-0 bottom-0 bg-gradient-to-l from-transparent to-transparent w-10 flex justify-end group-hover:w-15">
          {hovering && (
            <div className="flex items-center p-1 text-white/70 hover:text-red-400">
              <Dialog.Trigger asChild>
                <button
                  className="i-ph:trash scale-110 transition-colors"
                  onClick={(event) => {
                    // we prevent the default so we don't trigger the anchor above
                    event.preventDefault();
                    onDelete?.(event);
                  }}
                />
              </Dialog.Trigger>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
