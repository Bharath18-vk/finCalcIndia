import { LongtailPageConfig } from "@/data/longtail-pages";
import { calculateEMI } from "@/lib/calculators/emi";
import { calculateSIP } from "@/lib/calculators/sip";
import { calculateStepUpSIP } from "@/lib/calculators/step-up-sip";
import { calculateLumpsum } from "@/lib/calculators/lumpsum";
import { calculateFD } from "@/lib/calculators/fd";
import { formatINR, formatPercentage, formatTenureYears } from "@/lib/formatters";
import { FAQItem } from "@/components/ui/FAQSection";

export interface ComputedScenarioData {
  directAnswer: string;
  analysisParagraphs: string[];
  faqs: FAQItem[];
  disclosedRateNote: string;
}

export function computeLongtailContent(page: LongtailPageConfig): ComputedScenarioData {
  const { calculator, params } = page;

  if (calculator === "personal-loan-emi" || calculator === "home-loan-emi" || calculator === "car-loan-emi") {
    const loanName =
      calculator === "home-loan-emi"
        ? "Home Loan"
        : calculator === "personal-loan-emi"
        ? "Personal Loan"
        : "Car Loan";

    const rate = params.rate || (calculator === "home-loan-emi" ? 8.5 : calculator === "car-loan-emi" ? 8.85 : 11.0);
    const emiResult = calculateEMI({
      principal: params.amount,
      annualRate: rate,
      tenureYears: params.tenureYears,
    });

    const disclosedRateNote = `This example uses an illustrative ${formatPercentage(
      rate
    )} annual interest rate. Change the rate below to calculate another scenario. Actual rates depend on your credit score, lender category, and sanction terms.`;

    const directAnswer = `The monthly EMI on a ${formatINR(
      params.amount
    )} ${loanName.toLowerCase()} for ${formatTenureYears(
      params.tenureYears
    )} at an illustrative ${formatPercentage(rate)} interest rate is ${formatINR(
      emiResult.monthlyEMI
    )}. You will pay ${formatINR(
      emiResult.totalInterest
    )} in total interest across ${emiResult.totalMonths} months, bringing the total repayment obligation to ${formatINR(
      emiResult.totalPayment
    )}.`;

    const analysisParagraphs = [
      `For this ${formatINR(params.amount)} ${loanName.toLowerCase()} over ${formatTenureYears(
        params.tenureYears
      )}, the total interest of ${formatINR(
        emiResult.totalInterest
      )} amounts to approximately ${emiResult.interestPrincipalRatio}% of your original borrowed principal. On a monthly cash flow basis, the installment represents an outflow of ${formatINR(
        emiResult.monthlyEMI
      )}, where early installments primarily cover interest and subsequent installments increasingly pay down the principal balance.`,

      `Tenure duration has a substantial effect on your borrowing cost. For example, if you chose a shorter tenure, your monthly EMI would increase, but your lifetime interest outgo would decline significantly. Conversely, extending repayment lowers your monthly installment but substantially elevates total interest paid to the lender.`,

      `Borrowers with an existing CIBIL credit score of 750 or above frequently negotiate a 25 to 75 basis point rate concession from Indian commercial banks. On this ${formatINR(
        params.amount
      )} balance, a 0.50% reduction in interest rate saves approximately ${formatINR(
        Math.abs(emiResult.sensitivityTable.find((s) => s.rate < rate)?.differenceEmi ?? 0) * emiResult.totalMonths
      )} over the complete ${formatTenureYears(params.tenureYears)} period.`,
    ];

    const faqs: FAQItem[] = [
      {
        question: `What is the monthly EMI on a ${formatINR(params.amount)} ${loanName.toLowerCase()} for ${params.tenureYears} years?`,
        answer: `At an illustrative ${formatPercentage(rate)} interest rate, the monthly EMI is exactly ${formatINR(
          emiResult.monthlyEMI
        )}. Total interest payable over ${params.tenureYears * 12} months is ${formatINR(
          emiResult.totalInterest
        )}.`,
      },
      {
        question: `What minimum salary is typically required for a ${formatINR(params.amount)} ${loanName.toLowerCase()}?`,
        answer: `Most Indian commercial banks enforce a Fixed Obligation to Income Ratio (FOIR) limit of 40% to 50%. With an EMI of ${formatINR(
          emiResult.monthlyEMI
        )}, you typically need a net monthly take-home salary of at least ${formatINR(
          emiResult.monthlyEMI * 2.2
        )}, assuming you have no other existing active debt obligations.`,
      },
      {
        question: `Can I prepay this ${formatINR(params.amount)} loan early to save interest?`,
        answer: `Yes. Under RBI regulations, individual borrowers with floating-rate home loans incur zero prepayment penalties. For fixed-rate personal or car loans, some banks impose a 2% to 4% foreclosure fee or require a 6-month lock-in period. Making prepayments directly reduces principal and saves considerable interest.`,
      },
      {
        question: `How much can I save if the interest rate drops by 1%?`,
        answer: `If your interest rate decreases by 1% (from ${rate}% to ${rate - 1}%), your monthly EMI decreases by ${formatINR(
          Math.abs(emiResult.sensitivityTable.find((s) => s.rate === rate - 1)?.differenceEmi ?? 0)
        )}, resulting in total savings of approximately ${formatINR(
          emiResult.totalPayment -
            (emiResult.sensitivityTable.find((s) => s.rate === rate - 1)?.totalPayment ?? emiResult.totalPayment)
        )} over the full ${params.tenureYears} years.`,
      },
    ];

    return { directAnswer, analysisParagraphs, faqs, disclosedRateNote };
  }

  if (calculator === "sip") {
    const rate = params.rate || 12.0;
    const sipResult = calculateSIP({
      monthlyInvestment: params.amount,
      annualReturnRate: rate,
      tenureYears: params.tenureYears,
    });

    const disclosedRateNote = `Projections are based on an illustrative ${formatPercentage(
      rate
    )} p.a. long-term historical equity CAGR. Mutual funds are subject to market risks.`;

    const directAnswer = `A Systematic Investment Plan (SIP) of ${formatINR(
      params.amount
    )} per month for ${formatTenureYears(
      params.tenureYears
    )} at an expected ${formatPercentage(rate)} annual return yields an estimated maturity corpus of ${formatINR(
      sipResult.futureValue
    )}. You will invest a total of ${formatINR(
      sipResult.totalInvested
    )} and earn ${formatINR(sipResult.wealthGained)} in capital appreciation (${sipResult.wealthMultiple}x growth).`;

    const analysisParagraphs = [
      `By committing ${formatINR(params.amount)} systematically each month over ${formatTenureYears(
        params.tenureYears
      )}, you accumulate an estimated corpus of ${formatINR(
        sipResult.futureValue
      )}. Notice that wealth gained (${formatINR(sipResult.wealthGained)}) constitutes ${((sipResult.wealthGained / sipResult.futureValue) * 100).toFixed(
        1
      )}% of your final portfolio value, demonstrating how compound interest overtakes principal contributions over long horizons.`,

      `Monthly rupee-cost averaging ensures that you automatically purchase more mutual fund units when markets dip and fewer units when markets rise, mitigating volatility risk compared to trying to time one-time market entry points.`,

      `Extending this discipline can produce dramatic exponential results. As shown in our tenure comparison table, continuing the same ${formatINR(
        params.amount
      )} monthly deposit for an additional 5 years nearly doubles the total wealth created, because past investment gains themselves begin generating substantial compound returns.`,
    ];

    const faqs: FAQItem[] = [
      {
        question: `How much will a SIP of ${formatINR(params.amount)} per month become in ${params.tenureYears} years?`,
        answer: `At an expected return of ${formatPercentage(rate)} p.a., your total maturity value is estimated at ${formatINR(
          sipResult.futureValue
        )}. Total invested capital is ${formatINR(sipResult.totalInvested)}, generating ${formatINR(
          sipResult.wealthGained
        )} in wealth gains.`,
      },
      {
        question: `What happens if market returns average 10% instead of 12%?`,
        answer: `At 10% annual return, your corpus reaches approximately ${formatINR(
          sipResult.sensitivityTable.find((s) => s.rate === 10)?.futureValue ?? sipResult.futureValue
        )}. Even in a conservative market environment, compounding generates substantial capital appreciation over ${params.tenureYears} years.`,
      },
      {
        question: `How is the maturity amount taxed when I redeem my mutual fund units?`,
        answer: `Under Indian budget tax rules, long-term capital gains (LTCG) on equity mutual funds held for over 12 months are taxed at 12.5% on profits exceeding ₹1.25 Lakh per financial year. Each monthly SIP installment is treated as an independent investment with its own 12-month holding requirement.`,
      },
      {
        question: `Can I increase my monthly installment later?`,
        answer: `Yes. You can start a top-up or Step-Up SIP. Increasing your installment by 10% annually dramatically accelerates corpus accumulation and offsets inflation.`,
      },
    ];

    return { directAnswer, analysisParagraphs, faqs, disclosedRateNote };
  }

  if (calculator === "step-up-sip") {
    const rate = params.rate || 12.0;
    const stepUp = params.stepUpPercentage || 10;
    const stepUpResult = calculateStepUpSIP({
      monthlyInvestment: params.amount,
      annualReturnRate: rate,
      tenureYears: params.tenureYears,
      annualStepUpPercentage: stepUp,
    });

    const disclosedRateNote = `Calculated with an annual step-up rate of ${stepUp}% and an illustrative ${formatPercentage(
      rate
    )} p.a. expected mutual fund return.`;

    const directAnswer = `Starting with a SIP of ${formatINR(
      params.amount
    )} per month with a ${stepUp}% annual step-up over ${formatTenureYears(
      params.tenureYears
    )} at ${formatPercentage(rate)} return accumulates an estimated corpus of ${formatINR(
      stepUpResult.futureValue
    )}. You invest ${formatINR(stepUpResult.totalInvested)} in total and earn ${formatINR(
      stepUpResult.wealthGained
    )} in returns, outperforming a flat SIP by an extra ${formatINR(stepUpResult.differenceFutureValue)}.`;

    const analysisParagraphs = [
      `A Step-Up SIP addresses one of the fundamental flaws of traditional investing: leaving contributions static while your earnings expand. Starting at ${formatINR(
        params.amount
      )}/month and increasing it by ${stepUp}% annually results in a final monthly deposit of ${formatINR(
        stepUpResult.finalMonthlyInvestment
      )} in year ${params.tenureYears}.`,

      `This disciplined step-up approach generates an additional ${formatINR(
        stepUpResult.differenceFutureValue
      )} in maturity wealth compared to a fixed flat SIP of ${formatINR(
        params.amount
      )}. Although your cumulative invested capital is higher by ${formatINR(
        stepUpResult.differenceInvested
      )}, the extra returns generated substantially outpace the extra contributions.`,

      `Because the step-up happens once every 12 months, your monthly contribution increases systematically at each annual anniversary, accelerating compounding without requiring manual calculation changes during intermediate months.`,
    ];

    const faqs: FAQItem[] = [
      {
        question: `How does a ${stepUp}% annual step-up compare to a regular flat SIP?`,
        answer: `Over ${params.tenureYears} years, a flat SIP of ${formatINR(
          params.amount
        )}/month generates ${formatINR(
          stepUpResult.regularSIPFutureValue
        )}. Adding a ${stepUp}% annual step-up increases your corpus to ${formatINR(
          stepUpResult.futureValue
        )}, an impressive advantage of ${formatINR(stepUpResult.differenceFutureValue)}.`,
      },
      {
        question: `What will my monthly SIP installment be in the final year?`,
        answer: `In year ${params.tenureYears}, your monthly installment will reach ${formatINR(
          stepUpResult.finalMonthlyInvestment
        )}, growing gradually from your starting contribution of ${formatINR(params.amount)}.`,
      },
      {
        question: `Can I set a maximum cap on my step-up amount?`,
        answer: `Yes. Most Indian mutual fund platforms allow you to specify an upper limit (e.g., stop increasing once monthly SIP reaches ₹25,000 or ₹50,000).`,
      },
      {
        question: `Is an annual step-up better than starting with a large initial SIP?`,
        answer: `Starting with a moderate monthly SIP and increasing it annually allows you to build an equivalent or larger corpus than a fixed contribution, while maintaining a lower initial cash-flow commitment during earlier years.`,
      },
    ];

    return { directAnswer, analysisParagraphs, faqs, disclosedRateNote };
  }

  if (calculator === "lumpsum") {
    const rate = params.rate || 12.0;
    const lumpsumResult = calculateLumpsum({
      totalInvestment: params.amount,
      annualReturnRate: rate,
      tenureYears: params.tenureYears,
    });

    const disclosedRateNote = `Compounded annually at an illustrative ${formatPercentage(
      rate
    )} p.a. long-term rate of return.`;

    const directAnswer = `A one-time lumpsum investment of ${formatINR(
      params.amount
    )} for ${formatTenureYears(params.tenureYears)} at an expected ${formatPercentage(
      rate
    )} p.a. return grows to an estimated maturity value of ${formatINR(
      lumpsumResult.futureValue
    )}. Total wealth gained is ${formatINR(
      lumpsumResult.wealthGained
    )}, multiplying your initial capital by ${lumpsumResult.growthMultiple}x.`;

    const analysisParagraphs = [
      `Deploying a single deposit of ${formatINR(params.amount)} for ${formatTenureYears(
        params.tenureYears
      )} harnesses compound interest across the entire capital from Day 1. At ${formatPercentage(
        rate
      )} CAGR, your investment grows to ${formatINR(
        lumpsumResult.futureValue
      )}, generating ${formatINR(lumpsumResult.wealthGained)} in net capital appreciation.`,

      `According to the mathematical Rule of 72, at 12% annual return your capital doubles approximately every 6 years. Over a ${params.tenureYears}-year horizon, this doubling effect compounds multiple times, transforming a ${formatINR(
        params.amount
      )} deposit into ${lumpsumResult.growthMultiple} times its original value.`,

      `Unlike fixed deposits where annual interest is taxed at your income tax slab, equity mutual fund capital gains are taxed only upon redemption under LTCG guidelines (12.5% over ₹1.25 Lakh per financial year), allowing unrealized profits to compound uninterrupted.`,
    ];

    const faqs: FAQItem[] = [
      {
        question: `How much will ${formatINR(params.amount)} lumpsum become in ${params.tenureYears} years?`,
        answer: `At an expected return of ${formatPercentage(rate)} p.a., your investment grows to approximately ${formatINR(
          lumpsumResult.futureValue
        )}, representing a total wealth gain of ${formatINR(lumpsumResult.wealthGained)}.`,
      },
      {
        question: `Should I invest ${formatINR(params.amount)} all at once or through an STP?`,
        answer: `If you are concerned about near-term equity market volatility, you can park the ${formatINR(
          params.amount
        )} in a liquid or ultra-short-term debt fund and execute a Systematic Transfer Plan (STP) to transfer fixed monthly amounts into equity over 6 to 12 months.`,
      },
      {
        question: `What if the return rate fluctuates between 10% and 14%?`,
        answer: `At 10% return, the maturity value is approximately ${formatINR(
          lumpsumResult.sensitivityTable.find((s) => s.rate === 10)?.futureValue ?? lumpsumResult.futureValue
        )}. At 14% return, it reaches ${formatINR(
          lumpsumResult.sensitivityTable.find((s) => s.rate === 14)?.futureValue ?? lumpsumResult.futureValue
        )}.`,
      },
      {
        question: `Are returns on lumpsum investments guaranteed?`,
        answer: `No. Market-linked equity and mutual fund returns fluctuate with economic conditions. The values shown are illustrative mathematical compound projections.`,
      },
    ];

    return { directAnswer, analysisParagraphs, faqs, disclosedRateNote };
  }

  // Default: Fixed Deposit
  const rate = params.rate || 6.8;
  const fdResult = calculateFD({
    principal: params.amount,
    annualRate: rate,
    tenureYears: params.tenureYears,
    compoundingFrequency: "quarterly",
    isSeniorCitizen: false,
  });

  const seniorResult = calculateFD({
    principal: params.amount,
    annualRate: rate,
    tenureYears: params.tenureYears,
    compoundingFrequency: "quarterly",
    isSeniorCitizen: true,
  });

  const disclosedRateNote = `Calculated using official RBI quarterly compounding conventions at ${formatPercentage(
    rate
  )} p.a. bank benchmark.`;

  const directAnswer = `A Fixed Deposit of ${formatINR(params.amount)} for ${formatTenureYears(
    params.tenureYears
  )} at a benchmark interest rate of ${formatPercentage(
    rate
  )} p.a. (compounded quarterly) yields a maturity value of ${formatINR(
    fdResult.maturityAmount
  )}. Total interest earned is ${formatINR(
    fdResult.totalInterest
  )} (effective annual yield of ${fdResult.effectiveAnnualYield}%). For senior citizens (+0.50%), maturity value is ${formatINR(
    seniorResult.maturityAmount
  )}.`;

  const analysisParagraphs = [
    `In Indian commercial banking, cumulative fixed deposits are compounded quarterly in accordance with RBI directives. For a ${formatINR(
      params.amount
    )} deposit over ${formatTenureYears(params.tenureYears)} at ${formatPercentage(
      rate
    )}, interest earned is added back to your balance every three months, resulting in an effective annual yield (APY) of ${
      fdResult.effectiveAnnualYield
    }%, which is higher than the nominal ${rate}% quote.`,

    `Senior citizens receive a valuable 0.50% p.a. additional rate across public and private sector banks in India. On this ${formatINR(
      params.amount
    )} deposit, the senior citizen slab delivers an extra ${formatINR(
      seniorResult.maturityAmount - fdResult.maturityAmount
    )} in interest over the ${params.tenureYears}-year period.`,

    `Interest earned on fixed deposits is fully taxable as per your applicable income tax slab rate. Additionally, banks deduct Tax Deducted at Source (TDS) under Section 194A if total interest across branches exceeds ₹40,000 in a financial year (₹50,000 for senior citizens) unless Form 15G or 15H is submitted.`,
  ];

  const faqs: FAQItem[] = [
    {
      question: `How much interest will I get on a ${formatINR(params.amount)} FD for ${params.tenureYears} years?`,
      answer: `At ${formatPercentage(rate)} interest with quarterly compounding, you will earn ${formatINR(
        fdResult.totalInterest
      )} in total interest, bringing your maturity amount to ${formatINR(fdResult.maturityAmount)}.`,
    },
    {
      question: `What will a senior citizen get on this ${formatINR(params.amount)} FD?`,
      answer: `With the standard +0.50% senior citizen interest premium (${rate + 0.5}%), a senior citizen earns ${formatINR(
        seniorResult.totalInterest
      )} in interest, receiving a total maturity payout of ${formatINR(seniorResult.maturityAmount)}.`,
    },
    {
      question: `Will TDS be deducted on my ${formatINR(params.amount)} fixed deposit?`,
      answer: `Yes, if the interest earned in a financial year exceeds ₹40,000 (₹50,000 for senior citizens), the bank will deduct TDS at 10% (provided PAN is linked). You can submit Form 15G or 15H if your total income is below the taxable exemption threshold.`,
    },
    {
      question: `Can I withdraw this FD before the ${params.tenureYears}-year tenure ends?`,
      answer: `Most standard cumulative fixed deposits permit premature liquidation, typically subject to a 0.50% to 1.00% penal reduction on the contracted interest rate for the period held. Specific lock-in terms depend on the bank and product category chosen.`,
    },
  ];

  return { directAnswer, analysisParagraphs, faqs, disclosedRateNote };
}
