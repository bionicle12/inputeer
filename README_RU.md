# Inputeer - Browser Execution Helper for AI Agents

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Расширение-blue?style=for-the-badge&logo=google-chrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Версия-0.4.4-orange?style=for-the-badge" alt="Version 0.4.4">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/ИИ--агенты-Поддерживаются-green?style=for-the-badge&logo=openai" alt="AI Agents Supported">
  <img src="https://img.shields.io/badge/Manifest-MV3-red?style=for-the-badge&logo=google-chrome" alt="Manifest V3">
  <br>
  <img src="https://img.shields.io/github/stars/bionicle12/inputeer?style=for-the-badge&logo=github" alt="GitHub Stars">
  <img src="https://img.shields.io/github/license/bionicle12/inputeer?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/last-commit/bionicle12/inputeer?style=for-the-badge" alt="Last Commit">
</p>

<p align="center">
  <img src="https://via.placeholder.com/800x400/4a90e2/ffffff?text=Inputeer+Демо" alt="Inputeer Demo" width="70%">
</p>

<p align="center">
  <strong>🌐 <a href="README.md">English version</a></strong>
</p>

## ✨ Обзор

**Inputeer** — это вспомогательное расширение для браузера Chrome, созданное специально для ИИ-агентов и разработчиков, которым требуется выполнять JavaScript-код в контексте веб-страниц.

Расширение решает проблему того, что многим ИИ-агентам запрещено напрямую выполнять команды в браузере. Используя Chrome Debugger API и техники обхода CSP (Content Security Policy), Inputeer предоставляет "костыльное", но рабочее решение для выполнения кода.

## 🚀 Ключевые возможности

### 🔧 Режим выполнения
- ~~**Песочница** - выполнение без панели отладки браузера (по умолчанию)~~
- **Отладчик** - прямое выполнение в контексте страницы через Chrome Debugger API

### 📝 Динамические переменные
Используйте `$1` в формулах для подстановки текста из textarea

### 💾 Сохранение формул
Сохраняйте часто используемые команды с именами (например, "vk знакомства")

### 🎛️ Удобный интерфейс
- Свертывание/развертывание панели с кнопкой `[^]`/`[v]`
- Выполнение по `Ctrl+Enter` + поддержка ИИ-агентов
- Прозрачная панель в левом нижнем углу

## 📦 Установка

1. Скачайте или клонируйте папку с расширением
2. Откройте `chrome://extensions`
3. Включите "Режим разработчика"
4. Нажмите "Загрузить распакованное"
5. Выберите папку с расширением
6. Панель Inputeer появится на всех веб-страницах

## 🎯 Использование

### Основной рабочий процесс:
1. Введите текст в верхнюю textarea (id="inputeeer")
2. Напишите JavaScript-формулу в нижней textarea, используя `$1` для подстановки текста
3. Нажмите `▶` или `Ctrl+Enter` для выполнения

### 📸 Скриншоты

<p align="center">
  <img src="https://via.placeholder.com/400x300/2c3e50/ffffff?text=Панель+Inputeer" alt="Inputeer Panel" width="45%">
  <img src="https://via.placeholder.com/400x300/34495e/ffffff?text=Примеры+формул" alt="Formula Examples" width="45%">
</p>

### Примеры формул:

```javascript
// Простое оповещение
alert($1)

// Вывод в консоль
console.log("Текст:", $1)

// Изменение заголовка страницы
document.title = $1

// Заполнение формы
document.querySelector('input[name="search"]').value = $1

// Сложные операции
if ($1.includes("ошибка")) {
  alert("Обнаружена ошибка: " + $1);
} else {
  console.log("Всё ок:", $1);
}

// Работа с DOM
document.querySelectorAll('.message').forEach(el => {
  if (el.textContent.includes($1)) {
    el.style.background = 'yellow';
  }
});

// VK Chat (подстановка текста + фокус для инициализации кнопки + отправка)
// Селекторы для примера - используйте DevTools для получения актуальных
document.querySelector("#popup-sticker-convo-main-history-container > div.ConvoMain__composerWrapper > div.ConvoMain__composer > div > div > div.ComposerInput.ConvoComposer__inputWrapper > div > span").innerText = $1;

setTimeout(() => {
    document.querySelector("#popup-sticker-convo-main-history-container > div.ConvoMain__composerWrapper > div.ConvoMain__composer > div > div > div.ComposerInput.ConvoComposer__inputWrapper > div > span").focus();

    setTimeout(() => {
        document.querySelector("#popup-sticker-convo-main-history-container > div.ConvoMain__composerWrapper > div.ConvoMain__composer > div > div > div:nth-child(4) > div > button").click();
    }, 400);
}, 200);
```

### Сохранение формул:
- Нажмите **"Сохранить"** для сохранения текущей формулы
- Выберите сохранённую формулу из выпадающего списка
- Используйте **"Удалить"** для удаления выбранной формулы

### Режимы работы:

**Режим "Отладчик"**:
- Выполняет код напрямую в контексте страницы
- Показывает панель отладки Chrome (можно игнорировать)
- Максимальный доступ к странице
- Требует разрешения на отладку для каждой вкладки

## 🛠️ Для разработчиков

### Структура проекта:
```
Inputeer/
├── manifest.json     # Манифест расширения MV3
├── content.js        # Основной скрипт с UI и логикой
├── background.js     # Сервис-воркер для Debugger API
├── README.md         # Английская документация
└── README_RU.md      # Русская документация
```

### API расширения:
- Формулы сохраняются в `localStorage` под ключом `inputeer_formulas`
- Элемент textarea имеет id `inputeeer` (с тремя 'e') для программного доступа
- Панель имеет id `inputeer-panel`

