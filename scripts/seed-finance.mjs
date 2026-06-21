/**
 * Seed sample orders + expenses + product-cost overrides so the finance
 * dashboard has data to render. Safe to run repeatedly — it wipes and reseeds
 * the demo finance data. DO NOT run against a production database with real
 * orders. Usage: `npm run seed` (needs DATABASE_URL).
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

// Parse the bundled catalog so seeded orders reference real product ids
// (keeps category resolution in the dashboard working).
function loadProducts() {
  const ts = readFileSync(new URL("../data/products.ts", import.meta.url), "utf8");
  const re =
    /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*images:[\s\S]*?priceMin:\s*(\d+),\s*priceMax:\s*(\d+)/g;
  const out = [];
  let m;
  while ((m = re.exec(ts))) {
    out.push({ id: m[1], name: m[2], min: Number(m[4]), max: Number(m[5]) });
  }
  return out;
}

const NAMES = [
  "Ahmed Karim", "Rahim Uddin", "Fatima Akter", "Nusrat Jahan", "Tanvir Hasan",
  "Sadia Islam", "Imran Hossain", "Mehedi Hasan", "Sumaiya Khatun", "Arif Chowdhury",
  "Jannatul Ferdous", "Shakib Rahman", "Tasnim Ahmed", "R12 Traders", "Dhaka Mart",
];
const CITIES = ["Dhaka", "Chittagong", "Khulna", "Sylhet", "Rajshahi", "Barishal"];
const STATUSES = [
  "delivered", "delivered", "delivered", "delivered", "shipped",
  "processing", "pending", "cancelled",
];

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const products = loadProducts();
  if (!products.length) throw new Error("No products parsed from data/products.ts");
  console.log(`Parsed ${products.length} catalog products.`);

  console.log("Clearing existing demo finance data…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.productCost.deleteMany();

  // ---- orders over the last 12 months -------------------------------------
  const now = new Date();
  let orderCount = 0;
  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    // gentle upward trend: more orders in recent months
    const base = 6 + (11 - monthsAgo);
    const n = randInt(base, base + 6);
    for (let i = 0; i < n; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const daysInMonth = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      ).getDate();
      const createdAt = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        randInt(1, daysInMonth),
        randInt(8, 21),
        randInt(0, 59)
      );

      const lineCount = randInt(1, 4);
      const items = [];
      let subtotal = 0;
      for (let j = 0; j < lineCount; j++) {
        const p = rand(products);
        const unitPrice = randInt(p.min, p.max);
        const quantity = randInt(20, 150);
        subtotal += unitPrice * quantity;
        items.push({
          productId: p.id,
          name: p.name,
          image: `https://picsum.photos/seed/${p.id}/120/120`,
          unitPrice,
          quantity,
        });
      }
      const shippingFee = subtotal > 50000 ? 0 : randInt(500, 2000);
      const total = subtotal + shippingFee;
      const status = rand(STATUSES);
      const paid = status === "delivered" ? true : Math.random() > 0.5;

      await prisma.order.create({
        data: {
          name: rand(NAMES),
          email: `buyer${randInt(1, 40)}@example.com`,
          phone: `017${randInt(10000000, 99999999)}`,
          address: `House ${randInt(1, 99)}, Road ${randInt(1, 20)}`,
          city: rand(CITIES),
          paymentMethod: rand(["Cash on Delivery", "bKash", "Nagad", "Bank Transfer"]),
          subtotal,
          shippingFee,
          total,
          status,
          paid,
          createdAt,
          items: { create: items },
        },
      });
      orderCount++;
    }
  }
  console.log(`Created ${orderCount} orders.`);

  // ---- monthly operating expenses -----------------------------------------
  const expenseTemplates = [
    { category: "shipping", min: 8000, max: 25000 },
    { category: "customs", min: 5000, max: 18000 },
    { category: "marketing", min: 3000, max: 15000 },
    { category: "packaging", min: 1500, max: 6000 },
    { category: "salaries", min: 40000, max: 70000 },
    { category: "other", min: 1000, max: 5000 },
  ];
  let expenseCount = 0;
  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, randInt(2, 26));
    for (const t of expenseTemplates) {
      await prisma.expense.create({
        data: {
          category: t.category,
          amount: randInt(t.min, t.max),
          note: "Demo seeded expense",
          date: d,
        },
      });
      expenseCount++;
    }
  }
  console.log(`Created ${expenseCount} expenses.`);

  // ---- a few real per-product cost overrides ------------------------------
  for (const p of products.slice(0, 8)) {
    await prisma.productCost.create({
      data: { productId: p.id, costPrice: Math.round(p.min * 0.55) },
    });
  }
  console.log("Set 8 product-cost overrides.");
  console.log("✅ Finance demo data seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
