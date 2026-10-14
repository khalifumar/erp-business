import { Customer, Vendor, Product, VendorPrice, RFQ, Quotation, UserProfile } from '@/types';

export const mockUsers: UserProfile[] = [
  { id: 'a0000001-0000-0000-0000-000000000001', email: 'admin@digipack.id', full_name: 'Admin Operasional', role: 'admin' },
  { id: 'a0000002-0000-0000-0000-000000000002', email: 'manager@digipack.id', full_name: 'Budi Santoso (Sales Manager)', role: 'manager' },
  { id: 'a0000003-0000-0000-0000-000000000003', email: 'shalsabilla@digipack.id', full_name: 'Shalsabilla Redwina', role: 'sales' },
  { id: 'a0000004-0000-0000-0000-000000000004', email: 'nadia@digipack.id', full_name: 'Nadia Putri', role: 'sales' },
  { id: 'a0000005-0000-0000-0000-000000000005', email: 'salma@digipack.id', full_name: 'Salma Laila', role: 'sales' },
];

export const mockCustomers: Customer[] = [
  { id: 'c0000001-0000-0000-0000-000000000001', customer_code: 'CLIENT_001', company_name: 'Monday Breakfast Club', contact_person: 'Kurniawan', segment: 'F&B Cafe' },
  { id: 'c0000002-0000-0000-0000-000000000002', customer_code: 'CLIENT_002', company_name: 'Noku Bakeshop', contact_person: 'Yasmeen Aulia', segment: 'Bakery' },
  { id: 'c0000003-0000-0000-0000-000000000003', customer_code: 'CLIENT_003', company_name: 'Chindolondo Official', contact_person: 'Reza F.', segment: 'Beverage' },
  { id: 'c0000004-0000-0000-0000-000000000004', customer_code: 'CLIENT_004', company_name: 'Ugiro Coffee Roastery', contact_person: 'Aditya S.', segment: 'Coffee Shop' },
  { id: 'c0000005-0000-0000-0000-000000000005', customer_code: 'CLIENT_005', company_name: 'Stahl Arbeit Apparel', contact_person: 'Hendra W.', segment: 'Fashion Retail' },
  { id: 'c0000006-0000-0000-0000-000000000006', customer_code: 'CLIENT_006', company_name: 'Sky Pasta House', contact_person: 'Bella V.', segment: 'Resto & Diners' },
];

export const mockVendors: Vendor[] = [
  { id: 'b0000001-0000-0000-0000-000000000001', vendor_code: 'VENDOR_SP0001', vendor_name: 'Mitra Kemasan Utama (SP0001)', speciality: 'RTU & Satchel Paper Bag' },
  { id: 'b0000002-0000-0000-0000-000000000002', vendor_code: 'VENDOR_SP0002', vendor_name: 'Kreasi Cipta Karton (SP0002)', speciality: 'Custom Box & Hardbox' },
  { id: 'b0000003-0000-0000-0000-000000000003', vendor_code: 'VENDOR_SP0003', vendor_name: 'Solusi Grafika & Sablon (SP0003)', speciality: 'Sablon & Printing Finishing' },
];

