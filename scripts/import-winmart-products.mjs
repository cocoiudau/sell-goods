import fs from "node:fs";
import vm from "node:vm";

const filePath = "data/products.js";

const sourceProducts = [
  {
    url: "https://winmart.vn/products/vinamilk-sua-tiet-trung-co-duong-hop-1l--s10010487",
    categoryKey: "milk",
    brand: "Vinamilk",
    nameEn: "Vinamilk sweetened UHT milk 1L",
  },
  {
    url: "https://winmart.vn/products/dalat-milk-sua-chua-uong-dau-500ml--s10225777",
    categoryKey: "milk",
    brand: "Dalatmilk",
    nameEn: "Dalatmilk strawberry drinking yogurt 500ml",
  },
  {
    url: "https://winmart.vn/products/dalat-milk-sua-chua-an-co-duong-500g--s10312791",
    categoryKey: "milk",
    brand: "Dalatmilk",
    nameEn: "Dalatmilk sweetened yogurt 500g",
  },
  {
    url: "https://winmart.vn/products/betagen-scu-len-men-h.tu-nhien-700ml--s10005377",
    categoryKey: "milk",
    brand: "Betagen",
    nameEn: "Betagen natural fermented yogurt drink 700ml",
  },
  {
    url: "https://winmart.vn/products/yomost-sua-chua-uong-dau-170ml--s10005260",
    categoryKey: "milk",
    brand: "YoMost",
    nameEn: "YoMost strawberry yogurt drink 4 x 170ml",
  },
  {
    url: "https://winmart.vn/products/729-ba-vi-trung-ga-ta-que-gio-10-qua--s10006024",
    categoryKey: "milk",
    brand: "729 Ba Vi",
    nameEn: "729 Ba Vi free-range chicken eggs basket 10 pcs",
  },
  {
    url: "https://winmart.vn/products/ngoc-nuong-gao-st-25-dac-san-3kg-vns--s10141993",
    categoryKey: "pantry",
    brand: "Ngoc Nuong",
    nameEn: "Ngoc Nuong ST25 specialty rice 3kg",
  },
  {
    url: "https://winmart.vn/products/cholimex-nuoc-mam-cc-th-750ml--s10009650",
    categoryKey: "pantry",
    brand: "Cholimex",
    nameEn: "Cholimex anchovy fish sauce 750g",
  },
  {
    url: "https://winmart.vn/products/le-gia-nuoc-mam-cot-db-525ml--s10602832",
    categoryKey: "pantry",
    brand: "Le Gia",
    nameEn: "Le Gia premium fish sauce 525ml",
  },
  {
    url: "https://winmart.vn/products/hanh-phuc-nuoc-mam-60n-250ml--s10009614",
    categoryKey: "pantry",
    brand: "Hanh Phuc",
    nameEn: "Hanh Phuc 60N fish sauce 250ml",
  },
  {
    url: "https://winmart.vn/products/omachi-mi-dd-k.tay-suon-ngu-qua-80g--s10007925",
    categoryKey: "pantry",
    brand: "Omachi",
    nameEn: "Omachi potato instant noodles pork rib flavor carton 30 x 80g",
  },
  {
    url: "https://winmart.vn/products/cung-dinh-mi-k.tay-suon-ham-ngu-qua-80g--s10086825",
    categoryKey: "pantry",
    brand: "Cung Dinh",
    nameEn: "Cung Dinh potato instant noodles pork rib flavor carton 30 x 80g",
  },
  {
    url: "https://winmart.vn/products/aquafina-nuoc-tinh-khiet-355ml--s10011215",
    categoryKey: "drink",
    brand: "Aquafina",
    nameEn: "Aquafina bottled water carton 24 x 355ml",
  },
  {
    url: "https://winmart.vn/products/aquafina-nuoc-tinh-khiet-1.5l--s10011217",
    categoryKey: "drink",
    brand: "Aquafina",
    nameEn: "Aquafina bottled water 1.5L",
  },
  {
    url: "https://winmart.vn/products/th-tra-xanh-vi-chanh-350ml--s10195597",
    categoryKey: "drink",
    brand: "TH true TEA",
    nameEn: "TH lemon green tea 350ml",
  },
  {
    url: "https://winmart.vn/products/c2-tra-xanh-huong-chanh-455ml--s10011315",
    categoryKey: "drink",
    brand: "C2",
    nameEn: "C2 lemon green tea carton 24 bottles",
  },
  {
    url: "https://winmart.vn/products/cosy-banh-quy-marie-240g--s10195386",
    categoryKey: "snack",
    brand: "Cosy",
    nameEn: "Cosy Marie biscuits 240g",
  },
  {
    url: "https://winmart.vn/products/cosy-banh-que-vi-dau-126g1176gt24--s10013649",
    categoryKey: "snack",
    brand: "Cosy",
    nameEn: "Cosy strawberry cream wafer sticks 132g",
  },
  {
    url: "https://winmart.vn/products/coffee-joy-banh-qui-vi-ca-phe-142g--s10013919",
    categoryKey: "snack",
    brand: "Roma",
    nameEn: "Roma coffee biscuits 142g",
  },
  {
    url: "https://winmart.vn/products/oreo-banh-quy-vani-9x27.6g--s10013883",
    categoryKey: "snack",
    brand: "Oreo",
    nameEn: "Oreo vanilla cream cookies 264.6g",
  },
  {
    url: "https://winmart.vn/products/pocky-banh-que-vi-tra-xanh-35g--s10191607",
    categoryKey: "snack",
    brand: "Pocky",
    nameEn: "Pocky green tea biscuit sticks 35g",
  },
  {
    url: "https://winmart.vn/products/sunlight-nuoc-rua-chen-tra-xanh-750g--s10622313",
    categoryKey: "household",
    brand: "Sunlight",
    nameEn: "Sunlight green tea dishwashing liquid 750g",
  },
  {
    url: "https://winmart.vn/products/vim-vien-tay-bon-cau-tra-xanhchanh-55g--s10640565",
    categoryKey: "household",
    brand: "Vim",
    nameEn: "Vim green tea and lemon toilet cleaning block 55g",
  },
  {
    url: "https://winmart.vn/products/omo-vien-giat-xa-huong-tinh-te-315g--s10334724",
    categoryKey: "household",
    brand: "OMO",
    nameEn: "OMO laundry capsules 315g",
  },
  {
    url: "https://winmart.vn/products/listerine-nsm-natural-green-tea-750ml--s10018479",
    categoryKey: "household",
    brand: "Listerine",
    nameEn: "Listerine Natural Green Tea mouthwash 750ml",
  },
];

