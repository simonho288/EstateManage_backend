import * as moment from 'moment'

import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'

const DATALIST_NAME = 'tenamenbkgsDataList'
const DATAFORM_NAME = 'tenamenbkgDataForm'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned two column centered grid">
      <div class="row">
        <div class="left floated sixteen wide column">
          <label class="ui huge header">Tenant Amenity Bookings</label>
        </div>
      </div>
      <div class="row">
        <div class="eleven wide column"></div>
        <div class="right floated five wide column">
          <div id="daysDropdown" class="ui selection dropdown">
            <input type="hidden" name="days">
            <i class="dropdown icon"></i>
            <div class="default text">Today</div>
            <div class="scrollhint menu">
              <div class="days item active selected" data-value="0">Today</div>
              <div class="days item" data-value="1">Last 7 days</div>
              <div class="days item" data-value="2">This month</div>
              <div class="days item" data-value="3">Last 1 month</div>
              <div class="days item" data-value="4">Last 3 months</div>
              <div class="days item" data-value="5">This year</div>
              <div class="days item" data-value="6">Last year</div>
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

export class TenantAmenityBookings implements IPage {
  _recId?: string
  _el: JQuery<HTMLElement>
  _datalist: AutoList
  _autoform: AutoForm
  _dateStart: string // YYYY-MM-DD
  _curRecord: any
  _datalistData: any[]

