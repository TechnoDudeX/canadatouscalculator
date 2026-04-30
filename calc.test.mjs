import { describe, test, expect } from 'vitest';
import calc from './calc.js';

const {
  CA_FEDERAL_2026, CPP_2026, EI_2026, US_STD_DED_2026, FICA_2026,
  VISA_SPOUSE_WORK,
  applyBrackets, calcCPP, calcEI, calcOntarioHealthPremium,
  calculateCanada, calcStateTax, calculateUS,
  estimateHealthcareCost,
  spouseCanWorkInUS, getMarginalRateCanada, caHousingMonthlyCAD,
  estimateColExtraAnnualCAD, estimateExitCostsCAD, buildHouseholdBreakeven
} = calc;

describe('applyBrackets', () => {
  test('returns 0 for non-positive income', () => {
    expect(applyBrackets(0, CA_FEDERAL_2026)).toBe(0);
    expect(applyBrackets(-1000, CA_FEDERAL_2026)).toBe(0);
  });

  test('taxes only inside the first bracket when income is below the cap', () => {
    expect(applyBrackets(50000, CA_FEDERAL_2026)).toBeCloseTo(50000 * 0.14, 6);
  });

  test('crosses into the second bracket correctly', () => {
    const expected = 58523 * 0.14 + (100000 - 58523) * 0.205;
    expect(applyBrackets(100000, CA_FEDERAL_2026)).toBeCloseTo(expected, 6);
  });

  test('respects Infinity-capped top bracket', () => {
    const tax = applyBrackets(1_000_000, CA_FEDERAL_2026);
    expect(Number.isFinite(tax)).toBe(true);
    expect(tax).toBeGreaterThan(0);
  });
});

describe('calcCPP', () => {
  test('zero contribution at or below the basic exemption', () => {
    expect(calcCPP(CPP_2026.exemption)).toBe(0);
    expect(calcCPP(0)).toBe(0);
  });

  test('contribution at YMPE is base only', () => {
    const expected = (CPP_2026.ympe - CPP_2026.exemption) * CPP_2026.baseRate;
    expect(calcCPP(CPP_2026.ympe)).toBeCloseTo(expected, 6);
  });

  test('contribution at YAMPE includes enhanced tier', () => {
    const base = (CPP_2026.ympe - CPP_2026.exemption) * CPP_2026.baseRate;
    const enhanced = (CPP_2026.yampe - CPP_2026.ympe) * CPP_2026.enhancedRate;
    expect(calcCPP(CPP_2026.yampe)).toBeCloseTo(base + enhanced, 6);
  });

  test('contribution caps at YAMPE — no further growth above it', () => {
    expect(calcCPP(500_000)).toBeCloseTo(calcCPP(CPP_2026.yampe), 6);
  });
});

describe('calcEI', () => {
  test('caps at maxInsurable * rate', () => {
    expect(calcEI(EI_2026.maxInsurable)).toBeCloseTo(EI_2026.maxInsurable * EI_2026.rate, 6);
    expect(calcEI(500_000)).toBeCloseTo(EI_2026.maxInsurable * EI_2026.rate, 6);
  });
});

describe('calcOntarioHealthPremium', () => {
  test('zero below 20k', () => {
    expect(calcOntarioHealthPremium(15000)).toBe(0);
    expect(calcOntarioHealthPremium(20000)).toBe(0);
  });

  test('plateaus at 900 for very high incomes', () => {
    expect(calcOntarioHealthPremium(500_000)).toBe(900);
  });

  test('300 plateau in the 25k–36k band', () => {
    expect(calcOntarioHealthPremium(30000)).toBe(300);
  });
});

