export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  category: string;
  date: string;
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
}