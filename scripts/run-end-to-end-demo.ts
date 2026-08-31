import { validateIntakeOutput } from '../lib/validate-output';
import { GenoRootIntakePayload } from '../types/schema';

// Scenario: "Martha Sharma", 55yo Female Patient
// - Section A (Personal History): Voice recorded in Hinglish
// - Section B (Conditions): Tap choices (Thyroid disorder, Anemia)
// - Section C (Lifestyle): Voice recorded for triggers + habit accordions
// - Section D (Treatments): Tap choices for Minoxidil & PRP
// - Section E (Hormonal & Consent): Menopausal option + Saliva preference + Consent authorized

const patientSpeechSectionA =
  'I am 55 years old now, my hair thinning started when I was 49. It has been over a year. Meri mother ke bhi baal kafi patle the. I have a widening part line and diffuse thinning across my scalp.';

const patientSpeechSectionC =
  'Past 6 months mein severe emotional stress and family illness hua tha. Alternate days wash karti hoon, hard water hai yahan, non-smoker, and 4 months back salon mein keratin smoothing karaya tha.';

function runEndToEndDemo() {
  console.log('================================================================================');
  console.log('  GENOROOT CLINICAL INTAKE — END-TO-END PATIENT SIMULATION & SCHEMA VALIDATION  ');
  console.log('================================================================================\n');

  console.log('👤 Patient Profile: Martha Sharma (55-year-old female patient on phone)');
  console.log('--------------------------------------------------------------------------------');

  console.log('\n[STEP 1: Personal & Family History — Voice Intake]');
  console.log(`🎙️ Patient Speech: "${patientSpeechSectionA}"`);
  console.log('⚡ Extraction: Whisper -> Claude Haiku 4.5 -> Section A parsed');

  console.log('\n[STEP 2: Health Conditions & Symptoms — Fast Tap Chips]');
  console.log('👆 Tapped Conditions: ["Thyroid disorder", "Anemia"]');
  console.log('👆 Tapped Acne/Oily: No | Excess Body/Facial Hair: No');

  console.log('\n[STEP 3: Lifestyle & Environmental Triggers — Voice + Accordion]');
  console.log(`🎙️ Patient Speech: "${patientSpeechSectionC}"`);
  console.log('⚡ Extraction & Unfold: Past 6mo stress, wash alternate days, hard water: Yes, keratin noted');

  console.log('\n[STEP 4: Hair Care & Treatments — Collapsed Table Tap]');
  console.log('👆 Products: Topical Minoxidil (3-6mo, helped: Yes, side_effects: No), Supplements (>6mo, helped: Yes)');
  console.log('👆 Procedures: PRP/GFC/iPRF (4-6 sessions, helped: Yes)');

  console.log('\n[STEP 5: Hormonal & Reproductive Context — Merged Q6/7 Clinical Card]');
  console.log('👆 Selected: "Menopausal / Post-Menopausal" -> Maps Q6 to "Menopausal" & Q7 to "Not applicable"');

  console.log('\n[STEP 6: Side Effects, Sample Collection & Consent]');
  console.log('👆 Past Side Effects: No | Sample Type: "Saliva" | Consent: Confirmed and Authorized (true)');

  // Assembled final JSON payload
  const finalPayload: GenoRootIntakePayload = {
    form: 'GenoRoot Hair & Scalp Intake',
    submitted_at: new Date().toISOString(),
    section_A: {
      age_hair_loss_began: 49,
      duration: 'Over a year',
      family_history: ['Mother had hair loss'],
      pattern: ['Widening part line', 'Diffuse thinning'],
    },
    section_B: {
      diagnosed_conditions: ['Thyroid disorder', 'Anemia'],
      menstrual_cycle: 'Menopausal',
      pregnancy_related: 'Not applicable',
      adult_acne_oily_skin: false,
      excess_body_facial_hair: false,
    },
    section_C: {
      past_6_months: ['High stress or emotional trauma'],
      habits: {
        smoking: false,
        smoking_severity: null,
        alcohol: false,
        hard_water: true,
        hair_wash_frequency: 'Alternate Days',
        heating_tools_styling_chemicals: false,
        salon_treatments: true,
        salon_treatment_detail: 'Keratin smoothing 4 months ago',
      },
    },
    section_D: {
      products: {
        'OTC/Medicated Shampoos': { used: false, duration: null, helped: null, side_effects: null },
        'Hair Oils/Serums': { used: false, duration: null, helped: null, side_effects: null },
        'Topical Minoxidil': { used: true, duration: '3-6mo', helped: true, side_effects: false },
        'Oral Minoxidil': { used: false, duration: null, helped: null, side_effects: null },
        'Supplements': { used: true, duration: '>6mo', helped: true, side_effects: false },
      },
      procedures: {
        'PRP/GFC/iPRF': { done: true, sessions: '4-6', helped: true },
        'Stem Cells/Exosomes': { done: false, sessions: null, helped: null },
        'Hair Transplant': { done: false, sessions: null, helped: null },
        'Other': { done: false, sessions: null, helped: null },
      },
      past_treatment_side_effects: false,
      past_treatment_side_effects_describe: '',
    },
    section_E: {
      sample_type: 'Saliva',
      consent: true,
    },
  };

  console.log('\n================================================================================');
  console.log('  FINAL ASSEMBLED INTAKE JSON PAYLOAD                                           ');
  console.log('================================================================================');
  console.log(JSON.stringify(finalPayload, null, 2));

  console.log('\n================================================================================');
  console.log('  RUNNING ZOD SCHEMA VALIDATOR (lib/validate-output.ts)                          ');
  console.log('================================================================================');

  const report = validateIntakeOutput(finalPayload);

  console.log(`\n• Overall Status: ${report.valid ? '✅ PASSED (100% Valid)' : '❌ FAILED'}`);
  console.log(`• Schema Compliant: ${report.schemaCompliant ? 'YES' : 'NO'}`);
  console.log(`• Total Errors: ${report.totalErrors}`);
  console.log(`• Missing Fields: ${report.missingFields.length === 0 ? 'None (All 16 questions satisfied)' : report.missingFields.join(', ')}`);
  console.log(`• Validation Summary: "${report.summary}"`);
  console.log(`• Timestamp: ${report.timestamp}`);

  if (report.valid) {
    console.log('\n🎉 ALL 16 QUESTIONS EXACTLY MATCH intake-schema.json SPECIFICATIONS!');
  } else {
    console.error('\n❌ ERRORS DETECTED:', report.errors);
  }
}

runEndToEndDemo();
