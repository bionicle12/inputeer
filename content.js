(() => {
  try {
    if (window.__inputeer_initialized__) return;
    Object.defineProperty(window, '__inputeer_initialized__', { value: true, writable: false });

    // Localization system
    const translations = {
      en: {
        title: 'Inputeer',
        collapseButton: {
          collapsed: '[ ^ ]',
          expanded: '[v]',
          collapsedTitle: 'Expand panel',
          expandedTitle: 'Collapse panel'
        },
        textareaPlaceholder: 'Text for substitution as $1',
        formulaPlaceholder: 'Formula, example: alert($1)',
        runButton: '▶',
        runButtonTitle: 'Execute (Ctrl+Enter)',
        saveButton: 'Save',
        saveButtonTitle: 'Save current formula',
        deleteButton: 'Delete',
        deleteButtonTitle: 'Delete selected formula',
        selectPlaceholder: 'Choose formula...',
        savePromptTitle: 'Save formula name:',
        saveSuccessMessage: 'Formula saved: ',
        deleteConfirmMessage: 'Delete formula "',
        deleteConfirmEnd: '"?',
        noFormulaSelected: 'Please select a formula to delete.',
        errorPrefix: '[Inputeer] Error: ',
        resultPrefix: '[Inputeer] Result: ',
        executionError: '[Inputeer] Execution error: ',
        modeLabel: 'Mode:',
        debuggerMode: 'Debugger',
        debuggerModeTitle: 'Debugger mode (shows browser panel)',
        sandboxMode: 'Sandbox',
        sandboxModeTitle: 'Sandbox mode (no browser panel)'
      },
      ru: {
        title: 'Inputeer',
        collapseButton: {
          collapsed: '[ ^ ]',
          expanded: '[v]',
          collapsedTitle: 'Развернуть панель',
          expandedTitle: 'Свернуть панель'
        },
        textareaPlaceholder: 'Текст для подстановки как $1',
        formulaPlaceholder: 'Формула, например: alert($1)',
        runButton: '▶',
        runButtonTitle: 'Выполнить (Ctrl+Enter)',
        saveButton: 'Сохранить',
        saveButtonTitle: 'Сохранить текущую формулу',
        deleteButton: 'Удалить',
        deleteButtonTitle: 'Удалить выбранную формулу',
        selectPlaceholder: 'Выберите формулу...',
        savePromptTitle: 'Название для сохранения формулы:',
        saveSuccessMessage: 'Формула сохранена: ',
        deleteConfirmMessage: 'Удалить формулу "',
        deleteConfirmEnd: '"?',
        noFormulaSelected: 'Выберите формулу для удаления.',
        errorPrefix: '[Inputeer] Ошибка: ',
        resultPrefix: '[Inputeer] Результат: ',
        executionError: '[Inputeer] Ошибка выполнения формулы: ',
        modeLabel: 'Режим:',
        debuggerMode: 'Отладчик',
        debuggerModeTitle: 'Режим отладчика (показывает панель браузера)',
        sandboxMode: 'Песочница',
        sandboxModeTitle: 'Режим песочницы (без панели браузера)'
      }
    };

    // State variables
    let currentLanguage = 'en'; // Default language
    let useDebuggerMode = true; // Always use debugger mode for now
    let isCollapsed = true; // Default to collapsed to prevent visible state changes
    let savedFormulas = {};
    
    // Load saved state from chrome.storage
    chrome.storage.local.get(['inputeer_collapsed', 'inputeer_formulas', 'inputeer_language'], (result) => {
      isCollapsed = result.inputeer_collapsed === true;
      savedFormulas = result.inputeer_formulas || {};
      currentLanguage = result.inputeer_language || 'en'; // Default to English
      applyCollapseState();
      updateFormulaSelect();
      updateAllTexts(); // Update texts after loading language
    });

    // Function to get current translation
    function t(key) {
      return translations[currentLanguage][key] || key;
    }

    // Function to update all UI texts
    function updateAllTexts() {
      const trans = translations[currentLanguage];

      // Update title
      headerTitle.textContent = trans.title;

      // Update placeholders
      textarea.placeholder = trans.textareaPlaceholder;
      formulaTextarea.placeholder = trans.formulaPlaceholder;

      // Update default formula value if it's still the default
      if (formulaTextarea.value === 'alert($1)' || formulaTextarea.value === 'Формула, например: alert($1)') {
        formulaTextarea.value = trans.formulaPlaceholder;
      }

      // Update button texts
      runBtn.textContent = trans.runButton;
      runBtn.title = trans.runButtonTitle;
      saveBtn.textContent = trans.saveButton;
      saveBtn.title = trans.saveButtonTitle;
      deleteBtn.textContent = trans.deleteButton;
      deleteBtn.title = trans.deleteButtonTitle;

      // Update select placeholder (need to recreate options)
      updateFormulaSelect();

      // Update language toggle button
      languageToggle.textContent = currentLanguage === 'en' ? '🇷🇺' : '🇺🇸';
      languageToggle.title = currentLanguage === 'en' ? 'Switch to Russian' : 'Переключить на английский';

      // Update mode elements (even though they're hidden)
      modeLabel.textContent = trans.modeLabel;
      modeToggle.textContent = trans.debuggerMode;
      modeToggle.title = trans.debuggerModeTitle;
    }
    
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
      fontFamily: 'Tahoma, Verdana, sans-serif',
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

    // Language toggle button
    const languageToggle = document.createElement('button');
    languageToggle.type = 'button';
    languageToggle.textContent = '🇷🇺';
    languageToggle.title = 'Switch to Russian';
    Object.assign(languageToggle.style, {
      padding: '2px 4px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '3px',
      background: 'rgba(0,0,0,0.25)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px',
      minWidth: '20px'
    });
    
    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.textContent = '[ – ]';
    collapseButton.title = 'Свернуть/развернуть панель';
    Object.assign(collapseButton.style, {
      padding: '5px 6px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(0,0,0,0.25)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px',
      minWidth: '28px',
      marginLeft: 'auto'
    });
    
    headerLeftSection.appendChild(headerTitle);
    headerLeftSection.appendChild(languageToggle);

    const headerRightSection = document.createElement('div');
    headerRightSection.style.display = 'flex';
    headerRightSection.style.alignItems = 'center';
    headerRightSection.style.gap = '6px';
    
    const modeLabel = document.createElement('span');
    modeLabel.textContent = 'Режим:';
    modeLabel.style.fontSize = '11px';
    modeLabel.style.opacity = '0.8';
    modeLabel.style.display = 'none'; // Hide mode label

    const modeToggle = document.createElement('button');
    modeToggle.type = 'button';
    modeToggle.textContent = 'Отладчик';
    modeToggle.title = 'Режим отладчика (показывает панель браузера)';
    Object.assign(modeToggle.style, {
      padding: '2px 8px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '4px',
      background: 'rgba(100,0,0,0.3)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '10px',
      minWidth: '80px',
      display: 'none' // Hide mode toggle button
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
    
    // Force placeholder styling to ensure visibility on all sites
    textarea.setAttribute('style', textarea.getAttribute('style') + '::placeholder { color: rgba(255,255,255,0.6) !important; }');
    
    // Add CSS rule for placeholder styling
    const style = document.createElement('style');
    style.textContent = `
      #inputeeer::placeholder {
        color: rgba(255,255,255,0.6) !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);

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
    formulaWrap.style.display = 'flex';
    formulaWrap.style.flexDirection = 'column';
    formulaWrap.style.gap = '4px';

    const formulaTextarea = document.createElement('textarea');
    formulaTextarea.placeholder = 'Формула, например: alert($1)';
    formulaTextarea.value = 'alert($1)'; // Will be updated by updateAllTexts()
    formulaTextarea.rows = 2;
    Object.assign(formulaTextarea.style, {
      width: '100%',
      boxSizing: 'border-box',
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
    
    // Add CSS rule for select options styling
    const selectStyle = document.createElement('style');
    selectStyle.textContent = `
      #inputeer-panel select option {
        background: rgba(40, 40, 40, 0.95) !important;
        color: #fff !important;
      }
    `;
    document.head.appendChild(selectStyle);
    
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
      loadSelect.innerHTML = '<option value="">' + t('selectPlaceholder') + '</option>';
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
          try { alert(t('errorPrefix') + e.data.error); } catch (_) { /* ignore */ }
          console.error(t('executionError'), e.data.error);
        } else {
          if (typeof e.data.result !== 'undefined') {
            console.log(t('resultPrefix'), e.data.result);
          }
          // Clear textarea after successful execution
          textarea.value = '';
        }
      }
    });

    // Function to apply collapse state
    function applyCollapseState() {
      const trans = translations[currentLanguage];
      if (isCollapsed) {
        contentContainer.style.display = 'none';
        collapseButton.textContent = trans.collapseButton.collapsed;
        collapseButton.title = trans.collapseButton.collapsedTitle;
        collapseButton.style.padding = '5px 6px';
        headerTitle.style.display = 'none';
        languageToggle.style.display = 'none';
        modeLabel.style.display = 'none';
        modeToggle.style.display = 'none';
        container.style.width = 'auto';
        container.style.padding = '4px 6px 0px';
        container.style.height = '28px';
        headerRow.style.justifyContent = 'center';
        headerRow.style.marginBottom = '0';
        headerRow.style.gap = '0';
      } else {
        contentContainer.style.display = 'block';
        collapseButton.textContent = trans.collapseButton.expanded;
        collapseButton.title = trans.collapseButton.expandedTitle;
        collapseButton.style.padding = '5px 6px';
        headerTitle.style.display = 'inline';
        languageToggle.style.display = 'inline-block';
        modeLabel.style.display = 'inline';
        modeToggle.style.display = 'inline-block';
        container.style.width = '320px';
        container.style.padding = '8px';
        container.style.height = 'auto';
        headerRow.style.justifyContent = 'space-between';
        headerRow.style.marginBottom = '6px';
        headerRow.style.gap = '6px';
      }
    }
    
    // Apply initial collapse state
    applyCollapseState();

    // Language toggle handler
    languageToggle.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
      chrome.storage.local.set({ inputeer_language: currentLanguage });
      updateAllTexts();
      applyCollapseState();
    });

    // Collapse handler
    collapseButton.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      chrome.storage.local.set({ inputeer_collapsed: isCollapsed });
      applyCollapseState();
    });
    
    // Mode toggle handler (disabled for now)
    modeToggle.addEventListener('click', () => {
      // Sandbox mode is temporarily disabled
      // useDebuggerMode = !useDebuggerMode;
      // if (useDebuggerMode) {
      //   modeToggle.textContent = 'Отладчик';
      //   modeToggle.style.background = 'rgba(100,0,0,0.3)';
      //   modeToggle.title = 'Режим отладчика (показывает панель браузера)';
      // } else {
      //   modeToggle.textContent = 'Песочница';
      //   modeToggle.style.background = 'rgba(0,100,0,0.3)';
      //   modeToggle.title = 'Режим песочницы (без панели браузера)';
      // }
    });
    
    // Save/Load handlers
    saveBtn.addEventListener('click', () => {
      const name = prompt(t('savePromptTitle'), '');
      if (name && name.trim()) {
        savedFormulas[name.trim()] = formulaTextarea.value;
        chrome.storage.local.set({ inputeer_formulas: savedFormulas });
        updateFormulaSelect();
        alert(t('saveSuccessMessage') + name.trim());
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
        if (confirm(t('deleteConfirmMessage') + selectedName + t('deleteConfirmEnd'))) {
          delete savedFormulas[selectedName];
          chrome.storage.local.set({ inputeer_formulas: savedFormulas });
          updateFormulaSelect();
        }
      } else {
        alert(t('noFormulaSelected'));
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
      
      // Try multiple sandbox execution methods
      try {
        // Method 1: Try iframe postMessage (original approach)
        if (sandboxWin && sandboxWin.postMessage) {
          sandboxWin.postMessage({ type: 'INPUTEER_RUN', code, value: val, taskId }, '*');
          
          // Set timeout to fallback if iframe method fails
          setTimeout(() => {
            // Method 2: Direct script injection with CSP bypass
            runInSandboxDirect(val, code, taskId);
          }, 500);
        } else {
          // iframe not available, use direct method
          runInSandboxDirect(val, code, taskId);
        }
      } catch (err) {
        console.error('[Inputeer] Sandbox error:', err);
        runInSandboxDirect(val, code, taskId);
      }
    }
    
    function runInSandboxDirect(val, code, taskId) {
      try {
        // Method 2: Modern CSP-compliant execution methods
        const safeGlobals = {
          alert: window.alert.bind(window),
          confirm: window.confirm.bind(window),
          prompt: window.prompt.bind(window),
          console: window.console,
          document: window.document,
          window: window,
          value: val
        };
        
        // Method 2a: Try Function constructor (most CSP-friendly)
        try {
          const wrappedCode = `
            (function(alert, confirm, prompt, console, document, window, value) {
              'use strict';
              try {
                return (function() {
                  ${code}
                })();
              } catch (e) {
                throw e;
              }
            })
          `;
          
          const fn = new Function('return ' + wrappedCode)();
          const result = fn(
            safeGlobals.alert,
            safeGlobals.confirm,
            safeGlobals.prompt,
            safeGlobals.console,
            safeGlobals.document,
            safeGlobals.window,
            safeGlobals.value
          );
          
          console.log('[Inputeer] Результат (прямое выполнение):', result);
          textarea.value = '';
          return;
        } catch (err) {
          console.warn('[Inputeer] Function constructor failed:', err);
        }
        
        // Method 2b: Script injection with nonce support
        try {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          
          // Try to get existing nonce from page scripts
          let nonce = null;
          const existingScripts = document.querySelectorAll('script[nonce]');
          if (existingScripts.length > 0) {
            nonce = existingScripts[0].getAttribute('nonce');
          }
          
          // If no nonce found, try meta tag
          if (!nonce) {
            const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            if (metaCSP) {
              const cspContent = metaCSP.getAttribute('content');
              const nonceMatch = cspContent.match(/nonce-([a-zA-Z0-9+\/=]+)/);
              if (nonceMatch) {
                nonce = nonceMatch[1];
              }
            }
          }
          
          if (nonce) {
            script.setAttribute('nonce', nonce);
          }
          
          // Generate unique function name to avoid conflicts
          const funcName = 'inputeerFunc_' + Date.now() + '_' + Math.random().toString(36).slice(2);
          
          const scriptContent = `
            window.${funcName} = function() {
              try {
                const value = ${JSON.stringify(val)};
                const result = (function() {
                  ${code}
                })();
                console.log('[Inputeer] Результат (script injection):', result);
                
                // Clear textarea
                const textarea = document.getElementById('inputeeer');
                if (textarea) textarea.value = '';
                
                // Cleanup
                delete window.${funcName};
              } catch (e) {
                console.error('[Inputeer] Script injection error:', e);
                alert(t('errorPrefix') + e.message);
                delete window.${funcName};
              }
            };
            window.${funcName}();
          `;
          
          script.textContent = scriptContent;
          document.head.appendChild(script);
          
          // Clean up script element
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 100);
          
          return;
        } catch (err) {
          console.warn('[Inputeer] Script injection failed:', err);
        }
        
        // Method 2c: Event-based execution (CSP bypass)
        try {
          const eventName = 'inputeer_exec_' + Date.now();
          
          // Create event listener
          const handler = function(e) {
            try {
              const value = e.detail.value;
              const result = new Function('value', e.detail.code)(value);
              console.log('[Inputeer] Результат (event-based):', result);
              textarea.value = '';
            } catch (err) {
              console.error('[Inputeer] Event execution error:', err);
              alert(t('errorPrefix') + err.message);
            }
            document.removeEventListener(eventName, handler);
          };
          
          document.addEventListener(eventName, handler);
          
          // Dispatch event
          const event = new CustomEvent(eventName, {
            detail: { code, value: val }
          });
          document.dispatchEvent(event);
          
          return;
        } catch (err) {
          console.warn('[Inputeer] Event-based execution failed:', err);
        }
        
        // Method 2d: Web Worker approach (for heavy computations)
        try {
          const blob = new Blob([
            `
            self.addEventListener('message', function(e) {
              try {
                const value = e.data.value;
                const code = e.data.code;
                
                // Limited execution context in worker
                const result = new Function('value', code)(value);
                self.postMessage({ success: true, result: result });
              } catch (error) {
                self.postMessage({ success: false, error: error.message });
              }
            });
            `
          ], { type: 'application/javascript' });
          
          const worker = new Worker(URL.createObjectURL(blob));
          
          worker.onmessage = function(e) {
            if (e.data.success) {
              console.log('[Inputeer] Результат (Web Worker):', e.data.result);
              textarea.value = '';
            } else {
              console.error('[Inputeer] Web Worker error:', e.data.error);
              alert(t('errorPrefix') + e.data.error);
            }
            worker.terminate();
            URL.revokeObjectURL(blob);
          };
          
          worker.onerror = function(err) {
            console.error('[Inputeer] Web Worker failed:', err);
            worker.terminate();
            URL.revokeObjectURL(blob);
            throw err;
          };
          
          worker.postMessage({ code, value: val });
          return;
        } catch (err) {
          console.warn('[Inputeer] Web Worker method failed:', err);
        }
        
        throw new Error('Все методы выполнения в песочнице не удались');
        
      } catch (err) {
        console.error('[Inputeer] Ошибка выполнения в песочнице:', err);
        try { alert(t('errorPrefix') + err.message); } catch (_) {}
      }
    }

    function runInDebugger() {
      const val = textarea.value;
      const userExpr = String(formulaTextarea.value || '').replace(/\$1/g, '__value');
      const wrapped = `(() => { try { const __value = ${JSON.stringify(val)}; return (function(){ ${userExpr} })(); } catch (e) { throw e; } })()`;

      chrome.runtime.sendMessage({ type: 'INPUTEER_EVAL', code: wrapped }, (resp) => {
        if (!resp || !resp.ok) {
          const errMsg = (resp && resp.error) || 'Unknown error';
          try { alert(t('errorPrefix') + errMsg); } catch (_) {}
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
        // Always use debugger mode for now (sandbox mode is temporarily disabled)
        runInDebugger();
        // if (useDebuggerMode) {
        //   runInDebugger();
        // } else {
        //   runInSandbox();
        // }
      } catch (err) {
        console.error('[Inputeer] Ошибка выполнения формулы:', err);
        try { alert(t('errorPrefix') + err); } catch (_) { /* ignore */ }
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

