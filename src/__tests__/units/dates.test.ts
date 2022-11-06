import { areDatesConflicting } from "../../services/rooms/auxiliaryFunctions/dates";

describe("UNIT TESTS - Dates auxiliary functions", () => {
  let checkin1 = new Date("2023-02-20");
  let checkout1 = new Date("2023-02-23");
  let checkin2: Date;
  let checkout2: Date;

  test("areDatesConflicting - should return true for two identical time intervals", () => {
    // same interval
    checkin2 = new Date("2023-02-20");
    checkout2 = new Date("2023-02-23");
    expect(areDatesConflicting(checkin1, checkout1, checkin2, checkout2)).toBe(
      true
    );
    expect(areDatesConflicting(checkin2, checkout2, checkin1, checkout1)).toBe(
      true
    );
  });

  test("areDatesConflicting - should return true when both intervals have the same end date", () => {
    checkin2 = new Date("2023-02-10");
    checkout2 = new Date("2023-02-23");
    expect(areDatesConflicting(checkin1, checkout1, checkin2, checkout2)).toBe(
      true
    );
    expect(areDatesConflicting(checkin2, checkout2, checkin1, checkout1)).toBe(
      true
    );
  });

  test("areDatesConflicting - should return true when both intervals have the same start date", () => {
    // same checkin
    checkin2 = new Date("2023-02-20");
    checkout2 = new Date("2023-02-26");
    expect(areDatesConflicting(checkin1, checkout1, checkin2, checkout2)).toBe(
      true
    );
    expect(areDatesConflicting(checkin2, checkout2, checkin1, checkout1)).toBe(
      true
    );
  });

  test("areDatesConflicting - should return true when one interval contains the other", () => {
    // internal interval
    checkin2 = new Date("2023-02-21");
    checkout2 = new Date("2023-02-22");
    expect(areDatesConflicting(checkin1, checkout1, checkin2, checkout2)).toBe(
      true
    );
    expect(areDatesConflicting(checkin2, checkout2, checkin1, checkout1)).toBe(
      true
    );
  });

  test("areDatesConflicting - should return false when one interval's start is the other interval's end", () => {
    // checkin on checkout
    checkin2 = new Date("2023-02-19");
    checkout2 = new Date("2023-02-20");
    expect(areDatesConflicting(checkin1, checkout1, checkin2, checkout2)).toBe(
      false
    );
    expect(areDatesConflicting(checkin2, checkout2, checkin1, checkout1)).toBe(
      false
    );
  });
});
