const $ = id => document.getElementById(id);

const FIELD_IDS = [
  'pcName','plName','persona','hp','san','speed','slash','pierce','blunt','mind',
  'passive_name','passive_condition','passive_effect',
  'sup1_name','sup1_condition','sup1_effect',
  'sup2_name','sup2_condition','sup2_effect',
  'sup3_enable','sup3_name','sup3_condition','sup3_effect',
  'deathpassive_enable','deathp_name','deathp_condition','deathp_effect',
  'items','ego_zayin','ego_teth','ego_he','ego_waw','ego_aleph','cur_lp','cur_frag',
  'hasUnique','uniqueName','uniqueMax','uniqueType','uniqueEffect','free_note_1', 'free_note_2'
];

const STORAGE_KEY = 'limbus_trpg_sheet_v1';
let uniqueData = { name:'', max:1, type:'バフ', effect:'', checked:false };

// --- リアルタイムプレビュー ---
FIELD_IDS.forEach(id => {
  const el = $(id);
  if (!el) return;
  const eventType = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
  el.addEventListener(eventType, updatePreview);
});

// チェック表示切替
$('sup3_enable')?.addEventListener('change', ()=>{ $('sup3_wrapper').style.display = $('sup3_enable').checked ? 'block' : 'none'; updatePreview(); });
$('deathpassive_enable')?.addEventListener('change', ()=>{ $('deathpassive_wrapper').style.display = $('deathpassive_enable').checked ? 'block' : 'none'; updatePreview(); });
$('hasUnique')?.addEventListener('change', ()=>{ uniqueData.checked = $('hasUnique').checked; $('uniqueInput').style.display = uniqueData.checked ? 'block' : 'none'; updatePreview(); });

// 固有データ更新
['uniqueName','uniqueMax','uniqueType','uniqueEffect'].forEach(id=>{
  $(id)?.addEventListener('input',()=>{
    uniqueData.name = $('uniqueName').value;
    uniqueData.max = parseInt($('uniqueMax').value)||1;
    uniqueData.type = $('uniqueType').value;
    uniqueData.effect = $('uniqueEffect').value;
    updatePreview();
  });
});

// --- プレビュー更新 ---
function updatePreview(){
  const d = {};
  FIELD_IDS.forEach(id=>{ const el=$(id); if(!el) return; d[id] = el.type==='checkbox'?el.checked:el.value; });

  $('pPcName').textContent = (d.pcName||'').trim() || '—';
  $('pPlName').textContent = d.plName ? `PL: ${d.plName}` : '—';
  $('pPersona').textContent = d.persona||'—';
  $('pHp').textContent = d.hp||'—';
  $('pSan').textContent = d.san||'—';
  $('pSpeed').textContent = d.speed||'—';
  $('pSlash').textContent = d.slash||'—';
  $('pPierce').textContent = d.pierce||'—';
  $('pBlunt').textContent = d.blunt||'—';
  $('pMind').textContent = d.mind||'—';

  $('pPassives').textContent = (d.passive_name||d.passive_condition||d.passive_effect)
    ? `・${d.passive_name||''}\n発動条件：${d.passive_condition||''}\n効果：${d.passive_effect||''}` : '—';

  let sup='';
  if(d.sup1_name||d.sup1_condition||d.sup1_effect) sup+=`・${d.sup1_name}\n発動条件：${d.sup1_condition}\n効果：${d.sup1_effect}\n\n`;
  if(d.sup2_name||d.sup2_condition||d.sup2_effect) sup+=`・${d.sup2_name}\n発動条件：${d.sup2_condition}\n効果：${d.sup2_effect}\n\n`;
  if(d.sup3_enable && (d.sup3_name||d.sup3_condition||d.sup3_effect)) sup+=`・${d.sup3_name}\n発動条件：${d.sup3_condition}\n効果：${d.sup3_effect}\n\n`;
  $('pSupport').textContent = sup ? sup.trim() : '—';

  $('preview_deathpassive').textContent = d.deathpassive_enable
    ? ((d.deathp_name||d.deathp_condition||d.deathp_effect)?`・${d.deathp_name}\n発動条件：${d.deathp_condition}\n効果：${d.deathp_effect}`:'-')
    : 'なし';

  $('pItems').textContent = d.items||'—';
  $('pEgo').textContent = `ZAYIN: ${d.ego_zayin||'—'}\nTETH: ${d.ego_teth||'—'}\nHE: ${d.ego_he||'—'}\nWAW: ${d.ego_waw||'—'}\nALEPH: ${d.ego_aleph||'—'}`;
  $('pCurrency').textContent = `LP: ${d.cur_lp||0}\n自我の欠片: ${d.cur_frag||0}`;
  $('pUniqueItems').textContent = uniqueData.checked ? `名称: ${uniqueData.name}\n最大数: ${uniqueData.max}\n効果種別: ${uniqueData.type}\n効果: ${uniqueData.effect}` : '—';

  // --- 戦術 0〜4 ---
  let tactics='';
  for(let i=0;i<=4;i++){
    const name=$(`t${i}_name`)?.value||'';
    const attr=$(`t${i}_attr`)?.value||'';
    const guard=$(`t${i}_guard`)?.value||'';
    const sin=$(`t${i}_sin`)?.value||'';
    const dice=$(`t${i}_dice`)?.value||'';
    const effect=$(`t${i}_effect`)?.value||'';
    if(name||attr||guard||sin||dice||effect){
      tactics+=`・${name}\n`;
      if(guard) tactics+=`守備属性: ${guard}\n`;
      if(attr) tactics+=`攻撃属性: ${attr}\n`;
      if(sin) tactics+=`罪: ${sin}\n`;
      if(dice) tactics+=`ダイス: ${dice}\n`;
      if(effect) tactics+=`効果: ${effect}\n\n`;
    }
  }
  $('pTactics').textContent = tactics.trim()||'—';

  // 所持人格
  $('pPersonas').textContent = $('owned_personas')?.value||'—';
  // 身体強化
  $('pBodyEnhance').textContent = $('body_enhance')?.value||'—';
  // 所持E.G.O
  $('pOwnedEgo').textContent = $('owned_ego')?.value||'—';
  $('pFreeNote1').textContent = d.free_note_1 || '—';
  $('pFreeNote2').textContent = d.free_note_2 || '—';
}

