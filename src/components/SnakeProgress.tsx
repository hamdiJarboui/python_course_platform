import { useId } from 'react';

interface Props {
  /** 0..100 */
  percent: number;
  label: string;
}

const W = 300;
const H = 18;
const MID = H / 2;
const AMP = 4.5;
const WAVES = 6;

function pointAt(x: number): number {
  return MID + Math.sin((x / W) * WAVES * Math.PI * 2) * AMP;
}

const PATH = Array.from({ length: 61 }, (_, i) => {
  const x = (i / 60) * W;
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${pointAt(x).toFixed(2)}`;
}).join(' ');

/** A winding "snake" line that fills as the learner progresses (static under reduced motion). */
export function SnakeProgress({ percent, label }: Props) {
  const clipId = useId();
  const pct = Math.max(0, Math.min(100, percent));
  const x = (pct / 100) * W;
  return (
    <div
      className="progress-line"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="snake-wrap">
        <svg
          className="snake"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={clipId}>
              <rect className="snake__clip" x="0" y="0" width={x} height={H} />
            </clipPath>
          </defs>
          <path className="snake__track" d={PATH} vectorEffect="non-scaling-stroke" />
          <path
            className="snake__fill"
            d={PATH}
            clipPath={`url(#${clipId})`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {pct > 0 && (
          <span
            className="snake__head"
            style={{ left: `${pct}%`, top: `${(pointAt(Math.max(x, 1)) / H) * 100}%` }}
          />
        )}
      </div>
      <span className="progress-line__label" aria-hidden="true">
        {pct}%
      </span>
    </div>
  );
}
