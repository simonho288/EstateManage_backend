import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'

const DATALIST_NAME = 'tenantsDataList'
const DATAFORM_NAME = 'tenantDataForm'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned two column centered grid">
      <div class="row">
        <div class="left floated fourteen wide column">
          <label class="ui huge header">Tenants</label>
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

export class Tenants implements IPage {
  _recId?: string
  _el: JQuery<HTMLElement>
  _datalist: AutoList
  _autoform: AutoForm
  // _prefetchedUnits: [any]
  _tenantsGroup: object
  _datalistData: any[]

  public constructor() {
    this._datalist = new AutoList({
      name: DATALIST_NAME,
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'name',
        type: 'string',
        header: 'Name'
      }, {
        name: 'phone',
        type: 'string',
        header: 'Phone',
      }, {
        name: 'email',
        type: 'string',
        header: 'Email',
      }, {
        name: 'status',
        type: 'string',
        header: 'Status',
      }, {
        name: 'unit',
        type: 'string',
        header: 'Unit'
      }],
      callerThis: this,
      onEditFn: this.onEdit.bind(this),
      onDeleteFn: this.onDelete.bind(this),
    })
  }

  public async openPage() {
    console.log('Tenants::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('Tenants::loadData()')

    if (this._datalistData == null) {
      let resp = await Ajax.getAllTenentsWithUnits()
      // let tenants = resp.data
      this._tenantsGroup = Util.groupBy(resp.data, 'TenantId')
      let tenants = []
      for (let id in this._tenantsGroup) {
        let grp = this._tenantsGroup[id]
        let units = []
        for (let i = 0; i < grp.length; ++i) {
          let unit = grp[i]
          let unitName = unit.type === 'res' ? 'Residence'
            : unit.type === 'car' ? 'Carpark'
              : unit.type === 'shp' ? 'Shop' : '??'
          units.push(`${unitName}:${unit.block},${unit.floor},${unit.number}`)
        }
        tenants.push({
          id: id,
          name: grp[0].name,
          email: grp[0].email,
          phone: grp[0].phone,
          status: grp[0].status === 1 ? 'active'
            : grp[0].status === 2 ? 'removed' : '??',
          unit: units.join(' ')
        })
      }
      this._datalistData = tenants
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
  }

  // AutoForm result values to db record. Process the data before save
  // (reverse version of afOptFromRecord())
  private afResultToRecord(values: any): any {
    if (values.password != null && values.password.trim() === '')
      delete values.password
    if (this._autoform.mode === FormMode.New) {
      values.recType = 0 // Force this record is human rather than machine
    }
  }

  private async onAddNew(evt: Event) {
    console.log('Tenants::onAddNew()')
    evt.preventDefault()

    // Setup the default values for Addnew
    let now = new Date()
    let editAutoformMkup = this.buildAutoformHtml(FormMode.New, {
      dateStart: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
    }, null)

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Add New Tenant</h2>
      ${editAutoformMkup}
    </div>
    `
    globalThis.app.setContentMarkup(html)
    this._el = $(`#${DATAFORM_NAME}`)
    this._autoform.setupEvents()
  }

  private async onEdit(id: string) {
    console.log(`Tenants::onEdit('${id}')`)

    this._recId = id

    // First, get the tenant record
    let result: any = await Ajax.getRecById('tenants', id)
    let tenant = result.data
    this.afOptFromRecord(tenant)

    // Second, get the tenant units
    result = await Ajax.queryDatabase(`SELECT Units.id,Units.type,Units.block,Units.floor,Units.number,TenantUnits.role FROM Units INNER JOIN TenantUnits ON TenantUnits.unitId=Units.id WHERE TenantUnits.tenantId='${tenant.id}' AND Units.userId='${globalThis.app.userId}'`)
    let units = result.data
    units.forEach(u => {
      let utype = u.type === 'res' ? 'Residence' :
        u.type === 'car' ? 'Carpark' :
          u.type === 'shp' ? 'Shop' : '??'
      u.unit = `${utype} - Block: ${u.block}, Floor: ${u.floor}, Number: ${u.number}`
    })

    let editAutoformMkup = this.buildAutoformHtml(FormMode.Edit, tenant, units)

    let html = `
    <div class="ui container dataEditForm">
      <h2 class="title">Edit Tenant Record</h2>
      ${editAutoformMkup}
    </div>
    `
    globalThis.app.setContentMarkup(html)
    this._el = $(`#${DATAFORM_NAME}`)
    this._autoform.setupEvents()
  }

  private buildAutoformHtml(mode: FormMode, tenant: object, units: object[]) {
    let childList = new AutoList({
      name: 'tenantUnitsDataList',
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'unit',
        type: 'string',
        header: 'Unit'
      }, {
        name: 'role',
        type: 'string',
        header: 'Role',
      }],
      callerThis: this,
      tableCls: '',
      // onEditFn: this.onEditUnit.bind(this), // Multi-level popup is not yet supported
      // onDeleteFn: this.onDeleteUnit.bind(this), // Multi-level popup is not yet supported
    })
    childList.data = units
    // Setup a AutoForm for record edit
    this._autoform = new AutoForm({
      name: DATAFORM_NAME,
      mode: mode,
      defaultValue: tenant,
      callerThis: this,
      fields: [{
        name: 'name',
        type: 'text',
        label: 'Name',
        isRequired: true,
        placeholder: 'Tenant title',
      }, {
        name: 'password',
        type: 'password',
        label: 'Tenant login password',
        isRequired: false,
        validationRules: [{
          type: 'minLength[6]',
          prompt: 'Password at least 6 characters'
        }],
      }, {
        name: 'phone',
        type: 'text',
        label: 'Tenant phone number',
        isRequired: false,
      }, {
        name: 'email',
        type: 'email',
        label: 'Tenant email address',
        isRequired: false,
      }, {
        name: 'status',
        type: 'dropdown',
        label: 'Status',
        isRequired: true,
        dropdownOptions: [
          { text: 'Active', value: String(1) },
          { text: 'Removed', value: String(2) },
        ],
        validationRules: [{
          type: 'empty',
          prompt: 'Must select'
        }],
      }, {
        name: 'units',
        type: 'autolist',
        autolist: childList
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
    return null
  }

  private async onFormSubmitted(evt: Event) {
    console.log('Tenants::onFormSubmitted()')

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
      let result = await Ajax.saveRec('tenants', values, id)
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
    console.log(id)

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

  // private async onEditUnit(unitId: string) {
  //   debugger
  // }

  private async onDeleteUnit(unitId: string) {
    let ok = await Util.displayConfirmDialog('Warning', 'Surely want to dissociate this unit with the current tenant?')
    if (ok) {
      try {
        // TenantUnits table has two primary keys
        let sql = `DELETE FROM TenantUnits WHERE tenantId='${this._recId}' AND unitId='${unitId}'`
        await Ajax.runSql(sql)
        await this.openPage()
        await this.loadData()
      } catch (ex: any) {
        Util.displayAlertDialog('Error', `Got '${ex.message}' when saving data. Please try again later`)
      }
    }
  }

}