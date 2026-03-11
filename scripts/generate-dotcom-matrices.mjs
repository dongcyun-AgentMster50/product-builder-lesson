import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const REFERENCES_DIR = path.join(ROOT, "references");

const MARKETS = [
    {
        siteCode: "KR",
        countryCode: "KR",
        countryName: "South Korea",
        categories: [
            { key: "TV", label: "TV", url: "https://www.samsung.com/sec/tvs/all-tvs/", aliases: ["TV"] },
            { key: "냉장고", label: "Refrigerators", url: "https://www.samsung.com/sec/refrigerators/all-refrigerators/", aliases: ["냉장고"] },
            { key: "세탁기/건조기", label: "Washers and dryers", url: "https://www.samsung.com/sec/washers-and-dryers/all-washers-and-dryers/", aliases: ["세탁기", "건조기", "세탁기/건조기"] },
            { key: "오븐", label: "Cooking appliances", url: "https://www.samsung.com/sec/electric-range/all-electric-range/", aliases: ["오븐"] },
            { key: "로봇청소기", label: "Vacuum cleaners", url: "https://www.samsung.com/sec/vacuum-cleaners/all-vacuum-cleaners/", aliases: ["로봇청소기"] },
            { key: "에어컨", label: "Air conditioners", url: "https://www.samsung.com/sec/air-conditioners/all-air-conditioners/", aliases: ["에어컨"] }
        ]
    },
    {
        siteCode: "US",
        countryCode: "US",
        countryName: "United States",
        categories: [
            { key: "TV", label: "TV", url: "https://www.samsung.com/us/televisions-home-theater/tvs/all-tvs/?shop=Buy+Online", aliases: ["TV"] },
            { key: "냉장고", label: "Refrigerators", url: "https://www.samsung.com/us/home-appliances/refrigerators/all-refrigerators/?shop=Buy+Online", aliases: ["냉장고"] },
            { key: "세탁기/건조기", label: "Washers and dryers", url: "https://www.samsung.com/us/home-appliances/washers/all-washers/?shop=Buy+Online", aliases: ["세탁기", "건조기", "세탁기/건조기"] },
            { key: "오븐", label: "Ranges", url: "https://www.samsung.com/us/home-appliances/ranges/all-ranges/?shop=Buy+Online", aliases: ["오븐"] },
            { key: "로봇청소기", label: "Vacuums", url: "https://www.samsung.com/us/home-appliances/vacuums/all-vacuums/?shop=Buy+Online", aliases: ["로봇청소기"] }
        ]
    },
    {
        siteCode: "UK",
        countryCode: "GB",
        countryName: "United Kingdom",
        categories: [
            { key: "TV", label: "TV", url: "https://www.samsung.com/uk/tvs/all-tvs/", aliases: ["TV"] },
            { key: "냉장고", label: "Refrigerators", url: "https://www.samsung.com/uk/refrigerators/all-refrigerators/", aliases: ["냉장고"] },
            { key: "세탁기/건조기", label: "Washers and dryers", url: "https://www.samsung.com/uk/washers-and-dryers/all-washers-and-dryers/", aliases: ["세탁기", "건조기", "세탁기/건조기"] },
            { key: "오븐", label: "Cooking appliances", url: "https://www.samsung.com/uk/cooking-appliances/all-cooking-appliances/", aliases: ["오븐"] },
            { key: "로봇청소기", label: "Vacuum cleaners", url: "https://www.samsung.com/uk/vacuum-cleaners/all-vacuum-cleaners/", aliases: ["로봇청소기"] }
        ]
    }
];

const priceNumber = (value) => {
    const num = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : null;
};

