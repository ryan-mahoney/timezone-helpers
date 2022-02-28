import fs from "fs";

const currentYear = new Date().getFullYear().toString();

const regions = JSON.parse(
  fs.readFileSync(`./data/timezone_offsets_by_region.json`).toString()
);

const offsetsByYear = JSON.parse(
  fs.readFileSync(`./data/daylight_transitions_by_year.json`).toString()
);

Object.keys(regions).forEach((region) => {
  const [start, stop] = regions[region];
  if (start !== stop) {
    if (!(region in offsetsByYear[currentYear])) {
      console.log(`${region} not found`);
    }
  }
});