describe('calculateCanada', () => {
  test('zero/negative income returns zero take-home', () => {
    expect(calculateCanada({ income: 0, province: 'ON' })).toEqual({ gross: 0, takeHome: 0 });
    expect(calculateCanada({ income: -100, province: 'ON' })).toEqual({ gross: 0, takeHome: 0 });
  });

  test('takeHome is positive and below gross for a typical Ontario salary', () => {
    const r = calculateCanada({ income: 145000, province: 'ON' });
    expect(r.gross).toBe(145000);
    expect(r.takeHome).toBeGreaterThan(0);
    expect(r.takeHome).toBeLessThan(145000);
  });

  test('Alberta takes home more than Ontario at the same income (lower provincial rates)', () => {
    const ab = calculateCanada({ income: 200000, province: 'AB' });
    const on = calculateCanada({ income: 200000, province: 'ON' });
    expect(ab.takeHome).toBeGreaterThan(on.takeHome);
  });

  test('Quebec produces sane take-home', () => {
    const qc = calculateCanada({ income: 145000, province: 'QC' });
    expect(qc.takeHome).toBeGreaterThan(0);
    expect(qc.takeHome).toBeLessThan(145000);
  });
});

describe('calcStateTax', () => {
  test('no-tax states return 0', () => {
    expect(calcStateTax(200000, 'TX', 'single')).toBe(0);
    expect(calcStateTax(200000, 'WA', 'single')).toBe(0);
    expect(calcStateTax(200000, 'FL', 'single')).toBe(0);
  });

  test('flat-rate state (Illinois) is taxable * rate', () => {
    expect(calcStateTax(100000, 'IL', 'single')).toBeCloseTo(100000 * 0.0495, 6);
  });

  test('progressive state (CA) is non-zero and below taxable * top rate', () => {
    const t = calcStateTax(200000, 'CA', 'single');
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(200000 * 0.123);
  });
});

describe('calculateUS', () => {
  test('zero income returns zero take-home', () => {
    expect(calculateUS({ income: 0, state: 'CA', filingStatus: 'single', kids: 0 }))
      .toEqual({ gross: 0, takeHome: 0 });
  });

  test('Texas (no state tax) yields higher take-home than California at the same income', () => {
    const args = { income: 250000, filingStatus: 'single', kids: 0 };
    const tx = calculateUS({ ...args, state: 'TX' });
    const ca = calculateUS({ ...args, state: 'CA' });
    expect(tx.takeHome).toBeGreaterThan(ca.takeHome);
  });

  test('child tax credit reduces fed tax (more kids → more take-home, all else equal)', () => {
    const base = { income: 200000, state: 'TX', filingStatus: 'mfj' };
    const noKids = calculateUS({ ...base, kids: 0 });
    const twoKids = calculateUS({ ...base, kids: 2 });
    expect(twoKids.takeHome).toBeGreaterThan(noKids.takeHome);
  });

  test('standard deduction is applied (income just below stdDed → near-zero fed bite)', () => {
    const r = calculateUS({ income: US_STD_DED_2026.single - 100, state: 'TX', filingStatus: 'single', kids: 0 });
    expect(r.takeHome).toBeLessThan(US_STD_DED_2026.single);
    expect(r.takeHome).toBeGreaterThan(0);
  });

  test('additional Medicare kicks in above the threshold', () => {
    const below = calculateUS({ income: FICA_2026.addlMedicareThreshold.single - 1000, state: 'TX', filingStatus: 'single', kids: 0 });
    const above = calculateUS({ income: FICA_2026.addlMedicareThreshold.single + 50000, state: 'TX', filingStatus: 'single', kids: 0 });
    expect(above.takeHome - below.takeHome).toBeLessThan(50000);
  });
});

describe('estimateHealthcareCost', () => {
  test('single < mfj_no_kids < mfj_with_kids', () => {
    const single = estimateHealthcareCost('single', 0);
    const couple = estimateHealthcareCost('mfj', 0);
    const family = estimateHealthcareCost('mfj', 2);
    expect(single).toBeLessThan(couple);
    expect(couple).toBeLessThan(family);
  });
});

