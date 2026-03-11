import { json } from "./access/_shared.js";

const MODEL_PRICING_USD_PER_1M = {
    "gpt-5.4": { input: 1.25, output: 10.0 },
    "gpt-5": { input: 1.25, output: 10.0 },
    "gpt-5-mini": { input: 0.25, output: 2.0 },
    "gpt-4o": { input: 2.5, output: 10.0 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 }
};

function currentMonthKey() {
    return new Date().toISOString().slice(0, 7);
}

function getBudgetConfig(env) {
    return {
        limitKrw: Number(env.OPENAI_MONTHLY_BUDGET_KRW || 300000),
        usdKrwRate: Number(env.OPENAI_USD_KRW_RATE || 1450),
        namespace: env.AI_BUDGET_KV || null
    };
}

function getModelPricing(env, model) {
    const overrideInput = Number(env.OPENAI_PRICE_INPUT_PER_MILLION || "");
    const overrideOutput = Number(env.OPENAI_PRICE_OUTPUT_PER_MILLION || "");
    if (Number.isFinite(overrideInput) && Number.isFinite(overrideOutput) && overrideInput > 0 && overrideOutput > 0) {
        return { input: overrideInput, output: overrideOutput };
    }
    return MODEL_PRICING_USD_PER_1M[model] || MODEL_PRICING_USD_PER_1M["gpt-5"];
}

export async function readMonthlyBudget(env) {
    const config = getBudgetConfig(env);
    const key = `ai-budget:${currentMonthKey()}`;
    if (!config.namespace?.get) {
        return {
            key,
            tracked: false,
            limitKrw: config.limitKrw,
            spentUsd: 0,
            spentKrw: 0,
            requestCount: 0
        };
    }

    const raw = await config.namespace.get(key, "json");
    return {
        key,
        tracked: true,
        limitKrw: config.limitKrw,
        spentUsd: Number(raw?.spentUsd || 0),
        spentKrw: Number(raw?.spentKrw || 0),
        requestCount: Number(raw?.requestCount || 0)
    };
}

export async function enforceMonthlyBudget(env) {
    const state = await readMonthlyBudget(env);
    if (state.spentKrw >= state.limitKrw) {
        return json({
            ok: false,
            error: {
                code: "BUDGET_EXCEEDED",
                message: `Monthly AI budget reached (${Math.round(state.spentKrw).toLocaleString()} KRW / ${Math.round(state.limitKrw).toLocaleString()} KRW).`
            }
        }, 429);
    }
    return null;
}

export function estimateUsageCost(env, model, usage) {
    const pricing = getModelPricing(env, model);
    const budget = getBudgetConfig(env);
    const promptTokens = Number(usage?.prompt_tokens || 0);
    const completionTokens = Number(usage?.completion_tokens || 0);
    const inputUsd = (promptTokens / 1_000_000) * pricing.input;
    const outputUsd = (completionTokens / 1_000_000) * pricing.output;
    const totalUsd = inputUsd + outputUsd;
    return {
        promptTokens,
        completionTokens,
        totalUsd,
        totalKrw: totalUsd * budget.usdKrwRate
    };
}

export async function recordUsageCost(env, entry) {
    const config = getBudgetConfig(env);
    if (!config.namespace?.get || !config.namespace?.put) {
        console.warn(JSON.stringify({
            type: "budget_tracking_unavailable",
            ts: new Date().toISOString(),
            message: "AI_BUDGET_KV binding missing; monthly soft cap cannot persist across requests."
        }));
        return null;
    }

    const current = await readMonthlyBudget(env);
    const next = {
        month: currentMonthKey(),
        spentUsd: current.spentUsd + Number(entry.totalUsd || 0),
        spentKrw: current.spentKrw + Number(entry.totalKrw || 0),
        requestCount: current.requestCount + 1,
        updatedAt: new Date().toISOString()
    };
    await config.namespace.put(current.key, JSON.stringify(next));
    return next;
}