const categoryMap = {
  milk: "Sữa & trứng",
  pantry: "Gạo & thực phẩm khô",
  drink: "Đồ uống",
  snack: "Bánh kẹo & ăn vặt",
  household: "Gia dụng & vệ sinh",
};

const productNames = {
  "https://winmart.vn/products/vinamilk-sua-tiet-trung-co-duong-hop-1l--s10010487":
    "Sữa tươi tiệt trùng Vinamilk có đường hộp 1 lít",
  "https://winmart.vn/products/dalat-milk-sua-chua-uong-dau-500ml--s10225777":
    "Sữa chua uống DALATMILK hương dâu 500ml",
  "https://winmart.vn/products/dalat-milk-sua-chua-an-co-duong-500g--s10312791":
    "Sữa chua ăn Dalat Milk có đường 500g",
  "https://winmart.vn/products/betagen-scu-len-men-h.tu-nhien-700ml--s10005377":
    "Sữa chua uống lên men vị tự nhiên Betagen chai 700ml",
  "https://winmart.vn/products/yomost-sua-chua-uong-dau-170ml--s10005260":
    "Sữa chua uống vị dâu YoMost lốc 4 hộp x 170ml",
  "https://winmart.vn/products/729-ba-vi-trung-ga-ta-que-gio-10-qua--s10006024":
    "Trứng gà ta quê 729 Ba Vì giỏ 10 quả",
  "https://winmart.vn/products/ngoc-nuong-gao-st-25-dac-san-3kg-vns--s10141993":
    "Gạo Ngọc Nương ST 25 đặc sản 3kg",
  "https://winmart.vn/products/cholimex-nuoc-mam-cc-th-750ml--s10009650":
    "Nước mắm cá cơm Cholimex chai 750g",
  "https://winmart.vn/products/le-gia-nuoc-mam-cot-db-525ml--s10602832":
    "Nước mắm cốt đặc biệt Lê Gia chai 525ml",
  "https://winmart.vn/products/hanh-phuc-nuoc-mam-60n-250ml--s10009614":
    "Nước mắm Hạnh Phúc 60N chai 250ml",
  "https://winmart.vn/products/omachi-mi-dd-k.tay-suon-ngu-qua-80g--s10007925":
    "Mì ăn liền khoai tây sườn ngũ quả Omachi thùng 30 gói x 80g",
  "https://winmart.vn/products/cung-dinh-mi-k.tay-suon-ham-ngu-qua-80g--s10086825":
    "Mì khoai tây Cung Đình xương hầm ngũ quả thùng 30 gói x 80g",
  "https://winmart.vn/products/aquafina-nuoc-tinh-khiet-355ml--s10011215":
    "Nước uống đóng chai Aquafina thùng 24 chai x 355ml",
  "https://winmart.vn/products/aquafina-nuoc-tinh-khiet-1.5l--s10011217":
    "Nước uống đóng chai Aquafina 1.5 lít",
  "https://winmart.vn/products/th-tra-xanh-vi-chanh-350ml--s10195597":
    "Trà xanh vị chanh TH 350ml",
  "https://winmart.vn/products/c2-tra-xanh-huong-chanh-455ml--s10011315":
    "Trà xanh hương chanh C2 thùng 24 chai",
  "https://winmart.vn/products/cosy-banh-quy-marie-240g--s10195386":
    "Bánh quy Cosy Marie gói 240g",
  "https://winmart.vn/products/cosy-banh-que-vi-dau-126g1176gt24--s10013649":
    "Bánh quế vị kem dâu Cosy gói 132g",
  "https://winmart.vn/products/coffee-joy-banh-qui-vi-ca-phe-142g--s10013919":
    "Bánh quy cà phê Roma gói 142g",
  "https://winmart.vn/products/oreo-banh-quy-vani-9x27.6g--s10013883":
    "Bánh quy kem vani Oreo gói 264.6g",
  "https://winmart.vn/products/pocky-banh-que-vi-tra-xanh-35g--s10191607":
    "Bánh que vị trà xanh Pocky 35g",
  "https://winmart.vn/products/sunlight-nuoc-rua-chen-tra-xanh-750g--s10622313":
    "Nước rửa chén Sunlight trà xanh chai 750g",
  "https://winmart.vn/products/vim-vien-tay-bon-cau-tra-xanhchanh-55g--s10640565":
    "Viên tẩy bồn cầu Vim trà xanh, chanh 55g",
  "https://winmart.vn/products/omo-vien-giat-xa-huong-tinh-te-315g--s10334724":
    "OMO viên giặt xả hương tinh tế 315g",
  "https://winmart.vn/products/listerine-nsm-natural-green-tea-750ml--s10018479":
    "Nước súc miệng Listerine Natural Green Tea chai 750ml",
};