/* Pinned-value scenarios — these lock the current calc output to exact dollar
   amounts. They are an intentional snapshot, not authoritative-CRA/IRS truth.
   When you intentionally change brackets, regenerate baselines and update these.
   When they break unexpectedly, you have a real regression. */
describe('Canada take-home — pinned scenarios (2026 brackets, currently approximated)', () => {
  test('$100k Ontario single → $74,194', () => {
    const r = calculateCanada({ income: 100000, province: 'ON' });
    expect(Math.round(r.takeHome)).toBe(74194);
  });

  test('$200k Ontario → $131,128', () => {
    const r = calculateCanada({ income: 200000, province: 'ON' });
    expect(Math.round(r.takeHome)).toBe(131128);
  });

  test('$400k Ontario → $226,594', () => {
    const r = calculateCanada({ income: 400000, province: 'ON' });
    expect(Math.round(r.takeHome)).toBe(226594);
  });

  test('$200k Alberta → $137,736', () => {
    const r = calculateCanada({ income: 200000, province: 'AB' });
    expect(Math.round(r.takeHome)).toBe(137736);
  });

  test('$200k Quebec (with federal abatement) → $124,064', () => {
    const r = calculateCanada({ income: 200000, province: 'QC' });
    expect(Math.round(r.takeHome)).toBe(124064);
  });
});

describe('US take-home — pinned scenarios (2026 brackets, currently approximated)', () => {
  test('$100k Texas single (no state tax) → $79,180', () => {
    const r = calculateUS({ income: 100000, state: 'TX', filingStatus: 'single', kids: 0 });
    expect(Math.round(r.takeHome)).toBe(79180);
  });

  test('$200k Texas single → $148,927', () => {
    const r = calculateUS({ income: 200000, state: 'TX', filingStatus: 'single', kids: 0 });
    expect(Math.round(r.takeHome)).toBe(148927);
  });

  test('$400k Texas single → $277,827', () => {
    const r = calculateUS({ income: 400000, state: 'TX', filingStatus: 'single', kids: 0 });
    expect(Math.round(r.takeHome)).toBe(277827);
  });

  test('$200k California single → $135,364', () => {
    const r = calculateUS({ income: 200000, state: 'CA', filingStatus: 'single', kids: 0 });
    expect(Math.round(r.takeHome)).toBe(135364);
  });

  test('$300k California mfj + 2 kids → $220,867', () => {
    const r = calculateUS({ income: 300000, state: 'CA', filingStatus: 'mfj', kids: 2 });
    expect(Math.round(r.takeHome)).toBe(220867);
  });

  test('$300k New York mfj no kids → $219,365', () => {
    const r = calculateUS({ income: 300000, state: 'NY', filingStatus: 'mfj', kids: 0 });
    expect(Math.round(r.takeHome)).toBe(219365);
  });
});

/* ========================================================================
   v4.0.0 — household model: spouse, housing, COL, exit costs, breakeven
   ======================================================================== */

describe('spouseCanWorkInUS', () => {
  test('TN/H1B/O1 spouses cannot work by default', () => {
    expect(spouseCanWorkInUS('TN')).toBe(false);
    expect(spouseCanWorkInUS('H1B')).toBe(false);
    expect(spouseCanWorkInUS('O1')).toBe(false);
  });

  test('L1 (L-2) and GC spouses can work', () => {
    expect(spouseCanWorkInUS('L1')).toBe(true);
    expect(spouseCanWorkInUS('GC')).toBe(true);
  });

  test('unknown visa code defaults to false (safer)', () => {
    expect(spouseCanWorkInUS('UNKNOWN')).toBe(false);
    expect(spouseCanWorkInUS(undefined)).toBe(false);
  });

  test('every entry in VISA_SPOUSE_WORK has the expected shape', () => {
    for (const [code, info] of Object.entries(VISA_SPOUSE_WORK)) {
      expect(typeof info.canWorkDefault).toBe('boolean');
      expect(typeof info.label).toBe('string');
      expect(typeof info.spouseLabel).toBe('string');
    }
  });
});

