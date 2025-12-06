/**
 * Limbus TRPG キャラクターシートメーカー
 * JavaScript ファイル
 */

document.addEventListener('DOMContentLoaded', () => {
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


    const localStorageKey = 'limbusTRPGSheetData';
    const MAX_UNIQUE_SKILLS = 10; 


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
        
        'ego_zayin', 'ego_zayin_condition', 'ego_zayin_effect', 'ego_zayin_awake', 'ego_zayin_corrode',
        'ego_teth', 'ego_teth_condition', 'ego_teth_effect', 'ego_teth_awake', 'ego_teth_corrode',
        'ego_he', 'ego_he_condition', 'ego_he_effect', 'ego_he_awake', 'ego_he_corrode',
        'ego_waw', 'ego_waw_condition', 'ego_waw_effect', 'ego_waw_awake', 'ego_waw_corrode',
        'ego_aleph', 'ego_aleph_condition', 'ego_aleph_effect', 'ego_aleph_awake', 'ego_aleph_corrode',

        'items', 
        'cur_lp', 'cur_frag',
        'owned_personas', 'body_enhance', 'owned_ego', 'owned_support_passives', 'owned_spirits',
        'free_note_1', 'free_note_2'
    ];

    const controlIds = ['hasUnique', 'uniqueCount', 'sup3_enable', 'deathpassive_enable', 'extraTactics_enable', 
    'extraTacticsCount'];

    const allStaticIds = [...inputIds, ...controlIds];


    function generateExtraTacticForm(index) {

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


    function renderExtraTacticsForms() {
        const countInput = document.getElementById('extraTacticsCount');
        const container = document.getElementById('dynamicTacticsFormsContainer');
        const count = parseInt(countInput?.value) || 0; 

        if (!container) return;


        container.innerHTML = '';
    

        const maxCount = Math.min(count, 6);
    
        let allFormsHtml = '';
        for (let i = 5; i < 5 + maxCount; i++) {
            allFormsHtml += generateExtraTacticForm(i);
        }

        container.innerHTML = allFormsHtml;
      

        const form = document.getElementById('sheetForm');
        if (form) {
            form.querySelectorAll('.tactic-block input, .tactic-block select, .tactic-block textarea').forEach(element => {
                element.addEventListener('input', autoSaveAndPreview);
            });
        }
    }


    function getDynamicUniqueInputIds(data) {
        const count = parseInt(data.uniqueCount) || 0;
        const dynamicIds = [];
        for (let i = 0; i < count; i++) {
            dynamicIds.push(`uniqueName_${i}`, `uniqueMax_${i}`, `uniqueType_${i}`, `uniqueEffect_${i}`);
        }
        return dynamicIds;
    }
    

    function getDynamicExtraTacticsIds(data) {
        const count = parseInt(data.extraTacticsCount) || 0;
        const dynamicIds = [];
        const maxCount = Math.min(count, 6);
        for (let i = 5; i < 5 + maxCount; i++) {
            dynamicIds.push(`t${i}_type`, `t${i}_name`, `t${i}_attr`, `t${i}_sin`, `t${i}_effect`);
        }
        return dynamicIds;
    }



    function getFormData() {
        const data = {};
        

        const uniqueCount = parseInt(document.getElementById('uniqueCount')?.value) || 0;
        const extraTacticsCount = parseInt(document.getElementById('extraTacticsCount')?.value) || 0;
        

        const dynamicUniqueIds = getDynamicUniqueInputIds({ uniqueCount: uniqueCount });
        const dynamicExtraTacticsIds = getDynamicExtraTacticsIds({ extraTacticsCount: extraTacticsCount });
        

        const allIds = [...allStaticIds, ...dynamicUniqueIds, ...dynamicExtraTacticsIds];

        allIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    data[id] = element.checked;
                } else if (element.type === 'number') {
                    data[id] = element.value !== '' ? parseInt(element.value) : ''; 
                } else {
                    data[id] = element.value;
                }
            }
        });
        return data;
    }


    function setFormData(data) {
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

        document.getElementById('hasUnique')?.dispatchEvent(new Event('change'));
        
        if (document.getElementById('extraTactics_enable')?.checked) {
            document.getElementById('extraTacticsCountContainer').style.display = 'block';
        } else {
            document.getElementById('extraTacticsCountContainer').style.display = 'none';
        }
        renderExtraTacticsForms();

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

        document.getElementById('sup3_enable')?.dispatchEvent(new Event('change'));
        document.getElementById('deathpassive_enable')?.dispatchEvent(new Event('change'));
        
        ['zayin','teth','he','waw','aleph'].forEach(id => {
            const input = document.getElementById('ego_' + id);
            const extra = document.getElementById('ego_' + id + '_extra');
            if (input && extra) {
                extra.style.display = input.value.trim() !== '' ? 'grid' : 'none'; 
            }
        });
    }

    function updatePreview(data) {
        document.getElementById('pPcName').textContent = data.pcName || '—';
        document.getElementById('pPlName').textContent = data.plName ? `PL: ${data.plName}` : '—';

        document.getElementById('pPersona').textContent = data.persona || '—';
        document.getElementById('pHp').textContent = data.hp || '—';
        document.getElementById('pSan').textContent = data.san || '—';
        document.getElementById('pSpeed').textContent = data.speed || '—';
        document.getElementById('pSlash').textContent = data.slash || '—';
        document.getElementById('pPierce').textContent = data.pierce || '—';
        document.getElementById('pBlunt').textContent = data.blunt || '—';
        document.getElementById('pMind').textContent = data.mind || '—';
        document.getElementById('pMindEffect').textContent = data.mind_effect || '—';

        let passiveText = `【${data.passive_name || '名称不明'}】\n`;
        passiveText += `発動条件: ${data.passive_condition || '—'}\n`;
        passiveText += `効果: ${data.passive_effect || '—'}`;
        document.getElementById('pPassives').textContent = passiveText;

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


        let deathText = '—';
        if (data.deathpassive_enable) { 
            deathText = `【${data.deathp_name || '名称不明'}】\n`;
            deathText += `発動条件: ${data.deathp_condition || '—'}\n`;
            deathText += `効果: ${data.deathp_effect || '—'}`;
        }
        document.getElementById('preview_deathpassive').textContent = deathText;

        let tacticsText = '';

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


        document.getElementById('pItems').textContent = data.items || '—';

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
                 egoText += '\n';
            }
        });
        document.getElementById('pEgo').textContent = egoText.trim() || '—';

        let currencyText = `LP: ${data.cur_lp || '0'}\n`;
        currencyText += `自我の欠片: ${data.cur_frag || '0'}`;
        document.getElementById('pCurrency').textContent = currencyText;

        document.getElementById('pPersonas').textContent = data.owned_personas || '—';
        document.getElementById('pBodyEnhance').textContent = data.body_enhance || '—';
        document.getElementById('pOwnedEgo').textContent = data.owned_ego || '—';
        document.getElementById('pOwnedSupportPassives').textContent = data.owned_support_passives || '—';
        document.getElementById('pOwnedSpirits').textContent = data.owned_spirits || '—';
        document.getElementById('pFreeNote1').textContent = data.free_note_1 || '—';
        document.getElementById('pFreeNote2').textContent = data.free_note_2 || '—';
    }

    function autoSaveAndPreview() {
        const data = getFormData();
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        updatePreview(data);
    }

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
    controlIds.filter(id => id !== 'uniqueCount' && id !== 'extraTacticsCount').forEach(id => {
        const element = document.getElementById(id);
        if (element && element.type === 'checkbox') {
            element.addEventListener('change', autoSaveAndPreview);
        }
    });

    pageTopBtn?.addEventListener('click', () => { 
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    function clearForm() {
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
                    element.value = element.querySelector('option[value=""]')?.value ?? element.options[0].value;
                } else {
                    element.value = '';
                }
            }
        });
        
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

        const extraTacticsCount = document.getElementById('extraTacticsCount');
        if(extraTacticsCount) extraTacticsCount.value = '0';
        renderExtraTacticsForms();

        localStorage.removeItem(localStorageKey);
        updatePreview(getFormData());
        updateSlotLabels();

        alert('フォームがクリアされました。');
    }


    saveBtn?.addEventListener('click', () => {
        autoSaveAndPreview();
        alert('キャラクターシートの内容をブラウザに保存しました。次回アクセス時に自動で復元されます。');
    });


    clearBtn?.addEventListener('click', clearForm);

    downloadBtn?.addEventListener('click', () => {
        const data = getFormData();
        const textContent = formatDataAsText(data);
        const pcName = data.pcName || 'LimbusTRPG_Sheet';
        downloadText(textContent, `${pcName}.txt`);
    });

    printBtn?.addEventListener('click', () => {
        window.print();
    });

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

        if (data.hasUnique && data.uniqueCount > 0) {
            text += `【固有】\n`;
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

    function getSlotKey(slot) {
        return `${localStorageKey}_slot${slot}`;
    }

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

    
    const hasUniqueCheckbox = document.getElementById('hasUnique');
    const countContainer = document.getElementById('uniqueCountContainer'); 
    const uniqueCountInput = document.getElementById('uniqueCount');
    const uniqueFormsContainer = document.getElementById('uniqueFormsContainer');

    
    function createUniqueForm(index) {
        const formTitle = `固有 #${index + 1}`; 
        
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

        formElement.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.type === 'checkbox') {
                element.addEventListener('change', autoSaveAndPreview);
            } else {
                element.addEventListener('input', autoSaveAndPreview); 
            }
        });

        return formElement;
    }


    function updateUniqueForms() {
        if (!uniqueFormsContainer) return;
        
        if (!countContainer || countContainer.style.display === 'none') {
            uniqueFormsContainer.innerHTML = '';
            return;
        }
        
        let count = parseInt(uniqueCountInput?.value) || 0;


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
        
 
        autoSaveAndPreview();
    }


    if (hasUniqueCheckbox) {
        hasUniqueCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (countContainer) countContainer.style.display = 'block'; 
                updateUniqueForms(); 
            } else {
                if (countContainer) countContainer.style.display = 'none';
                if (uniqueFormsContainer) uniqueFormsContainer.innerHTML = '';
                if (uniqueCountInput) uniqueCountInput.value = '1'; 
                autoSaveAndPreview();
            }
        });
    }


    if (uniqueCountInput) {
        uniqueCountInput.addEventListener('input', updateUniqueForms);
    }
    


    if (extraTacticsEnable && extraTacticsCountContainer && extraTacticsCount) {

        extraTacticsEnable.addEventListener('change', function() {
            extraTacticsCountContainer.style.display = this.checked ? 'block' : 'none';
            
     
            if (!this.checked) {
                extraTacticsCount.value = 0;
                renderExtraTacticsForms();
            }
            autoSaveAndPreview(); 
        });

    
        extraTacticsCount.addEventListener('input', function() {
     
            let value = parseInt(this.value);
            if (isNaN(value) || value < 0) value = 0;
            if (value > 6) value = 6;
            this.value = value;

            renderExtraTacticsForms(); 
            autoSaveAndPreview(); 
        });
    }




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
                updatePreview(getFormData());
            }
        } else {
            updatePreview(getFormData());
        }
        updateSlotLabels();
    }

    initialize();
});



