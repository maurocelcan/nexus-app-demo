export interface SkuData {
  id: string;
  name: string;
  category: string;
  sellIn: number;
  sellOut: number;
  passthrough: number;
  distributionNum: number;
  buyingCustomers: number;
  netRevenue: number;
  margin: number;
  tradeSpend: number;
  stock: number;
  vsbudget: number;
  channel: string;
}

export interface ChannelData {
  name: string;
  sellIn: number;
  sellOut: number;
  passthrough: number;
  distribution: number;
  customers: number;
}

export type SalesFilterPeriod = "MTD" | "QTD" | "YTD" | "6M" | "12M";

export interface SalesFilter {
  product: string;
  channel: string;
  period: SalesFilterPeriod;
  region: string;
  customer: string;
}
