import { describe, expect, test } from '@jest/globals'

import { App } from './app'

describe('App', () => {

  document.body.innerHTML = `<div id='test'></div>`
  let app: App = new App($('#test'))


  test('get userId()', () => {
    console.log(app.userId)
  })
})