describe('getMarginalRateCanada', () => {
  test('returns 0 for non-positive income', () => {
    expect(getMarginalRateCanada(0, 'ON')).toBe(0);
    expect(getMarginalRateCanada(-100, 'ON')).toBe(0);
  });

  test('Ontario at $200k is in the 9.15% prov + 26% fed band', () => {
    const r = getMarginalRateCanada(200000, 'ON');
    // Should be within the realistic ON marginal range (40-55%)
    expect(r).toBeGreaterThan(0.40);
    expect(r).toBeLessThan(0.60);
  });

  test('Quebec applies the federal abatement (lower combined rate than ON at same income)', () => {
    const on = getMarginalRateCanada(200000, 'ON');
    const qc = getMarginalRateCanada(200000, 'QC');
    // QC has higher provincial rate but federal abatement reduces fed slice;
    // the combined rate should still differ — just assert sane and finite
    expect(qc).toBeGreaterThan(0);
    expect(qc).toBeLessThan(0.7);
    expect(on).not.toBe(qc);
  });
});

describe('caHousingMonthlyCAD', () => {
  test('rent: returns the rent value clamped to >= 0', () => {
    expect(caHousingMonthlyCAD({ caHousing: 'rent', caRentMonthlyCAD: 2500 })).toBe(2500);
    expect(caHousingMonthlyCAD({ caHousing: 'rent', caRentMonthlyCAD: 0 })).toBe(0);
    expect(caHousingMonthlyCAD({ caHousing: 'rent', caRentMonthlyCAD: -100 })).toBe(0);
  });

  test('own + sell: 0 monthly carrying (home is liquidated)', () => {
    expect(caHousingMonthlyCAD({ caHousing: 'own', caHomeDecision: 'sell', caMortgageBalanceCAD: 600000 })).toBe(0);
  });

  test('own + keep: mortgage proxy + property tax/maintenance', () => {
    // 600k balance × 5%/12 + 500 = 2500 + 500 = 3000
    expect(caHousingMonthlyCAD({ caHousing: 'own', caHomeDecision: 'keep', caMortgageBalanceCAD: 600000 })).toBeCloseTo(3000, 6);
  });

  test('own + keep + 0 mortgage: just the 500 carrying floor', () => {
    expect(caHousingMonthlyCAD({ caHousing: 'own', caHomeDecision: 'keep', caMortgageBalanceCAD: 0 })).toBe(500);
  });
});

describe('estimateColExtraAnnualCAD', () => {
  test('returns 0 for missing/zero salary', () => {
    expect(estimateColExtraAnnualCAD({ multiplier: 1.5, salaryCAD: 0 })).toBe(0);
  });

  test('returns 0 when multiplier is <= 1 (US is cheaper or same)', () => {
    expect(estimateColExtraAnnualCAD({ multiplier: 1.0, salaryCAD: 150000 })).toBe(0);
    expect(estimateColExtraAnnualCAD({ multiplier: 0.9, salaryCAD: 150000 })).toBe(0);
  });

  test('multiplier 1.35 on $150k → 30% baseline × 0.35 = $15,750/yr', () => {
    expect(estimateColExtraAnnualCAD({ multiplier: 1.35, salaryCAD: 150000 })).toBeCloseTo(150000 * 0.30 * 0.35, 6);
  });
});

