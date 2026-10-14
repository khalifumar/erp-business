import { 
  Customer, 
  Vendor, 
  Product, 
  VendorPrice, 
  RFQ, 
  Quotation, 
  UserProfile 
} from '@/types';
import { 
  mockCustomers, 
  mockProducts, 
  mockVendors, 
  mockUsers, 
  mockVendorPrices, 
  mockRFQs, 
  mockQuotations, 
  mockPurchaseOrders, 
  mockReceiveItems, 
  mockDeliveries, 
  mockInvoices, 
  mockProformaInvoices, 
  mockOrderHistory, 
  mockSalesActivities, 
  mockPaymentRequests 
} from '@/lib/mockData';

// Types untuk entitas yang saling terhubung
export interface PurchaseOrderItem {
  id: string;
  po_code: string;
  ref_rfq?: string;
  ref_so?: string;
  vendor_id?: string;
  vendor_name: string;
  product_name: string;
  qty: number;
  unit_cost: number;
  total_cost: number;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'In Production' | 'Received' | 'Completed';
  order_date: string;
  eta: string;
  notes?: string;
}

export interface SalesOrderItem {
  id: string;
  so_code: string;
  ref_quotation: string;
  ref_rfq?: string;
  customer_name: string;
  product_name: string;
  qty: number;
  unit_price: number;
  total_amount: number;
  status: 'Draft' | 'Confirmed' | 'In Production' | 'Ready to Ship' | 'Completed';
  sales_name: string;
  created_at: string;
  target_delivery: string;
}

export interface ReceiveItemRecord {
  id: string;
  receipt_code: string;
  po_code: string;
  vendor_name: string;
  product_name: string;
  delivery_note_vendor: string;
  qty_ordered: number;
  qty_received: number;
  qty_passed: number;
  qty_reject: number;
  qc_status: 'QC Passed' | 'QC Partial Passed' | 'QC Rejected';
  receive_date: string;
  warehouse_staff: string;
  notes?: string;
}

export interface DeliveryRecord {
  id: string;
  delivery_no: string;
  rfq_so: string;
  sub_code: string;
  customer: string;
  company: string;
  product: string;
  product_detail: string;
  tipe: string;
  sales: string;
  status: 'Waiting' | 'Partial' | 'On delivery' | 'Delivered';
  items_count: number;
  tanggal: string;
  driver_name?: string;
  tracking_notes?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_no: string;
  so_code: string;
  delivery_no?: string;
  customer: string;
  subtotal: number;
  tax_ppn: number;
  total_amount: number;
  due_date: string;
  issue_date: string;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  payment_terms: string;
  notes?: string;
}

export interface ProformaInvoiceRecord {
  id: string;
  pi_no: string;
  rfq_code?: string;
  so_code?: string;
  customer: string;
  total_amount: number;
  dp_percentage: number;
  dp_amount: number;
  status: 'Pending Payment' | 'DP Received (50%)' | 'Paid Full';
  date: string;
  bank_account?: string;
}

export interface OrderHistoryRecord {
  id: string;
  order_code: string;
  customer: string;
  product: string;
  qty: number;
  total_revenue: number;
  margin_achieved: string;
  completed_date: string;
  status: 'Completed' | 'Cancelled';
  payment_status: string;
}

export interface SalesActivityRecord {
  id: string;
  sales: string;
  date: string;
  customer: string;
  activity_type: 'Follow-up WA' | 'Meeting Klien' | 'Negosiasi Harga' | 'Update Penawaran' | 'Follow-up Delivery';
  notes: string;
  status: 'Done' | 'In Progress' | 'Scheduled';
}

export interface PaymentRequestRecord {
  id: string;
  request_no: string;
  vendor: string;
  amount: number;
  purpose: string;
  ref_document: string;
  requested_by: string;
  status: 'Draft' | 'Pending Finance' | 'Approved Finance' | 'Disbursed';
  date: string;
  disbursed_at?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  RFQS: 'erp_rfqs_v1',
  QUOTATIONS: 'erp_quotations_v1',
  PURCHASE_ORDERS: 'erp_purchase_orders_v1',
  SALES_ORDERS: 'erp_sales_orders_v1',
  RECEIVE_ITEMS: 'erp_receive_items_v1',
  DELIVERIES: 'erp_deliveries_v1',
  INVOICES: 'erp_invoices_v1',
  PROFORMA_INVOICES: 'erp_proforma_invoices_v1',
  ORDER_HISTORY: 'erp_order_history_v1',
  SALES_ACTIVITIES: 'erp_sales_activities_v1',
  PAYMENT_REQUESTS: 'erp_payment_requests_v1',
  VENDOR_PRICES: 'erp_vendor_prices_v1',
};

