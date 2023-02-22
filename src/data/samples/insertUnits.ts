/**
 * Insert sample data for the tables other than the units table
 */

// import { Env } from '@/bindings'
import getCurrentLine from 'get-current-line'

import { Bindings } from '../../bindings'
import { nanoid } from 'nanoid'
import { Constant } from '../../const'
import { Util } from '../../util'

const unitResBlkA = `
Floor,Room
1,2
1,3
1,4
1,5
1,6
1,7
1,8
1,9
1,10
1,11
1,12
1,13
1,14
1,15
1,16
2,1
2,2
2,3
2,4
2,5
2,6
2,7
2,8
2,9
2,10
2,11
2,12
2,13
2,14
2,15
2,16
3,1
3,2
3,3
3,4
3,5
3,6
3,7
3,8
3,9
3,10
3,11
3,12
3,13
3,14
3,15
3,16
4,1
4,2
4,3
4,4
4,5
4,6
4,7
4,8
4,9
4,10
4,11
4,12
4,13
4,14
4,15
4,16
5,1
5,2
5,3
5,4
5,5
5,6
5,7
5,8
5,9
5,10
5,11
5,12
5,13
5,14
5,15
5,16
6,1
6,2
6,3
6,4
6,5
6,6
6,7
6,8
6,9
6,10
6,11
6,12
6,13
6,14
6,15
6,16
7,1
7,2
7,3
7,4
7,5
7,6
7,7
7,8
7,9
7,10
7,11
7,12
7,13
7,14
7,15
7,16
8,1
8,2
8,3
8,4
8,5
8,6
8,7
8,8
8,9
8,10
8,11
8,12
8,13
8,14
8,15
8,16
9,1
9,2
9,3
9,4
9,5
9,6
9,7
9,8
9,9
9,10
9,11
9,12
9,13
9,14
9,15
9,16
10,1
10,2
10,3
10,4
10,5
10,6
10,7
10,8
10,9
10,10
10,11
10,12
10,13
10,14
10,15
10,16
11,1
11,2
11,3
11,4
11,5
11,6
11,7
11,8
11,9
11,10
11,11
11,12
11,13
11,14
11,15
11,16
12,1
12,2
12,3
12,4
12,5
12,6
12,7
12,8
12,9
12,10
12,11
12,12
12,13
12,14
12,15
12,16
13,1
13,2
13,3
13,4
13,5
13,6
13,7
13,8
13,9
13,10
13,11
13,12
13,13
13,14
13,15
13,16
14,1
14,2
14,3
14,4
14,5
14,6
14,7
14,8
14,9
14,10
14,11
14,12
14,13
14,14
14,15
14,16
15,1
15,2
15,3
15,4
15,5
15,6
15,7
15,8
15,9
15,10
15,11
15,12
15,13
15,14
15,15
15,16
16,1
16,2
16,3
16,4
16,5
16,6
16,7
16,8
16,9
16,10
16,11
16,12
16,13
16,14
16,15
16,16
17,1
17,2
17,3
17,4
17,5
17,6
17,7
17,8
17,9
17,10
17,11
17,12
17,13
17,14
17,15
17,16
18,1
18,2
18,3
18,4
18,5
18,6
18,7
18,8
18,9
18,10
18,11
18,12
18,13
18,14
18,15
18,16
19,1
19,2
19,3
19,4
19,5
19,6
19,7
19,8
19,9
19,10
19,11
19,12
19,13
19,14
19,15
19,16
20,1
20,2
20,3
20,4
20,5
20,6
20,7
20,8
20,9
20,10
20,11
20,12
20,13
20,14
20,15
20,16
21,1
21,2
21,3
21,4
21,5
21,6
21,7
21,8
21,9
21,10
21,11
21,12
21,13
21,14
21,15
21,16
22,1
22,2
22,3
22,4
22,5
22,6
22,7
22,8
22,9
22,10
22,11
22,12
22,13
22,14
22,15
22,16
23,1
23,2
23,3
23,4
23,5
23,6
23,7
23,8
23,9
23,10
23,11
23,12
23,13
23,14
23,15
23,16
24,1
24,2
24,3
24,4
24,5
24,6
24,7
24,8
24,9
24,10
24,11
24,12
24,13
24,14
24,15
24,16
25,1
25,2
25,3
25,4
25,5
25,6
25,7
25,8
25,9
25,10
25,11
25,12
25,13
25,14
25,15
25,16
26,1
26,2
26,3
26,4
26,5
26,6
26,7
26,8
26,9
26,10
26,11
26,12
26,13
26,14
26,15
26,16
27,1
27,2
27,3
27,4
27,5
27,6
27,7
27,8
27,9
27,10
27,11
27,12
27,13
27,14
27,15
27,16
28,1
28,2
28,3
28,4
28,5
28,6
28,7
28,8
28,9
28,10
28,11
28,12
28,13
28,14
28,15
28,16
29,1
29,2
29,3
29,4
29,5
29,6
29,7
29,8
29,9
29,10
29,11
29,12
29,13
29,14
29,15
29,16
30,1
30,2
30,3
30,4
30,5
30,6
30,7
30,8
30,9
30,10
30,11
30,12
30,13
30,14
30,15
30,16
31,1
31,2
31,3
31,4
31,5
31,6
31,7
31,8
31,9
31,10
31,11
31,12
31,13
31,14
31,15
31,16
32,1
32,2
32,3
32,4
32,5
32,6
32,7
32,8
32,9
32,10
32,11
32,12
32,13
32,14
32,15
32,16
33,1
33,2
33,3
33,4
33,5
33,6
33,7
33,8
33,9
33,10
33,11
33,12
33,13
33,14
33,15
33,16
34,1
34,2
34,3
34,4
34,5
34,6
34,7
34,8
34,9
34,10
34,11
34,12
34,13
34,14
34,15
34,16
35,1
35,2
35,3
35,4
35,5
35,6
35,7
35,8
35,9
35,10
35,11
35,12
35,13
35,14
35,15
35,16
`