export const mockProducts: Product[] = [
  { id: 'd0000001-0000-0000-0000-000000000001', sku: 'R-TP-ESB-W-12x0x20', name: 'White Satchel Envelope', category: 'Paper Bag', material: 'Greaseproof 40 gsm', size: '12 x 0 x 20', color: '0/0', print_type: 'Polos', qty_per_carton: 5000 },
  { id: 'd0000002-0000-0000-0000-000000000002', sku: 'R-TP-ESB-B-12x0x19', name: 'Brown Satchel Envelope', category: 'Paper Bag', material: 'Brown Kraft 50 gsm', size: '12 x 0 x 19', color: '0/0', print_type: 'Polos', qty_per_carton: 5000 },
  { id: 'd0000005-0000-0000-0000-000000000005', sku: 'R-PB-HND-B-20x20x25-1W1S', name: 'Brown Paperbag Handle Sablon 1W1S', category: 'Paper Bag', material: 'Brown Kraft 125 gsm', size: '20 x 20 x 25', color: '1/0', print_type: 'Sablon 1W1S', qty_per_carton: 1000 },
  { id: 'd0000007-0000-0000-0000-000000000007', sku: 'FW-GP-30x30-POLOS', name: 'Foodwrap Greaseproof Polos', category: 'Food Wrap', material: 'Greaseproof 40 gsm', size: '30 x 30 cm', color: '0/0', print_type: 'Polos', qty_per_carton: 3000 },
  { id: 'd0000008-0000-0000-0000-000000000008', sku: 'FW-GP-30x30-PRINT1W', name: 'Foodwrap Greaseproof Print 1 Warna', category: 'Food Wrap', material: 'Greaseproof 40 gsm', size: '30 x 30 cm', color: '1/0', print_type: 'Custom Print', qty_per_carton: 3000 },
  { id: 'd0000010-0000-0000-0000-000000000010', sku: 'BB-WIN-W-15x30', name: 'White Window Bread Bag', category: 'Bread Bag', material: 'Greaseproof 40 gsm + OPP', size: '15 x 8 x 30', color: '0/0', print_type: 'Polos', qty_per_carton: 2000 },
  { id: 'd0000012-0000-0000-0000-000000000012', sku: 'BX-LBX-BRN-M-POLOS', name: 'Lunch Box Kraft Medium', category: 'Lunch Box', material: 'Kraft PE 290 gsm', size: '16 x 9 x 5 cm', color: '0/0', print_type: 'Polos', qty_per_carton: 1000 },
];

export const mockVendorPrices: VendorPrice[] = [
  { id: 'vp-01', product_id: 'd0000005-0000-0000-0000-000000000005', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 1, qty_max: 999, moq: 1000, cogs_price: 2200, cogs_print: 400, lead_time_days: 12, product: mockProducts[2], vendor: mockVendors[0] },
  { id: 'vp-02', product_id: 'd0000005-0000-0000-0000-000000000005', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 1000, qty_max: 2999, moq: 1000, cogs_price: 1950, cogs_print: 300, lead_time_days: 12, product: mockProducts[2], vendor: mockVendors[0] },
  { id: 'vp-03', product_id: 'd0000005-0000-0000-0000-000000000005', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 3000, qty_max: 999999, moq: 1000, cogs_price: 1750, cogs_print: 250, lead_time_days: 14, product: mockProducts[2], vendor: mockVendors[0] },
  
  { id: 'vp-04', product_id: 'd0000008-0000-0000-0000-000000000008', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 1, qty_max: 2999, moq: 3000, cogs_price: 240, cogs_print: 110, lead_time_days: 10, product: mockProducts[4], vendor: mockVendors[0] },
  { id: 'vp-05', product_id: 'd0000008-0000-0000-0000-000000000008', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 3000, qty_max: 9999, moq: 3000, cogs_price: 210, cogs_print: 85, lead_time_days: 10, product: mockProducts[4], vendor: mockVendors[0] },
  { id: 'vp-06', product_id: 'd0000008-0000-0000-0000-000000000008', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 10000, qty_max: 999999, moq: 3000, cogs_price: 185, cogs_print: 65, lead_time_days: 14, product: mockProducts[4], vendor: mockVendors[0] },

  { id: 'vp-07', product_id: 'd0000001-0000-0000-0000-000000000001', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 1, qty_max: 4999, moq: 5000, cogs_price: 145, cogs_print: 0, lead_time_days: 7, product: mockProducts[0], vendor: mockVendors[0] },
  { id: 'vp-08', product_id: 'd0000001-0000-0000-0000-000000000001', vendor_id: 'b0000001-0000-0000-0000-000000000001', qty_min: 5000, qty_max: 999999, moq: 5000, cogs_price: 131, cogs_print: 0, lead_time_days: 7, product: mockProducts[0], vendor: mockVendors[0] },
];

