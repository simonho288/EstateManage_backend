import 'jest-fetch-mock'
import { describe, expect, test, beforeEach } from '@jest/globals'

import { App } from '../components/app'
import { AutoList, ICurrencyField, IIdField, IIntlField, IStringField, IThumbnailField } from './autolist'
import { Config } from "./config.js"

describe('AutoList', () => {
  document.head.innerHTML = ''
  document.body.innerHTML = '<div id="app"></div>'

  let _app = new App($('#app'))
  globalThis.app = _app
  let _autolist: AutoList

  test('constructor', async () => {
    let opts = {
      name: 'Dummy AutoList',
      fields: [{
        name: 'id',
        type: 'id',
      } as IIdField, {
        name: 'name',
        type: 'intl',
        header: 'Name'
      } as IIntlField, {
        name: 'photo',
        type: 'thumbnail',
        header: 'Image',
      } as IThumbnailField, {
        name: 'fee',
        type: 'currency',
        header: 'Fee'
      } as ICurrencyField, {
        name: 'availableDays',
        type: 'string',
        header: 'Available days'
      } as IStringField],
      callerThis: this,
      onEditFn: (id: string) => { },
      onDeleteFn: (id: string) => { },
    }
    _autolist = new AutoList(opts)
    expect(_autolist).not.toBeNull()
    expect(_autolist).toBeInstanceOf(AutoList)
  })

  test('set data', () => {
    expect(_autolist).not.toBeUndefined()
    _autolist.data = [{
      id: '<dummy>',
      name: '<dummy',
      photo: '<dummy>',
      fee: 1234.56,
      availableDays: '{}',
    }]
  })

  test('buildHtml()', () => {
    let listMkup = _autolist.buildHtml()
    // console.log(listMkup)
    expect(listMkup).toContain(`class="AutoList"`)
    _app.setAppMarkup(listMkup)
    // console.log($('#app').html())
  })

  test('setupEvents()', () => {
    let err: Error
    try {
      _autolist.setupEvents()
    } catch (ex) {
      err = ex
    }
    expect(err).toBeUndefined()
  })

})