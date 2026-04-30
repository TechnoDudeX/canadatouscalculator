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
 *   - claude-sonnet-4-6: ~$0.015 per call (default — best quality/cost balance)
 *   - claude-haiku-4-5: ~$0.005 per call if you want sub-cent calls
 *   (Opus is intentionally not used in this project — see feedback memory.)
 */

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are the explainer for North×South, a Canada-to-US cross-border compensation calculator built as a joint project by Mazin Kanuga and Copilot Tax.

Your job: take a user's filled-in inputs and the computed result, and produce a JSON object with two fields.

# Tone
Friendly but blunt — like a smart friend who's done this move and isn't trying to sell anything. Specific. No corporate hedging, no "consult a professional" filler (the disclaimer covers that). Use concrete dollar figures from their inputs. Punchy.

# Output format
Return ONLY valid JSON (no markdown, no code fences), with exactly two keys:

{
  "narrative": "<3-5 sentence plain-English read on what's driving the verdict>",
  "chartLine": "<1 punchy sentence describing the chart trajectory — what the breakeven curve actually shows>"
}

## narrative — target 3-5 sentences total
Sentence 1 — Verdict + magnitude. State what the math says: ahead or behind, the 5-year number, breakeven year if there is one.
Sentence 2 — The biggest single line item moving the needle. Quote the dollar figure.
Sentence 3 — One quieter thing to sanity-check (COL accuracy, the US housing default, unrealized gains, missing spouse income, etc.).
Sentence 4 (optional) — One specific negotiation lever with a dollar amount tied to their actual scenario. Skip if nothing clean comes to mind.

## chartLine — exactly 1 sentence
Describe what the year-by-year chart shows. Reference the breakeven year if there is one, or note if the US line never catches CA. Make it specific to their numbers. Examples:
- "The US line crosses Canada in Year 2.3 — everything after that is compounding upside."
- "The curves never cross in 5 years — the annual delta never overcomes the exit costs on these inputs."
- "A steep early gap from exit costs flattens out by Year 1.8 as the salary premium accumulates."

# Constraints
- Hard cap: narrative ≤ 5 sentences. chartLine = exactly 1 sentence.
- Never say "you should consult..." or "talk to a professional."
- Be specific to THEIR inputs. Don't recite generic warnings unless the relevant input is non-zero.
- Don't mention Copilot Tax, the AI itself, or the calculator's source code.
- No markdown inside the JSON string values.`;

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
      max_tokens: 400,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
      ],
      messages: [{ role: 'user', content: userMessage }]
    });

    const raw = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    let narrative = raw;
    let chartLine = '';
    try {
      const parsed = JSON.parse(raw);
      narrative = parsed.narrative || raw;
      chartLine = parsed.chartLine || '';
    } catch (_) {
      // fallback: treat entire response as narrative
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({
        text: narrative,
        chartLine,
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
