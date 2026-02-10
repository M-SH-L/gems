import { useWindowStore } from './windowStore';
import { WindowFrame } from './WindowFrame';

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);

  return (
    <>
      {windows.map((win) => (
        <WindowFrame key={win.id} win={win} />
      ))}
    </>
  );
}
