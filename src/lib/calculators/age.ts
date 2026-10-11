import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export interface AgeInput {
  birthDate: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD (defaults to current date)
}

export interface NextBirthdayInfo {
  date: string;
  dayOfWeek: string;
  daysRemaining: number;
  monthsRemaining: number;
}

export interface AgeResult {
  birthDate: string;
  targetDate: string;
  years: number;
  months: number;
  days: number;
  formattedAge: string;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  nextBirthday: NextBirthdayInfo;
  zodiacSign: string;
  dayOfWeekBorn: string;
  steps: string[];
}

export function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  return "Capricorn";
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const ageInputSchema = z
  .object({
    birthDate: z
      .string({ invalid_type_error: "Birth date must be a string" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    targetDate: z
      .string({ invalid_type_error: "Target date must be a string" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
  })
  .refine(
    (data) => {
      const bDate = new Date(`${data.birthDate}T00:00:00`);
      if (Number.isNaN(bDate.getTime())) return false;
      if (data.targetDate) {
        const tDate = new Date(`${data.targetDate}T00:00:00`);
        if (Number.isNaN(tDate.getTime())) return false;
        return tDate >= bDate;
      }
      return true;
    },
    {
      message: "Target date cannot be before birth date",
      path: ["targetDate"],
    }
  );

export const defaultAgeInput: AgeInput = {
  birthDate: "1998-05-15",
  targetDate: "2026-10-11",
};

/**
 * Pure calculation engine for Chronological Age, Days Lived, and Next Birthday
 */
export function calculateAge(input: AgeInput): AgeResult {
  const bDate = new Date(`${input.birthDate || "1998-05-15"}T00:00:00`);
  const tDate = input.targetDate
    ? new Date(`${input.targetDate}T00:00:00`)
    : new Date();

  // If invalid date, return zero state safely
  if (Number.isNaN(bDate.getTime()) || Number.isNaN(tDate.getTime()) || tDate < bDate) {
    return {
      birthDate: input.birthDate,
      targetDate: input.targetDate || "",
      years: 0,
      months: 0,
      days: 0,
      formattedAge: "0 years, 0 months, 0 days",
      totalMonths: 0,
      totalWeeks: 0,
      totalDays: 0,
      totalHours: 0,
      totalMinutes: 0,
      nextBirthday: {
        date: "",
        dayOfWeek: "",
        daysRemaining: 0,
        monthsRemaining: 0,
      },
      zodiacSign: "Unknown",
      dayOfWeekBorn: "Unknown",
      steps: ["Invalid date provided."],
    };
  }

  const birthYear = bDate.getFullYear();
  const birthMonth = bDate.getMonth();
  const birthDay = bDate.getDate();

  const targetYear = tDate.getFullYear();
  const targetMonth = tDate.getMonth();
  const targetDay = tDate.getDate();

  let years = targetYear - birthYear;
  let months = targetMonth - birthMonth;
  let days = targetDay - birthDay;

  if (days < 0) {
    // Borrow days from previous month
    const prevMonthDays = new Date(targetYear, targetMonth, 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const diffTime = Math.abs(tDate.getTime() - bDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Next Birthday Calculation
  let nextBdayYear = targetYear;
  let nextBday = new Date(nextBdayYear, birthMonth, birthDay);
  if (nextBday < tDate) {
    nextBdayYear += 1;
    nextBday = new Date(nextBdayYear, birthMonth, birthDay);
  }

  const nextBdayDiff = Math.ceil((nextBday.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
  const nextBdayMonths = Math.floor(nextBdayDiff / 30.4375);
  const nextBirthdayInfo: NextBirthdayInfo = {
    date: nextBday.toISOString().split("T")[0],
    dayOfWeek: DAYS_OF_WEEK[nextBday.getDay()],
    daysRemaining: nextBdayDiff,
    monthsRemaining: nextBdayMonths,
  };

  const dayOfWeekBorn = DAYS_OF_WEEK[bDate.getDay()];
  const zodiacSign = getZodiacSign(birthMonth + 1, birthDay);

  const formattedAge = `${years} years, ${months} months, ${days} days`;

  const steps = [
    `Birth Date: ${bDate.toDateString()} (${dayOfWeekBorn})`,
    `Calculation Date: ${tDate.toDateString()}`,
    `Exact Chronological Age: ${years} Years, ${months} Months, and ${days} Days`,
    `Total Time Elapsed: ${totalDays.toLocaleString("en-IN")} days (${totalWeeks.toLocaleString("en-IN")} weeks)`,
    `Next Birthday: ${nextBday.toDateString()} in ${nextBdayDiff} days (${nextBirthdayInfo.dayOfWeek})`,
  ];

  return {
    birthDate: input.birthDate,
    targetDate: input.targetDate || tDate.toISOString().split("T")[0],
    years,
    months,
    days,
    formattedAge,
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    nextBirthday: nextBirthdayInfo,
    zodiacSign,
    dayOfWeekBorn,
    steps,
  };
}

export const ageFields: CalculatorField<AgeInput>[] = [
  {
    name: "birthDate",
    label: "Date of Birth (DOB)",
    type: "text",
    defaultValue: "1998-05-15",
    helperText: "Format: YYYY-MM-DD",
    placeholder: "YYYY-MM-DD",
  },
  {
    name: "targetDate",
    label: "Age at Date of (Optional, defaults to today)",
    type: "text",
    defaultValue: "2026-10-11",
    helperText: "Format: YYYY-MM-DD",
    placeholder: "YYYY-MM-DD",
  },
];

export const ageMetadata: CalculatorMetadata = {
  id: "age",
  name: "Age Calculator",
  shortDescription:
    "Calculate exact chronological age in years, months, days, total weeks, hours lived, day of week born, and countdown to your next birthday.",
  category: "everyday",
  subcategory: "lifestyle",
  route: "/age-calculator",
  badge: "Everyday & Lifestyle",
  directAnswer:
    "To calculate exact age, count the completed years, then the remaining whole months, and finally the remaining days between the date of birth and the target date. For example, a person born on 15 May 1998 is 28 years, 4 months, and 26 days old as of 11 October 2026.",
  keywords: [
    "age calculator",
    "calculate age",
    "chronological age calculator",
    "how old am i",
    "dob calculator",
    "birthday countdown calculator",
    "age in days calculator",
  ],
  formula: {
    expression: "\\text{Age} = \\text{Target Date} - \\text{Date of Birth} \\quad (\\text{Years, Months, Days})",
    variables: [
      { symbol: "\\text{DOB}", label: "Date of Birth", description: "The starting date of birth" },
      { symbol: "\\text{Target}", label: "Target Date", description: "The comparison date (defaults to today)" },
      { symbol: "\\text{Years}", label: "Completed Years", description: "Full calendar years elapsed" },
      { symbol: "\\text{Days Lived}", label: "Total Days", description: "Total count of calendar days lived" },
    ],
    steps: [
      { label: "Year Difference", expression: "Y_{\\text{target}} - Y_{\\text{birth}}", explanation: "Compute preliminary year difference." },
      { label: "Month Difference", expression: "M_{\\text{target}} - M_{\\text{birth}}", explanation: "Adjust if current month is earlier in the calendar." },
      { label: "Day Borrowing", expression: "D_{\\text{target}} - D_{\\text{birth}}", explanation: "Borrow days from previous month if target day is smaller." },
    ],
    notes: [
      "Leap years (366 days) and varying month lengths (28, 29, 30, or 31 days) are accurately accounted for.",
      "Total hours and minutes assume whole days (24 hours per calendar day).",
    ],
  },
  faqs: [
    {
      question: "How does the age calculator calculate months and days?",
      answer:
        "The calculator determines whole completed calendar years, then subtracts the months. If the target day is less than the birth day, it borrows the exact number of days in the preceding calendar month to ensure 100% astronomical accuracy.",
    },
    {
      question: "Can I calculate my age on a past or future date?",
      answer:
        "Yes. You can specify any target date in the 'Age at Date of' field to calculate how old you were on a specific historical date (e.g., job joining) or how old you will be in the future (e.g., retirement date).",
    },
    {
      question: "How is the next birthday countdown determined?",
      answer:
        "It projects your birth month and day to the current calendar year. If that date has already passed, it calculates the remaining days to that date in the following calendar year, along with the exact day of the week.",
    },
    {
      question: "Does the calculator account for leap years?",
      answer:
        "Yes, leap years (February 29) are fully supported. For people born on February 29, birthdays in non-leap years default to March 1.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const ageEngine: CalculatorEngine<AgeInput, AgeResult> = {
  id: "age",
  metadata: ageMetadata,
  schema: ageInputSchema,
  defaultInputs: defaultAgeInput,
  fields: ageFields,
  calculate: calculateAge,
  formatResult: (result: AgeResult) => {
    return {
      raw: result,
      primary: {
        key: "age",
        label: "Exact Chronological Age",
        value: result.years,
        formattedValue: result.formattedAge,
        subtext: `Born on a ${result.dayOfWeekBorn} | Zodiac: ${result.zodiacSign}`,
        highlight: true,
      },
      secondary: [
        {
          key: "nextBday",
          label: "Next Birthday",
          value: result.nextBirthday.daysRemaining,
          formattedValue: `In ${result.nextBirthday.daysRemaining} days (${result.nextBirthday.dayOfWeek})`,
        },
        {
          key: "totalDays",
          label: "Total Days Alive",
          value: result.totalDays,
          formattedValue: `${result.totalDays.toLocaleString("en-IN")} days`,
        },
        {
          key: "totalWeeks",
          label: "Total Weeks Alive",
          value: result.totalWeeks,
          formattedValue: `${result.totalWeeks.toLocaleString("en-IN")} weeks`,
        },
        {
          key: "totalHours",
          label: "Total Hours Lived",
          value: result.totalHours,
          formattedValue: `${result.totalHours.toLocaleString("en-IN")} hours`,
        },
      ],
      summaryText: `As of ${result.targetDate}, you are ${result.formattedAge} old (${result.totalDays.toLocaleString("en-IN")} days alive). Your next birthday is in ${result.nextBirthday.daysRemaining} days on a ${result.nextBirthday.dayOfWeek}.`,
    };
  },
};

registerCalculator(ageEngine);
