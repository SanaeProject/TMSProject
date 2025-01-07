"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmDialog = exports.InputDialog = exports.ErrorDialog = void 0;
class Dialog {
    constructor() {
        this.element_ = document.createElement("div");
        this.element_.classList.add("dialog");
        const wrapper = document.createElement("div");
        wrapper.classList.add("content-wrapper");
        this.element_.appendChild(wrapper);
    }
    close() {
        this.element_.remove();
    }
}
class ErrorDialog extends Dialog {
    constructor(message, title = "Error") {
        super();
        this.message = message;
        this.title = title;
        const wrapper = this.element_.querySelector(".content-wrapper");
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
    async show() {
        document.body.appendChild(this.element_);
    }
}
exports.ErrorDialog = ErrorDialog;
class InputDialog extends Dialog {
    constructor(message, title = "Input") {
        super();
        this.message = message;
        this.title = title;
        const wrapper = this.element_.querySelector(".content-wrapper");
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
        let resolve;
        this.showPromise = new Promise((res) => {
            resolve = res;
        });
    }
    async show() {
        document.body.appendChild(this.element_);
        return this.showPromise;
    }
}
exports.InputDialog = InputDialog;
class ConfirmDialog extends Dialog {
    constructor(message, title = "Confirm") {
        super();
        this.message = message;
        this.title = title;
        const wrapper = this.element_.querySelector(".content-wrapper");
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
        let resolve;
        this.showPromise = new Promise((res) => {
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
    async show() {
        document.body.appendChild(this.element_);
        return this.showPromise;
    }
}
exports.ConfirmDialog = ConfirmDialog;
