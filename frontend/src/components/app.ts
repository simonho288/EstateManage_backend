// import * as jQuery from "jquery"
import { EstateSetup } from '../pages/estateSetup'
import { UserProfile } from '../pages/userProfile'
import { Login } from '../pages/login'
import { Navigator } from './navigator'

// The markup of the html body
const adminContent = `
<div id="app">
  {{Header}}
  <div class="ui padded grid">
    <div id="sidebar" class="three wide mobile only three wide tablet only three wide computer only column">
      <div id="navMenuItem" class="ui vertical borderless fluid text menu">
        <!-- Navigator Markup -->
      </div>
    </div>
    <div id="content" class="thirteen wide mobile thirteen wide tablet thirteen wide computer right floated column">
      <!-- Content Markup -->
    </div>
  </div>
</div>
`

// The markup of the header. It injects to the {{Header}} in adminContent
const adminContentHeader = `
<div class="ui padded grid">
  <div class="ui inverted borderless top fixed fluid menu">
    <div class="item">
      <img class="logo" src="images/logo.png">
    </div>  
    <div class="header item">Estate Manager</div>
    <div id="accountMenu" class="ui right dropdown item">
      Account
      <i class="dropdown icon"></i>
      <div class="menu">
        <a id="userProfile" class="account item">User Profile</a>
        <a id="estateSetup" class="account item">Estate Setup</a>
        <a id="logout" class="account item">Logout</a>
      </div>
    </div>
  </div>
</div>
`

export class App {
  private _appDiv: JQuery<HTMLElement> // #body in index.html
  private _loginPage: Login
  private _navigator: Navigator
  private _userId: string
  private _apiToken: string // Token after the user authenicated successful

  public get userId(): string {
    return this._userId
  }
  public set userId(value: string) {
    this._userId = value
  }
  public get apiToken(): string {
    return this._apiToken
  }
  public set apiToken(value: string) {
    this._apiToken = value
  }
  public get navigator(): Navigator {
    return this._navigator
  }

  constructor(el: JQuery<HTMLElement>) {
    this._appDiv = el
  }

  public setAppMarkup(html: string): void {
    this._appDiv.html(html)
  }

  public setContentMarkup(html: string): void {
    this._appDiv.find('#content').off().empty()
    this._appDiv.find('#content').html(html)

    $('#accountMenu').dropdown()
    $('#accountMenu a.item').off().on('click', this.onAccountMenuItemClicked.bind(this))
  }

  public openLoginPage() {
    if (this._loginPage == null) {
      this._loginPage = new Login()
    }
    this._loginPage.openPage()
    this._loginPage.loadData()
  }

  public onLoginSuccess() {
    console.log('App::onLoginSuccess()')

    let html = adminContent
    html = html.replace('{{Header}}', adminContentHeader)
    this.setAppMarkup(html)

    if (this._navigator == null) {
      this._navigator = new Navigator()
    }
    this._navigator.render()
    this._navigator.gotoPage('dashboard') // default page after logged-in
    this._navigator.setupEvents() // should call it after render()
  }

  private async onAccountMenuItemClicked(evt: Event) {
    let menuId = $(evt.currentTarget).attr('id')
    console.log(`Menu ${menuId} clicked`)
    switch (menuId) {
      case 'logout':
        await this.onMenuLogout()
        break
      case 'estateSetup':
        await this.onMenuEstateSetup()
        break
      case 'userProfile':
        await this.onMenuUserProfile()
        break;
      default:
        throw new Error(`Unhandled menuId: ${menuId}`)
    }
  }

  private async onMenuLogout() {
    console.log('App::onMenuLogout()')

    globalThis.app.apiToken = null
    globalThis.app.userId = null
    setTimeout(() => {
      this.openLoginPage()
    }, 100)
  }

  private async onMenuEstateSetup() {
    console.log('App::onMenuEstateSetup()')

    let page = new EstateSetup()
    await page.openPage()
    await page.loadData()
  }

  private async onMenuUserProfile() {
    console.log('App::onMenuUserProfile()')

    let page = new UserProfile()
    await page.openPage()
    await page.loadData()
  }

}