// フォームの全入力値をオブジェクトとして取得する関数
function getFormData() {
    const form = document.getElementById('sheetForm');
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        const key = input.id;
        if (key) {
            if (input.type === 'checkbox') {
                data[key] = input.checked;
            } else {
                data[key] = input.value;
            }
        }
    });

    return data;
}

// オブジェクトの値をフォームに設定する関数
function setFormData(data) {
    for (const key in data) {
        const input = document.getElementById(key);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
                // チェックボックスの状態変更による追加表示要素の更新（例：sup3_wrapper / deathpassive_wrapper / uniqueInput）
                if (key === 'sup3_enable') {
                    document.getElementById('sup3_wrapper').style.display = data[key] ? 'grid' : 'none';
                }
                if (key === 'deathpassive_enable') {
                    document.getElementById('deathpassive_wrapper').style.display = data[key] ? 'grid' : 'none';
                }
                if (key === 'hasUnique') {
                    document.getElementById('uniqueInput').style.display = data[key] ? 'block' : 'none';
                }
            } else {
                input.value = data[key];
            }
        }
    }
    // フォームに値を設定した後、プレビューを更新する関数（※別途実装が必要）
    updatePreview(); 
}


// =================================================================
// スロット保存・読み込みの機能
// =================================================================

function saveToSlot(slotNumber) {
    const data = getFormData();
    const key = `limbus-sheet-slot-${slotNumber}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        alert(`スロット ${slotNumber} にキャラクターシートを保存しました！`);
    } catch (e) {
        alert('ローカルストレージへの保存に失敗しました。ブラウザの設定を確認してください。');
    }
}

function loadFromSlot(slotNumber) {
    const key = `limbus-sheet-slot-${slotNumber}`;
    const storedData = localStorage.getItem(key);

    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            setFormData(data);
            alert(`スロット ${slotNumber} からキャラクターシートを読み込みました！`);
        } catch (e) {
            alert('保存データの形式が不正です。読み込みに失敗しました。');
        }
    } else {
        alert(`スロット ${slotNumber} に保存されたデータはありません。`);
    }
}

// ★★★ スロット削除ボタンのイベント設定を追加 ★★★
    document.querySelectorAll('.slot-delete').forEach(button => {
        button.addEventListener('click', () => {
            const slot = button.getAttribute('data-slot');
            deleteFromSlot(slot);
        });
    });


// =================================================================
// イベントリスナーの設定
// =================================================================
// =================================================================
// ★★★ 1. ヘルパー関数: ラベルの更新 (最初に定義) ★★★
// =================================================================
const updateSlotButtonLabel = (slotNumber) => {
    const slotLabel = document.getElementById(`slot${slotNumber}_label`);
    const saveButton = document.querySelector(`.slot-save[data-slot="${slotNumber}"]`);
    const loadButton = document.querySelector(`.slot-load[data-slot="${slotNumber}"]`);
    
    const key = `limbus-sheet-slot-${slotNumber}`;
    const storedData = localStorage.getItem(key);

    const defaultSaveText = `S${slotNumber} 保存`;
    const defaultLoadText = `S${slotNumber} 読込`;

    // ボタンのテキストを常にデフォルトに戻す
    if (saveButton) saveButton.textContent = defaultSaveText;
    if (loadButton) loadButton.textContent = defaultLoadText;
    
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            const pcName = data.pcName || '名称未設定'; 
            
            if (slotLabel) {
                slotLabel.textContent = `S${slotNumber}: ${pcName}`;
            }
        } catch (e) {
            if (slotLabel) {
                slotLabel.textContent = `S${slotNumber}: (データ破損)`;
            }
        }
    } else { // <--- 正常な else ブロック (データがない場合の処理)
        // データがない場合、デフォルトのラベルに戻す
        if (slotLabel) {
            slotLabel.textContent = `スロット ${slotNumber}:`; 
        }
    }
};
// =================================================================
// ★★★ 2. スロット保存機能 (saveToSlot) ★★★
// =================================================================

function saveToSlot(slotNumber) {
    const data = getFormData();
    // 固有データも保存に追加
    data.uniqueData = uniqueData; 
    
    const key = `limbus-sheet-slot-${slotNumber}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        
        const pcName = data.pcName || '名称未設定';
        updateSlotButtonLabel(slotNumber); // ラベルを更新
        alert(`スロット ${slotNumber} にキャラクターシートを保存しました！ (${pcName})`);
    } catch (e) {
        alert('ローカルストレージへの保存に失敗しました。ブラウザの設定を確認してください。');
    }
}