  public constructor() {
    this._datalist = new AutoList({
      name: DATALIST_NAME,
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'AmenityName',
        type: 'string',
        header: 'Amenity'
      }, {
        name: 'TenantName',
        type: 'string',
        header: 'Tenant'
      }, {
        name: 'TenantPhone',
        type: 'string',
        header: 'Phone',
      }, {
        name: 'TenantEmail',
        type: 'string',
        header: 'Email',
      }, {
        name: 'date',
        type: 'string',
        header: 'Date',
      }, {
        name: 'time',
        type: 'string',
        header: 'Time (24hr)',
      }, {
        name: 'isPaid',
        type: 'boolean',
        header: 'Paid?'
      }, {
        name: 'status',
        type: 'string',
        header: 'Status'
      }],
      callerThis: this,
      onEditFn: this.onEdit.bind(this),
      onDeleteFn: this.onDelete.bind(this),
    })
  }

  public async openPage() {
    console.log('TenantAmenityBookings::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
    this._dateStart = moment().format('YYYY-MM-DD')
  }

  public async loadData() {
    console.log('TenantAmenityBookings::loadData()')

    if (this._datalistData == null) {
      let resp = await Ajax.getTenAmenBkgs(this._dateStart)
      this._datalistData = resp.data

      this._datalistData.forEach(rec => {
        rec.AmenityName = Util.intlStrFromJson(rec.AmenityName)
        // let unitType = rec.UnitType === 'res' ? 'Residence'
        //   : rec.UnitType === 'car' ? 'Carpark'
        //     : rec.UnitType === 'shp' ? 'Shp' : '-'
        // let unitName = []
        // if (rec.UnitBlock) unitName.push(rec.UnitBlock)
        // if (rec.UnitFloor) unitName.push(rec.UnitFloor)
        // unitName.push(rec.UnitNumber)
        // rec.unit = `${unitType}: ${unitName.join(',')}`
        // delete rec.UnitType
        // delete rec.UnitBlock
        // delete rec.UnitFloor
        // delete rec.UnitNumber
        let timeSlots = JSON.parse(rec.timeSlots)
        let times = []
        timeSlots.forEach(time => {
          times.push(`${time.from}-${time.to}`)
        })
        rec.time = times.join(', ')
      })
    }

    // Make the AutoList to display availableDays in more informative
    this._datalist.data = this._datalistData

    $('#dataList').html(this._datalist.buildHtml())

    globalThis.app.navigator.setupEvents()
    this._datalist.setupEvents()
    // $('#addNewBtn').off().on('click', this.onAddNew.bind(this))
    // $('.ui.dropdown').dropdown({
    $('#daysDropdown').dropdown({
      onChange: this.onDropdownChanged.bind(this)
    })
  }

  // Db record to autoForm default values. Process the data before pass to AutoForm
  // (reverse version of afResultToRecord())
  private afOptFromRecord(record: any) {
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
  }

  private async onDropdownChanged(value: string, text: string, el: JQuery<HTMLElement>) {
    console.log('TenAmenBkgs::onDropdownChanged()')

    if (el.hasClass('days')) { // Change days of records for AutoList
      await this.onDaysChanged(value, text)
    }
  }

  private async onDaysChanged(value: string, text: string) {
    switch (parseInt(value)) {
      case 0:
        this._dateStart = moment().format(Constant.FMT_YMD)
        break;
      case 1:
        this._dateStart = moment().subtract(7, 'days').format(Constant.FMT_YMD)
        break;
      case 2:
        this._dateStart = moment().format('YYYY-MM-01')
        break;
      case 3:
        this._dateStart = moment().subtract(1, 'month').format(Constant.FMT_YMD)
        break;
      case 4:
        this._dateStart = moment().subtract(3, 'months').format(Constant.FMT_YMD)
        break;
      case 5:
        this._dateStart = moment().format('YYYY-01-01')
        break;
      case 6:
        this._dateStart = moment().subtract(1, 'year').format(Constant.FMT_YMD)
        break;
      default:
        throw new Error(`Unhandled days value: ${value}`)
    }
    this._datalistData = null
    await this.loadData();
  }

  private async onEdit(id: string) {
    console.log(`TenantAmenityBookings::onEdit('${id}')`)

    this._recId = id
    this._curRecord = this._datalistData.find(r => r.id === id)
    // let result: any = await Ajax.getRecById('tenants', id)
    // let record = result.data
    this.afOptFromRecord(this._curRecord)
    let editAutoformMkup = this.buildAutoformHtml(FormMode.Edit, this._curRecord)

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Edit Tenant Amenity Booking Record</h2>
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
        name: 'AmenityName',
        type: 'text',
        label: 'Amenity',
        isEditable: false,
      }, {
        name: 'TenantName',
        type: 'text',
        label: 'Tenant',
        isEditable: false,
      }, {
        name: 'bookingTimeBasic',
        type: 'text',
        label: 'Booking Time Basic (time or section)',
        isEditable: false,
      }, {
        name: 'date',
        type: 'text',
        label: 'Date',
        isEditable: false,
      }, {
        name: 'time',
        type: 'text',
        label: 'Time',
        isEditable: false,
      }, {
        name: 'status',
        type: 'dropdown',
        label: 'Booking Status',
        isRequired: false,
        dropdownOptions: [
          { text: 'pending: Pending Payment', value: 'pending' },
          { text: 'expired: No payment received', value: 'expired' },
          { text: 'ready: Ready to use', value: 'ready' },
        ],
      }, {
        name: 'totalFee',
        type: 'currency',
        label: 'Fee (total)',
        isRequired: false,
      }, {
        name: 'currency',
        type: 'text',
        label: 'Currency',
        isEditable: false,
      }, {
        name: 'isPaid',
        type: 'checkbox',
        label: 'Is paid?',
        isRequired: true,
      }],
      onSubmit: this.onFormSubmitted.bind(this),
      onCancel: this.onCancel,
    })
    let formMkup = this._autoform.buildHtml()
    return formMkup
  }

  // Additional form validation: Since some situation cannot be
  // handled by Semantic-UI form validation.
  private async getAdditonalCheckingError(submittedValues: any): Promise<string | null> {
    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('TenantAmenityBookings::onFormSubmitted()')

    evt.preventDefault()

    try {
      let values = await this._autoform.getSubmittedValues()
      let addnlErr = await this.getAdditonalCheckingError(values)
      if (addnlErr != null) {
        this._autoform.setError(addnlErr)
        return
      }
      // console.log(values)  
      if (values.isPaid != this._curRecord.isPaid
        || values.status != this._curRecord.Status
        || values.totalFee != this._curRecord.totalFee) {
        // User has modified some field(s)
        this.afResultToRecord(values)
        this._autoform.setLoading(true)
        let id: string | null = this._autoform.mode === FormMode.Edit ? this._recId : null
        let result = await Ajax.saveRec('tenantAmenityBookings', values, id)
        this._autoform.setLoading(false)
      }

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
        await Ajax.deleteRecById('tenants', id)
        this._datalistData = null
        await this.openPage()
        await this.loadData()
      } catch (ex: any) {
        Util.displayAlertDialog('Error', `Got '${ex.message}' when saving data. Please try again later`)
      }
    }
  }

}