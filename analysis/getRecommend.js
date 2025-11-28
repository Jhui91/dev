const db = require("./db");
const {
  efficacyKeywordList,
  nameKeywordList,
} = require("../extract-pdf/keyword.json");

async function fetchAllSave() {
  const processed = new Set();
  let responseVal = [];

  await db.execute("TRUNCATE TABLE supplements");

  for (const keyword of [...efficacyKeywordList, ...nameKeywordList]) {
    const type = efficacyKeywordList.includes(keyword)
      ? "efcyQesitm"
      : "itemName";
    const queryParams = makeQueryParams(keyword, type);
    const items = await fetchData(queryParams);

    for (const item of items) {
      if (processed.has(item.itemSeq)) continue;
      processed.add(item.itemSeq);
      responseVal = [...responseVal, checkWarnings(item)];
      await insertSupplement(item);
    }
  }

  return responseVal;
}

const getRecommend = async (req, res) => {
  try {
    const data = await fetchAllSave();
    await db.end();
    res.status(200).json({
      data,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getRecommend;
