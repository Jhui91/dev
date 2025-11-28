const { atpnWarningKeywords, intrcWarningKeywords } = require("./keywords");

function checkWarnings(item) {
  const atpn = item.atpnQesitm?.toLowerCase() || "";
  const intrc = item.intrcQesitm?.toLowerCase() || "";
  const atpnWarnings = [];
  const intrcWarnings = [];
  //const responseVal = { itemName: item.itemName };

  for (const [keyword, message] of Object.entries(atpnWarningKeywords)) {
    if (atpn.includes(keyword.toLowerCase())) {
      atpnWarnings.push(`(${keyword}) ${message}`);
    }
  }
  //responseVal["atpnWarnings"] = atpnWarnings;

  for (const [keyword, message] of Object.entries(intrcWarningKeywords)) {
    if (intrc.includes(keyword.toLowerCase())) {
      intrcWarnings.push(`(${keyword}) ${message}`);
    }
  }
  //responseVal["intrcWarnings"] = intrcWarnings;

  // if (atpnWarnings.length || intrcWarnings.length) {
  //   console.log(`${item.itemName} 경고 정보:`);

  //   if (atpnWarnings.length) {
  //     console.log("[주의사항 경고]");
  //     console.log("- " + atpnWarnings.join("\n- "));
  //   }

  //   if (intrcWarnings.length) {
  //     console.log("[상호작용 경고]");
  //     console.log("- " + intrcWarnings.join("\n- "));
  //   }

  //   console.log(); // 줄바꿈
  // }

  return {
    ...item,
    atpnWarnings,
    intrcWarnings
  };
}

module.exports = checkWarnings;
