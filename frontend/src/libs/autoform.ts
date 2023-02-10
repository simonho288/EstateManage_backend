/**
 * AutoForm: Auto generate HTML form for record edit or add new.
 * Usage:
 * 1. Create the AutoForm
 *  autoform = new AutoForm({
 *    mode: mode,
 *    defaultValue: record, // Current record data or default values
 *    callerThis: this,
 *    fields: [{
 *      name: 'name',
 *      type: 'text',
 *      label: '<Field Label>',
 *      isRequired: true,
 *      placeholder: '<Text to be displayed in textbox>',
 *    }, ...for more info, see below 'Options'
 * 2. Build the HTML markup for rendering
 *  html = autoform.buildHtml()
 * 3. Render the markup into the element
 *  $('<element>').html(html)
 * 4. Setup the events to start operation
 *  autoform.setupEvents()
 * 5. Before save, validate the form
 *  if (autoform.validate()) {
 *    values = autoform.getSubmittedValues()
 *    moreErrs = getAdditonalCheckingError(values)
 *    if (moreErrs) {
 *      autoform.setError(moreErrs)
 *    } else {
 *      autoform.setLoading(true)
 *      save the values
 *      autoform.setLoading(false)
 *    }
 */

import Quill from "quill"
Quill.register(['toolbar'])

import { Ajax } from "./ajax"
import { Util } from "./util"
import { AutoList } from "./autolist"

export enum FormMode { New, Edit }

type InputIcon = {
  cls: string // e.g. 'left icon'
  icon: string // e.g. 'user' or 'lock'
}

type DropdownOptions = {
  text: string
  value: string
}

type CheckboxOptions = {
  text: string
  value: string
  defaultValue?: any
}

type HtmlEditOptions = {
  _quill?: Quill
}

type ImageMeta = {
  className: string
  width: number
  height: number
  jpegQuality: number
  _isChanged?: boolean
}

type PdfMeta = {
  maxFileSize: number
  _isChanged?: boolean
}

type ValidationRule = {
  type: string, // SemanticUI validation type e.g. empty,email,length[6]
  prompt: string, // Details: https://fomantic-ui.com/behaviors/form.html
  value?: string,
}

// Various of fields definition

