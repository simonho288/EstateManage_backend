// import * as $ from "jquery"
import "../../semantic-ui/dist/components/modal"
import "../../semantic-ui/dist/components/toast"
// declare var $: any;

type AudienceToStringJson = {
  owner: boolean
  tenant: boolean
  occupant: boolean
  agent: boolean
}

type SortedUnit = {
  id: string
  type: string
  typeNum: number
  block: string
  floor: string
  number: string
  floorNum: number
  numberStr: string
}

type AvailableUnits = {
  blocks: Array<string>
  floors: Array<string>
  numbers: Array<string>
}

type FloorNameValue = {
  type: "numeric" | "alpha" | "groundfloor" | "basement"
  value: number
}

export let Util = {

  sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  },

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },

  // 'a' -> 'b'
  nextChar(c: string): string {
    return String.fromCharCode(c.charCodeAt(0) + 1)
  },

  isValidEmail(val: string): boolean {
    return val.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) != null
  },

  escapeHTML(str) {
    const escapeChars = {
      '¢': 'cent',
      '£': 'pound',
      '¥': 'yen',
      '€': 'euro',
      '©': 'copy',
      '®': 'reg',
      '<': 'lt',
      '>': 'gt',
      '"': 'quot',
      '&': 'amp',
      '\'': '#39'
    }
    let regexString = '['
    for (let key in escapeChars) {
      regexString += key
    }
    regexString += ']'
    let regex = new RegExp(regexString, 'g')

    return str.replace(regex, (m) => {
      return '&' + escapeChars[m] + ';'
    })
  },

  // ex:
  // const data = [
  //   { a: "abc", b: 1, c: 1 },
  //   { a: "pqr", b: 1, c: 1 },
  //   { a: "klm", b: 1, c: 2 },
  //   { a: "xyz", b: 1, c: 2 },
  // ];
  // groupBy(data, v => v.c) outcomes:
  // {
  //   1: [{ a: 'abc', b: 1, c: 1}, { a: 'pqr', b: 1, c: 1} ]
  //   2: [{ a: 'klm', b: 1, c: 2}, { a: 'xyz', b: 1, c: 2} ]
  // }
  groupBy(objectArray, property) {
    return objectArray.reduce(function (acc: any, obj: any) {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  },

  // e.g. G -> 0, 1 -> 1, B1 -> -1, B2 -> -2, B9 -> -9
  floorNameToValue(name: string): FloorNameValue {
    name = name.toUpperCase()
    if (!isNaN(Number(name))) {
      // 1,2,3...
      return {
        type: 'numeric',
        value: parseInt(name),
      }
    } else if (name === 'G') {
      // G
      return {
        type: 'groundfloor',
        value: 0
      }
    } else if (name[0] === 'B') {
      let trail = name.substring(1, name.length)
      if (!isNaN(Number(trail))) {
        // B1,B2,...,B9
        if (isNaN(Number(trail)))
          throw new Error(`Unhandled unit name: ${trail}`)
        return {
          type: 'basement',
          value: -parseInt(trail)
        }
      } else {
        throw new Error(`Invalid floor name: ${name}`)
      }
    } else {
      throw new Error(`Invalid floor name: ${name}`)
    }
  },

  isJsonString(str: string): boolean {
    if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').
      replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
      replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
      return true
    else
      return false
  },

  intlStrFromJson(jsonStr: any): string {
    if (jsonStr == null) return ''

    if (typeof jsonStr === 'string') {
      if (this.isJsonString(jsonStr)) {
        // TODO: Current support English 'en' only
        let json = JSON.parse(jsonStr)
        if (json.en) return json.en
      }
    } else if (typeof jsonStr === 'object') {
      if (jsonStr.en) return jsonStr.en
    }
    return jsonStr
  },

  intlStrToJson(value: string): string {
    if (value == null) return null
    // TODO: Current support English 'en' only
    return JSON.stringify({ "en": value })
  },

  displayInfoToast(msg: string) {
    ($ as any).toast({ message: msg })
  },

  displayErrorToast(heading: string, msg: string) {
    ($ as any).toast({
      class: 'error center aligned',
      title: heading,
      message: msg
    })
  },

  async displayAlertDialog(heading: string, msg: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // ($ as any).modal('alert', heading, msg, function () {
      //   resolve()
      // })
      ($ as any).modal('alert', {
        title: heading,
        content: msg,
        allowMultiple: true,
        handler: function () {
          resolve()
        },
      })
    })
  },

  async displayConfirmDialog(heading: string, msg: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // ($ as any).modal('confirm', heading, msg, function (choice: boolean) {
      //   resolve(choice)
      // })
      ($ as any).modal('confirm', {
        title: heading,
        content: msg,
        allowMultiple: true,
        handler: function (choice: boolean) {
          resolve(choice)
        }
      })
    })
  },

  async displayInputDialog(heading: string, msg: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ($ as any).modal('prompt', {
        title: heading,
        placeholder: msg,
        allowMultiple: true,
        handler: function (value: string) {
          resolve(value)
        },
      })
    })
  },

  readImageContent(data: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      let image = new Image()
      image.onload = async function () {
        resolve(image)
      }
      image.src = data
    })
  },

  // async resizeFileInputImageToBlob(data: string, width: number) {
  //   let self = this
  //   return new Promise((resolve, reject) => {
  //     let canvas = document.createElement('canvas')
  //     let ctx = canvas.getContext('2d')
  //     let image = new Image()
  //     image.onload = async function () {
  //       ctx.drawImage(image, 0, 0)
  //       if (image.width > width) {
  //         let blob = await self.resizeImageToBlob(image, width)
  //         resolve(blob)
  //       } else {
  //         let blob = await self.resizeImageToBlob(image, image.width)
  //         resolve(blob)
  //       }
  //     }
  //     image.src = data
  //   })
  // }, // resizeFileInputImageToBlob()

  // resizeImageToBlob(img: HTMLImageElement, width: number, height: number) {
  //   return new Promise((resolve, reject) => {
  //     let canvas = document.createElement('canvas')
  //     let ctx = canvas.getContext('2d')

  //     // destination canvas size
  //     canvas.width = width
  //     canvas.height = height

  //     let aspect = img.width / img.height
  //     let dstwid, dstheg
  //     if (img.width > img.height) {
  //       dstheg = height
  //       dstwid = Math.floor(height * aspect)
  //     } else {
  //       dstwid = width
  //       dstheg = Math.floor(width / aspect)
  //     }

  //     let x = height / 2 - dstwid / 2
  //     let y = width / 2 - dstheg / 2
  //     ctx.drawImage(img, x, y, dstwid, dstheg)

  //     canvas.toBlob(function (blob) {
  //       resolve(blob)
  //     }, 'image/jpeg', 0.85) // JPEG at 85% quality
  //   })
  // }, // resizeImageToBlob

  // quality: JPEG e.g. 0.85 = 85% JPEG Compression
  imageToJpegBlob(img: HTMLImageElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(function (blob: Blob) {
        resolve(blob)
      }, 'image/jpeg', quality)
    })
  },

  audiencesToString(json: AudienceToStringJson): string {
    let rst = []
    if (json != null) {
      if (json.owner === true) rst.push('own') // owner
      if (json.tenant === true) rst.push('ten') // tenant
      if (json.occupant === true) rst.push('occ') // occupant
      if (json.agent === true) rst.push('agt') // agent
    }
    if (rst.length > 0)
      return rst.join(',')
    else
      return '-'
  },

  // Units require special sorting. e.g. Floor number 1=1, G=0, B1=-1, B2=-1
  // And room numbers require pad zero. e.g. 1=0001, 10=0010
  sortUnits(type: string, units: Array<SortedUnit>): Array<SortedUnit> {
    let rebuildUnits: Array<SortedUnit> = []
    let finalUnits: Array<SortedUnit> = []

    // if (type === 'residences') {
    for (let i = 0; i < units.length; ++i) {
      let unit = { ...units[i] }
      switch (unit.type) {
        case 'res': unit.typeNum = 0; break;
        case 'car': unit.typeNum = 1; break;
        case 'shp': unit.typeNum = 2; break;
        default: unit.typeNum = -1; break;
      }
      let unv = this.floorNameToValue(unit.floor)
      unit.floorNum = unv.value
      // let floor: number = Number(unit.floor)
      // if (!isNaN(floor)) { // is number?
      //   // unit.floor = String(floor).padStart(4, '0')
      //   unit.floorNum = floor
      // } else {
      //   if (unit.floor === 'G') {
      //     unit.floorNum = 0
      //   } else if (unit.floor[0] === 'B') {
      //     let negFloor = unit.floor.substring(1, unit.floor.length)
      //     if (isNaN(Number(negFloor))) throw new Error(`Unhandled floor ID: ${negFloor}`)
      //     unit.floorNum = -parseInt(negFloor)
      //   }
      // }

      let room: number = Number(unit.number)
      if (!isNaN(room)) { // is number
        unit.numberStr = String(room).padStart(3, '0')
      } else {
        unit.numberStr = unit.number
      }

      rebuildUnits.push(unit)
    }
    // }

    finalUnits = rebuildUnits.sort((a, b) => {
      return a.typeNum - b.typeNum
        || a.block.localeCompare(b.block)
        || a.floorNum - b.floorNum
        || a.numberStr.localeCompare(b.numberStr)
    })

    finalUnits.forEach(e => {
      delete e.typeNum
      delete e.floorNum
      delete e.numberStr
    })

    return finalUnits
  },

  // Validate the csv string content.
  // It must be:
  // row 1: Block, Floor, Number
  // row ?: <Str>, <Str>, <Str>
  // ...
  // The return values in Array of String array.
  // i.e. [[block, floor, number], [block, floor, number], ...]
  validateUnitCsv(csv: string): Array<Array<string>> {
    let lines = csv.split('\n')

    // Validate first row does contain 'block', 'floor', 'number'
    let cols = lines[0].toLowerCase().split('\t')
    if (cols[0] != 'block' || cols[1] != 'floor' || cols[2] != 'number')
      throw new Error('Row 1 must contain 3 columns: Block, Floor and Number')

    let rtnVal = new Array<Array<string>>
    for (let r = 1; r < lines.length; ++r) {
      let line = lines[r]
      cols = line.split('\t')
      if (cols.length < 3) throw new Error(`Row ${r + 1} error: Must contain 3 columns`)
      let block = cols[0].trim()
      let floor = cols[1].trim()
      let number = cols[2].trim()
      if (block === '' || floor === '' || number === '')
        continue
      if (block.includes(' ')) throw new Error(`Block name '${block}' cannot contain space at row ${r + 1}`)
      if (floor.includes(' ')) throw new Error(`Floor name '${floor}' cannot contain space at row ${r + 1}`)
      if (number.includes(' ')) throw new Error(`Number name '${number}' cannot contain space at row ${r + 1}`)
      let rowDup: number
      let found = rtnVal.find((e, i) => {
        if (e[0] === block && e[1] === floor && e[2] === number) {
          rowDup = i
          return true
        }
        return false
      })
      if (found) throw new Error(`Row ${r + 1} error: Unit ${block},${floor},${number} is duplicated to row ${rowDup + 2}`)
      rtnVal.push([block, floor, number])
    }

    if (rtnVal.length === 0) throw new Error('No units found')

    return rtnVal
  },

  // Support:
  // Type 1: 1 or 2 or A or B
  // Type 2: *
  // Type 3: 1-3 or A-D
  // Type 4: 1,2,8-10 or A,B,D-E
  parseBlocknamesStr(availNames: Array<string>, str: string): Array<string> {
    str = str.trim().toUpperCase()
    if (str === '') throw new Error(`Cannot be empty string`)
    let rtnVals = new Array<string>
    if (str === '*') {
      rtnVals = [...availNames]
    } else {
      let seps1 = str.split(',')
      for (let i = 0; i < seps1.length; ++i) {
        let sep = seps1[i]
        let seps2 = sep.split('-')
        if (seps2.length === 1) {
          // 1 or A
          let v = seps2[0]
          if (!availNames.includes(v))
            throw new Error(`${v} is not an valid options for block. The block name is starting from: ${availNames[0]}`)
          rtnVals.push(v)
        } else if (seps2.length === 2) {
          // 1-2 or A - C
          let v1: string = seps2[0], v2: string = seps2[1]
          if (!isNaN(Number(v1))) {
            if (isNaN(Number(v2))) {
              throw new Error(`${v2} is not a numeric which follows ${v1}`)
            } else {
              let v1i: number = parseInt(v1), v2i: number = parseInt(v2)
              if (v1i > v2i) {
                let t: number = v1i
                v1i = v2i
                v2i = t
              }
              for (let j = v1i; j <= v2i; ++j) {
                let v = String(j)
                if (availNames.includes(v)) {
                  rtnVals.push(v)
                }
              }
            }
          } else {
            if (!isNaN(Number(v2))) {
              throw new Error(`${v2} is a numeric which follows ${v1}`)
            }
            let v1i: number = v1.charCodeAt(0),
              v2i: number = v2.charCodeAt(0)
            if (v1i > v2i) {
              let t: number = v1i
              v1i = v2i
              v2i = t
            }
            for (let j = v1i; j <= v2i; ++j) {
              let v = String.fromCharCode(j)
              if (availNames.includes(v)) {
                rtnVals.push(v)
              }
            }
          }
        } else {
          throw new Error(`Incorrect syntax in '${str}': Too many '-'`)
        }
      }
    }

    return rtnVals
  },

  // Support:
  // Type 1: 1 or 2 or G or B1 or B2
  // Type 2: *
  // Type 3: 1-10 or B2-2
  // Type 4: 1,2,8-10 or B3,B1,G-3
  parseFloornamesStr(availNames: Array<string>, str: string): Array<string> {
    str = str.trim().toUpperCase()
    if (str === '') throw new Error(`Cannot be empty string`)
    let rtnVals = new Array<string>
    if (str === '*') {
      rtnVals = [...availNames]
    } else {
      let seps1 = str.split(',')
      for (let i = 0; i < seps1.length; ++i) {
        let sep = seps1[i]
        let seps2 = sep.split('-')
        if (seps2.length === 1) {
          rtnVals.push(seps2[0])
        } else if (seps2.length === 2) {
          let unv1 = this.floorNameToValue(seps2[0])
          let start = unv1.value
          let unv2 = this.floorNameToValue(seps2[1])
          let end = unv2.value
          // if (unv1.type != unv2.type)
          //   throw new Error(`Invalid floor ${sep}`)
          for (let j = start; j <= end; ++j) {
            let v: string
            if (j < 0) {
              v = `B${-j}`
            } else if (j === 0) {
              v = 'G'
            } else {
              v = String(j)
            }
            if (availNames.includes(v)) {
              rtnVals.push(v)
            }
          }
        } else {
          throw new Error(`Incorrect syntax in '${str}': Too many '-'`)
        }
      }
    }
    return rtnVals
  },

  // Support:
  // Type 1: 1 or 2 or A or B
  // Type 2: *
  // Type 3: 1-3 or A-D
  // Type 4: 1,2,8-10 or A,B,D-E
  parseNumbernamesStr(availNames: Array<string>, str: string): Array<string> {
    str = str.trim().toUpperCase()
    if (str === '') throw new Error(`Cannot be empty string`)
    let rtnVals = new Array<string>
    if (str === '*') {
      rtnVals = [...availNames]
    } else {
      let seps1 = str.split(',')
      for (let i = 0; i < seps1.length; ++i) {
        let sep = seps1[i]
        let seps2 = sep.split('-')
        if (seps2.length === 1) {
          // 1 or A
          let v = seps2[0]
          if (!availNames.includes(v))
            throw new Error(`${v} is not an valid options for number. The number name is starting from: ${availNames[0]}`)
          rtnVals.push(v)
        } else if (seps2.length === 2) {
          // 1-2 or A - C
          let v1: string = seps2[0], v2: string = seps2[1]
          if (!isNaN(Number(v1))) {
            if (isNaN(Number(v2))) {
              throw new Error(`${v2} is not a numeric which follows ${v1}`)
            } else {
              let v1i: number = parseInt(v1), v2i: number = parseInt(v2)
              if (v1i > v2i) {
                let t: number = v1i
                v1i = v2i
                v2i = t
              }
              for (let j = v1i; j <= v2i; ++j) {
                let v = String(j)
                if (availNames.includes(v)) {
                  rtnVals.push(v)
                }
              }
            }
          } else {
            if (!isNaN(Number(v2))) {
              throw new Error(`${v2} is a numeric which follows ${v1}`)
            }
            let v1i: number = v1.charCodeAt(0),
              v2i: number = v2.charCodeAt(0)
            if (v1i > v2i) {
              let t: number = v1i
              v1i = v2i
              v2i = t
            }
            for (let j = v1i; j <= v2i; ++j) {
              let v = String.fromCharCode(j)
              if (availNames.includes(v)) {
                rtnVals.push(v)
              }
            }
          }
        } else {
          throw new Error(`Incorrect syntax in '${str}': Too many '-'`)
        }
      }
    }

    return rtnVals
  },

}