const unitResBlkB = `
Floor,Room
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
1,
2,1
2,2
2,3
2,4
2,5
2,6
2,7
2,8
2,9
2,10
2,11
2,12
2,13
2,14
2,15
2,16
3,1
3,2
3,3
3,4
3,5
3,6
3,7
3,8
3,9
3,10
3,11
3,12
3,13
3,14
3,15
3,16
4,1
4,2
4,3
4,
4,5
4,6
4,7
4,8
4,9
4,10
4,11
4,12
4,13
4,14
4,15
4,16
5,1
5,2
5,3
5,4
5,5
5,6
5,7
5,8
5,9
5,10
5,11
5,12
5,13
5,14
5,15
5,16
6,1
6,2
6,3
6,4
6,5
6,6
6,7
6,8
6,9
6,10
6,11
6,12
6,13
6,14
6,15
6,16
7,1
7,2
7,3
7,4
7,5
7,6
7,7
7,8
7,9
7,10
7,11
7,12
7,13
7,14
7,15
7,16
8,1
8,2
8,3
8,4
8,5
8,6
8,7
8,8
8,9
8,10
8,11
8,12
8,13
8,14
8,15
8,16
9,1
9,2
9,3
9,4
9,5
9,6
9,7
9,8
9,9
9,10
9,11
9,12
9,13
9,14
9,15
9,16
10,1
10,2
10,3
10,4
10,5
10,6
10,7
10,8
10,9
10,10
10,11
10,12
10,13
10,14
10,15
10,16
11,1
11,2
11,3
11,4
11,5
11,6
11,7
11,8
11,9
11,10
11,11
11,12
11,13
11,14
11,15
11,16
12,1
12,2
12,3
12,4
12,5
12,6
12,7
12,8
12,9
12,10
12,11
12,12
12,13
12,14
12,15
12,16
13,1
13,2
13,3
13,4
13,5
13,6
13,7
13,8
13,9
13,10
13,11
13,12
13,13
13,14
13,15
13,16
14,1
14,2
14,3
14,
14,5
14,6
14,7
14,8
14,9
14,10
14,11
14,12
14,13
14,14
14,15
14,16
15,1
15,2
15,3
15,4
15,5
15,6
15,7
15,8
15,9
15,10
15,11
15,12
15,13
15,14
15,15
15,16
16,1
16,2
16,3
16,4
16,5
16,6
16,7
16,8
16,9
16,10
16,11
16,12
16,13
16,14
16,15
16,16
17,1
17,2
17,3
17,4
17,5
17,6
17,7
17,8
17,9
17,10
17,11
17,12
17,13
17,14
17,15
17,16
18,1
18,2
18,3
18,4
18,5
18,6
18,7
18,8
18,9
18,10
18,11
18,12
18,13
18,14
18,15
18,16
19,1
19,2
19,3
19,4
19,5
19,6
19,7
19,8
19,9
19,10
19,11
19,12
19,13
19,14
19,15
19,16
20,1
20,2
20,3
20,4
20,5
20,6
20,7
20,8
20,9
20,10
20,11
20,12
20,13
20,14
20,15
20,16
21,1
21,2
21,3
21,4
21,5
21,6
21,7
21,8
21,9
21,10
21,11
21,12
21,13
21,14
21,15
21,16
22,1
22,2
22,3
22,4
22,5
22,6
22,7
22,8
22,9
22,10
22,11
22,12
22,13
22,14
22,15
22,16
23,1
23,2
23,3
23,4
23,5
23,6
23,7
23,8
23,9
23,10
23,11
23,12
23,13
23,14
23,15
23,16
24,1
24,2
24,3
24,
24,5
24,6
24,7
24,8
24,9
24,10
24,11
24,12
24,13
24,14
24,15
24,16
25,1
25,2
25,3
25,4
25,5
25,6
25,7
25,8
25,9
25,10
25,11
25,12
25,13
25,14
25,15
25,16
26,1
26,2
26,3
26,4
26,5
26,6
26,7
26,8
26,9
26,10
26,11
26,12
26,13
26,14
26,15
26,16
27,1
27,2
27,3
27,4
27,5
27,6
27,7
27,8
27,9
27,10
27,11
27,12
27,13
27,14
27,15
27,16
28,1
28,2
28,3
28,4
28,5
28,6
28,7
28,8
28,9
28,10
28,11
28,12
28,13
28,14
28,15
28,16
29,1
29,2
29,3
29,4
29,5
29,6
29,7
29,8
29,9
29,10
29,11
29,12
29,13
29,14
29,15
29,16
30,1
30,2
30,3
30,4
30,5
30,6
30,7
30,8
30,9
30,10
30,11
30,12
30,13
30,14
30,15
30,16
31,1
31,2
31,3
31,4
31,5
31,6
31,7
31,8
31,9
31,10
31,11
31,12
31,13
31,14
31,15
31,16
32,1
32,2
32,3
32,4
32,5
32,6
32,7
32,8
32,9
32,10
32,11
32,12
32,13
32,14
32,15
32,16
33,1
33,2
33,3
33,4
33,5
33,6
33,7
33,8
33,9
33,10
33,11
33,12
33,13
33,14
33,15
33,16
34,1
34,2
34,3
34,4
34,5
34,6
34,7
34,8
34,9
34,10
34,11
34,12
34,13
34,14
34,15
34,16
35,1
35,2
35,3
35,4
35,5
35,6
35,7
35,8
35,9
35,10
35,11
35,12
35,13
35,14
35,15
35,16
`

