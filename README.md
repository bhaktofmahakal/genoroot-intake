# GenoRoot Clinic — Hair & Scalp Medical Intake

> Specialized, high-trust patient intake web application for **GenoRoot Hair & Scalp Clinic**, purpose-built for a 55-year-old patient completing a clinical health form on a mobile phone.

---

## 🌐 Live Demo & Repository

* **Live Production URL:** [https://genoroot-intake-pearl.vercel.app](https://genoroot-intake-pearl.vercel.app)
* **Dev Inspector Mode:** [https://genoroot-intake-pearl.vercel.app?debug=true](https://genoroot-intake-pearl.vercel.app?debug=true)
* **GitHub Repository:** [https://github.com/bhaktofmahakal/genoroot-intake](https://github.com/bhaktofmahakal/genoroot-intake)

---

## 🌟 Key Features

1. **Snappy & Intuitive Modality Choices**
   - **Voice-First Conversational Blocks (Q1–Q4, Q10–Q11):** Patients speak naturally in English or Hinglish; Groq Whisper transcribes and Claude Haiku extracts structured clinical fields directly into confirmation cards with 1-click inline editing.
   - **Tactile Tap-Only Chips (Q5, Q8, Q9):** 54px thumb-sized interactive chips for medical conditions with instant selection.
   - **Collapsed Progressive Tables (Q12–Q13):** Eliminates mobile table squishing by only expanding duration, session, and outcome sub-questions for products/procedures the patient has actually used.
   - **Respectful Merged Hormonal Decision (Q6–Q7):** One unified clinical card with 6 options (*Regular, Irregular, Menopausal, Pregnant, Postpartum, Not Applicable*) mapping seamlessly to both `menstrual_cycle` and `pregnancy_related` without asking an awkward gender gate question.
   - **High-Trust Clinical Consent (Q14–Q16):** Transparent biomarker sampling preference (*Saliva, Blood, Either*) and clinical authorization.

2. **Cross-Browser Mobile Audio Pipeline**
   - Uses browser-native **`MediaRecorder` API** with live 5-band frequency visualizer and dynamic MIME-type fallback (`audio/webm`, `audio/mp4`, `audio/aac`).
   - Transcription occurs server-side via Groq Whisper (`whisper-large-v3-turbo`), avoiding the notorious permission and reliability dropouts of `webkitSpeechRecognition` on iOS Safari.

3. **Live Developer Inspector Panel**
   - Accessible via query parameter `?debug=true` or floating dev pill.
   - Displays real-time assembled JSON state, live Zod validation status, and a **"Pre-fill Demo"** button for instant walkthrough demonstration.

---

## 🛠️ Technology Stack & Architectural Decisions

| Layer                     | Technology                                                   | Architectural Rationale                                                                                                                                                                                                                                   |
| ---------------------------| --------------------------------------------------------------| -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Framework**             | **Next.js 14 (App Router) + TypeScript**                     | Serverless API route encapsulation, fast SSR/static optimization, and strict type safety.                                                                                                                                                                 |
| **Styling**               | **Tailwind CSS + shadcn/ui**                                 | *Bought, not built.* Custom botanical sage, warm cream, and terracotta palette tailored for 55+ mobile legibility (WCAG AAA contrast, min 54px touch targets, 190ms snappy transitions).                                                                  |
| **Audio Capture**         | **Browser `MediaRecorder` API**                              | Cross-platform compatibility on iOS Safari and mobile Chrome with microphone permission recovery states.                                                                                                                                                  |
| **Transcription**         | **Groq Whisper (`whisper-large-v3-turbo`)**                  | Sub-second audio-to-text latency on Groq's LPU inference engine. Transcription is server-side so it works identically across all mobile browsers.                                                                                                         |
| **Structured Extraction** | **OrcaRouter ➔ Claude Haiku (`anthropic/claude-haiku-4.5`)** | Zero-markup OpenAI-compatible gateway (`openai` npm package for both Groq and OrcaRouter). Claude Haiku is the exact right-sized model for deterministic JSON tool-calling without reasoning token bloat. Includes SHA-256 local disk caching during dev. |
| **Validation**            | **Zod (`lib/validate-output.ts`)**                           | Validates the complete assembled payload against the 16-question schema with exact dot-notation key error reporting.                                                                                                                                      |

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd genoroot-intake
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Add your API keys:
```env
# Groq API Key (for Whisper audio transcription)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OrcaRouter API Key (for Claude Haiku structured field extraction)
ORCAROUTER_API_KEY=sk-orca-your_orcarouter_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser or mobile viewport emulator (375px width).

To view the live dev inspector panel, open [http://localhost:3000?debug=true](http://localhost:3000?debug=true).

### 4. Run Automated End-to-End Simulation & Validator
```bash
npx tsx scripts/run-end-to-end-demo.ts
```

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🧪 Output Correctness Verification

The final assembled JSON payload is validated using `validateIntakeOutput()` in `lib/validate-output.ts`.

### Sample Verified Output:
```json
{
  "form": "GenoRoot Hair & Scalp Intake",
  "submitted_at": "2026-08-31T10:50:22.257Z",
  "section_A": {
    "age_hair_loss_began": 49,
    "duration": "Over a year",
    "family_history": [
      "Mother had hair loss"
    ],
    "pattern": [
      "Widening part line",
      "Diffuse thinning"
    ]
  },
  "section_B": {
    "diagnosed_conditions": [
      "Thyroid disorder",
      "Anemia"
    ],
    "menstrual_cycle": "Menopausal",
    "pregnancy_related": "Not applicable",
    "adult_acne_oily_skin": false,
    "excess_body_facial_hair": false
  },
  "section_C": {
    "past_6_months": [
      "High stress or emotional trauma"
    ],
    "habits": {
      "smoking": false,
      "smoking_severity": null,
      "alcohol": false,
      "hard_water": true,
      "hair_wash_frequency": "Alternate Days",
      "heating_tools_styling_chemicals": false,
      "salon_treatments": true,
      "salon_treatment_detail": "Keratin smoothing 4 months ago"
    }
  },
  "section_D": {
    "products": {
      "OTC/Medicated Shampoos": { "used": false, "duration": null, "helped": null, "side_effects": null },
      "Hair Oils/Serums": { "used": false, "duration": null, "helped": null, "side_effects": null },
      "Topical Minoxidil": { "used": true, "duration": "3-6mo", "helped": true, "side_effects": false },
      "Oral Minoxidil": { "used": false, "duration": null, "helped": null, "side_effects": null },
      "Supplements": { "used": true, "duration": ">6mo", "helped": true, "side_effects": false }
    },
    "procedures": {
      "PRP/GFC/iPRF": { "done": true, "sessions": "4-6", "helped": true },
      "Stem Cells/Exosomes": { "done": false, "sessions": null, "helped": null },
      "Hair Transplant": { "done": false, "sessions": null, "helped": null },
      "Other": { "done": false, "sessions": null, "helped": null }
    },
    "past_treatment_side_effects": false,
    "past_treatment_side_effects_describe": ""
  },
  "section_E": {
    "sample_type": "Saliva",
    "consent": true
  }
}
```

```
• Overall Status: ✅ PASSED (100% Valid)
• Schema Compliant: YES
• Total Errors: 0
• Missing Fields: None (All 16 questions satisfied)
```

---

## 🔮 What I'd Improve with One More Week (Pre-Launch Triaged P2 Roadmap)

1. **Audio Playback Waveform & Instant Re-Record Preview:** Allow patients to listen to their captured audio clip with a visual scrubber and trigger 1-tap re-records without resetting any previously filled fields.
2. **Multi-Language Speech & Dialect Switching:** Auto-detect and support Hindi, Tamil, Telugu, Spanish, and regional Indian languages with custom phonetic vocabularies (e.g. *dengue, chikungunya, telogen effluvium*).
3. **Offline Resilience & IndexedDB Audio Queue:** Persist audio blobs in `indexedDB` if a mobile user loses cellular connection mid-recording, auto-retrying extraction upon reconnection.
4. **Physician & Nurse Clinical Review Portal:** Enable trichologists to review patient audio side-by-side with AI-extracted fields, verify genetic biomarker readiness, and approve DNA kit dispatch.
5. **Computerized Scalp Trichoscopy Upload:** Add mobile camera capture for computer-vision hair density estimation at temples and crown.

---
