import PDFDocument from 'pdfkit'

import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { Constant } from '../libs/const'
import { AutoReport } from '../libs/autoreport'
import QRious from 'qrious'

const PAPER_WIDTH = 595
const PAPER_HEIGHT = 842
const PAGE_MARGIN = 30
const QRCODE_SIZE = 100

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned one column centered grid">
      <div class="row">
        <div class="column">
          <label class="ui huge header">Print Unit QR-Code</label>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <p>Printing the Unit QR-Codes is necessary for the tenants to register to use the EstateMan. You'll need to print the QR-Codes for every unit (print Residences, Carparks, and Shops individually). Insert the printed QR-Code into all unit's mailboxes (make sure the QR-codes are placed in the correct mailboxes). When the tenant received the QR-Code. They can download the EstateMan mobile app. Run the app and scan the QR-Code. Thus the app associates with the unit. Input their name, phone no. or email address, and password. Finally, they can use the App day by day.</p>
          <p>
          To print the Unit QR-Codes, please select below options:
          </p>
        </div>
      </div>
      <div class="row">
        <div class="column">
          <div id="formPrtOptions" class="ui form">
            <div class="required field">
              <label>Property type</label>
              <select name="unitType" class="ui dropdown">
                <option value="res">Residence</option>
                <option value="car">Carpark</option>
                <option value="shp">Shop</option>
              </select>
            </div>
            <div class="field">
              <div class="ui checkbox">
                <input type="checkbox" name="includeAppQrcodes" checked>
                <label>Include EstateMan Tenant App download QR-Codes</label>
              </div>
            </div>
            <div class="three fields">
              <div class="required field">
                <label>Block</label>
                <input name="blocks" type="text" placeholder="Block name or number" value="*" />
              </div>
              <div class="required field">
                <label>Floor</label>
                <input name="floors" type="text" placeholder="Floor name or number" value="*" />
              </div>
              <div class="required field">
                <label>Number</label>
                <input name="numbers" type="text" placeholder="Room number for residence and shop. Or part number for carpark" value="*" />
              </div>
            </div>
            <div class="ui message">
              <div class="header">Hints</div>
              <p>To filter the units, you can enter specific or range of Block name, Floor name and room number. Valid examples are:</p>
              <ul>
                <li>Block: "1", "A", "1,2,3", "1-3", "A-C"</li>
                <li>Floor: "1", "1,2,3", "1-10", "G,1,2", "B2,B1,G,1,2", "B2-2"</li>
                <li>Number: "1", "A", "1,2,3,5,6", "1-3,5,6,9-10", "A-G"</li>
              </ul>
            </div>
            <div id="okBtn" class="ui primary submit button">Generate preview PDF</div>
            <div id="clearBtn" class="ui clear button">Clear</div>
            <div class="ui error message"></div>
          </div>
          <div class="ui container" style="margin-top: 10px">
            <div id="progressPdf" data-percent="0" class="ui progress" style="display:none">
              <div class="bar">
                <div class="progress"></div>
              </div>
              <div class="label"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">
        </div>
      </div>
    </div>
  </div>
