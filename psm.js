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
    const dataVeryHigh = dataArr.map((obj) => parseFloat(obj["高すぎる"])); //「高すぎる」の全部答え
    const dataHigh = dataArr.map((obj) => parseFloat(obj["高い"])); //「高い」の全部答え
    const dataLow = dataArr.map((obj) => parseFloat(obj["安い"])); //「安い」の全部答え
    const dataTooLow = dataArr.map((obj) => parseFloat(obj["安すぎる"])); //「安すぎる」の全部答え

    //指定された配列の値が、指定された範囲内にある個数を計算する関数（エクセルのCOUNTIFをシミュレートする）。（高い値段）
    function calculateCountifHigh(array, limit) {
      return array.filter((data) => data <= limit).length / sampleNum;
    }

    //指定された配列の値が、指定された範囲内にある個数を計算する関数（エクセルのCOUNTIFをシミュレートする）。（低い値段）
    function calculateCountifLow(array, limit) {
      return array.filter((data) => data >= limit).length / sampleNum;
    }

    //4種類の価格に対して異なる配列を設定する。
    const expensive = []; //高いと思う人数
    const tooExpensive = []; //高すぎると思う人数
    const cheap = []; //安いと思う人数
    const tooCheap = []; //安すぎると思う人数

    //高いと高すぎるのカウントを計算する、正しい配列にパッシュ
    for (let i = 50; i <= 600; i += 50) {
      const count = calculateCountifHigh(dataHigh, i);
      expensive.push({ key: i, value: count.toFixed(2) });
      const count2 = calculateCountifHigh(dataVeryHigh, i);
      tooExpensive.push({ key: i, value: count2.toFixed(2) });
    }

    //安いと安すぎるのカウントを計算する、正しい配列にパッシュ
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
      const x1 = `${tooExpensive[4].key}`; // x1
      const y1 = `${tooExpensive[4].value}`; // y1
      const x2 = `${tooExpensive[5].key}`; // x2
      const y2 = `${tooExpensive[5].value}`; // y2

      const x3 = `${cheap[4].key}`; // x3
      const y3 = `${cheap[4].value}`; // y3
      const x4 = `${cheap[5].key}`; // x4
      const y4 = `${cheap[5].value}`; // y4

      //PDFファイルからの数学を使う
      return console.log(
        `最高価格: ${Math.round(
          ((y3 - y1) * (x1 - x2) * (x3 - x4) +
            x1 * (y1 - y2) * (x3 - x4) -
            x3 * (y3 - y4) * (x1 - x2)) /
            ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4))
        )}円`
      );
    }

    function calc妥協価格() {
      const x1 = `${expensive[4].key}`;
      const y1 = `${expensive[4].value}`;
      const x2 = `${expensive[5].key}`;
      const y2 = `${expensive[5].value}`;

      const x3 = `${cheap[4].key}`;
      const y3 = `${cheap[4].value}`;
      const x4 = `${cheap[5].key}`;
      const y4 = `${cheap[5].value}`;

      return console.log(
        `妥協価格: ${Math.round(
          ((y3 - y1) * (x1 - x2) * (x3 - x4) +
            x1 * (y1 - y2) * (x3 - x4) -
            x3 * (y3 - y4) * (x1 - x2)) /
            ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4))
        )}円`
      );
    }

    function calc理想価格() {
      const x1 = `${tooExpensive[4].key}`;
      const y1 = `${tooExpensive[4].value}`;
      const x2 = `${tooExpensive[5].key}`;
      const y2 = `${tooExpensive[5].value}`;

      const x3 = `${tooCheap[4].key}`;
      const y3 = `${tooCheap[4].value}`;
      const x4 = `${tooCheap[5].key}`;
      const y4 = `${tooCheap[5].value}`;

      return console.log(
        `理想価格: ${Math.round(
          ((y3 - y1) * (x1 - x2) * (x3 - x4) +
            x1 * (y1 - y2) * (x3 - x4) -
            x3 * (y3 - y4) * (x1 - x2)) /
            ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4))
        )}円`
      );
    }

    function calc最低品質保証価格() {
      const x1 = `${expensive[3].key}`;
      const y1 = `${expensive[3].value}`;
      const x2 = `${expensive[4].key}`;
      const y2 = `${expensive[4].value}`;

      const x3 = `${tooCheap[3].key}`;
      const y3 = `${tooCheap[3].value}`;
      const x4 = `${tooCheap[4].key}`;
      const y4 = `${tooCheap[4].value}`;

      return console.log(
        `最低品質保証価格: ${Math.round(
          ((y3 - y1) * (x1 - x2) * (x3 - x4) +
            x1 * (y1 - y2) * (x3 - x4) -
            x3 * (y3 - y4) * (x1 - x2)) /
            ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4))
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