const normalizeWhitespace = (value) => String(value || "").replace(/\s+/g, " ").trim();
const decodeHtml = (value) => String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const cleanFeaturePhrase = (value) => normalizeWhitespace(
    decodeHtml(value)
        .replace(/제품의\s*특장점을\s*확인해\s*보세요\.?/g, "")
        .replace(/Compare the full/gi, "")
        .replace(/Shop Samsung'?s best/gi, "")
        .replace(/Free, Next Day Delivery.*$/gi, "")
);

function extractFeaturePhrases(name, description) {
    const combined = [name, description].map(cleanFeaturePhrase).filter(Boolean).join(". ");
    const rawParts = combined
        .replace(/(\d)\.(\d)/g, "$1__DECIMAL__$2")
        .split(/[!?]/)
        .flatMap((part) => part.split(/(?<!\d)\.(?!\d)/))
        .flatMap((part) => part.split(/,|\u00b7|\|/))
        .map((part) => cleanFeaturePhrase(part.replace(/__DECIMAL__/g, ".")))
        .filter(Boolean);

    const confirmed = [];
    const inferred = [];
    const keywordPattern = /\b(AI Home|AI OptiWash\+?|AI OptiWash|AI Ecobubble|AI Energy Mode|SmartThings|Bespoke|WindFree|Jet AI|Neo QLED|OLED|The Frame|Flex Auto Dispense|Super Speed|Steam|Dual Cook|Vision AI)\b/gi;

    for (const part of rawParts) {
        if (part.length < 8) continue;
        if (!confirmed.includes(part)) confirmed.push(part);
        if (confirmed.length >= 3) break;
    }

    const keywordMatches = `${name} ${description}`.match(keywordPattern) || [];
    for (const match of keywordMatches) {
        const token = normalizeWhitespace(match);
        if (token && !inferred.includes(token)) inferred.push(token);
    }

    return {
        confirmed,
        inferred
    };
}

function extractSku(item) {
    const candidates = [
        item.sku,
        item.mpn,
        item.productID,
        item.productId,
        item.model,
        item.url?.match(/sku-([a-z0-9-]+)/i)?.[1],
        item.url?.match(/\/([a-z0-9-]{6,})\/?$/i)?.[1],
        item["@id"]?.match(/\/([a-z0-9-]{6,})\/?$/i)?.[1]
    ].filter(Boolean);
    return String(candidates[0] || "").toUpperCase();
}

function availabilityStatus(raw) {
    const value = String(raw || "").toLowerCase();
    if (value.includes("instock") || value === "y") return "supported";
    if (value.includes("preorder") || value.includes("presale") || value.includes("limitedavailability")) return "limited";
    if (value.includes("outofstock") || value === "n") return "limited";
    return "unverified";
}

function confidenceForAvailability(raw) {
    return raw ? "high" : "medium";
}

function findJsonLdBlocks(html) {
    const blocks = [];
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html))) {
        const raw = match[1].trim();
        if (!raw) continue;
        try {
            blocks.push(JSON.parse(raw));
        } catch {
            continue;
        }
    }
    return blocks;
}

function flattenProducts(json) {
    const list = [];
    const visit = (node) => {
        if (!node) return;
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (typeof node !== "object") return;

        if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
            node.itemListElement.forEach((item) => {
                if (item?.item) list.push(item.item);
            });
        }
        Object.values(node).forEach(visit);
    };
    visit(json);
    return list;
}

