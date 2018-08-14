const THREE = require('../libs/three.min.js')
const TWEEN = require('../libs/tween.js')
import regeneratorRuntime from '../libs/regenerator-runtime';
import { CUBESIDE, MULTIPLE } from '../constants.js'
import { CCube, BCube, SCube } from '../player/cubes.js'
// 地面平台的宽高
const SIDE = 140
const HEIGHT = 200
// const CUBESIDE = 20
// 初始旋转角度
const ROTATION = Math.PI / 4


// scene 下游戏世界最顶层节点
export default class World extends THREE.Group {
  constructor(camera) {
    super()

    this.camera = camera
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
    // this.interaction()
    this.bindJump()

    // 初始化方块
    this.initCube()
    // 当前点亮的 cube 和上一个点亮的 cube
    this.lighting = this.lastLighting = this.ccubes[0]
  }

  /**
   * 添加场景触摸交互
   */
  interaction() {
    // 场景控制
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
        if (res && res.object && res.object.name === 'ground') {
          canvas.addEventListener('touchmove', move)
          canvas.addEventListener('touchend', end)
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
    this.scube = new SCube()
    this.add(this.scube)
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
    this.lighting.twinkle()
  }


/**
 * 变更点亮的导体块
 */
  next() {
    let x = this.getRandomInt(-2, 3)
    let y = this.getRandomInt(0, 5)
    let z = this.getRandomInt(-2, 3)
    // 到当前点亮的导体块的距离小于CUBESIDE
    try {
      this.ccubeBox[`${x}${y}${z}`].twinkle()
    } catch(e) {
      console.log(`${x}${y}${z}`)
    }

  }
}

