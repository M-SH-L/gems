import { MenuBar } from './MenuBar';
import { DesktopGrid } from './DesktopGrid';
import { WindowManager } from './WindowManager';
import { Taskbar } from './Taskbar';

export function Desktop() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-theme)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <MenuBar />
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <DesktopGrid />
        <WindowManager />
      </div>
      <Taskbar />
    </div>
  );
}
