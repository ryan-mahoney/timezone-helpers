import {
  getTimezoneOffsetByRegion,
  makeUtcDate,
  localizeDateToString,
} from "./index";

test("get offset for a LA during DST", () => {
  expect(
    getTimezoneOffsetByRegion(
      "AMERICA/LOS_ANGELES",
      new Date("2022-03-13 11:00:00.000Z")
    )
  ).toBe("-07:00");
});

test("get offset for a LA not during DST", () => {
  expect(
    getTimezoneOffsetByRegion(
      "AMERICA/LOS_ANGELES",
      new Date("2022-01-13 11:00:00.000Z")
    )
  ).toBe("-08:00");
});

test("make UTC date from region and date parts", () => {
  expect(
    makeUtcDate("AMERICA/LOS_ANGELES", 2022, 3, 13, 11).toUTCString()
  ).toBe("Sun, 13 Mar 2022 18:00:00 GMT");
});

test("handle unknown region", () => {
  expect(() => {
    makeUtcDate("VENUS", 2022, 3, 13, 11).toUTCString();
  }).toThrow(new Error("Unknown region: VENUS"));
});

test("handle bad year", () => {
  expect(() => {
    makeUtcDate("AMERICA/LOS_ANGELES", 1979, 3, 13, 11).toUTCString();
  }).toThrow(new Error("Unknown year: 1979"));
});

test("handle bad date", () => {
  expect(() => {
    makeUtcDate("AMERICA/LOS_ANGELES", 2022, 50, 13, 11).toUTCString();
  }).toThrow(new Error("Bad date"));
});

test("date accuracy in my time", () => {
  const dateUtcNy = makeUtcDate("AMERICA/NEW_YORK", 2022, 2, 27, 14);
  const dateFormattedNy = localizeDateToString("AMERICA/NEW_YORK", dateUtcNy);
  expect(dateUtcNy.toISOString()).toBe("2022-02-27T19:00:00.000Z");
  expect(dateFormattedNy).toBe("2022-02-27T14:00:00");
});
