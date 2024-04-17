import { Text } from './Text'

/**
 *
 * @param {Object} lineObj
 * @returns
 */
const TableLine = ({ lineObj }) => {
  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${
          Object.keys(lineObj).length
        }, minmax(100px, 1fr))`,
        // backgroundColor: 'var(--secondary-color)',
      }}
      className="grid-row"
    >
      {Object.keys(lineObj).map((key) => (
        <div key={key} className="grid-cell">
          {lineObj[key]}
        </div>
      ))}
    </div>
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
    <div>
      <div className="grid-table">
        <div
          style={{
            gridTemplateColumns: `repeat(${
              Object.keys(linesObj[0]).length
            }, minmax(200px, 1fr))`,
            backgroundColor: 'var(--primary-color)',
          }}
          className="grid-header"
        >
          {Object.keys(linesObj[0]).map((key) => (
            <div key={key} className="grid-cell">
              {key}
            </div>
          ))}
        </div>
        <div className="grid-body">
          {linesObj.map((lineObj, i) => (
            <TableLine key={i} lineObj={lineObj} />
          ))}
        </div>
      </div>
    </div>
  )
}
