/**
 * National Pension System (NPS) Tier-1 Retirement Engine
 * Regulatory Authority: Pension Fund Regulatory and Development Authority (PFRDA), Govt of India.
 * Statutory Regulation: PFRDA (Exits and Withdrawals under the National Pension System) Regulations.
 *
 * Supported NPS Models:
 * 1. All Citizen Model (Citizen of India / Individual):
 *    - Open to all Indian citizens aged 18 to 70 years.
 *    - Normal Exit: At age 60 (or superannuation up to age 75). Min 40% annuity, max 60% lump sum.
 *      Small corpus threshold: If corpus <= ₹5,00,000, 100% lump sum withdrawal permitted without annuity.
 *    - Premature Exit: Before age 60 (min 5 years subscription). Min 80% annuity, max 20% lump sum.
 *      Small corpus threshold: If corpus <= ₹2,50,000, 100% lump sum withdrawal permitted without annuity.
 *    - Death Exit: 100% accumulated corpus paid to nominee/legal heirs as tax-free lump sum.
 *    - Tax Deductions: Section 80CCD(1) (up to ₹1.5L) + Section 80CCD(1B) (exclusive ₹50,000).
 *
 * 2. Corporate Sector Model (Employer-Employee Group):
 *    - Adopted by registered corporate entities for their employees.
 *    - Normal Exit / Superannuation: As per employer's service rules (typically age 58 or 60).
 *      Min 40% annuity, max 60% lump sum. Small corpus <= ₹5,00,000 permits 100% lump sum.
 *    - Premature Exit: Before employer superannuation age. Min 80% annuity, max 20% lump sum.
 *      Small corpus <= ₹2,50,000 permits 100% lump sum.
 *    - Death Exit: 100% paid to nominee as tax-free lump sum.
 *    - Tax Deductions: In addition to 80CCD(1) and 80CCD(1B), employer contribution under Section 80CCD(2)
 *      (up to 10% of Basic + DA, 14% for Central Govt) is deductible with no ₹1.5L cap.
 *
 * Statutory Taxation Framework:
 * - Lump-sum withdrawal: 100% tax-exempt under Section 10(12A) (up to 60% at normal exit, up to 20% at premature, 100% on death).
 * - Annuity Purchase: Fully exempt from tax at the time of purchase under Section 80CCD(5).
 * - Annuity / Pension Income: Fully taxable as salary / income from other sources as per the subscriber's applicable income tax slab rate.
 * - Return Assumption: 10.0% multi-asset return is strictly an illustrative annual return assumption, non-guaranteed.
 */

export type NPSModel = "all_citizen" | "corporate";
export type NPSExitType = "normal" | "premature" | "death";

export interface NPSModelConfig {
  id: NPSModel;
  label: string;
  subTitle: string;
  defaultSuperannuationAge: number;
  applicableTaxSections: string[];
  normalExitRule: {
    minAnnuityPercentage: number;
    maxLumpSumPercentage: number;
    smallCorpusThreshold: number; // ₹5,00,000
    description: string;
  };
  prematureExitRule: {
    minAnnuityPercentage: number;
    maxLumpSumPercentage: number;
    smallCorpusThreshold: number; // ₹2,50,000
    minTenureYears: number;
    description: string;
  };
  deathExitRule: {
    lumpSumPercentage: number;
    annuityMandatory: boolean;
    description: string;
  };
}

