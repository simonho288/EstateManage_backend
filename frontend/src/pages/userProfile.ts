import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { Navigator } from '../components/navigator'
import { AutoList } from '../libs/autolist'
import { AutoForm, FormMode } from '../libs/autoform'
import { Constant } from '../libs/const'

// The markup of the content area
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <div class="ui middle aligned one column centered grid">
      <div class="row">
        <div class="left floated sixteen wide column">
          <label class="ui huge header">Estate Setup</label>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="sixteen wide column">
      <div id="dataForm" class="ui segment">
        <div class="ui active loader"></div>
        <p class="heg300"></p>
      </div>
    </div>
  </div>
  <div id="editModal" class="ui overlay fullscreen modal"></div>
</div>
`

const FORM_MKUP = `
<form id="userProfileForm" class="ui form">
  <div class="field">
    <label>Name</label>
    <div class="two fields">
      <div class="twelve wide field">
        <input type="text" name="name" maxlength="100" placeholder="Your full name" />
      </div>
      <div class="four wide field">
        <div id="saveNameBtn" class="ui fluid button">Save</div>
      </div>
    </div>
  </div>
  <div class="field">
    <label>Language</label>
    <div class="two fields">
      <div class="twelve wide field">
        <div id="language" class="ui fluid search selection dropdown">
          <input type="hidden" name="language" />
          <div class="default text">Select Language</div>
          <i class="dropdown icon"></i>
        </div>
      </div>
      <div class="four wide field">
        <div id="saveLangBtn" class="ui fluid button">Save</div>
      </div>
    </div>
  </div>
  <div class="field">
    <label>Email</label>
    <div class="two fields">
      <div class="twelve wide field">
        <input type="email" name="email" maxlength="100" placeholder="Your email address" />
      </div>
      <div class="four wide field">
        <div id="saveEmailBtn" class="ui fluid button">Save</div>
      </div>
    </div>
  </div>
  <div class="field">
    <label>Phone number (allow numbers only)</label>
    <div class="two fields">
      <div class="twelve wide field">
        <input type="number" name="tel" maxlength="30" placeholder="Your phone number" />
      </div>
      <div class="four wide field">
        <div id="saveTelBtn" class="ui fluid button">Save</div>
      </div>
    </div>
  </div>
  <div class="field">
    <label>Login password</label>
    <div class="two fields">
      <div class="field">
        <input type="password" name="password1" maxlength="100" placeholder="New password (at least 8 characters)" />
      </div>
      <div class="field">
        <input type="password" name="password2" maxlength="100" placeholder="Retype new password" />
      </div>
    </div>
  </div>
  <div id="changePwdBtn" class="ui button">Change Password</div>
  <div class="ui error message"></div>
