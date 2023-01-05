import { Ajax } from '../libs/ajax'
import { Constant } from '../libs/const'
import { Util } from '../libs/util'

import { Login } from './login'

const CONTENT_MKUP = `
<div id="signup" class="ui middle aligned center aligned grid">
  <div class="column">
    <h2 class="ui image header">
      <div class="content">
        EstateManage.Net New Member Signup
      </div>
    </h2>
    {{formMkup}}
    <div class="ui message">
      Already registered? <a id="loginBtn" href="">Go login page</a>
    </div>
  </div>
</div>
`

const FORM_MKUP = `
<div class="ui left aligned segment">
  <form id="signupForm" class="ui form">
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" maxlength="100" placeholder="Your email address" />
    </div>
    <div class="field">
      <label>Name</label>
      <input type="text" name="name" maxlength="100" placeholder="Your full name" />
    </div>
    <div class="field">
      <label>Language</label>
      <div id="language" class="ui fluid search selection dropdown">
        <input type="hidden" name="language" />
        <div class="default text">Select Language</div>
        <i class="dropdown icon"></i>
      </div>
    </div>
    <div class="field">
      <label>Login password</label>
      <input type="password" name="password1" maxlength="100" placeholder="New password (at least 8 characters)" />
    </div>
    <div class="field">
      <label>Password verify</label>
      <input type="password" name="password2" maxlength="100" placeholder="Re-type password" />
    </div>
    <div class="inline field">
      <div class="ui checkbox">
        <input type="checkbox" name="terms">
        <label>I agree to the terms of service</a></label>
      </div>
    </div>
    <div id="submitBtn" class="ui primary submit disabled button">Submit</div>
    <div class="ui error message"></div>
    <div id="ttWidget" style="margin-top: 5px"></div>
  </form>
</div>
`

export class Signup implements IPage {
  _form: JQuery<Element>

  constructor() {
  }

  public async openPage(): Promise<void> {
    console.log('Signup::main()')

    let userLang = navigator.language
    if (userLang.startsWith('en-'))
      userLang = 'en'

    // console.log(formMkup)
    globalThis.app.setAppMarkup(CONTENT_MKUP.replace('{{formMkup}}', FORM_MKUP))
    let form = this._form = $('#signupForm')
    this._form.find('#language').dropdown({
      values: $.map(Constant.LANGUAGES, function (value, key) {
        if (key === userLang) {
          return { name: `${key}: ${value}`, value: key, selected: true }
        } else {
          return { name: `${key}: ${value}`, value: key }
        }
      })
    })

    $('#loginBtn').off().on('click', this.onLoginClicked.bind(this))

    this._form.form({
      fields: {
        email: {
          identifier: 'email',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your email',
          }, {
            type: 'email',
            prompt: 'Invalid email address'
          }],
        },
        name: {
          identifier: 'name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your name',
          }]
        },
        language: {
          identifier: 'language',
          rules: [{
            type: 'empty',
            prompt: 'Please select your primary language',
          }]
        },
        password1: {
          identifier: 'password1',
          rules: [{
            type: 'empty',
            prompt: 'Please enter a password'
          }, {
            type: 'minLength[8]',
            prompt: 'Password must be at least {ruleValue} characters'
          }]
        },
        password2: {
          identifier: 'password2',
          rules: [{
            type: 'match[password1]',
            prompt: 'Password mismatched'
          }]
        },
        terms: {
          identifier: 'terms',
          rules: [
            {
              type: 'checked',
              prompt: 'You must agree to the terms and conditions'
            }
          ]
        }
      },
      onSuccess: this.onSubmit.bind(this)
    })

    // Cloudflare turnstile. Doc:
    // https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
    turnstile.render('#ttWidget', {
      sitekey: '0x4AAAAAAABtOChiZyvk6EnI',
      theme: 'light',
      callback: function (token) {
        form.find('#submitBtn').removeClass('disabled')
      }
    })
  }

  public async loadData() {
  }

  private async onSubmit(evt: any) {
    console.log('Signup::onSubmit()')

    evt.preventDefault()
    let button = $(evt.currentTarget)
    button.addClass('loading disabled')
    let values = await this._form.form('get values')
    if (values.password2 != values.password1) {
      this._form.form('add errors', ['Password matched'])
    }

    try {
      values.email = values.email.trim()
      values.name = values.name.trim()
      let resp = await Ajax.userRegister(values.email, values.name, values.language, values.password1, values['cf-turnstile-response'])
      if (resp.data.success) {
        await Util.displayAlertDialog('Registered Successful', 'Member registration email has been sent. Please check your inbox and check out the content')
        localStorage.clear()
        localStorage.setItem('loginEmail', values.email)
        this.onLoginClicked(null)
      }
    } catch (ex: any) {
      this._form.form('add errors', [ex.message])
    }

    button.removeClass('loading disabled')
  }

  private onLoginClicked(evt: any) {
    // evt.preventDefault()

    let page = new Login()
    page.openPage()
  }

}
