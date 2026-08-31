import { z } from 'zod';

/**
 * ==============================================================================
 * GenoRoot Hair & Scalp Clinic — Medical Intake Types & Zod Validation Schemas
 * Source of Truth: intake-schema.json
 * ==============================================================================
 */

// --- SECTION A: Personal & Family Hair Loss History ---

export const DurationOptionSchema = z.enum([
  'Less than 6 months',
  '6-12 months',
  'Over a year',
]);
export type DurationOption = z.infer<typeof DurationOptionSchema>;

export const FamilyHistoryOptionSchema = z.enum([
  'Father had hair loss',
  'Mother had hair loss',
  'Siblings with thinning or baldness',
  'No known family history',
]);
export type FamilyHistoryOption = z.infer<typeof FamilyHistoryOptionSchema>;

export const PatternOptionSchema = z.enum([
  'Receding hairline',
  'Thinning at crown',
  'Widening part line',
  'Diffuse thinning',
  'Patchy loss',
  'Sudden excessive shedding',
]);
export type PatternOption = z.infer<typeof PatternOptionSchema>;

export const SectionASchema = z.object({
  // Q1: Age hair loss began (number)
  age_hair_loss_began: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(1, 'Please enter a valid age')
    .max(120, 'Please enter a realistic age')
    .nullable()
    .refine((val) => val !== null, 'Age hair loss began is required'),

  // Q2: Duration of hair loss (single select)
  duration: DurationOptionSchema,

  // Q3: Family history (multi select)
  family_history: z.array(FamilyHistoryOptionSchema).min(1, 'Select at least one family history option'),

  // Q4: Hair loss pattern (multi select)
  pattern: z.array(PatternOptionSchema).min(1, 'Select at least one pattern option'),
});
export type SectionAData = z.infer<typeof SectionASchema>;


// --- SECTION B: Hormonal & Health Influences ---

export const DiagnosedConditionOptionSchema = z.enum([
  'PCOS/PCOD',
  'Thyroid disorder',
  'Diabetes',
  'Autoimmune disease',
  'Anemia',
  'None',
]);
export type DiagnosedConditionOption = z.infer<typeof DiagnosedConditionOptionSchema>;

export const MenstrualCycleOptionSchema = z.enum([
  'Regular',
  'Irregular',
  'Menopausal',
  'Not applicable',
]);
export type MenstrualCycleOption = z.infer<typeof MenstrualCycleOptionSchema>;

export const PregnancyRelatedOptionSchema = z.enum([
  'Currently pregnant',
  'Postpartum <1 year',
  'Not applicable',
]);
export type PregnancyRelatedOption = z.infer<typeof PregnancyRelatedOptionSchema>;

export const SectionBSchema = z.object({
  // Q5: Diagnosed conditions (multi select)
  diagnosed_conditions: z.array(DiagnosedConditionOptionSchema).min(1, 'Select at least one condition or "None"'),

  // Q6: Menstrual cycle (single select - femaleOnly in schema, defaults to 'Not applicable' if inapplicable)
  menstrual_cycle: MenstrualCycleOptionSchema,

  // Q7: Pregnancy related (single select - femaleOnly in schema, defaults to 'Not applicable' if inapplicable)
  pregnancy_related: PregnancyRelatedOptionSchema,

  // Q8: Adult acne or oily skin (yes/no boolean)
  adult_acne_oily_skin: z.boolean(),

  // Q9: Excess body/facial hair (yes/no boolean)
  excess_body_facial_hair: z.boolean(),
});
export type SectionBData = z.infer<typeof SectionBSchema>;


// --- SECTION C: Lifestyle & Environmental Triggers ---

export const Past6MonthsTriggerOptionSchema = z.enum([
  'Crash dieting or major weight loss',
  'High stress or emotional trauma',
  'Fever with illness (COVID, Dengue, Typhoid)',
  'Recent surgery',
  'Change in location/water/air quality',
]);
export type Past6MonthsTriggerOption = z.infer<typeof Past6MonthsTriggerOptionSchema>;

export const SmokingSeverityOptionSchema = z.enum([
  'Mild <5/day',
  'Moderate 5-10/day',
  'Severe >10/day',
]);
export type SmokingSeverityOption = z.infer<typeof SmokingSeverityOptionSchema>;

export const HairWashFrequencyOptionSchema = z.enum([
  'Daily',
  'Alternate Days',
  'Weekly',
]);
export type HairWashFrequencyOption = z.infer<typeof HairWashFrequencyOptionSchema>;

