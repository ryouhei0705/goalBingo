import { z } from "zod";

// 日本語（ひらがな・カタカナ・漢字）と英数字を許可する正規表現
// ひらがな: \u3040-\u309F
// カタカナ: \u30A0-\u30FF  
// 漢字: \u4E00-\u9FAF
const jpAlphanumRegex = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/;

export const createRequestSchema = z.object({
  goals: z
    .array(
      z.string()
        .min(1, "入力してください")
        .max(30, "30文字以内で入力してください")
        .regex(jpAlphanumRegex, "日本語、英数字のみ使用可能です")
    )
    .length(8, "目標は8個入力してください"),
});

export type CreateRequest = z.infer<typeof createRequestSchema>;

// 読み取り時のリクエストスキーマ
export const readRequestSchema = z.object({
  bingoId: z
    .string()
    .min(1, "bingoIdは必須です")
    .uuid("bingoIdは有効なUUID形式である必要があります"),
});

export type ReadRequest = z.infer<typeof readRequestSchema>;