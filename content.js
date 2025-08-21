(() => {
  try {
    if (window.__inputeer_initialized__) return;
    Object.defineProperty(window, '__inputeer_initialized__', { value: true, writable: false });

    // State variables
    let useDebuggerMode = false;
    let isCollapsed = false;
    let savedFormulas = {};
    
    // Load saved state from chrome.storage
    chrome.storage.local.get(['inputeer_collapsed', 'inputeer_formulas'], (result) => {
      isCollapsed = result.inputeer_collapsed === true;
      savedFormulas = result.inputeer_formulas || {};
      applyCollapseState();
      updateFormulaSelect();
    });
    
    // Create primary container
    const container = document.createElement('div');
    container.id = 'inputeer-panel';

    Object.assign(container.style, {
      position: 'fixed',
      left: '12px',
      bottom: '12px',
      zIndex: '2147483647',
      background: 'rgba(20, 20, 20, 0.75)',
      color: '#fff',
      padding: '8px',
      borderRadius: '8px',
      width: '320px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      fontSize: '12px',
      lineHeight: '1.4',
      backdropFilter: 'blur(2px)',
      opacity: '0.85',
      transition: 'height 0.2s ease'
    });

    container.addEventListener('mouseenter', () => { container.style.opacity = '1'; });
    container.addEventListener('mouseleave', () => { container.style.opacity = '0.85'; });

    // Create content container for collapsing
    const contentContainer = document.createElement('div');
    contentContainer.style.overflow = 'hidden';
    
    // Header row with title, collapse button and mode toggle
    const headerRow = document.createElement('div');
    headerRow.style.display = 'flex';
    headerRow.style.gap = '6px';
    headerRow.style.alignItems = 'center';
    headerRow.style.marginBottom = '6px';
    headerRow.style.justifyContent = 'space-between';
    
    const headerLeftSection = document.createElement('div');
    headerLeftSection.style.display = 'flex';
    headerLeftSection.style.alignItems = 'center';
    headerLeftSection.style.gap = '6px';
    
    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'Inputeer';
    headerTitle.style.fontWeight = 'bold';
    headerTitle.style.fontSize = '12px';
    
    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.textContent = '[–]';
    collapseButton.title = 'Свернуть/развернуть панель';
    Object.assign(collapseButton.style, {
      padding: '0 4px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(0,0,0,0.25)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px',
      minWidth: '24px',
      marginLeft: 'auto'
    });
    
    headerLeftSection.appendChild(headerTitle);
    
    const headerRightSection = document.createElement('div');
    headerRightSection.style.display = 'flex';
    headerRightSection.style.alignItems = 'center';
    headerRightSection.style.gap = '6px';
    
    const modeLabel = document.createElement('span');
    modeLabel.textContent = 'Режим:';
    modeLabel.style.fontSize = '11px';
    modeLabel.style.opacity = '0.8';

    const modeToggle = document.createElement('button');
    modeToggle.type = 'button';
    modeToggle.textContent = 'Песочница';
    modeToggle.title = 'Переключить режим выполнения';
    Object.assign(modeToggle.style, {
      padding: '2px 8px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(0,100,0,0.3)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px',
      minWidth: '80px'
    });
    
    headerRightSection.appendChild(modeLabel);
    headerRightSection.appendChild(modeToggle);
    headerRightSection.appendChild(collapseButton);
    
    headerRow.appendChild(headerLeftSection);
    headerRow.appendChild(headerRightSection);
    
    container.appendChild(headerRow);
    container.appendChild(contentContainer);
    
    // Top row with textarea and run button
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.gap = '6px';
    topRow.style.alignItems = 'stretch';

    const textarea = document.createElement('textarea');
    textarea.id = 'inputeeer';
    textarea.placeholder = 'Текст для подстановки как $1';
    textarea.rows = 3;
    Object.assign(textarea.style, {
      flex: '1',
      resize: 'vertical',
      minHeight: '60px',
      maxHeight: '40vh',
      padding: '6px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      outline: 'none'
    });

    const runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.textContent = '▶';
    runBtn.title = 'Выполнить (Ctrl+Enter)';
    Object.assign(runBtn.style, {
      padding: '0 10px',
      minWidth: '48px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '6px',
      background: 'rgba(0,0,0,0.25)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px'
    });

    topRow.appendChild(textarea);
    topRow.appendChild(runBtn);

    const formulaWrap = document.createElement('div');
    formulaWrap.style.marginTop = '6px';

    const formulaTextarea = document.createElement('textarea');
    formulaTextarea.placeholder = 'Формула, например: alert($1)';
    formulaTextarea.value = 'alert($1)';
    formulaTextarea.rows = 2;
    Object.assign(formulaTextarea.style, {
      width: '94%',
      padding: '6px 8px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      outline: 'none',
      resize: 'vertical',
      minHeight: '40px',
      maxHeight: '200px'
    });

    formulaWrap.appendChild(formulaTextarea);
    
    // Formula save/load controls
    const saveLoadRow = document.createElement('div');
    saveLoadRow.style.display = 'flex';
    saveLoadRow.style.gap = '4px';
    saveLoadRow.style.alignItems = 'center';
    saveLoadRow.style.marginTop = '4px';
    
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Сохранить';
    saveBtn.title = 'Сохранить текущую формулу';
    Object.assign(saveBtn.style, {
      padding: '2px 6px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(0,100,200,0.3)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px'
    });
    
    const loadSelect = document.createElement('select');
    loadSelect.title = 'Загрузить сохранённую формулу';
    Object.assign(loadSelect.style, {
      flex: '1',
      padding: '2px 4px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      fontSize: '10px',
      outline: 'none'
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.title = 'Удалить выбранную формулу';
    Object.assign(deleteBtn.style, {
      padding: '2px 6px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(200,0,0,0.3)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px'
    });
    
    saveLoadRow.appendChild(saveBtn);
    saveLoadRow.appendChild(loadSelect);
    saveLoadRow.appendChild(deleteBtn);
    
    formulaWrap.appendChild(saveLoadRow);
    
    // Add all content to the content container
    contentContainer.appendChild(topRow);
    contentContainer.appendChild(formulaWrap);
    
    function updateFormulaSelect() {
      loadSelect.innerHTML = '<option value="">Выберите формулу...</option>';
      Object.keys(savedFormulas).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        loadSelect.appendChild(option);
      });
    }
    
    updateFormulaSelect();

    // Create sandbox iframe for executing code bypassing page CSP eval restrictions
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.bottom = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-modals allow-popups');
    iframe.srcdoc = `<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
(function(){
  window.addEventListener('message', function(e){
    var data = e.data || {};
    if (data && data.type === 'INPUTEER_RUN') {
      try {
        var code = String(data.code || '');
        var value = data.value;
        var prelude = 'const parent = window.parent; const window = parent; const document = parent.document; const console = parent.console; const alert = parent.alert.bind(parent); const confirm = parent.confirm.bind(parent); const prompt = parent.prompt.bind(parent);';
        var fn = new Function('value', prelude + '\n' + code);
        var result = fn(value);
        window.parent.postMessage({ type: 'INPUTEER_RESULT', taskId: data.taskId, ok: true, result: result }, '*');
      } catch (err) {
        window.parent.postMessage({ type: 'INPUTEER_RESULT', taskId: data.taskId, ok: false, error: String((err && err.stack) || err) }, '*');
      }
    }
  }, false);
})();
</script>
</body>
</html>`;
    document.documentElement.appendChild(iframe);
    const sandboxWin = iframe.contentWindow;

    window.addEventListener('message', (e) => {
      if (e.source === sandboxWin && e.data && e.data.type === 'INPUTEER_RESULT' && e.data.taskId) {
        if (!e.data.ok) {
          try { alert('[Inputeer] Ошибка: ' + e.data.error); } catch (_) { /* ignore */ }
          console.error('[Inputeer] Ошибка выполнения формулы:', e.data.error);
        } else {
          if (typeof e.data.result !== 'undefined') {
            console.log('[Inputeer] Результат:', e.data.result);
          }
          // Clear textarea after successful execution
          textarea.value = '';
        }
      }
    });

    // Function to apply collapse state
    function applyCollapseState() {
      if (isCollapsed) {
        contentContainer.style.display = 'none';
        collapseButton.textContent = '[^]';
        collapseButton.title = 'Развернуть панель';
        headerTitle.style.display = 'none';
        modeLabel.style.display = 'none';
        modeToggle.style.display = 'none';
        container.style.width = '40px';
        headerRow.style.justifyContent = 'center';
      } else {
        contentContainer.style.display = 'block';
        collapseButton.textContent = '[–]';
        collapseButton.title = 'Свернуть панель';
        headerTitle.style.display = 'inline';
        modeLabel.style.display = 'inline';
        modeToggle.style.display = 'inline-block';
        container.style.width = '320px';
        headerRow.style.justifyContent = 'space-between';
      }
    }
    
    // Apply initial collapse state
    applyCollapseState();

    // Collapse handler
    collapseButton.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      chrome.storage.local.set({ inputeer_collapsed: isCollapsed });
      applyCollapseState();
    });
    
    // Mode toggle handler
    modeToggle.addEventListener('click', () => {
      useDebuggerMode = !useDebuggerMode;
      if (useDebuggerMode) {
        modeToggle.textContent = 'Отладчик';
        modeToggle.style.background = 'rgba(100,0,0,0.3)';
        modeToggle.title = 'Режим отладчика (показывает панель браузера)';
      } else {
        modeToggle.textContent = 'Песочница';
        modeToggle.style.background = 'rgba(0,100,0,0.3)';
        modeToggle.title = 'Режим песочницы (без панели браузера)';
      }
    });
    
    // Save/Load handlers
    saveBtn.addEventListener('click', () => {
      const name = prompt('Название для сохранения формулы:', '');
      if (name && name.trim()) {
        savedFormulas[name.trim()] = formulaTextarea.value;
        chrome.storage.local.set({ inputeer_formulas: savedFormulas });
        updateFormulaSelect();
        alert('Формула сохранена: ' + name.trim());
      }
    });
    
    loadSelect.addEventListener('change', () => {
      const selectedName = loadSelect.value;
      if (selectedName && savedFormulas[selectedName]) {
        formulaTextarea.value = savedFormulas[selectedName];
      }
    });
    
    deleteBtn.addEventListener('click', () => {
      const selectedName = loadSelect.value;
      if (selectedName && savedFormulas[selectedName]) {
        if (confirm('Удалить формулу "' + selectedName + '"?')) {
          delete savedFormulas[selectedName];
          chrome.storage.local.set({ inputeer_formulas: savedFormulas });
          updateFormulaSelect();
        }
      } else {
        alert('Выберите формулу для удаления.');
      }
    });

    // Prevent page hotkeys from interfering when typing inside
    container.addEventListener('keydown', (e) => {
      e.stopPropagation();
    }, true);

    function runInSandbox() {
      const val = textarea.value;
      const taskId = 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      const code = String(formulaTextarea.value || '').replace(/\$1/g, 'value');
      sandboxWin.postMessage({ type: 'INPUTEER_RUN', code, value: val, taskId }, '*');
    }

    function runInDebugger() {
      const val = textarea.value;
      const userExpr = String(formulaTextarea.value || '').replace(/\$1/g, '__value');
      const wrapped = `(() => { try { const __value = ${JSON.stringify(val)}; return (function(){ ${userExpr} })(); } catch (e) { throw e; } })()`;

      chrome.runtime.sendMessage({ type: 'INPUTEER_EVAL', code: wrapped }, (resp) => {
        if (!resp || !resp.ok) {
          const errMsg = (resp && resp.error) || 'Unknown error';
          try { alert('[Inputeer] Ошибка: ' + errMsg); } catch (_) {}
          console.error('[Inputeer] Ошибка выполнения формулы:', errMsg);
          return;
        }
        if (typeof resp.result !== 'undefined') {
          console.log('[Inputeer] Результат:', resp.result);
        }
        // Clear textarea after successful execution
        textarea.value = '';
      });
    }

    function run() {
      try {
        if (useDebuggerMode) {
          runInDebugger();
        } else {
          runInSandbox();
        }
      } catch (err) {
        console.error('[Inputeer] Ошибка выполнения формулы:', err);
        try { alert('[Inputeer] Ошибка: ' + err); } catch (_) { /* ignore */ }
      }
    }

    runBtn.addEventListener('click', run);
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });
    formulaTextarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });

    document.documentElement.appendChild(container);
  } catch (e) {
    console.error('[Inputeer] init error', e);
  }
})();

