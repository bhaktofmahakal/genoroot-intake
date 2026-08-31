import { GenoRootIntakePayload } from '@/types/schema';

export const DEMO_PATIENT_PAYLOAD: GenoRootIntakePayload = {
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
      'Topical Minoxidil': { used: true, duration: '3-6mo', helped: true, side_effects: true },
      'Oral Minoxidil': { used: false, duration: null, helped: null, side_effects: null },
      'Supplements': { used: true, duration: '>6mo', helped: true, side_effects: false },
    },
    procedures: {
      'PRP/GFC/iPRF': { done: true, sessions: '4-6', helped: true },
      'Stem Cells/Exosomes': { done: false, sessions: null, helped: null },
      'Hair Transplant': { done: false, sessions: null, helped: null },
      'Other': { done: false, sessions: null, helped: null },
    },
    past_treatment_side_effects: true,
    past_treatment_side_effects_describe: 'Mild scalp itching and flaking from topical minoxidil alcohol base',
  },
  section_E: {
    sample_type: 'Saliva',
    consent: true,
  },
};
