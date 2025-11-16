"use strict";
// main.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class RobotMaxDemo {
    constructor(root) {
        this.animationState = "idle";
        this.lottieInstance = null;
        this.panelOpened = false;
        this.root = root;
        this.root.classList.add("robot-max-root");
        this.buildDom();
        this.attachHandlers();
        this.mount();
        // лениво грузим анимацию
        this.loadAnimation().catch((err) => {
            console.error("Robot Max animation load error:", err);
            this.setAnimationState("error");
        });
    }
    buildDom() {
        // Панель
        this.panelEl = document.createElement("div");
        this.panelEl.className = "robot-max-panel";
        const header = document.createElement("div");
        header.className = "robot-max-panel__header";
        const avatar = document.createElement("div");
        avatar.className = "robot-max-panel__avatar";
        const avatarInner = document.createElement("div");
        avatarInner.className = "robot-max-panel__avatar-inner";
        avatar.appendChild(avatarInner);
        const titles = document.createElement("div");
        const title = document.createElement("div");
        title.className = "robot-max-panel__title";
        title.textContent = "Робот Макс";
        const subtitle = document.createElement("div");
        subtitle.className = "robot-max-panel__subtitle";
        subtitle.textContent = "Помощник на Госуслугах (демо)";
        titles.appendChild(title);
        titles.appendChild(subtitle);
        header.appendChild(avatar);
        header.appendChild(titles);
        const body = document.createElement("div");
        body.className = "robot-max-panel__body";
        const bubble = document.createElement("div");
        bubble.className = "robot-max-panel__bubble";
        bubble.textContent =
            "Это чистый демо-виджет. Здесь можно воспроизводить ту же анимацию, что и на Госуслугах, но в своём окружении.";
        body.appendChild(bubble);
        const footer = document.createElement("div");
        footer.className = "robot-max-panel__footer";
        const btnClose = document.createElement("button");
        btnClose.className = "robot-max-panel__button";
        btnClose.type = "button";
        btnClose.textContent = "Свернуть";
        btnClose.addEventListener("click", () => this.closePanel());
        const btnAction = document.createElement("button");
        btnAction.className =
            "robot-max-panel__button robot-max-panel__button--primary";
        btnAction.type = "button";
        btnAction.textContent = "Спросить Макса";
        btnAction.addEventListener("click", () => {
            // тут можно повесить свою логику чата
            alert("Тут будет логика общения с Роботом Максом :)");
        });
        footer.appendChild(btnClose);
        footer.appendChild(btnAction);
        this.panelEl.appendChild(header);
        this.panelEl.appendChild(body);
        this.panelEl.appendChild(footer);
        // Кнопка-триггер с роботом
        this.toggleButton = document.createElement("button");
        this.toggleButton.className = "robot-max-toggle";
        this.toggleButton.type = "button";
        this.toggleButton.setAttribute("aria-label", "Открыть Робота Макса");
        const badge = document.createElement("div");
        badge.className = "robot-max-toggle__badge";
        badge.textContent = "1";
        const animWrapper = document.createElement("div");
        animWrapper.className = "robot-max-animation-container";
        this.animationContainer = document.createElement("div");
        this.animationContainer.className = "robot-max-animation-inner";
        this.skeletonEl = document.createElement("div");
        this.skeletonEl.className = "robot-max-skeleton";
        animWrapper.appendChild(this.animationContainer);
        animWrapper.appendChild(this.skeletonEl);
        this.toggleButton.appendChild(animWrapper);
        this.toggleButton.appendChild(badge);
        // Добавляем в root
        this.root.appendChild(this.panelEl);
        this.root.appendChild(this.toggleButton);
    }
    attachHandlers() {
        this.toggleButton.addEventListener("click", () => {
            if (this.panelOpened) {
                this.closePanel();
            }
            else {
                this.openPanel();
            }
        });
        // простой обработчик клика вне панели
        document.addEventListener("click", (event) => {
            if (!this.panelOpened)
                return;
            const target = event.target;
            if (!this.root.contains(target)) {
                this.closePanel();
            }
        });
    }
    mount() {
        // Лёгкая анимация появления
        window.requestAnimationFrame(() => {
            this.root.classList.add("robot-max-root--mounted");
        });
    }
    openPanel() {
        this.panelOpened = true;
        this.panelEl.classList.add("robot-max-panel--opened");
        if (this.lottieInstance && this.animationState === "ready") {
            this.lottieInstance.play();
        }
    }
    closePanel() {
        this.panelOpened = false;
        this.panelEl.classList.remove("robot-max-panel--opened");
        if (this.lottieInstance && this.animationState === "ready") {
            // можно остановить или оставить в loop
            this.lottieInstance.stop();
        }
    }
    setAnimationState(state) {
        this.animationState = state;
        if (state === "ready" || state === "error") {
            this.skeletonEl.style.opacity = "0";
            this.skeletonEl.style.pointerEvents = "none";
        }
        else {
            this.skeletonEl.style.opacity = "1";
            this.skeletonEl.style.pointerEvents = "auto";
        }
    }
    loadAnimation() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!("fetch" in window)) {
                throw new Error("fetch is not available in this environment");
            }
            this.setAnimationState("loading");
            // Здесь ожидается твой файл Json анимации
            const response = yield fetch("./robot-max-animation.json");
            if (!response.ok) {
                throw new Error(`Failed to load robot-max-animation.json: ${response.status}`);
            }
            const animationData = yield response.json();
            this.lottieInstance = lottie.loadAnimation({
                container: this.animationContainer, // div, внутри появится canvas
                renderer: "canvas",
                loop: true,
                autoplay: true,
                animationData,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid meet",
                    clearCanvas: true,
                },
            });
            this.lottieInstance.addEventListener("DOMLoaded", () => {
                this.setAnimationState("ready");
            });
            this.lottieInstance.addEventListener("data_failed", () => {
                this.setAnimationState("error");
            });
        });
    }
}
// Инициализация после загрузки DOM
window.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("robot-max-root");
    if (!root) {
        console.error("#robot-max-root not found");
        return;
    }
    new RobotMaxDemo(root);
});
