export interface ProductReview {
  id: number;
  productId: number;
  userEmail: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewRequest {
  rating: number;
  comment: string;
}