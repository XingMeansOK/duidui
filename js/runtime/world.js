const THREE = require('../libs/three.min.js')
const TWEEN = require('../libs/tween.js')
import regeneratorRuntime from '../libs/regenerator-runtime';
import { CUBESIDE, MULTIPLE } from '../constants.js'
import { CCube, BCube, SCube } from '../player/cubes.js'
import { gradientColor, hex2Object } from '../libs/utils.js'
// 地面平台的宽高
const SIDE = 140
const HEIGHT = 200
// const CUBESIDE = 20
// 初始旋转角度
const ROTATION = Math.PI / 4

// scene 下游戏世界最顶层节点
export default class World extends THREE.Group {
  /**
   * 相机用于射线检测
   * theme 是主题颜色数组
   */
  constructor(camera, theme) {
    super()

    this.camera = camera
    this.theme = theme
    // 颜色换成{r:1,g:1b:1},方便 ccube 调用
    this.theme = theme.map(color => hex2Object(color))
    // GROUND
    var groundGeo = new THREE.CubeGeometry(SIDE, HEIGHT, SIDE)
    var groundMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 })
    // 这个属性是啥？？？
    // groundMat.color.setHSL(0.095, 1, 0.75)
    var ground = new THREE.Mesh(groundGeo, groundMat)
    ground.position.y = -(HEIGHT + CUBESIDE) / 2
    this.add(ground)
    ground.receiveShadow = true;
    ground.name = 'ground'

    // 初始旋转角度
    this.rotation.y = ROTATION

    // 鼠标交互
    this.interaction()
    // this.bindJump()

    // 初始化方块
    this.initCube()
    // 当前点亮的 cube 和上一个点亮的 cube
  }

  /**
   * 添加场景触摸交互
   */
  interaction() {
    // 场景控制。
    // 鼠标上一次所处的位置
    let x, y, mouseVector = new THREE.Vector3(), raycaster = new THREE.Raycaster()
    let move = (e) => {
      e.preventDefault()

      let _x = e.touches[0].clientX
      let _y = e.touches[0].clientY

      let d = _x - x
      let k = 1
      // world旋转的圆心角
      // 从整个屏幕横向划过可以旋转 π / k
      let r = d / window.innerWidth * Math.PI / k + this.rotation.y

      // 将旋转角度控制在0-2π
      this.rotation.y = r % (2 * Math.PI)
      if (this.rotation.y < 0) this.rotation.y += 2 * Math.PI

      x = _x
      y = _y
    }
    let end = (e) => {
      e.preventDefault()
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)

      // 触摸结束后的缓动效果
      let unit = ROTATION
      let rest = this.rotation.y % unit
      let times = parseInt(this.rotation.y / unit)
      let target
      // 期望world的旋转角度是45、135、225、315度
      // 如果是45度的奇数倍
      if (times % 2) target = unit * times
      else target = unit * ++times

      // create the tween
      // 小程序中的 Date.now()被重写，变成秒了，tween 中引用了这个时间，所以单位也是秒
      let tween = new TWEEN.Tween(this.rotation)
        .to({ y: target }, 0.1)
        .start();
    }
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      x = e.touches[0].clientX
      y = e.touches[0].clientY
      // 射线检测
      mouseVector.set(
        (x / window.innerWidth) * 2 - 1, - (y / window.innerHeight) * 2 + 1,
        0.5);
      raycaster.setFromCamera(mouseVector, this.camera);
      var intersects = raycaster.intersectObjects([this], true);
      if (intersects.length > 0) {
        var res = intersects.filter(function (res) {
          return res && res.object;
        })[0];
        // 转动底座
        if (res && res.object && res.object.name === 'ground') {
          canvas.addEventListener('touchmove', move)
          canvas.addEventListener('touchend', end)
        } 
        // 移动导体块
        else if (res && res.object && res.object.name === 'spaceccube') {
          if (res.object.material.opacity === 0) return 
          if (!this.firstPick || this.firstPick === res.object) {
            this.firstPick = res.object
            this.firstPick.pop()
          }
          else {
            // let material = this.firstPick.material.clone()
            // let material2 = res.object.material.clone()
            // this.firstPick.toggle(material2)
            // res.object.toggle(material)
            // this.firstPick = null

            let start = this.firstPick.position
            let middle = res.object.position
            // 只有两个块相邻且在同一平面内的时候可以换
            let c1 = start.distanceTo(middle) < (CUBESIDE * MULTIPLE) * Math.sqrt(2) * 1.01
            let c2 = start.x === middle.x || start.y === middle.y || start.z === middle.z
            if (c1 && c2 ) {
              let end = [
                middle.x - start.x + middle.x,
                middle.y - start.y + middle.y,
                middle.z - start.z + middle.z
              ].map(component => Math.round(component / (CUBESIDE * MULTIPLE))).join('')
              if (this.ccubeBox[end] && this.ccubeBox[end].material.opacity === 0) {
                // 跳转
                this.ccubeBox[end].show(this.firstPick.color)
                this.firstPick.hidden()
                // 位于底部一整行或一整列相同颜色的方块将消失
                this.ccubeBox[end].position.y === CUBESIDE * MULTIPLE && this.clearBottom()
              } 
            }
            this.firstPick = null

          }
          
        }
      }



    }).bind(this))
  }

  /**
   * 点击屏幕，SCube跳跃
   */
  bindJump () {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      if(this.scube.jumping) this.scube.jump2()
      else this.scube.jump()
    }).bind(this))
  }
  /**
   * 初始化所有方块
   */
  async initCube() {
    // this.pos = await require('../test/pos1.js')
    this.pos = require('../test/pos1.js').default
    var {ccpos, bcpos} = this.pos
    this.initCCube(ccpos)
    // this.initBCube(bcpos)
    // 运动块
    // this.scube = new SCube()
    // this.add(this.scube)
  }
  /**
   * 初始化导体方块
   * @param [Array] pos 导体方块的位置数组，元素还是数组
   */
  initCCube(pos) {
    // // 导体方块的位置数组
    // this.ccpos = pos.map( (coordinates) => {
    //   // 原始的位置最小单位是1，需要转换为方块的边长
    //   return coordinates.map( component => {
    //     return component * CUBESIDE * MULTIPLE
    //   })
    // })
    // 按照位置保存ccube的引用
    this.ccubeBox = {}
    // 导体方块指针数组
    this.ccubes = pos.map(coordinates => {
      let x = coordinates[0], y = coordinates[1], z = coordinates[2]
      // 原始的位置最小单位是1，需要转换为方块的边长
      let loc = coordinates.map( component => {
        return component * CUBESIDE * MULTIPLE
      })
      // 第二个参数表示是否透明
      let cc = new CCube(loc, y)
      this.add(cc)
      // 例如，位于（1,0,1）的ccube可以通过ccubeBox['101']获取
      this.ccubeBox[`${x}${y}${z}`] = cc
      return cc
    })
  }

  /**
   * 获取区间内的随机数
   * [)
   */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  /**
   * 初始化电源块
   */
  initBCube(pos) {
    // 电源方块的位置数组
    this.bcpos = pos.map(component => {
      return component * CUBESIDE * MULTIPLE
    })

    this.bcube = new BCube(this.bcpos)
    this.add(this.bcube)

  }

  /**
   * 变更点亮的导体块
   */
  _next() {
    // 到当前点亮的导体块的距离小于CUBESIDE
    let next = this.ccubes.find( cc => {
      return this.lighting.position.distanceTo(cc.position) < CUBESIDE * (MULTIPLE + 0.1) 
        && cc !== this.lastLighting
        && cc !== this.lighting
    })
    let temp = this.lastLighting
    this.lastLighting = this.lighting
    // 如果到头了就原地返回
    this.lighting = next || temp
    this.lighting.forEach(function(cc) {
      cc.twinkle()
    })
  }

  /**
 * 变更点亮的导体块
 */
  next() {

    let x = this.getRandomInt(-2, 3)
    let y = this.getRandomInt(1, 8)
    let z = this.getRandomInt(-2, 3)
    // 随机选中的导体块
    let cc = this.ccubeBox[`${x}${y}${z}`]

    if (cc.material.transparent && cc.material.opacity === 1) return 

    try {
      let color = this.theme[this.getRandomInt(0, this.theme.length)]
      this.ccubeBox[`${x}${y}${z}`].show(color, color)
    } catch (e) {
      console.log(`${x}${y}${z}`)
    }

  }

  /**
   * 清理底部整行整列相同颜色的块
   */
  clearBottom() {
    let range = [-2,-1,0,1,2]
    let zNeed = true
    range.forEach( x => {
      // 颜色一致和透明度（是否显示）
      let isSameX = this.isSameX(x,range)
      if(isSameX) {
        // 如果相同x的一行颜色相同，还要检查与之交叉的相同z的列，如果存在行列交叉颜色相同就都消了
        let z = range.find(z => {
          return this.isSameZ(z,range)
        })
        if(z) {
          this.clearXZ( x, z, range )
        } else {
          this.clearX( x, range )
        }
        zNeed = false
      }
    })
    // 如果有x相同的一行，就不用检查z了
    if(zNeed) {
      range.forEach(z => {
        // 颜色一致和透明度（是否显示）
        let isSameZ = this.isSameZ(z, range)
        if (isSameZ) {
          this.clearZ(z,range)
        }
      })
    }

    // 检查游戏是否结束
    this.checkEnd()
  }

  // 检查x相同的一行颜色是否相同
  isSameX (x,range){
    return range.every(z => {
      let c1 = this.ccubeBox[`${x}${1}${z}`].material.color === this.ccubeBox[`${x}${1}${0}`].material.color
      return c1 && this.ccubeBox[`${x}${1}${z}`].material.opacity === 1
    })
  }

  // 检查z相同的一行颜色是否相同
  isSameZ(z, range) {
    return range.every(x => {
      let c1 = this.ccubeBox[`${x}${1}${z}`].material.color === this.ccubeBox[`${x}${1}${0}`].material.color
      return c1 && this.ccubeBox[`${x}${1}${z}`].material.opacity === 1
    })
  }

  /**
   * 清除底部x相同的一行
   */
  clearX(x,range) {
    range.forEach( z => {
      this.ccubeBox[`${x}${1}${z}`].hidden()
    })
  }
/**
 * 清除底部z相同的一行
 */
  clearZ(z, range) {
    range.forEach(x => {
      this.ccubeBox[`${x}${1}${z}`].hidden()
    })
  }

/**
* 清除底部xz相同的一行
*/
  clearXZ(x,z, range) {
    let collection = []
    range.forEach(z => {
      collection.push(this.ccubeBox[`${x}${1}${z}`] )
    })
    range.forEach(x => {
      collection.push(this.ccubeBox[`${x}${1}${z}`])
    })
    collection.forEach(cc => {
      // 交叉点会调用两次
      cc.hidden()
    })
  }

/**
 * 检查游戏是否结束
 */
  checkEnd() {
    // yLimit层数内没有有带颜色的方块就算赢
    let yLimit = [3,4,5,6,7]
    let done = yLimit.every( y => {
      for(let x = -2; x < 3; x++) {
        for(let z = -2; z < 3; z++) {
          if( this.ccubeBox[`${x}${y}${z}`].material.opacity === 1 ) return false
        }
      }
      return true
    })

    if(done) {

    }

  }


}

