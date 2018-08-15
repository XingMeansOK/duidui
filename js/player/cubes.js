import { CUBESIDE, MULTIPLE } from '../constants.js'
const TWEEN = require('../libs/tween.js')
const THREE = require('../libs/three.min.js')

const geometry = new THREE.CubeGeometry(CUBESIDE, CUBESIDE, CUBESIDE)

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
  /**
   * 获取渐变色数组
   * @param colorStart 颜色起始值
   * @param colorEnd 颜色终止值
   * @param step 分段数
   */
  static getColorArr(colorStart, colorEnd, step) {

  }
}

// 导体方块
class CCube extends Cube {
  /**
   * 最下面一层导体块是白的，其余空间中分布的都是看不见的
   */
  constructor(pos, isTransparent) {
    super(pos)
    this.material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 })
    this.material.transparent = !!isTransparent
    // 在空间中占位的方块
    if (!!isTransparent) {
      this.material.opacity = 0
      this.castShadow = false
      this.receiveShadow = false;
      this.scale.set(0.01, 0.01, 0.01)
      this.name = 'spaceccube'
    }
  }
  /**
   * 出现动画
   * middle { r: 0,g: 1, b:1 } 过渡色
   * end 终止色
   */
  show(middle, end) {
    let tween = new TWEEN.Tween(this.scale)
      .to({ x: 1.1, y: 1.1, z: 1.1 }, 0.1)
      .onStart(() => {
        this.material.transparent && (this.material.opacity = 1)
        this.castShadow = true
        this.receiveShadow = true;
      })

    let tweenC = new TWEEN.Tween(this.material.color)
      .to(middle, 0.1)
    tweenC.start()

    // 保存颜色对象
    this.color = middle

    let tweenBack = new TWEEN.Tween(this.scale)
      .to({ x: 1, y: 1, z: 1 }, 0.3)
        .onComplete(() => {
          // this.material.transparent && (this.material.opacity = 0)
        })

    tween.chain(tweenBack)

    tween.start()
  }

  /**
   * 隐藏
   */
  hidden(middle, end) {
    let tween = new TWEEN.Tween(this.scale)
      .to({ x: 1.1, y: 1.1, z: 1.1 }, 0.2)

    let tweenBack = new TWEEN.Tween(this.scale)
      .to({ x: 0.01, y: 0.01, z: 0.01 }, 0.1)
      .onComplete(() => {
        if(this.material.transparent) {
          this.material.opacity = 0
          this.castShadow = false
          this.receiveShadow = false
        } 
      })

    tween.chain(tweenBack)

    tween.start()
  }

/**
 *  交换颜色
 */
  toggle(material) {
    let tween = new TWEEN.Tween(this.scale)
      .to({ x: 1.1, y: 1.1, z: 1.1 }, 0.2)

    let tweenBack = new TWEEN.Tween(this.scale)
      .to({ x: 0.01, y: 0.01, z: 0.01 }, 0.1)
      .onComplete(() => {
        if (this.material.transparent) {
          this.material.opacity = 0
          this.material = material
        }
      })

    let tween3 = new TWEEN.Tween(this.scale)
      .to({ x: 1.1, y: 1.1, z: 1.1 }, 0.2)
    let tween4 = new TWEEN.Tween(this.scale)
      .to({ x: 1, y: 1, z: 1 }, 0.3)
      .onComplete(() => {
        // this.material.transparent && (this.material.opacity = 0)
      })

    tween.chain(tweenBack)
    tweenBack.chain(tween3)
    tween3.chain(tween4)

    tween.start()
  }

/**
 * 涨一下
 */
pop() {
  let tween = new TWEEN.Tween(this.scale)
    .to({ x: 1.1, y: 1.1, z: 1.1 }, 0.1)

  let tweenBack = new TWEEN.Tween(this.scale)
    .to({ x: 1, y: 1, z: 1 }, 0.1)
    .onComplete(() => {
      // this.material.transparent && (this.material.opacity = 0)
    })

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
