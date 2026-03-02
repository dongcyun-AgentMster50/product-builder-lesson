# Demo Checklist

## Basic Flow

- Open `index.html`
- Confirm the first screen shows the access input view
- Enter any value in the access field and click `Enter Agent`
- Confirm the guide screen appears
- Click `Yes`
- Confirm Q1 appears first, not all questions at once
- Move through Q1 -> Q2 -> Q3 -> Q4 in sequence
- Confirm `Previous` and `Next` work correctly
- Confirm `Scenario Build` appears only at Q4

## Guide Flow

- Return to the start screen
- Enter any value in the access field and click `Enter Agent`
- Click `No`
- Confirm the quick guide content expands
- Confirm the wizard still opens after the guide

## Step Experience

- At each step, confirm only one question panel is visible
- Confirm the progress pills update by step
- Confirm the insight card changes after moving to the next step
- Confirm the input summary updates while answering

## Validation

- Try clicking `Next` on Q1 without selecting a role
- Confirm an error message appears
- Try clicking `Next` on Q2 without a country
- Confirm an error message appears
- Try clicking `Next` on Q3 without persona or situation text
- Confirm an error message appears

## Locale Switching

- In Q2, select `KR` and confirm Korean UI remains
- In Q2, select `US` or `UK` and confirm UI switches to English
- In Q2, select `DE` and confirm UI switches to German
- In Q2, select `FR` or `CA_FR` and confirm UI switches to French
- In Q2, select `ES` or `MX` and confirm UI switches to Spanish
- In Q2, select `PT` or `BR` and confirm UI switches to Portuguese
- In Q2, select `IT` and confirm UI switches to Italian
- In Q2, select `NL` or `BE` and confirm UI switches to Dutch
- In Q2, select `AE_AR` and confirm UI switches to Arabic with RTL direction
- For a market without full translation coverage, confirm the app falls back cleanly to English

## Scenario Output

- Complete all four steps and click `Scenario Build`
- Confirm the result area renders without layout break
- Confirm the role tabs render
- Confirm `Overview` and role tabs switch properly
- Confirm result headings follow the selected locale
- Confirm the narrative is no longer fixed to Korean for non-KR markets
- Confirm the structure check cards appear

## Export

- Click `Download Markdown` and confirm a file downloads
- Click `Download JSON` and confirm a file downloads
- Click `Print / Save PDF` and confirm the print dialog opens
- Click `Copy Summary` and confirm copy succeeds or fallback prompt appears

## Session Ready Check

- Note that real access verification is not active yet in frontend-only mode
- Once backend is connected, refresh the page after successful verification
- Confirm `GET /api/access/session` skips the locked screen when authenticated

## Known Focus Areas

- Naturalness of non-Korean result copy
- Arabic visual spacing in RTL mode
- Country selection persistence while locale changes
- Fallback country/device behavior for markets not present in `source_data.json`