export interface ITextField {
  type: 'text'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface IPasswordField {
  type: 'password'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface ITextareaField {
  type: 'textarea'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface IImageField {
  type: 'image'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  imageMeta?: ImageMeta
  validationRules?: ValidationRule[]
}

export interface IDropdownField {
  type: 'dropdown'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  dropdownOptions: DropdownOptions[]
  validationRules?: ValidationRule[]
}

export interface ICurrencyField {
  type: 'currency'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface ITimeField {
  type: 'time'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface IIntegerField {
  type: 'integer'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface IEmailField {
  type: 'email'
  name: string
  label?: string
  placeholder?: string
  icon?: InputIcon
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface ICheckboxesField {
  type: 'checkboxes'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  checkboxOptions?: CheckboxOptions[]
}

export interface ICheckboxField {
  type: 'checkbox'
  label?: string
  popup?: string
  name: string
  isRequired?: boolean
  isEditable?: boolean
}

export interface IDateField {
  type: 'date'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

export interface IPdfField {
  type: 'pdf'
  label?: string
  placeholder?: string
  icon?: InputIcon
  name: string
  isRequired?: boolean
  isEditable?: boolean
  pdfMeta?: PdfMeta
  validationRules?: ValidationRule[]
}

export interface IAutolistField {
  type: 'autolist'
  label?: string
  placeholder?: string
  name: string
  autolist: AutoList
  isEditable?: boolean
}

export interface IHtmleditField {
  type: 'htmledit'
  label?: string
  placeholder?: string
  name: string
  editOptions: HtmlEditOptions
  isRequired?: boolean
  isEditable?: boolean
  validationRules?: ValidationRule[]
}

type Field = ITextField | IPasswordField | ITextareaField | IImageField | IDropdownField | ICurrencyField | ITimeField | IIntegerField | IEmailField | ICheckboxesField | ICheckboxField | IDateField | IPdfField | IAutolistField | IHtmleditField

type SubmitButton = {
  text: string
  cls?: string // e.g. 'fluid'
}

type SubmitFunction = (e: Event) => void
type CancelFunction = (e: Event) => void
type ClickFunction = (e: Event) => void


// Form options for creation
type Options = {
  name: string
  mode: FormMode
  fields: Field[]
  formCls?: string // e.g. 'large'
  submitBtn?: SubmitButton // useful only for Login like form (has Submit btn itself)
  onSubmit: SubmitFunction
  onCancel?: CancelFunction
  defaultValue?: object
  callerThis: any
  extras?: {
    buttons: Array<{
      id: string,
      text: string,
      onClick: ClickFunction,
      cls: string,
    }>
  }
}

export class AutoForm {
  _options: Options
  _el: JQuery<HTMLElement>

  public get mode(): FormMode {
    return this._options.mode
  }

  public constructor(opts: Options) {
    console.log('AutoForm::constructor()')

    if (opts.fields.length === 0) throw new Error('Fields not defined')

    let fieldnames = opts.fields.map(e1 => e1.name)
    let result = fieldnames.filter((el, idx) => fieldnames.indexOf(el) !== idx)
    if (result.length > 0) throw new Error(`Duplicated fields found: ${result[0]}`)

    opts.fields.forEach(f => {
      f.isEditable = f.isEditable === false ? false : true
    })

    if (opts.submitBtn == null) {
      opts.submitBtn = { text: 'Save' }
    }

    this._options = opts
  }

  public buildHtml(): string {
    console.log('AutoForm::buildHtml()')

    let mkup = []
    this.buildMkupHead(mkup)

    for (let i = 0; i < this._options.fields.length; ++i) {
      let fld: Field = this._options.fields[i]
      switch (fld.type) {
        case 'text':
          this.buildTextField(fld, mkup)
          break
        case 'password':
          this.buildPasswordField(fld, mkup)
          break
        case 'textarea':
          this.buildTextareaField(fld, mkup)
          break
        case 'image':
          this.buildImageField(fld, mkup)
          break;
        case 'pdf':
          this.buildPdfField(fld, mkup)
          break;
        case 'dropdown':
          this.buildDropdownField(fld, mkup)
          break;
        case 'currency':
          this.buildCurrencyField(fld, mkup)
          break;
        case 'checkbox':
          this.buildCheckboxField(fld, mkup)
          break;
        case 'checkboxes':
          this.buildCheckboxesField(fld, mkup)
          break;
        case 'date':
          this.buildDateField(fld, mkup)
          break;
        case 'time':
          this.buildTimeField(fld, mkup)
          break;
        case 'integer':
          this.buildIntegerField(fld, mkup)
          break;
        case 'email':
          this.buildEmailField(fld, mkup)
          break;
        case 'autolist':
          this.buildAutolistField(fld, mkup)
          break
        case 'htmledit':
          this.buildHtmleditField(fld, mkup)
          break
        default:
          throw new Error(`Unhandled field type: ${(fld as any).type}`)
      }
    }
    this.buildActionButtons(mkup)
    this.buildMkupTail(mkup)

    return mkup.join('\n')
  }

  private buildMkupHead(mkup: string[]) {
    let ac = this._options.formCls ?? ''
    mkup.push(`<form id="${this._options.name}" class= "ui ${ac} form">`)
    mkup.push(`<div class="ui segment">`)
  }

  private buildMkupTail(mkup: string[]) {
    mkup.push(`</div>`)
    mkup.push(`<div class="ui error message"></div>`)
    mkup.push(`</form>`)
  }

  private buildActionButtons(mkup: string[]) {
    mkup.push('<div class="actionButtons">')
    let btnCls = this._options.submitBtn.cls ?? ''
    let btnText = 'Save'
    if (this._options.submitBtn.text != null) {
      btnText = this._options.submitBtn.text
    }
    mkup.push(`<div id="submitBtn" class="ui ${btnCls} primary large submit button">${btnText}</div>`)
    if (this._options.onCancel != null) {
      mkup.push(`<div id="cancelBtn" class="ui large button">Cancel</div>`)
    }

    if (this._options.extras && this._options.extras.buttons) {
      for (let i = 0; i < this._options.extras.buttons.length; ++i) {
        let btn = this._options.extras.buttons[i]
        let cls = btn.cls ?? ''
        mkup.push(`<div id="${btn.id}" class="ui large ${cls} button">${btn.text}</div>`)
      }
    }
    mkup.push(`</div>`) // actionButtons
  }

  private buildTextField(fld: ITextField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name]
      ? this._options.defaultValue[fld.name] : ''
    let require = fld.isEditable == false && fld.isRequired ? 'required' : ''
    let disabled = fld.isEditable ? '' : 'readonly'
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    if (icon != '') {
      mkup.push(`<div class="ui ${cls} fluid input">`)
      mkup.push(`<i class="${icon} icon"></i>`)
      mkup.push(`<input type="text" name="${fld.name!}" placeholder="${ph}" value="${value}" />`)
      mkup.push(`</div>`)
    } else {
      mkup.push(`<div class="ui left icon fluid input">`)
      mkup.push(`<i class="font icon"></i>`)
      mkup.push(`<input type="text" name="${fld.name!}" placeholder="${ph}" value="${value}" ${disabled} />`)
      mkup.push(`</div>`)
      // mkup.push(`<input type="text" name="${fld.name}" placeholder="${ph}" value="${value}" />`)
    }
    mkup.push(`</div>`)
  }

  private buildPasswordField(fld: IPasswordField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] != null ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    if (icon != '') {
      mkup.push(`<div class="ui ${cls} input">`)
      mkup.push(`<i class="${icon} icon"></i>`)
      mkup.push(`<input type="password" name="${fld.name}" placeholder="${ph}" />`)
      mkup.push(`</div>`)
    } else {
      mkup.push(`<div class="ui left icon fluid input">`)
      mkup.push(`<i class="lock icon"></i>`)
      mkup.push(`<input type="password" name="${fld.name}" placeholder="${ph}" />`)
      mkup.push(`</div>`)
    }
    mkup.push(`</div>`)
  }

  private buildTextareaField(fld: ITextareaField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<textarea rows="3" name="${fld.name}">${value}</textarea>`)
    mkup.push(`</div>`)
  }

  private buildImageField(fld: IImageField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let imageMeta = fld.imageMeta
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? this._options.defaultValue[fld.name] : ''
    imageMeta._isChanged = false
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui file input">`)
    mkup.push(`<input type="file" id="${fld.name}" class="afImageField" name="${fld.name}" accept="image/jpeg" value="${value}" />`)
    mkup.push(`<input type="hidden" name="${fld.name}_hide" value="${value}" />`) // hidden input to show validation error
    mkup.push(`</div>`)
    mkup.push(`<div id="${fld.name}_div">`)
    if (value) {
      mkup.push(`<img id="${fld.name}_img" src="${value}" class="${imageMeta.className}" />`)
    }
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildPdfField(fld: IPdfField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let pdfMeta = fld.pdfMeta
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? this._options.defaultValue[fld.name] : ''
    pdfMeta._isChanged = false
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui file input">`)
    mkup.push(`<input type="file" id="${fld.name}" class="afPdfField" name="${fld.name}" accept="application/pdf" value="${value}" />`)
    mkup.push(`<input type="hidden" name="${fld.name}_hide" value="${value}" />`) // hidden input to show validation error
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildDropdownField(fld: IDropdownField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value: string
    let require = fld.isRequired ? 'required' : ''
    // if (this._options.mode === FormMode.New) {
    //   value = fld.dropdownOptions[0].value
    // } else {
    value = this._options.defaultValue != null && this._options.defaultValue[fld.name] != null ? this._options.defaultValue[fld.name] : ''
    // }
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    // mkup.push(`<div class="ui fluid selection dropdown">`)
    mkup.push(`<div class="ui fluid selection dropdown floating labeled icon button">`)
    mkup.push(`<i class="caret down icon"></i>`)
    mkup.push(`<input name="${fld.name}" type="hidden" value="${value}" />`)
    // mkup.push(`<i class="dropdown icon"></i>`)
    mkup.push(`<div class="default text no-bold">${ph}</div>`)
    mkup.push(`<div class="menu">`)
    for (let i = 0; i < fld.dropdownOptions.length; ++i) {
      let opt = fld.dropdownOptions[i]
      mkup.push(`<div class="item" data-value="${opt.value}">${opt.text}</div>`)
    }
    mkup.push(`</div>`) // menu
    mkup.push(`</div>`) // dropdown
    mkup.push(`</div>`) // field
  }

  private buildCurrencyField(fld: ICurrencyField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] != null ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui right labeled input">`)
    mkup.push(`<label for="${fld.name}" class="ui label">$</label>`)
    mkup.push(`<input name=${fld.name} type="text" placeholder="${ph}" id="${fld.name}" value="${value}" />`)
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildCheckboxField(fld: ICheckboxField, mkup: string[]) {
    let popup = fld.popup ?? ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? 'checked=""' : ''
    let require = fld.isRequired ? 'required' : ''
    let editable = fld.isEditable == null || fld.isEditable != false ? '' : 'read-only'

    mkup.push(`<div class="field ${require}">`)
    mkup.push(`<div class="ui ${editable} checkbox">`);
    mkup.push(`<input name="${fld.name}" type="checkbox" ${value} />`);
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`</div>`);
    if (popup) {
      mkup.push(`<div class="ui icon mini circular button afpopup" data-content="${popup}">`)
      mkup.push(`<i class="question circle icon"></i>`)
      mkup.push(`</div>`)
    }
    mkup.push(`</div>`)
  }

  private buildCheckboxesField(fld: ICheckboxesField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? this._options.defaultValue[fld.name] : ''
    let valJson = value ? JSON.parse(value) : null
    mkup.push(`<div class="field">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    for (let i = 0; i < fld.checkboxOptions.length; ++i) {
      let opt = fld.checkboxOptions[i]
      let checked = false
      if (valJson) {
        checked = valJson[opt.value]
      }
      mkup.push(`<div id="${fld.name}_${i}" class="ui checkbox checkboxes">`);
      mkup.push(`<input name="${fld.name}_${i}" ${checked ? 'checked=""' : ''} type="checkbox" tabindex="${i}" class="hidden" />`);
      mkup.push(`<label>${opt.text}</label>`);
      mkup.push(`</div>`);
    }
    mkup.push(`</div>`)
  }

  private buildDateField(fld: IDateField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] != null ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui left icon input">`)
    mkup.push(`<input type="date" name="${fld.name}" placeholder="${ph}" value="${value}" />`)
    mkup.push(`<i class="clock outline icon"></i>`)
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildTimeField(fld: ITimeField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] != null ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui left icon input">`)
    mkup.push(`<input type="text" name="${fld.name}" maxLength="5" placeholder="${ph}" value="${value}" />`)
    mkup.push(`<i class="clock outline icon"></i>`)
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildIntegerField(fld: IIntegerField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] != null && this._options.defaultValue[fld.name]
      ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui left icon input">`)
    mkup.push(`<input type="text" maxLength="20" name="${fld.name!}" placeholder="${ph}" value="${value}" />`)
    mkup.push(`<i class="clock hashtag icon"></i>`)
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildEmailField(fld: IEmailField, mkup: string[]) {
    let ph = fld.placeholder ?? ''
    let cls = fld.icon ? fld.icon.cls : ''
    let icon = fld.icon ? fld.icon.icon : ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div class="ui left icon input">`)
    mkup.push(`<input type="email" name="${fld.name}" maxLength="100" placeholder="${ph}" value="${value}" />`)
    mkup.push(`<i class="at icon"></i>`)
    mkup.push(`</div>`)
    mkup.push(`</div>`)
  }

  private buildAutolistField(fld: IAutolistField, mkup: string[]) {
    // mkup.push(`<div class="field">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(fld.autolist.buildHtml())
    // mkup.push(`</div>`)
  }

  private buildHtmleditField(fld: IHtmleditField, mkup: string[]) {
    // let ph = fld.placeholder ?? ''
    let value = this._options.defaultValue != null && this._options.defaultValue[fld.name] ? this._options.defaultValue[fld.name] : ''
    let require = fld.isRequired ? 'required' : ''
    mkup.push(`<div class="field ${require}">`)
    if (fld.label != null) {
      mkup.push(`<label>${fld.label}</label>`)
    }
    mkup.push(`<div id="${fld.name}" name="${fld.name}">${value}</div>`)
    mkup.push(`</div>`)
  }

  public setupEvents() {
    this._el = $(`#${this._options.name}`)

    // Semantic-UI form parameters: https://fomantic-ui.com/behaviors/form.html#/usage
    let param: any = {
      inline: true,
      fields: {},
    }
    if (this._options.onSubmit != null) {
      param.onSuccess = this._options.onSubmit.bind(this._options.callerThis)
    }

    for (let i = 0; i < this._options.fields.length; ++i) {
      let fld = this._options.fields[i]

      if (fld.type === 'text'
        || fld.type === 'password'
        || fld.type === 'textarea'
        || fld.type === 'currency'
        || fld.type === 'date'
        || fld.type === 'time'
        || fld.type === 'image'
        || fld.type === 'pdf'
        || fld.type === 'dropdown'
        || fld.type === 'integer'
        || fld.type === 'email') {
        const cantEmptyRule: ValidationRule = {
          type: 'empty',
          prompt: 'This is required'
        }
        let fieldName = fld.name
        if (fld.type === 'image' || fld.type === 'pdf') {
          // 'Not empty' validation rule can't set to input type='file'. So we set it to the input='hidden'
          fieldName = fld.name + '_hide'
        }

        if (fld.validationRules != null) {
          param.fields[fieldName] = {
            identifier: fieldName,
            rules: fld.validationRules,
          }
          if (fld.isRequired) {
            // Auto add 'empty' rule
            if (!param.fields[fieldName].rules.find(e => e.type === 'empty')) {
              param.fields[fieldName].rules.push(cantEmptyRule)
            }
          } else {
            // Auto add 'optional field'
            // Ref: https://fomantic-ui.com/behaviors/form.html#optional-fields
            param.fields[fieldName].optional = true
          }
        } else {
          if (fld.isRequired) {
            // Auto add 'empty' rule
            param.fields[fieldName] = {
              identifier: fieldName,
              rules: [cantEmptyRule]
            }
          }
        }
      } else if (fld.type === 'autolist') {
        fld.autolist.setupEvents()
      } else if (fld.type === 'htmledit') {
        // Quill docs: https://quilljs.com/docs/quickstart/
        let editor = new Quill(`#${fld.name}`, {
          placeholder: fld.placeholder,
          readOnly: !fld.isEditable,
          theme: 'snow',
          modules: //`#${fld.name}_htmledtb`
          {
            toolbar: [ // Quill toolbar docs: https://quilljs.com/docs/modules/toolbar/
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'header': [1, 2, 3, false] }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              // [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['clean']
            ]
          }
        })
        fld.editOptions._quill = editor
      }
    }

    this._el.form(param)
    this._el.find('.ui.checkbox').checkbox()
    this._el.find('.afpopup').popup()
    this._el.find('.afImageField').off().on('change', this.onImageFieldChanged.bind(this))
    this._el.find('.afPdfField').off().on('change', this.onPdfFieldChanged.bind(this))

    if (this._options.onCancel != null) {
      this._el.find('#cancelBtn').off().on('click', this._options.onCancel.bind(this._options.callerThis))
    }

    if (this._options.extras && this._options.extras.buttons) {
      for (let i = 0; i < this._options.extras.buttons.length; i++) {
        let btn = this._options.extras.buttons[i]
        this._el.find(`#${btn.id}`).off().on('click', btn.onClick.bind(this._options.callerThis))
      }
    }
  }

  private onImageFieldChanged(evt: Event) {
    console.log('autoform::onImageFieldChanged()')

    let self = this
    let input = (evt.currentTarget as HTMLInputElement)
    let filename = input.value
    if (input.files.length == 0) return
    let eid = (evt.currentTarget as HTMLElement).id
    let field = this._options.fields.find(e => e.name === eid) as IImageField
    let imageMeta = field.imageMeta
    let divElem = this._el.find(`#${eid}_div`) as JQuery<HTMLDivElement>
    // let imgElem = this._el.find(`#${ eid }_img`) as JQuery<HTMLImageElement>
    let reader = new FileReader()

    reader.onload = async function (theFile: ProgressEvent<FileReader>) {
      let bytes = theFile.target.result as string
      let image = await Util.readImageContent(bytes)
      if (image.width != imageMeta.width || image.height != imageMeta.height) {
        image = null
        evt.preventDefault()
        alert(`Image format must be dimension ${imageMeta.width}x${imageMeta.height} pixel`)
        return
      }
      // release the DOM memory
      divElem.empty()
      imageMeta._isChanged = true

      image.id = `${eid}_img`
      image.className = 'amenityPhoto'

      // Set the hidden input for image field. So the validation won't fail
      self._el.find(`input[name = "${field.name}_hide"]`).val(filename)

      // Give some time for DOM
      setTimeout(() => {
        // divElem.html(image)
        divElem.append(image)
      }, 500)
    }

    // Read in the image file as a data URL.
    reader.readAsDataURL(input.files[0])
  }

  private onPdfFieldChanged(evt: Event) {
    console.log('autoform::onPdfFieldChanged()')

    let self = this
    let input = (evt.currentTarget as HTMLInputElement)
    let filename = input.value
    if (input.files.length == 0) return
    let eid = (evt.currentTarget as HTMLElement).id
    let field = this._options.fields.find(e => e.name === eid) as IPdfField
    let pdfMeta = field.pdfMeta
    let divElem = this._el.find(`#${eid}_div`) as JQuery<HTMLDivElement>
    // let imgElem = this._el.find(`#${ eid }_img`) as JQuery<HTMLImageElement>
    let reader = new FileReader()

    reader.onload = async function (theFile: ProgressEvent<FileReader>) {
      let bytes = theFile.total
      if (bytes > pdfMeta.maxFileSize) {
        evt.preventDefault()
        alert(`File size must less than ${pdfMeta.maxFileSize / 1048576} MB`)
        return
      }
      pdfMeta._isChanged = true
      // Set the hidden input for image field. So the validation won't fail
      let hiddenFieldname = field.name + '_hide'
      self._el.find(`input[name = "${hiddenFieldname}"]`).val(filename)
      self._el.form('validate field' as any, hiddenFieldname)
    }

    // Read in the image file as a data URL.
    reader.readAsDataURL(input.files[0])
  }

  public validate(): boolean {
    // let result = this._el.form('validate form')
    let result = this._el.form('is valid')
    if (!result) {
      this.setError('Form validation failed. There has at least one field that is invalid. Please correct it and save it again.')
      return false
    }
    for (let i = 0; i < this._options.fields.length; ++i) {
      let fld = this._options.fields[i]
      if (fld.type === 'htmledit') {
        let content = fld.editOptions._quill.getText()
        if (content.trim() === '') {
          this.setError(`${fld.label ?? fld.name} cannot be empty`)
          return false
        }
      }
    }

    return this._el.form('is valid')
  }

  public setLoading(isLoading: boolean) {
    if (isLoading) {
      this._el.addClass('loading')
    } else {
      this._el.removeClass('loading')
    }
  }

  public async getSubmittedValues(): Promise<any> {
    console.log('AutoForm::getSubmittedValues()')

    let result = this._el.form('get values')
    // console.log(result)
    // The value of some fields are needed additional processing
    for (let i = 0; i < this._options.fields.length; ++i) {
      let fld = this._options.fields[i]
      if (fld.type === 'text' || fld.type === 'time' || fld.type === 'email') {
        if (fld.isEditable) {
          if (fld.isRequired) {
            result[fld.name] = result[fld.name].trim()
          } else {
            result[fld.name] = result[fld.name] ? result[fld.name].trim() : null
          }
        } else {
          delete result[fld.name]
        }
      } else if (fld.type === 'date') {
      } else if (fld.type === 'currency') {
        result[fld.name] = result[fld.name] ? parseFloat(result[fld.name]) : null
      } else if (fld.type === 'integer') {
        result[fld.name] = result[fld.name] ? parseInt(result[fld.name]) : null
      } else if (fld.type === 'checkboxes') {
        result[fld.name] = {}
        for (let j = 0; j < fld.checkboxOptions.length; ++j) {
          let opt = fld.checkboxOptions[j]
          let isCheck: boolean = result[`${fld.name}_${j}`] === 'on'
          result[fld.name][opt.value] = isCheck
          delete result[`${fld.name}_${j}`]
        }
      } else if (fld.type === 'dropdown') {
        if (!fld.isRequired) {
          if (result[fld.name] === 'undefined') {
            result[fld.name] = null
          }
        }
      } else if (fld.type === 'image') {
        if (fld.imageMeta._isChanged) {
          let img = this._el.find(`#${fld.name}_img`) as JQuery<HTMLImageElement>
          let blob = await Util.imageToJpegBlob(img[0] as HTMLImageElement, fld.imageMeta.jpegQuality)
          let resp = await Ajax.uploadBlobToObjStore(blob, 'jpg')
          result[fld.name] = resp.data
        }
        delete result[`${fld.name}_hide`]
      } else if (fld.type === 'pdf') {
        if (fld.pdfMeta._isChanged) {
          let input = this._el.find(`#${fld.name}`)[0] as HTMLInputElement
          let resp = await Ajax.uploadBlobToObjStore(input.files[0], 'pdf')
          result[fld.name] = resp.data
        }
        delete result[`${fld.name}_hide`]
      } else if (fld.type === 'password' || fld.type === 'textarea' || fld.type === 'checkbox' || fld.type === 'autolist') {
        // No need to do
      } else if (fld.type === 'htmledit') {
        result[fld.name] = fld.editOptions._quill.root.innerHTML
      } else {
        debugger
        throw new Error(`Unhandled field type: ${(fld as any).type} `)
      }
    }
    return result
  }

  public setError(errmsg: string) {
    this._el.form('add errors', [errmsg])
  }

  public destroy() {
    this._el.form('destroy')
  }

  public setFieldValue(field: string, value: string) {
    let opts = {}
    opts[field] = value
    this._el.form('set values', opts)
  }

}