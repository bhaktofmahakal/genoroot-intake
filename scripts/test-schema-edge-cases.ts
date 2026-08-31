import { validateIntakeOutput } from '../lib/validate-output';
import { GenoRootIntakePayload } from '../types/schema';

// Scenario A: Happy Path
const scenarioA: GenoRootIntakePayload = {
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

// Scenario B: Minimal / None patient (tried nothing, no conditions, no triggers)
const scenarioB: GenoRootIntakePayload = {
  form: 'GenoRoot Hair & Scalp Intake',
  submitted_at: new Date().toISOString(),
  section_A: {
    age_hair_loss_began: 25,
    duration: 'Less than 6 months',
    family_history: ['No known family history'],
    pattern: ['Receding hairline'],
  },
  section_B: {
    diagnosed_conditions: ['None'],
    menstrual_cycle: 'Not applicable',
    pregnancy_related: 'Not applicable',
    adult_acne_oily_skin: false,
    excess_body_facial_hair: false,
  },
  section_C: {
    past_6_months: [],
    habits: {
      smoking: false,
      smoking_severity: null,
      alcohol: false,
      hard_water: false,
      hair_wash_frequency: 'Daily',
      heating_tools_styling_chemicals: false,
      salon_treatments: false,
      salon_treatment_detail: null,
    },
  },
  section_D: {
    products: {
      'OTC/Medicated Shampoos': { used: false, duration: null, helped: null, side_effects: null },
      'Hair Oils/Serums': { used: false, duration: null, helped: null, side_effects: null },
      'Topical Minoxidil': { used: false, duration: null, helped: null, side_effects: null },
      'Oral Minoxidil': { used: false, duration: null, helped: null, side_effects: null },
      'Supplements': { used: false, duration: null, helped: null, side_effects: null },
    },
    procedures: {
      'PRP/GFC/iPRF': { done: false, sessions: null, helped: null },
      'Stem Cells/Exosomes': { done: false, sessions: null, helped: null },
      'Hair Transplant': { done: false, sessions: null, helped: null },
      'Other': { done: false, sessions: null, helped: null },
    },
    past_treatment_side_effects: false,
    past_treatment_side_effects_describe: '',
  },
  section_E: {
    sample_type: 'Either',
    consent: true,
  },
};

// Scenario C: Maximal patient (tried all products, all procedures, heavy smoking, all conditions)
const scenarioC: GenoRootIntakePayload = {
  form: 'GenoRoot Hair & Scalp Intake',
  submitted_at: new Date().toISOString(),
  section_A: {
    age_hair_loss_began: 35,
    duration: 'Over a year',
    family_history: ['Father had hair loss', 'Mother had hair loss', 'Siblings with thinning or baldness'],
    pattern: ['Receding hairline', 'Thinning at crown', 'Widening part line', 'Diffuse thinning'],
  },
  section_B: {
    diagnosed_conditions: ['PCOS/PCOD', 'Thyroid disorder', 'Diabetes', 'Autoimmune disease', 'Anemia'],
    menstrual_cycle: 'Irregular',
    pregnancy_related: 'Currently pregnant',
    adult_acne_oily_skin: true,
    excess_body_facial_hair: true,
  },
  section_C: {
    past_6_months: [
      'Crash dieting or major weight loss',
      'High stress or emotional trauma',
      'Fever with illness (COVID, Dengue, Typhoid)',
      'Recent surgery',
      'Change in location/water/air quality',
    ],
    habits: {
      smoking: true,
      smoking_severity: 'Severe >10/day',
      alcohol: true,
      hard_water: true,
      hair_wash_frequency: 'Weekly',
      heating_tools_styling_chemicals: true,
      salon_treatments: true,
      salon_treatment_detail: 'Bleach & Keratin 2 months ago',
    },
  },
  section_D: {
    products: {
      'OTC/Medicated Shampoos': { used: true, duration: '>6mo', helped: true, side_effects: false },
      'Hair Oils/Serums': { used: true, duration: '>6mo', helped: false, side_effects: false },
      'Topical Minoxidil': { used: true, duration: '>6mo', helped: true, side_effects: true },
      'Oral Minoxidil': { used: true, duration: '3-6mo', helped: true, side_effects: true },
      'Supplements': { used: true, duration: '>6mo', helped: true, side_effects: false },
    },
    procedures: {
      'PRP/GFC/iPRF': { done: true, sessions: '>6', helped: true },
      'Stem Cells/Exosomes': { done: true, sessions: '4-6', helped: true },
      'Hair Transplant': { done: true, sessions: '1-3', helped: true },
      'Other': { done: true, sessions: '1-3', helped: true },
    },
    past_treatment_side_effects: true,
    past_treatment_side_effects_describe: 'Severe scalp itching and tachycardia from minoxidil',
  },
  section_E: {
    sample_type: 'Blood',
    consent: true,
  },
};

function runEdgeCases() {
  console.log('--- TEST A: Standard Happy Path ---');
  const resA = validateIntakeOutput(scenarioA);
  console.log(`Valid: ${resA.valid} | Errors: ${resA.totalErrors}`);

  console.log('\n--- TEST B: Minimal / None Options ---');
  const resB = validateIntakeOutput(scenarioB);
  console.log(`Valid: ${resB.valid} | Errors: ${resB.totalErrors}`);

  console.log('\n--- TEST C: Maximal / All Selected ---');
  const resC = validateIntakeOutput(scenarioC);
  console.log(`Valid: ${resC.valid} | Errors: ${resC.totalErrors}`);

  if (resA.valid && resB.valid && resC.valid) {
    console.log('\n✅ ALL 3 EDGE CASES PASSED STRICT ZOD VALIDATION!');
  } else {
    console.error('\n❌ SOME EDGE CASES FAILED');
  }
}

runEdgeCases();
