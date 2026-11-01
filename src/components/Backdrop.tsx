/** Fixed, decorative aurora + grid layer behind the whole app. Pure CSS, no pointer events. */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="backdrop__orb backdrop__orb--a" />
      <span className="backdrop__orb backdrop__orb--b" />
      <span className="backdrop__orb backdrop__orb--c" />
      <span className="backdrop__grid" />
    </div>
  );
}
