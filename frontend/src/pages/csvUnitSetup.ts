import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { Constant } from '../libs/const'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned one column centered grid">
      <div class="row">
        <div class="column">
          <label class="ui huge header">Batch setup all units by CSV file</label>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <p>The residence/carpark/shop units can be setup at once using batch setup. Usually, it is useful for the estate's initial setup. Because it is almost impossible if the estate has several hundred units.<p>
          <p>If you want to do so, please follow the below steps:</p>
          <ul>
            <li>Open a spreadsheet program such as Excel, Google Sheet or Apple Numbers</li>
            <li>Create three columns: Block, Floor, Number.</li>
            <li>For each row, enter the block/floor/number. e.g. A,1,1 then A,1,2 ...</li>
            <li>Select whole sheet and copy to the clipboard</li>
            <li>Paste to the below residence or carpark or shop CSV content input area.</li>
            <li>Click [Confirm] button to start processing</li>
          </ul>
          <div class="ui violet message">
            <div class="header">Warning</div>
            <p>Note that all existing unit data will be replaced by the new contents. If also affect the tenants who are assoicated with that units</p>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <div id="formResidences" class="ui form">
            <div class="field">
              <label>Residences CSV content</label>
              <div class="ui left corner labeled fluid input">
                <div class="ui left corner label">
                  <i class="asterisk icon"></i>
                </div>
                <textarea name="csvContent"></textarea>
              </div>
            </div>
            <div class="ui primary submit button">Confirm</div>
            <div class="ui clear button">Clear</div>
            <div class="ui error message"></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <div id="formCarparks" class="ui form">
            <div class="field">
              <label>Carparks CSV content</label>
              <div class="ui left corner labeled fluid input">
                <div class="ui left corner label">
                  <i class="asterisk icon"></i>
                </div>
                <textarea name="csvContent"></textarea>
              </div>
            </div>
            <button class="ui primary submit button">Confirm</button>
            <div class="ui clear button">Clear</div>
            <div class="ui error message"></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <div id="formShops" class="ui form">
            <div class="field">
              <label>Shops CSV content</label>
              <div class="ui left corner labeled fluid input">
                <div class="ui left corner label">
                  <i class="asterisk icon"></i>
                </div>
                <textarea name="csvContent"></textarea>
              </div>
            </div>
            <button class="ui primary submit button">Confirm</button>
            <div class="ui clear button">Clear</div>
            <div class="ui error message"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`

export class CsvUnitBatchSetup implements IPage {
  public constructor() {
  }

  public async openPage() {
    console.log('CsvUnitSetup::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('CsvUnitSetup::loadData()')

    this.setupEvents()
  }

  private setupEvents() {
    $('#formResidences').form({
      inline: true,
      fields: {
        csvContent: {
          identifier: 'csvContent',
          rules: [{
            type: 'empty',
            prompt: 'Please copy & paste the residences CSV to here'
          }],
        },
      },
      onSuccess: this.onFormResidencesSubmitted.bind(this)
    })
    $('#formCarparks').form({
      inline: true,
      fields: {
        csvContent: {
          identifier: 'csvContent',
          rules: [{
            type: 'empty',
            prompt: 'Please copy & paste the carparks CSV to here'
          }],
        },
      },
      onSuccess: this.onFormCarparksSubmitted.bind(this)
    })
    $('#formShops').form({
      inline: true,
      fields: {
        csvContent: {
          identifier: 'csvContent',
          rules: [{
            type: 'empty',
            prompt: 'Please copy & paste the shops CSV to here'
          }],
        },
      },
      onSuccess: this.onFormShopsSubmitted.bind(this)
    })
  }

  private async onFormResidencesSubmitted(evt: any) {
    console.log('CsvUnitSetup::onFormResidencesSubmitted()')

    let form = $(evt.currentTarget)
    let formEntries = form.form('get values')
    try {
      let unitsArray = Util.validateUnitCsv(formEntries.csvContent)
      let reply = await Util.displayConfirmDialog('Last Warning', `Are you sure that to replace all existing Residence records with these ${unitsArray.length} units?<p />
<div class="ui error message">
  <div class="header">DANGER</div>
  <p>If any tenant(s) are associated with existing units, the links will be broken. It cannot be undone</p>
</div>
`)
      if (reply) {
        let result = await Ajax.uploadToReplaceUnits('res', unitsArray)
        if (result.data.success) {
          await Util.displayAlertDialog('Success', 'Residences data updated successfully')
        }
      }
    } catch (ex) {
      form.form('add errors', [ex.message])
    }
  }

  private async onFormCarparksSubmitted(evt: any) {
    console.log('CsvUnitSetup::onFormCarparksSubmitted()')

    let form = $(evt.currentTarget)
    let formEntries = form.form('get values')
    try {
      let unitsArray = Util.validateUnitCsv(formEntries.csvContent)
      console.log(unitsArray)
      let reply = await Util.displayConfirmDialog('Last Warning', `Are you sure that to replace all existing Carpark records with these ${unitsArray.length} units?<p />
<div class="ui error message">
  <div class="header">DANGER</div>
  <p>If any tenant(s) are associated with existing units, the links will be broken. It cannot be undone</p>
</div>
`)
      if (reply) {
        let result = await Ajax.uploadToReplaceUnits('car', unitsArray)
        if (result.data.success) {
          await Util.displayAlertDialog('Success', 'Carparks data updated successfully')
        }
      }
    } catch (ex) {
      form.form('add errors', [ex.message])
    }
  }

  private async onFormShopsSubmitted(evt: any) {
    console.log('CsvUnitSetup::onFormShopsSubmitted()')

    let form = $(evt.currentTarget)
    let formEntries = form.form('get values')
    try {
      let unitsArray = Util.validateUnitCsv(formEntries.csvContent)
      console.log(unitsArray)
      let reply = await Util.displayConfirmDialog('Last Warning', `Are you sure that to replace all existing Shop records with these ${unitsArray.length} units?<p />
<div class="ui error message">
  <div class="header">DANGER</div>
  <p>If any tenant(s) are associated with existing units, the links will be broken. It cannot be undone</p>
</div>
`)
      if (reply) {
        let result = await Ajax.uploadToReplaceUnits('shp', unitsArray)
        if (result.data.success) {
          await Util.displayAlertDialog('Success', 'Shops data updated successfully')
        }
      }
    } catch (ex) {
      form.form('add errors', [ex.message])
    }
  }

}