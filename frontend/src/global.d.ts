export { }

declare global {
  interface IPage {
    // _jqel: null | JQuery<HTMLElement>
    // main($el: JQuery<HTMLElement>)
    openPage(): Promise<void>
    loadData(): Promise<void>
  }

  type Config = {
    unitQrAppDownloadUrl: string
  }

  var turnstile: any
}
