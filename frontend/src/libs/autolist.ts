/**
 * AutoList: Auto generate table to display data list.
 * Usage:
 * 1. Create the instance
 * let datalist = new AutoList({
 *   fields: [{
 *     name: 'id',
 *     type: 'id',
 *   }, {
 *   ...
 *   <See the below 'Options' for more info>
 * 2. Provide the data
 * datalist.data = array of data (match property name with field name)
 * 3. Build the HTML markup for rendering
 * html = datalist.buildHtml()
 * 4. Render the markup into the element
 * $('<element>').html(html)
 * 5. Setup the events to start operation
 * datalist.setupEvents()
 */


import { Util } from '../libs/util'
import { Constant } from '../libs/const'

export interface IIdField {
  type: 'id'
  name: string
}
export interface IStringField {
  type: 'string'
  name: string
  header: string
}
export interface INumberField {
  type: 'number'
  name: string
  header: string
}
export interface IIntlField {
  type: 'intl'
  name: string
  header: string
}
export interface IThumbnailField {
  type: 'thumbnail'
  name: string
  header: string
}
export interface ICurrencyField {
  type: 'currency'
  name: string
  header: string
}
export interface IPasswordField {
  type: 'password'
  name: string
  header: string
}
export interface IBooleanField {
  type: 'boolean'
  name: string
  header: string
}
export interface IDateField {
  type: 'date'
  name: string
  header: string
}

type Field = IIdField | IStringField | INumberField | IIntlField | IThumbnailField | ICurrencyField | IPasswordField | IBooleanField | IDateField

type EditFunction = (id: string) => void
type DeleteFunction = (id: string) => void

type Options = {
  name: string // autolist name
  fields: Field[]
  tableCls?: string // e.g. 'celled'
  callerThis: any
  onEditFn?: EditFunction
  onDeleteFn?: DeleteFunction
}

export class AutoList {
  _options: Options
  private _data: any
  _el: JQuery<HTMLElement>

  public get data(): any {
    return this._data
  }
  public set data(value: any) {
    this._data = value
  }

  public constructor(opts: Options) {
    console.log('AutoList::constructor()')

    if (opts.fields.length === 0) throw new Error('Fields not defined')

    this._options = opts
    if (this._options.tableCls == null) {
      this._options.tableCls = 'single line striped selectable unstackable'
    }
  }

  public buildHtml(): string {
    console.log('AutoList::buildHtml()')

    let mkup = []
    this.buildMkupHead(mkup)

    if (this._data && this._data.length) {
      for (let r = 0; r < this._data.length; ++r) {
        let data = this._data[r]

        // Retrieve the record id if available, assign to attr('id')
        let idField = this._options.fields.find(e => e.type === 'id')
        let idVal = idField != null ? data[idField.name] : ''
        if (!idVal) throw new Error(`id field not found`)
        mkup.push(`<tr class='id' data-id="${idVal}">`)
        for (let i = 0; i < this._options.fields.length; ++i) {
          let fld: Field = this._options.fields[i]
          switch (fld.type) {
            case 'id': break; // already handled
            case 'string':
              this.buildStringCell(fld, mkup, data)
              break
            case 'number':
              this.buildNumberCell(fld, mkup, data)
              break
            case 'intl':
              this.buildIntlStringCell(fld, mkup, data)
              break
            case 'password':
              this.buildPasswordCell(fld, mkup, data)
              break
            case 'thumbnail':
              this.buildThumbnailCell(fld, mkup, data)
              break;
            case 'currency':
              this.buildCurrencyCell(fld, mkup, data)
              break;
            case 'boolean':
              this.buildBooleanCell(fld, mkup, data)
              break;
            case 'date':
              this.buildDateCell(fld, mkup, data)
              break;
            default:
              debugger
              throw new Error(`Unhandled field type`)
          }
        }
        this.buildOperationCell(mkup)
        mkup.push(`</tr>`)
      }
    } else {
      mkup.push('<tr><td><i>No data</i></td></tr>')
    }
    this.buildMkupTail(mkup)

    return mkup.join('\n')
  }

