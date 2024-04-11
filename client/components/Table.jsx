import { Text } from './Text'

/**
 *
 * @param {Object} lineObj
 * @returns
 */
const TableLine = ({ lineObj }) => {
  return (
    <tr>
      {Object.keys(lineObj).map((key) => (
        <td key={key}>{lineObj[key]}</td>
      ))}
    </tr>
  )
}

/**
 *
 * @param {Object[]} linesObj
 * @returns
 */
export const Table = ({ linesObj }) => {
  if (linesObj === undefined || linesObj === null || linesObj.length === 0) {
    return <Text>No data</Text>
  }

  return (
    <table className="centered-table">
      <thead style={{ position: 'sticky', top: '0px', zIndex: 3 }}>
        <tr>
          {Object.keys(linesObj[0]).map((key) => (
            <th key={key} style={{ width: '20%' }}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linesObj.map((lineObj, i) => (
          <TableLine key={i} lineObj={lineObj} />
        ))}
      </tbody>
    </table>
  )
}
