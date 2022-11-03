import { Reservation } from "../../../entities/reservation.entity";

/**
 * Given an array of reservations, returns the dates of the earliest checkin and the latest checkout among those reservations.
 *
 * Return format:
 *
 * [earliestCheckin, latestCheckout]
 */
export const getMinAndMaxDates = (
  reservationArray: Reservation[]
): [Date, Date] => {
  let minCheckin = reservationArray[0].checkin;
  let maxCheckout = reservationArray[0].checkout;
  for (let i = 1; i < reservationArray.length; i++) {
    const reservation = reservationArray[i];
    if (reservation.checkin.getTime() < minCheckin.getTime()) {
      minCheckin = reservation.checkin;
    }
    if (reservation.checkout.getTime() > maxCheckout.getTime()) {
      maxCheckout = reservation.checkout;
    }
  }
  return [minCheckin, maxCheckout];
};

/**
 * Returns an array of dates with all days spanning a given range, starting from minDate and ending on maxDate (inclusive)
 *
 * @example
 *
 * getDatesInRange('2010-01-20', '2010-01-24')
 * // returns:
 * ['2010-01-20', '2010-01-21', '2010-01-22', '2010-01-23', '2010-01-24']
 * // (except that dates are actually Date objects instead of strings)
 */
export const getDatesInRange = (minDate: Date, maxDate: Date): Date[] => {
  const dates: Date[] = [minDate];
  let currDate = minDate;
  while (currDate.getTime() < maxDate.getTime()) {
    currDate.setDate(currDate.getDate() + 1);
    dates.push(currDate);
  }

  return dates;
};