// Safe LocalStorage Helpers
function safeGet<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultData;
  }
}

function safeSet<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Initial Map for Sales Orders based on approved quotations
const initialSalesOrders: SalesOrderItem[] = [
  {
    id: 'so-01',
    so_code: 'SO-2026-0801',
    ref_quotation: 'QUO-2026-0801',
    ref_rfq: 'DIN.58R0.092026-1',
    customer_name: 'Monday Breakfast Club',
    product_name: 'Foodwrap Greaseproof Print 1 Warna',
    qty: 6000,
    unit_price: 395,
    total_amount: 2370000,
    status: 'In Production',
    sales_name: 'Shalsabilla Redwina',
    created_at: '2026-10-02',
    target_delivery: '2026-10-14'
  },
  {
    id: 'so-02',
    so_code: 'SO-2026-0802',
    ref_quotation: 'QUO-2026-0802',
    ref_rfq: 'DIN.16R1.102026-1',
    customer_name: 'Noku Bakeshop',
    product_name: 'Brown Paperbag Handle Sablon 1W1S',
    qty: 1000,
    unit_price: 3000,
    total_amount: 3000000,
    status: 'Ready to Ship',
    sales_name: 'Shalsabilla Redwina',
    created_at: '2026-10-05',
    target_delivery: '2026-10-16'
  }
];

