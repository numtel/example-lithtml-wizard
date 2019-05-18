import {html, render} from 'lit-html';
import {classMap} from 'lit-html/directives/class-map.js';

export class Page {
  constructor(settings) {
    Object.assign(this, settings);

    // Root is its own parent
    this.parent = this.parent || this;
    this.formError = {};

    this.render();
  }
  render() {
    render(this.template(), this.parent.el);

    const errorKeys = Object.keys(this.parent.formError);
    const actionSelector = errorKeys.length
      ? `input[name="${errorKeys[0]}"],select[name="${errorKeys[0]}"]`
      : 'input,select,button';
    const firstAction = this.parent.el.querySelector(actionSelector)
    firstAction && firstAction.focus();
  }
  formFields() {
    const fields = {};
    this.parent.el.querySelectorAll('input,select').forEach(field => {
      switch(field.type) {
        case 'checkbox':
        case 'radio':
          fields[field.name] = field.checked;
          break;
        default:
          fields[field.name] = field.value;
      }
    });
    return fields;
  }
  saveForm() {
    Object.assign(this.parent.data, this.formFields());
  }
  validateForm() {
    const fields = this.formFields();
    let thisKey;
    try {
      Object.assign(this.parent.data, Object.keys(fields).reduce((out, key) => {
        thisKey = key;
        out[key] = key in this.parent.schema
          ? this.parent.schema[key].call(this, fields[key])
          : fields[key];
        return out;
      }, {}));
    } catch(error) {
      this.parent.formError = { [thisKey]: error };
      this.render();
      return false;
    }
    this.parent.formError = {};
    this.render();
    return true;
  }
}

export function inputField(key, label) {
  return html`
    <label data-key=${key} class=${classMap({
      error: key in this.parent.formError
    })}>
      <span class="label">${label}</span>
      <span class="field">
        <input name=${key} value=${this.parent.data[key]}>
      </span>
      ${ key in this.parent.formError ? html`
        <span class="error">${this.parent.formError[key].message}</span>
      ` : ''}
    </label>
  `;
}

export function checkField(key, label) {
  return html`
    <label data-key=${key} class=${classMap({
      error: key in this.parent.formError
    })}>
      <span class="field">
        <input type="checkbox" name=${key} ?checked=${this.parent.data[key]}>
      </span>
      <span class="label">${label}</span>
      ${ key in this.parent.formError ? html`
        <span class="error">${this.parent.formError[key].message}</span>
      ` : ''}
    </label>
  `;
}
