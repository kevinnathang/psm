const csv = require("csvtojson");
const fs = require("fs");

(async () => {
  //Convert CSV file to JSON
  const dataArr = await csv().fromFile("PSMrawdata.csv");

  //Get the maximum sample number
  const sampleNum = Math.max(...dataArr.map((obj) => obj["sample number"]));

  //Get different arrays for each type of data for later calculation
  const dataVeryHigh = dataArr.map((obj) => parseFloat(obj["高すぎる"]));
  const dataHigh = dataArr.map((obj) => parseFloat(obj["高い"]));
  const dataLow = dataArr.map((obj) => parseFloat(obj["安い"]));
  const dataTooLow = dataArr.map((obj) => parseFloat(obj["安すぎる"]));

  //Function to calculate the number of values in a given array within a specified range (simulating excel COUNTIF) for high prices
  function calculateCountifHigh(array, limit) {
    return array.filter((data) => data <= limit).length / sampleNum;
  }

  //Function to calculate the number of values in a given array within a specified range (simulating excel COUNTIF) for low prices
  function calculateCountifLow(array, limit) {
    return array.filter((data) => data >= limit).length / sampleNum;
  }

  //Set differente aways for the 4 types of prices
  const expensive = [];
  const tooExpensive = [];
  const cheap = [];
  const tooCheap = [];

  //Calculate count for 高い and 高すぎる
  for (let i = 50; i <= 600; i += 50) {
    const count = calculateCountifHigh(dataHigh, i);
    expensive.push({ key: i, value: count.toFixed(3) });
    const count2 = calculateCountifHigh(dataVeryHigh, i);
    tooExpensive.push({ key: i, value: count2.toFixed(3) });
  }

  //Calculate count for 安い and 安すぎる
  for (let i = 50; i <= 600; i += 50) {
    const count = calculateCountifLow(dataLow, i);
    cheap.push({ key: i, value: count.toFixed(3) });
    const count2 = calculateCountifLow(dataTooLow, i);
    tooCheap.push({ key: i, value: count2.toFixed(3) });
  }
  console.log(expensive, cheap, tooExpensive, tooCheap);
})();