</div>
`

type AvailableUnits = {
  blocks: Array<string>
  floors: Array<string>
  numbers: Array<string>
}

type UniqueUnits = {
  residences: AvailableUnits
  carparks: AvailableUnits
  shops: AvailableUnits
}

export class PrtUnitQrcode implements IPage {
  _allUnits: Array<any>
  _uniqUnits: UniqueUnits

  public constructor() {
  }

  public async openPage() {
    console.log('PrtUnitQrcode::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('PrtUnitQrcode::loadData()')

    if (this._uniqUnits == null) {
      this._uniqUnits = {} as UniqueUnits

      // let unitIds = tenants.map(e => `'${e.unitId}'`)
      let resp = await Ajax.getRecsByCrit('units', {
        fields: 'id,type,block,floor,number',
        // crit: `id in (${unitIds.join(',')})`
      })
      this._allUnits = resp.data
      let units = this._allUnits.filter(e => e.type === 'res')
      let blocks = units.map(e => e.block)
      let floors = units.map(e => e.floor)
      let numbers = units.map(e => e.number)
      this._uniqUnits.residences = {
        blocks: [...new Set(blocks)] as Array<string>,
        floors: [...new Set(floors)] as Array<string>,
        numbers: [...new Set(numbers)] as Array<string>,
      }

      units = this._allUnits.filter(e => e.type === 'car')
      blocks = units.map(e => e.block)
      floors = units.map(e => e.floor)
      numbers = units.map(e => e.number)
      this._uniqUnits.carparks = {
        blocks: [...new Set(blocks)] as Array<string>,
        floors: [...new Set(floors)] as Array<string>,
        numbers: [...new Set(numbers)] as Array<string>,
      }

      units = this._allUnits.filter(e => e.type === 'shp')
      blocks = units.map(e => e.block)
      floors = units.map(e => e.floor)
      numbers = units.map(e => e.number)
      this._uniqUnits.shops = {
        blocks: [...new Set(blocks)] as Array<string>,
        floors: [...new Set(floors)] as Array<string>,
        numbers: [...new Set(numbers)] as Array<string>,
      }
    }

    this.setupEvents()
  }

  private setupEvents() {
    $('.ui.checkbox').checkbox()
    $('#formPrtOptions').form({
      inline: true,
      fields: {
        blocks: {
          identifier: 'blocks',
          rules: [{
            type: 'empty',
            prompt: 'Please input the block(s) you want to print'
          }],
        },
        floors: {
          identifier: 'floors',
          rules: [{
            type: 'empty',
            prompt: 'Please input the floor(s) you want to print'
          }],
        },
        numbers: {
          identifier: 'numbers',
          rules: [{
            type: 'empty',
            prompt: 'Please input the room/carpark/shop number(s) you want to print'
          }],
        },
      },
      onSuccess: this.onFormSubmitted.bind(this)
    })
  }

  private async onFormSubmitted(evt: any) {
    console.log('PrtUnitQrcode::onFormSubmitted()')

    let form = $(evt.currentTarget)
    let formEntries = form.form('get values')
    try {
      let units: AvailableUnits
      if (formEntries.unitType === 'res') {
        units = this._uniqUnits.residences
      } else if (formEntries.unitType === 'car') {
        units = this._uniqUnits.carparks
      } else if (formEntries.unitType === 'shp') {
        units = this._uniqUnits.shops
      } else {
        throw new Error(`Unhandled unit type: ${formEntries.unitType}`)
      }

      let blocks = Util.parseBlocknamesStr(units.blocks, formEntries.blocks)
      if (blocks.length === 0) {
        throw new Error('No block names are matched. Please enter the valid block name')
      }

      let floors = Util.parseFloornamesStr(units.floors, formEntries.floors)
      if (floors.length === 0) {
        throw new Error('No floor names are matched. Please enter the valid floor name')
      }

      let numbers = Util.parseNumbernamesStr(units.numbers, formEntries.numbers)
      if (numbers.length === 0) {
        throw new Error('No number names are matched. Please enter the valid number name')
      }

      await this.printMatchedUnits(formEntries, blocks, floors, numbers)
    } catch (ex) {
      debugger
      form.form('add errors', [ex.message])
    }
  }

  private async preparePdf(progressBar: JQuery<HTMLElement>, progressMaxVal: number) {
    $('#okBtn').addClass('disabled loading')
    $('#clearBtn').addClass('disabled')

    // progressBar.progress()
    progressBar.progress({
      value: 0,
      total: progressMaxVal,
      onSuccess: () => {
        const msg = `Finished. Please set your browser to allow popup if you don't see the PDF preview`
        progressBar.find('.label').html(msg)
      }
    })
    progressBar.find('.label').html('Generating PDF...')
    progressBar.show()

    await Util.sleep(100)
  }

  private async printMatchedUnits(formEntries: any, blocks: Array<string>, floors: Array<string>, numbers: Array<string>) {

    let unitType = formEntries.unitType
    let matchedUnits = this._allUnits.filter(u => {
      if (u.type === unitType && blocks.includes(u.block) && floors.includes(u.floor) && numbers.includes(u.number)) {
        return true
      } else {
        return false
      }
    })

    if (matchedUnits.length === 0) {
      throw new Error('No matching units. Please make sure the inputted block, floor or number are realistic.')
    }

    let progressBar = $('#progressPdf')
    this.preparePdf(progressBar, matchedUnits.length)

    const autoRpt = new AutoReport()
    let pdf = autoRpt.startDrawing($('#pdfGeneration'))
    pdf.fontSize(16)

    let done = false
    let unitNum = 0
    while (!done) {
      let x = 0, y = PAGE_MARGIN
      pdf.addPage()

      // One page prints two slips
      for (let i = 0; i < 2 && !done; ++i) {
        let unit = matchedUnits[unitNum]
        this.renderOneUnit(pdf, {
          unit: unit,
          margin: PAGE_MARGIN,
          y: y,
          qrcodeSize: QRCODE_SIZE,
          paperWidth: PAPER_WIDTH,
        })

        // Separator
        pdf.moveTo(0, y - PAGE_MARGIN).lineTo(PAPER_WIDTH, y - PAGE_MARGIN).undash().stroke()

        y += PAPER_HEIGHT / 2
        progressBar.progress('increment')
        await Util.sleep(0)

        if (++unitNum >= matchedUnits.length) {
          done = true
        }
      }

      pdf.flushPages()
    }

    autoRpt.endDrawing()

    $('#okBtn').removeClass('disabled loading')
    $('#clearBtn').removeClass('disabled')
    await Util.sleep(100)

    autoRpt.displayPreview()
  }

  private renderOneUnit(pdf: PDFDocument, opts: any) {
    const androidAppDllink = globalThis.config.tenantAppAndroidUrl
    const iOSAppDllink = globalThis.config.tenantAppIOSUrl
    let y = opts.y

    pdf.text(`EstateMan Tenant App Download Invitation. Please scan the below QR-Code according to your mobile device`, opts.margin, y, {
      align: 'center'
    })
    y += 50

    // Android download qrcode: QRcode generator doc: https://github.com/neocotic/qrious
    let dataURL = this.genQrcodeDataUrl(androidAppDllink, opts.qrcodeSize)
    let x = opts.margin
    pdf.image(dataURL, x, y)
    pdf.text('Android', x, y + opts.qrcodeSize + 5, {
      align: 'center',
      width: opts.qrcodeSize
    })
    if (pdf._imageRegistry && pdf._imageRegistry[dataURL])
      delete pdf._imageRegistry[dataURL]

    // iOS download qrcode
    dataURL = this.genQrcodeDataUrl(iOSAppDllink, opts.qrcodeSize)
    x = opts.paperWidth - opts.qrcodeSize - opts.margin
    pdf.image(dataURL, x, y)
    pdf.text('iOS', x, y + opts.qrcodeSize + 5, {
      align: 'center',
      width: opts.qrcodeSize
    })
    if (pdf._imageRegistry && pdf._imageRegistry[dataURL])
      delete pdf._imageRegistry[dataURL]

    // Divider 1
    y += opts.qrcodeSize + 25
    pdf.moveTo(0, y).lineTo(600, y).dash(5, { space: 10 }).stroke()

    // Unit info
    y += 20
    pdf.text(`When the App first starts, please scan below QR-Code and enter your information`, opts.margin, y, {
      align: 'center',
      width: opts.paperWidth - opts.margin * 2,
    })
    y += 40

    // Unit QR-Code
    let unitQrcode = `${globalThis.config.unitQrAppDownloadUrl}/${globalThis.app.userId}/${opts.unit.id}`
    dataURL = this.genQrcodeDataUrl(unitQrcode, opts.qrcodeSize)
    x = (opts.paperWidth / 2 - opts.qrcodeSize / 2)
    pdf.image(dataURL, x, y)
    pdf.text(`Unit: Block ${opts.unit.block}. Floor ${opts.unit.floor}. Room ${opts.unit.number}`, opts.margin, y + opts.qrcodeSize + 5, {
      align: 'center',
      width: opts.paperWidth - opts.margin * 2,
    })
    if (pdf._imageRegistry && pdf._imageRegistry[dataURL])
      delete pdf._imageRegistry[dataURL]
  }

  private genQrcodeDataUrl(value: string, size: number): string {
    let qrcode = new QRious({
      foregroundAlpha: 0.8,
      // level: 'H',
      padding: 0,
      size: 100,
      value: value
    })
    return qrcode.toDataURL()
  }

}