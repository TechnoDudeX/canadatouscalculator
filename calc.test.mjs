import { describe, test, expect } from 'vitest';
import calc from './calc.js';

const {
  CA_FEDERAL_2026, CPP_2026, EI_2026, US_STD_DED_2026, FICA_2026,
  applyBrackets, calcCPP, calcEI, calcOntarioHealthPremium,
  calculateCanada, calcStateTax, calculateUS,
  estimateHealthcareCost, buildBreakeven
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
  test('$100k Ontario single → $73,993', () => {
    const r = calculateCanada({ income: 100000, province: 'ON' });
    expect(Math.round(r.takeHome)).toBe(73993);
  });

  test('$200k Ontario → $130,927', () => {
    const r = calculateCanada({ income: 200000, province: 'ON' });
    expect(Math.round(r.takeHome)).toBe(130927);
  });

  test('$400k Ontario → $226,393', () => {
    const r = calculateCanada({ income: 400000, province: 'ON' });
    expect(Math.round(r.takeHome)).toBe(226393);
  });

  test('$200k Alberta → $137,535', () => {
    const r = calculateCanada({ income: 200000, province: 'AB' });
    expect(Math.round(r.takeHome)).toBe(137535);
  });

  test('$200k Quebec (with federal abatement) → $123,897', () => {
    const r = calculateCanada({ income: 200000, province: 'QC' });
    expect(Math.round(r.takeHome)).toBe(123897);
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

describe('buildBreakeven', () => {
  test('produces year 0..N points with the right shape', () => {
    const r = buildBreakeven({ caTakeHomeCAD: 100000, usTakeHomeCAD: 130000, movingCostsCAD: 25000, years: 5 });
    expect(r.pts).toHaveLength(6);
    expect(r.pts[0]).toEqual({ year: 0, ca: 0, us: -25000 });
    expect(r.pts[5].year).toBe(5);
  });

  test('finds breakeven year when US eventually overtakes CA', () => {
    const r = buildBreakeven({ caTakeHomeCAD: 100000, usTakeHomeCAD: 130000, movingCostsCAD: 25000, years: 5 });
    expect(r.breakeven).not.toBeNull();
    expect(r.breakeven.year).toBeGreaterThan(0);
    expect(r.breakeven.year).toBeLessThanOrEqual(5);
  });

  test('returns null breakeven when US never catches up', () => {
    const r = buildBreakeven({ caTakeHomeCAD: 150000, usTakeHomeCAD: 100000, movingCostsCAD: 25000, years: 5 });
    expect(r.breakeven).toBeNull();
  });
});
