import fs from "fs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

const regions = JSON.parse(
  fs.readFileSync(`./data/timezone_offsets_by_region.json`).toString()
);

const offsetsByYear = JSON.parse(
  fs.readFileSync(`./data/daylight_transitions_by_year.json`).toString()
);

export const getTimezoneOffsetByRegion = (region, fauxUtcDate) => {
  // NOTE: this function uses a faux UTC date to prevent javascript from
  // localizing the date to the timezone of the server

  // convert region to uppercase
  const regionKey = region.toUpperCase();

  if (!(regionKey in regions)) throw new Error(`Unknown region: ${region}`);

  // find region in index
  const [offset, offsetDst] = regions[regionKey];

  // see if offsets are different
  if (offset === offsetDst) return offset;

  // determine if time is DST for region
  const currentYear = fauxUtcDate.getFullYear().toString();

  if (currentYear === "NaN") throw new Error("Bad date");

  if (!(currentYear in offsetsByYear))
    throw new Error(`Unknown year: ${currentYear}`);

  const transitionsByRegion = offsetsByYear[currentYear];

  if (!(regionKey in transitionsByRegion)) return offset;

  const [startDate, stopDate] = transitionsByRegion[regionKey];
  const startDateUtc = new Date(`${startDate}.000Z`);
  const stopDateUtc = new Date(`${stopDate}.000Z`);

  const isDst =
    fauxUtcDate >= startDateUtc && fauxUtcDate <= stopDateUtc ? true : false;

  return isDst ? offsetDst : offset;
};

const offsetToMinutes = (offset) => {
  const [operation, ...hoursAndMinutes] = offset.split("");
  const [hours, minutes] = hoursAndMinutes
    .join("")
    .split(":")
    .map((value) => parseInt(value));

  return (hours * 60 + minutes) * (operation === "-" ? 1 : -1);
};

export const makeUtcDate = (
  region,
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0
) => {
  // first make a UTC date that matches the requested input
  const dateWithoutTimezone = `${year}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour
    .toString()
    .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second
    .toString()
    .padStart(2, "0")}`;

  // determine the UTC offset by region
  const offset = getTimezoneOffsetByRegion(
    region,
    new Date(`${dateWithoutTimezone}.000Z`)
  );

  // add or substract the minutes
  const minutes = offsetToMinutes(offset);
  const finalDate = new Date(`${dateWithoutTimezone}.000Z`);
  finalDate.setMinutes(minutes);
  return finalDate;
};

export const localizeDateToString = (
  region,
  utcDate,
  format = "YYYY-MM-DDTHH:mm:ss"
) => {
  const offset = getTimezoneOffsetByRegion(region, utcDate);
  const minutes = offsetToMinutes(offset) * -1;
  const mutateDate = new Date(utcDate.getTime());
  mutateDate.setMinutes(minutes);
  return dayjs(mutateDate).utc().format(format);
};

export default null;