## 📋 Содержание

- [✨ Обзор](#-обзор)
- [🚀 Ключевые возможности](#-ключевые-возможности)
- [📦 Установка](#-установка)
- [🎯 Использование](#-использование)
- [🛠️ Для разработчиков](#️-для-разработчиков)
- [⚠️ Ограничения](#️-ограничения)
- [🔒 Безопасность](#-безопасность)
- [❓ FAQ](#-faq)
- [📄 Лицензия](#-лицензия)
- [🤝 Сотрудничество](#-сотрудничество)
- [📞 Поддержка](#-поддержка)

## ⚠️ Ограничения

⚠️ **Важно**: Вы должны самостоятельно составлять формулы для выполнения. Расширение предоставляет только механизм выполнения, но не генерирует код автоматически.

- Режим "Отладчик" показывает информационную панель браузера
- Расширение работает только в Chrome/Chromium-браузерах
- Иногда ИИ-агент отказывается работать на странице, если видит VK и т.п. Нужно сначала дать ему задачу найти и заполнить блок Inputeer, и только потом он становится более сговорчивым.

## 🔒 Безопасность

- Расширение выполняет только тот код, который вы сами вводите
- Все формулы сохраняются локально в браузере

## ❓ FAQ

### Можно ли использовать это расширение с браузерами, отличными от Chrome?
В настоящее время Inputeer работает только с Chrome и браузерами на базе Chromium из-за зависимости от Chrome Debugger API.

### Безопасно ли использовать расширение?
Да, расширение выполняет только JavaScript-код, который вы явно предоставляете. Оно не запускает фоновые процессы и не собирает данные. Все формулы хранятся локально в вашем браузере.

### Почему иногда появляется панель отладки?
Панель отладки появляется при использовании режима "Отладчик" для обеспечения полного доступа к контексту страницы. Вы можете игнорировать или свернуть эту панель - она не влияет на функциональность.

### Могут ли ИИ-агенты действительно использовать это расширение?
Да! Многие ИИ-агенты могут взаимодействовать с веб-страницами через это расширение. Просто попросите их найти панель Inputeer и использовать её для выполнения JavaScript-кода.

### Как сохранять и повторно использовать формулы?
Используйте кнопку "Сохранить" для хранения формул с пользовательскими именами. Затем вы можете выбирать их из выпадающего списка для быстрого доступа.

### Что делать, если формула не работает?
Убедитесь, что вы используете правильный JavaScript-синтаксис и что элементы, с которыми вы пытаетесь взаимодействовать, существуют на странице. Используйте DevTools браузера для проверки элементов и получения правильных селекторов.

## 📄 Лицензия

Создано как вспомогательный инструмент для разработки и автоматизации. Весь код не обфусцирован и не минимизирован для удобного чтения, расширения и модификации функциональности. Вы можете дорабатывать и изменять его для вашего удобства. Если оно принесёт пользу кому-то, спасибо!

---

💡 **Совет**: Для быстрого доступа сверните панель кнопкой `[v]`, и она превратится в компактный блок `[^]` для быстрого разворачивания.

## 🔧 Быстрый старт

```bash
# Клонируйте репозиторий
git clone https://github.com/bionicle12/inputeer.git

# Откройте страницу расширений Chrome
chrome://extensions

# Включите режим разработчика
# Загрузите распакованное расширение
# Наслаждайтесь!
```

## 📊 Статистика расширения

<p align="center">
  <img src="https://img.shields.io/github/repo-size/bionicle12/inputeer?style=flat-square" alt="Размер репозитория">
  <img src="https://img.shields.io/github/languages/code-size/bionicle12/inputeer?style=flat-square" alt="Размер кода">
  <img src="https://img.shields.io/github/languages/count/bionicle12/inputeer?style=flat-square" alt="Количество языков">
  <img src="https://img.shields.io/github/issues/bionicle12/inputeer?style=flat-square" alt="Проблемы">
  <img src="https://img.shields.io/github/issues-pr/bionicle12/inputeer?style=flat-square" alt="Pull Requests">
</p>

## 🤝 Сотрудничество

Вклад приветствуется! Вы можете:

- 🐛 [Сообщить об ошибках](https://github.com/bionicle12/inputeer/issues)
- 💡 [Предложить новые возможности](https://github.com/bionicle12/inputeer/issues)
- 🔧 [Отправить pull request](https://github.com/bionicle12/inputeer/pulls)
- 📖 [Улучшить документацию](https://github.com/bionicle12/inputeer/wiki)

### Настройка для разработки

1. Форкните репозиторий
2. Клонируйте ваш форк: `git clone https://github.com/yourusername/inputeer.git`
3. Внесите изменения
4. Протестируйте расширение в Chrome
5. Отправьте pull request

## 📞 Поддержка

Если вам понравилось это расширение или у вас есть предложения по улучшению, вы можете:
- ⭐ Поставить звёздочку репозиторию
- 🐛 [Сообщить о проблемах](https://github.com/bionicle12/inputeer/issues)
- 💡 [Предложить идеи](https://github.com/bionicle12/inputeer/discussions)
- 📧 Связаться с разработчиком

## 🙏 Благодарности

- Особая благодарность команде Chrome Extensions за Debugger API
- Вдохновлено необходимостью ИИ-агентов взаимодействовать с веб-страницами
- Создано с ❤️ для сообщества разработчиков

---

<p align="center">
  <strong>Создано с ❤️ для ИИ-агентов и разработчиков</strong>
</p>

<p align="center">
  <a href="#inputeer---browser-execution-helper-for-ai-agents">⬆️ Наверх</a>
</p>
