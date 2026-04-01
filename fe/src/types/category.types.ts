export interface Category {
  id: string;
  emoji: string;
  label: string;
  type: 'idea' | 'task';
  mandatory: boolean;
}
