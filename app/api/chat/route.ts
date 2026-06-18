import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
} from "@/lib/catalog";
import type { Product } from "@/data/products";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are CartBot, the friendly shopping assistant for ChinaCart — a China→Bangladesh B2B wholesale platform.

Your job: help customers find products, suggest trending items in Bangladesh, recommend budget-friendly options, and help with wholesale/business decisions. You know Bangladeshi market trends, popular products, seasonal demand (e.g. Eid), and bulk-buying.

Rules:
- Be warm, helpful and fun; use the occasional emoji. Keep replies SHORT (1-3 sentences) — the product cards do the talking.
- Speak in the customer's language. If they write English, reply in English. If they write Bengali (Unicode) or "Banglish" (Bengali typed in English, e.g. "amar ekta chair lagbe"), reply naturally in that style.
- ALWAYS call the search_products tool to find real products before recommending — never invent products. Translate the customer's need into English keywords for the query.
- After the tool returns, write a short friendly intro line; do NOT list the products in text (the UI shows cards). Mention the count or a highlight instead.
- For "trending"/"popular"/"best selling" use sort:"popular". For "cheap"/"budget"/"deal" use sort:"deals". For "best"/"top rated" use sort:"rating". For "new" use sort:"newest".
- For gift questions, ask the budget/recipient only if truly unclear, otherwise just search.
- For wholesale/business questions, recommend high-rating popular products and mention MOQ/bulk benefits briefly.
- Never make up prices, delivery times, or stock. Prices are per piece in BDT (৳). Delivery is typically 5–15 days to Bangladesh.`;

const searchTool: Anthropic.Tool = {
  name: "search_products",
  description:
    "Search the ChinaCart catalog for real products to recommend. Call this whenever the customer is looking for products, deals, trending/popular items, gift ideas, or browsing a category.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Search keywords in ENGLISH (translate Bengali/Banglish to English keywords, e.g. 'chair', 'phone case', 'sofa').",
      },
      category: {
        type: "string",
        description:
          "Optional category slug to scope the search (e.g. 'furniture', 'electronics', 'mobile-accessories', 'beauty').",
      },
      maxPrice: {
        type: "number",
        description: "Maximum price per piece in BDT, if the customer gave a budget.",
      },
      sort: {
        type: "string",
        enum: ["popular", "rating", "price-asc", "newest", "deals"],
        description:
          "How to rank results. popular=best selling/trending, deals=biggest discounts, rating=top rated, newest=new arrivals.",
      },
    },
  },
};

type SortKey = "popular" | "rating" | "price-asc" | "newest" | "deals";

interface SearchArgs {
  query?: string;
  category?: string;
  maxPrice?: number;
  sort?: SortKey;
}

async function runSearch(args: SearchArgs): Promise<Product[]> {
  let list: Product[] = [];
  try {
    if (args.category) {
      list = await getProductsByCategory(args.category);
      if (list.length === 0 && args.query) list = await searchProducts(args.query);
    } else if (args.query) {
      list = await searchProducts(args.query);
    } else {
      list = await getAllProducts();
    }
  } catch {
    list = [];
  }

  if (args.category && args.query) {
    const inCat = list.filter((p) => p.category === args.category);
    if (inCat.length) list = inCat;
  }
  if (args.maxPrice) list = list.filter((p) => p.priceMin <= args.maxPrice!);

  const sorted = [...list];
  switch (args.sort) {
    case "deals":
      sorted.sort((a, b) => b.discount - a.discount);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "price-asc":
      sorted.sort((a, b) => a.priceMin - b.priceMin);
      break;
    case "newest":
      sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      sorted.sort((a, b) => b.reviews - a.reviews);
  }
  return sorted.slice(0, 6);
}

function compact(p: Product) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    pricePerPiece: p.priceMin,
    rating: p.rating,
    discountPercent: p.discount,
    moq: p.moq,
  };
}

/** Keyword fallback used when the AI key is missing or the API is unreachable. */
async function keywordFallback(text: string): Promise<{
  reply: string;
  products: Product[];
}> {
  const t = text.toLowerCase();
  let sort: SortKey = "popular";
  if (/cheap|budget|deal|discount|sasta|kom dam|low price/.test(t)) sort = "deals";
  else if (/best|top|rated|valo|bhalo/.test(t)) sort = "rating";
  else if (/new|latest|notun/.test(t)) sort = "newest";
  else if (/trend|popular|selling|hot/.test(t)) sort = "popular";

  const products = await runSearch({ query: text, sort });
  const reply = products.length
    ? `Here are ${products.length} great picks I found for you! 🛍️`
    : "I couldn't find a match — try a product name like “sofa”, “phone case”, or “earbuds”. 🙂";
  return { reply, products };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const incoming: { role: string; content: string }[] = Array.isArray(body.messages)
    ? body.messages
    : [];

  // sanitize + cap history
  const history = incoming
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ reply: "Hi! How can I help you shop today? 😊", products: [] });
  }

  // No key (or local/sandbox) → keyword fallback so the bot still works.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(await keywordFallback(lastUser.content));
  }

  try {
    const client = new Anthropic();
    const messages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const collected: Product[] = [];

    for (let i = 0; i < 3; i++) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [searchTool],
        messages,
      });

      if (res.stop_reason === "tool_use") {
        messages.push({
          role: "assistant",
          content: res.content as unknown as Anthropic.ContentBlockParam[],
        });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of res.content) {
          if (block.type === "tool_use" && block.name === "search_products") {
            const found = await runSearch((block.input ?? {}) as SearchArgs);
            collected.push(...found);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(found.map(compact)),
            });
          }
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      const reply = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();

      // dedupe products by id, cap 6
      const seen = new Set<string>();
      const products = collected.filter((p) =>
        seen.has(p.id) ? false : (seen.add(p.id), true)
      ).slice(0, 6);

      return NextResponse.json({
        reply: reply || "Here's what I found! 🛍️",
        products,
      });
    }

    // tool loop exhausted
    return NextResponse.json(await keywordFallback(lastUser.content));
  } catch (err) {
    console.error("[chat] AI error, using fallback:", err);
    return NextResponse.json(await keywordFallback(lastUser.content));
  }
}