export const HabitsSchema = z.object({
  smoking: z.boolean(),
  smoking_severity: SmokingSeverityOptionSchema.nullable().optional(),
  alcohol: z.boolean(),
  hard_water: z.boolean(),
  hair_wash_frequency: HairWashFrequencyOptionSchema,
  heating_tools_styling_chemicals: z.boolean(),
  salon_treatments: z.boolean(),
  salon_treatment_detail: z.string().nullable().optional(),
});
export type HabitsData = z.infer<typeof HabitsSchema>;

export const SectionCSchema = z.object({
  // Q10: Past 6 months triggers (multi select)
  past_6_months: z.array(Past6MonthsTriggerOptionSchema),

  // Q11: Lifestyle habits (table format with followups)
  habits: HabitsSchema,
});
export type SectionCData = z.infer<typeof SectionCSchema>;


// --- SECTION D: Current Hair Care & Treatments ---

export const ProductRowNameSchema = z.enum([
  'OTC/Medicated Shampoos',
  'Hair Oils/Serums',
  'Topical Minoxidil',
  'Oral Minoxidil',
  'Supplements',
]);
export type ProductRowName = z.infer<typeof ProductRowNameSchema>;

export const TreatmentDurationOptionSchema = z.enum([
  '<3mo',
  '3-6mo',
  '>6mo',
]);
export type TreatmentDurationOption = z.infer<typeof TreatmentDurationOptionSchema>;

export const ProductUsageItemSchema = z.object({
  used: z.boolean(),
  duration: TreatmentDurationOptionSchema.nullable().optional(),
  helped: z.boolean().nullable().optional(),
  side_effects: z.boolean().nullable().optional(),
});
export type ProductUsageItem = z.infer<typeof ProductUsageItemSchema>;

export const ProcedureRowNameSchema = z.enum([
  'PRP/GFC/iPRF',
  'Stem Cells/Exosomes',
  'Hair Transplant',
  'Other',
]);
export type ProcedureRowName = z.infer<typeof ProcedureRowNameSchema>;

export const ProcedureSessionsOptionSchema = z.enum([
  '1-3',
  '4-6',
  '>6',
]);
export type ProcedureSessionsOption = z.infer<typeof ProcedureSessionsOptionSchema>;

export const ProcedureItemSchema = z.object({
  done: z.boolean(),
  sessions: ProcedureSessionsOptionSchema.nullable().optional(),
  helped: z.boolean().nullable().optional(),
});
export type ProcedureItem = z.infer<typeof ProcedureItemSchema>;

export const SectionDSchema = z.object({
  // Q12: Products used (table mapping 5 products to usage details)
  products: z.record(ProductRowNameSchema, ProductUsageItemSchema),

  // Q13: Procedures done (table mapping 4 procedures to details)
  procedures: z.record(ProcedureRowNameSchema, ProcedureItemSchema),

  // Q14: Past treatment side effects (yes/no with optional description)
  past_treatment_side_effects: z.boolean(),
  past_treatment_side_effects_describe: z.string().nullable().optional(),
});
export type SectionDData = z.infer<typeof SectionDSchema>;


// --- SECTION E: Sample Collection & Consent ---

export const SampleTypeOptionSchema = z.enum([
  'Saliva',
  'Blood',
  'Either',
]);
export type SampleTypeOption = z.infer<typeof SampleTypeOptionSchema>;

export const SectionESchema = z.object({
  // Q15: Sample type preference (single select)
  sample_type: SampleTypeOptionSchema,

  // Q16: Consent to genetic & clinical analysis (yes/no boolean)
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to proceed with clinical evaluation' }),
  }),
});
export type SectionEData = z.infer<typeof SectionESchema>;


// --- COMPLETE MASTER INTAKE DATA SCHEMA ---

export const GenoRootIntakePayloadSchema = z.object({
  form: z.literal('GenoRoot Hair & Scalp Intake').default('GenoRoot Hair & Scalp Intake'),
  submitted_at: z.string().datetime().optional(),
  section_A: SectionASchema,
  section_B: SectionBSchema,
  section_C: SectionCSchema,
  section_D: SectionDSchema,
  section_E: SectionESchema,
});
export type GenoRootIntakePayload = z.infer<typeof GenoRootIntakePayloadSchema>;


// --- DEFAULT INITIAL STATE BUILDER ---

export const createDefaultIntakeState = (): GenoRootIntakePayload => ({
  form: 'GenoRoot Hair & Scalp Intake',
  section_A: {
    age_hair_loss_began: null as unknown as number,
    duration: 'Less than 6 months',
    family_history: [],
    pattern: [],
  },
  section_B: {
    diagnosed_conditions: [],
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
      hair_wash_frequency: 'Alternate Days',
      heating_tools_styling_chemicals: false,
      salon_treatments: false,
      salon_treatment_detail: '',
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
    sample_type: 'Saliva',
    consent: false as unknown as true,
  },
});