const unitResBlkC = `
Floor,Room
1,1
1,2
1,3
1,4
1,5
1,6
1,7
1,8
1,9
1,10
1,11
1,12
1,13
1,14
1,15
1,16
2,1
2,2
2,3
2,4
2,5
2,6
2,7
2,8
2,9
2,10
2,11
2,12
2,13
2,14
2,15
2,16
3,1
3,2
3,3
3,4
3,5
3,6
3,7
3,8
3,9
3,10
3,11
3,12
3,13
3,14
3,15
3,16
,1
,2
,3
,4
,5
,6
,7
,8
,9
,10
,11
,12
,13
,14
,15
,16
5,1
5,2
5,3
5,4
5,5
5,6
5,7
5,8
5,9
5,10
5,11
5,12
5,13
5,14
5,15
5,16
6,1
6,2
6,3
6,4
6,5
6,6
6,7
6,8
6,9
6,10
6,11
6,12
6,13
6,14
6,15
6,16
7,1
7,2
7,3
7,4
7,5
7,6
7,7
7,8
7,9
7,10
7,11
7,12
7,13
7,14
7,15
7,16
8,1
8,2
8,3
8,4
8,5
8,6
8,7
8,8
8,9
8,10
8,11
8,12
8,13
8,14
8,15
8,16
9,1
9,2
9,3
9,4
9,5
9,6
9,7
9,8
9,9
9,10
9,11
9,12
9,13
9,14
9,15
9,16
10,1
10,2
10,3
10,4
10,5
10,6
10,7
10,8
10,9
10,10
10,11
10,12
10,13
10,14
10,15
10,16
11,1
11,2
11,3
11,4
11,5
11,6
11,7
11,8
11,9
11,10
11,11
11,12
11,13
11,14
11,15
11,16
12,1
12,2
12,3
12,4
12,5
12,6
12,7
12,8
12,9
12,10
12,11
12,12
12,13
12,14
12,15
12,16
13,1
13,2
13,3
13,4
13,5
13,6
13,7
13,8
13,9
13,10
13,11
13,12
13,13
13,14
13,15
13,16
,1
,2
,3
,4
,5
,6
,7
,8
,9
,10
,11
,12
,13
,14
,15
,16
15,1
15,2
15,3
15,4
15,5
15,6
15,7
15,8
15,9
15,10
15,11
15,12
15,13
15,14
15,15
15,16
16,1
16,2
16,3
16,4
16,5
16,6
16,7
16,8
16,9
16,10
16,11
16,12
16,13
16,14
16,15
16,16
17,1
17,2
17,3
17,4
17,5
17,6
17,7
17,8
17,9
17,10
17,11
17,12
17,13
17,14
17,15
17,16
18,1
18,2
18,3
18,4
18,5
18,6
18,7
18,8
18,9
18,10
18,11
18,12
18,13
18,14
18,15
18,16
19,1
19,2
19,3
19,4
19,5
19,6
19,7
19,8
19,9
19,10
19,11
19,12
19,13
19,14
19,15
19,16
20,1
20,2
20,3
20,4
20,5
20,6
20,7
20,8
20,9
20,10
20,11
20,12
20,13
20,14
20,15
20,16
21,1
21,2
21,3
21,4
21,5
21,6
21,7
21,8
21,9
21,10
21,11
21,12
21,13
21,14
21,15
21,16
22,1
22,2
22,3
22,4
22,5
22,6
22,7
22,8
22,9
22,10
22,11
22,12
22,13
22,14
22,15
22,16
23,1
23,2
23,3
23,4
23,5
23,6
23,7
23,8
23,9
23,10
23,11
23,12
23,13
23,14
23,15
23,16
,1
,2
,3
,4
,5
,6
,7
,8
,9
,10
,11
,12
,13
,14
,15
,16
25,1
25,2
25,3
25,4
25,5
25,6
25,7
25,8
25,9
25,10
25,11
25,12
25,13
25,14
25,15
25,16
26,1
26,2
26,3
26,4
26,5
26,6
26,7
26,8
26,9
26,10
26,11
26,12
26,13
26,14
26,15
26,16
27,1
27,2
27,3
27,4
27,5
27,6
27,7
27,8
27,9
27,10
27,11
27,12
27,13
27,14
27,15
27,16
28,1
28,2
28,3
28,4
28,5
28,6
28,7
28,8
28,9
28,10
28,11
28,12
28,13
28,14
28,15
28,16
29,1
29,2
29,3
29,4
29,5
29,6
29,7
29,8
29,9
29,10
29,11
29,12
29,13
29,14
29,15
29,16
30,1
30,2
30,3
30,4
30,5
30,6
30,7
30,8
30,9
30,10
30,11
30,12
30,13
30,14
30,15
30,16
31,1
31,2
31,3
31,4
31,5
31,6
31,7
31,8
31,9
31,10
31,11
31,12
31,13
31,14
31,15
31,16
32,1
32,2
32,3
32,4
32,5
32,6
32,7
32,8
32,9
32,10
32,11
32,12
32,13
32,14
32,15
32,16
33,1
33,2
33,3
33,4
33,5
33,6
33,7
33,8
33,9
33,10
33,11
33,12
33,13
33,14
33,15
33,16
34,1
34,2
34,3
34,4
34,5
34,6
34,7
34,8
34,9
34,10
34,11
34,12
34,13
34,14
34,15
34,16
35,1
35,2
35,3
35,4
35,5
35,6
35,7
35,8
35,9
35,10
35,11
35,12
35,13
35,14
35,15
35,16
`

