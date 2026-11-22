import { useState, type FormEvent } from "react";
import { WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { EMAIL, whatsapp } from "./content";

type Errors = Partial<Record<"name" | "area", string>>;

/** No data is stored: the request is composed into a WhatsApp or email message the owner sends themselves. */
export function AssessmentForm() {
  const [errors, setErrors] = useState<Errors>({});

  function compose(form: HTMLFormElement) {
    const d = new FormData(form);
    const name = String(d.get("name") ?? "").trim();
    const area = String(d.get("area") ?? "");
    const next: Errors = {};
    if (!name) next.name = "Please add your name.";
    if (!area) next.area = "Please choose where the apartment is.";
    setErrors(next);
    const first = (["name", "area"] as const).find((k) => next[k]);
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return null;
    }
    const lines = [
      `Hi Spaces, I'm ${name}.`,
      `Apartment: ${d.get("type")} in ${area}.`,
      `Interested in: ${d.get("stay")}.`,
      String(d.get("message") ?? "").trim(),
    ].filter(Boolean);
    return lines.join("\n");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = compose(e.currentTarget);
    if (text) window.open(whatsapp(text), "_blank", "noopener");
  }

  function onEmail(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.form;
    if (!form) return;
    const text = compose(form);
    if (text) window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Property management enquiry")}&body=${encodeURIComponent(text)}`;
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby="f-name-err" />
        <p id="f-name-err" className="field-err" role="alert">{errors.name}</p>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-area">Where is it?</label>
          <select id="f-area" name="area" defaultValue="" required aria-invalid={!!errors.area} aria-describedby="f-area-err">
            <option value="" disabled>Choose an area</option>
            <option>Porto</option>
            <option>Vila Nova de Gaia</option>
            <option>Elsewhere near Porto</option>
          </select>
          <p id="f-area-err" className="field-err" role="alert">{errors.area}</p>
        </div>
        <div className="field">
          <label htmlFor="f-type">Apartment</label>
          <select id="f-type" name="type" defaultValue="T1">
            <option value="T0">T0 (studio)</option>
            <option value="T1">T1</option>
            <option value="T2">T2</option>
            <option value="T3">T3</option>
            <option value="T4 or larger">T4 or larger</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-stay">Interested in</label>
        <select id="f-stay" name="stay" defaultValue="Short stays">
          <option>Short stays</option>
          <option>Medium stays</option>
          <option>Long-term letting</option>
          <option>Not sure yet</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-msg">Anything else <span>(optional)</span></label>
        <textarea id="f-msg" name="message" rows={3} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-solid">
          <WhatsappLogo size={18} aria-hidden /> Send on WhatsApp
        </button>
        <button type="button" className="btn btn-line" onClick={onEmail}>
          <EnvelopeSimple size={18} aria-hidden /> Send by email
        </button>
      </div>
      <p className="form-note">Nothing is stored on this site. Your message opens in WhatsApp or your email app for you to send.</p>
      <p className="form-note">
        Giving these details is voluntary, but without them we cannot reply. Spaces uses them only to answer your enquiry. You can ask to see or
        correct them at any time. See the <a href="/privacy">privacy policy</a>.
      </p>
    </form>
  );
}
