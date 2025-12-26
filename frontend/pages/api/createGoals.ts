// pages/api/goals.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { nanoid } from "nanoid";

// 外部APIのベースURL
// const BASE_URL = "https://script.google.com/macros/s/AKfycbyJN6CWNVMbqN4lQm4b_I9r9Itdug4nVv9-gHMlGkf-t8iF31MwxwewqzFBZjTQ3vJ4/exec";
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/goals`;

// 目標を外部APIを呼び出して，データベースに登録する
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTを想定
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { goals } = req.body as { goals?: string[] };

    if (!goals || goals.length !== 8) {
      return res.status(400).json({ error: "goalsは8つ必須です" });
    }

    // サーバー側でユニークID生成
    const bingoId = nanoid();

    // 外部APIに送る形式を組み立てる
    const payload = {bingoId: bingoId, goals: goals};
 
    const upstream = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    // 外部APIが問題なく動作したか確認
    const data = await upstream.json();
    if (!data.ok) {
      return res.status(502).json({ ok: false, error: data.error ?? 'upstream failed' });
    }

    // 生成したbingoIdを返す
    return res.status(201).json({
      ok: true,
      bingoId: bingoId
    });

  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? "internal error" });
  }
}
