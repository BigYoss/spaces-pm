import {
  ArrowRight,
  ArrowUpRight,
  ChatsCircle,
  Wrench,
  CalendarCheck,
  Phone,
  WhatsappLogo,
  EnvelopeSimple,
  InstagramLogo,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { HeroVideo } from "./components/HeroVideo";
import { Simulator } from "./components/Simulator";
import { AssessmentForm } from "./components/AssessmentForm";
import { MapEmbed } from "./components/MapEmbed";
import { useParallax } from "./components/useParallax";
import {
  SITE_URL,
  PHONE_MAIN,
  PHONE_ALT,
  PHONE_IL,
  EMAIL,
  INSTAGRAM,
  STUDIO,
  TERMS_EN,
  TERMS_PT,
  MAP_AREA,
  FAQS,
  whatsapp,
} from "./components/content";

const DESCRIPTION =
  "Spaces manages apartments in Porto and Vila Nova de Gaia for short, medium and long-term rentals. Full short-stay management from 20% + IVA. Estimate your income.";

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: "Spaces",
    alternateName: "Spaces Property Management",
    description: DESCRIPTION,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/assets/og.jpg`,
    logo: `${SITE_URL}/assets/logo-512.png`,
    telephone: "+351914044112",
    email: EMAIL,
    address: { "@type": "PostalAddress", addressLocality: "Porto", addressCountry: "PT" },
    areaServed: [
      { "@type": "City", name: "Porto" },
      { "@type": "City", name: "Vila Nova de Gaia" },
    ],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Short-term rental management" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Medium-term rental management" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Long-term rental management" } },
    ],
    sameAs: [INSTAGRAM, STUDIO],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];



function Img(p: { name: string; alt: string; sizes: string; widths: number[]; w: number; h: number; eager?: boolean }) {
  return (
    <img
      src={`/assets/${p.name}-${p.widths[p.widths.length - 1]}.webp`}
      srcSet={p.widths.map((x) => `/assets/${p.name}-${x}.webp ${x}w`).join(", ")}
      sizes={p.sizes}
      alt={p.alt}
      width={p.w}
      height={p.h}
      loading={p.eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

const STEPS = [
  ["First conversation", "Tell us where the apartment is, what it is like today and how you want it used."],
  ["Proposal", "The stay type that fits, the fee, and an income estimate for your apartment."],
  ["Set-up", "Licence check, furnishing and equipment. Our design studio steps in if the home needs it."],
  ["Photos and listing", "The apartment is photographed and goes live on the booking platforms."],
  ["Day-to-day management", "Spaces runs guests, cleaning and upkeep and keeps you informed."],
];

const REVIEWS = [
  { quote: "My experience was flawless from start to finish!", name: "Shamir Shoval" },
  { quote: "couldn't be happier with my new home!", name: "Yaron Noach" },
];

export default function App() {
  useParallax();
  const talk = whatsapp();

  return (
    <div className="site">
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <a className="skip" href="#main">Skip to content</a>

      <header className="nav">
        <a href="#top" className="nav-brand" aria-label="Spaces property management, back to top">
          <img src="/assets/spaces-logo.png" alt="Spaces" width={640} height={140} />
          <span>Property management</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          <a href="#services">Services</a>
          <a href="#fees">Fees</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="btn btn-line btn-sm" href={talk} target="_blank" rel="noopener">
          Talk to us
        </a>
      </header>

      <main id="main">
        {/* HERO: three depth layers (copy, film frame, inset photo) */}
        <section id="top" className="hero" data-parallax>
          <div className="hero-copy">
            <p className="kicker">Property management in Porto &amp; Vila Nova de Gaia</p>
            <h1>Your Porto apartment, fully managed.</h1>
            <p className="hero-sub">
              Short, medium and long-term rentals in Porto and Gaia, run day to day by Spaces.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-solid" href={talk} target="_blank" rel="noopener">
                Talk to us <ArrowRight size={18} aria-hidden />
              </a>
              <a className="btn btn-line" href="#fees">
                Estimate your income
              </a>
            </div>
          </div>
          <div className="hero-media">
            <div className="hero-film" data-depth="-0.18" style={{ ["--depth" as string]: -0.18 }}>
              <HeroVideo />
            </div>
            <figure className="hero-inset" data-depth="0.32" style={{ ["--depth" as string]: 0.32 }}>
              <Img name="about-keys" alt="Apartment keys on an oak console by an open green door" sizes="(max-width: 860px) 40vw, 16vw" widths={[720]} w={720} h={960} eager />
            </figure>
          </div>
        </section>

        <section className="facts" aria-label="Spaces in numbers">
          <dl>
            <div>
              <dt>~70</dt>
              <dd>short-stay homes managed</dd>
            </div>
            <div>
              <dt>~30</dt>
              <dd>long-term homes managed</dd>
            </div>
            <div>
              <dt>20% + IVA</dt>
              <dd>full short-stay management</dd>
            </div>
            <div>
              <dt>2 cities</dt>
              <dd>Porto and Vila Nova de Gaia</dd>
            </div>
          </dl>
        </section>

        {/* SERVICES: asymmetric trio */}
        <section id="services" className="services" aria-labelledby="services-h">
          <h2 id="services-h">Three ways to rent with Spaces.</h2>
          <div className="svc-grid">
            <article className="svc svc-lead">
              <div className="svc-img">
                <Img name="stay-short" alt="A made bed with folded towels in a sunlit Porto bedroom" sizes="(max-width: 860px) 92vw, 50vw" widths={[600, 1000]} w={1000} h={1250} />
              </div>
              <div className="svc-body">
                <h3>Short stays</h3>
                <p>Holiday and city-break guests on the booking platforms, with the apartment prepared between stays.</p>
                <p className="svc-fee">20% of booking income + IVA</p>
              </div>
            </article>
            <article className="svc">
              <div className="svc-img">
                <Img name="stay-medium" alt="An oak desk by a tall window over Porto rooftops" sizes="(max-width: 860px) 92vw, 25vw" widths={[600, 1000]} w={1000} h={1250} />
              </div>
              <div className="svc-body">
                <h3>Medium stays</h3>
                <p>Weeks to months for remote workers, students and relocating families.</p>
                <p className="svc-fee">Fee agreed per property</p>
              </div>
            </article>
            <article className="svc">
              <div className="svc-img">
                <Img name="stay-long" alt="A bright open kitchen with a round oak table" sizes="(max-width: 860px) 92vw, 25vw" widths={[600, 1000]} w={1000} h={1250} />
              </div>
              <div className="svc-body">
                <h3>Long-term lets</h3>
                <p>Year-round tenants, with the apartment looked after for the long run.</p>
                <p className="svc-fee">Fee agreed per property</p>
              </div>
            </article>
          </div>
        </section>

        {/* OPERATIONS: bento */}
        <section className="ops" aria-labelledby="ops-h">
          <h2 id="ops-h">What we take care of.</h2>
          <div className="bento">
            <div className="tile tile-text">
              <ChatsCircle size={28} weight="light" aria-hidden />
              <h3>Guest messages</h3>
              <p>Questions before arrival and during the stay go to the Spaces team, not to you.</p>
            </div>
            <div className="tile tile-photo tile-tall">
              <Img name="stay-short" alt="" sizes="(max-width: 860px) 92vw, 33vw" widths={[600, 1000]} w={1000} h={1250} />
              <div className="tile-cap">
                <h3>Cleaning and linen</h3>
                <p>The home is cleaned and fresh linen laid out between stays.</p>
              </div>
            </div>
            <div className="tile tile-text">
              <CalendarCheck size={28} weight="light" aria-hidden />
              <h3>Listings and calendar</h3>
              <p>Your apartment listed on the booking platforms, with the calendar kept up to date.</p>
            </div>
            <div className="tile tile-photo">
              <Img name="about-keys" alt="" sizes="(max-width: 860px) 92vw, 33vw" widths={[720, 1200]} w={1200} h={1600} />
              <div className="tile-cap">
                <h3>Check-in and keys</h3>
                <p>Guests are welcomed and keys handed over, so you don't need to be there in person.</p>
              </div>
            </div>
            <div className="tile tile-text">
              <Wrench size={28} weight="light" aria-hidden />
              <h3>Upkeep</h3>
              <p>Small repairs are reported and followed up.</p>
            </div>
            <a className="tile tile-studio" href={STUDIO} target="_blank" rel="noopener">
              <h3>Empty or dated flat?</h3>
              <p>The Spaces design studio can plan, furnish and set it up before it is listed.</p>
              <span className="tile-link">
                Visit the studio <ArrowUpRight size={16} aria-hidden />
              </span>
            </a>
          </div>
        </section>

        {/* FEES + ESTIMATOR */}
        <section id="fees" className="fees" aria-labelledby="fees-h">
          <div className="fees-copy">
            <p className="kicker">Fees</p>
            <h2 id="fees-h">Clear fees, and the numbers behind them.</h2>
            <p>
              Full short-stay management is <strong>20% of booking income plus IVA</strong>. Medium and long-term fees are
              agreed per property.
            </p>
            <p>The owner covers the running costs of the apartment:</p>
            <ul className="cost-list">
              <li>Utilities and internet</li>
              <li>Accountant</li>
              <li>Condominium fees</li>
              <li>Wear and tear</li>
              <li>Booking-platform fees, around 15%</li>
            </ul>
          </div>
          <Simulator />
        </section>

        {/* PARALLAX BAND */}
        <section className="band" data-parallax aria-labelledby="band-h">
          <div className="band-plate" data-depth="-0.3" style={{ ["--depth" as string]: -0.3 }}>
            <Img name="band-porto" alt="Porto's colourful riverside houses above the Douro on a sunny morning" sizes="100vw" widths={[1200, 2200]} w={2200} h={1650} />
          </div>
          <div className="band-card" data-depth="0.18" style={{ ["--depth" as string]: 0.18 }}>
            <h2 id="band-h">Both banks of the Douro.</h2>
            <p>Spaces manages apartments across Porto and Vila Nova de Gaia.</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="how" aria-labelledby="how-h">
          <h2 id="how-h">From first message to first guest.</h2>
          <ol className="timeline">
            {STEPS.map(([t, b], i) => (
              <li key={t}>
                <span className="tl-n" aria-hidden="true">{i + 1}</span>
                <h3>{t}</h3>
                <p>{b}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* REVIEWS */}
        <section className="reviews" aria-labelledby="reviews-h">
          <h2 id="reviews-h" className="sr-only">What clients say</h2>
          {REVIEWS.map((r) => (
            <figure key={r.name} className="quote">
              <blockquote>
                <p>&ldquo;{r.quote}&rdquo;</p>
              </blockquote>
              <figcaption>
                <span className="stars" role="img" aria-label="Rated 5 out of 5">★★★★★</span>
                {r.name}, Spaces client
              </figcaption>
            </figure>
          ))}
          <p className="reviews-note">Testimonials as published on spaces-pt.com.</p>
        </section>

        {/* FAQ */}
        <section id="faq" className="faq" aria-labelledby="faq-h">
          <div className="faq-head">
            <p className="kicker">FAQ</p>
            <h2 id="faq-h">Questions owners ask first.</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <Plus size={18} aria-hidden className="faq-icon" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CONTACT + MAP */}
        <section id="contact" className="contact" aria-labelledby="contact-h">
          <div className="contact-form">
            <h2 id="contact-h">Tell us about your apartment.</h2>
            <p className="contact-sub">Share a few details and we'll come back to you about the best way to rent it.</p>
            <AssessmentForm />
          </div>
          <aside className="contact-side">
            <ul className="lines">
              <li>
                <Phone size={20} weight="light" aria-hidden />
                <span>
                  <a href={PHONE_MAIN.href}>{PHONE_MAIN.label}</a>
                  <a href={PHONE_ALT.href}>{PHONE_ALT.label}</a>
                </span>
              </li>
              <li>
                <WhatsappLogo size={20} weight="light" aria-hidden />
                <a href={talk} target="_blank" rel="noopener">WhatsApp {PHONE_MAIN.label}</a>
              </li>
              <li>
                <Phone size={20} weight="light" aria-hidden />
                <span>
                  <small>Owner consultations from Israel</small>
                  <a href={PHONE_IL.href}>{PHONE_IL.label}</a>
                </span>
              </li>
              <li>
                <EnvelopeSimple size={20} weight="light" aria-hidden />
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </li>
            </ul>
            <MapEmbed />
            <a className="text-link" href={MAP_AREA} target="_blank" rel="noopener">
              Open the area in Google Maps <ArrowUpRight size={14} aria-hidden />
            </a>
          </aside>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-brand">
          <img src="/assets/spaces-logo.png" alt="Spaces" width={640} height={140} loading="lazy" />
          <p>Property management for short, medium and long-term rentals in Porto and Vila Nova de Gaia.</p>
        </div>
        <nav className="foot-cols" aria-label="Footer">
          <div>
            <h3>Contact</h3>
            <a href={PHONE_MAIN.href}>{PHONE_MAIN.label}</a>
            <a href={PHONE_ALT.href}>{PHONE_ALT.label}</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
          <div>
            <h3>Spaces</h3>
            <a href={STUDIO} target="_blank" rel="noopener">Interior design studio</a>
            <a href={INSTAGRAM} target="_blank" rel="noopener">
              <InstagramLogo size={16} aria-hidden /> @spaces_pt
            </a>
          </div>
          <div>
            <h3>Legal</h3>
            <a href={TERMS_EN} target="_blank" rel="noopener">Terms and conditions (EN)</a>
            <a href={TERMS_PT} target="_blank" rel="noopener" lang="pt-PT" hrefLang="pt-PT">Termos e condições (PT)</a>
            <a href="/privacy">Privacy and cookies</a>
            <a href="/legal">Legal information</a>
            <a href="/accessibility">Accessibility statement</a>
          </div>
        </nav>
        <p className="foot-copy">© 2026 Spaces. All rights reserved.</p>
        <a className="dock" href={PHONE_MAIN.href} aria-label={`Call Spaces on ${PHONE_MAIN.label}`}>
          <Phone size={22} aria-hidden />
        </a>
      </footer>
    </div>
  );
}
