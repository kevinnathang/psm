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
    expensive.push({ key: i, value: count.toFixed(2) });
    const count2 = calculateCountifHigh(dataVeryHigh, i);
    tooExpensive.push({ key: i, value: count2.toFixed(2) });
  }

  //Calculate count for 安い and 安すぎる
  for (let i = 50; i <= 600; i += 50) {
    const count = calculateCountifLow(dataLow, i);
    cheap.push({ key: i, value: count.toFixed(2) });
    const count2 = calculateCountifLow(dataTooLow, i);
    tooCheap.push({ key: i, value: count2.toFixed(2) });
  }
  //   console.log(expensive, cheap, tooExpensive, tooCheap);

  //最高価格 = tooExpensive and cheap
  function calc最高価格() {
    const C3 = `${tooExpensive[4].key}`;
    const D3 = `${tooExpensive[4].value}`;
    const C4 = `${tooExpensive[5].key}`;
    const D4 = `${tooExpensive[5].value}`;

    const C5 = `${cheap[4].key}`;
    const D5 = `${cheap[4].value}`;
    const C6 = `${cheap[5].key}`;
    const D6 = `${cheap[5].value}`;

    return console.log(
      `最高価格: ${Math.round(
        ((D5 - D3) * (C3 - C4) * (C5 - C6) +
          C3 * (D3 - D4) * (C5 - C6) -
          C5 * (D5 - D6) * (C3 - C4)) /
          ((D3 - D4) * (C5 - C6) - (C3 - C4) * (D5 - D6))
      )}円`
    );
  }

  function calc妥協価格() {
    const C3 = `${expensive[4].key}`;
    const D3 = `${expensive[4].value}`;
    const C4 = `${expensive[5].key}`;
    const D4 = `${expensive[5].value}`;

    const C5 = `${cheap[4].key}`;
    const D5 = `${cheap[4].value}`;
    const C6 = `${cheap[5].key}`;
    const D6 = `${cheap[5].value}`;

    return console.log(
      `妥協価格: ${Math.round(
        ((D5 - D3) * (C3 - C4) * (C5 - C6) +
          C3 * (D3 - D4) * (C5 - C6) -
          C5 * (D5 - D6) * (C3 - C4)) /
          ((D3 - D4) * (C5 - C6) - (C3 - C4) * (D5 - D6))
      )}円`
    );
  }

  function calc理想価格() {
    const C3 = `${tooExpensive[4].key}`;
    const D3 = `${tooExpensive[4].value}`;
    const C4 = `${tooExpensive[5].key}`;
    const D4 = `${tooExpensive[5].value}`;

    const C5 = `${tooCheap[4].key}`;
    const D5 = `${tooCheap[4].value}`;
    const C6 = `${tooCheap[5].key}`;
    const D6 = `${tooCheap[5].value}`;

    return console.log(
      `理想価格: ${Math.round(
        ((D5 - D3) * (C3 - C4) * (C5 - C6) +
          C3 * (D3 - D4) * (C5 - C6) -
          C5 * (D5 - D6) * (C3 - C4)) /
          ((D3 - D4) * (C5 - C6) - (C3 - C4) * (D5 - D6))
      )}円`
    );
  }

  function calc最低品質保証価格() {
    const C3 = `${expensive[4].key}`;
    const D3 = `${expensive[4].value}`;
    const C4 = `${expensive[5].key}`;
    const D4 = `${expensive[5].value}`;

    const C5 = `${tooCheap[4].key}`;
    const D5 = `${tooCheap[4].value}`;
    const C6 = `${tooCheap[5].key}`;
    const D6 = `${tooCheap[5].value}`;

    return console.log(
      `最低品質保証価格: ${Math.round(
        ((D5 - D3) * (C3 - C4) * (C5 - C6) +
          C3 * (D3 - D4) * (C5 - C6) -
          C5 * (D5 - D6) * (C3 - C4)) /
          ((D3 - D4) * (C5 - C6) - (C3 - C4) * (D5 - D6))
      )}円`
    );
  }
  calc最低品質保証価格();
  calc理想価格();
  calc妥協価格();
  calc最高価格();
})();
