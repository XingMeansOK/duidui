const THREE = require('../libs/three.min.js')
const TWEEN = require('../libs/tween.js')

// 像素边长
const SIDE = 5
/**
 * 交互平面，平面中添加的对象代表UI按钮
 * 射线检测的时候如果pick到这些UI按钮对象，先读取其保存的属性指令command，然后游戏世界对象world执行对应的方法world[uiObject.command]()
 */
export default class TouchScreen extends THREE.Group {
  constructor(width, height) {
    super()
    // 保存交互平面的宽高
    this.width = width
    this.height = height

    // 初始化像素块
    this.initPixels()
  }

  initPixels() {

    this.pixels = []
    // 像素中心之间的间距
    let gap = SIDE + 0.3

    // 列数
    let cols = parseInt( this.width / gap )
    // 行数
    let rows = parseInt( this.height / gap )
    // 偏移量微调
    let shift = 1
    // x轴偏移量
    let x_shift = this.width / 2 - SIDE + shift
    // y 轴偏移量
    let y_shift = this.height / 2 - SIDE + shift
    // 逐列初始化，这样就能按照 x，y 的格式读取索引，不过不同于屏幕坐标，x 轴向右，y 轴向上
    for( let i = 0; i < cols; i++ ) {
      // 一列
      let col = []
      for( let j = 0; j < rows; j++ ) {
        let pixel = new Pixel([i * gap - x_shift, j * gap - y_shift, 0], false)
        // 像素块记录自己的行列号，col 代表像素的 x，row 代表像素的 y
        pixel.col = i
        pixel.row = j
        // 不渲染的对象不会对性能造成负担
        // pixel.visible = false
        this.add( pixel )
        col.push( pixel )
      }
      this.pixels.push( col )
    }

  }
}

const geometry = new THREE.PlaneGeometry( SIDE, SIDE );


/**
 * 像素块
 */
class Pixel extends THREE.Mesh {
  constructor(pos, isHidden) {
    super(pos)
    // 阴影
    // this.castShadow = true
    // this.receiveShadow = true
    // 初始化位置
    this.position.set(...pos)
    // 初始化几何体和材质
    this.geometry = geometry
    this.material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 })
    // 材质可以透明，与 opacity 配合使用
    this.material.transparent = true
    // 如果初始状态是不可见的
    if (!!isHidden) {
      // this.visible = false
      // this.material.opacity = 0
      // 材质默认是单面渲染，旋转到背面就隐身了
      this.rotation.x = Math.PI
      // this.castShadow = false
      // this.receiveShadow = false;
    }

    // 名字
    this.name = 'pixel'
  }

  /**
   * 翻转
   */
  flip() {
    let tween = new TWEEN.Tween(this.rotation)
      .to({ x: this.rotation.x + Math.PI }, 0.5)
    
    tween.start()
  }
}