"use strict";
/**
 * TaskWindowに格納するブロックの基底クラス
 */
class Block {
    /**
     * コンストラクタ
     *
     * @param canEdit 編集モード
     */
    constructor(canEdit) {
        this.canEdit_ = canEdit;
        /// ブロックの要素を作成
        this.element_ = document.createElement("div");
        this.element_.classList.add("block-wrapper");
    }
    /**
     * ボタンを作成する
     *
     * @param text ボタンのテキスト
     * @param className ボタンのクラス名
     * @returns 作成したボタン
     */
    createBtn(text, ...className) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.classList.add(...className);
        return btn;
    }
    /**
     * 入力要素を作成する
     *
     * @param type 入力要素のタイプ
     * @param value 入力要素の値
     * @param className 入力要素のクラス名
     * @returns 作成した入力要素
     */
    createInputElement(type, value, ...className) {
        const element = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        if (type !== "textarea")
            element.type = type;
        element.value = value;
        element.classList.add(...className);
        return element;
    }
    /**
     * テキスト要素を作成する
     *
     * @param tag テキスト要素のタグ名
     * @param text テキスト要素のテキスト
     * @param className テキスト要素のクラス名
     * @returns 作成したテキスト要素
     */
    createTextElement(tag, text, ...className) {
        const element = document.createElement(tag);
        element.textContent = text;
        element.classList.add(...className);
        return element;
    }
    /**
     * ブロックを削除する
     */
    delete() {
        this.element_.remove();
    }
    /**
     * ブロックの要素を取得する
     *
     * @returns ブロックの要素
     */
    get element() {
        return this.element_;
    }
}
/**
 * タイトルブロック
 */
class TitleBlock extends Block {
    /**
     * コンストラクタ
     *
     * @param canEdit 編集モード
     * @param text ブロックのタイトル
     */
    constructor(canEdit, text = "タイトルなし") {
        super(canEdit);
        this.title = text;
        this.addElement(text);
        this.element_.classList.add("title-block-wrapper");
    }
    /**
     * ブロックを追加する
     *
     * @param title ブロックのタイトル
     */
    addElement(title) {
        this.title = title;
        const newElement = this.canEdit_
            ? this.createInputElement("text", title, "title")
            : this.createTextElement("h2", title, "title");
        this.element_.appendChild(newElement);
    }
    /**
     * ブロックをエクスポートする
     *
     * @returns ブロックのエクスポートデータ
     */
    get exportData() {
        return `{"class":"${this.constructor.name}","content":"${this.title}","canEdit":${this.canEdit_}}`;
    }
}
/**
 * テキストブロック
 */
class TextBlock extends Block {
    /**
     * コンストラクタ
     *
     * @param canEdit 編集モード
     * @param text ブロックの内容
     */
    constructor(canEdit, text = "") {
        super(canEdit);
        this.addElement(text);
        this.element_.classList.add("text-block-wrapper");
    }
    /**
     * ブロックを追加する
     *
     * @param content ブロックの内容
     */
    addElement(content) {
        const newElement = this.canEdit_
            ? this.createInputElement("textarea", content, "content")
            : this.createTextElement("p", content, "content");
        this.element_.appendChild(newElement);
    }
    /**
     * ブロックをエクスポートする
     *
     * @returns ブロックのエクスポートデータ
     */
    get exportData() {
        var _a, _b;
        const text = this.canEdit_ ?
            (_a = this.element_.querySelector("textarea")) === null || _a === void 0 ? void 0 : _a.value
            : (_b = this.element_.querySelector("p")) === null || _b === void 0 ? void 0 : _b.textContent;
        return `{"class":"${this.constructor.name}","content":"${text}","canEdit":${this.canEdit_}}`;
    }
}
/**
 * チェックリストブロック
 */
