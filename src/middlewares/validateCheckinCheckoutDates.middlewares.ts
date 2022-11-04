import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError";

const validateCheckinCheckoutDates = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { checkin, checkout } = req.body;

	// Invalid date format. Should be YYYY-MM-DD;
	const validRegExpDate = /^\d{4}-\d{2}-\d{2}$/;
	const isCorrectCheckinDate = validRegExpDate.test(checkin);
	const isCorrectCheckoutDate = validRegExpDate.test(checkout);

	if (!isCorrectCheckinDate || !isCorrectCheckoutDate)
		throw new AppError("Invalid date format. Should be YYYY-MM-DD.", 400);

	//check if the date is valid (must be YYYY-MM-DD) to work;
	const checkinDate = new Date(checkin);
	const checkoutDate = new Date(checkout);
	const actualDate = new Date();

	if (isNaN(Number(checkinDate)) || isNaN(Number(checkoutDate)))
		throw new AppError("Invalid date. This date does not exist.", 400);

	//check if checkin > newDate
	//checkin can be the same newDate day?
	let isCheckinToday = false;
	const todayDay = actualDate.getDay() + 1;
	const todayMonth = actualDate.getMonth() + 1;
	const todayYear = actualDate.getFullYear();

	const checkinDay = checkinDate.getDay();
	const checkinMonth = checkinDate.getMonth();
	const checkinYear = checkinDate.getFullYear();

	if (
		todayDay === checkinDay &&
		todayMonth === checkinMonth &&
		todayYear === checkinYear
	) {
		isCheckinToday = true;
	}

	if (actualDate.getTime() > checkinDate.getTime() && !isCheckinToday)
		throw new AppError(
			"Invalid checkin date. Checkin should not be in a date that already has been passed."
		);

	//check if the checkin > checkout
	if (checkinDate.getTime() >= checkoutDate.getTime())
		throw new AppError(
			"Invalid checkin date. Checkout date should be after checkin date."
		);

	next();
};

export default validateCheckinCheckoutDates;
