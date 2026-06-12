export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon: string;
}
