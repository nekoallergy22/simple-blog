export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  category: string;
  date: string;
  difficulty?: string;
  level?: number;
  number?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

export interface PostFrontMatter {
  title: string;
  date: string;
  category: string;
  slug?: string;
  difficulty?: string;
  level?: number;
  number?: number;
}