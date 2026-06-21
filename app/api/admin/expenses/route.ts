import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { EXPENSE_CATEGORY_KEYS } from "@/lib/finance";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/admin/expenses — list all expenses (admin only)
export async function GET() {
  if (!isAdmin()) return unauthorized();
  try {
    const rows = await prisma.expense.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json({
      expenses: rows.map((e) => ({
        id: e.id,
        category: e.category,
        amount: e.amount,
        note: e.note,
        date: e.date.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ expenses: [], error: true });
  }
}

function parseBody(body: {
  category?: unknown;
  amount?: unknown;
  note?: unknown;
  date?: unknown;
}) {
  const category = String(body.category ?? "");
  const amount = Math.round(Number(body.amount));
  const note = body.note ? String(body.note).slice(0, 300) : null;
  const date = body.date ? new Date(String(body.date)) : new Date();
  if (!EXPENSE_CATEGORY_KEYS.includes(category as never)) return null;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (Number.isNaN(date.getTime())) return null;
  return { category, amount, note, date };
}

// POST /api/admin/expenses — create
export async function POST(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const data = parseBody(body);
  if (!data) {
    return NextResponse.json({ error: "Invalid expense" }, { status: 400 });
  }
  try {
    const e = await prisma.expense.create({ data });
    return NextResponse.json({ ok: true, id: e.id });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PATCH /api/admin/expenses — update { id, ... }
export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const data = parseBody(body);
  if (!id || !data) {
    return NextResponse.json({ error: "Invalid expense" }, { status: 400 });
  }
  try {
    await prisma.expense.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// DELETE /api/admin/expenses?id=...
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
