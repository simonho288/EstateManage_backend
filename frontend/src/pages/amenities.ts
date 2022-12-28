import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'

const DATALIST_NAME = 'amenitiesDataList'
const DATAFORM_NAME = 'amenityDataForm'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned two column centered grid">
      <div class="row">
        <div class="left floated fourteen wide column">
          <label class="ui huge header">Amenities</label>
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

export class Amenities implements IPage {
  _recId?: string
  _el: JQuery<HTMLElement>
  _datalist: AutoList
  _autoform: AutoForm
  _datalistData: any[]

  public constructor() {
    // Define the data for AutoList
    this._datalist = new AutoList({
      name: DATALIST_NAME,
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'name',
        type: 'intl',
        header: 'Name'
      }, {
        name: 'photo',
        type: 'thumbnail',
        header: 'Image',
      }, {
        name: 'fee',
        type: 'currency',
        header: 'Fee'
      }, {
        name: 'availableDays',
        type: 'string',
        header: 'Available days'
      }],
      callerThis: this,
      onEditFn: this.onEdit.bind(this),
      onDeleteFn: this.onDelete.bind(this),
    })
  }

  public async openPage() {
    console.log('Amenities::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('Amenities::loadData()')

    if (this._datalistData == null) {
      let resp = await Ajax.getRecsByCrit('amenities', {
        fields: 'id,name,photo,status,fee,availableDays',
        sort: 'name'
      })

      // Make the AutoList to display availableDays in more informative
      resp.data.map(e => {
        if (e.availableDays != null) {
          let json = JSON.parse(e.availableDays)
          let days = []
          if (json.mon) days.push('Mon')
          if (json.tue) days.push('Tue')
          if (json.wed) days.push('Wed')
          if (json.thu) days.push('Thu')
          if (json.fri) days.push('Fri')
          if (json.sat) days.push('Sat')
          if (json.sun) days.push('Sun')
          e.availableDays = days.join(',')
        }
      })
      this._datalistData = resp.data
    }

    this._datalist.data = this._datalistData

    $('#dataList').html(this._datalist.buildHtml())

    globalThis.app.navigator.setupEvents()
    this._datalist.setupEvents()
    $('#addNewBtn').off().on('click', this.onAddNew.bind(this))
  }

  // Db record to autoForm default values. Process the data before pass to AutoForm
  // (reverse version of afResultToRecord())
  private afOptFromRecord(record: any) {
    record.name = Util.intlStrFromJson(record.name)
    record.details = Util.intlStrFromJson(record.details)

    let secBases = JSON.parse(record.sectionBased)
    for (let i = 0; i < 4; ++i) {
      if (secBases[i] != null) {
        let secBase = secBases[i]
        record[`sectionBaseName${i + 1}`] = secBase.name
        record[`sectionBaseTimeBegin${i + 1}`] = secBase.begin
        record[`sectionBaseTimeEnd${i + 1}`] = secBase.end
      }
    }
    delete record.sectionBased

    let timeBased = JSON.parse(record.timeBased)
    record.timeOpen = timeBased.timeOpen
    record.timeClose = timeBased.timeClose
    record.timeMinimum = timeBased.timeMinimum
    record.timeMaximum = timeBased.timeMaximum
    record.timeIncrement = timeBased.timeIncrement
    delete record.timeBased

    let contact = JSON.parse(record.contact)
    if (contact != null) {
      if (contact.email) {
        record.contactEmailName = contact.email.name
        record.contactEmailAddress = contact.email.address
      }
      if (contact.whatsapp != null) {
        record.contactWhatsappName = contact.whatsapp.name
        record.contactWhatsappNumber = contact.whatsapp.number
        delete contact.whatsapp
      }
      delete record.contact
    }
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
    values.name = Util.intlStrToJson(values.name)
    values.details = Util.intlStrToJson(values.details)
    values.availableDays = JSON.stringify(values.availableDays)
    values.timeBased = JSON.stringify({
      timeOpen: values.timeOpen,
      timeClose: values.timeClose,
      timeMinimum: values.timeMinimum,
      timeMaximum: values.timeMaximum,
      timeIncrement: values.timeIncrement,
    })
    let secBases = []
    for (let i = 1; i <= 4; ++i) {
      if (values[`sectionBaseName${i}`] && values[`sectionBaseTimeBegin${i}`] && values[`sectionBaseTimeEnd${i}`]) {
        secBases.push({
          name: values[`sectionBaseName${i}`],
          begin: values[`sectionBaseTimeBegin${i}`],
          end: values[`sectionBaseTimeEnd${i}`],
        })
      }
    }
    values.sectionBased = JSON.stringify(secBases)
    delete values.timeOpen
    delete values.timeClose
    delete values.timeMinimum
    delete values.timeMaximum
    delete values.timeIncrement
    for (let i = 1; i <= 4; ++i) {
      delete values[`sectionBaseName${i}`]
      delete values[`sectionBaseTimeBegin${i}`]
      delete values[`sectionBaseTimeEnd${i}`]
    }
    values.isRepetitiveBooking = values.isRepetitiveBooking === 'on'
    values.contact = JSON.stringify({
      email: {
        name: values.contactEmailName,
        address: values.contactEmailAddress,
      },
      whatsapp: {
        name: values.contactWhatsappName,
        number: values.contactWhatsappNumber,
      },
    })
    delete values.contactEmailName
    delete values.contactEmailAddress
    delete values.contactWhatsappName
    delete values.contactWhatsappNumber
  }

  private async onAddNew(evt: Event) {
    console.log('Amenities::onAddNew()')
    evt.preventDefault()

    // Setup the default values for Addnew
    let result = await Ajax.getRecsByCrit('estates')
    let estate = result.data[0]
    let editAutoformMkup = this.buildAutoformHtml(FormMode.New, {
      currency: estate.currency,
      availableDays: JSON.stringify({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true }),
      bookingTimeBasic: 'time',
      // timeOpen: '09:00',
      // timeClose: '20:00',
      // timeMinimum: "30",
      // timeMaximum: "60",
      // timeIncrement: "30",
    })

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Add New Amenity</h2>
      ${editAutoformMkup}
    </div>
    `
    globalThis.app.setContentMarkup(html)
    this._el = $(`#${DATAFORM_NAME}`)
    this._autoform.setupEvents()
  }

  private async onEdit(id: string) {
    console.log(`Amenities::onEdit('${id}')`)

    this._recId = id
    let result: any = await Ajax.getRecById('amenities', id)
    let record = result.data
    this.afOptFromRecord(record)
    let editAutoformMkup = this.buildAutoformHtml(FormMode.Edit, record)

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Edit Amenity Record</h2>
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
        name: 'name',
        type: 'text',
        label: 'Amenity name',
        isRequired: true,
        placeholder: 'Amenity name',
      }, {
        name: 'details',
        type: 'textarea',
        label: 'Details',
        isRequired: true,
        placeholder: 'Describe the amenity',
        validationRules: [{
          type: 'empty',
          prompt: 'Cannot empty'
        }],
      }, {
        name: 'photo',
        type: 'image',
        label: 'Image (640x350 pixels JPG)',
        isRequired: true,
        imageMeta: { className: 'amenityPhoto', width: 640, height: 350, jpegQuality: 0.85 },
        validationRules: [{
          type: 'empty',
          prompt: 'Cannot empty'
        }],
      }, {
        name: 'status',
        type: 'dropdown',
        label: 'Status',
        isRequired: true,
        dropdownOptions: [
          { text: 'Open', value: 'open' },
          { text: 'Closed', value: 'close' },
          { text: 'Maintenance', value: 'maintain' },
          { text: 'Hidden', value: 'hide' },
        ],
        validationRules: [{
          type: 'empty',
          prompt: 'Must select'
        }],
      }, {
        name: 'fee',
        type: 'currency',
        label: 'Booking fee',
        isRequired: false,
        validationRules: [/*{
          type: 'minValue[0]',
          prompt: 'Cannot negative'
        },*/ {
            type: 'maxValue[9999]',
            prompt: 'Valid value between 0 - 9999'
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
      }, {
        name: 'availableDays',
        type: 'checkboxes',
        label: 'Days allow for booking',
        isRequired: true,
        checkboxOptions: [
          { text: 'Mon', value: 'mon' },
          { text: 'Tue', value: 'tue' },
          { text: 'Wed', value: 'wed' },
          { text: 'Thu', value: 'thu' },
          { text: 'Fri', value: 'fri' },
          { text: 'Sat', value: 'sat' },
          { text: 'Sun', value: 'sun' },
        ],
      }, {
        name: 'bookingTimeBasic',
        type: 'dropdown',
        label: 'Booking type',
        isRequired: true,
        dropdownOptions: [
          { text: 'By time', value: 'time' },
          { text: 'By section', value: 'section' },
        ],
      }, {
        name: 'timeOpen',
        type: 'time',
        label: 'By time: Time open (HH:MM)',
        placeholder: 'Amenity daily opening time in HH:MM e.g. 08:00',
        isRequired: false,
        validationRules: [{
          type: 'regExp',
          value: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
          prompt: 'Invalid time format. Must be HH:MM e.g. 08:00'
        }]
      }, {
        name: 'timeClose',
        type: 'time',
        label: 'By time: Time close (HH:MM)',
        placeholder: 'Amenity daily closing time in HH:MM e.g. 20:00',
        isRequired: false,
      }, {
        name: 'timeMinimum',
        type: 'dropdown',
        label: 'By time: Minimum time',
        placeholder: 'Minimum booking time in minutes. Click to select',
        isRequired: false,
        dropdownOptions: [
          { text: '30 mins', value: '30' },
          { text: '60 mins', value: '60' },
          { text: '90 mins', value: '90' },
          { text: '120 mins', value: '120' },
          { text: '180 mins', value: '180' },
          { text: '240 mins', value: '240' },
          { text: '300 mins', value: '300' },
          { text: '360 mins', value: '360' },
          { text: '420 mins', value: '420' },
          { text: '480 mins', value: '480' },
        ],
      }, {
        name: 'timeMaximum',
        type: 'dropdown',
        label: 'By time: Maximum time',
        placeholder: 'Maximum booking time in minutes. Click to select',
        isRequired: false,
        dropdownOptions: [
          { text: '30 mins', value: '30' },
          { text: '60 mins', value: '60' },
          { text: '90 mins', value: '90' },
          { text: '120 mins', value: '120' },
          { text: '180 mins', value: '180' },
          { text: '240 mins', value: '240' },
          { text: '300 mins', value: '300' },
          { text: '360 mins', value: '360' },
          { text: '420 mins', value: '420' },
          { text: '480 mins', value: '480' },
        ],
      }, {
        name: 'timeIncrement',
        type: 'dropdown',
        label: 'By time: Increment time',
        placeholder: 'The minutes of the segment for booking. Click to select',
        isRequired: false,
        dropdownOptions: [
          { text: '30 mins', value: '30' },
          { text: '60 mins', value: '60' },
          { text: '90 mins', value: '90' },
          { text: '120 mins', value: '120' },
          { text: '180 mins', value: '180' },
          { text: '240 mins', value: '240' },
          { text: '300 mins', value: '300' },
          { text: '360 mins', value: '360' },
          { text: '420 mins', value: '420' },
          { text: '480 mins', value: '480' },
        ],
      }, {
        name: 'sectionBaseName1',
        type: 'text',
        label: 'By section: Name 1',
        placeholder: 'For section based booking, enter the 1st section name e.g. Morning',
        isRequired: false,
        validationRules: [{
          type: 'maxLength[20]',
          prompt: 'Max. text length: 20'
        }],
      }, {
        name: 'sectionBaseTimeBegin1',
        type: 'time',
        label: 'By section: Time begin 1',
        placeholder: 'For section based booking, enter the 1st section begin time in HH:MM e.g. 09:00',
        isRequired: false,
      }, {
        name: 'sectionBaseTimeEnd1',
        type: 'time',
        label: 'By section: Time end 1',
        placeholder: 'For section based booking, enter the 1st section end time in HH:MM e.g. 12:00',
        isRequired: false,
      }, {
        name: 'sectionBaseName2',
        type: 'text',
        label: 'By section: Name 2',
        placeholder: 'For section based booking, enter the 2nd section name e.g. Afternoon',
        isRequired: false,
        validationRules: [{
          type: 'maxLength[20]',
          prompt: 'Max. text length: 20'
        }],
      }, {
        name: 'sectionBaseTimeBegin2',
        type: 'time',
        label: 'By section: Time begin 2',
        placeholder: 'For section based booking, enter the 2nd section begin time in HH:MM e.g. 13:00',
        isRequired: false,
      }, {
        name: 'sectionBaseTimeEnd2',
        type: 'time',
        label: 'By section: Time end 2',
        placeholder: 'For section based booking, enter the 2nd section end time in HH:MM e.g. 16:00',
        isRequired: false,
      }, {
        name: 'sectionBaseName3',
        type: 'text',
        label: 'By section: Name 3',
        placeholder: 'For section based booking, enter the 3rd section name e.g. Evening',
        isRequired: false,
        validationRules: [{
          type: 'maxLength[20]',
          prompt: 'Max. text length: 20'
        }],
      }, {
        name: 'sectionBaseTimeBegin3',
        type: 'time',
        label: 'By section: Time begin 3',
        placeholder: 'For section based booking, enter the 3rd section begin time in HH:MM e.g. 17:00',
        isRequired: false,
      }, {
        name: 'sectionBaseTimeEnd3',
        type: 'time',
        label: 'By section: Time end 3',
        placeholder: 'For section based booking, enter the 3rd section end time in HH:MM e.g. 20:00',
        isRequired: false,
      }, {
        name: 'sectionBaseName4',
        type: 'text',
        label: 'By section: Name 4',
        placeholder: 'For section based booking, enter the 4th section name e.g. Night',
        isRequired: false,
        validationRules: [{
          type: 'maxLength[20]',
          prompt: 'Max. text length: 20'
        }],
      }, {
        name: 'sectionBaseTimeBegin4',
        type: 'time',
        label: 'By section: Time begin 4',
        placeholder: 'For section based booking, enter the 4th section begin time in HH:MM e.g. 21:00',
        isRequired: false,
      }, {
        name: 'sectionBaseTimeEnd4',
        type: 'time',
        label: 'By section: Time end 4',
        placeholder: 'For section based booking, enter the 4th section end time in HH:MM e.g. 00:00',
        isRequired: false,
      }, {
        name: 'bookingAdvanceDays',
        type: 'integer',
        label: 'Booking advance days',
        placeholder: 'If the amenity booking are busy, this is to define the days of advance booking',
        isRequired: false,
        validationRules: [{
          type: 'maxValue[365]',
          prompt: 'Cannot exceed 1 year'
        }],
      }, {
        name: 'autoCancelHours',
        type: 'integer',
        label: 'Auto cancel hours',
        placeholder: 'If the amenity is charging fee, what hour(s) to cancel the booking it if not paid',
        isRequired: false,
        validationRules: [/*{
          type: 'minValue[0]',
          prompt: 'Must within 0 - 720 hours'
        },*/ {
            type: 'maxValue[720]',
            prompt: 'Must within 0 - 720 hours'
          }],
      }, {
        name: 'contactEmailName',
        type: 'text',
        label: 'Contact person name',
        placeholder: 'The name of contact for handling this amenity booking via email',
        icon: { cls: 'left icon', icon: 'user outline' },
        isRequired: false,
        validationRules: [{
          type: 'maxLength[50]',
          prompt: 'Not more than 50 characters',
        }],
      }, {
        name: 'contactEmailAddress',
        type: 'email',
        label: 'Email address',
        placeholder: 'Email address of the contact person',
        isRequired: false,
        validationRules: [{
          type: 'maxLength[100]',
          prompt: 'Not more than 100 characters',
        }, {
          type: 'email',
          prompt: 'Please enter a valid e-mail',
        }],
      }, {
        name: 'contactWhatsappName',
        label: 'WhatsApp contact person name',
        placeholder: 'The name of the contact person for handling this amenity booking via whatsapp',
        type: 'text',
        icon: { cls: 'left icon', icon: 'user outline' },
        isRequired: false,
        validationRules: [{
          type: 'maxLength[50]',
          prompt: 'Not more than 50 characters',
        }],
      }, {
        name: 'contactWhatsappNumber',
        label: 'WhatsApp number',
        placeholder: 'WhatsApp phone number of the contact person',
        icon: { cls: 'left icon', icon: 'phone' },
        type: 'text',
        isRequired: false,
        validationRules: [{
          type: 'maxLength[20]',
          prompt: 'Invalid phone number',
        }],
      }, {
        name: 'isRepetitiveBooking',
        type: 'checkbox',
        label: 'Is repetitive booking',
        isRequired: false,
      }],
      onSubmit: this.onFormSubmitted,
      onCancel: this.onCancel,
    })
    let formMkup = this._autoform.buildHtml()
    return formMkup
  }

  // Additional form validation: Since some situation cannot be
  // handled by Semantic-UI form validation.
  private async getAdditonalCheckingError(submittedValues: any): Promise<string | null> {
    if (submittedValues.bookingTimeBasic === 'time') {
      if (!submittedValues.timeOpen
        || !submittedValues.timeClose
        || !submittedValues.timeMinimum
        || !submittedValues.timeMaximum
        || !submittedValues.timeIncrement
      ) {
        return `When the booking time basic is 'By Time', you should specify the Time Open, Time Close, Time Maximum, Time Minimum and Time Increment`
      }
    } else if (submittedValues.bookingTimeBasic === 'section') {
      if ((!submittedValues.sectionBaseName1
        || !submittedValues.sectionBaseTimeBegin1
        || !submittedValues.sectionBaseTimeEnd1)
        && (!submittedValues.sectionBaseName2
          || !submittedValues.sectionBaseTimeBegin2
          || !submittedValues.sectionBaseTimeEnd2)
        && (!submittedValues.sectionBaseName3
          || !submittedValues.sectionBaseTimeBegin3
          || !submittedValues.sectionBaseTimeEnd3)
        && (!submittedValues.sectionBaseName4
          || !submittedValues.sectionBaseTimeBegin4
          || !submittedValues.sectionBaseTimeEnd4)
      ) {
        return `When the booking time basic is 'By Section', you should input as least one section (section name, section time begin & section time end)`
      }
    } else {
      throw new Error(`Unhandled booking time basic: ${submittedValues.bookingTimeBasic}`)
    }
    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('Amenities::onFormSubmitted()')

    evt.preventDefault()

    try {
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
      let result = await Ajax.saveRec('amenities', values, id)
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
        await Ajax.deleteRecById('amenities', id)
        this._datalistData = null
        await this.openPage()
        await this.loadData()
      } catch (ex: any) {
        Util.displayAlertDialog('Error', `Got '${ex.message}' when saving data. Please try again later`)
      }
    }
  }

}