export const mockRFQs: RFQ[] = [
  {
    id: 'f0000001-0000-0000-0000-000000000001',
    rfq_code: 'DIN.58R0.092026-1',
    customer_id: 'c0000001-0000-0000-0000-000000000001',
    sales_id: 'a0000003-0000-0000-0000-000000000003',
    product_id: 'd0000008-0000-0000-0000-000000000008',
    requested_qty: 6000,
    target_date: '2026-10-25',
    status: 'processed',
    notes: 'Kebutuhan packaging foodwrap untuk outlet baru cabang Senopati',
    created_at: '2026-10-01T08:30:00Z',
    customer: mockCustomers[0],
    product: mockProducts[4],
    sales: mockUsers[2]
  },
  {
    id: 'f0000002-0000-0000-0000-000000000002',
    rfq_code: 'DIN.16R1.102026-1',
    customer_id: 'c0000002-0000-0000-0000-000000000002',
    sales_id: 'a0000003-0000-0000-0000-000000000003',
    product_id: 'd0000005-0000-0000-0000-000000000005',
    requested_qty: 1000,
    target_date: '2026-11-05',
    status: 'processed',
    notes: 'Brown Paperbag non Handle',
    created_at: '2026-10-04T10:15:00Z',
    customer: mockCustomers[1],
    product: mockProducts[2],
    sales: mockUsers[2]
  },
  {
    id: 'f0000003-0000-0000-0000-000000000003',
    rfq_code: 'DIN.11R0.102026-1',
    customer_id: 'c0000003-0000-0000-0000-000000000003',
    sales_id: 'a0000003-0000-0000-0000-000000000003',
    product_id: 'd0000001-0000-0000-0000-000000000001',
    requested_qty: 1000,
    target_date: '2026-10-20',
    status: 'pending',
    notes: 'White Window Satchel Bag',
    created_at: '2026-10-08T14:00:00Z',
    customer: mockCustomers[2],
    product: mockProducts[0],
    sales: mockUsers[2]
  },
  {
    id: 'f0000004-0000-0000-0000-000000000004',
    rfq_code: 'DIN.09R1.102026-3',
    customer_id: 'c0000004-0000-0000-0000-000000000004',
    sales_id: 'a0000004-0000-0000-0000-000000000004',
    product_id: 'd0000010-0000-0000-0000-000000000010',
    requested_qty: 1000,
    target_date: '2026-10-28',
    status: 'pending',
    notes: 'Satchel Bag Window',
    created_at: '2026-10-10T11:20:00Z',
    customer: mockCustomers[3],
    product: mockProducts[5],
    sales: mockUsers[3]
  }
];

export const mockQuotations: Quotation[] = [
  {
    id: '10000001-0000-0000-0000-000000000001',
    quotation_code: 'QUO-2026-0801',
    rfq_id: 'f0000001-0000-0000-0000-000000000001',
    customer_id: 'c0000001-0000-0000-0000-000000000001',
    sales_id: 'a0000003-0000-0000-0000-000000000003',
    status: 'approved',
    total_amount: 2370000,
    notes: 'Quotation disetujui klien, diproses ke SO',
    created_at: '2026-10-02T09:00:00Z',
    customer: mockCustomers[0],
    sales: mockUsers[2],
    items: [
      {
        id: '20000001-0000-0000-0000-000000000001',
        quotation_id: '10000001-0000-0000-0000-000000000001',
        product_id: 'd0000008-0000-0000-0000-000000000008',
        qty: 6000,
        vendor_cost: 295,
        harga_rekomendasi: 395,
        harga_rekomendasi_min: 380,
        harga_rekomendasi_max: 410,
        harga_final: 395,
        subtotal: 2370000,
        margin_nominal: 100,
        margin_percentage: 0.253, // 25.3%
        target_margin_pct: 0.25,
        is_below_margin: false,
        used_recommendation: true,
        duration_seconds: 68,
        product: mockProducts[4]
      }
    ]
  },
  {
    id: '10000002-0000-0000-0000-000000000002',
    quotation_code: 'QUO-2026-0802',
    rfq_id: 'f0000002-0000-0000-0000-000000000002',
    customer_id: 'c0000002-0000-0000-0000-000000000002',
    sales_id: 'a0000003-0000-0000-0000-000000000003',
    status: 'approved',
    total_amount: 3000000,
    notes: 'Harga rekomendasi AI langsung disetujui',
    created_at: '2026-10-05T11:30:00Z',
    customer: mockCustomers[1],
    sales: mockUsers[2],
    items: [
      {
        id: '20000002-0000-0000-0000-000000000002',
        quotation_id: '10000002-0000-0000-0000-000000000002',
        product_id: 'd0000005-0000-0000-0000-000000000005',
        qty: 1000,
        vendor_cost: 2250,
        harga_rekomendasi: 3000,
        harga_rekomendasi_min: 2900,
        harga_rekomendasi_max: 3150,
        harga_final: 3000,
        subtotal: 3000000,
        margin_nominal: 750,
        margin_percentage: 0.250, // 25%
        target_margin_pct: 0.25,
        is_below_margin: false,
        used_recommendation: true,
        duration_seconds: 75,
        product: mockProducts[2]
      }
    ]
  }
];

