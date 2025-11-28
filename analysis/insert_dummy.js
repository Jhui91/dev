const db = require("./db");
const checkWarnings = require("./analyzer");

async function insertSupplement(item, condition) {
  if (!item || !item.itemSeq || item.itemSeq === null || item.itemSeq === undefined) {
    console.warn('[저장 건너뛰기] itemSeq가 누락되거나 유효하지 않은 항목:', item);
    return;
  }

  const {
    itemSeq, itemName, entpName,
    efcyQesitm, useMethodQesitm, atpnQesitm,
    intrcQesitm, seQesitm, itemImage
  } = item;

  const { atpnWarnings, intrcWarnings } = checkWarnings(item);

  const sql = `
    INSERT INTO supplements (
      item_seq, item_name, entp_name,
      efficacy, how_to_use, warning,
      interaction, side_effect, image_url,
      atpn_warnings, intrc_warnings
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      efficacy = VALUES(efficacy),
      how_to_use = VALUES(how_to_use),
      warning = VALUES(warning),
      interaction = VALUES(interaction),
      side_effect = VALUES(side_effect),
      image_url = VALUES(image_url),
      atpn_warnings = VALUES(atpn_warnings),
      intrc_warnings = VALUES(intrc_warnings)
  `;

  console.log('저장 시도:', item.itemName);
  try {
    const [result] = await db.execute(sql, [
      itemSeq, itemName, entpName,
      efcyQesitm, useMethodQesitm, atpnQesitm,
      intrcQesitm, seQesitm, itemImage,
      atpnWarnings ? JSON.stringify(atpnWarnings) : null,
      intrcWarnings ? JSON.stringify(intrcWarnings) : null
    ]);
    let supplementId = result.insertId;

    if (result.insertId === 0) { 
      const [rows] = await db.query('SELECT id FROM supplements WHERE item_seq = ?', [item.itemSeq]);
      if (rows.length > 0) {
        supplementId = rows[0].id;
      }
    }

    if (supplementId) {
      const connectSql = `
        INSERT IGNORE INTO supplement_conditions (supplement_id, condition_name)
        VALUES (?, ?)
        `;
      await db.execute(connectSql, [supplementId, condition]); // condition을 저장
    }
        
    console.log('저장 성공:', item.itemName, `(조건: ${condition})`);

  } catch (err) {
    console.error('저장 실패:', item.itemSeq || 'Unknown', err);
  }
}

module.exports = insertSupplement;