// =================================================================
// ★★★ 3. スロット読み込み機能 (loadFromSlot) ★★★
// =================================================================

function loadFromSlot(slotNumber) {
    const key = `limbus-sheet-slot-${slotNumber}`;
    const storedData = localStorage.getItem(key);

    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            
            // 固有データを復元
            if (data.uniqueData) {
                uniqueData = data.uniqueData;
            } else {
                uniqueData = { name:'', max:1, type:'バフ', effect:'', checked:false };
            }
            
            setFormData(data); // フォームにデータを書き込み
            updateSlotButtonLabel(slotNumber); // ラベルを更新
            
            const pcName = data.pcName || '名称未設定';
            alert(`スロット ${slotNumber} からキャラクターシートを読み込みました！ (${pcName})`);
        } catch (e) {
            alert('保存データの形式が不正です。読み込みに失敗しました。');
        }
    } else {
        alert(`スロット ${slotNumber} に保存されたデータはありません。`);
    }
}

// =================================================================
// スロット削除の機能
// =================================================================
function deleteFromSlot(slotNumber) {
    // 誤操作防止のため確認ダイアログを表示
    if (!confirm(`スロット ${slotNumber} のデータを完全に削除しますか？\nこの操作は元に戻せません。`)) {
        return;
    }

    const key = `limbus-sheet-slot-${slotNumber}`;
    
    // ローカルストレージからデータを削除
    localStorage.removeItem(key);
    
    // ラベルとボタンの表示をリセット
    updateSlotButtonLabel(slotNumber); 

    alert(`スロット ${slotNumber} のデータを削除しました。`);
}

