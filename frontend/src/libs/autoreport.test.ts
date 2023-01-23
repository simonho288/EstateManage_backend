import 'jest-fetch-mock'
import { jest, describe, expect, test, beforeEach } from '@jest/globals'

import PDFDocument from 'pdfkit'
import blobStream from 'blob-stream'
import { Buffer } from 'buffer'
import QRious from 'qrious'

import { App } from '../components/app'
import { AutoReport } from './autoreport'
import { Config } from "./config.js"

describe('AutoForm', () => {
  document.head.innerHTML = ''
  document.body.innerHTML = '<div id="app"></div>'

  let _app = new App($('#app'))
  globalThis.app = _app
  let _autoreport: AutoReport
  let _pdf: PDFDocument

  test('constructor', async () => {
    let err: Error
    try {
      _autoreport = new AutoReport()
      _pdf = _autoreport.startDrawing($('#app'))
      _pdf.fontSize(16)
    } catch (ex) {
      err = ex
    }
    expect(err).toBeUndefined()
  })

  test('rendering', async () => {
    let err: Error
    try {
      _pdf.addPage()
      _pdf.text(`<dummy text>`, 0, 0, {
        align: 'center'
      })
      let qrcode = new QRious({
        foregroundAlpha: 0.8,
        // level: 'H',
        padding: 0,
        size: 100,
        value: 'http://www.example.com'
      })
      let dataURL = qrcode.toDataURL()
      _pdf.image(dataURL, 0, 0)
      _pdf.moveTo(1, 1).lineTo(2, 2).undash().stroke()
      _pdf.flushPages()
    } catch (ex) {
      err = ex
    }
    expect(err).toBeUndefined()
  })

  test('end drawing', async () => {
    let err: Error

    // Create a mock createObjectURL()
    if (typeof window.URL.createObjectURL === 'undefined') {
      Object.defineProperty(URL, 'createObjectURL', {
        writable: true,
        value: jest.fn()
      })
    }

    try {
      let blobURL = await _autoreport.endDrawing()
    } catch (ex) {
      err = ex
    }
    expect(err).toBeUndefined()
  })

})