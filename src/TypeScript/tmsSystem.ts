abstract class Container {
    protected readonly canEdit_: boolean;
    protected readonly element_: HTMLElement;

    constructor(canEdit: boolean) {
        this.canEdit_ = canEdit;
        this.element_ = document.createElement("div");
        this.element_.classList.add("container");
    }

    createBtn(text: string, ...className: string[]): HTMLButtonElement {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.classList.add(...className);
        return btn;
    }

    createInputElement(type: string, value: string, ...className: string[]): HTMLInputElement | HTMLTextAreaElement {
        const element = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        if (type !== "textarea") (element as HTMLInputElement).type = type;
        element.value = value;
        element.classList.add(...className);
        return element;
    }

    createTextElement(tag: keyof HTMLElementTagNameMap, text: string, ...className: string[]): HTMLElement {
        const element = document.createElement(tag);
        element.textContent = text;
        element.classList.add(...className);
        return element;
    }

    get element(): HTMLElement {
        return this.element_;
    }

    abstract addElement(...args: any[]): void;
    abstract get exportData():string;
}

class TitleItem extends Container {
    constructor(canEdit: boolean, text: string) {
        super(canEdit);
        this.addElement(text);
        this.element_.classList.add("container-title");
    }

    addElement(title: string): void {
        const newElement = this.canEdit_
            ? this.createInputElement("text", title, "title")
            : this.createTextElement("h1", title, "title");
        this.element_.appendChild(newElement);
    }

    get exportData():string {
        return `{"class":"${this.constructor.name}","content":"${this.element_.textContent}"}`;
    }
}

class ContentItem extends Container {
    constructor(canEdit: boolean, text: string) {
        super(canEdit);
        this.addElement(text);
        this.element_.classList.add("container-content");
    }

    addElement(content: string): void {
        const newElement = this.canEdit_
            ? this.createInputElement("textarea", content, "content")
            : this.createTextElement("p", content, "content");
        this.element_.appendChild(newElement);
    }

    get exportData():string {
        const text = this.canEdit_?
        this.element_.querySelector<HTMLInputElement>("textarea")?.value
        : this.element_.querySelector<HTMLElement>("p")?.textContent;
        return `{"class":"${this.constructor.name}","content":"${text}"}`;
    }
}

class CheckListItem extends Container {
    constructor(canEdit: boolean, checkList: [string, boolean][]) {
        super(canEdit);
        this.addElement(checkList);
        this.element_.classList.add("container-checklist");

        if (canEdit) this.addEditButtons();
    }

    private addEditButtons(): void {
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

    private addCheckItem(): void {
        const input = window.prompt("追加するチェックリストの内容を入力してください。");
        if (input) {
            this.element_.insertBefore(this.createRow(input, false), this.element_.firstChild);
        }
    }

    private toggleDeleteMode(): void {
        const delBtn = this.element_.querySelector<HTMLButtonElement>(".del-btn");
        if (!delBtn) return;

        const isDeleteMode = delBtn.classList.toggle("delete-mode");

        if (isDeleteMode) {
            this.markItemsForDeletion();
        } else {
            if (confirm("削除しますか？")) this.removeMarkedItems();
        }
    }

    private removeMarkedItems(): void {
        Array.from(this.element_.children)
            .filter(child => child.classList.contains("marked-del"))
            .forEach(child => this.element_.removeChild(child));
    }

    private markItemsForDeletion(): void {
        Array.from(this.element_.children).forEach((child) => {
            const checkBox = child.querySelector<HTMLInputElement>(".check-box");
            if (checkBox) {
                if(checkBox.checked)
                    child.classList.add("marked-del");

                checkBox.onchange = () => {
                    child.classList.toggle("marked-del", checkBox.checked);
                };
            }
        });
    }

    private selectAll(): void {
        this.updateAllCheckboxes(true);
    }
    private unselectAll(): void {
        this.updateAllCheckboxes(false);
    }

    private updateAllCheckboxes(checked: boolean): void {
        Array.from(this.element_.children).forEach((child) => {
            const checkBox = child.querySelector<HTMLInputElement>(".check-box");

            if (checkBox){
                checkBox.checked = checked;
                this.updateCheckState(checkBox, child.querySelector<HTMLElement>(".check-text"));
            }
        });
    }

    private createRow(text: string, checked: boolean): HTMLElement {
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("check-row");

        const checkBox = this.createInputElement("checkbox", "", "check-box") as HTMLInputElement;
        const newText = this.canEdit_
            ? this.createInputElement("text", text, "check-text", "content")
            : this.createTextElement("p", text, "check-text", "content");

        checkBox.checked = checked;
        this.updateCheckState(checkBox, newText);

        checkBox.onchange = () => this.updateCheckState(checkBox, newText);

        rowContainer.append(checkBox, newText);
        return rowContainer;
    }

    addElement(checkList: [string, boolean][]): void {
        checkList.forEach(([text, checked]) => {
            this.element_.appendChild(this.createRow(text, checked));
        });
    }

    private updateCheckState(checkBox: HTMLInputElement, textElement: HTMLElement | null): void {
        if (textElement) {
            textElement.classList.toggle("checked", checkBox.checked);
        }
    }

    get exportData(): string {
        let list: string = "";
        let isFirst:boolean = true;
        
        this.element_.querySelectorAll(".check-row").forEach((row) => {
            const checkBox = row.querySelector<HTMLInputElement>(".check-box");
            const textElement = row.querySelector<HTMLElement>(".check-text");
            list   += `${isFirst ? "" : ","}["${this.canEdit_ ? (textElement as HTMLInputElement)?.value : textElement?.textContent}","${checkBox?.checked}"]`;
            isFirst = false;
        });
        return `{"class":"${this.constructor.name}","content":[${list}]}`;
    }
    
}

class LinkItem extends Container {
    constructor(canEdit: boolean, links: [string, string][]) {
        super(canEdit);
        this.addElement(...links);
        this.element_.classList.add("container-link");

        if (canEdit) this.addEditButtons();
    }

