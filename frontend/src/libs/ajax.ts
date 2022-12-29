import { Util } from "./util"

const HOST = ''
// const OBJSTORE_HOST = 'https://object-store.simonho.net/'

export type AjaxResult = {
  error?: string,
  data?: any,
}

type DataGetOptions = {
  crit?: string
  fields?: string
  sort?: string
  pageno?: number
  pagesize?: number
}

export let Ajax = {

  async userLogin(email: string, password: string): Promise<AjaxResult> {
    let url = `${HOST}/api/nl/user/auth`
    let param = { email, password }
    let resp = await fetch(url, {
      method: 'POST',
      // mode: 'cors',
      // cache: 'no-cache',
      body: JSON.stringify(param),
      // referrerPolicy: 'strict-origin-when-cross-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  // Generic db get for specific table
  // Example:
  // let resp = await Ajax.getRecsByCrit({
  //  crit: `name='{<name>}'`
  //  table: 'folders',
  //  fields: 'id,name,isPublic,status',
  //  sort: 'name'
  // })
  async getRecsByCrit(table: string, opts?: DataGetOptions): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/${table}`
    opts = opts || {}
    let query = [] as Array<string | number>
    if (opts.crit != null) query.push('crit=' + encodeURIComponent(opts.crit))
    if (opts.fields != null) query.push('fields=' + encodeURIComponent(opts.fields))
    if (opts.sort != null) query.push('sort=' + encodeURIComponent(opts.sort))
    if (opts.pageno != null) query.push('pageno=' + encodeURIComponent(opts.pageno))
    if (opts.pagesize != null) query.push('pagesize=' + encodeURIComponent(opts.pagesize))
    if (query.length > 0) {
      url += '?' + query.join('&')
    }
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  // Directly send SQL to backend
  // e.g. queryDatabase('SELECT ')
  async queryDatabase(sql: string): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/queryDatabase`
    console.log(sql)
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sql })
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async runSql(sql: string): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/runSql`
    console.log(sql)
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sql })
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async uploadBlobToObjStore(blob: Blob, fileExt: string): Promise<AjaxResult> {
    // Get the upload URL
    const token = globalThis.app.apiToken
    const userId = globalThis.app.userId
    const time = (new Date).getTime()
    const filename = Util.getRandomInt(100, 99999)
    const path = `users/${userId}/${time}_${filename}.${fileExt}`
    let url = `${HOST}/api/ul/getUploadUrl?path=${encodeURIComponent(path)}`
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()

    // Upload the blob
    resp = await fetch(result.data.uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type,
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)

    return {
      data: result.data.endpoint
    }
  },

  async getRecById(table: string, id: string): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/${table}/${id}`
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  // Addnew mode: id==null, edit mode: id!=null
  async saveRec(table: string, data: object, id?: string): Promise<AjaxResult> {
    const token = globalThis.app.apiToken

    let url = id != null ? `${HOST}/api/ul/${table}/${id}` : `${HOST}/api/ul/${table}`
    let resp = await fetch(url, {
      method: id != null ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async deleteRecById(table: string, id: string | string[]): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/${table}/${id}`
    let resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async getTenAmenBkgs(startDate: string): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/getTenAmenBkgs?start=${encodeURIComponent(startDate)}`
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async uploadToReplaceUnits(unitType: 'res' | 'car' | 'shp', units: Array<Array<string>>): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/uploadToReplaceUnits?ut=${unitType}`
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(units)
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async getUserProfile(userId: string):
    Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/getUserProfile/${userId}`
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async updateUser(userId: string, field: string, value: string):
    Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/updateUserProperty/${userId}`
    let param = { field, value }
    let resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(param)
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async genUserConfirmCode(userId: string, email: string): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/genUserConfirmCode`
    let param = {
      userId: userId,
      email: email
    }
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(param)
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async userRegister(email: string, name: string, language: string, password: string, ttToken: string): Promise<AjaxResult> {
    let url = `${HOST}/api/nl/user/register`
    let param = { email, name, language, password, ttToken }
    debugger
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(param)
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async getDashboardData(): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/getDashboardData`
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

  async getAllTenentsWithUnits(): Promise<AjaxResult> {
    const token = globalThis.app.apiToken
    let url = `${HOST}/api/ul/getAllTenentsWithUnits`
    let resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    if (!resp.ok) throw new Error(resp.statusText)
    let result: AjaxResult = await resp.json()
    if (result.error) throw new Error(result.error)

    return result
  },

}