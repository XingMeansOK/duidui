// 生成 x ✖️ y ✖️ z 的矩阵
var p = (function (x, y, z) {

  x = parseInt( x / 2 )
  z = parseInt(z / 2)
  // 电源块坐标 
  let bcpos = [2, 1, 0]
  // 导体方块的坐标
  let ccpos = []
  for( let h = 0; h < y; h++ ) {
    for (let i = 0; i <= x; i++) {
      for (let j = 0; j <= z; j++) {
        ccpos.push([j, h, i])
        j && ccpos.push([-j, h, i])

        if (i) {
          ccpos.push([j, h, -i])
          j && ccpos.push([-j, h, -i])
        }
      }
    }
  }

  return {
    ccpos,
    bcpos
  }
}(5, 8, 5))

export default p