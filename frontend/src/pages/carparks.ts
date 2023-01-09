import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'
import { CsvUnitBatchSetup } from './csvUnitSetup'

const DATALIST_NAME = 'carparksDataList'
const DATAFORM_NAME = 'carparkDataForm'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned three column centered grid">
      <div class="row">
        <div class="left floated eight wide column">
          <label class="ui huge header">Carparks</label>
        </div>
        <div class="six wide column">
          <button id="csvSetupBtn" class="ui secondary button">CSV Batch Setup</button>
        </div>
        <div class="right floated two wide column">
          <div id="addNewBtn" class="ui vertical animated primary button">
            <div class="hidden content">Add new</div>
            <div class="visible content">
              <i class="plus icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="dataList" class="row">
    <div class="sixteen wide column">
      <div class="ui segment">
        <div class="ui active loader"></div>
        <p class="heg300"></p>
      </div>
    </div>
  </div>
</div>
`

export class Carparks implements IPage {
  _recId?: string
  _el: JQuery<HTMLElement>
  _datalist: AutoList
  _autoform: AutoForm
  _datalistData: any[]

  public constructor() {
    this._datalist = new AutoList({
      name: DATALIST_NAME,
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'block',
        type: 'string',
        header: 'Block'
      }, {
        name: 'floor',
        type: 'string',
        header: 'Floor'
      }, {
        name: 'number',
        type: 'string',
        header: 'Number'
      }],
      callerThis: this,
      onEditFn: this.onEdit.bind(this),
      onDeleteFn: this.onDelete.bind(this),
    })
  }

  public async openPage() {
    console.log('Carparks::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('Carparks::loadData()')

    if (this._datalistData == null) {
      let resp = await Ajax.getRecsByCrit('units', {
        crit: `type='car'`,
        fields: 'id,block,floor,number',
      })
      this._datalistData = Util.sortUnits('carparks', resp.data)
    }

    // Make the AutoList to display availableDays in more informative
    this._datalist.data = this._datalistData

    $('#dataList').html(this._datalist.buildHtml())

    globalThis.app.navigator.setupEvents()
    this._datalist.setupEvents()
    $('#addNewBtn').off().on('click', this.onAddNew.bind(this))
    $('#csvSetupBtn').off().on('click', this.onCsvBatchSetup.bind(this))
  }

  // Db record to autoForm default values. Process the data before pass to AutoForm
  // (reverse version of afResultToRecord())
  private afOptFromRecord(record: any) {
    // Nothing to do
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
    values.type = 'car'
  }

  private async onAddNew(evt: Event) {
    console.log('Carparks::onAddNew()')
    evt.preventDefault()

    // Setup the default values for Addnew
    let editAutoformMkup = this.buildAutoformHtml(FormMode.New, {
    })

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Add New Carpark</h2>
      ${editAutoformMkup}
    </div>
    `
    globalThis.app.setContentMarkup(html)
    this._el = $(`#${DATAFORM_NAME}`)
    this._autoform.setupEvents()
  }

  private async onEdit(id: string) {
    console.log(`Carparks::onEdit('${id}')`)

    this._recId = id
    let result: any = await Ajax.getRecById('units', id)
    let record = result.data
    this.afOptFromRecord(record)
    let editAutoformMkup = this.buildAutoformHtml(FormMode.Edit, record)

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Edit Carpark Record</h2>
      ${editAutoformMkup}
    </div>
    `
    globalThis.app.setContentMarkup(html)
    this._el = $(`#${DATAFORM_NAME}`)
    this._autoform.setupEvents()
  }

  private buildAutoformHtml(mode: FormMode, record: object) {
    // Setup a AutoForm for record edit
    this._autoform = new AutoForm({
      name: DATAFORM_NAME,
      mode: mode,
      defaultValue: record,
      callerThis: this,
      fields: [{
        name: 'block',
        type: 'text',
        label: 'Block',
        isRequired: true,
        placeholder: 'Block name e.g. A, 1 or Building A',
      }, {
        name: 'floor',
        type: 'text',
        label: 'Floor',
        isRequired: true,
        placeholder: 'Floor number or name e.g. G, B1, 1, 2 or 12',
      }, {
        name: 'number',
        type: 'text',
        label: 'Number',
        isRequired: true,
        placeholder: 'Carpark number or name e.g. A or 1',
      }],
      onSubmit: this.onFormSubmitted,
      onCancel: this.onCancel,
    })
    let formMkup = this._autoform.buildHtml()
    return formMkup
  }

  private async onCsvBatchSetup(evt: any) {
    // Open & display the page directly
    let page = new CsvUnitBatchSetup()
    page.openPage()
    page.loadData()
  }

  // Additional form validation: Since some situation cannot be
  // handled by Semantic-UI form validation.
  private async getAdditonalCheckingError(submittedValues: any): Promise<string | null> {
    let block = submittedValues.block
    let floor = submittedValues.floor
    let number = submittedValues.number
    if (this._autoform.mode === FormMode.New) {
      let result = await Ajax.getRecsByCrit('units', {
        crit: `block='${block}' AND floor='${floor}' AND number='${number}' AND type='car'`,
        fields: 'id',
      })
      if (result.data.length > 0) return `Same carpark is exist`
    }

    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('Carparks::onFormSubmitted()')

    evt.preventDefault()

    try {
      if (!this._autoform.validate()) return
      let values = await this._autoform.getSubmittedValues()
      let addnlErr = await this.getAdditonalCheckingError(values)
      if (addnlErr != null) {
        this._autoform.setError(addnlErr)
        return
      }
      // console.log(values)  
      this.afResultToRecord(values)
      this._autoform.setLoading(true)
      let id: string | null = this._autoform.mode === FormMode.Edit ? this._recId : null
      let result = await Ajax.saveRec('units', values, id)
      this._autoform.setLoading(false)
      this._autoform.destroy()
      this._datalistData = null
      await this.openPage()
      await this.loadData()
    } catch (ex: any) {
      this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
    }
  }

  private async onCancel(evt: Event) {
    evt.preventDefault()
    this._autoform.destroy()
    await this.openPage()
    await this.loadData()
  }

  private async onDelete(id: string) {
    let ok = await Util.displayConfirmDialog('Warning', 'Surely want to delete record')
    if (ok) {
      try {
        await Ajax.deleteRecById('units', id)
        this._datalistData = null
        await this.openPage()
        await this.loadData()
      } catch (ex: any) {
        Util.displayAlertDialog('Error', `Got '${ex.message}' when saving data. Please try again later`)
      }
    }
  }

}