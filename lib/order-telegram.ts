import { sendTelegramMessageToAdmins } from '@/lib/telegram';

type OrderNotifyItem = {
  name?: string | null;
  product_id: string;
  qty: number;
  price: number;
};

type OrderNotificationInput = {
  appUrl: string;
  orderId: string;
  buyerEmail: string;
  total: number;
  subtotal?: number;
  discount?: number;
  status: string;
  paymentMethod: string;
  couponCode?: string | null;
  items: OrderNotifyItem[];
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function compactId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function orderLines(items: OrderNotifyItem[]) {
  if (!items.length) return '- Item tidak tersedia';
  return items.slice(0, 8).map((item) => {
    const name = item.name || item.product_id;
    return `- ${name} x${item.qty} (${rupiah(item.price * item.qty)})`;
  }).join('\n');
}

export async function notifyAdminsNewOrder(input: OrderNotificationInput) {
  const isManual = input.paymentMethod === 'manual' || input.status === 'pending';
  const title = isManual ? '🛒 ORDER MANUAL BARU - PERLU DIPROSES' : '✅ ORDER BARU TERBAYAR';
  const text = [
    title,
    '',
    `Order: ${compactId(input.orderId)}`,
    `Email: ${input.buyerEmail}`,
    `Status: ${input.status.toUpperCase()}`,
    `Payment: ${input.paymentMethod}`,
    `Subtotal: ${rupiah(input.subtotal || input.total)}`,
    `Discount: ${rupiah(input.discount || 0)}${input.couponCode ? ` (${input.couponCode})` : ''}`,
    `Total: ${rupiah(input.total)}`,
    '',
    'Items:',
    orderLines(input.items),
    '',
    isManual ? 'Aksi: cek pembayaran/manual confirmation lalu proses fulfillment.' : 'Aksi: cek fulfillment dan delivery produk.',
  ].join('\n');

  return sendTelegramMessageToAdmins(text, {
    disableWebPagePreview: true,
    replyMarkup: {
      inline_keyboard: [
        [{ text: '🛒 Open Orders', url: `${input.appUrl}/admin/order-pulse?orderId=${encodeURIComponent(input.orderId)}` }],
        [{ text: '👑 Admin Hub', url: `${input.appUrl}/admin/hub` }, { text: '🚀 Secure Gate', url: `${input.appUrl}/telegram-admin` }],
      ],
    },
  });
}