const unitCarBlkA = `
Floor,Room
B2,2
B2,3
B2,4
B2,5
B2,6
B2,7
B2,8
B2,9
B2,10
B2,11
B2,12
B2,13
B2,14
B2,15
B2,16
B2,17
B2,18
B2,19
B2,20
B2,21
B2,22
B2,23
B2,24
B2,25
B2,26
B2,27
B2,28
B2,29
B2,30
B2,31
B2,32
B2,33
B2,34
B2,35
B2,36
B2,37
B2,38
B2,39
B2,40
B2,41
B2,42
B2,43
B2,44
B2,45
B2,46
B2,47
B2,48
B2,49
B2,50
B1,1
B1,2
B1,3
B1,4
B1,5
B1,6
B1,7
B1,8
B1,9
B1,10
B1,11
B1,12
B1,13
B1,14
B1,15
B1,16
B1,17
B1,18
B1,19
B1,20
B1,21
B1,22
B1,23
B1,24
B1,25
B1,26
B1,27
B1,28
B1,29
B1,30
B1,31
B1,32
B1,33
B1,34
B1,35
B1,36
B1,37
B1,38
B1,39
B1,40
B1,41
B1,42
B1,43
B1,44
B1,45
B1,46
B1,47
B1,48
B1,49
B1,50
G,1
G,2
G,3
G,4
G,5
G,6
G,7
G,8
G,9
G,10
G,11
G,12
G,13
G,14
G,15
G,16
G,17
G,18
G,19
G,20
G,21
G,22
G,23
G,24
G,25
G,26
G,27
G,28
G,29
G,30
G,31
G,32
G,33
G,34
G,35
G,36
G,37
G,38
G,39
G,40
G,41
G,42
G,43
G,44
G,45
G,46
G,47
G,48
G,49
G,50
`

