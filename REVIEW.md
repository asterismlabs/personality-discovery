# Please review

These are the points I was not sure about. The app is built around the choices already in the plan, and these are called out so you can correct them.

## Licenses

- The O*NET Interest Profiler is not public domain. It is available under CC BY-ND 4.0 (verbatim) or the O*NET Tools Developer License (modification, which requires a validation study). This app uses the verbatim paper short form: same items, same order, checklist response, and 0–10 counts.
- Low / Moderate / High labels and the Prediger ideas/data and people/things scores are shown in a separate block titled as this app's interpretation. I treat that block as original material, not as a modified O*NET instrument. That is a gray area under the no-derivatives license.
- Showing the two-column paper form as a single column, in left-to-right then top-to-bottom order, is treated as a layout change rather than a change to the items. Please confirm that reading order.
- The web-service short form uses a different response scale (Strongly Dislike to Strongly Like, answers 1–5, scores summed). This app follows the paper form, as in the plan, not that 1–5 scale.
- O*NET Work Importance tools were not used. They are retired, and converting them to a Likert scale would be a licensed modification. Work values are original items labeled unvalidated.
- IPIP items are public domain ([permission statement](https://ipip.ori.org/newPermission.htm)). Shuffling their order is treated as allowed.

## Item wording

- O*NET activities were transcribed from the official paper PDF (March 2024 file metadata; form text says National Center for O*NET Development, v1). Please proofread them against [the PDF](https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf), especially the line breaks in "Teach sign language to people who are deaf or hard of hearing".
- IPIP-NEO-120 wording and +/− keying were taken from [ipip.ori.org/30FacetNEO-PI-RItems.htm](https://ipip.ori.org/30FacetNEO-PI-RItems.htm). Please cross-check the keying against Johnson (2014). A unit test locks the current reverse-keyed set.
- Work-value items, work-style items, reading-check items, and all plain-language descriptions are original. Please edit any wording you do not want.

## Scoring conventions that are mine

- Low is below 37.5% of the scale maximum. High is above 62.5%. The endpoints are Moderate. These are not norms.
- A scale is reported only when at least 75% of its items were answered (at least 3 of 4 facet items, at least 18 of 24 domain items).
- Domain scores are the mean of that domain's own items, not the mean of facet means.
- Interest checks that were never touched count as not checked (0), matching the paper form.
- Tied interest scores are not broken. The Holland code can be longer than three letters when a tie sits on the cutoff. Within a tie, letters are listed in R-I-A-S-E-C order.
- "Near the middle" on the two interest dimensions means within 5% of the largest possible swing of that formula.
- Straight-lining is flagged, not blocked, when at least 8 answers were given and either more than 80% are the same or a run of identical answers is at least 12 (or the whole section, if it is shorter). An interest section is flagged if every box is checked or none are. A section is flagged if it was finished in under 800 ms per item. Reading checks that were missed are flagged. None of these stop the person from continuing.
