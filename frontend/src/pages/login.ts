// import { Navigator } from "../components/navigator"
// import { Dashboard } from "./dashboard"
import { AutoForm, FormMode } from "../libs/autoform"
import { Ajax } from '../libs/ajax'
import { Signup } from './signup'

const DATAFORM_NAME = 'loginDataForm'

const CONTENT_MKUP = `
<div id="login" class="ui middle aligned center aligned grid">
  <div class="left aligned column">
    <h2 class="ui image header">
      <img src="images/logo.png" class="image logo">
      <div class="content">
        Log-in to your account
      </div>
    </h2>
    {{formMkup}}
    <div class="ui message">
      New to us? <a id="signupBtn" href="">Sign Up</a>
    </div>
  </div>
</div>
`

export class Login implements IPage {
  _form: AutoForm // Login form

  constructor() {
  }

  public async openPage(): Promise<void> {
    console.log('Login::main()')

    // Generate the form markup using Autoform
    this._form = new AutoForm({
      name: DATAFORM_NAME,
      mode: FormMode.New,
      formCls: 'large',
      submitBtn: { text: 'Login', cls: 'fluid' },
      onSubmit: this.onFormSubmitted,
      callerThis: this,
      fields: [{
        name: 'email',
        type: 'email',
        isRequired: true,
        placeholder: 'E-mail address',
        icon: { cls: 'left icon', icon: 'user' },
        validationRules: [{
          type: 'empty',
          prompt: 'Please enter your e-mail'
        }, {
          type: 'email',
          prompt: 'Please enter a valid e-mail'
        }]
      }, {
        name: 'password',
        type: 'password',
        isRequired: true,
        placeholder: 'Password',
        icon: { cls: 'left icon', icon: 'lock' },
        validationRules: [{
          type: 'empty',
          prompt: 'Please enter your password'
        }, {
          type: 'minLength[6]',
          prompt: 'Your password must be at least 6 characters'
        }]
      }, {
        name: 'rememberMe',
        type: 'checkbox',
        label: 'Remember me',
        isRequired: false,
      }],
    })
    let formMkup = this._form.buildHtml()
    // console.log(formMkup)
    globalThis.app.setAppMarkup(CONTENT_MKUP.replace('{{formMkup}}', formMkup))
    this._form.setupEvents()
    $('#signupBtn').off().on('click', this.onSignupClicked.bind(this))
  }

  public async loadData() {
    let email: string | null = localStorage.getItem('loginEmail')
    if (email) {
      this._form.setFieldValue('email', email)
    }
    let password: string | null = localStorage.getItem('loginPassword')
    if (password) {
      this._form.setFieldValue('password', password)
    }
    if (email && password) {
      this._form.setFieldValue('rememberMe', 'on')
    }
  }

  private async onFormSubmitted(evt: Event) {
    console.log('Login::onFormSubmitted()')

    evt.preventDefault()

    try {
      this._form.setLoading(true)
      let values = await this._form.getSubmittedValues()
      if (values.rememberMe === 'on') {
        localStorage.setItem('loginEmail', values.email)
        localStorage.setItem('loginPassword', values.password)
      } else {
        localStorage.removeItem('loginEmail')
        localStorage.removeItem('loginPassword')
      }
      let resp = await Ajax.userLogin(values.email, values.password)
      globalThis.app.apiToken = resp.data.apiToken
      globalThis.app.userId = resp.data.userId
      globalThis.app.onLoginSuccess()
    } catch (ex: any) {
      this._form.setLoading(false)
      let msg = 'Unknown error'
      switch (ex.message) {
        case 'unspecified_email_pwd':
          msg = 'Unspecified email or password'
          break
        case 'email_not_found':
          msg = 'Email not found'
          break
        case 'pwd_incorrect':
          msg = 'Password mismatched'
          break
        case 'account_pending':
          msg = 'Account is pending. Please check the confirmation email'
          break
        case 'account_frozen':
          msg = 'Account is frozen. Please contact support'
          break
        default:
          throw new Error(`Unhandled login error: ${ex.message}`)
      }
      this._form.setError(msg)
    }
  }

  private onSignupClicked(evt: any) {
    evt.preventDefault()

    let page = new Signup()
    page.openPage()
  }

}