// =================================================================
// ★★★ 4. DOMContentLoaded の統合と修正 ★★★
// =================================================================
window.addEventListener('DOMContentLoaded', ()=>{
    // 古いローカルストレージからの読み込み (最初の1回だけ)
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    if(Object.keys(d).length !== 0) { // データが空でないか確認
        setFormData(d);
    }
    
    // スロットボタンのイベント設定
    document.querySelectorAll('.slot-save').forEach(button => {
        button.addEventListener('click', () => {
            saveToSlot(button.getAttribute('data-slot'));
        });
    });

    document.querySelectorAll('.slot-load').forEach(button => {
        button.addEventListener('click', () => {
            loadFromSlot(button.getAttribute('data-slot'));
        });
    });

    // 既存の「ローカル保存」ボタンはスロット1に保存する機能に置き換え
    document.getElementById('saveBtn')?.addEventListener('click', () => {
        saveToSlot(1);
    });

    // ページロード時に全スロットのラベルを更新する
    for (let i = 1; i <= 4; i++) {
        updateSlotButtonLabel(i);
    }
    
    // プレビューの最終更新
    updatePreview();
});



// --- TOPボタン --- 
$('pageTopBtn')?.addEventListener('click', ()=>{ window.scrollTo({top:0, behavior:'smooth'}); });

// --- 保存・読み込み・クリア --- 
function clearForm(){
  if(!confirm('フォームの内容をすべてクリアしますか？')) return;
  
  // 1. FIELD_IDSに含まれる要素をクリア
  FIELD_IDS.forEach(id=>{
    const el=$(id);
    if(!el) return;
    if(el.type === 'checkbox'){
      // チェックボックスは状態を変更しない
      return; 
    } else if(['slash', 'pierce', 'blunt'].includes(id)){
      el.value = '普通'; // 耐性の初期値
    } else if(el.tagName === 'SELECT'){
      // 戦術・罪のセレクトボックスは空欄にリセット
      el.value = '';
    } else {
      el.value = ''; // テキスト/数値入力欄はクリア
    }
  });

  // 2. FIELD_IDSに含まれていない戦術の入力欄をクリア
  for(let i=0; i<=4; i++){
    if($(`t${i}_name`)) $(`t${i}_name`).value = '';
    if($(`t${i}_guard`)) $(`t${i}_guard`).value = '';
    if($(`t${i}_attr`)) $(`t${i}_attr`).value = '';
    if($(`t${i}_sin`)) $(`t${i}_sin`).value = '';
    if($(`t${i}_dice`)) $(`t${i}_dice`).value = '';
    if($(`t${i}_effect`)) $(`t${i}_effect`).value = '';
  }
  
  // 3. FIELD_IDSに含まれていない下部のテキストエリアと自由記入欄をクリア
  if($('owned_personas')) $('owned_personas').value = '';
  if($('body_enhance')) $('body_enhance').value = '';
  if($('owned_ego')) $('owned_ego').value = '';
  if($('owned_support_passives')) $('owned_support_passives').value = '';
  if($('owned_spirits')) $('owned_spirits').value = '';
  if($('free_note_1')) $('free_note_1').value = ''; // ★ 追加した自由記入欄
  if($('free_note_2')) $('free_note_2').value = ''; // ★ 追加した自由記入欄

  // 4. 固有データのリセット
  uniqueData = { name:'', max:1, type:'バフ', effect:'', checked:false };
  
  // 5. チェックボックスの状態は変更しないが、それに依存する表示はリセット
  // チェックボックスの状態を強制的にfalseにすることで、次回読み込み時に非表示からスタートさせる
  if($('hasUnique')) $('hasUnique').checked = false;
  if($('uniqueInput')) $('uniqueInput').style.display='none';
  if($('sup3_enable')) $('sup3_enable').checked = false;
  if($('sup3_wrapper')) $('sup3_wrapper').style.display='none';
  if($('deathpassive_enable')) $('deathpassive_enable').checked = false;
  if($('deathpassive_wrapper')) $('deathpassive_wrapper').style.display='none';
  
  // 6. プレビューを更新し、ローカルストレージを削除
  updatePreview();
  localStorage.removeItem(STORAGE_KEY);
}

