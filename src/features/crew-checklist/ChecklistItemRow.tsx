import { ITEM_OUTCOMES, outcomeLabel } from '@/lib';
import type { ChecklistItem, ItemOutcome } from '@/types';

interface ChecklistItemRowProps {
  id: string;
  index: number;
  item: ChecklistItem;
  value: ItemOutcome | undefined;
  rejected: boolean;
  disabled: boolean;
  onChange: (outcome: ItemOutcome) => void;
}

export function ChecklistItemRow({ id, index, item, value, rejected, disabled, onChange }: ChecklistItemRowProps) {
  const labelId = `${id}-label`;
  return (
    <li id={id} className={rejected ? 'ck-row is-bad' : 'ck-row'}>
      <div className="ck-text">
        <span className="ck-num num" aria-hidden="true">
          {index + 1}
        </span>
        <span id={labelId} className="ck-desc">
          {item.description}
        </span>
        {rejected && <span className="chip chip-bad">Da ripristinare</span>}
      </div>
      <div role="radiogroup" aria-labelledby={labelId} className="ck-opts">
        {ITEM_OUTCOMES.map((outcome) => (
          <label key={outcome} className={outcome === 'PRESENTE' ? 'ck-opt is-ok' : 'ck-opt is-bad'}>
            <input
              type="radio"
              className="vh"
              name={id}
              value={outcome}
              checked={value === outcome}
              disabled={disabled}
              onChange={() => onChange(outcome)}
            />
            {outcomeLabel(outcome)}
          </label>
        ))}
      </div>
    </li>
  );
}