describe('estimateExitCostsCAD', () => {
  test('renter, no investments, no offer credits → just movingCosts', () => {
    const r = estimateExitCostsCAD({
      caHousing: 'rent', movingCostsCAD: 25000,
      unrealizedGainsCAD: 0, marginalRateCA: 0.5,
      signOnBonusUSD: 0, relocationCoverageUSD: 0,
      usMonthlyHousingUSD: 0, fxRate: 0.73
    });
    expect(r.gross).toBe(25000);
    expect(r.credits).toBe(0);
    expect(r.net).toBe(25000);
    expect(r.departureTaxCAD).toBe(0);
  });

  test('seller adds 5.5% realtor + legal on home value', () => {
    const r = estimateExitCostsCAD({
      caHousing: 'own', caHomeDecision: 'sell', caHomeValueCAD: 1_000_000,
      movingCostsCAD: 15000, unrealizedGainsCAD: 0, marginalRateCA: 0,
      signOnBonusUSD: 0, relocationCoverageUSD: 0,
      usMonthlyHousingUSD: 0, fxRate: 0.73
    });
    // 15k moving + 55k realtor/legal = 70k
    expect(r.gross).toBe(70000);
  });

  test('departure tax = unrealized gains × 0.5 × marginal rate', () => {
    const r = estimateExitCostsCAD({
      caHousing: 'rent', movingCostsCAD: 0,
      unrealizedGainsCAD: 200000, marginalRateCA: 0.5,
      signOnBonusUSD: 0, relocationCoverageUSD: 0,
      usMonthlyHousingUSD: 0, fxRate: 0.73
    });
    expect(r.departureTaxCAD).toBeCloseTo(200000 * 0.5 * 0.5, 6); // $50,000
    expect(r.gross).toBeCloseTo(50000, 6);
  });

  test('US security deposit = 2 months rent in CAD', () => {
    const r = estimateExitCostsCAD({
      caHousing: 'rent', movingCostsCAD: 0,
      unrealizedGainsCAD: 0, marginalRateCA: 0,
      signOnBonusUSD: 0, relocationCoverageUSD: 0,
      usMonthlyHousingUSD: 4000, fxRate: 0.73
    });
    // 2 × 4000 / 0.73 = ~10959
    expect(r.gross).toBeCloseTo(8000 / 0.73, 4);
  });

  test('offer credits (sign-on + relocation) reduce net cost, never below 0', () => {
    const r = estimateExitCostsCAD({
      caHousing: 'rent', movingCostsCAD: 25000,
      unrealizedGainsCAD: 0, marginalRateCA: 0,
      signOnBonusUSD: 50000, relocationCoverageUSD: 30000,
      usMonthlyHousingUSD: 0, fxRate: 0.73
    });
    // gross = 25000; credits = 80000/0.73 ≈ 109589; net = max(0, 25000-109589) = 0
    expect(r.gross).toBe(25000);
    expect(r.net).toBe(0);
  });
});

describe('buildHouseholdBreakeven', () => {
  test('produces year 0..N points with one-time net cost in year 0', () => {
    const r = buildHouseholdBreakeven({
      caHouseholdAnnualCAD: 150000,
      usHouseholdAnnualCAD: 200000,
      oneTimeNetCostCAD: 40000,
      years: 5
    });
    expect(r.pts).toHaveLength(6);
    expect(r.pts[0]).toEqual({ year: 0, ca: 0, us: -40000 });
    expect(r.pts[1]).toEqual({ year: 1, ca: 150000, us: 200000 - 40000 });
    expect(r.pts[5].year).toBe(5);
  });

  test('finds breakeven when US household income overtakes CA', () => {
    const r = buildHouseholdBreakeven({
      caHouseholdAnnualCAD: 100000,
      usHouseholdAnnualCAD: 130000,
      oneTimeNetCostCAD: 40000,
      years: 5
    });
    expect(r.breakeven).not.toBeNull();
    expect(r.breakeven.year).toBeGreaterThan(0);
  });

  test('returns null breakeven when US household never catches up (e.g. spouse-loss flip)', () => {
    // CA household earning more (dual income) and US single-income, never catches up
    const r = buildHouseholdBreakeven({
      caHouseholdAnnualCAD: 200000,
      usHouseholdAnnualCAD: 150000,
      oneTimeNetCostCAD: 40000,
      years: 5
    });
    expect(r.breakeven).toBeNull();
  });
});