const unitShpBlkA = `
Floor,Room
G,1
G,2
G,3
G,4
G,5
G,6
G,7
G,8
G,9
G,10
1,1
1,2
1,3
1,4
1,5
1,6
1,7
1,8
1,9
1,10
`

type Unit = {
  floor: string
  number: string
}

function parseCsv(csv: string): Unit[] {
  let rows = csv.split('\n')
  let floors: string[] = [], rooms: string[] = [];

  let units: Unit[] = []
  for (let i = 0; i < rows.length; ++i) {
    let row = rows[i]
    if (row.trim() == '') continue // Skip empty row
    if (row.toLowerCase() == 'floor,room') continue // Skip row 0: column names
    let columns = rows[i].split(',')
    if (columns.length != 2) throw new Error(`Row ${i + 2} must contain <Floor>,<Room> values`)
    // Elimate the '"' to retrive real value
    let isSkipThis = false
    for (let j = 0; j < columns.length; ++j) {
      let column = columns[j].trim()
      if (column === '') {
        isSkipThis = true
        break
      }
      if (column[0] === '"') {
        column = column.substring(1, column.length - 1)
      }
      columns[j] = column
    }
    if (isSkipThis) continue // Skip all empty columns
    let floor = columns[0]
    if (floor!.length > Constant.MAX_FLOORNAME_LEN)
      throw new Error(`Floor ${floor} text length too long! Max. ${Constant.MAX_FLOORNAME_LEN}`)
    if (!floors.includes(floor as never)) floors.push(floor!)
    let room = columns[1]
    if (room!.length > Constant.MAX_ROOMNAME_LEN)
      throw new Error(`Room ${room} text length too long! Max. ${Constant.MAX_ROOMNAME_LEN}`)
    if (!rooms.includes(room as never)) rooms.push(room!)

    // Create the unit JSON
    units.push({
      floor: floor,
      number: room,
    })
  }
  if (units.length === 0) throw new Error('No residences unit found!');
  return units
}

