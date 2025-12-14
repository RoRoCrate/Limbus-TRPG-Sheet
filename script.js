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
    const dynamicTacticsFormsContainer = document.getElementById('dynamicTacticsFormsContainer');

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


    const searchButton = document.getElementById('searchButton');
    const searchModal = document.getElementById('searchModal');
    const closeBtn = searchModal ? searchModal.querySelector('.close-btn') : null;
    const searchInput = document.getElementById('searchInput');
    const csvSelector = document.getElementById('csvSelector');
    const searchResults = document.getElementById('searchResults');
    const searchInputsContainer = document.getElementById('searchInputsContainer'); 
    
    let currentSearchData = []; 
    const dataCache = {}; 
    

    const CSV_FILE_MAP = {
        'identity': { 
            name: '人格(未実装)', 
            url: './identity.tsv' 
        },
        'singularidentity': { 
            name: '特異人格(未実装)', 
            url: './singularidentity.tsv' 
        },
        'suppassive': { 
            name: 'サポートパッシブ', 
            url: './suppassive.tsv' 
        },
        'mental': { 
            name: '精神', 
            url: './mental.tsv'
        },
        'ego': { 
            name: 'E.G.O', 
            url: './ego.tsv' 
        },
        'status': { 
            name: '状態異常', 
            url: './status.tsv'
        },
        'item': { 
            name: 'アイテム', 
            url: './item.tsv'
        } 
    };

    const SEARCH_FIELDS = {
        'identity': [
            { id: 'search_id_no', label: '番号', type: 'text', csvKey: '番号', placeholder: '半角数字を入力...' },
            { id: 'search_id_name', label: '名称', type: 'text', csvKey: '名称', placeholder: '人格名...' }
        ],
        'singularidentity': [
            { id: 'search_si_no', label: '番号', type: 'text', csvKey: '番号', placeholder: '半角数字を入力...' },
            { id: 'search_si_name', label: '名称', type: 'text', csvKey: '名称', placeholder: '特異人格名...' }
        ],
        'suppassive': [
            { id: 'search_sp_type', label: '通常/死亡', type: 'select', options: ['', '通常', '死亡'], csvKey: '種別' },
            { id: 'search_sp_resource', label: '資源', type: 'select', options: ['', '憤怒', '色欲','怠惰','暴食','憂鬱','傲慢','嫉妬','なし'], csvKey:'資源' },
            { id: 'search_sp_ownership', label: '保有/共鳴', type: 'select', options: ['', '保有', '共鳴','なし'], csvKey: '保有・共鳴' },
            { id: 'search_sp_price', label: '価格範囲', type: 'text', csvKey: '価格', placeholder: '通常：LP 死亡：欠片' }
        ],
        'mental': [
            { id: 'search_mental_name', label: '名称', type: 'text', csvKey: '名称', placeholder: '萎縮...' },
            { id: 'search_mental_price', label: '価格範囲', type: 'text', csvKey: '価格', placeholder: '欠片' }
        ],
        'item': [
            { id: 'search_item_name', label: '名称', type: 'text', csvKey: '名称', placeholder: 'アイテム名...' },
            { id: 'search_item_effect', label: '分類', type: 'select', options: ['', '特殊', '回復','強化'], csvKey: '分類' },
            { id: 'search_item_price', label: '価格範囲', type: 'text', csvKey: '価格', placeholder: 'LP' }
        ],
        'status': [
            { id: 'search_status_name', label: '名称', type: 'text', csvKey: '名称', placeholder: '振動...' },
            { id: 'search_status_type', label: '分類', type: 'select', options: ['', 'バフ', 'デバフ', '中立バフ', '蓄積要素', '弾丸', '特殊'], csvKey: '分類' }
        ],
        'ego': [
            { id: 'search_ego_no', label: '番号', type: 'text', csvKey: '番号', placeholder: '半角数字を入力' },
            { id: 'search_ego_name', label: '名称', type: 'text', csvKey: '名称', placeholder: '名称を入力' },
            { id: 'search_ego_danger', label: '危険度', type: 'select', options: ['', 'ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'], csvKey: '危険度' }
        ]
    };

    function csvToArrayOfObjects(tsvText) {

        const lines = tsvText.trim().split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return [];
        
        const delimiter = '\t';
        
        const fieldSplitRegex = new RegExp(`${delimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`);

        const headers = lines[0].split(fieldSplitRegex).map(header => {
            let cleanHeader = header.trim();
            if (cleanHeader.startsWith('"') && cleanHeader.endsWith('"')) {
                cleanHeader = cleanHeader.slice(1, -1).replace(/""/g, '"');
            }
            return cleanHeader;
        });

        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const rawValues = lines[i].split(fieldSplitRegex);
            
            const values = rawValues.map(value => {
                let cleanValue = value.trim();
                if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                    cleanValue = cleanValue.slice(1, -1).replace(/""/g, '"');
                }
                
                return cleanValue
                    .replace(/\<BR\>/g, '\n')
                    .replace(/\\n/g, '\n')
                    .replace(/全角改行文字/g, '\n');
            });
            
            const item = {};
            for (let j = 0; j < headers.length && j < values.length; j++) {
                item[headers[j]] = values[j];
            }
            data.push(item);
        }
        return data;
    }

    async function loadCsvData(key) {
        if (dataCache[key]) {
            console.log(`データ '${key}' はキャッシュからロードされました。`);
            return dataCache[key];
        }

        const file = CSV_FILE_MAP[key];
        if (!file) {
            console.error(`キー '${key}' に対応するファイルが見つかりません。`);
            return [];
        }

        try {
            const dataPath = file.url;
            
            if (!dataPath) {
                console.warn(`キー '${key}' に対応する有効なパスが見つかりません。`);
                return [];
            }
            
            const isExternalUrl = dataPath.startsWith('http://') || dataPath.startsWith('https://');
            const fetchPath = isExternalUrl ? 
                `${dataPath}?t=${new Date().getTime()}` : 
                dataPath; 

            const response = await fetch(fetchPath);
            if (!response.ok) {
                console.warn(`${file.name} のロードに失敗しました (Path: ${fetchPath}, Status: ${response.status})。空のデータを使用します。`);
                return [];
            }
            
            const csvText = await response.text();
            const parsedData = csvToArrayOfObjects(csvText);
            
            dataCache[key] = parsedData;
            console.log(`${file.name} をロードし、キャッシュしました。`);
            return parsedData;

        } catch (error) {
            console.error(`データロード中にエラーが発生しました: ${file.name} (Path: ${file.url})`, error); 
            return [];
        }
    }
    
    function renderSearchInputs(selectedKey) {
        if (!searchInputsContainer) return;

        searchInputsContainer.innerHTML = '';
        const fields = SEARCH_FIELDS[selectedKey];
        if (!fields) return;

        let html = '';
        fields.forEach(field => {
            html += `<div class="search-input-group">`;
            html += `<label for="${field.id}">${field.label}</label>`;
            if (field.type === 'select') {
                html += `<select id="${field.id}" data-csv-key="${field.csvKey}">`;
                field.options.forEach(option => {
                    html += `<option value="${option}">${option === '' ? 'すべて' : option}</option>`;
                });
                html += `</select>`;
            } else {
                html += `<input id="${field.id}" type="${field.type}" placeholder="${field.placeholder || field.label + '...'}" data-csv-key="${field.csvKey}">`;
            }
            html += `</div>`;
        });
        
        searchInputsContainer.innerHTML = html;
        
        searchInputsContainer.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('input', () => performSearch(searchInput.value));
            element.addEventListener('change', () => performSearch(searchInput.value));
        });
    }

    function renderResults(filteredResults, selectedKey) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        if (filteredResults.length === 0) {
            resultsContainer.innerHTML = `<p style="color:var(--muted)">一致する結果は見つかりませんでした。</p>`;
            return;
        }

        let resultsHtml = '';
        
        filteredResults.forEach(item => {
            let itemDetailsHtml = '';
            
            for (const header in item) {
                const content = item[header] ? item[header].trim() : '';
                
                if (content !== '') {
                    itemDetailsHtml += `<p style="margin: 2px 0; font-size: 14px;"><strong>${header}</strong>: ${content}</p>`;
                }
            }
            
            if (itemDetailsHtml === '') {
                 const hasKeys = Object.keys(item).length > 0;
                 itemDetailsHtml = `<p style="margin: 2px 0; font-size: 14px;"><strong>データ</strong>: ${hasKeys ? 'すべての列が空です' : '—'}</p>`;
            }


            resultsHtml += `
                <div class="search-result-item">
                    ${itemDetailsHtml}
                </div>
            `;
        });

        resultsContainer.innerHTML = resultsHtml;
    }


    function performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer || !searchInputsContainer) return;

        resultsContainer.innerHTML = ''; 
        const lowerCaseQuery = query.toLowerCase();
        const selectedKey = csvSelector.value;
        const fields = SEARCH_FIELDS[selectedKey] || [];

        const dynamicFilters = {};
        let isAnyDynamicFilterSet = false;
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                const value = element.value.trim();
                if (value !== '' && value !== 'すべて') {
                    dynamicFilters[field.csvKey] = {
                        value: value.toLowerCase(),
                        isSelect: field.type === 'select'
                    };
                    isAnyDynamicFilterSet = true;
                }
            }
        });

        if (query.trim() === '' && !isAnyDynamicFilterSet) {
             resultsContainer.innerHTML = '<p style="color:var(--muted)">キーワードまたはフィルタを入力して検索してください。</p>';
             return;
        }

        const filteredResults = currentSearchData.filter(item => {
            const keys = Object.keys(item);
            let keywordMatch = true;
            let dynamicFilterMatch = true;

            if (query.trim() !== '') {
                keywordMatch = keys.some(key => {
                    const value = item[key];
                    return value && String(value).toLocaleLowerCase().includes(lowerCaseQuery);
                });
            }

            for (const csvKey in dynamicFilters) {
                const filter = dynamicFilters[csvKey];
                const itemValue = String(item[csvKey] || '').toLowerCase();
                
                const isResourceFilter = (
                    selectedKey === 'suppassive' && 
                    csvKey === '資源' 
                );

                if (isResourceFilter) {
                    if (filter.value === 'なし') {
                        if (itemValue !== 'なし') {
                            dynamicFilterMatch = false;
                            break;
                        }
                    } else {
                        if (!itemValue.includes(filter.value)) {
                            dynamicFilterMatch = false;
                            break;
                        }
                    }
                } else if (filter.isSelect) {

                    if (itemValue !== filter.value) {
                        dynamicFilterMatch = false;
                        break; 
                    }
                } else {
                    if (!itemValue.includes(filter.value)) {
                        dynamicFilterMatch = false;
                        break;
                    }
                }
            }

            return keywordMatch && dynamicFilterMatch;
        });

        renderResults(filteredResults, selectedKey);
    }


    async function initializeCsvSelector() {
        for (const key in CSV_FILE_MAP) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = CSV_FILE_MAP[key].name;
            csvSelector.appendChild(option);
        }


        const initialKey = csvSelector.value;
        currentSearchData = await loadCsvData(initialKey);
        renderSearchInputs(initialKey); 
        
        csvSelector.addEventListener('change', async (e) => {
            searchInput.value = ''; 
            searchResults.innerHTML = '<p style="color:var(--muted)">対象のデータセットがロードされました。キーワードを入力してください。</p>';
            
            const selectedKey = e.target.value;
            currentSearchData = await loadCsvData(selectedKey);
            renderSearchInputs(selectedKey);
            performSearch(''); 
        });
    }

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

        const hasUniqueCheckbox = document.getElementById('hasUnique');
        const extraTacticsEnableCheckbox = document.getElementById('extraTactics_enable');
        
        if (hasUniqueCheckbox) {
            hasUniqueCheckbox.checked = !!data.hasUnique;
            if (document.getElementById('uniqueCountContainer')) {
                document.getElementById('uniqueCountContainer').style.display = data.hasUnique ? 'block' : 'none';
            }
        }
        if (extraTacticsEnableCheckbox) {
            extraTacticsEnableCheckbox.checked = !!data.extraTactics_enable;
            if (extraTacticsCountContainer) {
                extraTacticsCountContainer.style.display = data.extraTactics_enable ? 'block' : 'none';
            }
        }

        updateUniqueForms();
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
        const getElementAndSetText = (id, text) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        };

        const getElementAndSetTextWithBR = (id, text) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        };

        getElementAndSetText('pPcName', data.pcName || '—');
        getElementAndSetText('pPlName', data.plName ? `PL: ${data.plName}` : '—');
        getElementAndSetText('pPersona', data.persona || '—');
        getElementAndSetText('pHp', data.hp || '—');
        getElementAndSetText('pSan', data.san || '—');
        getElementAndSetText('pSpeed', data.speed || '—');
        getElementAndSetText('pSlash', data.slash || '—');
        getElementAndSetText('pPierce', data.pierce || '—');
        getElementAndSetText('pBlunt', data.blunt || '—');
        getElementAndSetText('pMind', data.mind || '—');
        getElementAndSetText('pMindEffect', data.mind_effect || '—');

        let passiveText = `【${data.passive_name || '名称不明'}】\n`;
        passiveText += `発動条件: ${data.passive_condition || '—'}\n`;
        passiveText += `効果: ${data.passive_effect || '—'}`;
        getElementAndSetTextWithBR('pPassives', passiveText);


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
        getElementAndSetTextWithBR('pSupport', supportText.trim() || '—');

        let deathText = '—';
        if (data.deathpassive_enable) {
            deathText = `【${data.deathp_name || '名称不明'}】\n`;
            deathText += `発動条件: ${data.deathp_condition || '—'}\n`;
            deathText += `効果: ${data.deathp_effect || '—'}`;
        }
        getElementAndSetTextWithBR('pDeathPassive', deathText);

        let tacticsText = '';
        for (let i = 0; i <= 4; i++) {
            const name = data[`t${i}_name`];
            const effect = data[`t${i}_effect`];
            const sin = data[`t${i}_sin`];
            const attr = data[`t${i}_attr`];
            
            if (name || effect) {
                let line = `【戦術${i}】 ${name || '名称不明'}\n`;
                if (i === 0) {
                    const guard = data.t0_guard;
                    const matchStatus = data.t0_match || '可能';
                    line += `守備: ${guard || '—'} / 攻撃: ${attr || '—'} / 罪: ${sin || '—'} / マッチ処理: ${matchStatus}\n`;
                } else {
                    line += `攻撃: ${attr || '—'} / 罪: ${sin || '—'}\n`;
                }
                line += `効果: ${effect || '—'}\n\n`;
                tacticsText += line;
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
                    let line = `【戦術${i}：${type}】 ${name || '名称不明'}\n`;
                    line += `攻撃: ${attr || '—'} / 罪: ${sin || '—'}\n`;
                    line += `効果: ${effect || '—'}\n\n`;
                    tacticsText += line;
                }
            }
        }

        getElementAndSetTextWithBR('pTactics', tacticsText.trim() || '—');

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
        getElementAndSetTextWithBR('pUniqueItems', uniquePreviewText.trim());

        getElementAndSetText('pItems', data.items || '—');

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
                egoText += ` 発動条件: ${condition}\n`;
                egoText += ` 効果:\n${effect}\n`;
                egoText += ` 覚醒スキル効果:\n${awake}\n`;
                egoText += ` 侵蝕スキル効果:\n${corrode}\n\n`;
            } else {
                egoText += '\n';
            }
        });
        getElementAndSetTextWithBR('pEgo', egoText.trim() || '—');
        
        let currencyText = `LP: ${data.cur_lp || '0'}\n`;
        currencyText += `自我の欠片: ${data.cur_frag || '0'}`;
        getElementAndSetText('pCurrency', currencyText);
        
        getElementAndSetText('pPersonas', data.owned_personas || '—');
        getElementAndSetText('pBodyEnhance', data.body_enhance || '—');
        getElementAndSetText('pOwnedEgo', data.owned_ego || '—');
        getElementAndSetText('pOwnedSupportPassives', data.owned_support_passives || '—');
        getElementAndSetText('pOwnedSpirits', data.owned_spirits || '—');
        getElementAndSetText('pFreeNote1', data.free_note_1 || '—');
        getElementAndSetText('pFreeNote2', data.free_note_2 || '—');
    }

    function autoSaveAndPreview() {
        const data = getFormData();
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        updatePreview(data);
    }
    
    function clearForm() {
        allStaticIds.filter(id => !controlIds.includes(id)).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
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
        if(uniqueCountElement) uniqueCountElement.value = '0';
        
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
            if (document.getElementById('uniqueCountContainer')) {
                document.getElementById('uniqueCountContainer').style.display = 'none';
            }
        }
        
        const extraTacticsEnable = document.getElementById('extraTactics_enable');
        if(extraTacticsEnable) {
            extraTacticsEnable.checked = false;
            if (extraTacticsCountContainer) {
                extraTacticsCountContainer.style.display = 'none';
            }
        }
        
        const extraTacticsCount = document.getElementById('extraTacticsCount');
        if(extraTacticsCount) extraTacticsCount.value = '0';
        
        renderExtraTacticsForms();
        updateUniqueForms(); 
        
        localStorage.removeItem(localStorageKey);
        updatePreview(getFormData());
        updateSlotLabels();
        alert('フォームがクリアされました。');
    }

    sheetForm?.addEventListener('input', autoSaveAndPreview);
    sheetForm?.addEventListener('change', autoSaveAndPreview);
    saveBtn?.addEventListener('click', () => {
        autoSaveAndPreview();
        alert('キャラクターシートの内容をブラウザに保存しました。次回アクセス時に自動で復元されます。');
    });
    clearBtn?.addEventListener('click', clearForm);

    function formatDataAsText(data) {
        let text = `=================================================================\n`;
        text += `【キャラクター情報】\n`;
        text += `PC名: ${data.pcName || '—'}\n`;
        text += `PL名: ${data.plName || '—'}\n`;
        text += `人格: ${data.persona || '—'}\n`;
        text += `\n`;
        text += `HP: ${data.hp || '—'}\n`;
        text += `SAN値: ${data.san || '—'}\n`;
        text += `速度: ${data.speed || '—'}\n`;
        text += `斬撃耐性: ${data.slash || '—'}\n`;
        text += `貫通耐性: ${data.pierce || '—'}\n`;
        text += `打撃耐性: ${data.blunt || '—'}\n`;
        text += `精神力: ${data.mind || '—'}\n`;
        text += `精神効果: ${data.mind_effect || '—'}\n\n`;

        text += `【パッシブ】\n`;
        text += `名称: ${data.passive_name || '名称不明'}\n`;
        text += `発動条件: ${data.passive_condition || '—'}\n`;
        text += `効果: ${data.passive_effect || '—'}\n\n`;

        text += `【サポートパッシブ】\n`;
        const supports = [
            { name: data.sup1_name, condition: data.sup1_condition, effect: data.sup1_effect, label: '1' },
            { name: data.sup2_name, condition: data.sup2_condition, effect: data.sup2_effect, label: '2' }
        ];

        if (data.sup3_enable) {
            supports.push({ name: data.sup3_name, condition: data.sup3_condition, effect: data.sup3_effect, label: '3' });
        }
        
        supports.forEach(sup => {
            if (sup.name || sup.condition || sup.effect) {
                text += `SP${sup.label} 名称: ${sup.name || '名称不明'}\n`;
                text += `発動条件: ${sup.condition || '—'}\n`;
                text += `効果: ${sup.effect || '—'}\n\n`;
            }
        });
        text += '\n';

        if (data.deathpassive_enable) {
            text += `【死亡時パッシブ】\n`;
            text += `名称: ${data.deathp_name || '名称不明'}\n`;
            text += `発動条件: ${data.deathp_condition || '—'}\n`;
            text += `効果:${data.deathp_effect || '—'}\n\n`;
        }

        text += `【戦術】\n`;
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
                    header += ` 守備: ${guard || '—'} / 攻撃: ${attr || '—'} / 罪: ${sin || '—'}/ マッチ処理: ${matchStatus}`;
                } else {
                    header += ` 攻撃: ${attr || '—'} / 罪: ${sin || '—'}`;
                }
                text += `${header}\n`;
                ttext += `効果:${effect || '—'}\n\n`;
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
                    header += ` 攻撃: ${attr || '—'} / 罪: ${sin || '—'}`;
                    text += `${header}\n`;
                    text += `効果:${effect || '—'}\n\n`;
                }
            }
        }
        text += '\n';


        if (data.hasUnique && data.uniqueCount > 0) {
            text += `【固有項目】\n`;
            const count = Math.min(parseInt(data.uniqueCount) || 0, MAX_UNIQUE_SKILLS);
            for (let i = 0; i < count; i++) {
                const name = data[`uniqueName_${i}`] || '名称不明';
                const max = data[`uniqueMax_${i}`] || '—';
                const type = data[`uniqueType_${i}`] || '—';
                const effect = data[`uniqueEffect_${i}`] || '—';
                
                text += `固有 #${i+1}: ${name || '名称不明'}\n`;
                text += `最大数: ${max}, 種別: ${type}\n`;
                text += `効果:\n${effect}\n\n`;
            }
        }

        text += `【E.G.O】\n`;
        const egoRanks = ['zayin', 'teth', 'he', 'waw', 'aleph'];
        egoRanks.forEach(rank => {
            const name = data[`ego_${rank}`] || '—';
            text += `${rank.toUpperCase()}: ${name}\n`;
            if (name !== '—' && name.trim() !== '') {
                const condition = data[`ego_${rank}_condition`] || '—';
                const effect = data[`ego_${rank}_effect`] || '—';
                const awake = data[`ego_${rank}_awake`] || '—';
                const corrode = data[`ego_${rank}_corrode`] || '—';
                text += ` 発動条件: ${condition}\n`;
                text += ` 効果:\n${effect}\n`;
                text += ` 覚醒スキル効果:\n${awake}\n`;
                text += ` 侵蝕スキル効果:\n${corrode}\n\n`;
            }
        });

        text += '\n';
        text += `【その他所持品・メモ】\n`;
        text += `アイテム: ${data.items || '—'}\n\n`;
        text += `【資源】\n`;
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
    
    downloadBtn?.addEventListener('click', () => {
        const data = getFormData();
        const textContent = formatDataAsText(data);
        const pcName = data.pcName || 'LimbusTRPG_Sheet';
        downloadText(textContent, `${pcName}.txt`);
    });

    printBtn?.addEventListener('click', () => {
        sheetForm.style.display = 'none';
        const buttonsToHide = [clearBtn, saveBtn, downloadBtn, printBtn, pageTopBtn, searchButton];
        buttonsToHide.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        window.print();
        
        sheetForm.style.display = 'grid';
        buttonsToHide.forEach(btn => {
            if (btn) btn.style.display = '';
        });
    });

    pageTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (pageTopBtn) {
            pageTopBtn.style.display = (window.scrollY > 200) ? 'block' : 'none';
        }
    });

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
                autoSaveAndPreview();
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
                        label.textContent = `S${i}: ${data.pcName || '無題'}`;
                    } catch {
                        label.textContent = `S${i}: (データ破損)`;
                    }
                } else {
                    label.textContent = `スロット ${i}:`;
                }
            }
        }
    }

    document.querySelectorAll('.slot-save').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.getAttribute('data-slot');
            const data = getFormData();
            const slotKey = getSlotKey(slot);
            localStorage.setItem(slotKey, JSON.stringify(data));
            updateSlotLabels();
            alert(`スロット ${slot} に現在のシートを保存しました。`);
        });
    });

    document.querySelectorAll('.slot-load').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.getAttribute('data-slot');
            const slotKey = getSlotKey(slot);
            const savedData = localStorage.getItem(slotKey);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    setFormData(data);
                    updatePreview(data);
                    alert(`スロット ${slot} のデータを読み込みました。`);
                } catch (error) {
                    console.error("スロットデータの読み込みに失敗しました:", error);
                    alert(`エラー: スロット ${slot} のデータ読み込みに失敗しました。データが破損している可能性があります。`);
                }
            } else {
                alert(`スロット ${slot} に保存されたデータはありません。`);
            }
        });
    });

    document.querySelectorAll('.slot-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.getAttribute('data-slot');
            if (confirm(`スロット ${slot} のデータを削除してもよろしいですか？`)) {
                const slotKey = getSlotKey(slot);
                localStorage.removeItem(slotKey);
                updateSlotLabels();
                alert(`スロット ${slot} のデータを削除しました。`);
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
        
        const count = parseInt(uniqueCountInput?.value) || 0;
        const currentForms = uniqueFormsContainer.querySelectorAll('.unique-skill-form');
        const countToRender = Math.min(count, MAX_UNIQUE_SKILLS);

        for (let i = currentForms.length - 1; i >= 0; i--) {
            if (i >= countToRender) {
                currentForms[i].remove();
            }
        }

        for (let i = currentForms.length; i < countToRender; i++) {
            const newForm = createUniqueForm(i);
            uniqueFormsContainer.appendChild(newForm);
        }
    }
    
    if (hasUniqueCheckbox && countContainer) {
        hasUniqueCheckbox.addEventListener('change', (e) => {
            countContainer.style.display = e.target.checked ? 'block' : 'none';
            updateUniqueForms();
            autoSaveAndPreview();
        });
    }

    uniqueCountInput?.addEventListener('input', () => {
        updateUniqueForms();
        autoSaveAndPreview();
    });

    const extraTacticsEnableCheckbox = document.getElementById('extraTactics_enable');
    if (extraTacticsEnableCheckbox && extraTacticsCountContainer) {
        extraTacticsEnableCheckbox.addEventListener('change', (e) => {
            extraTacticsCountContainer.style.display = e.target.checked ? 'block' : 'none';
            renderExtraTacticsForms();
            autoSaveAndPreview();
        });
    }

    extraTacticsCount?.addEventListener('input', () => {
        renderExtraTacticsForms();
        autoSaveAndPreview();
    });


    if (searchButton && searchModal) {
        searchButton.addEventListener('click', () => {
            searchModal.style.display = 'block';
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                searchModal.style.display = 'none';
            });
        }

        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
            }
        });
        

        searchInput?.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }

    function initialize() {

        initializeCsvSelector().then(() => {
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
            
            updateUniqueForms();
            renderExtraTacticsForms();
            
            updateSlotLabels();
        }).catch(error => {
            console.error("CSVデータの初期ロードに失敗しました:", error);
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
            updateUniqueForms();
            renderExtraTacticsForms();
            updateSlotLabels();
        });
    }

    initialize();

});



