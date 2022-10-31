export interface IReviewRequest {
  review_text: string;
  stars: number;
}

export interface IReview extends IReviewRequest {
  id: string;
}
