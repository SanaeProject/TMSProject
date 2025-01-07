abstract class Dialog{
    protected readonly element_: HTMLElement;

    constructor(){
        this.element_ = document.createElement("div");
        this.element_.classList.add("dialog");

        const wrapper = document.createElement("div");
        wrapper.classList.add("content-wrapper");
        this.element_.appendChild(wrapper);
    } 
    close(): void {
        this.element_.remove();
    }

    abstract show(): Promise<any>;
}

class ErrorDialog extends Dialog {
    private message: string;
    private title: string;

    constructor(message: string,title: string = "Error") {
        super();
        this.message = message;
        this.title = title;
        const wrapper      = this.element_.querySelector(".content-wrapper")!;
        const titleElement = document.createElement("h2");
        titleElement.textContent = this.title;
        titleElement.classList.add("title");

        wrapper.appendChild(titleElement);

        const messageElement = document.createElement("p");
        messageElement.textContent = this.message;
        messageElement.classList.add("error-message");
        wrapper.appendChild(messageElement);

        const closeButton = document.createElement("button");
        closeButton.textContent = "閉じる";
        closeButton.classList.add("close-button");
        closeButton.addEventListener("click", () => this.close());
        wrapper.appendChild(closeButton);
    }

    async show(): Promise<void> {
        document.body.appendChild(this.element_);
    }
}

class InputDialog extends Dialog {
    private message: string;
    private title: string;

    constructor(message: string,title: string = "Input") {
        super();
        this.message = message;
        this.title = title;
        const wrapper = this.element_.querySelector(".content-wrapper")!;
        const titleElement = document.createElement("h2");
        titleElement.textContent = this.title;
        titleElement.classList.add("title");
        wrapper.appendChild(titleElement);

        const messageElement = document.createElement("p");
        messageElement.textContent = this.message;
        wrapper.appendChild(messageElement);

        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.classList.add("input-field");
        wrapper.appendChild(inputField);

        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("button-wrapper");

        const confirmButton = document.createElement("button");
        confirmButton.textContent = "OK";
        confirmButton.classList.add("confirm-button");
        buttonWrapper.appendChild(confirmButton);

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-button");
        buttonWrapper.appendChild(cancelButton);

        wrapper.appendChild(buttonWrapper);

        confirmButton.addEventListener("click", () => {
            this.close();
            resolve(inputField.value);
        });

        cancelButton.addEventListener("click", () => {
            this.close();
            resolve(null);
        });

        let resolve: (value: string | null) => void;
        this.showPromise = new Promise<string | null>((res) => {
            resolve = res;
        });
    }

    private showPromise: Promise<string | null>;

    async show(): Promise<string | null> {
        document.body.appendChild(this.element_);
        return this.showPromise;
    }
}
class ConfirmDialog extends Dialog {
    private title: string;
    private message: string;
    private showPromise: Promise<boolean>;

    constructor(message: string,title: string = "Confirm") {
        super();
        this.message = message;
        this.title = title;

        const wrapper = this.element_.querySelector(".content-wrapper")!;
        const titleElement = document.createElement("h2");
        titleElement.textContent = this.title;
        titleElement.classList.add("title");
        wrapper.appendChild(titleElement);

        const messageElement = document.createElement("p");
        messageElement.textContent = this.message;
        wrapper.appendChild(messageElement);

        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("button-wrapper");

        const yesButton = document.createElement("button");
        yesButton.textContent = "Yes";
        yesButton.classList.add("yes-button");
        buttonWrapper.appendChild(yesButton);

        const noButton = document.createElement("button");
        noButton.textContent = "No";
        noButton.classList.add("no-button");
        buttonWrapper.appendChild(noButton);

        wrapper.appendChild(buttonWrapper);

        let resolve: (value: boolean) => void;
        this.showPromise = new Promise<boolean>((res) => {
            resolve = res;
        });

        yesButton.addEventListener("click", () => {
            this.close();
            resolve(true);
        });

        noButton.addEventListener("click", () => {
            this.close();
            resolve(false);
        });
    }

    async show(): Promise<boolean> {
        document.body.appendChild(this.element_);
        return this.showPromise;
    }
}

export { ErrorDialog, InputDialog, ConfirmDialog };