class CheckListBlock extends Block {
    /**
     * コンストラクタ
     *
     * @param canEdit 編集モード
     * @param checkList チェックリスト
     */
    constructor(canEdit, checkList = []) {
        super(canEdit);
        this.addElement(checkList);
        this.element_.classList.add("checklist-block-wrapper");
        if (canEdit)
            this.addEditButtons();
    }
    /**
     * 編集ボタンを追加する
     */
    addEditButtons() {
        /// 編集ボタンのリスト
        const buttons = [
            { text: "追加", classes: ["edit-btn", "add-btn"], action: this.addCheckItem.bind(this) },
            { text: "削除", classes: ["edit-btn", "del-btn"], action: this.toggleDeleteMode.bind(this) },
            { text: "全選択", classes: ["edit-btn", "all-select-btn"], action: this.selectAll.bind(this) },
            { text: "選択解除", classes: ["edit-btn", "all-unselect-btn"], action: this.unselectAll.bind(this) }
        ];
        /// 編集ボタンを追加
        buttons.forEach(({ text, classes, action }) => {
            const btn = this.createBtn(text, ...classes);
            btn.addEventListener("click", action);
            this.element_.appendChild(btn);
        });
    }
    /**
     * チェックリストを追加する
     */
    addCheckItem() {
        const input = window.prompt("追加するチェックリストの内容を入力してください。");
        if (input)
            this.element_.insertBefore(this.createRow(input, false), this.element_.firstChild); /// 先頭にチェックリストを追加
    }
    /**
     * 削除モードを切り替える
     */
    toggleDeleteMode() {
        const delBtn = this.element_.querySelector(".del-btn");
        if (!delBtn)
            return;
        const isDeleteMode = delBtn.classList.toggle("delete-mode"); /// 削除モード切り替え
        if (isDeleteMode)
            this.markItemsForDeletion(); /// 削除モードの場合、チェックリストをマーク
        else if (confirm("削除しますか？"))
            this.removeMarkedItems(); /// 削除モードでない場合、マークされたチェックリストを削除
    }
    removeMarkedItems() {
        Array.from(this.element_.children)
            .filter(child => child.classList.contains("marked-del"))
            .forEach(child => this.element_.removeChild(child));
    }
    /**
     * 削除するチェックリストをマークする
     */
    markItemsForDeletion() {
        Array.from(this.element_.children).forEach((child) => {
            const checkBox = child.querySelector(".check-box");
            if (checkBox) {
                if (checkBox.checked)
                    child.classList.add("marked-del");
                checkBox.onchange = () => {
                    child.classList.toggle("marked-del", checkBox.checked);
                };
            }
        });
    }
    /**
     * 全てのチェックリストを選択する
     */
    selectAll() {
        this.updateAllCheckboxes(true);
    }
    /**
     * 全てのチェックリストを選択解除する
     */
    unselectAll() {
        this.updateAllCheckboxes(false);
    }
    /**
     * 全てのチェックリストのチェックボックスを更新する
     *
     * @param checked チェックボックスの状態
     */
    updateAllCheckboxes(checked) {
        Array.from(this.element_.children).forEach((child) => {
            const checkBox = child.querySelector(".check-box");
            if (checkBox) {
                checkBox.checked = checked;
                this.updateCheckState(checkBox, child.querySelector(".check-text"));
            }
        });
    }
    /**
     * チェックリストを作成する
     *
     * @param text チェックリストの内容
     * @param checked チェックボックスの状態
     * @returns 作成したチェックリスト
     */
    createRow(text, checked) {
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("check-row");
        const checkBox = this.createInputElement("checkbox", "", "check-box");
        const newText = this.canEdit_
            ? this.createInputElement("text", text, "check-text", "content")
            : this.createTextElement("p", text, "check-text", "content");
        checkBox.checked = checked;
        this.updateCheckState(checkBox, newText);
        checkBox.onchange = () => this.updateCheckState(checkBox, newText);
        rowContainer.append(checkBox, newText);
        return rowContainer;
    }
    addElement(checkList) {
        checkList.forEach(([text, checked]) => {
            this.element_.appendChild(this.createRow(text, checked));
        });
    }
    /**
     * チェックボックスの状態を更新する
     *
     * @param checkBox チェックボックス
     * @param textElement チェックリストのテキスト
     */
    updateCheckState(checkBox, textElement) {
        if (textElement) {
            textElement.classList.toggle("checked", checkBox.checked);
        }
    }
    /**
     * チェックリストをエクスポートする
     *
     * @returns チェックリストのエクスポートデータ
     */
    get exportData() {
        let list = "";
        let isFirst = true;
        this.element_.querySelectorAll(".check-row").forEach((row) => {
            const checkBox = row.querySelector(".check-box");
            const textElement = row.querySelector(".check-text");
            list += `${isFirst ? "" : ","}["${this.canEdit_ ? textElement === null || textElement === void 0 ? void 0 : textElement.value : textElement === null || textElement === void 0 ? void 0 : textElement.textContent}",${checkBox === null || checkBox === void 0 ? void 0 : checkBox.checked}]`;
            isFirst = false;
        });
        return `{"class":"${this.constructor.name}","content":[${list}],"canEdit":${this.canEdit_}}`;
    }
}
/**
 * リンクブロック
 */
