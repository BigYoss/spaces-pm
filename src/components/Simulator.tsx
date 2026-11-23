import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PROJECTIONS, project, eur, whatsapp, type Typology } from "./content";

const TYPES = Object.keys(PROJECTIONS) as Typology[];
const YEARS = ["Year 1", "Year 2", "Year 3"] as const;

/** ARIA radio group: one tab stop (roving tabindex), arrows/Home/End move and select. */
function Seg(p: { labelledBy: string; options: readonly string[]; value: number; onChange: (i: number) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = p.options.length;
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (e.key in step) next = (p.value + step[e.key] + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    p.onChange(next);
    refs.current[next]?.focus();
  }
  return (
    <div className="seg" role="radiogroup" aria-labelledby={p.labelledBy} onKeyDown={onKeyDown}>
      {p.options.map((o, i) => (
        <button
          key={o}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={p.value === i}
          tabIndex={p.value === i ? 0 : -1}
          className="seg-btn"
          onClick={() => p.onChange(i)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Simulator() {
  const [type, setType] = useState<Typology>("T1");
  const [year, setYear] = useState<0 | 1 | 2>(0);
  const r = project(type, year);
  const id = useId();
  const parts = [
    { key: "net", label: "Owner net income", value: r.net },
    { key: "mgmt", label: "Spaces management (20% + IVA)", value: r.management },
    { key: "platform", label: "Booking platforms (15%)", value: r.platform },
    { key: "running", label: "Utilities, accountant, condominium, wear", value: r.running },
  ];

  return (
    <div className="sim" role="group" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="sim-title">Estimate a year of short-stay income</h3>
      <fieldset className="sim-field">
        <legend id={`${id}-a`}>Apartment</legend>
        <Seg labelledBy={`${id}-a`} options={TYPES} value={TYPES.indexOf(type)} onChange={(i) => setType(TYPES[i])} />
        <p className="sim-hint">{PROJECTIONS[type].label}</p>
      </fieldset>
      <fieldset className="sim-field">
        <legend id={`${id}-y`}>Year of operation</legend>
        <Seg labelledBy={`${id}-y`} options={YEARS} value={year} onChange={(i) => setYear(i as 0 | 1 | 2)} />
      </fieldset>

      <div className="sim-out" aria-live="polite">
        <div className="sim-net">
          <span>Estimated owner net</span>
          <strong>{eur(r.net)}</strong>
          <small>from {eur(r.gross)} gross booking income</small>
        </div>
        <div className="sim-bar" aria-hidden="true">
          {parts.map((p) => (
            <span key={p.key} className={`sim-bar-${p.key}`} style={{ flexGrow: p.value }} />
          ))}
        </div>
        <dl className="sim-rows">
          {parts.map((p) => (
            <div key={p.key} className={`sim-row sim-row-${p.key}`}>
              <dt>{p.label}</dt>
              <dd>{eur(p.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="sim-note">
        Based on Spaces' own owner projections for a centrally located apartment with an AL licence at 74% occupancy.
        {PROJECTIONS[type].note ? ` ${PROJECTIONS[type].note}` : ""} An estimate, not a guarantee: results depend on the
        property, location and season.
      </p>
      <a
        className="btn btn-solid"
        href={whatsapp(`Hi Spaces, I'd like to talk about managing my ${type} apartment.`)}
        target="_blank"
        rel="noopener"
      >
        Talk to us <ArrowRight size={18} weight="regular" aria-hidden />
      </a>
    </div>
  );
}
