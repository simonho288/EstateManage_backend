import 'jest-fetch-mock'
import { describe, expect, test, beforeEach } from '@jest/globals'

import { App } from '../components/app'
import { AutoForm, FormMode, ICheckboxField, IEmailField, IPasswordField } from './autoform'
import { Config } from "./config.js"

describe('AutoForm', () => {
  document.head.innerHTML = ''
  document.body.innerHTML = '<div id="app"></div>'

  let _app = new App($('#app'))
  globalThis.app = _app
  let _autoform: AutoForm

  test('constructor', async () => {
    let opts = {
      name: "loginDataForm",
      mode: FormMode.New,
      formCls: "large",
      submitBtn: {
        text: "Login",
        cls: "fluid"
      },
      callerThis: this,
      fields: [
        {
          type: 'email',
          name: 'email',
          isRequired: true,
          placeholder: "E-mail address",
          icon: {
            cls: "left icon",
            icon: "user"
          },
          validationRules: [{
            type: "empty",
            prompt: "Please enter your e-mail"
          }, {
            type: "email",
            prompt: "Please enter a valid e-mail"
          }]
        } as IEmailField,
        {
          name: "password",
          type: "password",
          isRequired: true,
          placeholder: "Password",
          icon: {
            cls: "left icon",
            icon: "lock"
          },
          validationRules: [{
            type: "empty",
            prompt: "Please enter your password"
          }, {
            type: "minLength[6]",
            prompt: "Your password must be at least 6 characters"
          }]
        } as IPasswordField,
        {
          name: "rememberMe",
          type: "checkbox",
          label: "Remember me",
          isRequired: false
        } as ICheckboxField
      ],
      onSubmit: async (evt: Event) => { }
    }
    _autoform = new AutoForm(opts)
    expect(_autoform).not.toBeNull()
    expect(_autoform).toBeInstanceOf(AutoForm)
  })

  test('buildHtml()', () => {
    let formMkup = _autoform.buildHtml()
    // console.log(formMkup)
    expect(formMkup).toContain('<form id="loginDataForm"')
    expect(formMkup).toContain('<input type="email"')
    expect(formMkup).toContain('<input type="password"')
    expect(formMkup).toContain('<input name="rememberMe"')
    _app.setAppMarkup(formMkup)
    // console.log($('#app').html())
  })

})