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
const CA_EMPLOYMENT_AMOUNT_2026 = 1433;

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

/* Visa work-authorization for the trailing spouse. The cross-border honesty
   is that "work auth" is a giant mess; these are realistic *defaults*, not
   legal advice. UI lets the user override.

   - TN: TD spouse — explicitly may not work in the US.
   - H1B: H4 spouse may apply for an EAD only after the H1B holder hits I-140
     approval. Default false; user overrides if they have the EAD.
   - L1: L2 spouse has automatic work auth (post-2022 USCIS rule).
   - O1: O3 spouse may not work.
   - GC: principal is a green-card holder; spouse holds GC too and works freely. */
const VISA_SPOUSE_WORK = {
  TN:  { canWorkDefault: false, label: 'TN (Canadian professional)', spouseLabel: 'TD' },
  L1:  { canWorkDefault: true,  label: 'L-1 (intra-company transfer)', spouseLabel: 'L-2' },
  H1B: { canWorkDefault: false, label: 'H-1B (specialty occupation)', spouseLabel: 'H-4' },
  O1:  { canWorkDefault: false, label: 'O-1 (extraordinary ability)', spouseLabel: 'O-3' },
  GC:  { canWorkDefault: true,  label: 'Green card / dual intent', spouseLabel: 'Spouse GC' }
};

/* Default monthly rent in CAD, ballpark for a 2BR in the major metro of each
   province. User-editable. Reality varies wildly. */
const CA_RENT_DEFAULT_MONTHLY_CAD = { ON: 2800, BC: 3000, AB: 1900, QC: 1800 };

/* Default monthly housing in USD per state. Anchored to the dominant tech metro
   (CA→Bay Area, NY→NYC, WA→Seattle, TX→Austin, FL→Miami, MA→Boston, IL→Chicago,
   CO→Denver). Wildly state-internal variance — user-editable. */
const US_HOUSING_DEFAULT_MONTHLY_USD = {
  CA: 4200, NY: 3800, WA: 3000, TX: 2100, FL: 2600,
  MA: 3400, IL: 2400, CO: 2700
};

/* Cost-of-living multiplier vs. Toronto baseline, EXCLUDING housing, healthcare,
   and childcare (those are modeled explicitly). Covers groceries, transport,
   dining out, entertainment. Rough Numbeo-style ratios. User-editable. */
const US_COL_MULTIPLIER_DEFAULT = {
  CA: 1.35, NY: 1.35, WA: 1.20, TX: 1.05, FL: 1.10,
  MA: 1.20, IL: 1.10, CO: 1.10
};

/* Metro-level housing defaults (USD/mo, 2BR equivalent) keyed by state then city.
   Anchored to real 2025-2026 rental market data. Wildly varies even within a metro —
   these are a better starting point than the state average but still estimates. */
const US_HOUSING_METRO_USD = {
  CA: { 'Bay Area': 5500, 'Los Angeles': 3500, 'San Diego': 3200, 'Sacramento': 2200 },
  NY: { 'NYC': 4500, 'Buffalo / Upstate': 1800 },
  WA: { 'Seattle': 3200, 'Spokane': 1500 },
  TX: { 'Austin': 2200, 'Dallas': 1900, 'Houston': 1800, 'San Antonio': 1600 },
  FL: { 'Miami': 3000, 'Tampa': 2200, 'Orlando': 2000, 'Jacksonville': 1700 },
  MA: { 'Boston': 3800, 'Worcester': 2000 },
  IL: { 'Chicago': 2600, 'Other Illinois': 1500 },
  CO: { 'Denver': 2800, 'Boulder': 2900, 'Colorado Springs': 1800 }
};

