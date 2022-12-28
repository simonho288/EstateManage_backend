import { Dashboard } from "../pages/dashboard"
import { Amenities } from "../pages/amenities"
import { Folders } from "../pages/folders"
import { Notices } from "../pages/notices"
import { Marketplaces } from "../pages/marketplaces"
import { Residences } from "../pages/residences"
import { Carparks } from "../pages/carparks"
import { Shops } from "../pages/shops"
import { Tenants } from "../pages/tenants"
import { TenantAmenityBookings } from "../pages/tenAmenBkgs"
import { PrtUnitQrcode } from "../pages/prtUnitQrcode"

enum MenuItemType {
  page,
  divider,
}

type MenuItem = {
  itemType: MenuItemType
  id?: string
  title?: string
  isActive?: boolean
  page?: IPage
}

export class Navigator {
  _menuItems: Array<MenuItem>
  _curItem: MenuItem

  constructor() {
    this._menuItems = [{
      itemType: MenuItemType.page,
      id: 'dashboard',
      title: 'Dashboard',
      isActive: false,
      page: new Dashboard(),
    }, {
      itemType: MenuItemType.page,
      id: 'residences',
      title: 'Residences',
      isActive: false,
      page: new Residences(),
    }, {
      itemType: MenuItemType.page,
      id: 'carparks',
      title: 'Carparks',
      isActive: false,
      page: new Carparks(),
    }, {
      itemType: MenuItemType.page,
      id: 'shops',
      title: 'Shops',
      isActive: false,
      page: new Shops(),
    }, {
      itemType: MenuItemType.divider,
    }, {
      itemType: MenuItemType.page,
      id: 'amenities',
      title: 'Amenities',
      isActive: false,
      page: new Amenities(),
    }, {
      itemType: MenuItemType.page,
      id: 'folders',
      title: 'Folders',
      isActive: false,
      page: new Folders(),
    }, {
      itemType: MenuItemType.page,
      id: 'notices',
      title: 'Notices',
      isActive: false,
      page: new Notices(),
    }, {
      itemType: MenuItemType.page,
      id: 'marketplaces',
      title: 'Marketplaces',
      isActive: false,
      page: new Marketplaces(),
    }, {
      itemType: MenuItemType.divider,
    }, {
      itemType: MenuItemType.page,
      id: 'tenants',
      title: 'Tenants',
      isActive: false,
      page: new Tenants(),
    }, {
      itemType: MenuItemType.page,
      id: 'tenamenbkgs',
      title: 'Amenity Bookings',
      isActive: false,
      page: new TenantAmenityBookings(),
    }, {
      itemType: MenuItemType.page,
      id: 'prtunitqrcode',
      title: 'Print Unit QR-code',
      isActive: false,
      page: new PrtUnitQrcode(),
    }]
  }

  async gotoPage(id: string) {
    console.log(`Navigator::gotoPage('${id}')`)

    let found: MenuItem
    for (let i = 0; i < this._menuItems.length; ++i) {
      let menu = this._menuItems[i]
      if (menu.id === id) {
        this._curItem = menu
        menu.isActive = true
        found = menu
      } else {
        menu.isActive = false
      }
    }
    if (!found) throw new Error(`Menu item id: ${id} not found`)

    this.updateHighlight()
    if (found.page == null) throw new Error(`Menu item page: ${id} not implemented`)
    await found.page.openPage()
    await found.page.loadData()
  }

  buildHtml(): string {
    let mkup: string[] = []
    for (let i = 0; i < this._menuItems.length; ++i) {
      let item = this._menuItems[i]
      switch (item.itemType) {
        case MenuItemType.page:
          mkup.push(`<a id="${item.id}" class="${item.isActive ? 'active' : ''} item">${item.title}</a>`)
          break;
        case MenuItemType.divider:
          mkup.push(`<div class="ui divider"></div>`)
          break;
        default:
          throw new Error('Unhandled MenuItemType: ${item.itemType}')
      }
    }

    return mkup.join('')
  }

  // Should call this once, after that call updateHighlight() instead
  render(): void {
    let html = this.buildHtml()
    $('#navMenuItem').html(html)
  }

  // Set highlight to current navigation item
  updateHighlight(): void {
    $('#navMenuItem').find('.item').removeClass('active')
    $('#navMenuItem').find(`#${this._curItem.id}`).addClass('active')
  }

  setupEvents(): void {
    $('#navMenuItem').find('a.item').off().on('click', this.onMenuItemClicked.bind(this))
  }

  async onMenuItemClicked(evt: any) {
    console.log('Navigator::onMenuItemClicked()')

    evt.preventDefault()
    let clickedId = $(evt.currentTarget).attr('id')
    let menuItem = this._menuItems.find(e => e.id == clickedId)
    if (menuItem == null) throw new Error(`Can't find menu item: ${clickedId}`)

    await this.gotoPage(clickedId)
    // this.setupEvents()
  }

}