  private buildMkupHead(mkup: string[]) {
    mkup.push(`<div class="AutoList">`)
    mkup.push(`<table id="${this._options.name}" class="ui ${this._options.tableCls} table">`)
    mkup.push(`<thead><tr>`)
    for (let i = 0; i < this._options.fields.length; ++i) {
      let fld: Field = this._options.fields[i]
      if (fld.type === 'id') continue // Skip these field types
      mkup.push(`<th>${fld.header}</th>`)
    }
    // List operation cell
    if (this._options.onEditFn != null || this._options.onDeleteFn != null) {
      mkup.push(`<th></th>`)
    }
    mkup.push(`</tr></thead>`)
    mkup.push(`<tbody>`)
  }

  private buildMkupTail(mkup: string[]) {
    mkup.push(`</tbody>`)
    mkup.push(`</table>`)
    mkup.push(`</div>`)
  }

  // Operation cells are 'edit', 'del'
  private buildOperationCell(mkup: string[]) {
    if (this._options.onEditFn != null || this._options.onDeleteFn != null) {
      let html = ''
      if (this._options.onEditFn != null) {
        // html += `
        // <button class="ui icon button editBtn">
        // <i class="edit outline icon"></i>
        // </button>
        // `
        html += `
<div class="ui vertical animated tiny button editBtn">
  <div class="hidden content">Edit</div>
  <div class="visible content">
    <i class="edit outline icon"></i>
  </div>
</div>`
      }
      if (this._options.onDeleteFn != null) {
        // html += `<button class="ui icon button deleteBtn">
        // <i class="trash alternate outline icon"></i>
        // </button>
        // `
        html += `
<div class="ui vertical animated tiny button deleteBtn">
  <div class="hidden content">Delete</div>
  <div class="visible content">
    <i class="trash alternate outline icon"></i>
  </div>
</div>`
      }
      mkup.push(`<td>${html}</td>`)
    }
  }

  private buildStringCell(fld: Field, mkup: string[], data: any) {
    let val = data[fld.name] ?? ''
    mkup.push(`<td>${Util.escapeHTML(val)}</td>`)
  }

  private buildNumberCell(fld: Field, mkup: string[], data: any) {
    let val = data[fld.name] ?? ''
    mkup.push(`<td>${val.toString()}</td>`)
  }

  private buildIntlStringCell(fld: Field, mkup: string[], data: any) {
    // let val = JSON.parse(data[fld.name])
    let val = ''
    if (data[fld.name] != null) {
      val = Util.intlStrFromJson(data[fld.name])
    }
    mkup.push(`<td>${Util.escapeHTML(val)}</td>`)
  }

  private buildPasswordCell(fld: Field, mkup: string[], data: any) {
    mkup.push(`<td>*****</td>`)
  }

  private buildThumbnailCell(fld: Field, mkup: string[], data: any) {
    if (data[fld.name] != null) {
      let val = data[fld.name]
      mkup.push(`<td><img src="${val}" class="dataListThumbnail" /></td>`)
    } else {
      mkup.push(`<td><img src="${Constant.unknownImage.rect50x27}" class="dataListThumbnail" /></td>`)
    }
  }

  private buildCurrencyCell(fld: Field, mkup: string[], data: any) {
    const formatter = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'USD',
    })
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    let val = ''
    if (data[fld.name] != null) {
      val = formatter.format(parseFloat(data[fld.name]))
    }
    mkup.push(`<td>${val}</td>`)
  }

  private buildBooleanCell(fld: Field, mkup: string[], data: any) {
    let val = ''
    if (data[fld.name]) {
      val = '<i class="check circle outline icon"></i>'
    } else {
      val = '<i class="circle outline icon"></i>'
    }
    mkup.push(`<td>${val}</td>`)
  }

  private buildDateCell(fld: Field, mkup: string[], data: any) {
    let val = ''
    if (data[fld.name]) {
      val = data[fld.name]
    } else {
      val = '-'
    }
    mkup.push(`<td>${val}</td>`)
  }

  public setupEvents() {
    this._el = $(`#${this._options.name}`)
    this._el.find('div.editBtn').off().on('click', this.onEditBtnClicked.bind(this))
    this._el.find('div.deleteBtn').off().on('click', this.onDeleteBtnClicked.bind(this))
  }

  private onEditBtnClicked(evt: any) {
    evt.preventDefault()
    let id = $(evt.currentTarget).closest('tr').data('id')
    this._options.onEditFn(id)
  }

  private onDeleteBtnClicked(evt: any) {
    evt.preventDefault()
    let id = $(evt.currentTarget).closest('tr').data('id')
    this._options.onDeleteFn(id)
  }

}