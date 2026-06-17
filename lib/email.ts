import { formatBDT } from "@/lib/utils";

interface OrderEmailData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
}

/**
 * Sends a "new order" notification to the admin.
 *
 * Uses the Resend HTTP API when configured (RESEND_API_KEY + ADMIN_EMAIL);
 * otherwise it's a safe no-op so checkout never breaks. Swap the provider here
 * to use SMTP / SendGrid / etc. without touching the order route.
 */
export async function sendNewOrderEmail(order: OrderEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.EMAIL_FROM || "Import China <onboarding@resend.dev>";

  if (!apiKey || !to) {
    // Not configured — log for local visibility and skip.
    console.info(
      `[email] New order ${order.id} (${formatBDT(order.total)}) — email skipped (RESEND_API_KEY/ADMIN_EMAIL not set).`
    );
    return;
  }

  const shortId = order.id.slice(-8).toUpperCase();
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px">×${i.quantity}</td><td style="padding:4px 8px;text-align:right">${formatBDT(
          i.unitPrice * i.quantity
        )}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#CC0000">🛒 New Order #${shortId}</h2>
      <p><strong>Customer:</strong> ${order.name}<br/>
         <strong>Phone:</strong> ${order.phone}<br/>
         <strong>Email:</strong> ${order.email}<br/>
         <strong>Address:</strong> ${order.address}, ${order.city}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="font-size:18px"><strong>Total: ${formatBDT(order.total)}</strong></p>
      <p style="color:#888;font-size:12px">Import China — admin notification</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `🛒 New order #${shortId} — ${formatBDT(order.total)}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status}`);
    }
  } catch (err) {
    console.error("[email] Failed to send order notification:", err);
  }
}