/* Metro-level COL multipliers vs. Toronto baseline (ex-housing/healthcare/childcare). */
const US_COL_METRO_MULTIPLIER = {
  CA: { 'Bay Area': 1.45, 'Los Angeles': 1.35, 'San Diego': 1.30, 'Sacramento': 1.15 },
  NY: { 'NYC': 1.45, 'Buffalo / Upstate': 1.05 },
  WA: { 'Seattle': 1.25, 'Spokane': 1.00 },
  TX: { 'Austin': 1.10, 'Dallas': 1.05, 'Houston': 1.05, 'San Antonio': 1.00 },
  FL: { 'Miami': 1.20, 'Tampa': 1.10, 'Orlando': 1.05, 'Jacksonville': 1.00 },
  MA: { 'Boston': 1.25, 'Worcester': 1.05 },
  IL: { 'Chicago': 1.15, 'Other Illinois': 0.95 },
  CO: { 'Denver': 1.15, 'Boulder': 1.20, 'Colorado Springs': 1.05 }
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
  const fedCreditBase = (CA_BPA_2026 + cppBase + ei + Math.min(income, CA_EMPLOYMENT_AMOUNT_2026)) * CA_FEDERAL_2026[0].rate;
  let fedTax = Math.max(0, fedTaxGross - fedCreditBase);
  const prov = PROVINCIAL_2026[province];
  if (prov.federalAbatement) fedTax = fedTax * (1 - prov.federalAbatement);
  const provTaxGross = applyBrackets(taxableIncome, prov.brackets);
  const provCredit = (prov.bpa + cppBase + ei) * prov.brackets[0].rate;
  let provTax = Math.max(0, provTaxGross - provCredit);
  if (prov.surtax) provTax += calcOntarioSurtax(provTax, prov.surtax);
  const ohp = province === 'ON' ? calcOntarioHealthPremium(income) : 0;
  const totalTax = fedTax + provTax + cpp + ei + ohp;
  return {
    gross: income,
    takeHome: income - totalTax,
    breakdown: { fedTax, provTax, cpp, ei, ohp, totalTax, province }
  };
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
  const ctc = kids * CTC_2026;
  const fedTax = Math.max(0, fedGross - ctc);
  const stateTax = calcStateTax(taxable, state, filingStatus);
  const ss = Math.min(income, FICA_2026.ssWageBase) * FICA_2026.ssRate;
  const medicare = income * FICA_2026.medicareRate;
  const addlThreshold = FICA_2026.addlMedicareThreshold[filingStatus];
  const addlMedicare = Math.max(0, income - addlThreshold) * FICA_2026.addlMedicareRate;
  const totalTax = fedTax + stateTax + ss + medicare + addlMedicare;
  return {
    gross: income,
    takeHome: income - totalTax,
    breakdown: { stdDed, taxable, fedGross, ctc, fedTax, stateTax, ss, medicare, addlMedicare, totalTax, state, filingStatus }
  };
}

function estimateHealthcareCost(filingStatus, kids) {
  const tier = filingStatus === 'single'
    ? HEALTHCARE_2026.single
    : kids > 0 ? HEALTHCARE_2026.mfj_with_kids : HEALTHCARE_2026.mfj_no_kids;
  return tier.premium + tier.oop;
}

/* ========================================================================
   v4.0.0 ADDITIONS — household-level model

   These wrap calculateCanada/calculateUS with the realities the original
   single-earner take-home model ignored: spouse work-auth + income shock,
   housing carrying costs on both sides, cost-of-living delta, and the full
   exit-cost stack (departure tax + realtor + offer credits).
   ======================================================================== */

/* Lookup helper: given a visa code from VISA_SPOUSE_WORK, can the spouse
   legally work? Returns false for unknown codes (safer default). */
function spouseCanWorkInUS(visaType) {
  return VISA_SPOUSE_WORK[visaType]?.canWorkDefault ?? false;
}

/* Combined federal + provincial marginal rate at the income level provided.
   Used for departure-tax estimation (capital gains × 50% inclusion × this).
   Includes Ontario surtax tier 2 if the user is in ON above the threshold.
   Quebec abatement reduces the federal slice. */