// DATA PURCHASE ORDER (PENGADAAN KE VENDOR)
export const mockPurchaseOrders = [
  {
    id: 'po-01',
    po_code: 'PO-2026-0901',
    ref_rfq: 'DIN.58R0.092026-1',
    vendor: mockVendors[0],
    product: mockProducts[4],
    qty: 6000,
    unit_cost: 295,
    total_cost: 1770000,
    status: 'Confirmed',
    order_date: '2026-10-03',
    eta: '2026-10-15'
  },
  {
    id: 'po-02',
    po_code: 'PO-2026-0902',
    ref_rfq: 'DIN.16R1.102026-1',
    vendor: mockVendors[0],
    product: mockProducts[2],
    qty: 1000,
    unit_cost: 2250,
    total_cost: 2250000,
    status: 'In Production',
    order_date: '2026-10-06',
    eta: '2026-10-18'
  }
];

// DATA RECEIVE ITEM (PENERIMAAN GUDANG & QC)
export const mockReceiveItems = [
  {
    id: 'rcv-01',
    receipt_code: 'RCV-2026-0041',
    po_code: 'PO-2026-0901',
    vendor: 'Mitra Kemasan Utama (SP0001)',
    product: 'Foodwrap Greaseproof Print 1 Warna',
    qty_ordered: 6000,
    qty_passed: 5980,
    qty_reject: 20,
    qc_status: 'QC Passed',
    receive_date: '2026-10-10',
    warehouse_staff: 'Bambang (Gudang QC)'
  },
  {
    id: 'rcv-02',
    receipt_code: 'RCV-2026-0042',
    po_code: 'PO-2026-0902',
    vendor: 'Mitra Kemasan Utama (SP0001)',
    product: 'Brown Paperbag Handle Sablon 1W1S',
    qty_ordered: 1000,
    qty_passed: 1000,
    qty_reject: 0,
    qc_status: 'QC Passed',
    receive_date: '2026-10-11',
    warehouse_staff: 'Bambang (Gudang QC)'
  }
];

// DATA DELIVERY (PERSIS SCREENSHOT 2 USER: DIN.58R0, DIN.16R1, WAITING, DLL.)
export const mockDeliveries = [
  {
    id: 'del-01',
    rfq_so: 'DIN.58R0.092026-1',
    sub_code: 'SO: DIN.58R0.092026-1 • WO: DIN.58W0.092026-1',
    customer: 'Monday Breakfast Club',
    company: 'PT. Pagi Penuh Rasa',
    product: 'Foodwrap',
    product_detail: 'D-25090210 Monday Breakfast Club × 6000',
    tipe: 'Digipack',
    sales: 'Shalsabilla Redwina',
    status: 'Waiting',
    items_count: 2,
    tanggal: '12 October 2026'
  },
  {
    id: 'del-02',
    rfq_so: 'DIN.16R1.102026-1',
    sub_code: 'SO: DIN.16R1.102026-1 • WO: DIN.16W1.102026-1',
    customer: 'Noku Bakeshop',
    company: 'Yasmeen Aulia',
    product: 'Brown Paperbag non Handle',
    product_detail: 'D-26070087 Noku Bakeshop × 1000',
    tipe: 'Digipack',
    sales: 'Shalsabilla Redwina',
    status: 'Waiting',
    items_count: 1,
    tanggal: '12 October 2026'
  },
  {
    id: 'del-03',
    rfq_so: 'DIN.11R0.102026-1',
    sub_code: 'SO: DIN.11R0.102026-1 • WO: DIN.11W0.102026-1',
    customer: 'Chindolondo',
    company: 'Salma Laila',
    product: 'White Window Satchel Bag',
    product_detail: 'D-26100018 Chindolondo × 1000',
    tipe: 'Digipack',
    sales: 'Shalsabilla Redwina',
    status: 'Waiting',
    items_count: 1,
    tanggal: '09 October 2026'
  },
  {
    id: 'del-04',
    rfq_so: 'DIN.09R1.102026-3',
    sub_code: 'SO: DIN.09R1.102026-3 • WO: DIN.09W1.102026-3',
    customer: 'Ugiro Coffee',
    company: 'Aditya Susianto',
    product: 'Satchel Bag Window',
    product_detail: 'D-26100033 Ugiro Coffee × 1000',
    tipe: 'Digipack',
    sales: 'Nadia Putri',
    status: 'Waiting',
    items_count: 1,
    tanggal: '09 October 2026'
  },
  {
    id: 'del-05',
    rfq_so: 'DIN.02R1.102026-6',
    sub_code: 'SO: DIN.02R1.102026-6 • WO: DIN.02W1.102026-6',
    customer: 'PT Stahl Arbeit',
    company: 'PT Stahl Arbeit',
    product: 'Note Book Hitam A5',
    product_detail: 'D-26080043 Stahl Arbeit × 100',
    tipe: 'Digipack',
    sales: 'Sales Management',
    status: 'Waiting',
    items_count: 1,
    tanggal: '09 October 2026'
  }
];

