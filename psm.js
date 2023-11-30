const fs = require("fs");
const csv = require("csvtojson");
const { Parser } = require("json2csv");

(async () => {
  const data = await csv().fromFile("PSMrawdata.csv");

  console.log(data);
})();
