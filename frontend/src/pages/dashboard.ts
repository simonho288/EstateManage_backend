import { Ajax } from '../libs/ajax'
import { Util } from '../libs/util'
import { AutoList } from '../libs/autolist'

const DATALIST_TENAMENBKGS_NAME = 'tenamenbkgsDataList'

// icons: building, car side, store, user friends
const CONTENT_MKUP = `
<div id="dashboard" class="ui padded grid">
  <div class="row">
    <h1 class="ui huge dividing header">Dashboard</h1>
  </div>
  <div class="center aligned row">
    <div class="eight wide mobile four wide tablet four wide computer column">
      <i class="circular grey huge building icon"></i>
      <div class="ui large basic">Residences</div>
      <p>{{numOfResidences}}</p>
    </div>
    <div class="eight wide mobile four wide tablet four wide computer column">
      <i class="circular grey huge car side icon"></i>
      <div class="ui large basic">Carparks</div>
      <p>{{numOfCarparks}}</p>
    </div>
    <div class="eight wide mobile four wide tablet four wide computer column">
      <i class="circular grey huge store icon"></i>
      <div class="ui large basic">Shops</div>
      <p>{{numOfShops}}</p>
    </div>
    <div class="eight wide mobile four wide tablet four wide computer column">
      <i class="circular grey huge user friends icon"></i>
      <div class="ui large basic">Tenants</div>
      <p>{{numOfTenants}}</p>
    </div>
  </div>
  <div class="row">
    <h3 class="ui huge dividing header">Today Booking(s)</h3>
    {{AutoList}}
  </div>
</div>
`
/* Backup
const CONTENT_MKUP = `
<div class="ui padded grid">
  <div class="row">
    <h1 class="ui huge dividing header">Dashboard</h1>
  </div>
  <div class="center aligned row">
    <div class="eight wide mobile four wide tablet four wide computer column">
      <img class="ui centered small circular image" src="images/square-image.png" />
      <div class="ui large basic label">Residences</div>
      <p>{{numOfResidences}}</p>
    </div>
    <div class="eight wide mobile four wide tablet four wide computer column">
      <img class="ui centered small circular image" src="images/square-image.png" />
      <div class="ui large basic label">Carparks</div>
      <p>{{numOfCarparks}}</p>
    </div>
    <div class="eight wide mobile four wide tablet four wide computer column">
      <img class="ui centered small circular image" src="images/square-image.png" />
      <div class="ui large basic label">Shops</div>
      <p>{{numOfShops}}</p>
    </div>
    <div class="eight wide mobile four wide tablet four wide computer column">
      <img class="ui centered small circular image" src="images/square-image.png" />
      <div class="ui large basic label">Tenants</div>
      <p>{{numOfTenants}}</p>
    </div>
  </div>
  <div class="ui hidden section divider"></div>
  <div class="row">
    <h2 class="ui huge dividing header">Today Booking(s)</h2>
  </div>
  <div class="row">
    <table class="ui single line striped selectable unstackable table">
      <thead>
        <tr>
          <th>#</th>
          <th>Header</th>
          <th>Header</th>
          <th>Header</th>
          <th>Header</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1,001</td>
          <td>Lorem</td>
          <td>ipsum</td>
          <td>dolor</td>
          <td>sit</td>
        </tr>
        <tr>
          <td>1,002</td>
          <td>amet</td>
          <td>consectetur</td>
          <td>adipiscing</td>
          <td>elit</td>
        </tr>
        <tr>
          <td>1,003</td>
          <td>Integer</td>
          <td>nec</td>
          <td>odio</td>
          <td>Praesent</td>
        </tr>
        <tr>
          <td>1,003</td>
          <td>libero</td>
          <td>Sed</td>
          <td>cursus</td>
          <td>ante</td>
        </tr>
        <tr>
          <td>1,004</td>
          <td>dapibus</td>
          <td>diam</td>
          <td>Sed</td>
          <td>nisi</td>
        </tr>
        <tr>
          <td>1,005</td>
          <td>Nulla</td>
          <td>quis</td>
          <td>sem</td>
          <td>at</td>
        </tr>
        <tr>
          <td>1,006</td>
          <td>nibh</td>
          <td>elementum</td>
          <td>imperdiet</td>
          <td>Duis</td>
        </tr>
        <tr>
          <td>1,007</td>
          <td>sagittis</td>
          <td>ipsum</td>
          <td>Praesent</td>
          <td>mauris</td>
        </tr>
        <tr>
          <td>1,008</td>
          <td>Fusce</td>
          <td>nec</td>
          <td>tellus</td>
          <td>sed</td>
        </tr>
        <tr>
          <td>1,009</td>
          <td>augue</td>
          <td>semper</td>
          <td>porta</td>
          <td>Mauris</td>
        </tr>
        <tr>
          <td>1,010</td>
          <td>massa</td>
          <td>Vestibulum</td>
          <td>lacinia</td>
          <td>arcu</td>
        </tr>
        <tr>
          <td>1,011</td>
          <td>eget</td>
          <td>nulla</td>
          <td>Class</td>
          <td>aptent</td>
        </tr>
        <tr>
          <td>1,012</td>
          <td>taciti</td>
          <td>sociosqu</td>
          <td>ad</td>
          <td>litora</td>
        </tr>
        <tr>
          <td>1,013</td>
          <td>torquent</td>
          <td>per</td>
          <td>conubia</td>
          <td>nostra</td>
        </tr>
        <tr>
          <td>1,014</td>
          <td>per</td>
          <td>inceptos</td>
          <td>himenaeos</td>
          <td>Curabitur</td>
        </tr>
        <tr>
          <td>1,015</td>
          <td>sodales</td>
          <td>ligula</td>
          <td>in</td>
          <td>libero</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`
*/

