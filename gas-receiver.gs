/**
 * KNN CC Check ー 集計用 Google Apps Script
 * ------------------------------------------------------------
 * 使い方
 *  1. Google スプレッドシートを新規作成
 *  2. 拡張機能 → Apps Script を開き、このコードを貼り付け
 *  3. 上部メニューから setupSheets を1回実行（シートと見出しを自動作成）
 *  4. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *       次のユーザーとして実行：自分
 *       アクセスできるユーザー：全員
 *  5. 発行された URL を knn-cc-check.html の GAS_URL に貼る
 * ------------------------------------------------------------
 */

var SHEET_RAW  = 'raw';       // 生データ
var SHEET_DASH = 'dashboard'; // 集計（グラフの元）

var AXES = ['ターミナル','導入・起動','CLAUDE.md','文脈管理','Git/GitHub',
            'Web公開','MCP／AI秘書','型化','自動化','他社比較'];

/** 初回セットアップ：シートと見出しを作る */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var raw = ss.getSheetByName(SHEET_RAW) || ss.insertSheet(SHEET_RAW);
  raw.clear();
  var head = ['受信日時','日付','受講番号','タイミング','職種'];
  AXES.forEach(function(a){ head.push('K_' + a); });
  AXES.forEach(function(a){ head.push('D_' + a); });
  head = head.concat(['知識計','実践計','総合','差','レベル','レベル名','タイプ']);
  raw.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold');
  raw.setFrozenRows(1);

  var dash = ss.getSheetByName(SHEET_DASH) || ss.insertSheet(SHEET_DASH);
  dash.clear();
  buildDashboard_(dash);
}

/** 診断アプリからの POST を受ける */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = JSON.parse(e.postData.contents);
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RAW);
    var row = [new Date(), p.stamp, p.pid, p.phase, p.role]
      .concat(p.k).concat(p.d)
      .concat([p.kTotal, p.dTotal, p.total, p.gap, p.level, p.levelName, p.type]);
    sh.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** ダッシュボード用の集計式を書き込む */
function buildDashboard_(dash) {
  // --- ① レベル分布（棒グラフの元）---
  dash.getRange('A1').setValue('■ レベル分布').setFontWeight('bold');
  dash.getRange('A2:C2').setValues([['レベル','研修前','研修後']]);
  for (var i = 0; i <= 4; i++) {
    var r = 3 + i;
    dash.getRange(r,1).setValue('LV.' + i);
    dash.getRange(r,2).setFormula('=COUNTIFS(raw!$AD:$AD,' + i + ',raw!$D:$D,"pre")');
    dash.getRange(r,3).setFormula('=COUNTIFS(raw!$AD:$AD,' + i + ',raw!$D:$D,"post")');
  }

  // --- ② 領域別の平均（レーダーチャートの元）---
  dash.getRange('E1').setValue('■ 領域別 平均').setFontWeight('bold');
  dash.getRange('E2:G2').setValues([['領域','知識 平均','実践 平均']]);
  for (var j = 0; j < 10; j++) {
    var rr = 3 + j;
    var kCol = colLetter_(6 + j);   // F列から K_*
    var dCol = colLetter_(16 + j);  // P列から D_*
    dash.getRange(rr,5).setValue(AXES[j]);
    dash.getRange(rr,6).setFormula('=IFERROR(AVERAGE(raw!' + kCol + '2:' + kCol + '),0)');
    dash.getRange(rr,7).setFormula('=IFERROR(AVERAGE(raw!' + dCol + '2:' + dCol + '),0)');
  }

  // --- ③ 散布図の元（知識 × 実践）---
  dash.getRange('I1').setValue('■ 知識×実践 散布図').setFontWeight('bold');
  dash.getRange('I2:K2').setValues([['受講番号','知識計','実践計']]);
  dash.getRange('I3').setFormula('=IFERROR(FILTER({raw!C2:C,raw!Z2:Z,raw!AA2:AA},raw!C2:C<>""),"")');

  // --- ④ 伸び率（同一受講番号の pre / post 比較）---
  dash.getRange('M1').setValue('■ 伸び（同一受講番号）').setFontWeight('bold');
  dash.getRange('M2:P2').setValues([['受講番号','前','後','伸び']]);
  dash.getRange('M3').setFormula('=IFERROR(UNIQUE(FILTER(raw!C2:C,raw!C2:C<>"")),"")');
  dash.getRange('N3').setFormula(
    '=ARRAYFORMULA(IF(M3:M="","",IFERROR(SUMIFS(raw!$AB:$AB,raw!$C:$C,M3:M,raw!$D:$D,"pre"),0)))');
  dash.getRange('O3').setFormula(
    '=ARRAYFORMULA(IF(M3:M="","",IFERROR(SUMIFS(raw!$AB:$AB,raw!$C:$C,M3:M,raw!$D:$D,"post"),0)))');
  dash.getRange('P3').setFormula('=ARRAYFORMULA(IF(M3:M="","",O3:O-N3:N))');
}

function colLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - m) / 26); }
  return s;
}
