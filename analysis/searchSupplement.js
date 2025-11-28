const keywords = require('../extract-pdf/keyword.json');
const { makeQueryParams, fetchData } = require('./api');
const checkWarnings = require('./analyzer');

async function searchSupplements(healthCondition) {
  const names = keywords[healthCondition]?.itemName || [];
  const efficacies = keywords[healthCondition]?.efcyQesitm || [];

  const nameKeywordList = [...names];
  const efficacyKeywordList = [...efficacies];

  let results = [];

  for (const name of nameKeywordList) {
    const params = makeQueryParams(name, 'itemName');
    const data = await fetchData(params);
    results = results.concat(data);
  }

  for (const efcy of efficacyKeywordList) {
    const params = makeQueryParams(efcy, 'efcyQesitm');
    const data = await fetchData(params);
    results = results.concat(data);
  }

  const uniqueResults = Object.values(results.reduce((acc, cur) => {
    acc[cur.itemSeq] = cur;
    return acc;
  }, {}));
  
  console.log(`[${healthCondition}] 검색 키워드 수: 이름=${names.length}, 효능=${efficacies.length}`);
  console.log(`[${healthCondition}] 결과 수: ${results.length}`);
  
  const filteredResults = uniqueResults.map(item => checkWarnings(item));
  
  return filteredResults;
}

module.exports = searchSupplements;