class LinkBlock extends Block {
    /**
     * コンストラクタ
     *
     * @param canEdit 編集モード
     * @param links リンク
     */
    constructor(canEdit, links = []) {
        super(canEdit);
        this.addElement(...links);
        this.element_.classList.add("link-block-wrapper");
        if (canEdit)
            this.addEditButtons();
    }
    /**
     * 編集ボタンを追加する
     */
    addEditButtons() {
        const buttons = [
            { text: "追加", classes: ["edit-btn", "add-btn"], action: this.addLink.bind(this) },
            { text: "削除", classes: ["edit-btn", "del-btn"], action: this.toggleDeleteMode.bind(this) },
        ];
        buttons.forEach(({ text, classes, action }) => {
            const btn = this.createBtn(text, ...classes);
            btn.addEventListener("click", action);
            this.element_.appendChild(btn);
        });
    }
    /**
     * 削除モードを切り替える
     */
    toggleDeleteMode() {
        const delBtn = this.element_.querySelector(".del-btn");
        if (!delBtn)
            return;
        if (delBtn.classList.contains("delete-mode")) {
            delBtn.classList.remove("delete-mode");
            this.removeCheckBox();
            if (confirm("削除しますか？"))
                this.removeMarkedItems();
        }
        else {
            delBtn.classList.add("delete-mode");
            this.addCheckBox();
        }
    }
    /**
     * 削除モードの場合、チェックボックスを追加する
     */
    addCheckBox() {
        Array.from(this.element_.children).forEach((child) => {
            if (!child.classList.contains("link"))
                return;
            const checkBox = this.createInputElement("checkbox", "", "check-box");
            checkBox.addEventListener("change", () => {
                child.classList.toggle("marked-del", checkBox.checked);
            });
            child.appendChild(checkBox);
        });
    }
    /**
     * 削除モードの場合、チェックボックスを削除する
     */
    removeCheckBox() {
        Array.from(this.element_.querySelectorAll(".check-box")).forEach((checkBox) => {
            var _a;
            (_a = checkBox.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(checkBox);
        });
    }
    /**
     * マークされたリンクを削除する
     */
    removeMarkedItems() {
        Array.from(this.element_.querySelectorAll(".marked-del")).forEach((marked) => {
            this.element_.removeChild(marked);
        });
    }
    /**
     * リンクを作成する
     *
     * @param text リンクの表示名
     * @param link リンク
     * @returns 作成したリンク
     */
    createLink(text, link) {
        const linkElement = this.createTextElement("a", text, "link");
        linkElement.href = link;
        return linkElement;
    }
    /**
     * リンクを追加する
     */
    addLink() {
        const input = window.prompt("追加するリンクの内容を入力してください。表示名:リンク\n例: google,https://www.google.com/");
        if (input) {
            let [text, link] = input.split(",");
            link = link || text; // 表示名のみの場合、リンクとして扱う
            // 正規表現でURLを検証
            const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
            if (urlPattern.test(link)) {
                this.element_.insertBefore(this.createLink(text, link), this.element_.firstChild);
            }
            else {
                alert("リンクが不正です。");
            }
        }
    }
    /**
     * リンクを追加する
     *
     * @param links リンク
     */
    addElement(...links) {
        const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
        links.forEach(([text, link]) => {
            link = link || text;
            if (urlPattern.test(link)) {
                this.element_.appendChild(this.createLink(text, link));
            }
            else {
                alert("リンクが不正です。");
            }
        });
    }
    /**
     * リンクをエクスポートする
     *
     * @returns リンクのエクスポートデータ
     */
    get exportData() {
        let list = "";
        let isFirst = true;
        this.element_.querySelectorAll(".link").forEach((link) => {
            list += `${isFirst ? "" : ","}["${link.textContent}","${link === null || link === void 0 ? void 0 : link.href}"]`;
            isFirst = false;
        });
        return `{"class":"${this.constructor.name}","content":[${list}],"canEdit":${this.canEdit_}}`;
    }
}
/**
 * コンテナアイテムのリスト
 */
const containerItemList = [
    TitleBlock,
    TextBlock,
    CheckListBlock,
    LinkBlock
];
/**
 * タスクウィンドウ
 */
class TaskWindow {
    /**
     * コンストラクタ
     *
     * @param canEdit 編集モード
     * @param containers アイテム
     */
    constructor(canEdit = false, containers = []) {
        this.containerElement = null; /// コンテナの要素
        this.canEdit_ = canEdit;
        this.container_ = containers;
    }
    /**
     * アイテムを追加する
     *
     * @param container アイテム
     */
    addItem(container) {
        this.container_.push(container);
    }
    /**
     * 削除ボタンを追加する
     *
     * @param container コンテナ
     * @param item アイテム
     */
    addDeleteButton(container, item) {
        // ボタンが既に存在するか確認
        if (item.element.querySelector(".edit-btn.delete-mode"))
            return;
        const btn = document.createElement("button");
        btn.textContent = "このブロックを削除";
        btn.classList.add("edit-btn", "delete-mode");
        btn.style.display = "block";
        btn.addEventListener("click", () => {
            if (!confirm("削除しますか？"))
                return;
            container.removeChild(item.element);
            item.delete();
        });
        item.element.appendChild(btn);
    }
    /**
     * 追加ボタンを追加する
     *
     * @returns 追加ボタンの要素
     */
    addBtn() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("add-btn-wrapper");
        const selectBox = document.createElement("select");
        selectBox.classList.add("add-btn-select");
        containerItemList.forEach((ItemClass) => {
            const option = document.createElement("option");
            option.value = ItemClass.name;
            option.textContent = ItemClass.name;
            selectBox.appendChild(option);
        });
        const btn = document.createElement("button");
        btn.textContent = "追加";
        btn.classList.add("edit-btn", "add-btn");
        wrapper.appendChild(selectBox);
        wrapper.appendChild(btn);
        btn.addEventListener("click", () => {
            const ItemClass = containerItemList[selectBox.selectedIndex];
            const item = new ItemClass(true);
            this.addItem(item);
            this.reload();
        });
        return wrapper;
    }
    /**
     * コンテナの要素を更新する
     */
    reload() {
        this.containerElement.innerHTML = "";
        if (this.canEdit_) {
            this.containerElement.classList.add("edit-mode");
        }
        this.container_.forEach((c) => {
            if (this.canEdit_)
                this.addDeleteButton(this.containerElement, c);
            this.containerElement.appendChild(c.element);
        });
        this.containerElement.appendChild(this.addBtn());
    }
    /**
     * コンテナの要素を取得する
     *
     * @returns コンテナの要素
     */
    get element() {
        this.containerElement = document.createElement("div");
        this.containerElement.classList.add("window");
        if (this.canEdit_)
            this.containerElement.classList.add("edit-mode");
        this.container_.forEach((c) => {
            if (this.canEdit_)
                this.addDeleteButton(this.containerElement, c);
            this.containerElement.appendChild(c.element);
        });
        if (this.canEdit_)
            this.containerElement.appendChild(this.addBtn());
        return this.containerElement;
    }
    /**
     * アイテムを取得する
     *
     * @returns アイテム
     */
    get items() {
        return this.container_;
    }
}
/**
 * タスクウィンドウをエクスポートする
 *
 * @param taskWindow タスクウィンドウ
 * @returns タスクウィンドウのエクスポートデータ
 */
function exportTaskWindow(taskWindow) {
    return "[" + taskWindow.items.map((container) => container.exportData).join(",") + "]";
}
function importTaskWindow(data, canEdit = false) {
    const parsedData = JSON.parse(data);
    const blocks = parsedData.map(container => {
        const BlockClass = containerItemList.find(item => item.name === container.class);
        if (!BlockClass)
            throw new Error(`Unknown block type: ${container.class}`);
        return new BlockClass(container.canEdit, container.content);
    });
    return new TaskWindow(canEdit, blocks);
}
