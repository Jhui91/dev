const db = require("./db");
const checkWarnings = require("./analyzer");

async function insertSupplement(item) {
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
    await db.execute(sql, [
      itemSeq, itemName, entpName,
      efcyQesitm, useMethodQesitm, atpnQesitm,
      intrcQesitm, seQesitm, itemImage,
      JSON.stringify(atpnWarnings),
      JSON.stringify(intrcWarnings)
    ]);
    console.log('저장 성공:', item.itemName);
  } catch (err) {
    console.error('저장 실패:', item.itemName, err);
  }
}

module.exports = insertSupplement;
