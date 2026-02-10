import { MenuBar } from './MenuBar';
import { DesktopGrid } from './DesktopGrid';
import { WindowManager } from './WindowManager';
import { Taskbar } from './Taskbar';
import { useTheme } from '../theme/useTheme';

export function Desktop() {
  const { theme } = useTheme();

  const backgroundStyle =
    theme.id === 'retro'
      ? {
          backgroundColor: 'var(--color-bg)',
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(57, 255, 20, 0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255, 102, 0, 0.06), transparent 45%)',
        }
      : theme.id === 'futuristic'
        ? {
            backgroundColor: 'var(--color-bg)',
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(0, 229, 255, 0.18), transparent 50%), radial-gradient(circle at 80% 20%, rgba(224, 64, 251, 0.16), transparent 55%), linear-gradient(135deg, rgba(0, 229, 255, 0.08), transparent 60%)',
          }
        : {
            backgroundColor: 'var(--color-bg)',
            backgroundImage:
              'linear-gradient(120deg, rgba(255, 255, 255, 0.65), rgba(237, 228, 212, 0.85)), repeating-linear-gradient(45deg, rgba(212, 163, 115, 0.15) 0, rgba(212, 163, 115, 0.15) 2px, transparent 2px, transparent 10px)',
          };

  const overlayStyle =
    theme.id === 'retro'
      ? {
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(57, 255, 20, 0.12) 0px, rgba(57, 255, 20, 0.12) 1px, transparent 1px, transparent 3px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }
      : theme.id === 'futuristic'
        ? {
            backgroundImage:
              'linear-gradient(120deg, rgba(0, 229, 255, 0.3), rgba(224, 64, 251, 0.2), transparent 65%), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.15) 0, rgba(0, 229, 255, 0.15) 1px, transparent 1px, transparent 8px)',
            opacity: 0.45,
            mixBlendMode: 'screen',
            animation: 'holoShift 8s ease-in-out infinite',
          }
        : {
            backgroundImage:
              'radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px), radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
            backgroundSize: '6px 6px, 3px 3px',
            backgroundPosition: '0 0, 1px 1px',
            opacity: 0.25,
            mixBlendMode: 'multiply',
          };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-theme)',
        overflow: 'hidden',
        position: 'relative',
        ...backgroundStyle,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          ...overlayStyle,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <MenuBar />
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <DesktopGrid />
          <WindowManager />
        </div>
        <Taskbar />
      </div>
    </div>
  );
}
