import type { DropdownOption } from "@/components/ui/dropdown-field";

const regionCodes = [
  "IT",
  "FR",
  "DE",
  "ES",
  "GB",
  "US",
  "CH",
  "AT",
  "BE",
  "NL",
  "PT",
  "IE",
  "SE",
  "NO",
  "DK",
  "FI",
  "PL",
  "RO",
  "GR",
  "BR",
  "CA",
  "AU",
  "JP",
  "CN",
  "IN",
];

export function getCountryOptions(locale = "it-IT"): DropdownOption[] {
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });

  return regionCodes
    .map((code) => ({
      label: displayNames.of(code) ?? code,
      value: code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "it"));
}
