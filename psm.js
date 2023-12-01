const csv = require("csvtojson");
const fs = require("fs");

const args = process.argv.slice(2);

//必要な引数がノードコマンドラインで提供されているかチェックする。
if (args.length !== 2 || args[0] !== "--csvfile") {
  console.log(
    `引数 '--csvfile' でCSVファイルを指定してください。ファイルの末尾に".csv "が含まれていることを確認してください。`
  );
  process.exit(1);
}

const csvFilePath = args[1];

(async () => {
  try {
    //CSVファイルをJSONに変換する
    const dataArr = await csv().fromFile(csvFilePath);

    //最大サンプル数の取得
    const sampleNum = Math.max(...dataArr.map((obj) => obj["sample number"]));

    //後で計算するために、データの種類ごとに異なる配列を取得する。
    const dataVeryHigh = dataArr.map((obj) => parseFloat(obj["高すぎる"]));
    const dataHigh = dataArr.map((obj) => parseFloat(obj["高い"]));
    const dataLow = dataArr.map((obj) => parseFloat(obj["安い"]));
    const dataTooLow = dataArr.map((obj) => parseFloat(obj["安すぎる"]));

    //指定された配列の値が、指定された範囲内にある個数を計算する関数（エクセルのCOUNTIFをシミュレートする）。（高い値段）
    function calculateCountifHigh(array, limit) {
      return array.filter((data) => data <= limit).length / sampleNum;
    }

    //指定された配列の値が、指定された範囲内にある個数を計算する関数（エクセルのCOUNTIFをシミュレートする）。（低い値段）
    function calculateCountifLow(array, limit) {
      return array.filter((data) => data >= limit).length / sampleNum;
    }

    //4種類の価格に対して異なる配列を設定する。
    const expensive = [];
    const tooExpensive = [];
    const cheap = [];
    const tooCheap = [];

    //高いと高すぎるのカウントを計算する
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

    //EXCELのグラフに基づいて、関数の配列インデックスを決定する。
    //線が250円と300円の間で交差する場合、インデックス4と5を使用。
    //線が200円と250円の間で交差する場合は、インデックス3と4を使用する。
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
      const C3 = `${expensive[4].key}`; // x1
      const D3 = `${expensive[4].value}`; // y1
      const C4 = `${expensive[5].key}`; // x2
      const D4 = `${expensive[5].value}`; // y2

      const C5 = `${cheap[4].key}`; // x3
      const D5 = `${cheap[4].value}`; // y3
      const C6 = `${cheap[5].key}`; // x4
      const D6 = `${cheap[5].value}`; // y4

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
      const C3 = `${expensive[3].key}`;
      const D3 = `${expensive[3].value}`;
      const C4 = `${expensive[4].key}`;
      const D4 = `${expensive[4].value}`;

      const C5 = `${tooCheap[3].key}`;
      const D5 = `${tooCheap[3].value}`;
      const C6 = `${tooCheap[4].key}`;
      const D6 = `${tooCheap[4].value}`;

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
  } catch (error) {
    console.error("エラーが発生した:", error);
  }
})();
