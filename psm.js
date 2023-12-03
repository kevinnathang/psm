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

    //値段を正しい配列に入れる
    for (let i = 50; i <= 600; i += 50) {
      const countHigh = calculateCountifHigh(dataHigh, i);
      expensive.push({ key: i, value: countHigh.toFixed(2) });

      const countVeryHigh = calculateCountifHigh(dataVeryHigh, i);
      tooExpensive.push({ key: i, value: countVeryHigh.toFixed(2) });

      const countLow = calculateCountifLow(dataLow, i);
      cheap.push({ key: i, value: countLow.toFixed(2) });

      const countTooLow = calculateCountifLow(dataTooLow, i);
      tooCheap.push({ key: i, value: countTooLow.toFixed(2) });
    }

    //提供されたPDFファイルからの数学を使う
    function calculatePrice(x1, y1, x2, y2, x3, y3, x4, y4) {
      return Math.round(
        ((y3 - y1) * (x1 - x2) * (x3 - x4) +
          x1 * (y1 - y2) * (x3 - x4) -
          x3 * (y3 - y4) * (x1 - x2)) /
          ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4))
      );
    }

    //ラベルを作る
    function printPrice(label, price) {
      console.log(`${label}: ${price}円`);
    }

    //数学とラベルを使う
    function calculateAndPrintPrice(label, x1, y1, x2, y2, x3, y3, x4, y4) {
      const price = calculatePrice(x1, y1, x2, y2, x3, y3, x4, y4);
      printPrice(label, price);
    }

    //四つの値段
    calculateAndPrintPrice(
      "最高価格",
      tooExpensive[4].key,
      tooExpensive[4].value,
      tooExpensive[5].key,
      tooExpensive[5].value,
      cheap[4].key,
      cheap[4].value,
      cheap[5].key,
      cheap[5].value
    );

    calculateAndPrintPrice(
      "妥協価格",
      expensive[4].key,
      expensive[4].value,
      expensive[5].key,
      expensive[5].value,
      cheap[4].key,
      cheap[4].value,
      cheap[5].key,
      cheap[5].value
    );

    calculateAndPrintPrice(
      "理想価格",
      tooExpensive[4].key,
      tooExpensive[4].value,
      tooExpensive[5].key,
      tooExpensive[5].value,
      tooCheap[4].key,
      tooCheap[4].value,
      tooCheap[5].key,
      tooCheap[5].value
    );

    calculateAndPrintPrice(
      "最低品質保証価格",
      expensive[3].key,
      expensive[3].value,
      expensive[4].key,
      expensive[4].value,
      tooCheap[3].key,
      tooCheap[3].value,
      tooCheap[4].key,
      tooCheap[4].value
    );
  } catch (error) {
    console.error("エラーが発生した:", error);
  }
})();
