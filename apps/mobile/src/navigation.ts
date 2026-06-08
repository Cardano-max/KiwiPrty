export type RootStackParamList = {
  Tabs: undefined;
  Product: { slug: string };
  Login: undefined;
  Orders: undefined;
  Assistant: undefined;
  SupplierDashboard: undefined;
  SupplierProducts: undefined;
  SupplierOrders: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: { q?: string } | undefined;
  Cart: undefined;
  Account: undefined;
};
