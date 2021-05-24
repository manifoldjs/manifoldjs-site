import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ModalCloseEvent } from '../utils/interfaces';
import { smallBreakPoint } from '../utils/css/breakpoints';

//@ts-ignore
import ModalStyles from '../../../styles/modal-styles.css';

@customElement('app-modal')
export class AppModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) title = '';
  @property({ type: String }) body = '';
  @property({ type: String }) modalId = '';

  modalAni: Animation | undefined = undefined;
  backgroundAni: Animation | undefined = undefined;

  static get styles() {
    return [
      ModalStyles,
      css`
        #background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          backdrop-filter: blur(10px);
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;

          z-index: 3;
        }

        #modal {
          background: white;
          margin: 51px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding-left: 16px;
          padding-right: 16px;
          padding-bottom: 45px;
          border-radius: 8px;
          box-shadow: 0px 16px 24px rgba(0, 0, 0, 0.12);

          z-index: 4;
        }

        #modal-header #title {
          display: block;
          width: 100%;
          text-align: center;
          font-weight: bold;
          font-size: var(--medium-font-size);
          line-height: 28px;
        }

        #modal-body {
          text-align: center;
        }

        #modal-body p {
          font-weight: 300;
          font-size: 14px;
          line-height: 20px;
          color: var(--secondary-font-color);
        }

        #modal-form {
          padding: 14px;
          width: 100%;
        }

        #back-button-block {
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }

        #back-button-block fast-button {
          margin-top: 12px;
          background: none;
        }

        #back-button-block fast-button ion-icon {
          height: 2em;
          width: 2em;
          color: #c2c9d1;
        }
      `,
      smallBreakPoint(css`
        #modal {
          margin: 0px;
          padding: 0px;
          width: 100vw !important;
          height: 100vh;
        }

        #modal-form {
          height: 100%;
        }

        #back-button-block {
          position: fixed;
          top: 0;
        }
      `),
    ];
  }

  constructor() {
    super();

    this.addEventListener('scroll', (e: Event) => {
      console.log('scroll', e);
    });
  }

  firstUpdated() {
    const modalEl = this.shadowRoot?.querySelector('#modal');
    const backgroundEl = this.shadowRoot?.querySelector('#background');

    if (modalEl) {
      this.modalAni = modalEl.animate(
        [
          { transform: 'translateY(10px)', opacity: 0 },
          {
            transform: 'translateY(0)',
            opacity: 1,
          },
        ],
        {
          duration: 280,
          easing: 'ease-in-out',
        }
      );
    }

    if (backgroundEl) {
      this.backgroundAni = backgroundEl.animate(
        [
          {
            opacity: 0,
          },
          {
            opacity: 1,
          },
        ],
        {
          duration: 280,
          easing: 'ease-in-out',
        }
      );
    }
  }

  async close() {
    if (this.modalAni && this.backgroundAni) {
      this.modalAni.reverse();
      this.backgroundAni.reverse();

      await this.modalAni.finished;
      await this.backgroundAni.finished;

      this.open = false;
    } else {
      // Should never really end up here
      // but just in case close modal without animation
      this.open = false;
    }

    this.dispatchEvent(
      new CustomEvent<ModalCloseEvent>('app-modal-close', {
        detail: {
          modalId: this.modalId,
        },
        composed: true,
        bubbles: true,
      })
    );
  }

  render() {
    if (this.open) {
      return html`
        <div id="background">
          <div part="modal-layout" id="modal">
            <div id="back-button-block">
              <fast-button @click="${() => this.close()}" appearance="stealth">
                <ion-icon name="close"></ion-icon>
              </fast-button>
            </div>

            <slot id="modal-image" name="modal-image"></slot>

            <section id="modal-header">
              <span id="title">${this.title}</span>
            </section>

            <section id="modal-body" part="modal-body">
              <p>${this.body}</p>
            </section>

            <slot id="modal-form" name="modal-form"></slot>

            <slot class="modal-actions" name="modal-actions"></slot>
          </div>
        </div>
      `;
    } else {
      return null;
    }
  }
}
