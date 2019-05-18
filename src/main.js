import {html} from 'lit-html';
// TODO Add language selector, language files
import {__} from './i18n';
import {Page, inputField, checkField} from './Page';
import './main.css';

class WelcomePage extends Page {
  // Root Page contains schema for entire flow
  schema = {
    amount(value) {
      if(typeof value === 'number')
        value = value.toString();

      // TODO Support comma as decimal point
      if(typeof value !== 'string' || !value.match(/^\d{1,6}(\.\d{0,2})?$/))
        throw new Error(__`Invalid amount`);

      if(parseFloat(value) < 5)
        throw new Error(__`Minimum amount is $5`);

      // Always show as 2 decimal places
      const decimalPos = value.indexOf('.');
      if(decimalPos === value.length - 2)
        value = value + '0';

      return value;
    },
    isGift(value) {
      return !!value;
    },
    giftName(value) {
      if(!value)
        throw new Error(__`Name is required`);
      if(value.length > 20)
        throw new Error(__`Cannot be more than 20 characters`);

      return value;
    }
  }
  nextPage() {
    new DonationPage({
      parent: this.parent
    });
  }
  template() {
    return html`
      <h1>${__`Make a donation!`}</h1>
      <p>${__`We would appreciate it a lot. Thanks`}</p>
      <nav>
        <button @click=${this.nextPage.bind(this)}>${__`Next`}</button>
      </nav>
    `;
  }
}

class DonationPage extends Page {
  nextPage(event) {
    event.preventDefault();
    if(!this.validateForm())
      return;

    if(this.parent.data.isGift) {
      new GiftPage({
        parent: this.parent
      });
    } else {
      new CompletionPage({
        parent: this.parent
      });
    }
  }
  prevPage() {
    this.saveForm();
    new WelcomePage({
      parent: this.parent
    });
  }
  template() {
    return html`
      <form @submit=${this.nextPage.bind(this)}>
        <h1>${__`How much would you like to donate?`}</h1>
        ${this.parent.showGiftOption ? checkField.call(this, 'isGift', __`This donation is a gift`) : ''}
        ${inputField.call(this, 'amount', __`Amount`)}
        <nav>
          <button type="button" @click=${this.prevPage.bind(this)}>${__`Previous`}</button>
          <button type="submit">${__`Next`}</button>
        </nav>
      </form>
    `;
  }
}

class GiftPage extends Page {
  nextPage(event) {
    event.preventDefault();
    if(!this.validateForm())
      return;

    new CompletionPage({
      parent: this.parent
    });
  }
  prevPage() {
    this.saveForm();
    new DonationPage({
      parent: this.parent
    });
  }
  template() {
    return html`
      <form @submit=${this.nextPage.bind(this)}>
        <h1>${__`Who for would you like to give this donation?`}</h1>
        ${inputField.call(this, 'giftName', __`Name`)}
        <nav>
          <button type="button" @click=${this.prevPage.bind(this)}>${__`Previous`}</button>
          <button type="submit">${__`Next`}</button>
        </nav>
      </form>
    `;
  }
}

class CompletionPage extends Page {
  template() {
    return html`
      <h1>${__`Thanks for the donation!`}</h1>
      ${ this.parent.data.isGift
        ? html`<p>${__`You gave $${this.parent.data.amount} for ${this.parent.data.giftName}.`}</p>`
        : html`<p>${__`You gave $${this.parent.data.amount}.`}</p>`}
    `;
  }
}

new WelcomePage({
  el: document.body,
  showGiftOption: true,
  data: {
    // Set initial values
    amount: '',
    isGift: false,
    giftName: '',
  }
});
