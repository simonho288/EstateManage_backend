/**
 * PDFKit doc: https://pdfkit.org
 */

import PDFDocument from 'pdfkit'
import blobStream from 'blob-stream'
import { Buffer } from 'buffer'

import { Util } from "./util"

const waitForData = async doc => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfBase64 = pdfBuffer.toString('base64');
      resolve(pdfBase64)
      // resolve(`data:application/pdf;base64,${pdfBase64}`);
    });
    doc.on('error', reject);
  });
}

// const CONTENT_MKUP = `
// <div id="previewDialog" class="ui overlay fullscreen modal">
//   <div class="header">PDF Preview</div>
//   <div class="content">
//     <iframe id="autoReportPdf" width="100%" height="800"></iframe>
//   </div>
//   <div class="actions">
//     <div class="ui cancel button">Close</div>
//   </div>
// </div>
// `

export class AutoReport {
  // iframe: HTMLIFrameElement
  _pdf: PDFDocument
  _stream: any

  constructor() {
    this._pdf = new PDFDocument({
      size: 'A4',
      bufferPgaes: true,
      font: 'Helvetica',
      margin: 30,
      autoFirstPage: false,
    })

    // pipe the document to a blob
    this._stream = this._pdf.pipe(blobStream())
  }

  public startDrawing(el: JQuery<HTMLElement>): PDFDocument {
    // el.html(CONTENT_MKUP)

    return this._pdf
  }

  public endDrawing() {
    this._pdf.end()

    let self = this
    // let dlg = document.getElementById('previewDialog')
    // let iframe = dlg.getElementsByTagName('iframe')[0] as HTMLIFrameElement

    /*
    waitForData(this._pdf).then((dataUrl: string) => {
      // iframe.src = dataUrl;
      window.open(dataUrl)
    }).catch(error => {
      console.log(error);
    })
    */

    this._stream.on('finish', function () {
      // get a blob from PDF stream and open a new browser window
      const blob = self._stream.toBlob('application/pdf')
      const blobURL = URL.createObjectURL(blob)
      window.open(blobURL)

      // or get a blob URL for display in the browser
      // const url = self._stream.toBlobURL('application/pdf');
      // iframe.src = url;
    })
  }

  public displayPreview() {
    $('#previewDialog').modal({
      closable: false
    }).modal('show')
  }

}