    private addEditButtons(): void {
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

    private toggleDeleteMode(): void {
        const delBtn = this.element_.querySelector<HTMLButtonElement>(".del-btn");
        if (!delBtn) return;

        if (delBtn.classList.contains("delete-mode")) {
            delBtn.classList.remove("delete-mode");
            this.removeCheckBox();
            if (confirm("削除しますか？")) this.removeMarkedItems();
        } else {
            delBtn.classList.add("delete-mode");
            this.addCheckBox();
        }
    }

    private addCheckBox(): void {
        Array.from(this.element_.children).forEach((child) => {
            if (!child.classList.contains("link")) return;

            const checkBox = this.createInputElement("checkbox", "", "check-box") as HTMLInputElement;

            checkBox.addEventListener("change", () => {
                child.classList.toggle("marked-del", checkBox.checked);
            });

            child.appendChild(checkBox);
        });
    }

    private removeCheckBox(): void {
        Array.from(this.element_.querySelectorAll(".check-box")).forEach((checkBox) => {
            checkBox.parentElement?.removeChild(checkBox);
        });
    }

    private removeMarkedItems(): void {
        Array.from(this.element_.querySelectorAll(".marked-del")).forEach((marked) => {
            this.element_.removeChild(marked);
        });
    }

    private createLink(link: string, text: string): HTMLElement {
        const linkElement = this.createTextElement("a", text, "link") as HTMLLinkElement;
        linkElement.href = link;
        return linkElement;
    }

    private addLink(): void {
        const input = window.prompt(
            "追加するリンクの内容を入力してください。表示名:リンク\n例: google,https://www.google.com/"
        );
        if (input) {
            let [text, link] = input.split(",");
            link = link || text; // 表示名のみの場合、リンクとして扱う

            // 正規表現でURLを検証
            const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
            if (urlPattern.test(link)) {
                this.element_.insertBefore(this.createLink(link, text), this.element_.firstChild);
            } else {
                alert("リンクが不正です。");
            }
        }
    }

    addElement(...links: [string, string][]): void {
        links.forEach(([link, text]) => {
            this.element_.appendChild(this.createLink(link, text));
        });
    }

    get exportData(): string {
        let list: string = "";
        let isFirst:boolean = true;
        this.element_.querySelectorAll(".link").forEach((link) => {
            list += `${isFirst ? "" : ","}["${link.textContent}","${(link as HTMLLinkElement)?.href}"]`;
            isFirst = false;
        });
        return `{"class":"${this.constructor.name}","content":[${list}]}`;
    }    
}

class TaskWindow {
    private readonly containers_: Container[];

    constructor(containers: Container[] = []) {
        this.containers_ = containers;
    }

    addContainer(container: Container): void {
        this.containers.push(container);
    }

    get element(): HTMLElement {
        const container = document.createElement("div");
        container.classList.add("window");
        this.containers_.forEach((c) => container.appendChild(c.element));
        return container;
    }
    get containers(): Container[] {
        return this.containers_;
    }
}

function exportTaskWindow(taskWindow: TaskWindow): string {
    const data = "["+taskWindow.containers.map((container) => container.exportData).join(",")+"]";
    console.log(data);
    return JSON.parse(data);
}