import { IngredientDetail } from '../modals/order.model';

export interface Job {
  id?: number;
  title: string;
  description: string;
  phone?: string;
  urgent?: boolean;
}

export interface News {
  id?: number;
  title: string;
  description: string;
  urgent?: boolean;
}

export interface Contact {
  title: string;
  subject?: string;
  priority?: boolean;
}

export interface InfoCategory {
  id: string;
  label: string;
  data: IngredientDetail[];
  urgent?: boolean;
}

export type FooterItem = Job | News | InfoCategory;