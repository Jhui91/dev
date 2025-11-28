const db = require('./db');
//const searchSupplement = require('./searchSupplement');
const searchSupplement = require('./searchSupplement_dummy');
//const insertSupplement = require('./insert');
const insertSupplement = require('./insert_dummy');
const keywords = require('../extract-pdf/keyword.json');

async function main() {
  await db.query('DELETE FROM supplements');
  await db.query('ALTER TABLE supplements AUTO_INCREMENT = 1');
  
  const allConditions = Object.keys(keywords);

  for (const condition of allConditions) {
    console.log('검색 조건:', condition);
    const supplements = await searchSupplement(condition);
    console.log(`${condition}에 대해 검색된 영양제 수:`, supplements.length);

    for (const item of supplements) {
      await insertSupplement(item, condition);
      //console.log(`저장 완료: ${item.itemName}`);
    }
  }
  
  console.log('모든 영양제 저장 완료!');

  await db.end();

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