export const insertSampleUnits = async (env: Bindings) => {
  let sql: string
  let rst: D1Result
  let rst2: D1Result[]
  let count = 0

  try {
    // Get the userId
    let stmt = env.DB.prepare('SELECT id FROM Users WHERE email=?').bind(env.INITIAL_ADMIN_EMAIL)
    const record: any = await stmt.first()
    if (record == null) throw new Error(`Can't find user with email: ${env.INITIAL_ADMIN_EMAIL}`)
    const userId = record.id

    // Process Residence Block A
    let units = parseCsv(unitResBlkA)
    let binds: any[] = []
    stmt = env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)')
    for (let i = 0; i < units.length; ++i) {
      ++count
      binds.push(stmt.bind(nanoid(), userId, 'res', 'A', units[i].floor, units[i].number))
    }
    rst2 = await env.DB.batch(binds)

    // Process Residence Block B
    units = parseCsv(unitResBlkB)
    binds = []
    stmt = env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)')
    for (let i = 0; i < units.length; ++i) {
      ++count
      binds.push(stmt.bind(nanoid(), userId, 'res', 'B', units[i].floor, units[i].number))
    }
    rst2 = await env.DB.batch(binds)

    // Process Residence Block C
    units = parseCsv(unitResBlkC)
    binds = []
    stmt = env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)')
    for (let i = 0; i < units.length; ++i) {
      ++count
      binds.push(stmt.bind(nanoid(), userId, 'res', 'C', units[i].floor, units[i].number))
    }
    rst2 = await env.DB.batch(binds)

    // Process Carpark Block A
    units = parseCsv(unitCarBlkA)
    binds = []
    stmt = env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)')
    for (let i = 0; i < units.length; ++i) {
      ++count
      binds.push(stmt.bind(nanoid(), userId, 'car', 'A', units[i].floor, units[i].number))
    }
    rst2 = await env.DB.batch(binds)

    // Process Shop Block A
    units = parseCsv(unitShpBlkA)
    binds = []
    stmt = env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)')
    for (let i = 0; i < units.length; ++i) {
      ++count
      binds.push(stmt.bind(nanoid(), userId, 'shp', 'A', units[i].floor, units[i].number))
    }
    rst2 = await env.DB.batch(binds)

    return {
      success: true,
      message: `${count} records inserted`
    }
  } catch (ex: any) {
    console.log('Exception:')
    console.log(ex)
  }
}