function getMarginalRateCanada(income, province) {
  if (!income || income <= 0) return 0;
  const fed = CA_FEDERAL_2026.find(b => income <= b.upTo)?.rate ?? CA_FEDERAL_2026[CA_FEDERAL_2026.length - 1].rate;
  const prov = PROVINCIAL_2026[province];
  const provRate = prov.brackets.find(b => income <= b.upTo)?.rate ?? prov.brackets[prov.brackets.length - 1].rate;
  let fedEffective = fed;
  if (prov.federalAbatement) fedEffective = fed * (1 - prov.federalAbatement);
  let combined = fedEffective + provRate;
  if (province === 'ON' && income > 220000) combined += provRate * 0.36; // tier-2 surtax approximation
  return combined;
}

/* Combined federal + state + Medicare marginal rate at the income level provided.
   Used for estimating the annual US tax burden on TFSA growth (treated as
   ordinary income since the IRS doesn't recognize the shelter). Excludes
   Social Security (capped) since TFSA growth wouldn't be wage income. */
function getMarginalRateUS(income, state, filingStatus) {
  if (!income || income <= 0) return 0;
  const fedBrackets = US_FEDERAL_2026[filingStatus] || US_FEDERAL_2026.single;
  const fed = fedBrackets.find(b => income <= b.upTo)?.rate ?? fedBrackets[fedBrackets.length - 1].rate;
  const s = STATE_2026[state];
  let stateRate = 0;
  if (s) {
    if (s.type === 'flat') {
      stateRate = s.rate;
      if (s.surcharge && income > s.surcharge.threshold) stateRate += s.surcharge.rate;
    } else if (s.type === 'progressive') {
      const sb = s.brackets[filingStatus] || s.brackets.single;
      stateRate = sb.find(b => income <= b.upTo)?.rate ?? sb[sb.length - 1].rate;
      if (s.mentalHealthSurcharge && income > s.mentalHealthSurcharge.threshold) stateRate += s.mentalHealthSurcharge.rate;
    }
  }
  const medicare = FICA_2026.medicareRate;
  const addlThreshold = FICA_2026.addlMedicareThreshold[filingStatus] ?? FICA_2026.addlMedicareThreshold.single;
  const addlMedicare = income > addlThreshold ? FICA_2026.addlMedicareRate : 0;
  return fed + stateRate + medicare + addlMedicare;
}

/* Annual carrying cost of keeping a TFSA after becoming US-resident.
   Two components:
   - US tax on growth: balance × assumed_return × marginal_us_rate
     The IRS doesn't recognize the shelter, so growth is ordinary income.
   - PFIC compliance: flat ~$4k/yr for the CPA work to file Form 8621
     on each ETF inside the TFSA.
   Returns 0 if balance is 0 or non-positive — assumed return is 5%/yr. */
function estimateTfsaCarryCostCAD({ tfsaBalanceCAD, marginalRateUS }) {
  if (!tfsaBalanceCAD || tfsaBalanceCAD <= 0) return 0;
  const assumedReturn = 0.05;
  const usTaxOnGrowth = tfsaBalanceCAD * assumedReturn * (marginalRateUS || 0.32);
  const pficCompliance = 4000;
  return usTaxOnGrowth + pficCompliance;
}

/* Monthly carrying cost in CAD for the household's Canadian shelter.
   - rent: just the monthly rent
   - own + sell: 0 (the home is liquidated — exit costs are one-time)
   - own + keep: rough mortgage payment proxy (5%/12 of balance, principal
     ignored) + $500/mo for property tax + maintenance. Hand-wavy on purpose;
     the user can override the rent field if they want a precise number. */
function caHousingMonthlyCAD({ caHousing, caRentMonthlyCAD, caMortgageBalanceCAD, caHomeDecision }) {
  if (caHousing === 'rent') return Math.max(0, caRentMonthlyCAD || 0);
  if (caHousing === 'own' && caHomeDecision === 'sell') return 0;
  if (caHousing === 'own' && caHomeDecision === 'keep') {
    const mortgage = (caMortgageBalanceCAD || 0) * 0.05 / 12;
    return mortgage + 500;
  }
  return 0;
}

