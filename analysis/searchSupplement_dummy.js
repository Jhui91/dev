const fs = require('fs');
const path = require('path');
const keywords = require('../extract-pdf/keyword.json');
const checkWarnings = require('./analyzer'); 

const mapItemKeysAndSanitize = (item) => ({
    itemSeq: item.item_seq || null, 
    itemName: item.item_name || null, 
    entpName: item.entp_name || null, 
    efcyQesitm: item.efficacy || null, 
    useMethodQesitm: item.how_to_use || null, 
    atpnQesitm: item.warning || null, 
    intrcQesitm: item.interaction || null, 
    seQesitm: item.side_effect || null, 
    itemImage: item.image_url || null, 
    atpnWarnings: item.atpnWarnings || null, 
    intrcWarnings: item.intrcWarnings || null
});

async function searchSupplementsDummy(healthCondition) {
  console.log(`[검색] ${healthCondition} 키워드로 검색 시작.`);
  
  const categoryKeywords = keywords[healthCondition];
  
  if (!categoryKeywords) {
      console.log(`[경고] ${healthCondition}에 대한 키워드가 없습니다.`);
      return [];
  }

  const { itemName = [], efcyQesitm = [] } = categoryKeywords;
  
  if (itemName.length === 0 && efcyQesitm.length === 0) {
      return [];
  }

  // 모든 검색 키워드 준비
  const searchTerms = [...itemName, ...efcyQesitm].map(k => 
    k.toLowerCase());

  // 더미 데이터 로드
  const filePath = path.join(__dirname, "./data/supplements_dummy.json");
  let supplements = [];
  try {
      supplements = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
      console.error("supplements_dummy.json 파일을 읽거나 파싱하는 데 실패했습니다.", e);
      return [];
  }

  // 1. 키워드 필터링 (검색)
  const filteredResults = supplements.filter(item => 
    searchTerms.some(term =>
      item.item_name?.toLowerCase().includes(term) ||
      item.efficacy?.toLowerCase().includes(term)
    )
  );

  // 2. 중복 제거
  const uniqueResults = Object.values(filteredResults.reduce((acc, cur) => {
    acc[cur.item_seq] = cur; 
    return acc; 
  }, {}));

  const mappedAndSanitizedResults = uniqueResults.map(mapItemKeysAndSanitize);

  // 3. 경고 분석 적용
  const finalResults = mappedAndSanitizedResults.map(item => 
    checkWarnings(item)
  );
  
  console.log(`[검색] 최종 ${finalResults.length}개의 영양제 항목 반환.`);
  
  return finalResults;
}

module.exports = searchSupplementsDummy;