</form>
`

export class UserProfile implements IPage {
  _userRec?: any
  _el: JQuery<HTMLElement>
  _dataForm: JQuery<HTMLElement>

  public constructor() {
  }

  public async openPage() {
    console.log('UserProfile::openPage()')

    globalThis.app.setContentMarkup(CONTENT_MKUP)
  }

  public async loadData() {
    console.log('UserProfile::loadData()')

    let resp = await Ajax.getUserProfile(globalThis.app.userId)
    this._userRec = resp.data
    let userLang = this._userRec.language

    this._el = $('#dataForm')
    this._el.html(FORM_MKUP)
    this._dataForm = this._el.find('#userProfileForm')
    this._dataForm.form()
    this._dataForm.find('input[name="name"]').val(this._userRec.name)
    this._dataForm.find('input[name="email"]').val(this._userRec.email)
    this._dataForm.find('input[name="tel"]').val(this._userRec.tel)
    this._dataForm.find('#language').dropdown({
      values: $.map(Constant.LANGUAGES, function (value, key) {
        if (key === userLang) {
          return { name: `${key}: ${value}`, value: key, selected: true }
        } else {
          return { name: `${key}: ${value}`, value: key }
        }
      })
    })
    this._dataForm.checkbox()
    this._dataForm.find('.ui.button').off().on('click', this.onSaveButtonsClicked.bind(this))
    // this._el.find('#saveBtn').off().on('click', this.onFormSubmitted.bind(this))
  }

  private async onSaveButtonsClicked(evt: any): Promise<boolean> {
    evt.preventDefault()
    this.resetErrors()

    let btnId = $(evt.currentTarget).attr('id')
    let entries = $('#userProfileForm').form('get values')
    let button = $(evt.currentTarget)
    // console.log(entries)
    switch (btnId) {
      case 'saveNameBtn':
        await this.onSaveName(entries.name.trim(), button)
        break
      case 'saveLangBtn':
        await this.onSaveLangBtn(entries.language, button)
        break
      case 'saveEmailBtn':
        await this.onSaveEmailBtn(entries.email.trim(), button)
        break
      case 'saveTelBtn':
        await this.onSaveTelBtn(entries.tel.trim(), button)
        break
      case 'changePwdBtn':
        await this.onChangePwdBtn(entries.password1, entries.
          password2, button)
        break;
      default:
        throw new Error(`Unhandled button: ${btnId}`)
    }

    return true
  }

  private resetErrors() {
    this._dataForm.form('remove errors' as 'is valid')
  }

  private showError(errmsg: string): boolean {
    this._dataForm.form('add errors', [errmsg])

    return false
  }

  private async onSaveName(value: string, button: JQuery<Element>): Promise<boolean> {
    try {
      if (value == this._userRec.name)
        return this.showError('Name not change')
      if (value.length < 3)
        return this.showError('Name too short. At least 3 characters')

      button.addClass('disabled loading')
      await Ajax.updateUser(globalThis.app.userId, 'name', value)
      button.removeClass('loading')
      button.html('Wait 10 sec')
      this._userRec.name = value
      Util.displayInfoToast('Data saved successfully')
      setTimeout(() => {
        button.removeClass('disabled')
        button.html('Save')
      }, 10000)
    } catch (ex: any) {
      // this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
      return false
    }

    return true
  }

  private async onSaveLangBtn(value: string, button: JQuery<Element>): Promise<boolean> {
    try {
      if (value == this._userRec.language)
        return this.showError('Language not change')

      button.addClass('disabled loading')
      await Ajax.updateUser(globalThis.app.userId, 'language', value)
      button.removeClass('loading')
      button.html('Wait 10 sec')
      this._userRec.language = value
      Util.displayInfoToast('Data saved successfully')
      setTimeout(() => {
        button.removeClass('disabled')
        button.html('Save')
      }, 10000)
    } catch (ex: any) {
      // this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
      return false
    }

    return true
  }

  private async onSaveEmailBtn(value: string, button: JQuery<Element>): Promise<boolean> {
    try {
      if (value == this._userRec.email)
        return this.showError('Email not change')
      if (!Util.isValidEmail(value))
        return this.showError('Invalid email address')

      if (!await Util.displayConfirmDialog('Attention', 'Changing email address requires email validation again.<br />Continue for the change?'))
        return false

      const newEmail = value
      button.addClass('disabled loading')
      let resp = await Ajax.genUserConfirmCode(globalThis.app.userId, newEmail)
      if (resp.error) throw new Error(resp.error)
      button.removeClass('loading')

      let input = await Util.displayInputDialog('Verify Confirmation Code', 'Enter the confirmation code here')
      if (input !== 'CANCELLED' && input === resp.data) {
        await Ajax.updateUser(globalThis.app.userId, 'email', newEmail)
        this._userRec.email = value
        await Util.displayAlertDialog('Data Saved Successfull', 'Please login again with the new email')
        location.reload()
      }
      button.html('Wait 1 min')
      setTimeout(() => {
        button.removeClass('disabled')
        button.html('Save')
      }, 60000)
    } catch (ex: any) {
      // this._autoform.setLoading(false)
      // alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
      let errmsg = 'Unknown error'
      if (ex.message === 'last_email_change_within_threshold')
        errmsg = 'Last email changed time too short. Please wait about 10 mins'
      this.showError(errmsg)
      button.removeClass('disabled loading')
      button.html('Save')
      return false
    }

    return true
  }
  /* Backup
    private async onSaveEmailBtn(value: string, button: JQuery<Element>): Promise<boolean> {
      try {
        if (value == this._userRec.email)
          return this.showError('Email not change')
        if (!Util.isValidEmail(value))
          return this.showError('Invalid email address')
  
        if (!await Util.displayConfirmDialog('Attention', 'Changing email address requires email validation again.<br />Continue for the change?'))
          return false
  
        button.addClass('disabled loading')
        let resp = await Ajax.updateUser(globalThis.app.userId, 'email', value)
        if (resp.error) throw new Error(resp.error)
        button.removeClass('loading')
        button.html('Wait 1 min')
        this._userRec.email = value
        Util.displayInfoToast('Data saved successfully')
        setTimeout(() => {
          button.removeClass('disabled')
          button.html('Save')
        }, 60000)
      } catch (ex: any) {
        // this._autoform.setLoading(false)
        // alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
        let errmsg = 'Unknown error'
        if (ex.message === 'last_email_change_within_threshold')
          errmsg = 'Last email changed time too short. Please wait about 10 mins'
        this.showError(errmsg)
        button.removeClass('disabled loading')
        button.html('Save')
        return false
      }
  
      return true
    }
  */

  private async onSaveTelBtn(value: string, button: JQuery<Element>): Promise<boolean> {
    try {
      if (value == this._userRec.tel)
        return this.showError('Phone no. not change')
      if (value.length < 4)
        return this.showError('Phone no. too short')

      button.addClass('disabled loading')
      await Ajax.updateUser(globalThis.app.userId, 'tel', value)
      button.removeClass('loading')
      button.html('Wait 10 sec')
      this._userRec.tel = value
      Util.displayInfoToast('Data saved successfully')
      setTimeout(() => {
        button.removeClass('disabled')
        button.html('Save')
      }, 10000)
    } catch (ex: any) {
      // this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
      return false
    }

    return true
  }

  private async onChangePwdBtn(value1: string, value2: string, button: JQuery<Element>): Promise<boolean> {
    try {
      if (value1 != value2)
        return this.showError('Password mismatched')
      if (value1[0] === ' ')
        return this.showError('Password cannot starts with space')
      if (value1.length < 8)
        return this.showError('Password at least 8 characters')

      button.addClass('disabled loading')
      await Ajax.updateUser(globalThis.app.userId, 'password', value1)
      button.removeClass('loading')
      button.html('Wait 10 sec')
      Util.displayInfoToast('Data saved successfully')
      setTimeout(() => {
        button.removeClass('disabled')
        button.html('Change Password')
      }, 10000)
    } catch (ex: any) {
      // this._autoform.setLoading(false)
      alert(`Error: Got '${ex.message}' when saving data. Please try again later`)
      return false
    }

    return true
  }

}