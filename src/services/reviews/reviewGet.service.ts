import AppDataSource from "../../data-source";
import { Review } from "../../entities/review.entity";
import { IReview } from "../../interfaces/reviews";

const reviewGetService = async () => {
  const reviewRepository = AppDataSource.getRepository(Review);

  // Falta voltar aqui para pegar a tipagem!
  // let reviews: IReview[];
  let reviews: any;

  reviews = await reviewRepository.find({
    relations: {
      user: true,
    },
  });

  return reviews;
};

export default reviewGetService;