export const NPS_MODEL_CONFIGS: Record<NPSModel, NPSModelConfig> = {
  all_citizen: {
    id: "all_citizen",
    label: "All Citizen Model (Individual / Citizen of India)",
    subTitle: "Open to all Indian citizens aged 18–70. Self-managed individual Tier-1 account.",
    defaultSuperannuationAge: 60,
    applicableTaxSections: [
      "Section 80CCD(1) - Employee/Self contribution up to ₹1.5 Lakhs (within Section 80CCE limit)",
      "Section 80CCD(1B) - Exclusive additional deduction up to ₹50,000",
    ],
    normalExitRule: {
      minAnnuityPercentage: 40,
      maxLumpSumPercentage: 60,
      smallCorpusThreshold: 500000,
      description:
        "Normal Exit at age 60: Minimum 40% mandatory annuity, up to 60% tax-free lump sum. If total corpus <= ₹5,00,000, 100% lump sum withdrawal is permitted without purchasing an annuity.",
    },
    prematureExitRule: {
      minAnnuityPercentage: 80,
      maxLumpSumPercentage: 20,
      smallCorpusThreshold: 250000,
      minTenureYears: 5,
      description:
        "Premature Exit before age 60: Minimum 80% mandatory annuity, up to 20% lump sum. If total corpus <= ₹2,50,000, 100% lump sum withdrawal is permitted (requires minimum 5 years of subscription).",
    },
    deathExitRule: {
      lumpSumPercentage: 100,
      annuityMandatory: false,
      description:
        "Death of subscriber: 100% of accumulated pension corpus is paid to nominee or legal heirs as tax-free lump sum. Nominee may also opt for annuity if desired.",
    },
  },
  corporate: {
    id: "corporate",
    label: "Corporate Sector Model (Employer-Employee Group)",
    subTitle: "For corporate employees where employer has registered under NPS Corporate Model.",
    defaultSuperannuationAge: 58,
    applicableTaxSections: [
      "Section 80CCD(1) - Employee contribution up to ₹1.5 Lakhs (within Section 80CCE limit)",
      "Section 80CCD(1B) - Exclusive additional deduction up to ₹50,000",
      "Section 80CCD(2) - Employer co-contribution up to 10% of Basic+DA (No ₹1.5L cap, subject to ₹7.5L combined cap)",
    ],
    normalExitRule: {
      minAnnuityPercentage: 40,
      maxLumpSumPercentage: 60,
      smallCorpusThreshold: 500000,
      description:
        "Superannuation as per employer service rules (e.g. age 58 or 60): Minimum 40% mandatory annuity, up to 60% tax-free lump sum. If corpus <= ₹5,00,000, 100% lump sum is permitted.",
    },
    prematureExitRule: {
      minAnnuityPercentage: 80,
      maxLumpSumPercentage: 20,
      smallCorpusThreshold: 250000,
      minTenureYears: 5,
      description:
        "Resignation / premature exit before employer superannuation: Minimum 80% mandatory annuity, up to 20% lump sum. If corpus <= ₹2,50,000, 100% lump sum is permitted.",
    },
    deathExitRule: {
      lumpSumPercentage: 100,
      annuityMandatory: false,
      description:
        "Death in service: 100% of accumulated corpus is paid to nominee or legal heir as tax-free lump sum.",
    },
  },
};

export interface NPSStatutoryMetadata {
  illustrativeReturnRate: number;
  returnRateClassification: "illustrative-assumption";
  regulatoryBody: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  notes: string;
}

export const NPS_STATUTORY_METADATA: NPSStatutoryMetadata = {
  illustrativeReturnRate: 10.0,
  returnRateClassification: "illustrative-assumption",
  regulatoryBody: "Pension Fund Regulatory and Development Authority (PFRDA)",
  sourceName: "PFRDA Multi-Year NPS Scheme Return Track Records & Exit Regulations",
  sourceUrl: "https://www.pfrda.org.in",
  verifiedAt: "2024-10-01",
  notes:
    "10.00% illustrative annual return assumption for a balanced active or moderate lifecycle Tier-1 asset allocation (Classes E, C, and G). Returns are market-linked, non-linear, and not guaranteed by the Government or PFRDA.",
};

export interface NPSYearlyProgress {
  age: number;
  year: number;
  depositedSoFar: number;
  interestEarnedYear: number;
  cumulativeInterest: number;
  closingBalance: number;
}

export interface NPSInputs {
  monthlyContribution: number;
  currentAge: number;
  retirementAge?: number; // Superannuation age
  expectedAnnualReturn?: number; // Default 10.0% illustrative assumption
  npsModel?: NPSModel; // Default 'all_citizen'
  exitType?: NPSExitType; // Default 'normal'
  annuityPercentage?: number; // User override
  expectedAnnuityRate?: number; // Default 6.0% for life annuity
}

export interface NPSResult {
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  investmentYears: number;
  totalMonths: number;

  totalInvested: number;
  totalInterestEarned: number;
  totalCorpusAtRetirement: number;

