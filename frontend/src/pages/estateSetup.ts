import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
// import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'

const DATAFORM_NAME = 'estateDataForm'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned one column centered grid">
      <div class="row">
        <div class="left floated sixteen wide column">
          <label class="ui huge header">Estate Setup</label>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="sixteen wide column">
      <div id="dataForm" class="ui segment">
        <div class="ui active loader"></div>
        <p class="heg300"></p>
      </div>
    </div>
  </div>
</div>
`

export class EstateSetup implements IPage {
  _recId?: string
  _el: JQuery<HTMLElement>
  _autoform: AutoForm

  public constructor() {
  }

  public async openPage() {
    console.log('EstateSetup::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('EstateSetup::loadData()')

    let resp = await Ajax.getRecsByCrit('estates')
    let rec = resp.data[0]
    this._recId = rec.id
    await this.onEdit(rec)
  }

  // Db record to autoForm default values. Process the data before pass to AutoForm
  // (reverse version of afResultToRecord())
  private afOptFromRecord(record: any) {
    record.name = Util.intlStrFromJson(record.name)
    record.address = Util.intlStrFromJson(record.address)
    let contact = record.contact
    if (contact) {
      contact = JSON.parse(contact)
      record.contactName = Util.intlStrFromJson(contact.name)
      record.contactEmail = contact.email
      record.contactTel = contact.tel
    }
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
    values.name = Util.intlStrToJson(values.name)
    values.address = Util.intlStrToJson(values.address)
    values.contact = JSON.stringify({
      name: values.contactName,
      email: values.contactEmail,
      tel: values.contactTel,
    })
    delete values.contactName
    delete values.contactEmail
    delete values.contactTel
  }

  private async onEdit(record: any) {
    this.afOptFromRecord(record)
    let editAutoformMkup = this.buildAutoformHtml(FormMode.Edit, record)
    this._el = $('#dataForm')
    this._el.html(editAutoformMkup)
    this._autoform.setupEvents()
    // this._el.find('#saveBtn').off().on('click', this.onFormSubmitted.bind(this))
  }

  private buildAutoformHtml(mode: FormMode, record: object) {
    // Setup a AutoForm for record edit
    this._autoform = new AutoForm({
      name: DATAFORM_NAME,
      mode: mode,
      defaultValue: record,
      submitBtn: { text: 'Save', cls: 'primary' },
      onSubmit: this.onFormSubmitted,
      callerThis: this,
      fields: [{
        name: 'name',
        type: 'text',
        label: 'Folder name',
        isRequired: true,
        placeholder: 'Folder name',
      }, {
        name: 'address',
        type: 'text',
        label: 'Address',
        isRequired: true,
        placeholder: 'Estate address',
      }, {
        name: 'contactName',
        type: 'text',
        label: 'Administrator name',
        isRequired: true,
        placeholder: 'Administrator contact person name',
      }, {
        name: 'contactEmail',
        type: 'text',
        label: 'Administrator email',
        isRequired: true,
        placeholder: 'Estate contact person email address',
      }, {
        name: 'contactTel',
        type: 'text',
        label: 'Contact phone no.',
        isRequired: false,
        placeholder: 'Administrator contact person phone no.',
      }, {
        name: 'langEntries',
        type: 'dropdown',
        label: 'Language',
        isRequired: true,
        dropdownOptions: [
          { text: 'English', value: 'en' },
          //   { text: 'Chinese Traditional', value: 'zh-CHT' },
          //   { text: 'Chinese Simplified', value: 'zh-CHS' },
        ],
      }, {
        name: 'timezone',
        type: 'dropdown',
        label: 'Timezone',
        isRequired: true,
        dropdownOptions: Constant.TIMEZONES.map(e => {
          return {
            text: e.text,
            value: String(e.offset)
          }
        }),
        validationRules: [{
          type: 'empty',
          prompt: 'Must select'
        }],
      }, {
        name: 'currency',
        type: 'dropdown',
        label: 'Currency',
        isRequired: false,
        dropdownOptions: $.map(Constant.CURRENCIES, function (value, key) {
          return { text: value, value: key }
        }),
        validationRules: [{
          type: 'empty',
          prompt: 'Must select'
        }],
      }],
    })
    let formMkup = this._autoform.buildHtml()
    return formMkup
  }

  // Additional form validation: Since some situation cannot be
  // handled by Semantic-UI form validation.
  private async getAdditonalCheckingError(submittedValues: any): Promise<string | null> {
    let result = await Ajax.getRecsByCrit('estates', {
      crit: `name='${submittedValues.name}'`,
      fields: 'id',
    })
    if (result.data.length > 0) return `Same estate name already exist`

    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('EstateSetup::onFormSubmitted()')

    evt.preventDefault()

    try {
      if (!this._autoform.validate()) return
      let values = await this._autoform.getSubmittedValues()
      let addnlErr = await this.getAdditonalCheckingError(values)
      if (addnlErr != null) {
        this._autoform.setError(addnlErr)
        return false
      }
      // console.log(values)  
      this.afResultToRecord(values)
      this._autoform.setLoading(true)
      let id: string | null = this._autoform.mode === FormMode.Edit ? this._recId : null
      let result = await Ajax.saveRec('estates', values, id)
      Util.displayInfoToast('Data saved successfully')

      setTimeout(() => {
        this._autoform.setLoading(false)
      }, 5000)
    } catch (ex: any) {
      this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
    }
  }

}