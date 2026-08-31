import { GenoRootIntakePayload } from '@/types/schema';

export interface ClinicalTriagingResult {
  primaryPhenotype: string;
  phenotypeDescription: string;
  keyBiomarkers: string[];
  recommendedKit: string;
  priorityFlags: string[];
  urgencyLevel: 'Standard' | 'Elevated' | 'Immediate Clinical Attention';
}

/**
 * Infers personalized clinical insights and biomarker test recommendations
 * based on patient intake responses.
 */
export function inferClinicalTriaging(payload: GenoRootIntakePayload): ClinicalTriagingResult {
  const flags: string[] = [];
  const biomarkers: string[] = [];

  const { section_A, section_B, section_C, section_D, section_E } = payload;

  // 1. Analyze Patterns & Family History
  const hasAndrogenPattern =
    section_A.pattern.includes('Receding hairline') ||
    section_A.pattern.includes('Thinning at crown');
  const hasDiffusePattern = section_A.pattern.includes('Diffuse thinning') || section_A.pattern.includes('Widening part line');
  const hasTelogenPattern = section_A.pattern.includes('Sudden excessive shedding');
  const hasFamilyHistory = !section_A.family_history.includes('No known family history') && section_A.family_history.length > 0;

  if (hasAndrogenPattern || hasFamilyHistory) {
    biomarkers.push('AR (Androgen Receptor Sensitivity)', 'SRD5A2 (5α-Reductase Type II Activity)');
  }

  // 2. Health conditions
  if (section_B.diagnosed_conditions.includes('Thyroid disorder')) {
    flags.push('Thyroid axis impact on anagen growth');
    biomarkers.push('TSH / Free T3/T4 metabolic receptor panel');
  }
  if (section_B.diagnosed_conditions.includes('Anemia')) {
    flags.push('Ferritin & cellular oxygenation deficiency');
    biomarkers.push('HFE / Serum Ferritin biomarker');
  }
  if (section_B.diagnosed_conditions.includes('PCOS/PCOD')) {
    flags.push('Hyperandrogenism / insulin resistance profile');
    biomarkers.push('SHBG & Free Testosterone ratio');
  }

  // 3. Menopause / Postpartum
  if (section_B.menstrual_cycle === 'Menopausal') {
    flags.push('Estrogen/Progesterone drop with relative androgen dominance');
    biomarkers.push('ESR1 / Aromatase enzyme expression');
  }
  if (section_B.pregnancy_related === 'Postpartum <1 year') {
    flags.push('Acute postpartum telogen effluvium phase');
  }

  // 4. Lifestyle & Habits
  if (section_C.past_6_months.includes('High stress or emotional trauma')) {
    flags.push('Elevated cortisol-induced follicle dormancy');
    biomarkers.push('CRH / Cortisol receptor responsiveness');
  }
  if (section_C.habits.hard_water) {
    flags.push('Hard water mineral scaling (calcium/magnesium buildup on hair shaft)');
  }
  if (section_C.habits.smoking) {
    flags.push(`Tobacco vasoconstriction (${section_C.habits.smoking_severity || 'Active'})`);
  }

  // Determine Primary Phenotype
  let primaryPhenotype = 'Multi-Factorial Follicular Miniaturization';
  let phenotypeDescription = 'Gradual follicular miniaturization influenced by genetic sensitivity and environmental lifestyle drivers.';
  let urgencyLevel: ClinicalTriagingResult['urgencyLevel'] = 'Standard';

  if (hasTelogenPattern && section_C.past_6_months.length > 0) {
    primaryPhenotype = 'Acute Telogen Effluvium (Stress / Metabolic Trigger)';
    phenotypeDescription = 'Rapid shedding triggered by physiological disruption in the past 6 months, interrupting the anagen growth cycle.';
    urgencyLevel = 'Elevated';
  } else if (hasAndrogenPattern && hasFamilyHistory) {
    primaryPhenotype = 'Pattern Androgenetic Alopecia (Genetic Profile)';
    phenotypeDescription = 'Genetically predisposed DHT sensitivity leading to progressive miniaturization in androgen-sensitive scalp zones.';
  } else if (section_B.menstrual_cycle === 'Menopausal' || section_B.diagnosed_conditions.includes('Thyroid disorder')) {
    primaryPhenotype = 'Endocrine-Modulated Diffuse Thinning';
    phenotypeDescription = 'Hormonal and metabolic shifts altering follicular receptor sensitivity and cellular energy turnover.';
  }

  // Add default biomarkers if list is short
  if (biomarkers.length < 3) {
    biomarkers.push('WNT / β-Catenin Hair Cycle Pathway', 'COL1A1 Scalp Collagen Synthesis');
  }

  const recommendedKit =
    section_E.sample_type === 'Blood'
      ? 'GenoRoot Genomic Blood Capillary Panel + Micro-Mineral Assay'
      : 'GenoRoot Buccal Saliva DNA Collection Kit + Trichological Scalp Swab';

  return {
    primaryPhenotype,
    phenotypeDescription,
    keyBiomarkers: Array.from(new Set(biomarkers)).slice(0, 4),
    recommendedKit,
    priorityFlags: flags.length > 0 ? flags : ['No acute contraindications flagged'],
    urgencyLevel,
  };
}
