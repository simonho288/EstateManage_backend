import * as $ from "jquery"
import "../semantic-ui/dist/semantic"
// import "../semantic-ui/dist/components/form"
// import "../semantic-ui/dist/components/transition"
// import "../semantic-ui/dist/components/modal"
// import "../semantic-ui/dist/components/dimmer"
// import "../semantic-ui/dist/components/checkbox"
// import "../semantic-ui/dist/components/visibility"
// import "../semantic-ui/dist/components/dropdown"

// import { Login } from "./pages/login"
import { App } from "./components/app"
import { Config } from "./libs/config.js"

// Typescript global variable. To access it: globalThis.app
declare global {
  var app: App
  var config: Config
}

// Prevent the browser 'Back' button after logged-in
window.history.pushState(null, "", window.location.href);
window.onpopstate = function () {
  window.history.pushState(null, "", window.location.href);
};

$(function () {
  console.log('Document ready')

  globalThis.config = Config
  globalThis.app = new App($('#body'))
  globalThis.app.openLoginPage()
})