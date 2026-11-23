import { Instrument_Serif } from "next/font/google";

// Display serif for headlines (Fresh Snow look) — never body text.
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});
