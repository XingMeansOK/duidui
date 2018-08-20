const THREE = require('../libs/three.min.js')

/**
 * 交互平面，平面中添加的对象代表UI按钮
 * 射线检测的时候如果pick到这些UI按钮对象，先读取其保存的属性指令command，然后游戏世界对象world执行对应的方法world[uiObject.command]()
 */
export default class TouchScreen extends THREE.Group {
  constructor(width, height) {
    super()
    let material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 })
    let geo = new THREE.CircleGeometry(50, 32);

    let mesh = new THREE.Mesh(geo, material)
    mesh.position.x = width / 2
    mesh.position.y = height / 2
    this.add(mesh)
  }
}