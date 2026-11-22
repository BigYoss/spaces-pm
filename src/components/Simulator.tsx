import { useId, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PROJECTIONS, project, eur, whatsapp, type Typology } from "./content";

const TYPES = Object.keys(PROJECTIONS) as Typology[];
const YEARS = ["Year 1", "Year 2", "Year 3"] as const;

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
    <div className="sim" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="sim-title">Estimate a year of short-stay income</h3>
      <fieldset className="sim-field">
        <legend>Apartment</legend>
        <div className="seg" role="radiogroup">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              className="seg-btn"
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="sim-hint">{PROJECTIONS[type].label}</p>
      </fieldset>
      <fieldset className="sim-field">
        <legend>Year of operation</legend>
        <div className="seg" role="radiogroup">
          {YEARS.map((y, i) => (
            <button
              key={y}
              type="button"
              role="radio"
              aria-checked={year === i}
              className="seg-btn"
              onClick={() => setYear(i as 0 | 1 | 2)}
            >
              {y}
            </button>
          ))}
        </div>
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
        Based on Spaces' own owner projections for an apartment with an AL licence at 74% occupancy.
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