async function fetchHtml(url) {
    const response = await fetch(url, {
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.text();
}

function mapProduct(product, market, category) {
    const offers = product.offers || {};
    const features = extractFeaturePhrases(product.name, product.description);
    const rawAvailability = offers.availability || "";
    return {
        sku: extractSku(product),
        modelName: normalizeWhitespace(product.name),
        productUrl: product.url || product["@id"] || "",
        imageUrl: product.image || "",
        priceCurrency: offers.priceCurrency || offers.priceSpecification?.priceCurrency || null,
        price: priceNumber(offers.price || offers.priceSpecification?.price),
        availability: {
            status: availabilityStatus(rawAvailability),
            confidence: confidenceForAvailability(rawAvailability),
            raw: rawAvailability || "unknown"
        },
        rating: product.aggregateRating ? {
            value: Number(product.aggregateRating.ratingValue) || null,
            count: Number(product.aggregateRating.reviewCount || product.aggregateRating.ratingCount) || null
        } : null,
        features,
        evidence: {
            type: "json-ld",
            market: market.siteCode,
            categoryUrl: category.url
        }
    };
}

function buildServiceSupportMatrix(factPack, skuMatrix) {
    const services = Array.isArray(factPack) ? factPack : factPack.services || [];
    const markets = skuMatrix.markets.map((market) => {
        const categoryLookup = new Map();
        for (const category of market.categories) {
            for (const alias of category.aliases || [category.categoryKey]) {
                categoryLookup.set(alias, category);
            }
        }

        return {
            siteCode: market.siteCode,
            countryCode: market.countryCode,
            countryName: market.countryName,
            services: services.map((service) => {
                const requiredCategories = Array.isArray(service.requiredCategories) ? service.requiredCategories : [];
                const coverage = requiredCategories.map((required) => {
                    const category = categoryLookup.get(required);
                    return {
                        requiredCategory: required,
                        found: Boolean(category),
                        categoryKey: category?.categoryKey || null,
                        sourceUrl: category?.sourceUrl || null,
                        productCount: category?.products?.length || 0,
                        inStockCount: category?.products?.filter((product) => product.availability.status === "supported").length || 0
                    };
                });

                const foundCount = coverage.filter((item) => item.found).length;
                const ratio = requiredCategories.length ? foundCount / requiredCategories.length : 0;
                const status = ratio === 1 ? "supported" : ratio > 0 ? "limited" : "unverified";

                return {
                    serviceName: service.serviceName,
                    appCardLabel: service.appCardLabel || service.serviceName,
                    requiredCategories,
                    confirmedEvidence: {
                        coveredCategories: coverage.filter((item) => item.found),
                        missingCategories: coverage.filter((item) => !item.found).map((item) => item.requiredCategory)
                    },
                    inferredSupport: {
                        status,
                        confidence: ratio === 1 ? "medium" : "low",
                        rationale: ratio === 1
                            ? "All required categories have official dotcom SKU evidence in this market."
                            : ratio > 0
                                ? "Only part of the required category set has official dotcom SKU evidence in this market."
                                : "No required category had direct dotcom SKU evidence in the tracked market pages."
                    }
                };
            })
        };
    });

    return {
        version: "2026-03-11",
        generatedAt: new Date().toISOString(),
        source: "Samsung dotcom category-page JSON-LD + references/fact_pack.json",
        markets
    };
}

function buildProductFeatureMatrix(skuMatrix) {
    return {
        version: skuMatrix.version,
        generatedAt: skuMatrix.generatedAt,
        source: skuMatrix.source,
        products: skuMatrix.markets.flatMap((market) =>
            market.categories.flatMap((category) =>
                category.products.map((product) => ({
                    siteCode: market.siteCode,
                    countryCode: market.countryCode,
                    categoryKey: category.categoryKey,
                    sku: product.sku,
                    modelName: product.modelName,
                    productUrl: product.productUrl,
                    availability: product.availability,
                    features: product.features,
                    evidence: product.evidence
                }))
            )
        )
    };
}

async function main() {
    const factPack = JSON.parse(await fs.readFile(path.join(REFERENCES_DIR, "fact_pack.json"), "utf8"));
    const marketResults = [];

    for (const market of MARKETS) {
        const categories = [];
        for (const category of market.categories) {
            const html = await fetchHtml(category.url);
            const products = [];
            for (const block of findJsonLdBlocks(html)) {
                for (const product of flattenProducts(block)) {
                    const mapped = mapProduct(product, market, category);
                    if (!mapped.modelName || !mapped.productUrl) continue;
                    if (!products.some((item) => item.productUrl === mapped.productUrl || (item.sku && item.sku === mapped.sku))) {
                        products.push(mapped);
                    }
                }
            }

            categories.push({
                categoryKey: category.key,
                categoryLabel: category.label,
                aliases: category.aliases,
                sourceUrl: category.url,
                productCount: products.length,
                inStockCount: products.filter((product) => product.availability.status === "supported").length,
                outOfStockCount: products.filter((product) => product.availability.raw.toLowerCase().includes("outofstock")).length,
                products
            });
        }

        marketResults.push({
            siteCode: market.siteCode,
            countryCode: market.countryCode,
            countryName: market.countryName,
            categories
        });
    }

    const skuMatrix = {
        version: "2026-03-11",
        generatedAt: new Date().toISOString(),
        source: "Samsung dotcom category-page JSON-LD",
        markets: marketResults
    };

    const serviceMatrix = buildServiceSupportMatrix(factPack, skuMatrix);
    const featureMatrix = buildProductFeatureMatrix(skuMatrix);

    await fs.writeFile(path.join(REFERENCES_DIR, "sku_availability_matrix.json"), `${JSON.stringify(skuMatrix, null, 2)}\n`);
    await fs.writeFile(path.join(REFERENCES_DIR, "service_support_matrix.json"), `${JSON.stringify(serviceMatrix, null, 2)}\n`);
    await fs.writeFile(path.join(REFERENCES_DIR, "product_feature_matrix.json"), `${JSON.stringify(featureMatrix, null, 2)}\n`);

    console.log(JSON.stringify({
        skuMarkets: skuMatrix.markets.map((market) => ({
            siteCode: market.siteCode,
            categories: market.categories.map((category) => ({
                categoryKey: category.categoryKey,
                productCount: category.productCount
            }))
        })),
        services: serviceMatrix.markets.map((market) => ({
            siteCode: market.siteCode,
            supported: market.services.filter((service) => service.inferredSupport.status === "supported").length,
            limited: market.services.filter((service) => service.inferredSupport.status === "limited").length
        }))
    }, null, 2));
}

await main();
