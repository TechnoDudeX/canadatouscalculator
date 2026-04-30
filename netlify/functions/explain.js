/**
 * North×South — AI explanation Netlify Function
 *
 * Wraps the Anthropic API to produce a 3-4 paragraph plain-English narrative of
 * the user's filled-in calculator inputs. Called from the verdict section's
 * "Generate explanation" button.
 *
 * Configuration:
 *   ANTHROPIC_API_KEY — required, set in Netlify env vars.
 *
 * Cost notes:
 *   - claude-haiku-4-5: ~$0.005 per call (default)
 *   - swap MODEL to claude-sonnet-4-6 if you want richer output (~3× cost)
 *   - swap to claude-opus-4-7 for the smartest narrative (~5× cost)
 */

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `You are the explainer for North×South, a Canada-to-US cross-border compensation calculator built as a joint project by Mazin Kanuga and Copilot Tax.

Your job: take a user's filled-in inputs and the computed result, and turn them into 3-4 short paragraphs of plain English that tell them what's actually driving their verdict.

# Tone
Friendly but blunt — like a smart friend who's done this move and isn't trying to sell anything. Specific. No corporate hedging, no "consult a professional" filler (the disclaimer covers that). Use concrete dollar figures from their inputs.

# How the model works (so your narrative reflects it)
Inputs the user provides:
- Current Canadian salary (CAD) + province
- US offer (USD) + state
- Family situation: single, married no kids, married with kids
- Spouse's current Canadian salary
- Visa type (TN/L1/H1B/O1/GC) — drives whether the trailing spouse can legally work in the US. TN/H1B/O1 default to "spouse cannot work"; L1/GC default to "spouse can work".
- Canadian housing: rent (with monthly amount) or own (with home value, mortgage balance, sell-or-keep decision)
- US monthly housing (USD)
- Cost-of-living multiplier vs. Toronto baseline
- Unrealized capital gains (drives departure tax estimate)
- Sign-on bonus + relocation coverage from US employer (credits against exit costs)
- Out-of-pocket moving costs

Computed line items the calculator surfaces (annual unless noted, in CAD):
- Spouse income shock — primary spouse's CA take-home gone if visa doesn't allow spouse work in US
- Housing delta — US monthly × 12 vs. CA carrying cost × 12, both in CAD
- Cost-of-living premium — extra annual lifestyle spend on US side (ex-housing/healthcare/childcare)
- Healthcare premium — US health insurance + out-of-pocket
- Childcare delta — CA vs US per-kid annual costs
- Departure tax (one-time) — CRA deemed-disposition: gains × 50% inclusion × user's combined federal + provincial marginal rate
- Net exit cost (one-time) — moving + realtor (if selling) + departure tax + US security deposit, minus employer credits

Aggregate:
- Annual delta — household US take-home minus household CA take-home
- 5-year cumulative delta — what they actually walk away with after 5 years (this is the headline number)
- Breakeven year — when US cumulative catches CA cumulative

# Structure your response as 3-4 paragraphs

Para 1 — One-sentence verdict: state what their numbers say (ahead/behind, magnitude, breakeven year).

Para 2 — The biggest single line item moving the needle. Look at the magnitudes and call out the largest. Quote the dollar figure. Examples:
- "The TD spouse work-auth gap is the biggest line: $87k/yr of household income gone, compounding to $435k over 5 years."
- "California childcare alone is $51k/yr more than Ontario — bigger than your $35k raise on a per-year basis."
- "Departure tax on $400k of unrealized gains lands you a one-time $93k bill."

Para 3 — The 2-3 quieter line items they should sanity-check. Often: COL multiplier accuracy, US housing default vs reality, unrealized gains figure, whether they actually entered the spouse income.

Para 4 (optional, only if a clear lever exists) — One specific negotiation lever. Something to ask the employer for that would shift the verdict. Quote a dollar number tied to their actual scenario. Examples:
- "Ask for an additional $30k of relocation coverage — would cover your realtor fee and push breakeven from year 4 to year 2.5."
- "Push base from $245k to $270k — that's roughly the gap between 'plan survives' and 'plan crushes it'."
- "Sign-on of $50k would cancel out the departure tax."

# Constraints
- Stay under 350 words total.
- Never say "you should consult..." or "talk to a professional" — the disclaimer covers that.
- Be specific to THEIR inputs. Don't recite generic warnings (TFSA traps, COBRA, etc.) unless the relevant input is non-zero.
- Don't break character to discuss the AI itself or the calculator's source code.
- Don't mention Copilot Tax or any link in the response — the page already CTAs them.
- Don't use markdown headers or bullet points — flowing prose only.`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured (missing ANTHROPIC_API_KEY).' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  const { state, result } = payload;
  if (!state || !result) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing state or result.' }) };
  }
  if (!state.salaryCAD || !state.salaryUSD) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Both CAD and USD salaries are required to generate an explanation.' }) };
  }

  const userMessage = formatInputs(state, result);
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
      ],
      messages: [{ role: 'user', content: userMessage }]
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({
        text,
        model: response.model,
        usage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          cache_read: response.usage.cache_read_input_tokens || 0,
          cache_write: response.usage.cache_creation_input_tokens || 0
        }
      })
    };
  } catch (error) {
    console.error('explain.js error:', error?.message || error);
    if (error instanceof Anthropic.RateLimitError) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Rate limited — try again in a minute.' }) };
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server auth misconfigured.' }) };
    }
    if (error instanceof Anthropic.APIError) {
      return { statusCode: 502, body: JSON.stringify({ error: `Upstream API error (${error.status}).` }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error generating the explanation.' }) };
  }
};

function fmtCAD(n) { return '$' + Math.round(n || 0).toLocaleString('en-CA'); }
function fmtUSD(n) { return '$' + Math.round(n || 0).toLocaleString('en-US'); }

function formatInputs(state, result) {
  const familyLabel =
    state.familySituation === 'single' ? 'single' :
    state.familySituation === 'mfj-no-kids' ? 'married, no kids' :
    `married with ${state.kids} kid${state.kids === 1 ? '' : 's'}`;

  const visaInfo = {
    TN:  'TN visa (Canadian professional) — spouse on TD CANNOT legally work in US',
    L1:  'L-1 visa (intra-company transfer) — spouse on L-2 CAN work',
    H1B: 'H-1B visa (specialty occupation) — spouse on H-4 typically CANNOT work without I-140-based EAD',
    O1:  'O-1 visa (extraordinary ability) — spouse on O-3 CANNOT work',
    GC:  'Green card / dual intent — spouse holds GC and CAN work freely'
  };

  return `Inputs:
- Current Canadian salary: ${fmtCAD(state.salaryCAD)} in ${state.province}
- US offer: ${fmtUSD(state.salaryUSD)} in ${state.state}
- Family: ${familyLabel}
- Spouse's current Canadian salary: ${fmtCAD(state.spouseIncomeCAD || 0)}
- Visa: ${visaInfo[state.visaType] || state.visaType} (resolved spouseCanWork=${result.spouseCanWork})
- Canadian housing: ${state.caHousing}${
    state.caHousing === 'own'
      ? ` (decision: ${state.caHomeDecision} | home value ${fmtCAD(state.caHomeValueCAD || 0)} | mortgage balance ${fmtCAD(state.caMortgageBalanceCAD || 0)})`
      : ` (rent ${fmtCAD(state.caRentMonthlyCAD || 0)}/mo)`
  }
- US monthly housing: ${fmtUSD(result.usHousingMonthlyUSD)} (state-keyed default applied if user left blank)
- Cost-of-living multiplier: ${result.colMultiplier}× Toronto baseline
- Unrealized capital gains (departure tax target): ${fmtCAD(state.unrealizedGainsCAD || 0)}
- Sign-on bonus offered: ${fmtUSD(state.signOnBonusUSD || 0)}
- Relocation coverage offered: ${fmtUSD(state.relocationCoverageUSD || 0)}
- Out-of-pocket moving costs estimate: ${fmtCAD(state.movingCostsCAD || 0)}
- FX rate: 1 USD = $${state.fxRate} CAD

Computed line items (annual unless noted, all in CAD unless noted):
- Canadian household take-home: ${fmtCAD(result.caHouseholdAnnualCAD)}
- US household take-home: ${fmtCAD(result.usHouseholdAnnualCAD)}
- Net annual delta: ${result.netDeltaCAD >= 0 ? '+' : ''}${fmtCAD(result.netDeltaCAD)}
- Spouse income shock: ${fmtCAD(result.spouseAnnualLossCAD || 0)}/yr (full CA take-home gone if can't work in US)
- Housing delta: ${fmtCAD(result.housingDeltaAnnualCAD)}/yr (US ${fmtUSD(result.usHousingMonthlyUSD)}/mo vs CA ${fmtCAD(result.caHousingMonthly)}/mo)
- Cost-of-living premium: ${fmtCAD(result.colExtraAnnualCAD)}/yr
- Healthcare cost (US side): ${fmtUSD(result.usHealthcare)}/yr USD
- US childcare: ${fmtUSD(result.usChildcare)}/yr USD; CA childcare: ${fmtCAD(result.caChildcare)}/yr
- Departure tax estimate (one-time): ${fmtCAD(result.exitCosts.departureTaxCAD || 0)} (gains × 0.5 × ${(result.marginalRateCA * 100).toFixed(1)}% combined fed+prov marginal)
- Net exit cost (one-time): ${fmtCAD(result.exitCosts.net)} (gross ${fmtCAD(result.exitCosts.gross)} − employer credits ${fmtCAD(result.exitCosts.credits)})

Cumulative outcomes:
- 3-year delta: ${result.threeYrDelta >= 0 ? '+' : ''}${fmtCAD(result.threeYrDelta)}
- 5-year delta: ${result.fiveYrDelta >= 0 ? '+' : ''}${fmtCAD(result.fiveYrDelta)}
- Breakeven year: ${result.breakeven ? result.breakeven.year.toFixed(1) : "never (US doesn't catch CA in 5 years)"}

Now write the explanation.`;
}
