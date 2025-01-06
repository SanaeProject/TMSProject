"use strict";
class Container {
    constructor(canEdit) {
        this.canEdit_ = canEdit;
        this.element_ = document.createElement("div");
        this.element_.classList.add("container");
    }
    createBtn(text, ...className) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.classList.add(...className);
        return btn;
    }
    createInputElement(type, value, ...className) {
        const element = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        if (type !== "textarea")
            element.type = type;
        element.value = value;
        element.classList.add(...className);
        return element;
    }
    createTextElement(tag, text, ...className) {
        const element = document.createElement(tag);
        element.textContent = text;
        element.classList.add(...className);
        return element;
    }
    get element() {
        return this.element_;
    }
}
class TitleItem extends Container {
    constructor(canEdit, text) {
        super(canEdit);
        this.addElement(text);
        this.element_.classList.add("container-title");
    }
    addElement(title) {
        const newElement = this.canEdit_
            ? this.createInputElement("text", title, "title")
            : this.createTextElement("h1", title, "title");
        this.element_.appendChild(newElement);
    }
    get exportData() {
        return `{"class":"${this.constructor.name}","content":"${this.element_.textContent}"}`;
    }
}
class ContentItem extends Container {
    constructor(canEdit, text) {
        super(canEdit);
        this.addElement(text);
        this.element_.classList.add("container-content");
    }
    addElement(content) {
        const newElement = this.canEdit_
            ? this.createInputElement("textarea", content, "content")
            : this.createTextElement("p", content, "content");
        this.element_.appendChild(newElement);
    }
    get exportData() {
        var _a, _b;
        const text = this.canEdit_ ?
            (_a = this.element_.querySelector("textarea")) === null || _a === void 0 ? void 0 : _a.value
            : (_b = this.element_.querySelector("p")) === null || _b === void 0 ? void 0 : _b.textContent;
        return `{"class":"${this.constructor.name}","content":"${text}"}`;
    }
}
class CheckListItem extends Container {
    constructor(canEdit, checkList) {
        super(canEdit);
        this.addElement(checkList);
        this.element_.classList.add("container-checklist");
        if (canEdit)
            this.addEditButtons();
    }
    addEditButtons() {
        const buttons = [
            { text: "追加", classes: ["edit-btn", "add-btn"], action: this.addCheckItem.bind(this) },
            { text: "削除", classes: ["edit-btn", "del-btn"], action: this.toggleDeleteMode.bind(this) },
            { text: "全選択", classes: ["edit-btn", "all-select-btn"], action: this.selectAll.bind(this) },
            { text: "選択解除", classes: ["edit-btn", "all-unselect-btn"], action: this.unselectAll.bind(this) }
        ];
        buttons.forEach(({ text, classes, action }) => {
            const btn = this.createBtn(text, ...classes);
            btn.addEventListener("click", action);
            this.element_.appendChild(btn);
        });
    }
    addCheckItem() {
        const input = window.prompt("追加するチェックリストの内容を入力してください。");
        if (input) {
            this.element_.insertBefore(this.createRow(input, false), this.element_.firstChild);
        }
    }
    toggleDeleteMode() {
        const delBtn = this.element_.querySelector(".del-btn");
        if (!delBtn)
            return;
        const isDeleteMode = delBtn.classList.toggle("delete-mode");
        if (isDeleteMode) {
            this.markItemsForDeletion();
        }
        else {
            if (confirm("削除しますか？"))
                this.removeMarkedItems();
        }
    }
    removeMarkedItems() {
        Array.from(this.element_.children)
            .filter(child => child.classList.contains("marked-del"))
            .forEach(child => this.element_.removeChild(child));
    }
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
    selectAll() {
        this.updateAllCheckboxes(true);
    }
    unselectAll() {
        this.updateAllCheckboxes(false);
    }
    updateAllCheckboxes(checked) {
        Array.from(this.element_.children).forEach((child) => {
            const checkBox = child.querySelector(".check-box");
            if (checkBox) {
                checkBox.checked = checked;
                this.updateCheckState(checkBox, child.querySelector(".check-text"));
            }
        });
    }
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
    updateCheckState(checkBox, textElement) {
        if (textElement) {
            textElement.classList.toggle("checked", checkBox.checked);
        }
    }
    get exportData() {
        let list = "";
        let isFirst = true;
        this.element_.querySelectorAll(".check-row").forEach((row) => {
            const checkBox = row.querySelector(".check-box");
            const textElement = row.querySelector(".check-text");
            list += `${isFirst ? "" : ","}["${this.canEdit_ ? textElement === null || textElement === void 0 ? void 0 : textElement.value : textElement === null || textElement === void 0 ? void 0 : textElement.textContent}","${checkBox === null || checkBox === void 0 ? void 0 : checkBox.checked}"]`;
            isFirst = false;
        });
        return `{"class":"${this.constructor.name}","content":[${list}]}`;
    }
}
class LinkItem extends Container {
    constructor(canEdit, links) {
        super(canEdit);
        this.addElement(...links);
        this.element_.classList.add("container-link");
        if (canEdit)
            this.addEditButtons();
    }
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
    removeCheckBox() {
        Array.from(this.element_.querySelectorAll(".check-box")).forEach((checkBox) => {
            var _a;
            (_a = checkBox.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(checkBox);
        });
    }
    removeMarkedItems() {
        Array.from(this.element_.querySelectorAll(".marked-del")).forEach((marked) => {
            this.element_.removeChild(marked);
        });
    }
    createLink(link, text) {
        const linkElement = this.createTextElement("a", text, "link");
        linkElement.href = link;
        return linkElement;
    }
    addLink() {
        const input = window.prompt("追加するリンクの内容を入力してください。表示名:リンク\n例: google,https://www.google.com/");
        if (input) {
            let [text, link] = input.split(",");
            link = link || text; // 表示名のみの場合、リンクとして扱う
            // 正規表現でURLを検証
            const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
            if (urlPattern.test(link)) {
                this.element_.insertBefore(this.createLink(link, text), this.element_.firstChild);
            }
            else {
                alert("リンクが不正です。");
            }
        }
    }
    addElement(...links) {
        links.forEach(([link, text]) => {
            this.element_.appendChild(this.createLink(link, text));
        });
    }
    get exportData() {
        let list = "";
        let isFirst = true;
        this.element_.querySelectorAll(".link").forEach((link) => {
            list += `${isFirst ? "" : ","}["${link.textContent}","${link === null || link === void 0 ? void 0 : link.href}"]`;
            isFirst = false;
        });
        return `{"class":"${this.constructor.name}","content":[${list}]}`;
    }
}
class TaskWindow {
    constructor(containers = []) {
        this.containers_ = containers;
    }
    addContainer(container) {
        this.containers.push(container);
    }
    get element() {
        const container = document.createElement("div");
        container.classList.add("window");
        this.containers_.forEach((c) => container.appendChild(c.element));
        return container;
    }
    get containers() {
        return this.containers_;
    }
}
function exportTaskWindow(taskWindow) {
    const data = "[" + taskWindow.containers.map((container) => container.exportData).join(",") + "]";
    console.log(data);
    return JSON.parse(data);
}
