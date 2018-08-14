import { CUBESIDE, MULTIPLE } from '../constants.js'
const TWEEN = require('../libs/tween.js')
const THREE = require('../libs/three.min.js')

const geometry = new THREE.CubeGeometry(CUBESIDE, CUBESIDE, CUBESIDE)
// 导体块的材质
const CCM = new THREE.MeshBasicMaterial({ color: 0x000000 })
// 电源块的材质
const BCM = new THREE.MeshBasicMaterial({ color: 0xffffff })

// 方块
class Cube extends THREE.Mesh {
  constructor(pos) {
    super()
    this.castShadow = true
    this.receiveShadow = true;
    // 初始化位置
    this.position.set(...pos)
    this.geometry = geometry
  }
}

// 导体方块
class CCube extends Cube {
  constructor(pos) {
    super(pos)
    this.material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 })
  }
  /**
   * 闪烁动画
   */
  twinkle() {
    let tween = new TWEEN.Tween(this.material.color)
      .to({ r: 1,g: 1, b:1 }, 0.1)

      // .repeat(Infinity)
    let tweenBack = new TWEEN.Tween(this.material.color)
      .to({ r: 0.3, g: 0.3, b: 0.3 }, 0.7)

    tween.chain(tweenBack)

    tween.start()
  }
}

// 电源块
class BCube extends Cube {
  constructor(pos) {
    super(pos)
    this.material = BCM
    // 正极方向（电流方向）
    this.positive = new THREE.Vector3(- CUBESIDE, 0, 0)
  }
}

/**
 * 运动块！sport cube哒啦
 */
// 运动过程中的转角
const DT = CUBESIDE * MULTIPLE * 2
const CORNER = [
  [DT, DT / 2, - DT],
  [-DT, DT / 2, - DT],
  [-DT, DT / 2, DT],
  [DT, DT / 2, DT]
]
class SCube extends Cube {
  constructor() {
    super(CORNER[1])
    this.material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 })
    this.jumping = false

    // 开始跑
    // this.run()
    this.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0,0,0), 39, 0xffff00))
  }
  /**
   * 不停的转圈跑
   */
  run() {
    let seconds = 0.4

    // 缓动数组
    let tweens = CORNER.map(pos => {
      return new TWEEN.Tween(this.position)
        .to({ x: pos[0], z: pos[2] }, seconds)
        .onStart(() => { 
          // this.lookAt(...pos)
        })
        .onComplete(() => {
          this.rotation.y += Math.PI / 2
        })
    })

    tweens.forEach((tween, index) => {
      // 最后一个缓动继续接第一个缓动
      if (index === tweens.length - 1) {
        tween.chain(tweens[0])
      } else {
        tween.chain(tweens[index + 1])
      }
    })

    this.rotation.y = - Math.PI / 2
    tweens[1].start()
  }

  /**
   * 跳跃
   */
  jump () {
    let seconds = 0.2
    let t = new TWEEN.Tween(this.position)
      .to({ y: DT * 2 }, seconds)
      .easing(TWEEN.Easing.Quadratic.Out)
    
    let tb = new TWEEN.Tween(this.position)
      .to({ y: DT / 2 }, seconds)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.jumping = false
      })

    t.chain(tb)
    t.start()
    this.jumping = true
  }

  /**
   * 二段跳
  */
  jump2 () {
    let seconds = 0.2
    let t = new TWEEN.Tween(this.position)
      .to({ y: DT * 4 }, seconds)
      .easing(TWEEN.Easing.Quadratic.Out)

    let tb = new TWEEN.Tween(this.position)
      .to({ y: DT / 2 }, seconds)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.jumping = false
      })

    let tRoll = new TWEEN.Tween(this.rotation)
      .to({ x: Math.PI * 4 }, seconds * 2)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.jumping = false
        this.rotation.x = 0
      })

    t.chain(tb)
    t.start()
    tRoll.start()
  }
}

export {
  CCube,
  BCube,
  SCube
}