/* Annual extra spend in CAD on the US side from cost-of-living above Canadian
   baseline, EXCLUDING housing/healthcare/childcare which are modeled directly.
   Heuristic: ~30% of CAD take-home is "discretionary lifestyle spend"
   (groceries, transport, dining, entertainment); US side multiplies that.
   Returns 0 if multiplier <= 1 (US is cheaper or equal — rare but possible). */
function estimateColExtraAnnualCAD({ multiplier, salaryCAD }) {
  if (!salaryCAD || salaryCAD <= 0) return 0;
  if (!multiplier || multiplier <= 1) return 0;
  const baseline = salaryCAD * 0.30;
  return baseline * (multiplier - 1);
}

/* All one-time costs of leaving Canada, netted against employer credits.
   Returns { gross, credits, net } where net is what hits year 0 of the
   breakeven projection.

   Components:
   - movingCostsCAD: physical move + immigration legal etc (user input)
   - realtor + legal fee on home sale (5.5% of value if selling)
   - departure tax: deemed disposition × 50% inclusion × marginal rate
   - US security deposit: 2 months of US rent (if monthly housing > 0)
   Credits:
   - signOnBonusUSD + relocationCoverageUSD (employer side) */
function estimateExitCostsCAD({
  caHousing, caHomeValueCAD, caHomeDecision,
  unrealizedGainsCAD, marginalRateCA,
  signOnBonusUSD, relocationCoverageUSD,
  movingCostsCAD, usMonthlyHousingUSD, fxRate
}) {
  let gross = movingCostsCAD || 0;
  if (caHousing === 'own' && caHomeDecision === 'sell') {
    gross += (caHomeValueCAD || 0) * 0.055;
  }
  const departureTaxCAD = (unrealizedGainsCAD || 0) * 0.5 * (marginalRateCA || 0);
  gross += departureTaxCAD;
  const securityDepositUSD = (usMonthlyHousingUSD || 0) * 2;
  gross += securityDepositUSD / (fxRate || 0.73);
  const creditsUSD = (signOnBonusUSD || 0) + (relocationCoverageUSD || 0);
  const credits = creditsUSD / (fxRate || 0.73);
  const net = Math.max(0, gross - credits);
  return { gross, credits, net, departureTaxCAD };
}

/* Household-level breakeven: same shape as buildBreakeven, but operates on
   pre-aggregated household annual cash-flow numbers and supports an arbitrary
   one-time net cost in year 0 (instead of just movingCosts). */
function buildHouseholdBreakeven({ caHouseholdAnnualCAD, usHouseholdAnnualCAD, oneTimeNetCostCAD, years = 5 }) {
  const pts = [];
  for (let y = 0; y <= years; y++) {
    pts.push({
      year: y,
      ca: caHouseholdAnnualCAD * y,
      us: y === 0 ? -oneTimeNetCostCAD : usHouseholdAnnualCAD * y - oneTimeNetCostCAD
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
    CA_FEDERAL_2026, CA_BPA_2026, CA_EMPLOYMENT_AMOUNT_2026, PROVINCIAL_2026, CPP_2026, EI_2026,
    US_FEDERAL_2026, US_STD_DED_2026, CTC_2026, FICA_2026, STATE_2026,
    HEALTHCARE_2026, CHILDCARE_PROV, CHILDCARE_STATE_DEFAULT,
    VISA_SPOUSE_WORK, CA_RENT_DEFAULT_MONTHLY_CAD,
    US_HOUSING_DEFAULT_MONTHLY_USD, US_COL_MULTIPLIER_DEFAULT,
    US_HOUSING_METRO_USD, US_COL_METRO_MULTIPLIER,
    applyBrackets, calcOntarioSurtax, calcOntarioHealthPremium,
    calcCPP, calcEI, calculateCanada,
    calcStateTax, calculateUS, estimateHealthcareCost,
    spouseCanWorkInUS, getMarginalRateCanada, getMarginalRateUS, caHousingMonthlyCAD,
    estimateColExtraAnnualCAD, estimateExitCostsCAD, estimateTfsaCarryCostCAD,
    buildHouseholdBreakeven
  };
}
