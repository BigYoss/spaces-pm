import { useState } from "react";
import { MapPin } from "@phosphor-icons/react/dist/ssr";

const SRC = "https://www.google.com/maps?q=Porto%20and%20Vila%20Nova%20de%20Gaia%2C%20Portugal&z=13&output=embed";

/** Click-to-load: Google Maps is a third party that can set cookies, so nothing loads until the visitor asks for it. */
export function MapEmbed() {
  const [show, setShow] = useState(false);
  if (show)
    return (
      <div className="map">
        <iframe title="Map of Porto and Vila Nova de Gaia, the area Spaces covers" src={SRC} referrerPolicy="no-referrer-when-downgrade" />
      </div>
    );
  return (
    <div className="map map-off">
      <MapPin size={28} weight="light" aria-hidden />
      <p>Porto and Vila Nova de Gaia, on both banks of the Douro.</p>
      <button type="button" className="btn btn-line btn-sm" onClick={() => setShow(true)}>
        Show map
      </button>
      <p className="map-note">Loads Google Maps, which may set cookies on your device.</p>
    </div>
  );
}
