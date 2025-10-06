/** Accordion Item */
const accordionItemTemplate = document.createElement("template");
accordionItemTemplate.innerHTML = `
    <style>
        .accordion-item-title {
            padding: 12px; 
            background-color: #f5f5f5; 
            border: 1px solid; 
            margin: -1px;
        }
        .accordion-item-content {
            padding: 12px; 
            background-color: #ffffff; 
            // border: 1px solid; 
            margin: -1px;
            display: none;
        }
        .accordion-item-title .icon { 
            display: inline-block; 
            margin-right: 8px; 
            transition: transform 0.5s ease; 
        }
        .accordion-item-title .icon.open { 
            transform: rotate(90deg); 
        }
        .accordion-item-content.open {
            display: block;
        }     
    </style>
    <div class='accordion-item'>
        <div class='accordion-item-title' tabindex="0" role="button" aria-expanded="false">
            <span class="icon">➤</span><slot name="title"></slot>
        </div>
        <div class='accordion-item-content' role="region">
        <slot name="content"></slot>
        </div>
    </div>
`;

class AccordionItem extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(accordionItemTemplate.content.cloneNode(true));

        this.titleEl = this.shadowRoot.querySelector(".accordion-item-title");
        this.contentEl = this.shadowRoot.querySelector(".accordion-item-content");
        this.iconEl = this.shadowRoot.querySelector(".accordion-item .icon");

        // Generate unique ID for aria-controls
        const titleId = generateAriaId("accordion-title");
        this.titleEl.id = titleId;

        const contentId = generateAriaId("accordion-content");
        this.contentEl.id = contentId;
        this.titleEl.setAttribute("aria-controls", contentId);
        this.contentEl.setAttribute('aria-labelledby', titleId);
    }

    connectedCallback() {
        this.titleEl.addEventListener("click", this.handleClick.bind(this));
        this.titleEl.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.toggle();
        }
    }

    handleClick() {
        this.toggle();
    }

    toggle() {
        const isOpen = this.contentEl.classList.contains("open");
        if (isOpen) {
            this.contentEl.classList.remove("open");
            this.iconEl.classList.remove("open");
            this.titleEl.setAttribute("aria-expanded", "false");
        } else {
            this.contentEl.classList.add("open");
            this.iconEl.classList.add("open");
            this.titleEl.setAttribute("aria-expanded", "true");
        }
        this.dispatchEvent(new CustomEvent("handleItemClick", {
            composed: false,
            bubbles: true,
            detail: { item: this, open: !isOpen }
        }))
    }

    close() {
        this.contentEl.classList.remove("open");
        this.iconEl.classList.remove("open");
    }

    disconnectedCallback() {
        this.titleEl.removeEventListener("click", this.handleClick);
    }
}

/** Accordion */
const accordionTemplate = document.createElement("template");
accordionTemplate.innerHTML = `
    <style>
        .accordion {
            border: 1px solid;
            overflow:hidden;
            border-radius: 4px;
        }
    </style>
    <div class="accordion" role="presentation">
         <slot></slot>
    </div>
`;

class CustomAccordion extends HTMLElement {

    static observedAttributes = ['accordion'];

    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(accordionTemplate.content.cloneNode(true));

        this._handleItemClick = this.handeItemClick.bind(this);
        this.handleFocusIn = this.handleFocusIn.bind(this);
        this.handleFocusOut = this.handleFocusOut.bind(this);
    }

    connectedCallback() {
        this.addEventListener('focusin', this.handleFocusIn);
        this.addEventListener('focusout', this.handleFocusOut);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'accordion' && this.hasAttribute("accordion")) {
            this.shadowRoot.addEventListener("handleItemClick", this._handleItemClick);
        } else {
            this.shadowRoot.removeEventListener("handleItemClick", this._handleItemClick);
        }
    }

    handeItemClick(event) {
        const clickedItem = event.detail.item;
        const items = this.querySelectorAll("accordion-item");
        items.forEach((item) => {
            if (item !== clickedItem) item.close();
        });
    }

    diconnectedCallback() {
        if (this._handleItemClick) {
            this.shadowRoot.removeEventListener("handleItemClick", this.handeItemClick)
        }
        this.removeEventListener('focusin', this.handleFocusIn);
        this.removeEventListener('focusout', this.handleFocusOut);
    }

    handleFocusIn() {
        const accordion = this.shadowRoot.querySelector('.accordion');
        accordion.style.border = '2px solid blue';
        accordion.style.boxShadow = '0 0 0 2px rgba(0, 0, 255, 0.3)';
    }

    handleFocusOut() {
        const accordion = this.shadowRoot.querySelector('.accordion');
        accordion.style.border = '1px solid #000';
        accordion.style.boxShadow = '';
    }
}

customElements.define("accordion-item", AccordionItem);
customElements.define("custom-accordion", CustomAccordion);
