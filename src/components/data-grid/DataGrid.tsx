import { ArrowDown, ArrowUp, ChevronDown, CornerDownLeft, GripVertical, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { readStored, writeStored } from '@/lib';

export interface GridOption {
  readonly value: string;
  readonly label: string;
}

export interface GridColumn<R> {
  readonly key: string;
  readonly label: string;
  /** Larghezza in px. */
  readonly width: number;
  readonly editor?: 'text' | 'password' | 'select';
  readonly options?: readonly GridOption[];
  readonly mono?: boolean;
  /** Testo grigio (es. password mascherata). */
  readonly muted?: boolean;
  /** Placeholder dell'editor su una riga esistente. */
  readonly placeholder?: string;
  /** Placeholder nella riga di aggiunta. */
  readonly draftPlaceholder?: string;
  /** Obbligatoria per creare una riga. */
  readonly required?: boolean;
  readonly display: (row: R) => string;
  /** Valore iniziale dell'editor; di default è il testo mostrato. */
  readonly editValue?: (row: R) => string;
  readonly sortValue?: (row: R) => string;
  readonly editable?: (row: R) => boolean;
  /** Tooltip delle celle non modificabili. */
  readonly lockedReason?: string;
}

export type GridDraft = Record<string, string>;

interface DataGridProps<R extends { readonly id: number }> {
  label: string;
  rows: readonly R[];
  /** La prima colonna è quella del nome: più larga e bloccata a sinistra. */
  columns: readonly GridColumn<R>[];
  /** Chiave localStorage per l'ordine manuale delle righe. */
  storageKey: string;
  initialDraft: GridDraft;
  /** [singolare, plurale] per il conteggio. */
  noun: readonly [string, string];
  onCreate: (draft: GridDraft) => Promise<void>;
  onUpdate: (row: R, key: string, value: string) => Promise<void>;
}

interface Cell {
  readonly row: number;
  readonly col: number;
}

type SortState = { readonly key: string; readonly dir: 'asc' | 'desc' } | null;

interface DragState {
  readonly id: number;
  readonly over: number | null;
  readonly after: boolean;
}

interface MenuState {
  readonly key: string;
  readonly top: number;
  readonly left: number;
}

const NUM_W = 56;
const ACTION_W = 44;
const collator = new Intl.Collator('it', { numeric: true, sensitivity: 'base' });

function readOrder(key: string): number[] {
  try {
    const parsed: unknown = JSON.parse(readStored(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

function errorText(error: unknown): string {
  if (error instanceof Error && error.name === 'ApiError') return error.message;
  return 'Connessione non riuscita. Riprova.';
}

const editValueOf = <R,>(column: GridColumn<R>, row: R) => (column.editValue ?? column.display)(row);
const isEditable = <R,>(column: GridColumn<R>, row: R) => column.editable?.(row) ?? true;

export function DataGrid<R extends { readonly id: number }>({
  label,
  rows,
  columns,
  storageKey,
  initialDraft,
  noun,
  onCreate,
  onUpdate,
}: DataGridProps<R>) {
  const [active, setActive] = useState<Cell | null>(null);
  const [editValue, setEditValue] = useState('');
  /** Cella con una modifica non ancora confermata: evita doppi salvataggi tra Enter/Tab e blur. */
  const pendingRef = useRef<Cell | null>(null);

  const [draft, setDraftState] = useState<GridDraft>(initialDraft);
  const draftRef = useRef<GridDraft>(initialDraft);
  const [draftFocused, setDraftFocused] = useState(false);
  const [creating, setCreating] = useState(false);
  const creatingRef = useRef(false);
  const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());
  const draftRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);

  const [message, setMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [order, setOrder] = useState<number[]>(() => readOrder(storageKey));
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [drag, setDrag] = useState<DragState | null>(null);
  const headCheckRef = useRef<HTMLInputElement | null>(null);

  const nameKey = columns[0]?.key ?? '';

  const setDraft = useCallback((next: GridDraft) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);

  const visibleRows = useMemo(() => {
    if (sort) {
      const column = columns.find((c) => c.key === sort.key);
      if (column) {
        const value = column.sortValue ?? column.display;
        const sign = sort.dir === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => sign * collator.compare(value(a), value(b)));
      }
    }
    const position = new Map(order.map((id, index) => [id, index]));
    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const pa = position.get(a.row.id) ?? order.length + a.index;
        const pb = position.get(b.row.id) ?? order.length + b.index;
        return pa - pb;
      })
      .map(({ row }) => row);
  }, [rows, columns, sort, order]);

  const allSelected = visibleRows.length > 0 && selected.size === visibleRows.length;
  useEffect(() => {
    if (headCheckRef.current) headCheckRef.current.indeterminate = selected.size > 0 && !allSelected;
  }, [selected, allSelected]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (event: globalThis.KeyboardEvent) => event.key === 'Escape' && close();
    window.addEventListener('mousedown', close);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  /* ---------- Modifica delle righe esistenti ---------- */

  const editableCells = useCallback((): Cell[] => {
    const cells: Cell[] = [];
    for (const row of visibleRows) {
      columns.forEach((column, col) => {
        if (isEditable(column, row)) cells.push({ row: row.id, col });
      });
    }
    return cells;
  }, [visibleRows, columns]);

  function startEdit(cell: Cell) {
    const row = rows.find((r) => r.id === cell.row);
    const column = columns[cell.col];
    if (!row || !column || !isEditable(column, row)) return;
    pendingRef.current = cell;
    setActive(cell);
    setEditValue(editValueOf(column, row));
    setMessage(null);
  }

  function commit(cell: Cell, value: string) {
    if (pendingRef.current !== cell) return;
    pendingRef.current = null;
    const row = rows.find((r) => r.id === cell.row);
    const column = columns[cell.col];
    if (!row || !column) return;
    if (value === editValueOf(column, row)) return;
    if (column.editor === 'password' && value === '') return;
    if (column.required && value.trim() === '') {
      setMessage(`${column.label}: il campo non può essere vuoto`);
      return;
    }
    onUpdate(row, column.key, value).catch((error: unknown) => setMessage(errorText(error)));
  }

  function focusDraft(col = 0) {
    setActive(null);
    const target = draftRefs.current[col];
    if (target) {
      target.focus();
    } else {
      // Gli editor della riga di aggiunta compaiono solo dopo il focus sul nome.
      draftRefs.current[0]?.focus();
      requestAnimationFrame(() => draftRefs.current[col]?.focus());
    }
  }

  function move(cell: Cell, delta: 1 | -1) {
    const cells = editableCells();
    const index = cells.findIndex((c) => c.row === cell.row && c.col === cell.col);
    const next = cells[index + delta];
    if (next) startEdit(next);
    else if (delta === 1) focusDraft();
    else setActive(null);
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>, cell: Cell) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(cell, editValue);
      setActive(null);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      pendingRef.current = null;
      setActive(null);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      commit(cell, editValue);
      move(cell, event.shiftKey ? -1 : 1);
    }
  }

  function onEditorBlur(cell: Cell) {
    if (pendingRef.current !== cell) return;
    commit(cell, editValue);
    setActive(null);
  }

  /* ---------- Riga di aggiunta ---------- */

  async function submitDraft(keepFocus: boolean) {
    const current = draftRef.current;
    if (creatingRef.current || !(current[nameKey] ?? '').trim()) return;
    const absent = columns.filter((c) => c.required && !(current[c.key] ?? '').trim());
    if (absent.length > 0) {
      setMissing(new Set(absent.map((c) => c.key)));
      setMessage(`Compila anche: ${absent.map((c) => c.label).join(', ')}`);
      if (keepFocus) focusDraft(columns.indexOf(absent[0]!));
      return;
    }
    creatingRef.current = true;
    setCreating(true);
    try {
      await onCreate(current);
      setDraft(initialDraft);
      setMissing(new Set());
      setMessage(null);
      if (keepFocus) draftRefs.current[0]?.focus();
    } catch (error) {
      setMessage(errorText(error));
      if (keepFocus) draftRefs.current[0]?.focus();
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  }

  function updateDraft(key: string, value: string) {
    setDraft({ ...draftRef.current, [key]: value });
    if (missing.has(key) && value.trim()) {
      setMissing((prev) => new Set([...prev].filter((k) => k !== key)));
    }
  }

  function onDraftKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>, col: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submitDraft(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(initialDraft);
      setMissing(new Set());
      setMessage(null);
      event.currentTarget.blur();
    } else if (event.key === 'Tab' && event.shiftKey && col === 0) {
      const cells = editableCells();
      const last = cells[cells.length - 1];
      if (last) {
        event.preventDefault();
        startEdit(last);
      }
    }
  }

  function onDraftRowMouseDown(event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('input, select, button')) return;
    event.preventDefault();
    focusDraft();
  }

  function onDraftRowBlur(event: FocusEvent<HTMLTableRowElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDraftFocused(false);
    if ((draftRef.current[nameKey] ?? '').trim()) {
      void submitDraft(false);
    } else {
      setDraft(initialDraft);
      setMissing(new Set());
    }
  }

  /* ---------- Ordinamento, selezione, trascinamento ---------- */

  function openMenu(event: MouseEvent<HTMLButtonElement>, key: string) {
    event.stopPropagation();
    if (menu?.key === key) {
      setMenu(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ key, top: rect.bottom + 4, left: Math.max(8, rect.right - 200) });
  }

  function applySort(next: SortState) {
    setSort(next);
    setMenu(null);
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visibleRows.map((row) => row.id)));
  }

  function onDragStart(event: DragEvent<HTMLSpanElement>, id: number) {
    if (sort) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(id));
    const tr = event.currentTarget.closest('tr');
    if (tr) event.dataTransfer.setDragImage(tr, 16, 16);
    setDrag({ id, over: null, after: false });
  }

  function onDragOver(event: DragEvent<HTMLTableRowElement>, id: number) {
    if (!drag) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    if (drag.over !== id || drag.after !== after) setDrag({ ...drag, over: id, after });
  }

  function onDrop(event: DragEvent<HTMLTableRowElement>) {
    event.preventDefault();
    if (!drag || drag.over === null || drag.over === drag.id) {
      setDrag(null);
      return;
    }
    const ids = visibleRows.map((row) => row.id).filter((id) => id !== drag.id);
    const index = ids.indexOf(drag.over);
    ids.splice(drag.after ? index + 1 : index, 0, drag.id);
    setOrder(ids);
    writeStored(storageKey, JSON.stringify(ids));
    setDrag(null);
  }

  /* ---------- Render ---------- */

  const totalWidth = NUM_W + ACTION_W + columns.reduce((sum, c) => sum + c.width, 0);
  const draftOpen = draftFocused || Boolean((draft[nameKey] ?? '').trim());
  const canSend = Boolean((draft[nameKey] ?? '').trim()) && !creating;
  const menuColumn = menu ? columns.find((c) => c.key === menu.key) : undefined;

  function stickyStyle(col: number) {
    return col === 0 ? { left: NUM_W } : undefined;
  }

  return (
    <div className="dg">
      <div className="dg-scroll">
        <table className="dg-table" style={{ width: totalWidth }} aria-label={label}>
          <colgroup>
            <col style={{ width: NUM_W }} />
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
            <col style={{ width: ACTION_W }} />
          </colgroup>
          <thead>
            <tr>
              <th className="dg-num dg-sticky" scope="col">
                <span className={selected.size > 0 ? 'dg-index is-hidden' : 'dg-index'}>#</span>
                <input
                  ref={headCheckRef}
                  type="checkbox"
                  className={selected.size > 0 ? 'dg-check is-shown' : 'dg-check'}
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Seleziona tutte le righe"
                  disabled={visibleRows.length === 0}
                />
              </th>
              {columns.map((column, col) => {
                const sorted = sort?.key === column.key ? sort.dir : null;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={col === 0 ? 'dg-th dg-sticky dg-name' : 'dg-th'}
                    style={stickyStyle(col)}
                    aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                  >
                    <span className="dg-th-label">{column.label}</span>
                    {sorted === 'asc' && <ArrowUp size={13} className="dg-th-sort" aria-hidden="true" />}
                    {sorted === 'desc' && <ArrowDown size={13} className="dg-th-sort" aria-hidden="true" />}
                    <button
                      type="button"
                      className={menu?.key === column.key ? 'dg-th-menu is-open' : 'dg-th-menu'}
                      aria-label={`Opzioni colonna ${column.label}`}
                      aria-haspopup="menu"
                      aria-expanded={menu?.key === column.key}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => openMenu(event, column.key)}
                    >
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
              <th className="dg-act" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const isSelected = selected.has(row.id);
              const dropClass =
                drag && drag.over === row.id && drag.over !== drag.id
                  ? drag.after
                    ? ' is-drop-after'
                    : ' is-drop-before'
                  : '';
              return (
                <tr
                  key={row.id}
                  className={`dg-row${isSelected ? ' is-selected' : ''}${drag?.id === row.id ? ' is-dragging' : ''}${dropClass}`}
                  onDragOver={(event) => onDragOver(event, row.id)}
                  onDrop={onDrop}
                >
                  <td className="dg-num dg-sticky">
                    <span
                      className={sort ? 'dg-grip is-disabled' : 'dg-grip'}
                      draggable={!sort}
                      onDragStart={(event) => onDragStart(event, row.id)}
                      onDragEnd={() => setDrag(null)}
                      title={sort ? "Rimuovi l'ordinamento per riordinare le righe" : 'Trascina per riordinare'}
                      aria-hidden="true"
                    >
                      <GripVertical size={14} />
                    </span>
                    <span className="dg-index num">{index + 1}</span>
                    <input
                      type="checkbox"
                      className="dg-check"
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Seleziona riga ${index + 1}`}
                    />
                  </td>
                  {columns.map((column, col) => {
                    const isActive = active?.row === row.id && active.col === col;
                    const editable = isEditable(column, row);
                    const classes = ['dg-cell'];
                    if (col === 0) classes.push('dg-sticky', 'dg-name');
                    if (column.mono) classes.push('mono');
                    if (column.muted) classes.push('is-muted');
                    if (isActive) classes.push('is-active');
                    if (!editable) classes.push('is-locked');
                    return (
                      <td
                        key={column.key}
                        className={classes.join(' ')}
                        style={stickyStyle(col)}
                        title={editable ? undefined : column.lockedReason}
                        onClick={() => !isActive && startEdit({ row: row.id, col })}
                      >
                        {isActive && active ? (
                          column.editor === 'select' ? (
                            <select
                              className="dg-input"
                              autoFocus
                              value={editValue}
                              aria-label={column.label}
                              onChange={(event) => setEditValue(event.target.value)}
                              onKeyDown={(event) => onEditorKeyDown(event, active)}
                              onBlur={() => onEditorBlur(active)}
                            >
                              {column.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="dg-input"
                              ref={(el) => {
                                if (el && document.activeElement !== el) {
                                  el.focus();
                                  el.select();
                                }
                              }}
                              type={column.editor === 'password' ? 'password' : 'text'}
                              autoComplete={column.editor === 'password' ? 'new-password' : 'off'}
                              spellCheck={false}
                              value={editValue}
                              placeholder={column.placeholder}
                              aria-label={column.label}
                              onChange={(event) => setEditValue(event.target.value)}
                              onKeyDown={(event) => onEditorKeyDown(event, active)}
                              onBlur={() => onEditorBlur(active)}
                            />
                          )
                        ) : (
                          <span className="dg-text">{column.display(row)}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="dg-act" />
                </tr>
              );
            })}

            {/* Riga di aggiunta: non è un record (niente numero, checkbox, ordinamento o conteggio). */}
            <tr
              className={draftOpen ? 'dg-add is-open' : 'dg-add'}
              onMouseDown={onDraftRowMouseDown}
              onFocus={() => setDraftFocused(true)}
              onBlur={onDraftRowBlur}
            >
              <td className="dg-num dg-sticky" />
              {columns.map((column, col) => {
                const classes = ['dg-cell'];
                if (col === 0) classes.push('dg-sticky', 'dg-name');
                if (column.mono) classes.push('mono');
                if (missing.has(column.key)) classes.push('is-missing');
                const value = draft[column.key] ?? '';
                const setRef = (el: HTMLInputElement | HTMLSelectElement | null) => {
                  draftRefs.current[col] = el;
                };
                if (col !== 0 && !draftOpen) {
                  return <td key={column.key} className={classes.join(' ')} />;
                }
                return (
                  <td key={column.key} className={classes.join(' ')} style={stickyStyle(col)}>
                    {column.editor === 'select' ? (
                      <select
                        ref={setRef}
                        className="dg-input"
                        value={value}
                        aria-label={`${column.label} della nuova riga`}
                        onChange={(event) => updateDraft(column.key, event.target.value)}
                        onKeyDown={(event) => onDraftKeyDown(event, col)}
                      >
                        {column.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        ref={setRef}
                        className="dg-input"
                        type={column.editor === 'password' ? 'password' : 'text'}
                        autoComplete={column.editor === 'password' ? 'new-password' : 'off'}
                        spellCheck={false}
                        value={value}
                        placeholder={col === 0 && !draftOpen ? '+ Nuova riga' : column.draftPlaceholder}
                        aria-label={`${column.label} della nuova riga`}
                        aria-invalid={missing.has(column.key) || undefined}
                        onChange={(event) => updateDraft(column.key, event.target.value)}
                        onKeyDown={(event) => onDraftKeyDown(event, col)}
                      />
                    )}
                  </td>
                );
              })}
              <td className="dg-act">
                <button
                  type="button"
                  className={canSend ? 'dg-send is-ready' : 'dg-send'}
                  aria-label="Aggiungi riga (Invio)"
                  title="Aggiungi (Invio)"
                  disabled={!canSend}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void submitDraft(true)}
                >
                  <CornerDownLeft size={15} aria-hidden="true" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="dg-foot">
        <span className="num">
          {visibleRows.length} {visibleRows.length === 1 ? noun[0] : noun[1]}
          {selected.size > 0 && ` · ${selected.size} selezionat${selected.size === 1 ? 'a' : 'e'}`}
        </span>
        {sort && (
          <button type="button" className="dg-chip" onClick={() => applySort(null)}>
            Ordinate per {columns.find((c) => c.key === sort.key)?.label.toLowerCase()}
            <X size={13} aria-label="Rimuovi ordinamento" />
          </button>
        )}
        {message && (
          <span className="msg msg-bad dg-msg" role="alert">
            {message}
          </span>
        )}
      </div>

      {menu && menuColumn && (
        <div
          className="dg-menu"
          role="menu"
          style={{ top: menu.top, left: menu.left }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={() => applySort({ key: menu.key, dir: 'asc' })}>
            <ArrowUp size={14} aria-hidden="true" /> Ordina crescente
          </button>
          <button type="button" role="menuitem" onClick={() => applySort({ key: menu.key, dir: 'desc' })}>
            <ArrowDown size={14} aria-hidden="true" /> Ordina decrescente
          </button>
          {sort?.key === menu.key && (
            <button type="button" role="menuitem" onClick={() => applySort(null)}>
              <X size={14} aria-hidden="true" /> Rimuovi ordinamento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
