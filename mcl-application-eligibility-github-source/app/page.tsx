"use client";

import { useMemo, useState } from "react";

type Course = "social" | "mental";
type Step =
  | "course" | "swCollege" | "swYears" | "swExp1" | "swExp2" | "swWork" | "swWork4"
  | "mhLicense" | "mhCollege" | "mhBasics" | "mhShortYears" | "mhGeneralYears"
  | "mhShortExp1" | "mhShortExp2" | "mhGeneralExp1" | "mhGeneralExp2" | "mhWork" | "mhWork4";

type Result = { eligible: boolean; title: string; code?: string };
type HistoryItem = { step: Step; label: string; answer: string };

const questions: Partial<Record<Step, { eyebrow: string; title: string; note?: string; options: { label: string; value: string }[] }>> = {
  course: { eyebrow: "質問 1", title: "どちらの資格を目指しますか？", note: "取得を目指す資格を選択してください。選択した資格に応じて、入学できるかを確認するための質問へ進みます。", options: [{ label: "社会福祉士", value: "social" }, { label: "精神保健福祉士", value: "mental" }] },
  swCollege: { eyebrow: "社会福祉士コース", title: "大学・短期大学・専門学校を卒業していますか？", note: "卒業見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  swYears: { eyebrow: "修業年限を確認", title: "卒業した（または卒業見込みの）学校の修業年限は？", note: "通信課程を含みます。編入学等による在学年数ではなく、卒業した学校の課程年数を選択してください。", options: [{ label: "4年制", value: "4" }, { label: "3年制", value: "3" }, { label: "2年制", value: "2" }] },
  swExp1: { eyebrow: "実務経験を確認", title: "相談援助業務の経験は通算1年以上ありますか？", note: "1年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  swExp2: { eyebrow: "実務経験を確認", title: "相談援助業務の経験は通算2年以上ありますか？", note: "2年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  swWork: { eyebrow: "社会福祉士コース", title: "これまでに「相談援助業務」の経験がありますか？", note: "高齢者・障害者・児童などの福祉分野において、相談や支援を行う業務を指します。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  swWork4: { eyebrow: "実務経験を確認", title: "相談援助業務の経験は通算4年以上ありますか？", note: "4年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhLicense: { eyebrow: "精神保健福祉士コース", title: "社会福祉士資格をお持ちですか？", note: "取得見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhCollege: { eyebrow: "学歴を確認", title: "大学・短期大学・専門学校を卒業していますか？", note: "卒業見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhBasics: { eyebrow: "履修科目を確認", title: "卒業した（または卒業見込みの）学校で、精神保健福祉士の基礎科目を履修しましたか？", note: "学校によって科目名が異なる場合があります。卒業校へご確認ください。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhShortYears: { eyebrow: "短期コース｜修業年限", title: "卒業した学校の修業年限は？", note: "通信課程を含みます。編入学等による在学年数ではなく、課程年数を選択してください。", options: [{ label: "4年制", value: "4" }, { label: "3年制", value: "3" }, { label: "2年制", value: "2" }] },
  mhGeneralYears: { eyebrow: "一般コース｜修業年限", title: "卒業した学校の修業年限は？", note: "通信課程を含みます。編入学等による在学年数ではなく、課程年数を選択してください。", options: [{ label: "4年制", value: "4" }, { label: "3年制", value: "3" }, { label: "2年制", value: "2" }] },
  mhShortExp1: { eyebrow: "短期コース｜実務経験", title: "相談援助業務の経験は通算1年以上ありますか？", note: "1年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhShortExp2: { eyebrow: "短期コース｜実務経験", title: "相談援助業務の経験は通算2年以上ありますか？", note: "2年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhGeneralExp1: { eyebrow: "一般コース｜実務経験", title: "相談援助業務の経験は通算1年以上ありますか？", note: "1年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhGeneralExp2: { eyebrow: "一般コース｜実務経験", title: "相談援助業務の経験は通算2年以上ありますか？", note: "2年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhWork: { eyebrow: "精神保健福祉士コース", title: "これまでに「相談援助業務」の経験がありますか？", note: "精神障害のある方への相談や助言、日常生活への支援などを行う業務を指します。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
  mhWork4: { eyebrow: "実務経験を確認", title: "相談援助業務の経験は通算4年以上ありますか？", note: "4年以上の経験見込みを含みます。", options: [{ label: "はい", value: "yes" }, { label: "いいえ", value: "no" }] },
};

const unavailable: Result = { eligible: false, title: "現時点では、出願資格の要件を満たしていません" };

export default function Home() {
  const [step, setStep] = useState<Step>("course");
  const [course, setCourse] = useState<Course | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  const progress = useMemo(() => result ? 100 : Math.min(88, 15 + history.length * 16), [history, result]);

  const finish = (title: string, code: string) => setResult({ eligible: true, title, code });
  const no = () => setResult(unavailable);

  function answer(value: string, label: string) {
    const q = questions[step];
    setHistory((h) => [...h, { step, label: q?.title || "", answer: label }]);
    switch (step) {
      case "course": setCourse(value as Course); setStep(value === "social" ? "swCollege" : "mhLicense"); break;
      case "swCollege": setStep(value === "yes" ? "swYears" : "swWork"); break;
      case "swYears": value === "4" ? finish("社会福祉士コース", "入学資格1") : setStep(value === "3" ? "swExp1" : "swExp2"); break;
      case "swExp1": value === "yes" ? finish("社会福祉士コース", "入学資格2") : no(); break;
      case "swExp2": value === "yes" ? finish("社会福祉士コース", "入学資格3") : no(); break;
      case "swWork": value === "yes" ? setStep("swWork4") : no(); break;
      case "swWork4": value === "yes" ? finish("社会福祉士コース", "入学資格4") : no(); break;
      case "mhLicense": value === "yes" ? finish("精神保健福祉士短期コース", "入学資格4") : setStep("mhCollege"); break;
      case "mhCollege": setStep(value === "yes" ? "mhBasics" : "mhWork"); break;
      case "mhBasics": setStep(value === "yes" ? "mhShortYears" : "mhGeneralYears"); break;
      case "mhShortYears": value === "4" ? finish("精神保健福祉士短期コース", "入学資格1") : setStep(value === "3" ? "mhShortExp1" : "mhShortExp2"); break;
      case "mhShortExp1": value === "yes" ? finish("精神保健福祉士短期コース", "入学資格2") : no(); break;
      case "mhShortExp2": value === "yes" ? finish("精神保健福祉士短期コース", "入学資格3") : no(); break;
      case "mhGeneralYears": value === "4" ? finish("精神保健福祉士一般コース", "入学資格1") : setStep(value === "3" ? "mhGeneralExp1" : "mhGeneralExp2"); break;
      case "mhGeneralExp1": value === "yes" ? finish("精神保健福祉士一般コース", "入学資格2") : no(); break;
      case "mhGeneralExp2": value === "yes" ? finish("精神保健福祉士一般コース", "入学資格3") : no(); break;
      case "mhWork": value === "yes" ? setStep("mhWork4") : no(); break;
      case "mhWork4": value === "yes" ? finish("精神保健福祉士一般コース", "入学資格4") : no(); break;
    }
  }

  function restart() { setStep("course"); setCourse(null); setHistory([]); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function back() {
    const last = history.at(-1);
    if (!last) return;
    setStep(last.step); setHistory((h) => h.slice(0, -1)); setResult(null);
    if (last.step === "course") setCourse(null);
  }

  const q = questions[step];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="https://morii.ac.jp/" target="_blank" rel="noreferrer">
          <span className="brand-mark">MCL</span><span>盛岡医療福祉スポーツ専門学校</span>
        </a>
        <span className="header-label">通信教育部</span>
      </header>

      <section className="simulation">
          <div className="intro-panel">
            <div className="intro-copy">
              <span className="intro-chip">通信教育部</span>
              <h1>出願資格<br /><em>シミュレーション</em></h1>
              <p>いくつかの質問に答えて、<br className="intro-break" />ご自身がどのコースの出願資格に該当するか確認してみましょう。</p>
              <small>※このシミュレーションは、入力いただいた内容をもとにした簡易的な判定です。</small>
            </div>
          </div>

          <div className="sim-top">
            <button className="text-button" onClick={restart}>↻ 最初から</button>
            <div className="progress-wrap" aria-label={`進捗 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
            <span className="progress-number">{progress}%</span>
          </div>

          <div className="sim-grid">
            <aside className="history-panel">
              <p className="side-title">回答履歴</p>
              {history.length === 0 ? <p className="empty-history">回答すると、ここに履歴が表示されます。</p> :
                <ol>{history.map((item, i) => <li key={`${item.step}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span><div><small>{item.label}</small><strong>{item.answer}</strong></div></li>)}</ol>}
            </aside>

            <div className="question-area" aria-live="polite">
              {!result && q && <div className="question-card" key={step}>
                <p className="eyebrow">{q.eyebrow}</p>
                <h2>{q.title}</h2>
                {q.note && <p className="note">{q.note}</p>}
                <div className={`options ${q.options.length === 3 ? "three" : ""}`}>
                  {q.options.map((opt) => <button key={opt.value} onClick={() => answer(opt.value, opt.label)}><span>{opt.label}</span><b>→</b></button>)}
                </div>
                {history.length > 0 && <button className="back-button" onClick={back}>← ひとつ前の質問に戻る</button>}
              </div>}

              {result && <div className={`result-card ${result.eligible ? "eligible" : "not-eligible"}`}>
                <p className="eyebrow">診断結果</p>
                <div className="result-icon">{result.eligible ? "✓" : "!"}</div>
                {result.eligible ? <>
                  <p className="result-label">あなたは出願資格を満たしています</p>
                  <h2>{result.title}</h2><p className="qualification">{result.code}</p>
                  <p className="result-copy">入力いただいた内容から、上記コースの出願資格を満たしていることを確認しました。出願に必要な手続きや提出書類等の詳細は、学校ホームページをご確認ください。</p>
                </> : <>
                  <p className="result-label">出願不可</p><h2>{result.title}</h2>
                  <p className="result-copy">現在の学歴・実務経験では、出願に必要な条件に該当しません。今後、必要な学歴・実務経験の条件を満たすことで、出願可能となる場合があります。</p>
                </>}
                <div className="result-actions"><a href="https://morii.ac.jp/course_dcl/" target="_blank" rel="noreferrer">入学資格を詳しく確認する →</a><button onClick={restart}>もう一度診断する</button></div>
                <button className="back-button" onClick={back}>← 回答をひとつ戻す</button>
              </div>}
            </div>
          </div>

          <div className="reference-box">
            <strong>「相談援助業務」「基礎科目」について</strong>
            <p className="reference-copy"><span>ご自身の職歴・履修科目が該当するかは、</span><span>公益財団法人 社会福祉振興・試験センターの一覧表もあわせてご確認ください。</span></p>
            <div><a href="https://www.sssc.or.jp/shakai/shikaku/s_11.html" target="_blank" rel="noreferrer">社会福祉士の実務経験 ↗</a><a href="https://www.sssc.or.jp/seishin/shikaku/se_09.html" target="_blank" rel="noreferrer">精神保健福祉士の実務経験 ↗</a><a href="https://www.sssc.or.jp/seishin/shikaku/se_02.html" target="_blank" rel="noreferrer">精神保健福祉士の基礎科目 ↗</a></div>
          </div>
      </section>

      <section className="contact-footer" aria-label="入学案内">
        <div className="contact-block">
          <p className="footer-kicker">CONTACT</p>
          <h2>入学のご相談・お問い合わせ</h2>
          <a className="contact-tel" href="tel:00000000000">000-0000-0000</a>
          <p>受付時間：ダミーダミーダミー</p>
        </div>
        <div className="briefing-block">
          <p className="footer-kicker">INFORMATION</p>
          <h2>入学説明会</h2>
          <p className="briefing-lead">学校や学びについて、詳しく知りたい方へ</p>
          <span className="briefing-status">開催情報は準備中です</span>
          <p className="briefing-note">日程が決まり次第、こちらでご案内します。</p>
        </div>
      </section>
      <footer><span>© MCL盛岡医療福祉スポーツ専門学校</span></footer>
    </main>
  );
}
