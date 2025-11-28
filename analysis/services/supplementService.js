const db = require('../db');

/**
 * 특정 조건에 맞는 영양제 10개를 조회하고 복용 횟수를 파싱하여 반환합니다.
 * @param {string} conditionName - 검색 조건 (예: '체질량지수').
 * @param {number} limit - 최대 조회 개수.
 * @returns {Promise<Array<Object>>} - 파싱된 영양제 목록.
 */

async function getTopNSupplements(conditionName, limit = 10) {
  const sql = `
    SELECT 
      s.id, s.item_name, s.how_to_use
    FROM 
      supplements s
    JOIN 
      supplement_conditions sc ON s.id = sc.supplement_id
    WHERE 
      sc.condition_name = ?
    LIMIT ?
  `;
  const [rows] = await db.query(sql, [conditionName, limit]); 
    
  return rows.map(item => {
    const match = item.how_to_use
      .match(/1일.*?(\d+).*?~.*?(\d+).*?(회|번)|1일.*?(\d+).*?(회|번)/);
    let dailyMax = 1;
    let isRange = true;

    if (match) {
      if (match[2]) {
        dailyMax = parseInt(match[2], 10);
        isRange = true;
      } else if (match[4]) {
        dailyMax = parseInt(match[4], 10);
        isRange = false;
      }
    }
        
    dailyMax = Math.min(3, dailyMax);
    dailyMax = Math.max(1, dailyMax);

    return {
      id: item.id,                // 영양제 ID
      itemName: item.item_name,   // 영양제 이름
      howToUse: item.how_to_use,  // 복용 방법
      dailyCountMax: dailyMax,    // 파싱된 1일 최대 복용 횟수
      isRange: isRange            // 복용 횟수가 범위인지 여부
    };
  });
}

module.exports = { getTopNSupplements };