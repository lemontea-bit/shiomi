// A handful of well-known municipalities per prefecture — used only as *search query
// strings* fed back into Open-Meteo's geocoding API (lib/geocode.ts) when someone searches
// a prefecture name, since that API can look places up by name but can't list "everything
// inside admin1 X" directly. Picked with a slight bias toward coastal/fishing-relevant towns
// where the prefecture has a coastline, standard geography otherwise.
export const PREFECTURE_CITIES: Record<string, string[]> = {
  北海道: ['札幌市', '函館市', '釧路市', '稚内市'],
  青森: ['青森市', '八戸市', '弘前市'],
  岩手: ['盛岡市', '宮古市', '大船渡市'],
  宮城: ['仙台市', '石巻市', '気仙沼市'],
  秋田: ['秋田市', '男鹿市'],
  山形: ['山形市', '鶴岡市', '酒田市'],
  福島: ['福島市', 'いわき市', '郡山市'],
  茨城: ['水戸市', '大洗町', '鹿嶋市'],
  栃木: ['宇都宮市', '日光市'],
  群馬: ['前橋市', '高崎市'],
  埼玉: ['さいたま市', '川越市'],
  千葉: ['千葉市', '銚子市', '館山市'],
  東京: ['新宿区', '八丈町', '大島町'],
  神奈川: ['横浜市', '鎌倉市', '三浦市', '小田原市'],
  新潟: ['新潟市', '佐渡市', '上越市'],
  富山: ['富山市', '氷見市'],
  石川: ['金沢市', '輪島市'],
  福井: ['福井市', '敦賀市'],
  山梨: ['甲府市', '富士吉田市'],
  長野: ['長野市', '松本市', '諏訪市'],
  岐阜: ['岐阜市', '高山市'],
  静岡: ['静岡市', '浜松市', '熱海市', '焼津市'],
  愛知: ['名古屋市', '豊橋市'],
  三重: ['津市', '鳥羽市', '志摩市'],
  滋賀: ['大津市', '彦根市'],
  京都: ['京都市', '宮津市'],
  大阪: ['大阪市', '堺市'],
  兵庫: ['神戸市', '姫路市', '淡路市'],
  奈良: ['奈良市'],
  和歌山: ['和歌山市', '白浜町'],
  鳥取: ['鳥取市', '境港市'],
  島根: ['松江市', '浜田市'],
  岡山: ['岡山市', '倉敷市'],
  広島: ['広島市', '尾道市', '呉市'],
  山口: ['山口市', '下関市'],
  徳島: ['徳島市', '鳴門市'],
  香川: ['高松市', '丸亀市'],
  愛媛: ['松山市', '今治市'],
  高知: ['高知市', '室戸市'],
  福岡: ['福岡市', '北九州市'],
  佐賀: ['佐賀市', '唐津市'],
  長崎: ['長崎市', '佐世保市', '対馬市'],
  熊本: ['熊本市', '天草市'],
  大分: ['大分市', '別府市'],
  宮崎: ['宮崎市', '日南市'],
  鹿児島: ['鹿児島市', '指宿市'],
  沖縄: ['那覇市', '石垣市', '宮古島市'],
};

const SUFFIX_RE = /(都|道|府|県)$/;

/** "神奈川県"→"神奈川", "東京都"→"東京", "京都府"→"京都" — but 北海道 keeps its 道. */
export function normalizePrefectureName(name: string): string {
  if (name === '北海道') return name;
  return name.replace(SUFFIX_RE, '');
}
