/* ========================================================================
   North×South — tax data + pure calculation functions
   Loaded as a plain <script> in the browser (declarations are visible
   to the inline JSX block in index.html), and require()'d by Node tests
   via the module.exports shim at the bottom.
   ======================================================================== */

/* ========================================================================
   2026 TAX DATA
   ======================================================================== */

const CA_FEDERAL_2026 = [
  { upTo: 58523, rate: 0.14 }, { upTo: 117045, rate: 0.205 },
  { upTo: 181440, rate: 0.26 }, { upTo: 258482, rate: 0.29 },
  { upTo: Infinity, rate: 0.33 }
];
const CA_BPA_2026 = 16129;

const PROVINCIAL_2026 = {
  ON: { label: 'Ontario', short: 'Ontario',
    brackets: [
      { upTo: 52886, rate: 0.0505 }, { upTo: 105775, rate: 0.0915 },
      { upTo: 150000, rate: 0.1116 }, { upTo: 220000, rate: 0.1216 },
      { upTo: Infinity, rate: 0.1316 }
    ],
    bpa: 12747,
    surtax: { tier1: { threshold: 5818, rate: 0.20 }, tier2: { threshold: 7446, rate: 0.36 } }
  },
  BC: { label: 'British Columbia', short: 'BC',
    brackets: [
      { upTo: 50090, rate: 0.0506 }, { upTo: 100180, rate: 0.077 },
      { upTo: 115000, rate: 0.105 }, { upTo: 139500, rate: 0.1229 },
      { upTo: 189500, rate: 0.147 }, { upTo: 264000, rate: 0.168 },
      { upTo: Infinity, rate: 0.205 }
    ],
    bpa: 12932
  },
  AB: { label: 'Alberta', short: 'Alberta',
    brackets: [
      { upTo: 60000, rate: 0.08 }, { upTo: 151234, rate: 0.10 },
      { upTo: 181481, rate: 0.12 }, { upTo: 241974, rate: 0.13 },
      { upTo: 362961, rate: 0.14 }, { upTo: Infinity, rate: 0.15 }
    ],
    bpa: 22323
  },
  QC: { label: 'Quebec', short: 'Quebec',
    brackets: [
      { upTo: 53255, rate: 0.14 }, { upTo: 106495, rate: 0.19 },
      { upTo: 129590, rate: 0.24 }, { upTo: Infinity, rate: 0.2575 }
    ],
    bpa: 18571,
    federalAbatement: 0.165
  }
};

const CPP_2026 = { exemption: 3500, ympe: 71300, yampe: 81900, baseRate: 0.0595, enhancedRate: 0.04 };
const EI_2026 = { maxInsurable: 65700, rate: 0.0164 };

