import React from 'react';
import './ProgressBar.css';

/**
 * Props (all optional except value/max):
 * - value: number
 * - max: number
 * - label: string     -> defaults to `${value} / ${max} pts`
 * - height: number    -> px height (default 18)
 * - showLabelInside: boolean -> try to keep label inside the bar (auto bumps outside if too small)
 */
const ProgressBar = ({ value = 0, max = 100, label, height = 18, showLabelInside = true }) => {
  const safeMax = Math.max(1, Number(max) || 1);
  const safeVal = Math.min(Math.max(0, Number(value) || 0), safeMax);
  const pct = (safeVal / safeMax) * 100;
  const pctRounded = Math.round(pct);

  const displayLabel = label ?? `${safeVal} / ${safeMax} pts`;
  // If the filled width is too small, we render the label outside so it never gets cramped
  const labelInside = showLabelInside && pctRounded >= 15;

  return (
    <div
      className="progressbar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeVal}
      aria-label="Reward progress"
      style={{ '--pb-height': `${height}px` }}
    >
      <div className="progressbar__track">
        <div className="progressbar__fill" style={{ width: `${pct}%` }} />
        {labelInside ? (
          <div className="progressbar__label progressbar__label--inside">
            {displayLabel}
          </div>
        ) : (
          <div className="progressbar__label progressbar__label--outside">
            {displayLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
