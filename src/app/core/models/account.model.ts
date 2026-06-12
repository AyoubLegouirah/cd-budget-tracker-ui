export interface Account {
  id: number;
  name: string;
  balance: number;
  currency: string;
}

export interface CreateAccountRequest {
  name: string;
  balance: number;
  currency: string;
}
