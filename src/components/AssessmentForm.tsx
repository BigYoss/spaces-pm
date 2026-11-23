import { useRef, useState, type FormEvent } from "react";
import { WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { EMAIL, whatsapp } from "./content";

/**
 * Contact form.
 * - With VITE_FORM_ENDPOINT set (Google Apps Script web app /exec URL), it POSTs to the script, which appends a row
 *   to the Spaces enquiries sheet (see docs/contact-form-apps-script.gs), then shows a thank-you message.
 * - Without it, it falls back to composing a WhatsApp or email message the owner sends themselves (stores nothing).
 * The "website" field is a honeypot: hidden from people and assistive tech, bots fill it, the script discards those.
 */
const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || "";

type Field = "name" | "contact" | "email" | "area";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AssessmentForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<HTMLParagraphElement>(null);

  function validate(form: HTMLFormElement) {
    const d = new FormData(form);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const next: Errors = {};
    if (!v("name")) next.name = "Please add your name.";
    if (ENDPOINT) {
      if (!v("email") && !v("phone")) next.contact = "Please add an email address or a phone number so we can reply.";
      else if (v("email") && !EMAIL_RE.test(v("email"))) next.email = "Please check the email address.";
    }
    if (!v("area")) next.area = "Please choose where the apartment is.";
    setErrors(next);
    const firstField = (["name", "contact", "email", "area"] as const).find((k) => next[k]);
    if (firstField) {
      const target = firstField === "contact" ? "email" : firstField;
      (form.elements.namedItem(target) as HTMLElement | null)?.focus();
      return null;
    }
    return { d, v };
  }

  function compose(v: (k: string) => string) {
    return [`Hi Spaces, I'm ${v("name")}.`, `Apartment: ${v("type")} in ${v("area")}.`, `Interested in: ${v("stay")}.`, v("message")]
      .filter(Boolean)
      .join("\n");
  }

  function announce(next: Status) {
    setStatus(next);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const ok = validate(form);
    if (!ok) return;
    if (!ENDPOINT) {
      window.open(whatsapp(compose(ok.v)), "_blank", "noopener");
      return;
    }
    // Honeypot filled: behave as if sent, send nothing.
    if (ok.v("website")) {
      form.reset();
      announce("sent");
      return;
    }
    const body = new URLSearchParams();
    for (const k of ["name", "email", "phone", "area", "type", "stay", "message", "website"]) body.append(k, ok.v(k));
    body.append("page", location.pathname);
    setStatus("sending");
    try {
      // URL-encoded body = a "simple" CORS request (no preflight); Apps Script answers with JSON { ok: true }.
      const res = await fetch(ENDPOINT, { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) throw new Error("not ok");
      form.reset();
      setErrors({});
      announce("sent");
    } catch {
      announce("error");
    }
  }

  function onEmail(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.form;
    if (!form) return;
    const ok = validate(form);
    if (ok) window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Property management enquiry")}&body=${encodeURIComponent(compose(ok.v))}`;
  }

  const err = (k: Field) => errors[k];
  const describedBy = (...ids: string[]) => ids.join(" ");

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" autoComplete="name" required aria-invalid={!!err("name")} aria-describedby="f-name-err" />
        <p id="f-name-err" className="field-err" role="alert">{err("name")}</p>
      </div>
      {ENDPOINT && (
        <>
          <div className="form-row">
            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email"
                aria-invalid={!!(err("email") || err("contact"))} aria-describedby={describedBy("f-contact-hint", "f-email-err")} />
              <p id="f-email-err" className="field-err" role="alert">{err("email")}</p>
            </div>
            <div className="field">
              <label htmlFor="f-phone">Phone or WhatsApp</label>
              <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel"
                aria-invalid={!!err("contact")} aria-describedby="f-contact-hint" />
            </div>
          </div>
          <p id="f-contact-hint" className={err("contact") ? "field-err" : "field-hint"} role={err("contact") ? "alert" : undefined}>
            {err("contact") ?? "Add an email address, a phone number, or both."}
          </p>
        </>
      )}
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-area">Where is it?</label>
          <select id="f-area" name="area" defaultValue="" required aria-invalid={!!err("area")} aria-describedby="f-area-err">
            <option value="" disabled>Choose an area</option>
            <option>Porto</option>
            <option>Vila Nova de Gaia</option>
            <option>Elsewhere near Porto</option>
          </select>
          <p id="f-area-err" className="field-err" role="alert">{err("area")}</p>
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
        <label htmlFor="f-msg">{ENDPOINT ? "Message" : "Anything else"} <span>(optional)</span></label>
        <textarea id="f-msg" name="message" rows={3} maxLength={2000} />
      </div>

      {/* Honeypot: off-screen, out of the tab order and hidden from screen readers. People never see it; bots fill it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {ENDPOINT ? (
        <div className="form-actions">
          <button type="submit" className="btn btn-solid" disabled={status === "sending"} aria-disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send"}
          </button>
        </div>
      ) : (
        <div className="form-actions">
          <button type="submit" className="btn btn-solid">
            <WhatsappLogo size={18} aria-hidden /> Send on WhatsApp
          </button>
          <button type="button" className="btn btn-line" onClick={onEmail}>
            <EnvelopeSimple size={18} aria-hidden /> Send by email
          </button>
        </div>
      )}

      <p ref={statusRef} tabIndex={-1} className={`form-status form-status-${status}`} role="status">
        {status === "sent" && "Thank you. We have your details and will get back to you soon."}
        {status === "error" && (
          <>
            Something went wrong and your message was not sent. Please try again, or{" "}
            <a href={whatsapp()} target="_blank" rel="noopener">message us on WhatsApp</a>.
          </>
        )}
      </p>

      {ENDPOINT ? (
        <p className="form-note">
          Your details go to Spaces and are kept in our enquiries sheet (Google) so we can reply. Giving them is voluntary, but without a way
          to reach you we cannot answer. You can ask to see, correct or delete them at any time. See the <a href="/privacy">privacy policy</a>.
        </p>
      ) : (
        <>
          <p className="form-note">Nothing is stored on this site. Your message opens in WhatsApp or your email app for you to send.</p>
          <p className="form-note">
            Giving these details is voluntary, but without them we cannot reply. Spaces uses them only to answer your enquiry. You can ask to
            see or correct them at any time. See the <a href="/privacy">privacy policy</a>.
          </p>
        </>
      )}
    </form>
  );
}
