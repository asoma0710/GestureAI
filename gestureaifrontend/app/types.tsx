// types.ts
export type RootStackParamList = {
    Shop: undefined;
    Details: {
      type: 'product' | 'subscription';
      name: string;
      price: number;
      quantity?: number;
      description?: string;
    };
  };
  