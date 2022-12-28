import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'

const DATALIST_NAME = 'noticesDataList'
const DATAFORM_NAME = 'noticeDataForm'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned two column centered grid">
      <div class="row">
        <div class="left floated fourteen wide column">
          <label class="ui huge header">Notices</label>
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

type PrefetchedFolder = {
  id: string,
  name: string
}

export class Notices implements IPage {
  _recId?: string
  _el: JQuery<HTMLElement>
  _datalist: AutoList
  _autoform: AutoForm
  _prefetchedFolders: [PrefetchedFolder]
  _datalistData: any[]

  public constructor() {
    this._datalist = new AutoList({
      name: DATALIST_NAME,
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'title',
        type: 'intl',
        header: 'Title'
      }, {
        name: 'issueDate',
        type: 'date',
        header: 'Issue date',
      }, {
        name: 'audiences_residence',
        type: 'string',
        header: 'Residence audiences'
      }, {
        name: 'audiences_carpark',
        type: 'string',
        header: 'Carpark audience'
      }, {
        name: 'audiences_shop',
        type: 'string',
        header: 'Shop audience'
      }, {
        name: 'folder',
        type: 'string',
        header: 'Folder'
      }, {
        name: 'isNotifySent',
        type: 'boolean',
        header: 'Notified?'
      }],
      callerThis: this,
      onEditFn: this.onEdit.bind(this),
      onDeleteFn: this.onDelete.bind(this),
    })
  }

  public async openPage() {
    console.log('Notices::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('Notices::loadData()')

    if (this._datalistData == null) {
      let resp = await Ajax.getRecsByCrit('notices', {
        fields: 'id,title,issueDate,audiences,folderId,isNotifySent',
        sort: 'issueDate'
      })
      let notices = resp.data

      let folderIds = notices.map(e => `'${e.folderId}'`)
      resp = await Ajax.getRecsByCrit('folders', {
        fields: 'id,name',
        crit: `id in (${folderIds.join(',')})`
      })
      this._prefetchedFolders = resp.data
      this._prefetchedFolders.forEach(f => f.name = Util.intlStrFromJson(f.name))

      // Flatten the data for AutoList
      notices.forEach((notice: any) => {
        let folder = this._prefetchedFolders.find(e => e.id === notice.folderId)
        if (folder) {
          notice.folder = folder.name
        } else {
          notice.folder = '-'
        }

        let audiences = JSON.parse(notice.audiences)
        if (notice.audiences) {
          delete notice.audiences
          notice.audiences_residence = Util.audiencesToString(audiences.residence)
          notice.audiences_carpark = Util.audiencesToString(audiences.carpark)
          notice.audiences_shop = Util.audiencesToString(audiences.shop)
        }
      })
      this._datalistData = notices
    }

    // Make the AutoList to display availableDays in more informative
    this._datalist.data = this._datalistData

    $('#dataList').html(this._datalist.buildHtml())

    globalThis.app.navigator.setupEvents()
    this._datalist.setupEvents()
    $('#addNewBtn').off().on('click', this.onAddNew.bind(this))
  }

  // Db record to autoForm default values. Process the data before pass to AutoForm
  // (reverse version of afResultToRecord())
  private afOptFromRecord(record: any) {
    record.title = Util.intlStrFromJson(record.title)
    if (record.audiences) {
      let audiences = JSON.parse(record.audiences)
      delete record.audiences
      record.audiences_residence = JSON.stringify(audiences.residence)
      record.audiences_carpark = JSON.stringify(audiences.carpark)
      record.audiences_shop = JSON.stringify(audiences.shop)
    }
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
    values.title = Util.intlStrToJson(values.title)
    let audiences: any = {}
    audiences.residence = values.audiences_residence
    audiences.carpark = values.audiences_carpark
    audiences.shop = values.audiences_shop
    values.audiences = JSON.stringify(audiences)
    delete values.audiences_residence
    delete values.audiences_carpark
    delete values.audiences_shop
  }

  private async onAddNew(evt: Event) {
    console.log('Notices::onAddNew()')
    evt.preventDefault()

    // Setup the default values for Addnew
    let now = new Date()
    let editAutoformMkup = this.buildAutoformHtml(FormMode.New, {
      issueDate: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
    })

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Add New Notice</h2>
      ${editAutoformMkup}
    </div>
    `
    globalThis.app.setContentMarkup(html)
    this._el = $(`#${DATAFORM_NAME}`)
    this._autoform.setupEvents()
  }

  private async onEdit(id: string) {
    console.log(`Notices::onEdit('${id}')`)

    this._recId = id
    let result: any = await Ajax.getRecById('notices', id)
    let record = result.data
    this.afOptFromRecord(record)
    let editAutoformMkup = this.buildAutoformHtml(FormMode.Edit, record)

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Edit Notice Record</h2>
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
        name: 'title',
        type: 'text',
        label: 'Title',
        isRequired: true,
        placeholder: 'Notice title',
      }, {
        name: 'issueDate',
        type: 'date',
        label: 'Issue date',
        isRequired: true,
      }, {
        name: 'audiences_residence',
        type: 'checkboxes',
        label: 'Audience(s) for Residences',
        isRequired: true,
        checkboxOptions: [
          { text: 'Owner', value: 'owner' },
          { text: 'Tenant', value: 'tenant' },
          { text: 'Occupant', value: 'occupant' },
          { text: 'Agent', value: 'agent' },
        ],
      }, {
        name: 'audiences_carpark',
        type: 'checkboxes',
        label: 'Audience(s) for Carparks',
        isRequired: true,
        checkboxOptions: [
          { text: 'Owner', value: 'owner' },
          { text: 'Tenant', value: 'tenant' },
          { text: 'Occupant', value: 'occupant' },
          { text: 'Agent', value: 'agent' },
        ],
      }, {
        name: 'audiences_shop',
        type: 'checkboxes',
        label: 'Audience(s) for Shops',
        isRequired: true,
        checkboxOptions: [
          { text: 'Owner', value: 'owner' },
          { text: 'Tenant', value: 'tenant' },
          { text: 'Occupant', value: 'occupant' },
          { text: 'Agent', value: 'agent' },
        ],
      }, {
        name: 'folderId',
        type: 'dropdown',
        label: 'Status',
        isRequired: true,
        dropdownOptions: this._prefetchedFolders.map(e => {
          return {
            text: e.name,
            value: e.id,
          }
        }),
        validationRules: [{
          type: 'empty',
          prompt: 'Must select'
        }],
      }, {
        name: 'isNotifySent',
        type: 'checkbox',
        label: 'Is notify sent?',
        isRequired: false,
      }, {
        name: 'pdf',
        type: 'pdf',
        label: 'Notice PDF file (not more than 10 MB)',
        isRequired: true,
        pdfMeta: { maxFileSize: 10 * 1048576 },
        validationRules: [{
          type: 'empty',
          prompt: 'Cannot empty'
        }],
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
    let audis = []
    if (submittedValues.audiences_residence) {
      if (submittedValues.audiences_residence.owner === true)
        audis.push('residence_owner')
      if (submittedValues.audiences_residence.tenant === true)
        audis.push('residence_tenant')
      if (submittedValues.audiences_residence.occupant === true)
        audis.push('residence_occupant')
      if (submittedValues.audiences_residence.agent === true)
        audis.push('residence_agent')
    }
    if (submittedValues.audiences_carpark) {
      if (submittedValues.audiences_carpark.owner === true)
        audis.push('carpark_owner')
      if (submittedValues.audiences_carpark.tenant === true)
        audis.push('carpark_tenant')
      if (submittedValues.audiences_carpark.occupant === true)
        audis.push('carpark_occupant')
      if (submittedValues.audiences_carpark.agent === true)
        audis.push('carpark_agent')
    }
    if (submittedValues.audiences_shop) {
      if (submittedValues.audiences_shop.owner === true)
        audis.push('shop_owner')
      if (submittedValues.audiences_shop.tenant === true)
        audis.push('shop_tenant')
      if (submittedValues.audiences_shop.occupant === true)
        audis.push('shop_occupant')
      if (submittedValues.audiences_shop.agent === true)
        audis.push('shop_agent')
    }
    if (audis.length == 0) {
      return 'No audiences selected. You should select at least one audience from residence, carpark, or shop'
    }

    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('Notices::onFormSubmitted()')

    evt.preventDefault()

    try {
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
      let result = await Ajax.saveRec('notices', values, id)
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
        await Ajax.deleteRecById('notices', id)
        this._datalistData = null
        await this.openPage()
        await this.loadData()
      } catch (ex: any) {
        Util.displayAlertDialog('Error', `Got '${ex.message}' when saving data. Please try again later`)
      }
    }
  }

}