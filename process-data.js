import fs from "fs";

const data = JSON.parse(
  fs.readFileSync(`.data/daylight_transitions_by_region.json`).toString()
);

const currentYear = new Date().getFullYear();

const dataByYear = {};

Object.keys(data).forEach((region) => {
  Object.keys(data[region])
    .filter((year) => {
      if (year === "offset") return false;
      return parseInt(year) < currentYear ? false : true;
    })
    .forEach((year) => {
      const offsets = data[region][year]["daylight"];

      if (!(year in dataByYear)) dataByYear[year] = {};
      dataByYear[year][region.toUpperCase()] = offsets;
    });
});

fs.writeFileSync(
  `./data/daylight_transitions_by_year.json`,
  JSON.stringify(dataByYear, null, 4)
);

const regions = fs
  .readFileSync(`./data/region_offsets.tab`)
  .toString()
  .split("\n")
  .reduce((acc, line) => {
    const [region, start, stop] = line.split("\t");
    return { ...acc, [region]: [start, stop] };
  }, {});

fs.writeFileSync(
  `./data/timezone_offsets_by_region.json`,
  JSON.stringify(regions, null, 4)
);
