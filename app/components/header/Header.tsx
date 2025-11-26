import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header className="aurion-header">
      <div className="aurion-logo">
        <span className="logo-text">Aurion</span>
      </div>
      {chat.started && (
        <ClientOnly>
          {() => (
            <div className="flex items-center gap-2">
              <ClientOnly>{() => <ChatDescription />}</ClientOnly>
              <HeaderActionButtons />
            </div>
          )}
        </ClientOnly>
      )}
    </header>
  );
}