  npsModel: NPSModel;
  modelConfig: NPSModelConfig;
  exitType: NPSExitType;
  isSmallCorpusExemptFromAnnuity: boolean;
  minMandatoryAnnuityPercentage: number;
  maxLumpSumPercentage: number;

  annuityPercentage: number;
  annuityAmount: number;
  lumpSumPercentage: number;
  lumpSumAmount: number;

  expectedMonthlyPension: number;
  expectedAnnualPension: number;

  taxationSummary: {
    lumpSumTaxStatus: string;
    annuityPurchaseTaxStatus: string;
    annuityIncomeTaxStatus: string;
    modelTaxNotes: string;
  };

  rateMetadata: NPSStatutoryMetadata;
  yearlyBreakdown: NPSYearlyProgress[];
}

export function calculateNPS(inputs: NPSInputs): NPSResult {
  const p = Math.max(0, Math.round(Number(inputs.monthlyContribution) || 0));
  const currentAge = Math.min(65, Math.max(18, Math.floor(Number(inputs.currentAge) || 25)));
  const npsModel: NPSModel = inputs.npsModel === "corporate" ? "corporate" : "all_citizen";
  const modelConfig = NPS_MODEL_CONFIGS[npsModel];
  const exitType: NPSExitType = inputs.exitType === "premature" ? "premature" : inputs.exitType === "death" ? "death" : "normal";

  const defaultRetirementAge =
    exitType === "normal"
      ? modelConfig.defaultSuperannuationAge
      : Math.min(modelConfig.defaultSuperannuationAge - 1, currentAge + 5);

  const retirementAge = Math.min(
    75,
    Math.max(currentAge + 1, Math.floor(Number(inputs.retirementAge) || defaultRetirementAge))
  );
  const investmentYears = retirementAge - currentAge;
  const totalMonths = investmentYears * 12;

  const returnRate =
    Math.min(25, Math.max(0, Number(inputs.expectedAnnualReturn ?? NPS_STATUTORY_METADATA.illustrativeReturnRate))) / 100;
  const monthlyRate = returnRate / 12;
  const annuityReturnRate = Math.min(15, Math.max(0, Number(inputs.expectedAnnuityRate ?? 6))) / 100;

  if (p === 0 || investmentYears <= 0) {
    return {
      monthlyContribution: p,
      currentAge,
      retirementAge,
      investmentYears: Math.max(0, investmentYears),
      totalMonths: Math.max(0, totalMonths),
      totalInvested: 0,
      totalInterestEarned: 0,
      totalCorpusAtRetirement: 0,
      npsModel,
      modelConfig,
      exitType,
      isSmallCorpusExemptFromAnnuity: true,
      minMandatoryAnnuityPercentage: exitType === "normal" ? 40 : exitType === "premature" ? 80 : 0,
      maxLumpSumPercentage: exitType === "normal" ? 60 : exitType === "premature" ? 20 : 100,
      annuityPercentage: 0,
      annuityAmount: 0,
      lumpSumPercentage: 100,
      lumpSumAmount: 0,
      expectedMonthlyPension: 0,
      expectedAnnualPension: 0,
      taxationSummary: {
        lumpSumTaxStatus: "100% Tax-Exempt under Section 10(12A)",
        annuityPurchaseTaxStatus: "Exempt from tax at time of purchase under Section 80CCD(5)",
        annuityIncomeTaxStatus: "Subsequent annuity / pension income is taxable at your applicable slab rate",
        modelTaxNotes: modelConfig.applicableTaxSections.join(" | "),
      },
      rateMetadata: NPS_STATUTORY_METADATA,
      yearlyBreakdown: [],
    };
  }

  // Monthly compounding progression
  let balance = 0;
  let cumulativeDeposits = 0;
  const yearlyBreakdown: NPSYearlyProgress[] = [];

  for (let year = 1; year <= investmentYears; year++) {
    let interestThisYear = 0;

    for (let m = 1; m <= 12; m++) {
      balance += p;
      cumulativeDeposits += p;
      const monthInterest = balance * monthlyRate;
      interestThisYear += monthInterest;
      balance += monthInterest;
    }

    yearlyBreakdown.push({
      age: currentAge + year,
      year,
      depositedSoFar: cumulativeDeposits,
      interestEarnedYear: Math.round(interestThisYear),
      cumulativeInterest: Math.round(balance - cumulativeDeposits),
      closingBalance: Math.round(balance),
    });
  }

  const totalCorpus = Math.round(balance);
  const totalInvested = cumulativeDeposits;
  const totalInterestEarned = Math.max(0, totalCorpus - totalInvested);

  // Apply Model-specific & Exit-specific PFRDA Exit Rules
  let minAnnuityPct = 40;
  let maxLumpPct = 60;
  let isSmallCorpus = false;

  if (exitType === "death") {
    // Death Exit: 100% lump sum to nominee, 0% mandatory annuity
    minAnnuityPct = 0;
    maxLumpPct = 100;
    isSmallCorpus = true;
  } else if (exitType === "normal") {
    // Normal Superannuation Exit:
    // If corpus <= ₹5 Lakhs, 100% lump sum permitted without annuity
    if (totalCorpus <= modelConfig.normalExitRule.smallCorpusThreshold) {
      isSmallCorpus = true;
      minAnnuityPct = 0;
      maxLumpPct = 100;
    } else {
      minAnnuityPct = modelConfig.normalExitRule.minAnnuityPercentage;
      maxLumpPct = modelConfig.normalExitRule.maxLumpSumPercentage;
    }
  } else {
    // Premature Exit:
    // If corpus <= ₹2.5 Lakhs, 100% lump sum permitted without annuity
    if (totalCorpus <= modelConfig.prematureExitRule.smallCorpusThreshold) {
      isSmallCorpus = true;
      minAnnuityPct = 0;
      maxLumpPct = 100;
    } else {
      minAnnuityPct = modelConfig.prematureExitRule.minAnnuityPercentage;
      maxLumpPct = modelConfig.prematureExitRule.maxLumpSumPercentage;
    }
  }

  // Determine user chosen or statutory default annuity %
  let chosenAnnuityPct = minAnnuityPct;
  if (exitType === "death") {
    chosenAnnuityPct = 0;
  } else if (inputs.annuityPercentage !== undefined) {
    chosenAnnuityPct = Math.min(100, Math.max(minAnnuityPct, Number(inputs.annuityPercentage)));
  }

  const lumpSumPct = 100 - chosenAnnuityPct;
  const annuityAmount = Math.round((totalCorpus * chosenAnnuityPct) / 100);
  const lumpSumAmount = totalCorpus - annuityAmount;

  // Monthly annuity pension
  const annualPension = Math.round(annuityAmount * annuityReturnRate);
  const monthlyPension = Math.round(annualPension / 12);

  return {
    monthlyContribution: p,
    currentAge,
    retirementAge,
    investmentYears,
    totalMonths,
    totalInvested,
    totalInterestEarned,
    totalCorpusAtRetirement: totalCorpus,
    npsModel,
    modelConfig,
    exitType,
    isSmallCorpusExemptFromAnnuity: isSmallCorpus,
    minMandatoryAnnuityPercentage: minAnnuityPct,
    maxLumpSumPercentage: maxLumpPct,
    annuityPercentage: chosenAnnuityPct,
    annuityAmount,
    lumpSumPercentage: lumpSumPct,
    lumpSumAmount,
    expectedMonthlyPension: monthlyPension,
    expectedAnnualPension: annualPension,
    taxationSummary: {
      lumpSumTaxStatus:
        exitType === "death"
          ? "100% Tax-Exempt payout to nominee/legal heirs under Section 10(12A)"
          : "100% Tax-Exempt under Section 10(12A) of Income Tax Act (up to 60% of corpus at normal exit)",
      annuityPurchaseTaxStatus: "Exempt from tax at time of purchase under Section 80CCD(5)",
      annuityIncomeTaxStatus:
        chosenAnnuityPct > 0
          ? "Subsequent monthly/annual annuity pension is fully taxable at your applicable slab rate"
          : "No annuity purchased (100% lump sum option chosen)",
      modelTaxNotes: modelConfig.applicableTaxSections.join(" | "),
    },
    rateMetadata: NPS_STATUTORY_METADATA,
    yearlyBreakdown,
  };
}