function decodeHtml(value = "") {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getFirstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return "";
}

function parsePrice(html) {
  const match = html.match(/Giá bán lẻ[\s\S]{0,260}?([\d.]+)\s*₫/i);
  return match ? Number(match[1].replace(/\./g, "")) : 0;
}

function parseImages(html) {
  const matches = [
    ...html.matchAll(/https?:\/\/[^"'<> ]+\.(?:jpg|jpeg|png|webp)[^"'<> ]*/gi),
  ].map((match) => decodeHtml(match[0]));
  const unique = [...new Set(matches)];
  return (
    unique.find((url) => !/logo|favicon|banner|optimized-20241231/i.test(url)) ||
    unique.at(-1) ||
    ""
  );
}

async function fetchProduct(item) {
  const response = await fetch(item.url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${item.url}`);
  const html = await response.text();
  const title = (
    item.name ||
    productNames[item.url] ||
    getFirstMatch(html, [
      /<h1[^>]*>([\s\S]*?)<\/h1>/i,
      /property=["']og:title["']\s+content=["']([^"']+)/i,
      /<title[^>]*>([^<]+)/i,
    ])
  ).replace(/\s*\|\s*WinMart.*$/i, "");
  const price = parsePrice(html);
  const image = parseImages(html);
  if (!title || !price || !image) {
    throw new Error(`Missing fields for ${item.url}: ${JSON.stringify({ title, price, image })}`);
  }
  return { ...item, title, price, image };
}

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(filePath, "utf8"), context);
const products = context.window.PRODUCTS_DATA;
const existingUrls = new Set(products.map((product) => product.sourceUrl).filter(Boolean));
let nextId = Math.max(...products.map((product) => product.id)) + 1;

const imported = [];
for (const item of sourceProducts) {
  if (existingUrls.has(item.url)) continue;
  try {
    const product = await fetchProduct(item);
    imported.push(product);
  } catch (error) {
    console.warn(`Skipped: ${error.message}`);
  }
}

const additions = imported.map((item, index) => ({
  id: nextId++,
  name: item.title,
  nameEn: item.nameEn,
  category: categoryMap[item.categoryKey],
  price: item.price,
  oldPrice: Math.ceil((item.price * (1.08 + (index % 5) * 0.03)) / 100) * 100,
  rating: Number((4.5 + (index % 6) * 0.1).toFixed(1)),
  image: item.image,
  badge: item.brand,
  stock: item.url.includes("het-hang") ? 0 : 120 + (index % 5) * 15,
  sourceUrl: item.url,
  description: `${item.title} đang được niêm yết tại WinMart với ảnh sản phẩm và giá bán lẻ tham khảo lấy từ trang sản phẩm.`,
  descriptionEn: `${item.nameEn} is listed on WinMart. The product image and reference retail price are taken from the product page.`,
}));

products.push(...additions);

fs.writeFileSync(
  filePath,
  `window.PRODUCTS_DATA = ${JSON.stringify(products, null, 2)};\n`,
  "utf8",
);

console.log(`Imported ${additions.length} products. Total: ${products.length}`);
console.log(additions.map((product) => `${product.id}: ${product.name} - ${product.price}`).join("\n"));
