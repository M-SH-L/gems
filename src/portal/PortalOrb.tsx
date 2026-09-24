import { usePortal } from './PortalContext';
import './portal.css';

/** The swirling doorway on the V1 desktop that leads to Gems V2. */
export function PortalOrb() {
  const { enterV2 } = usePortal();
  return (
    <button
      type="button"
      className="portal-orb"
      aria-label="Enter Gems V2"
      title="Enter Gems V2 — 3D games"
      onClick={(e) => {
        const r = e.currentTarget.querySelector('.portal-orb-disc')!.getBoundingClientRect();
        enterV2({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      <span className="portal-orb-disc" aria-hidden />
      <span className="portal-orb-label">ENTER V2</span>
    </button>
  );
}
