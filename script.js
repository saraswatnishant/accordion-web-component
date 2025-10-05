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
            border: 1px solid; 
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
        <div class='accordion-item-title'>
            <span class="icon">➤</span><slot name="title"></slot>
        </div>
        <div class='accordion-item-content'>
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
    }

    connectedCallback() {
        this.titleEl.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(event) {
        const isOpen = this.contentEl.classList.contains("open");
        this.contentEl.classList.toggle("open");
        this.iconEl.classList.toggle("open");
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
    <div class="accordion">
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
    }

    connectedCallback() {

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
    }
}

customElements.define("accordion-item", AccordionItem);
customElements.define("custom-accordion", CustomAccordion);