const US_FEDERAL_2026 = {
  single: [
    { upTo: 12400, rate: 0.10 }, { upTo: 50400, rate: 0.12 },
    { upTo: 105700, rate: 0.22 }, { upTo: 201775, rate: 0.24 },
    { upTo: 256225, rate: 0.32 }, { upTo: 640600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  mfj: [
    { upTo: 24800, rate: 0.10 }, { upTo: 100800, rate: 0.12 },
    { upTo: 211400, rate: 0.22 }, { upTo: 403550, rate: 0.24 },
    { upTo: 512450, rate: 0.32 }, { upTo: 768700, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ]
};
const US_STD_DED_2026 = { single: 16100, mfj: 32200 };
const CTC_2026 = 2200;

const FICA_2026 = {
  ssRate: 0.062, ssWageBase: 184500,
  medicareRate: 0.0145, addlMedicareRate: 0.009,
  addlMedicareThreshold: { single: 200000, mfj: 250000 }
};

const STATE_2026 = {
  CA: { label: 'California', short: 'California', type: 'progressive',
    brackets: {
      single: [
        { upTo: 11000, rate: 0.01 }, { upTo: 26100, rate: 0.02 },
        { upTo: 41200, rate: 0.04 }, { upTo: 57200, rate: 0.06 },
        { upTo: 72300, rate: 0.08 }, { upTo: 369100, rate: 0.093 },
        { upTo: 442900, rate: 0.103 }, { upTo: 738400, rate: 0.113 },
        { upTo: Infinity, rate: 0.123 }
      ],
      mfj: [
        { upTo: 22000, rate: 0.01 }, { upTo: 52200, rate: 0.02 },
        { upTo: 82400, rate: 0.04 }, { upTo: 114400, rate: 0.06 },
        { upTo: 144600, rate: 0.08 }, { upTo: 738200, rate: 0.093 },
        { upTo: 885800, rate: 0.103 }, { upTo: 1476800, rate: 0.113 },
        { upTo: Infinity, rate: 0.123 }
      ]
    },
    mentalHealthSurcharge: { threshold: 1000000, rate: 0.01 }
  },
  NY: { label: 'New York', short: 'New York', type: 'progressive',
    brackets: {
      single: [
        { upTo: 8500, rate: 0.04 }, { upTo: 11700, rate: 0.045 },
        { upTo: 13900, rate: 0.0525 }, { upTo: 80650, rate: 0.055 },
        { upTo: 215400, rate: 0.06 }, { upTo: 1077550, rate: 0.0685 },
        { upTo: 5000000, rate: 0.0965 }, { upTo: 25000000, rate: 0.103 },
        { upTo: Infinity, rate: 0.109 }
      ],
      mfj: [
        { upTo: 17150, rate: 0.04 }, { upTo: 23600, rate: 0.045 },
        { upTo: 27900, rate: 0.0525 }, { upTo: 161550, rate: 0.055 },
        { upTo: 323200, rate: 0.06 }, { upTo: 2155350, rate: 0.0685 },
        { upTo: 5000000, rate: 0.0965 }, { upTo: 25000000, rate: 0.103 },
        { upTo: Infinity, rate: 0.109 }
      ]
    }
  },
  WA: { label: 'Washington', short: 'Washington', type: 'none' },
  TX: { label: 'Texas', short: 'Texas', type: 'none' },
  FL: { label: 'Florida', short: 'Florida', type: 'none' },
  MA: { label: 'Massachusetts', short: 'Mass.', type: 'flat', rate: 0.05,
    surcharge: { threshold: 1083150, rate: 0.04 } },
  IL: { label: 'Illinois', short: 'Illinois', type: 'flat', rate: 0.0495 },
  CO: { label: 'Colorado', short: 'Colorado', type: 'flat', rate: 0.044 }
};

const HEALTHCARE_2026 = {
  single:        { premium: 1500, oop: 2000 },
  mfj_no_kids:   { premium: 4800, oop: 4000 },
  mfj_with_kids: { premium: 7200, oop: 4500 }
};

const CHILDCARE_PROV = { ON: 2500, BC: 3000, AB: 4500, QC: 2400 };
const CHILDCARE_STATE_DEFAULT = {
  CA: 28000, NY: 24000, WA: 24000, TX: 18000, FL: 16000,
  MA: 24000, IL: 19000, CO: 20000
};

/* ========================================================================
   PURE FUNCTIONS
   ======================================================================== */

function applyBrackets(income, brackets) {
  if (income <= 0) return 0;
  let tax = 0, lastCap = 0;
  for (const b of brackets) {
    if (income <= lastCap) break;
    const slice = Math.min(income, b.upTo) - lastCap;
    tax += slice * b.rate;
    lastCap = b.upTo;
  }
  return tax;
}

function calcOntarioSurtax(provTaxBeforeSurtax, surtax) {
  let s = 0;
  if (provTaxBeforeSurtax > surtax.tier1.threshold)
    s += (provTaxBeforeSurtax - surtax.tier1.threshold) * surtax.tier1.rate;
  if (provTaxBeforeSurtax > surtax.tier2.threshold)
    s += (provTaxBeforeSurtax - surtax.tier2.threshold) * surtax.tier2.rate;
  return s;
}

function calcOntarioHealthPremium(income) {
  if (income <= 20000) return 0;
  if (income <= 25000) return (income - 20000) * 0.06;
  if (income <= 36000) return 300;
  if (income <= 38500) return 300 + (income - 36000) * 0.06;
  if (income <= 48000) return 450;
  if (income <= 48600) return 450 + (income - 48000) * 0.25;
  if (income <= 72000) return 600;
  if (income <= 72600) return 600 + (income - 72000) * 0.25;
  if (income <= 200000) return 750;
  if (income <= 200600) return 750 + (income - 200000) * 0.25;
  return 900;
}

function calcCPP(income) {
  const base = Math.max(0, Math.min(income, CPP_2026.ympe) - CPP_2026.exemption) * CPP_2026.baseRate;
  const enhanced = Math.max(0, Math.min(income, CPP_2026.yampe) - CPP_2026.ympe) * CPP_2026.enhancedRate;
  return base + enhanced;
}

function calcEI(income) {
  return Math.min(income, EI_2026.maxInsurable) * EI_2026.rate;
}

function calculateCanada({ income, province }) {
  if (income <= 0) return { gross: 0, takeHome: 0 };
  const cpp = calcCPP(income);
  const ei = calcEI(income);
  const cppEnhanced = Math.max(0, Math.min(income, CPP_2026.yampe) - CPP_2026.ympe) * CPP_2026.enhancedRate;
  const cppBase = cpp - cppEnhanced;
  const taxableIncome = income - cppEnhanced;
  const fedTaxGross = applyBrackets(taxableIncome, CA_FEDERAL_2026);
  const fedCreditBase = (CA_BPA_2026 + cppBase + ei) * CA_FEDERAL_2026[0].rate;
  let fedTax = Math.max(0, fedTaxGross - fedCreditBase);
  const prov = PROVINCIAL_2026[province];
  if (prov.federalAbatement) fedTax = fedTax * (1 - prov.federalAbatement);
  const provTaxGross = applyBrackets(taxableIncome, prov.brackets);
  const provCredit = (prov.bpa + cppBase + ei) * prov.brackets[0].rate;
  let provTax = Math.max(0, provTaxGross - provCredit);
  if (prov.surtax) provTax += calcOntarioSurtax(provTax, prov.surtax);
  const ohp = province === 'ON' ? calcOntarioHealthPremium(income) : 0;
  const totalTax = fedTax + provTax + cpp + ei + ohp;
  return { gross: income, takeHome: income - totalTax };
}

function calcStateTax(taxable, state, filingStatus) {
  const s = STATE_2026[state];
  if (!s || s.type === 'none') return 0;
  if (s.type === 'flat') {
    let t = taxable * s.rate;
    if (s.surcharge && taxable > s.surcharge.threshold) {
      t += (taxable - s.surcharge.threshold) * s.surcharge.rate;
    }
    return t;
  }
  let t = applyBrackets(taxable, s.brackets[filingStatus]);
  if (s.mentalHealthSurcharge && taxable > s.mentalHealthSurcharge.threshold) {
    t += (taxable - s.mentalHealthSurcharge.threshold) * s.mentalHealthSurcharge.rate;
  }
  return t;
}

function calculateUS({ income, state, filingStatus, kids }) {
  if (income <= 0) return { gross: 0, takeHome: 0 };
  const stdDed = US_STD_DED_2026[filingStatus];
  const taxable = Math.max(0, income - stdDed);
  const fedGross = applyBrackets(taxable, US_FEDERAL_2026[filingStatus]);
  const fedTax = Math.max(0, fedGross - kids * CTC_2026);
  const stateTax = calcStateTax(taxable, state, filingStatus);
  const ss = Math.min(income, FICA_2026.ssWageBase) * FICA_2026.ssRate;
  const medicare = income * FICA_2026.medicareRate;
  const addlThreshold = FICA_2026.addlMedicareThreshold[filingStatus];
  const addlMedicare = Math.max(0, income - addlThreshold) * FICA_2026.addlMedicareRate;
  const totalTax = fedTax + stateTax + ss + medicare + addlMedicare;
  return { gross: income, takeHome: income - totalTax };
}

function estimateHealthcareCost(filingStatus, kids) {
  const tier = filingStatus === 'single'
    ? HEALTHCARE_2026.single
    : kids > 0 ? HEALTHCARE_2026.mfj_with_kids : HEALTHCARE_2026.mfj_no_kids;
  return tier.premium + tier.oop;
}

function buildBreakeven({ caTakeHomeCAD, usTakeHomeCAD, movingCostsCAD, years = 5 }) {
  const pts = [];
  for (let y = 0; y <= years; y++) {
    pts.push({
      year: y,
      ca: caTakeHomeCAD * y,
      us: y === 0 ? -movingCostsCAD : usTakeHomeCAD * y - movingCostsCAD
    });
  }
  let breakeven = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i].us - pts[i].ca;
    const b = pts[i + 1].us - pts[i + 1].ca;
    if (a < 0 && b >= 0) {
      const t = -a / (b - a);
      breakeven = {
        year: pts[i].year + t,
        value: pts[i].ca + t * (pts[i + 1].ca - pts[i].ca)
      };
      break;
    }
  }
  return { pts, breakeven };
}

/* Node export shim — only fires under CommonJS (vitest, Node).
   In the browser this branch is dead and the declarations above are
   visible as globals to the inline JSX <script> block in index.html. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CA_FEDERAL_2026, CA_BPA_2026, PROVINCIAL_2026, CPP_2026, EI_2026,
    US_FEDERAL_2026, US_STD_DED_2026, CTC_2026, FICA_2026, STATE_2026,
    HEALTHCARE_2026, CHILDCARE_PROV, CHILDCARE_STATE_DEFAULT,
    applyBrackets, calcOntarioSurtax, calcOntarioHealthPremium,
    calcCPP, calcEI, calculateCanada,
    calcStateTax, calculateUS, estimateHealthcareCost, buildBreakeven
  };
}
