
var p = (function(col, row) {
  col = parseInt( col / 2 )
  row = parseInt( row / 2 )
  // 导体方块的坐标
  let ccpos = []
  // 电源块坐标 
  let bcpos = [2, 1, 0]
  for( let i = 0; i <= row; i++ ) {
    for (let j = 0; j <= col; j++) {
      ccpos.push([j, 0, i])
      j && ccpos.push([-j, 0, i])

      if(i) {
        ccpos.push([j, 0, -i])
        j && ccpos.push([-j, 0, -i])
      }
    }
  }
  return {
    ccpos,
    bcpos
  }
}(5, 5))

export default p