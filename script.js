/**
 * Limbus TRPG キャラクターシートメーカー
 * JavaScript ファイル
 */

document.addEventListener('DOMContentLoaded', () => {
    // 主要な要素の取得
    const sheetForm = document.getElementById('sheetForm');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');
    const pageTopBtn = document.getElementById('pageTopBtn');
    const extraTacticsEnable = document.getElementById('extraTactics_enable');
    const extraTacticsCountContainer = document.getElementById('extraTacticsCountContainer');
    const extraTacticsCount = document.getElementById('extraTacticsCount');
    const dynamicTacticsFormsContainer = document.getElementById('dynamicTacticsFormsContainer'); // 追加戦術のコンテナ要素を取得

    // ローカルストレージキー
    const localStorageKey = 'limbusTRPGSheetData';
    const MAX_UNIQUE_SKILLS = 10; // 固有スキルの最大数

    // フォームのすべての入力要素のID (静的項目)
    const inputIds = [
        'pcName', 'plName', 'persona', 'hp', 'san', 'speed', 'slash', 'pierce', 'blunt', 'mind', 'mind_effect',
        'passive_name', 'passive_condition', 'passive_effect',
        'sup1_name', 'sup1_condition', 'sup1_effect',
        'sup2_name', 'sup2_condition', 'sup2_effect',
        'sup3_name', 'sup3_condition', 'sup3_effect',
        'deathp_name', 'deathp_condition', 'deathp_effect',
        't0_name', 't0_guard', 't0_match', 't0_attr', 't0_sin', 't0_effect', 
        't1_name', 't1_attr', 't1_sin', 't1_effect',
        't2_name', 't2_attr', 't2_sin', 't2_effect',
        't3_name', 't3_attr', 't3_sin', 't3_effect',
        't4_name', 't4_attr', 't4_sin', 't4_effect',
        // 't5_type', 't5_name', 't5_attr', 't5_sin', 't5_effect', // 動的生成のためコメントアウト
        // ... t6〜t10 も同様
        // ▼ E.G.O.の詳細情報
        'ego_zayin', 'ego_zayin_condition', 'ego_zayin_effect', 'ego_zayin_awake', 'ego_zayin_corrode',
        'ego_teth', 'ego_teth_condition', 'ego_teth_effect', 'ego_teth_awake', 'ego_teth_corrode',
        'ego_he', 'ego_he_condition', 'ego_he_effect', 'ego_he_awake', 'ego_he_corrode',
        'ego_waw', 'ego_waw_condition', 'ego_waw_effect', 'ego_waw_awake', 'ego_waw_corrode',
        'ego_aleph', 'ego_aleph_condition', 'ego_aleph_effect', 'ego_aleph_awake', 'ego_aleph_corrode',
        // ▲ E.G.O.の詳細情報
        'items', 
        'cur_lp', 'cur_frag',
        'owned_personas', 'body_enhance', 'owned_ego', 'owned_support_passives', 'owned_spirits',
        'free_note_1', 'free_note_2'
    ];
    // 制御用ID (動的フォームの表示/非表示やカウントに使う)
    const controlIds = ['hasUnique', 'uniqueCount', 'sup3_enable', 'deathpassive_enable', 'extraTactics_enable', 
    'extraTacticsCount'];
    // 全ての静的なIDリスト
    const allStaticIds = [...inputIds, ...controlIds];

    /**
     * 指定されたインデックスの戦術フォームのHTMLを生成する
     * @param {number} index - 戦術番号 (5〜10)
     * @returns {string} - 生成されたHTML文字列
     */
    function generateExtraTacticForm(index) {
        // 既存のtactic-blockのスタイルを踏襲
        return `
        <div class="tactic-block" data-tactic-index="${index}">
            <label>${index}：</label>

            <label>種別</label>
            <select id="t${index}_type">
                <option value="戦術">戦術</option>
                <option value="強化戦術">強化戦術</option>
            </select>
    
            <input id="t${index}_name" type="text" placeholder="戦術名" />
    
            <label style="margin-top:6px">攻撃属性</label>
            <select id="t${index}_attr">
                <option value="">選択</option>
                <option value="斬撃">斬撃</option>
                <option value="貫通">貫通</option>
                <option value="打撃">打撃</option>
            </select>
    
            <label style="margin-top:6px">罪</label>
            <select id="t${index}_sin">
                <option value="">選択</option>
                <option value="憤怒">憤怒</option>
                <option value="色欲">色欲</option>
                <option value="怠惰">怠惰</option>
                <option value="暴食">暴食</option>
                <option value="憂鬱">憂鬱</option>
                <option value="傲慢">傲慢</option>
                <option value="嫉妬">嫉妬</option>
            </select>
    
            <label style="margin-top:6px">効果</label>
            <textarea id="t${index}_effect" placeholder="（効果）"></textarea>
        </div>
        `;
    }

    /**
     * 追加戦術数に基づいてフォームを再描画する
     */
    function renderExtraTacticsForms() {
        const countInput = document.getElementById('extraTacticsCount');
        const container = document.getElementById('dynamicTacticsFormsContainer');
        const count = parseInt(countInput?.value) || 0; // nullチェックを追加

        if (!container) return;

        // コンテナをクリア
        container.innerHTML = '';
    
        // 最大6枠までフォームを生成 (i=5からスタートし、5+countまで)
        const maxCount = Math.min(count, 6);
    
        let allFormsHtml = '';
        for (let i = 5; i < 5 + maxCount; i++) {
            allFormsHtml += generateExtraTacticForm(i);
        }

        container.innerHTML = allFormsHtml;
      
        // 再生成された入力欄にイベントリスナーを再登録する
        // 既存の updatePreview をそのまま流用
        const form = document.getElementById('sheetForm');
        if (form) {
            form.querySelectorAll('.tactic-block input, .tactic-block select, .tactic-block textarea').forEach(element => {
                element.addEventListener('input', autoSaveAndPreview); // updatePreviewを直接呼ぶのではなく、autoSave経由で呼ぶ
            });
        }
    }

    // 動的に生成される固有スキル項目のIDリストを取得する関数
    function getDynamicUniqueInputIds(data) {
        const count = parseInt(data.uniqueCount) || 0;
        const dynamicIds = [];
        for (let i = 0; i < count; i++) {
            dynamicIds.push(`uniqueName_${i}`, `uniqueMax_${i}`, `uniqueType_${i}`, `uniqueEffect_${i}`);
        }
        return dynamicIds;
    }
    
    // 動的に生成される追加戦術項目のIDリストを取得する関数
    function getDynamicExtraTacticsIds(data) {
        const count = parseInt(data.extraTacticsCount) || 0;
        const dynamicIds = [];
        const maxCount = Math.min(count, 6);
        for (let i = 5; i < 5 + maxCount; i++) {
            dynamicIds.push(`t${i}_type`, `t${i}_name`, `t${i}_attr`, `t${i}_sin`, `t${i}_effect`);
        }
        return dynamicIds;
    }


    // フォームからデータを取得する関数
    function getFormData() {
        const data = {};
        
        // フォーム上の現在のuniqueCount, extraTacticsCountを取得
        const uniqueCount = parseInt(document.getElementById('uniqueCount')?.value) || 0;
        const extraTacticsCount = parseInt(document.getElementById('extraTacticsCount')?.value) || 0;
        
        // 現在のDOMに基づいて動的IDを取得
        const dynamicUniqueIds = getDynamicUniqueInputIds({ uniqueCount: uniqueCount });
        const dynamicExtraTacticsIds = getDynamicExtraTacticsIds({ extraTacticsCount: extraTacticsCount });
        
        // 全てのIDを統合
        const allIds = [...allStaticIds, ...dynamicUniqueIds, ...dynamicExtraTacticsIds];

        allIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    data[id] = element.checked;
                } else if (element.type === 'number') {
                    // 値が空文字列の場合、空文字列を保存するロジックを維持
                    data[id] = element.value !== '' ? parseInt(element.value) : ''; 
                } else {
                    data[id] = element.value;
                }
            }
        });
        return data;
    }

    // データをフォームに反映する関数
    function setFormData(data) {
        // 1. コントロール系要素の復元 (動的フォーム数を先にセットする必要がある)
        controlIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && data[id] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = data[id];
                } else {
                    element.value = data[id];
                }
            }
        });

        // 2. 動的フォームの生成 (hasUnique, extraTactics_enable の状態に応じてフォームを生成)
        document.getElementById('hasUnique')?.dispatchEvent(new Event('change'));
        
        // extraTactics の制御ロジックを再実行 (DOM構築後の処理として)
        if (document.getElementById('extraTactics_enable')?.checked) {
            document.getElementById('extraTacticsCountContainer').style.display = 'block';
        } else {
            document.getElementById('extraTacticsCountContainer').style.display = 'none';
        }
        renderExtraTacticsForms(); // 追加戦術フォームを生成

        // 3. 全要素の値を復元
        // データのユニーク数と追加戦術数に基づいて動的IDを取得 (データが持っている数を使用)
        const dynamicUniqueIdsOnLoad = getDynamicUniqueInputIds(data);
        const dynamicExtraTacticsIdsOnLoad = getDynamicExtraTacticsIds(data);
        const allIds = [...allStaticIds, ...dynamicUniqueIdsOnLoad, ...dynamicExtraTacticsIdsOnLoad];
        
        allIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && data[id] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = data[id];
                } else {
                    element.value = data[id];
                }
            }
        });

        // 4. その他表示・非表示の切り替えを更新 (フォームが完全に復元されてから実行)
        document.getElementById('sup3_enable')?.dispatchEvent(new Event('change'));
        document.getElementById('deathpassive_enable')?.dispatchEvent(new Event('change'));
        
        // E.G.O.の詳細表示の切り替えを再実行
        ['zayin','teth','he','waw','aleph'].forEach(id => {
            const input = document.getElementById('ego_' + id);
            const extra = document.getElementById('ego_' + id + '_extra');
            if (input && extra) {
                extra.style.display = input.value.trim() !== '' ? 'grid' : 'none'; 
            }
        });
    }

    // プレビュー表示を更新する関数
    function updatePreview(data) {
        // 基本情報
        document.getElementById('pPcName').textContent = data.pcName || '—';
        document.getElementById('pPlName').textContent = data.plName ? `PL: ${data.plName}` : '—';

        // ステータス関連
        document.getElementById('pPersona').textContent = data.persona || '—';
        document.getElementById('pHp').textContent = data.hp || '—';
        document.getElementById('pSan').textContent = data.san || '—';
        document.getElementById('pSpeed').textContent = data.speed || '—';
        document.getElementById('pSlash').textContent = data.slash || '—';
        document.getElementById('pPierce').textContent = data.pierce || '—';
        document.getElementById('pBlunt').textContent = data.blunt || '—';
        document.getElementById('pMind').textContent = data.mind || '—';
        document.getElementById('pMindEffect').textContent = data.mind_effect || '—';

        // パッシブ
        let passiveText = `【${data.passive_name || '名称不明'}】\n`;
        passiveText += `発動条件: ${data.passive_condition || '—'}\n`;
        passiveText += `効果: ${data.passive_effect || '—'}`;
        document.getElementById('pPassives').textContent = passiveText;

        // サポートパッシブ
        let supportText = '';
        const supports = [
            { name: data.sup1_name, condition: data.sup1_condition, effect: data.sup1_effect, label: '1' },
            { name: data.sup2_name, condition: data.sup2_condition, effect: data.sup2_effect, label: '2' }
        ];

        if (data.sup3_enable) { 
            supports.push({ name: data.sup3_name, condition: data.sup3_condition, effect: data.sup3_effect, label: '3' });
        }

        supports.forEach(sup => {
            if (sup.name || sup.condition || sup.effect) {
                supportText += `【${sup.label}: ${sup.name || '名称不明'}】\n`;
                supportText += `発動条件: ${sup.condition || '—'}\n`;
                supportText += `効果: ${sup.effect || '—'}\n\n`;
            }
        });
        document.getElementById('pSupport').textContent = supportText.trim() || '—';


        // 死亡後パッシブ
        let deathText = '—';
        if (data.deathpassive_enable) { 
            deathText = `【${data.deathp_name || '名称不明'}】\n`;
            deathText += `発動条件: ${data.deathp_condition || '—'}\n`;
            deathText += `効果: ${data.deathp_effect || '—'}`;
        }
        document.getElementById('preview_deathpassive').textContent = deathText;

        // 戦術 (T0〜T4 + T5〜T10)
        let tacticsText = '';
        // T0〜T4
        for (let i = 0; i <= 4; i++) {
            const name = data[`t${i}_name`];
            const effect = data[`t${i}_effect`];
            const sin = data[`t${i}_sin`];
            const attr = data[`t${i}_attr`];

            if (name || effect) {
                let line = `戦術${i}：${name || '名称不明'}\n`;
                
                if (i === 0) {
                    const guard = data.t0_guard;
                    const matchStatus = data.t0_match || '可能';
                    line += `属性: (守備: ${guard || '—'}, 攻撃: ${attr || '—'}, 罪: ${sin || '—'}, マッチ: ${matchStatus})\n`;
                } else {
                    line += `属性: (攻撃: ${attr || '—'}, 罪: ${sin || '—'})\n`;
                }

                line += `効果: ${effect || '—'}\n\n`;
                tacticsText += line;
            }
        }

        // T5〜T10 (動的に生成される追加戦術)
        if (data.extraTactics_enable) {
            const count = Math.min(parseInt(data.extraTacticsCount) || 0, 6);
            for (let i = 5; i < 5 + count; i++) {
                const type = data[`t${i}_type`];
                const name = data[`t${i}_name`];
                const effect = data[`t${i}_effect`];
                const sin = data[`t${i}_sin`];
                const attr = data[`t${i}_attr`];

                if (name || effect) {
                    let line = `戦術${i}：【${type || '—'}】${name || '名称不明'}\n`;
                    line += `属性: (攻撃: ${attr || '—'}, 罪: ${sin || '—'})\n`;
                    line += `効果: ${effect || '—'}\n\n`;
                    tacticsText += line;
                }
            }
        }
        
        document.getElementById('pTactics').textContent = tacticsText.trim() || '—';

        // 固有 (動的生成に対応したプレビュー処理)
        let uniquePreviewText = '—';
        if (data.hasUnique && data.uniqueCount > 0) {
            uniquePreviewText = '';
            const count = Math.min(parseInt(data.uniqueCount) || 0, MAX_UNIQUE_SKILLS);
            for (let i = 0; i < count; i++) {
                const name = data[`uniqueName_${i}`] || '名称不明';
                const max = data[`uniqueMax_${i}`] || '—';
                const type = data[`uniqueType_${i}`] || '—';
                const effect = data[`uniqueEffect_${i}`] || '—';
                
                uniquePreviewText += `【固有 #${i+1}: ${name}】\n`;
                uniquePreviewText += `最大数: ${max}, 種別: ${type}\n`;
                uniquePreviewText += `効果:\n${effect}\n\n`;
            }
        }
        document.getElementById('pUniqueItems').textContent = uniquePreviewText.trim();


        // アイテム
        document.getElementById('pItems').textContent = data.items || '—';

        // 装備 E.G.O
        let egoText = '';
        const egoRanks = ['zayin', 'teth', 'he', 'waw', 'aleph'];
        
        egoRanks.forEach(rank => {
            const name = data[`ego_${rank}`] || '—';
            
            egoText += `${rank.toUpperCase()}: ${name}\n`;

            if (name !== '—' && name.trim() !== '') {
                const condition = data[`ego_${rank}_condition`] || '—';
                const effect = data[`ego_${rank}_effect`] || '—';
                const awake = data[`ego_${rank}_awake`] || '—';
                const corrode = data[`ego_${rank}_corrode`] || '—';
                
                egoText += `  発動条件: ${condition}\n`;
                egoText += `  効果:\n${effect}\n`;
                egoText += `  覚醒スキル効果:\n${awake}\n`;
                egoText += `  侵蝕スキル効果:\n${corrode}\n\n`; 
            } else {
                 egoText += '\n'; // EGO名がない場合も改行を追加
            }
        });
        document.getElementById('pEgo').textContent = egoText.trim() || '—';

        // 通貨
        let currencyText = `LP: ${data.cur_lp || '0'}\n`;
        currencyText += `自我の欠片: ${data.cur_frag || '0'}`;
        document.getElementById('pCurrency').textContent = currencyText;

        // その他
        document.getElementById('pPersonas').textContent = data.owned_personas || '—';
        document.getElementById('pBodyEnhance').textContent = data.body_enhance || '—';
        document.getElementById('pOwnedEgo').textContent = data.owned_ego || '—';
        document.getElementById('pOwnedSupportPassives').textContent = data.owned_support_passives || '—';
        document.getElementById('pOwnedSpirits').textContent = data.owned_spirits || '—';
        document.getElementById('pFreeNote1').textContent = data.free_note_1 || '—';
        document.getElementById('pFreeNote2').textContent = data.free_note_2 || '—';
    }

    // 自動保存とプレビュー更新
    function autoSaveAndPreview() {
        const data = getFormData();
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        updatePreview(data);
    }

    // フォーム入力変更時のイベントリスナーを設定 (静的フォーム用)
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.addEventListener('change', autoSaveAndPreview);
            } else {
                element.addEventListener('input', autoSaveAndPreview);
            }
        }
    });
    // 制御ID (チェックボックス) にもイベントリスナーを設定
    controlIds.filter(id => id !== 'uniqueCount' && id !== 'extraTacticsCount').forEach(id => {
        const element = document.getElementById(id);
        if (element && element.type === 'checkbox') {
            element.addEventListener('change', autoSaveAndPreview);
        }
    });

    // ページトップへ戻るボタン
    pageTopBtn?.addEventListener('click', () => { // nullチェックを追加
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // フォームをクリアする関数
    function clearForm() {
        // 現在のDOMに基づいて動的IDを取得し、クリア対象に含める
        const currentData = getFormData();
        const allDynamicIds = [
            ...getDynamicUniqueInputIds(currentData), 
            ...getDynamicExtraTacticsIds(currentData)
        ];
        const allIds = [...allStaticIds, ...allDynamicIds];
        
        allIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = false;
                } else if (element.type === 'number') {
                    element.value = '';
                } else if (element.tagName === 'SELECT') {
                    // SELECTは初期値に戻す
                    element.value = element.querySelector('option[value=""]')?.value ?? element.options[0].value;
                } else {
                    element.value = '';
                }
            }
        });
        
        // 特定の項目をデフォルト値に設定
        const slashElement = document.getElementById('slash');
        if(slashElement) slashElement.value = '普通';
        const pierceElement = document.getElementById('pierce');
        if(pierceElement) pierceElement.value = '普通';
        const bluntElement = document.getElementById('blunt');
        if(bluntElement) bluntElement.value = '普通';
        const mindEffectElement = document.getElementById('mind_effect');
        if(mindEffectElement) mindEffectElement.value = '';
        const t0AttrElement = document.getElementById('t0_attr');
        if(t0AttrElement) t0AttrElement.value = 'なし';
        const t0MatchElement = document.getElementById('t0_match');
        if(t0MatchElement) t0MatchElement.value = '不可'; 
        const uniqueCountElement = document.getElementById('uniqueCount');
        if(uniqueCountElement) uniqueCountElement.value = '1';
        
        // チェックボックスの状態をリセットし、イベントを発火
        const sup3Enable = document.getElementById('sup3_enable');
        if(sup3Enable) {
            sup3Enable.checked = false;
            sup3Enable.dispatchEvent(new Event('change'));
        }
        const deathpassiveEnable = document.getElementById('deathpassive_enable');
        if(deathpassiveEnable) {
            deathpassiveEnable.checked = false;
            deathpassiveEnable.dispatchEvent(new Event('change'));
        }
        const hasUnique = document.getElementById('hasUnique');
        if(hasUnique) {
            hasUnique.checked = false;
            hasUnique.dispatchEvent(new Event('change'));
        }
        const extraTacticsEnable = document.getElementById('extraTactics_enable');
        if(extraTacticsEnable) {
            extraTacticsEnable.checked = false;
            extraTacticsEnable.dispatchEvent(new Event('change'));
        }

        // extraTacticsCount をリセットし、フォームを再描画
        const extraTacticsCount = document.getElementById('extraTacticsCount');
        if(extraTacticsCount) extraTacticsCount.value = '0';
        renderExtraTacticsForms(); // フォームをクリアした状態で再描画

        localStorage.removeItem(localStorageKey);
        updatePreview(getFormData());
        updateSlotLabels();

        alert('フォームがクリアされました。');
    }

    // ローカル保存ボタン
    saveBtn?.addEventListener('click', () => {
        autoSaveAndPreview(); // 最新の内容を保存
        alert('キャラクターシートの内容をブラウザに保存しました。次回アクセス時に自動で復元されます。');
    });

    // クリアボタン
    clearBtn?.addEventListener('click', clearForm);

    // ダウンロードボタン (テキストとして保存)
    downloadBtn?.addEventListener('click', () => {
        const data = getFormData();
        const textContent = formatDataAsText(data);
        const pcName = data.pcName || 'LimbusTRPG_Sheet';
        downloadText(textContent, `${pcName}.txt`);
    });

    // 印刷 / PDFボタン
    printBtn?.addEventListener('click', () => {
        window.print();
    });

    // テキスト形式に整形する関数 (ダウンロード用)
    function formatDataAsText(data) {
        let text = `=================================================================\n`;
        text += `■ LimbusTRPG キャラクターシート\n`;
        text += `=================================================================\n\n`;

        text += `【基本情報】\n`;
        text += `PC 名: ${data.pcName || '—'}\n`;
        text += `PL 名: ${data.plName || '—'}\n\n`;

        text += `【ステータス】\n`;
        text += `人格:【 ${data.persona || '—'}】\n`;
        text += `HP: ${data.hp || '—'}\n`;
        text += `SAN: ${data.san || '—'}\n`;
        text += `速度: ${data.speed || '—'}\n`;
        text += `精神: ${data.mind || '—'}\n`;
        text += `精神効果:${data.mind_effect || '—'}\n`;
        text += `斬撃耐性: ${data.slash || '—'}\n`;
        text += `貫通耐性: ${data.pierce || '—'}\n`;
        text += `打撃耐性: ${data.blunt || '—'}\n\n`;

        // パッシブ
        text += `【パッシブ】\n`;
        text += `名称: ${data.passive_name || '—'}\n`;
        text += `発動条件: ${data.passive_condition || '—'}\n`;
        text += `効果:${data.passive_effect || '—'}\n\n`;

        // サポートパッシブ
        text += `【サポートパッシブ】\n`;
        const supports = [
            { name: data.sup1_name, condition: data.sup1_condition, effect: data.sup1_effect, label: '1' },
            { name: data.sup2_name, condition: data.sup2_condition, effect: data.sup2_effect, label: '2' }
        ];
        if (data.sup3_enable) { 
            supports.push({ name: data.sup3_name, condition: data.sup3_condition, effect: data.sup3_effect, label: '3' });
        }

        supports.forEach(sup => {
            text += `[${sup.label}] 名称: ${sup.name || '—'}\n`;
            text += `発動条件: ${sup.condition || '—'}\n`;
            text += `効果:${sup.effect || '—'}\n`;
        });
        text += '\n';

        // 死亡後パッシブ
        if (data.deathpassive_enable) { 
            text += `【死亡後パッシブ】\n`;
            text += `名称: ${data.deathp_name || '—'}\n`;
            text += `発動条件: ${data.deathp_condition || '—'}\n`;
            text += `効果:${data.deathp_effect || '—'}\n\n`;
        }


        // 戦術 (T0〜T4 + T5〜T10)
        text += `【戦術】\n`;
        
        // T0〜T4
        for (let i = 0; i <= 4; i++) {
            const name = data[`t${i}_name`];
            const effect = data[`t${i}_effect`];
            const sin = data[`t${i}_sin`];
            const attr = data[`t${i}_attr`];

            if (name || effect) {
                let header = `戦術${i}: ${name || '名称不明'}`;
                
                if (i === 0) {
                    const guard = data.t0_guard;
                    const matchStatus = data.t0_match || '可能';
                    header += ` (守備: ${guard || '—'}/ 攻撃: ${attr || '—'}/ 罪: ${sin || '—'}/ マッチ処理: ${matchStatus})`; 
                } else {
                    header += ` (攻撃: ${attr || '—'}/ 罪: ${sin || '—'})`;
                }

                text += `${header}\n`;
                text += `効果:${effect || '—'}\n`;
            }
        }
        
        // T5〜T10 (動的に生成される追加戦術)
        if (data.extraTactics_enable) {
            const count = Math.min(parseInt(data.extraTacticsCount) || 0, 6);
            for (let i = 5; i < 5 + count; i++) {
                const type = data[`t${i}_type`] || '—';
                const name = data[`t${i}_name`];
                const effect = data[`t${i}_effect`];
                const sin = data[`t${i}_sin`];
                const attr = data[`t${i}_attr`];
                
                if (name || effect) {
                    let header = `戦術${i}:${name || '名称不明'}/【${type}】`;
                    header += ` 攻撃: ${attr || '—'}/ 罪: ${sin || '—'}`;
                    
                    text += `${header}\n`;
                    text += `効果:${effect || '—'}\n`;
                }
            }
        }
        
        text += '\n';

        // 固有項目
        if (data.hasUnique && data.uniqueCount > 0) {
            text += `【固有項目】\n`;
            const count = Math.min(parseInt(data.uniqueCount) || 0, MAX_UNIQUE_SKILLS);
            for (let i = 0; i < count; i++) {
                const name = data[`uniqueName_${i}`] || '—';
                const max = data[`uniqueMax_${i}`] || '—';
                const type = data[`uniqueType_${i}`] || '—';
                const effect = data[`uniqueEffect_${i}`] || '—';

                text += `固有#${i+1} 名称: ${name}\n`;
                text += `  最大数: ${max}/ 種別: ${type}\n`;
                text += `  効果:${effect}\n`;
            }
            text += '\n';
        }

        text += `【アイテム / 所持品】\n${data.items || '—'}\n\n`;

        // 装備 E.G.O 
        text += `【装備 E.G.O】\n`;
        const egoRanks = ['zayin', 'teth', 'he', 'waw', 'aleph'];
        
        egoRanks.forEach(rank => {
            const name = data[`ego_${rank}`] || '—';
            text += `${rank.toUpperCase()}: ${name}\n`;

            if (name !== '—' && name.trim() !== '') {
                const condition = data[`ego_${rank}_condition`] || '—';
                const effect = data[`ego_${rank}_effect`] || '—';
                const awake = data[`ego_${rank}_awake`] || '—';
                const corrode = data[`ego_${rank}_corrode`] || '—';
                
                text += `  発動条件: ${condition}\n`;
                text += `  効果:${effect}\n`;
                text += `  覚醒スキル効果:${awake}\n`;
                text += `  侵蝕スキル効果:${corrode}\n`;
            }
        });
        text += '\n'; 


        text += `【所持通貨】\n`;
        text += `LP: ${data.cur_lp || '0'}\n`;
        text += `自我の欠片: ${data.cur_frag || '0'}\n\n`;

        text += `【所持人格】\n${data.owned_personas || '—'}\n\n`;
        text += `【身体強化】\n${data.body_enhance || '—'}\n\n`;
        text += `【所持 E.G.O】\n${data.owned_ego || '—'}\n\n`;
        text += `【所持サポートパッシブ】\n${data.owned_support_passives || '—'}\n\n`;
        text += `【所持精神】\n${data.owned_spirits || '—'}\n\n`;

        text += `【自由記入欄 1】\n${data.free_note_1 || '—'}\n\n`;
        text += `【自由記入欄 2】\n${data.free_note_2 || '—'}\n`;
        text += `=================================================================\n`;

        return text;
    }

    // テキストファイルをダウンロードする関数
    function downloadText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    // ▼ 表示/非表示の切り替え
    const sup3EnableCheckbox = document.getElementById('sup3_enable');
    const sup3Wrapper = document.getElementById('sup3_wrapper');
    if (sup3EnableCheckbox) {
        sup3EnableCheckbox.addEventListener('change', (e) => {
            if (sup3Wrapper) sup3Wrapper.style.display = e.target.checked ? 'block' : 'none';
            autoSaveAndPreview();
        });
    }

    const deathPassiveCheckbox = document.getElementById('deathpassive_enable');
    const deathPassiveWrapper = document.getElementById('deathpassive_wrapper');
    if (deathPassiveCheckbox) {
        deathPassiveCheckbox.addEventListener('change', (e) => {
            if (deathPassiveWrapper) deathPassiveWrapper.style.display = e.target.checked ? 'block' : 'none';
            autoSaveAndPreview();
        });
    }

    // E.G.O.詳細表示の切り替えイベントリスナー
    ['zayin','teth','he','waw','aleph'].forEach(id => {
        const input = document.getElementById('ego_' + id);
        const extra = document.getElementById('ego_' + id + '_extra');
        if (input && extra) {
            input.addEventListener('input', () => {
                extra.style.display = input.value.trim() !== '' ? 'grid' : 'none';
                autoSaveAndPreview(); // EGO入力時にプレビュー更新
            });
        }
    });

    // ▼ スロット保存/読み込み機能
    function getSlotKey(slot) {
        return `${localStorageKey}_slot${slot}`;
    }

    // スロットのラベル（PC名）を更新
    function updateSlotLabels() {
        for (let i = 1; i <= 4; i++) {
            const slotKey = getSlotKey(i);
            const slotData = localStorage.getItem(slotKey);
            const label = document.getElementById(`slot${i}_label`);

            if (label) { 
                if (slotData) {
                    try {
                        const data = JSON.parse(slotData);
                        const pcName = data.pcName || `無名のPC`;
                        label.textContent = `スロット ${i}: ${pcName}`;
                    } catch (e) {
                        label.textContent = `スロット ${i}: (破損データ)`;
                    }
                } else {
                    label.textContent = `スロット ${i}: (空)`;
                }
            }
        }
    }

    // スロット保存
    document.querySelectorAll('.slot-save').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            const data = getFormData();
            const slotKey = getSlotKey(slot);
            localStorage.setItem(slotKey, JSON.stringify(data));
            alert(`スロット ${slot} に現在のシート内容を保存しました。`);
            updateSlotLabels();
        });
    });

    // スロット読み込み
    document.querySelectorAll('.slot-load').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            const slotKey = getSlotKey(slot);
            const slotData = localStorage.getItem(slotKey);

            if (slotData) {
                try {
                    const data = JSON.parse(slotData);
                    setFormData(data);
                    autoSaveAndPreview(); 
                    alert(`スロット ${slot} の内容を読み込みました。`);
                } catch (error) {
                    alert(`スロット ${slot} のデータは破損しています。`);
                }
            } else {
                alert(`スロット ${slot} は空です。`);
            }
        });
    });

    // スロット削除
    document.querySelectorAll('.slot-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.dataset.slot;
            if (confirm(`スロット ${slot} のデータを完全に削除しますか？`)) {
                const slotKey = getSlotKey(slot);
                localStorage.removeItem(slotKey);
                alert(`スロット ${slot} のデータを削除しました。`);
                updateSlotLabels();
            }
        });
    });

    // --- 👇 固有スキル 動的フォーム生成ロジック 👇 ---
    
    const hasUniqueCheckbox = document.getElementById('hasUnique');
    const countContainer = document.getElementById('uniqueCountContainer'); 
    const uniqueCountInput = document.getElementById('uniqueCount');
    const uniqueFormsContainer = document.getElementById('uniqueFormsContainer'); // 名前を変更

    
    // 固有スキルのフォームテンプレートを作成する関数
    function createUniqueForm(index) {
        const formTitle = `固有スキル #${index + 1}`; 
        
        const formHtml = `
            <div class="unique-skill-form" style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
                <h4 style="margin-top: 0;">${formTitle}</h4>
                
                <label>名称</label>
                <input id="uniqueName_${index}" type="text" placeholder="名称">

                <label style="margin-top:6px">最大数</label> 
                <input id="uniqueMax_${index}" type="number" placeholder="最大数">

                <label style="margin-top:6px">種別</label> 
                <select id="uniqueType_${index}">
                    <option value="バフ">バフ</option>
                    <option value="デバフ">デバフ</option>
                    <option value="中立バフ">中立バフ</option>
                </select>

                <label style="margin-top:6px">効果</label>
                <textarea id="uniqueEffect_${index}" placeholder="効果"></textarea>
            </div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formHtml.trim();
        const formElement = tempDiv.firstChild;

        // 【リアルタイム適応ロジック】: 動的に生成された要素に入力イベントを設定
        formElement.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.type === 'checkbox') {
                element.addEventListener('change', autoSaveAndPreview);
            } else {
                element.addEventListener('input', autoSaveAndPreview); // ★リアルタイムプレビューを確実にする★
            }
        });

        return formElement;
    }

    // 固有スキルフォームの数を更新するメインの関数
    function updateUniqueForms() {
        if (!uniqueFormsContainer) return; // コンテナがない場合は何もしない
        
        if (!countContainer || countContainer.style.display === 'none') {
            uniqueFormsContainer.innerHTML = '';
            return;
        }
        
        let count = parseInt(uniqueCountInput?.value) || 0;

        // 0〜10の範囲に制限
        count = Math.max(0, count);
        count = Math.min(count, MAX_UNIQUE_SKILLS);

        if (uniqueCountInput && parseInt(uniqueCountInput.value) !== count) {
            uniqueCountInput.value = count;
        }

        const currentForms = uniqueFormsContainer.children.length;
        
        if (count > currentForms) {
            for (let i = currentForms; i < count; i++) {
                uniqueFormsContainer.appendChild(createUniqueForm(i));
            }
        } else if (count < currentForms) {
            for (let i = currentForms - 1; i >= count; i--) {
                uniqueFormsContainer.removeChild(uniqueFormsContainer.children[i]);
            }
        }
        
        // フォーム構造の変更後、必ずプレビューも更新 
        autoSaveAndPreview(); // 【★動的フォームの数変更時にプレビューを更新★】
    }

    // 1. チェックボックスの変更イベント（固有数入力欄の表示/非表示を制御）
    if (hasUniqueCheckbox) {
        hasUniqueCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (countContainer) countContainer.style.display = 'block'; 
                updateUniqueForms(); 
            } else {
                if (countContainer) countContainer.style.display = 'none';
                if (uniqueFormsContainer) uniqueFormsContainer.innerHTML = '';
                if (uniqueCountInput) uniqueCountInput.value = '1'; 
                autoSaveAndPreview(); // 非表示時にもプレビューを更新（固有項目を消すため）
            }
        });
    }

    // 2. 固有数入力欄の変更イベント（固有スキルフォームの数を制御）
    if (uniqueCountInput) {
        uniqueCountInput.addEventListener('input', updateUniqueForms);
    }
    
    // --- 👆 固有スキル 動的フォーム生成ロジック 終了 👆 ---


    // --- 👇 追加戦術 動的フォーム生成ロジック 👇 ---

    if (extraTacticsEnable && extraTacticsCountContainer && extraTacticsCount) {
        // 1. 制御ロジック (チェックボックス)
        extraTacticsEnable.addEventListener('change', function() {
            extraTacticsCountContainer.style.display = this.checked ? 'block' : 'none';
            
            // チェックを外したらカウントとフォームをリセット
            if (!this.checked) {
                extraTacticsCount.value = 0;
                renderExtraTacticsForms();
            }
            autoSaveAndPreview(); // 表示/非表示時にプレビューを更新
        });

        // 2. 所持数入力欄の制御
        extraTacticsCount.addEventListener('input', function() {
            // 最大値6、最小値0のバリデーション
            let value = parseInt(this.value);
            if (isNaN(value) || value < 0) value = 0;
            if (value > 6) value = 6;
            this.value = value;

            renderExtraTacticsForms(); // フォームを再描画・再登録
            autoSaveAndPreview(); // カウント変更時にプレビューも更新
        });
    }

    // --- 👆 追加戦術 動的フォーム生成ロジック 終了 👆 ---


    // 初期化処理
    function initialize() {
        const savedData = localStorage.getItem(localStorageKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                setFormData(data);
                updatePreview(data);
            } catch (e) {
                console.error("保存されたデータの読み込みに失敗しました:", e);
                localStorage.removeItem(localStorageKey);
                // データ破損時はデフォルトでプレビューを初期化
                updatePreview(getFormData());
            }
        } else {
            // 保存データがない場合も初期のフォーム内容でプレビューを一度更新
            updatePreview(getFormData());
        }
        updateSlotLabels();
    }

    initialize();
});
// 以前のコード末尾にあった余分な '}' を削除し、コード全体が 'DOMContentLoaded' 内に収まるように修正しました。
