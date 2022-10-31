export interface IReviewRequest {
	review_text: string;
	star: string;
}

export interface IReview extends IReviewRequest {
	id: string;
}
