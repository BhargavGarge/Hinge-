// types.ts
export interface User {
  userId: string;
  firstName: string;
  imageUrls: string[];
  prompts?: Prompt[];
  subscriptions?: Subscription[];
}

export interface Like {
  _id?: string;
  userId: User;
  comment?: string;
  type: 'image' | 'prompt' | 'content';
  image?: string;
  prompt?: string;
  createdAt?: string;
}

export interface Prompt {
  question: string;
  answer: string;
}

export interface Subscription {
  status: 'active' | 'inactive' | 'expired';
  type: string;
  startDate: string;
  endDate: string;
}

export interface UserInfo {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  imageUrls: string[];
  prompts?: Prompt[];
  subscriptions?: Subscription[];
  createdAt?: string;
  updatedAt?: string;
}
