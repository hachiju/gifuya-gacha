// app.js - メインアプリケーションファイル

// 必要なモジュールをインポートします
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Expressアプリケーションのインスタンスを作成します
const app = express();
const port = process.env.PORT || 3000;

// 静的ファイルを公開するディレクトリを指定します
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /gacha
 * ガチャを回して結果を返します
 * @param {number} req.query.number - ガチャの予算
 * @returns {string} HTML形式のガチャ結果
 */
app.get('/gacha', async (req, res) => {
  const number = parseInt(req.query.number, 10); // ユーザーからの予算を取得します
  const products = await getProducts(); // CSVから商品のリストを取得します
  const selectedProducts = gacha(products, number); // ガチャロジックを実行します
  res.send(formatResult(selectedProducts)); // 結果をHTML形式で返します
});

/**
 * CSVファイルから商品のリストを読み込みます
 * @returns {Promise<Array>} 商品リストの配列を返します
 */
async function getProducts() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'data', 'gifuya_menu.csv'))
      .pipe(csv())
      .on('data', (row) => {
        row.price = parseInt(row.price, 10); // 価格を整数として保存します
        results.push(row); // 商品を結果に追加します
      })
      .on('end', () => resolve(results)) // 全データの読み込みが完了したらPromiseを解決します
      .on('error', reject); // エラーが発生した場合はPromiseを拒否します
  });
}

/**
 * ガチャのロジックを実装します
 * @param {Array} products - 商品リスト
 * @param {number} budget - ガチャの予算
 * @returns {Array} 選ばれた商品リスト
 */
function gacha(products, budget) {
  const results = [];
  let remainingBudget = budget;

  while (remainingBudget > 0) {
    // 予算内で購入可能な商品をフィルタリングします
    const affordableProducts = products.filter(product => product.price <= remainingBudget);
    if (affordableProducts.length === 0) break;

    // ランダムに商品を選択します
    const randomProduct = affordableProducts[Math.floor(Math.random() * affordableProducts.length)];
    results.push(randomProduct);
    remainingBudget -= randomProduct.price; // 予算から商品の価格を引きます
  }

  return results;
}

/**
 * 選ばれた商品のリストをHTML形式にフォーマットします
 * @param {Array} products - 選ばれた商品リスト
 * @returns {string} HTML形式の結果
 */
function formatResult(products) {
  let resultHtml = "<div id='result' class='result'>";
  products.forEach(product => {
    resultHtml += `<div id='product' class='product'>${product.name} ¥${product.price}</div>`;
  });
  resultHtml += "</div>";
  return resultHtml;
}

// サーバーを起動し、指定したポートで待機します
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
