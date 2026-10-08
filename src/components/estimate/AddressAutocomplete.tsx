"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  placeId?: string;
};

type AddressComponent = { longText: string | null; shortText: string | null; types: string[] };
type Place = {
  id?: string;
  addressComponents?: AddressComponent[];
  fetchFields(options: { fields: string[] }): Promise<unknown>;
};
type PlaceSelectEvent = Event & { placePrediction: { toPlace(): Place } };
type PlacesLibrary = {
  PlaceAutocompleteElement: new (options: { includedRegionCodes?: string[] }) => HTMLElement;
};
type GoogleMaps = { maps: { importLibrary(name: "places"): Promise<PlacesLibrary> } };

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
let loader: Promise<GoogleMaps> | null = null;

/** Loads the Maps JavaScript API once per page (async bootstrap, Places library on demand). */
function loadGoogleMaps(): Promise<GoogleMaps> {
  const w = window as unknown as { google?: GoogleMaps };
  if (w.google?.maps?.importLibrary) return Promise.resolve(w.google);
  loader ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY ?? "")}&v=weekly&loading=async&libraries=places`;
    script.async = true;
    script.onload = () => (w.google ? resolve(w.google) : reject(new Error("Google Maps failed to load")));
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return loader;
}

/** Same mapping as Google's address-form sample: street number + route, city, province, postcode, country. */
function toAddress(place: Place): Address {
  let streetNumber = "";
  let route = "";
  const address: Address = { placeId: place.id };
  for (const c of place.addressComponents ?? []) {
    if (c.types.includes("street_number")) streetNumber = c.longText ?? "";
    if (c.types.includes("route")) route = c.shortText ?? c.longText ?? "";
    if (c.types.includes("subpremise")) address.line2 = c.longText ?? undefined;
    if (c.types.includes("locality") || (!address.city && c.types.includes("postal_town"))) address.city = c.longText ?? undefined;
    if (c.types.includes("administrative_area_level_1")) address.region = c.shortText ?? undefined;
    if (c.types.includes("postal_code")) address.postalCode = c.longText ?? undefined;
    if (c.types.includes("postal_code_suffix") && address.postalCode) address.postalCode += `-${c.longText}`;
    if (c.types.includes("country")) address.country = c.longText ?? undefined;
  }
  address.line1 = [streetNumber, route].filter(Boolean).join(" ") || undefined;
  return address;
}

const inputClass =
  "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[#555] focus:outline-none focus:border-[rgba(212,160,23,0.5)] transition-colors";

/**
 * Business location: Google Places search that fills the fields below it, which stay editable.
 * Without NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or if Maps fails to load) it's just the plain fields.
 */
export function AddressAutocomplete({ value, onChange }: { value: Address; onChange: (address: Address) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"off" | "loading" | "ready" | "failed">(API_KEY ? "loading" : "off");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!API_KEY || !mountRef.current) return;
    let element: HTMLElement | null = null;
    let cancelled = false;

    loadGoogleMaps()
      .then((google) => google.maps.importLibrary("places"))
      .then(({ PlaceAutocompleteElement }) => {
        if (cancelled || !mountRef.current) return;
        element = new PlaceAutocompleteElement({ includedRegionCodes: ["ca", "us"] });
        element.setAttribute("placeholder", "Start typing your business address");
        element.style.width = "100%";
        element.addEventListener("gmp-select", async (event) => {
          const place = (event as PlaceSelectEvent).placePrediction.toPlace();
          await place.fetchFields({ fields: ["addressComponents", "id"] });
          onChangeRef.current(toAddress(place));
          line2Ref.current?.focus(); // nudge for unit / suite, like the sample
        });
        mountRef.current.appendChild(element);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("failed"));

    return () => {
      cancelled = true;
      element?.remove();
    };
  }, []);

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value, placeId: undefined });

  return (
    <div className="space-y-3">
      {API_KEY && status !== "failed" && (
        <div className="gmp-autocomplete-wrap">
          <div ref={mountRef} />
          {status === "loading" && <div className={`${inputClass} text-[#555]`}>Loading address search…</div>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input aria-label="Street address" placeholder="Street address" value={value.line1 ?? ""} onChange={set("line1")} className={`${inputClass} sm:col-span-2`} autoComplete="address-line1" />
        <input ref={line2Ref} aria-label="Unit, suite, floor" placeholder="Unit / suite (optional)" value={value.line2 ?? ""} onChange={set("line2")} className={inputClass} autoComplete="address-line2" />
        <input aria-label="City" placeholder="City" value={value.city ?? ""} onChange={set("city")} className={inputClass} autoComplete="address-level2" />
        <input aria-label="Province or state" placeholder="Province / state" value={value.region ?? ""} onChange={set("region")} className={inputClass} autoComplete="address-level1" />
        <input aria-label="Postal code" placeholder="Postal code" value={value.postalCode ?? ""} onChange={set("postalCode")} className={inputClass} autoComplete="postal-code" />
        <input aria-label="Country" placeholder="Country" value={value.country ?? ""} onChange={set("country")} className={`${inputClass} sm:col-span-2`} autoComplete="country-name" />
      </div>
      {!API_KEY && (
        <p className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <MapPin className="w-3 h-3" aria-hidden="true" /> Optional. Helps me know your market and time zone.
        </p>
      )}
    </div>
  );
}
