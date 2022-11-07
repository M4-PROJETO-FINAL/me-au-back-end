import { IReservation } from "../reservations";

export interface IReviewRequest {
  review_text: string;
  stars: number;
  reservation_id?: string;
}

export interface IReview extends IReviewRequest {
  id: string;
}

export interface IEditReview {
  review_text?: string;
  stars?: number;
}
