export interface Action {
  targetType: "WALLET";
  actionType: "PAYMENT" | "RECEIPT" | "FUNDING",
  status: "CREATED",
  amount: number,
  createdAt: string,
  id: number,
  target: string,
  params: {
    amountDecimal: number,
    mintSymbol: string,
  }

}