// DATA INVOICE & PROFORMA
export const mockInvoices = [
  {
    id: 'inv-01',
    invoice_no: 'INV-2026-0801',
    so_code: 'SO-DIN.58R0.092026-1',
    customer: 'Monday Breakfast Club',
    amount: 2370000,
    due_date: '2026-10-26',
    status: 'Unpaid',
    payment_terms: 'TOP 14 Hari'
  },
  {
    id: 'inv-02',
    invoice_no: 'INV-2026-0802',
    so_code: 'SO-DIN.16R1.102026-1',
    customer: 'Noku Bakeshop',
    amount: 3000000,
    due_date: '2026-10-19',
    status: 'Paid',
    payment_terms: 'Cash Before Delivery'
  }
];

export const mockProformaInvoices = [
  {
    id: 'pi-01',
    pi_no: 'PI-2026-0091',
    rfq_code: 'DIN.11R0.102026-1',
    customer: 'Chindolondo Official',
    dp_amount: 1500000,
    total_amount: 3000000,
    status: 'DP Received (50%)',
    date: '2026-10-09'
  }
];

// DATA ORDER HISTORY
export const mockOrderHistory = [
  {
    id: 'hist-01',
    order_code: 'DIN.40R0.082026-1',
    customer: 'Monday Breakfast Club',
    product: 'Foodwrap 30x30 cm',
    qty: 5000,
    total_revenue: 1950000,
    margin_achieved: '25.6%',
    completed_date: '2026-09-15',
    status: 'Completed'
  },
  {
    id: 'hist-02',
    order_code: 'DIN.22R1.082026-3',
    customer: 'Bakkershuis Artisan Bread',
    product: 'White Window Bread Bag',
    qty: 2000,
    total_revenue: 1320000,
    margin_achieved: '26.2%',
    completed_date: '2026-09-22',
    status: 'Completed'
  }
];

// DATA AKTIVITAS HARIAN SALES
export const mockSalesActivities = [
  {
    id: 'act-01',
    sales: 'Shalsabilla Redwina',
    date: '12 October 2026',
    customer: 'Monday Breakfast Club',
    activity_type: 'Follow-up Delivery',
    notes: 'Kordinasi jadwal pengiriman 6000 pcs foodwrap ke outlet Senopati.',
    status: 'Done'
  },
  {
    id: 'act-02',
    sales: 'Nadia Putri',
    date: '12 October 2026',
    customer: 'Ugiro Coffee Roastery',
    activity_type: 'Negosiasi Harga',
    notes: 'Klien meminta diskon kuantitas untuk Satchel Bag Window 1000 pcs.',
    status: 'In Progress'
  }
];

// DATA PAYMENT REQUEST
export const mockPaymentRequests = [
  {
    id: 'pr-01',
    request_no: 'PR-2026-0118',
    vendor: 'Mitra Kemasan Utama (SP0001)',
    amount: 1770000,
    purpose: 'Pelunasan PO-2026-0901 (Kertas Greaseproof 40 gsm)',
    requested_by: 'Handoko (Purchasing)',
    status: 'Approved Finance',
    date: '2026-10-11'
  },
  {
    id: 'pr-02',
    request_no: 'PR-2026-0119',
    vendor: 'Solusi Grafika & Sablon (SP0003)',
    amount: 300000,
    purpose: 'Biaya setting sablon silinder master Brown Paperbag',
    requested_by: 'Budi Santoso (Manager)',
    status: 'Pending Finance',
    date: '2026-10-12'
  }
];
