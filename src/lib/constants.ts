// src/lib/constants.ts

export const GENRES = [
  { id: "nature",  label: "自然・アウトドア", emoji: "🏕️" },
  { id: "gourmet", label: "グルメ・食べ歩き",  emoji: "🍜" },
  { id: "art",     label: "アート・文化",      emoji: "🎨" },
  { id: "music",   label: "音楽・ライブ",      emoji: "🎵" },
  { id: "sports",  label: "スポーツ",          emoji: "⚽" },
  { id: "movie",   label: "映画・ドラマ",      emoji: "🎬" },
  { id: "book",    label: "本・読書",          emoji: "📚" },
  { id: "game",    label: "ゲーム・カフェ",    emoji: "🎮" },
  { id: "theme",   label: "テーマパーク",      emoji: "🎡" },
  { id: "onsen",   label: "温泉・スパ",        emoji: "♨️" },
] as const;

export const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
] as const;

export const CATEGORIES = [
  "おでかけ","映画","本","ゲーム","食事","音楽","スポーツ","その他",
] as const;

export const OUTDOOR_CATEGORIES = ["おでかけ", "スポーツ"] as const;