export const erpStore = {
  // RFQ
  getRFQs(): RFQ[] {
    return safeGet<RFQ[]>(STORAGE_KEYS.RFQS, mockRFQs);
  },
  addRFQ(rfq: RFQ): void {
    const list = this.getRFQs();
    safeSet(STORAGE_KEYS.RFQS, [rfq, ...list]);
  },
  updateRFQStatus(id: string, status: 'pending' | 'processed' | 'cancelled'): void {
    const list = this.getRFQs().map(r => r.id === id ? { ...r, status } : r);
    safeSet(STORAGE_KEYS.RFQS, list);
  },

  // QUOTATIONS
  getQuotations(): Quotation[] {
    return safeGet<Quotation[]>(STORAGE_KEYS.QUOTATIONS, mockQuotations);
  },
  addQuotation(quo: Quotation): void {
    const list = this.getQuotations();
    safeSet(STORAGE_KEYS.QUOTATIONS, [quo, ...list]);

    // Jika status disetujui (Approved), otomatis trigger pembuatan SO & PO
    if (quo.status === 'approved') {
      this.createOrdersFromQuotation(quo);
    }
  },
  approveQuotation(quoId: string): void {
    const list = this.getQuotations().map(q => {
      if (q.id === quoId) {
        const approved = { ...q, status: 'approved' as const };
        this.createOrdersFromQuotation(approved);
        return approved;
      }
      return q;
    });
    safeSet(STORAGE_KEYS.QUOTATIONS, list);
  },

  // Helper: Auto-create Sales Order & Purchase Order from Approved Quotation
  createOrdersFromQuotation(quo: Quotation): void {
    const item = quo.items?.[0];
    const customerName = quo.customer?.company_name || 'Customer Mitra';
    const productName = item?.product?.name || 'Kemasan Custom';
    const qty = item?.qty || 1000;
    const unitPrice = item?.harga_final || 3000;
    const totalAmount = quo.total_amount || (unitPrice * qty);
    const unitCost = item?.vendor_cost || Math.round(unitPrice * 0.75);
    const totalCost = unitCost * qty;
    const soNumber = `SO-${quo.quotation_code.replace('QUO-', '')}`;
    const poNumber = `PO-${quo.quotation_code.replace('QUO-', '')}`;

    // 1. Buat Sales Order
    const existingSos = this.getSalesOrders();
    if (!existingSos.some(s => s.ref_quotation === quo.quotation_code)) {
      const newSo: SalesOrderItem = {
        id: `so-${Date.now()}`,
        so_code: soNumber,
        ref_quotation: quo.quotation_code,
        ref_rfq: quo.rfq_id,
        customer_name: customerName,
        product_name: productName,
        qty: qty,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'In Production',
        sales_name: quo.sales?.full_name || 'Sales Staff',
        created_at: new Date().toISOString().split('T')[0],
        target_delivery: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0]
      };
      this.addSalesOrder(newSo);
    }

    // 2. Buat Purchase Order ke Vendor Pemasok
    const existingPos = this.getPurchaseOrders();
    if (!existingPos.some(p => p.po_code === poNumber)) {
      const newPo: PurchaseOrderItem = {
        id: `po-${Date.now()}`,
        po_code: poNumber,
        ref_rfq: quo.rfq_id,
        ref_so: soNumber,
        vendor_name: 'Mitra Kemasan Utama (SP0001)',
        product_name: productName,
        qty: qty,
        unit_cost: unitCost,
        total_cost: totalCost,
        status: 'In Production',
        order_date: new Date().toISOString().split('T')[0],
        eta: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        notes: `Pengadaan otomatis untuk pesanan ${soNumber} (${customerName})`
      };
      this.addPurchaseOrder(newPo);
    }
  },

  // PURCHASE ORDERS
  getPurchaseOrders(): PurchaseOrderItem[] {
    return safeGet<PurchaseOrderItem[]>(STORAGE_KEYS.PURCHASE_ORDERS, mockPurchaseOrders as any);
  },
  addPurchaseOrder(po: PurchaseOrderItem): void {
    const list = this.getPurchaseOrders();
    safeSet(STORAGE_KEYS.PURCHASE_ORDERS, [po, ...list]);
  },
  updatePOStatus(id: string, status: PurchaseOrderItem['status']): void {
    const list = this.getPurchaseOrders().map(p => p.id === id ? { ...p, status } : p);
    safeSet(STORAGE_KEYS.PURCHASE_ORDERS, list);
  },

  // SALES ORDERS
  getSalesOrders(): SalesOrderItem[] {
    return safeGet<SalesOrderItem[]>(STORAGE_KEYS.SALES_ORDERS, initialSalesOrders);
  },
  addSalesOrder(so: SalesOrderItem): void {
    const list = this.getSalesOrders();
    safeSet(STORAGE_KEYS.SALES_ORDERS, [so, ...list]);
  },
  updateSOStatus(id: string, status: SalesOrderItem['status']): void {
    const list = this.getSalesOrders().map(s => s.id === id ? { ...s, status } : s);
    safeSet(STORAGE_KEYS.SALES_ORDERS, list);
  },

  // RECEIVE ITEMS (QC GUDANG)
  getReceiveItems(): ReceiveItemRecord[] {
    return safeGet<ReceiveItemRecord[]>(STORAGE_KEYS.RECEIVE_ITEMS, mockReceiveItems as any);
  },
  addReceiveItem(item: ReceiveItemRecord): void {
    const list = this.getReceiveItems();
    safeSet(STORAGE_KEYS.RECEIVE_ITEMS, [item, ...list]);

    // Update PO terkait jika ada
    if (item.po_code) {
      const pos = this.getPurchaseOrders().map(p => {
        if (p.po_code === item.po_code) {
          return { ...p, status: 'Completed' as const };
        }
        return p;
      });
      safeSet(STORAGE_KEYS.PURCHASE_ORDERS, pos);
    }
  },

  // DELIVERIES
  getDeliveries(): DeliveryRecord[] {
    return safeGet<DeliveryRecord[]>(STORAGE_KEYS.DELIVERIES, mockDeliveries as any);
  },
  addDelivery(del: DeliveryRecord): void {
    const list = this.getDeliveries();
    safeSet(STORAGE_KEYS.DELIVERIES, [del, ...list]);
  },
  updateDeliveryStatus(id: string, status: DeliveryRecord['status']): void {
    const list = this.getDeliveries().map(d => d.id === id ? { ...d, status } : d);
    safeSet(STORAGE_KEYS.DELIVERIES, list);
  },

  // INVOICES
  getInvoices(): InvoiceRecord[] {
    return safeGet<InvoiceRecord[]>(STORAGE_KEYS.INVOICES, mockInvoices as any);
  },
  addInvoice(inv: InvoiceRecord): void {
    const list = this.getInvoices();
    safeSet(STORAGE_KEYS.INVOICES, [inv, ...list]);
  },
  markInvoicePaid(id: string): void {
    const list = this.getInvoices().map(inv => {
      if (inv.id === id) {
        const paidInv = { ...inv, status: 'Paid' as const };
        // Masukkan ke Order History otomatis
        this.addOrderHistory({
          id: `hist-${Date.now()}`,
          order_code: inv.so_code || inv.invoice_no,
          customer: inv.customer,
          product: 'Packaging Order Selesai',
          qty: 1000,
          total_revenue: inv.total_amount,
          margin_achieved: '25.5%',
          completed_date: new Date().toISOString().split('T')[0],
          status: 'Completed',
          payment_status: 'Lunas (Verified)'
        });
        return paidInv;
      }
      return inv;
    });
    safeSet(STORAGE_KEYS.INVOICES, list);
  },

  // PROFORMA INVOICES
  getProformaInvoices(): ProformaInvoiceRecord[] {
    return safeGet<ProformaInvoiceRecord[]>(STORAGE_KEYS.PROFORMA_INVOICES, mockProformaInvoices as any);
  },
  addProformaInvoice(pi: ProformaInvoiceRecord): void {
    const list = this.getProformaInvoices();
    safeSet(STORAGE_KEYS.PROFORMA_INVOICES, [pi, ...list]);
  },
  markPIPaid(id: string): void {
    const list = this.getProformaInvoices().map(pi => pi.id === id ? { ...pi, status: 'DP Received (50%)' as const } : pi);
    safeSet(STORAGE_KEYS.PROFORMA_INVOICES, list);
  },

  // ORDER HISTORY
  getOrderHistory(): OrderHistoryRecord[] {
    return safeGet<OrderHistoryRecord[]>(STORAGE_KEYS.ORDER_HISTORY, mockOrderHistory as any);
  },
  addOrderHistory(hist: OrderHistoryRecord): void {
    const list = this.getOrderHistory();
    safeSet(STORAGE_KEYS.ORDER_HISTORY, [hist, ...list]);
  },

  // SALES ACTIVITIES
  getSalesActivities(): SalesActivityRecord[] {
    return safeGet<SalesActivityRecord[]>(STORAGE_KEYS.SALES_ACTIVITIES, mockSalesActivities as any);
  },
  addSalesActivity(act: SalesActivityRecord): void {
    const list = this.getSalesActivities();
    safeSet(STORAGE_KEYS.SALES_ACTIVITIES, [act, ...list]);
  },

  // PAYMENT REQUESTS
  getPaymentRequests(): PaymentRequestRecord[] {
    return safeGet<PaymentRequestRecord[]>(STORAGE_KEYS.PAYMENT_REQUESTS, mockPaymentRequests as any);
  },
  addPaymentRequest(pr: PaymentRequestRecord): void {
    const list = this.getPaymentRequests();
    safeSet(STORAGE_KEYS.PAYMENT_REQUESTS, [pr, ...list]);
  },
  approvePaymentRequest(id: string): void {
    const list = this.getPaymentRequests().map(pr => 
      pr.id === id 
        ? { 
            ...pr, 
            status: 'Approved Finance' as const, 
            disbursed_at: new Date().toISOString().split('T')[0] 
          } 
        : pr
    );
    safeSet(STORAGE_KEYS.PAYMENT_REQUESTS, list);
  },

  // VENDOR PRICES
  getVendorPrices(): VendorPrice[] {
    return safeGet<VendorPrice[]>(STORAGE_KEYS.VENDOR_PRICES, mockVendorPrices);
  },
  addVendorPrice(vp: VendorPrice): void {
    const list = this.getVendorPrices();
    safeSet(STORAGE_KEYS.VENDOR_PRICES, [vp, ...list]);
  }
};
