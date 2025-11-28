const fs = require("fs");
const csv = require("csv-parser");
const iconv = require("iconv-lite");

// 필요한 필드만 추출 및 매핑
const supplements = [];

fs.createReadStream("./data/supplements_data.csv")
  .pipe(iconv.decodeStream("cp949"))
  .pipe(csv({
    mapHeaders: ({ header }) => header.trim()
  }))

  .on("data", (row) => {
    supplements.push({
      item_seq: row["품목기준코드 [ITEMSEQ]"] || "",
      item_name: row["제품명 [ITEMNAME]"] || "",
      entp_name: row["업체명 [ENTPNAME]"] || "",
      efficacy: row["문항1(효능) [EFCYQESITM]"] || "",
      how_to_use: row["문항2(사용법) [USEMETHODQESITM]"] || "",
      warning: row["문항4(주의사항) [ATPNQESITM]"] || "",
      interaction: row["문항5(상호작용) [INTRCQESITM]"] || "",
      side_effect: row["문항6(부작용) [SEQESITM]"] || "",
      image_url: row["낱알이미지 [ITEMIMAGE]"] || ""
    });
  })
  .on("end", () => {
    fs.writeFileSync("./data/supplements_dummy.json", JSON.stringify(supplements, null, 2), "utf-8");
    console.log("supplements_dummy.json 변환 완료!");
  });
