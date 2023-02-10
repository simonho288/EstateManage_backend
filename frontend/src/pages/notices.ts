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
        name: 'target_audiences',
        type: 'string',
        header: 'Audience(s)'
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
          notice.target_audiences = Util.audiencesToString(audiences)
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
      record.target_audiences = record.audiences
      delete record.audiences
    }
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
    values.title = Util.intlStrToJson(values.title)
    values.audiences = JSON.stringify(values.target_audiences)
    delete values.targent_audiences
    values.isNotifySent = values.isNotifySent ? 1 : 0
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
        name: 'target_audiences',
        type: 'checkboxes',
        label: 'Target Audience(s)',
        isRequired: true,
        checkboxOptions: [
          { text: 'Residence', value: 'res' },
          { text: 'Carpark', value: 'car' },
          { text: 'Shop', value: 'shp' },
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
        popup: 'System Assigned: When you click [Send Notification], this will be checked. Please remind that sending multiple notifications causes annoyance. Make sure that you send it again only when the notice is amended seriously.',
        isRequired: false,
        isEditable: false,
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
      extras: {
        buttons: [{
          id: 'sendNoftnBtn',
          text: 'Send Notification',
          onClick: this.sendNotification,
          cls: 'orange',
        }]
      }
    })
    let formMkup = this._autoform.buildHtml()
    return formMkup
  }

  // Additional form validation: Since some situation cannot be
  // handled by Semantic-UI form validation.
  private async getAdditonalCheckingError(submittedValues: any): Promise<string | null> {
    if (submittedValues.target_audiences.res == false && submittedValues.target_audiences.car == false && submittedValues.target_audiences.shp == false) {
      return 'No audiences selected. You should select at least one audience from residence, carpark, or shop'
    }

    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('Notices::onFormSubmitted()')

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
      let result = await Ajax.saveRec('notices', values, id)
      this._autoform.setLoading(false)
      if (result && result.data && result.data.success) {
        this._autoform.destroy()
        this._datalistData = null
        await this.openPage()
        await this.loadData()
      }
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

  private async sendNotification(evt: Event) {
    console.log('Notices: sendNotification()')

    evt.preventDefault()

    try {
      if (!this._autoform.validate()) return
      let values = await this._autoform.getSubmittedValues()
      let addnlErr = await this.getAdditonalCheckingError(values)
      if (addnlErr != null) {
        this._autoform.setError(addnlErr)
        return
      }

      if (await Util.displayConfirmDialog('Attention', 'Are you sure you want to send the notification to the target audiences? Sending multiple notifications causes annoyance.') != true)
        return

      // console.log(values)  
      this.afResultToRecord(values)
      this._autoform.setLoading(true)

      let id: string | null = this._autoform.mode === FormMode.Edit ? this._recId : null
      values.isNotifySent = 1
      let result = await Ajax.saveRec('notices', values, id)
      if (result.data && result.data.success) {
        let result = await Ajax.noticePushNotifyToTenants(id)
        if (result.data && result.data.success) {
          await Util.displayAlertDialog('Success', 'Notifications sent and the record saved successfully. Please click OK to return')

          this._autoform.destroy()
          this._datalistData = null
          await this.openPage()
          await this.loadData()
        }
      }
      this._autoform.setLoading(false)
    } catch (ex: any) {
      this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
    }
  }

}