export class Dashboard implements IPage {
  _el: JQuery<HTMLElement>
  _data: any
  _datalist: AutoList

  public constructor() {
  }

  public async openPage() {
    console.log('Dashboard::openPage()')

  }

  public async loadData() {
    console.log('Dashboard::loadData()')

    let resp = await Ajax.getDashboardData()
    this._data = resp.data

    // Flaten the timeSlots in booking records
    this._data.amenityBookings.forEach(r => {
      let timeSlots = JSON.parse(r.timeSlots)
      let times = []
      timeSlots.forEach(ts => {
        times.push(`${ts.from}-${ts.to}`)
      })
      r.times = times.join(',')
    })

    // Render the figures
    let mkup = CONTENT_MKUP
    mkup = mkup.replace('{{numOfResidences}}', String(this._data.numOfResidences))
    mkup = mkup.replace('{{numOfCarparks}}', String(this._data.numOfCarparks))
    mkup = mkup.replace('{{numOfShops}}', String(this._data.numOfShops))
    mkup = mkup.replace('{{numOfTenants}}', String(this._data.numOfTenants))

    // Render the bookings list
    this._datalist = new AutoList({
      name: DATALIST_TENAMENBKGS_NAME,
      fields: [{
        name: 'id',
        type: 'id',
      }, {
        name: 'AmenityName',
        type: 'intl',
        header: 'Amenity'
      }, {
        name: 'TenantName',
        type: 'intl',
        header: 'Tenant',
      }, {
        name: 'times',
        type: 'string',
        header: 'Time',
      }],
      callerThis: this,
      // onEditFn: this.onEdit.bind(this),
      // onDeleteFn: this.onDelete.bind(this),
    })
    this._datalist.data = this._data.amenityBookings
    mkup = mkup.replace('{{AutoList}}', this._datalist.buildHtml())

    globalThis.app.setContentMarkup(mkup)
    globalThis.app.navigator.setupEvents()
  }

}