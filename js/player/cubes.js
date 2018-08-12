import { CUBESIDE } from '../constants.js'
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
    // 初始化位置
    this.position.set(...pos)
    // 保存位置数组的指针
    this.pos = pos
    this.geometry = geometry
  }
}

// 导体方块
class CCube extends Cube {
  constructor(pos) {
    super(pos)
    this.material = new THREE.MeshBasicMaterial({ color: { r: 0.3, g: 0.3, b: 0.3 } })
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

export {
  CCube,
  BCube
}
