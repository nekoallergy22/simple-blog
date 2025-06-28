export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  category: string;
  section?: string; // ai, python, datascience, tensorflow
  date: string;
  difficulty?: string;
  level?: number;
  number?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  path: string;
  status: string;
  icon: React.ReactNode;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  section: string;
  createdAt: Date;
}

export interface PostFrontMatter {
  title: string;
  date: string;
  category: string;
  section?: string;
  slug?: string;
  difficulty?: string;
  level?: number;
  number?: number;
}