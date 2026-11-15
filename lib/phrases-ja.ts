import type { PhraseItem } from "./phrases";

/**
 * 일본 요나고·돗토리 여행용 일본어 회화.
 * 널리 쓰이는 기본 표현만 담았다. 한글 독음(pron)은 한국어 화자가 읽기 쉽게 옮긴 것이라
 * 실제 발음과 약간 다를 수 있으니 여행 전에 한 번 검수하는 것이 좋다.
 * text에는 일본어 원문(히라가나·가타카나·한자)을 적는다.
 */
export const JAPANESE_PHRASES: PhraseItem[] = [
  // 기본
  { id: 1, category: "기본", importance: "최고", ko: "안녕하세요 (낮)", text: "こんにちは", pron: "곤니치와" },
  { id: 2, category: "기본", importance: "최고", ko: "안녕하세요 (아침)", text: "おはようございます", pron: "오하요 고자이마스" },
  { id: 3, category: "기본", importance: "최고", ko: "감사합니다", text: "ありがとうございます", pron: "아리가토 고자이마스" },
  { id: 4, category: "기본", importance: "최고", ko: "죄송합니다 / 실례합니다 / 저기요", text: "すみません", pron: "스미마셍" },
  { id: 5, category: "기본", importance: "최고", ko: "네", text: "はい", pron: "하이" },
  { id: 6, category: "기본", importance: "높음", ko: "아니요", text: "いいえ", pron: "이이에" },
  { id: 7, category: "기본", importance: "높음", ko: "괜찮아요 / 됐어요", text: "大丈夫です", pron: "다이조부데스" },
  { id: 8, category: "기본", importance: "높음", ko: "잘 모르겠어요", text: "わかりません", pron: "와카리마셍" },
  { id: 9, category: "기본", importance: "높음", ko: "영어 할 수 있어요?", text: "英語は話せますか？", pron: "에이고와 하나세마스카?" },
  { id: 10, category: "기본", importance: "보통", ko: "한국어 하시는 분 계세요?", text: "韓国語を話せる方はいますか？", pron: "캉코쿠고오 하나세루 가타와 이마스카?" },
  { id: 11, category: "기본", importance: "높음", ko: "다시 한번 말씀해 주세요", text: "もう一度お願いします", pron: "모- 이치도 오네가이시마스" },
  { id: 12, category: "기본", importance: "높음", ko: "천천히 말씀해 주세요", text: "ゆっくりお願いします", pron: "윳쿠리 오네가이시마스" },
  { id: 13, category: "기본", importance: "최고", ko: "화장실은 어디예요?", text: "トイレはどこですか？", pron: "토이레와 도코데스카?" },

  // 이동
  { id: 14, category: "이동", importance: "최고", ko: "요나고역은 어디예요?", text: "米子駅はどこですか？", pron: "요나고에키와 도코데스카?" },
  { id: 15, category: "이동", importance: "높음", ko: "이 버스는 돗토리 사구에 가나요?", text: "このバスは鳥取砂丘に行きますか？", pron: "고노 바스와 돗토리사큐-니 이키마스카?" },
  { id: 16, category: "이동", importance: "높음", ko: "몇 시에 출발해요?", text: "何時に出発しますか？", pron: "난지니 슛파쓰 시마스카?" },
  { id: 17, category: "이동", importance: "보통", ko: "막차는 몇 시예요?", text: "終電は何時ですか？", pron: "슈-덴와 난지데스카?" },
  { id: 18, category: "이동", importance: "높음", ko: "택시를 불러 주세요", text: "タクシーを呼んでください", pron: "타쿠시-오 욘데 구다사이" },
  { id: 19, category: "이동", importance: "높음", ko: "이 주소로 가 주세요", text: "この住所までお願いします", pron: "고노 주-쇼마데 오네가이시마스" },
  { id: 20, category: "이동", importance: "보통", ko: "여기에서 세워 주세요", text: "ここで止めてください", pron: "고코데 도메테 구다사이" },
  { id: 21, category: "이동", importance: "보통", ko: "여기는 어디예요?", text: "ここはどこですか？", pron: "고코와 도코데스카?" },
  { id: 22, category: "이동", importance: "보통", ko: "여기까지 걸어서 얼마나 걸려요?", text: "ここまで歩いてどのくらいかかりますか？", pron: "고코마데 아루이테 도노쿠라이 카카리마스카?" },

  // 식당
  { id: 23, category: "식당", importance: "최고", ko: "두 명이에요", text: "二人です", pron: "후타리데스" },
  { id: 24, category: "식당", importance: "최고", ko: "메뉴판 주세요", text: "メニューをください", pron: "메뉴-오 구다사이" },
  { id: 25, category: "식당", importance: "높음", ko: "한국어 메뉴 있어요?", text: "韓国語のメニューはありますか？", pron: "캉코쿠고노 메뉴-와 아리마스카?" },
  { id: 26, category: "식당", importance: "최고", ko: "이거 주세요", text: "これをください", pron: "고레오 구다사이" },
  { id: 27, category: "식당", importance: "높음", ko: "추천 메뉴가 뭐예요?", text: "おすすめは何ですか？", pron: "오스스메와 난데스카?" },
  { id: 28, category: "식당", importance: "높음", ko: "물 주세요", text: "お水をください", pron: "오미즈오 구다사이" },
  { id: 29, category: "식당", importance: "보통", ko: "게 요리 있어요?", text: "カニ料理はありますか？", pron: "가니 료-리와 아리마스카?" },
  { id: 30, category: "식당", importance: "보통", ko: "알레르기가 있어요", text: "アレルギーがあります", pron: "아레루기-가 아리마스" },
  { id: 31, category: "식당", importance: "보통", ko: "포장해 주세요", text: "持ち帰りでお願いします", pron: "모치카에리데 오네가이시마스" },
  { id: 32, category: "식당", importance: "높음", ko: "맛있어요", text: "おいしいです", pron: "오이시-데스" },
  { id: 33, category: "식당", importance: "최고", ko: "계산해 주세요", text: "お会計をお願いします", pron: "오카이케- 오 오네가이시마스" },

  // 쇼핑
  { id: 34, category: "쇼핑", importance: "최고", ko: "얼마예요?", text: "いくらですか？", pron: "이쿠라데스카?" },
  { id: 35, category: "쇼핑", importance: "높음", ko: "카드 쓸 수 있어요?", text: "カードは使えますか？", pron: "카-도와 쓰카에마스카?" },
  { id: 36, category: "쇼핑", importance: "높음", ko: "면세 되나요?", text: "免税できますか？", pron: "멘제이 데키마스카?" },
  { id: 37, category: "쇼핑", importance: "보통", ko: "봉투는 괜찮아요", text: "袋は大丈夫です", pron: "후쿠로와 다이조부데스" },
  { id: 38, category: "쇼핑", importance: "보통", ko: "다른 색 있어요?", text: "色違いはありますか？", pron: "이로치가이와 아리마스카?" },
  { id: 39, category: "쇼핑", importance: "보통", ko: "선물용으로 포장해 주세요", text: "プレゼント用に包んでください", pron: "푸레젠토요-니 쓰쓴데 구다사이" },

  // 온천·숙소
  { id: 40, category: "온천", importance: "높음", ko: "대욕장(대중탕)은 어디예요?", text: "大浴場はどこですか？", pron: "다이요쿠조-와 도코데스카?" },
  { id: 41, category: "온천", importance: "높음", ko: "온천은 몇 시까지예요?", text: "温泉は何時までですか？", pron: "온센와 난지마데데스카?" },
  { id: 42, category: "온천", importance: "보통", ko: "수건을 빌릴 수 있어요?", text: "タオルを借りられますか？", pron: "타오루오 가리라레마스카?" },
  { id: 43, category: "온천", importance: "보통", ko: "가족탕(대절탕)을 예약할 수 있어요?", text: "貸切風呂は予約できますか？", pron: "가시키리부로와 요야쿠 데키마스카?" },
  { id: 44, category: "온천", importance: "보통", ko: "짐을 맡아 주실 수 있어요?", text: "荷物を預かってもらえますか？", pron: "니모쓰오 아즈칸테 모라에마스카?" },
  { id: 45, category: "온천", importance: "보통", ko: "체크아웃을 늦게 해도 될까요?", text: "チェックアウトを遅らせてもいいですか？", pron: "첵쿠아우토오 오쿠라세테모 이-데스카?" },

  // 긴급
  { id: 46, category: "긴급", importance: "최고", ko: "도와주세요!", text: "助けてください！", pron: "다스케테 구다사이!" },
  { id: 47, category: "긴급", importance: "최고", ko: "병원에 가고 싶어요", text: "病院に行きたいです", pron: "뵤-인니 이키타이데스" },
  { id: 48, category: "긴급", importance: "높음", ko: "몸이 안 좋아요", text: "具合が悪いです", pron: "구아이가 와루이데스" },
  { id: 49, category: "긴급", importance: "높음", ko: "구급차를 불러 주세요", text: "救急車を呼んでください", pron: "큐-큐-샤오 욘데 구다사이" },
  { id: 50, category: "긴급", importance: "높음", ko: "경찰을 불러 주세요", text: "警察を呼んでください", pron: "케-사쓰오 욘데 구다사이" },
  { id: 51, category: "긴급", importance: "높음", ko: "여권을 잃어버렸어요", text: "パスポートをなくしました", pron: "파스포-토오 나쿠시마시타" },
  { id: 52, category: "긴급", importance: "보통", ko: "길을 잃었어요", text: "道に迷いました", pron: "미치니 마요이마시타" },
];