$('downloadBtn')?.addEventListener('click',()=>{
  const lines=[
    `PC名: ${$('pPcName').textContent}`,
    `PL名: ${$('pPlName').textContent}`,
    '',
    '【ステータス】',
    `人格: ${$('pPersona').textContent}`,
    `HP: ${$('pHp').textContent}`,
    `SAN: ${$('pSan').textContent}`,
    `速度: ${$('pSpeed').textContent}`,
    `斬撃: ${$('pSlash').textContent}`,
    `貫通: ${$('pPierce').textContent}`,
    `打撃: ${$('pBlunt').textContent}`,
    `精神: ${$('pMind').textContent}`,
    '',
    '【パッシブ】', $('pPassives').textContent,
    '【サポートパッシブ】', $('pSupport').textContent,
    '【死亡後パッシブ】', $('preview_deathpassive').textContent,
    '【アイテム / 所持品】', $('pItems').textContent,
    '【装備 E.G.O】', $('pEgo').textContent,
    '【所持通貨 / その他】', $('pCurrency').textContent,
    '【戦術】', $('pTactics').textContent,
    '【所持人格】', $('pPersonas').textContent,
    '【身体強化】', $('pBodyEnhance').textContent,
    '【所持 E.G.O】', $('pOwnedEgo').textContent,
    '【固有項目】', $('pUniqueItems').textContent,
    '【自由記入欄 1】', $('pFreeNote1').textContent,
    '【自由記入欄 2】', $('pFreeNote2').textContent
  ];
  const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${$('pPcName').textContent||'character'}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// --- 初期読み込み ---
window.addEventListener('DOMContentLoaded', ()=>{
  const d = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
  if(d) writeData(d);
  updatePreview();
});

// --- ボタン ---
$('saveBtn')?.addEventListener('click', saveLocal);
$('clearBtn')?.addEventListener('click', clearForm);

function saveLocal(){
  const data = readData();
  // 読み込み時と異なり、保存時には下部テキストエリアを手動で収集する必要がある (readData関数の不完全性を補うため)
  data.owned_personas = $('owned_personas')?.value || '';
  data.body_enhance = $('body_enhance')?.value || '';
  data.owned_ego = $('owned_ego')?.value || '';
  data.owned_support_passives = $('owned_support_passives')?.value || '';
  data.owned_spirits = $('owned_spirits')?.value || '';
  
  // 戦術情報も保存
  for(let i=0; i<=4; i++){
      data[`t${i}_name`] = $(`t${i}_name`)?.value || '';
      data[`t${i}_guard`] = $(`t${i}_guard`)?.value || '';
      data[`t${i}_attr`] = $(`t${i}_attr`)?.value || '';
      data[`t${i}_sin`] = $(`t${i}_sin`)?.value || '';
      data[`t${i}_dice`] = $(`t${i}_dice`)?.value || '';
      data[`t${i}_effect`] = $(`t${i}_effect`)?.value || '';
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  alert('キャラクターシートをローカルに保存しました！');
}

function clearForm(){
  if(!confirm('フォームの内容をすべてクリアしますか？')) return;
  
  // FIELD_IDSに含まれる要素をクリア
  FIELD_IDS.forEach(id=>{
    const el=$(id);
    if(!el) return;
    if(el.type === 'checkbox'){
      // チェックボックスは状態を変更しない
      return; 
    } else if(['slash', 'pierce', 'blunt'].includes(id)){
      el.value = '普通'; // 耐性の初期値
    } else if(el.tagName === 'SELECT'){
      el.value = '';
    } else {
      el.value = '';
    }
  });

  // FIELD_IDSに含まれていない戦術と下部テキストエリアをクリア
  for(let i=0; i<=4; i++){
    $(`t${i}_name`).value = '';
    $(`t${i}_guard`).value = '';
    $(`t${i}_attr`).value = '';
    $(`t${i}_sin`).value = '';
    $(`t${i}_dice`).value = '';
    $(`t${i}_effect`).value = '';
  }
  
  $('owned_personas').value = '';
  $('body_enhance').value = '';
  $('owned_ego').value = '';
  $('owned_support_passives').value = '';
  $('owned_spirits').value = '';

  // 固有データのリセット
  uniqueData = { name:'', max:1, type:'バフ', effect:'', checked:false };
  
  // チェックボックスの状態は変更しないが、それに依存する表示はリセット
  $('hasUnique').checked = false;
  $('uniqueInput').style.display='none';
  $('sup3_enable').checked = false;
  $('sup3_wrapper').style.display='none';
  $('deathpassive_enable').checked = false;
  $('deathpassive_wrapper').style.display='none';
  
  updatePreview();
  localStorage.removeItem(STORAGE_KEY);
}

function printSheet(){
  window.print();
}

$('clearBtnTop')?.addEventListener('click', clearForm);
$('printBtn')?.addEventListener('click', printSheet);
