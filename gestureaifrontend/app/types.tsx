// types.ts
export type RootStackParamList = {
    Shop: undefined;
    Details: {
      userId: string;
      type: 'product' | 'subscription';
      name: string;
      price: number;
      quantity?: number;
      description?: string;
    };
  };
  