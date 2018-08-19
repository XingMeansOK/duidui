
// import Player from './player/index'
// import Enemy from './npc/enemy'
// import BackGround from './runtime/background'
// import GameInfo from './runtime/gameinfo'
// import Music from './runtime/music'
// import DataBus from './databus'
// import THREE from './libs/three.min.js'
// 游戏世界的顶层节点
import World from './runtime/world.js'
// 天空（灯光）
import sky from './runtime/sky.js'
import { THEME } from './constants.js'
const THREE = require('./libs/three.min.js')
const TWEEN = require('./libs/tween.js')
// let ctx = canvas.getContext('2d')
// let databus = new DataBus()


/**
 * 游戏主函数
 */
export default class _3D {

  constructor() {
    var camera, scene, renderer, dirLight, dirLightHeper, hemiLight, hemiLightHelper;

    // 摄像机目标点的y值，xz为0
    this.lookAtY = 100
    this.cameraHeight = this.lookAtY + 200 
    this.cameraDistanceToY = 500

    // 摄像机
    // 正射摄像头
    let aspect = window.innerWidth / window.innerHeight
    let k = 200
    camera = new THREE.OrthographicCamera( - k * aspect, k * aspect, k, - k, 0.1, 10000)
    // camera.position.set(0, this.cameraHeight, this.cameraDistanceToY)
    camera.position.set(0, 1500, 500)
    camera.lookAt(0, this.lookAtY, 0)
    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);

    // 随机选择主题
    let theme = THEME[parseInt(Math.random() * THEME.length)]
    // 难易度
    // 180 100
    this.level = 180
    // 添加天空和光照
    sky( scene,  theme.bg)

    // 场景内的最顶层节点
    // 传入摄像机，用于射线检测
    this.world = new World(camera, theme.role)
    scene.add(this.world)

    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    this.scene = scene
    this.camera = camera
    this.renderer = renderer

    // 记录当前帧数
    this.frameId = 1

    window.requestAnimationFrame(this.loop.bind(this), canvas)

    //测试用==================================
    var helper = new THREE.CameraHelper(camera);
    scene.add(helper)

    var axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);

    this.camera2 = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 500000);
    this.camera2.position.set(1000, 1000, 0)
    this.camera2.lookAt(0, 0, 0)
    // 测试用========================================
  }

  /**
   * 更新
   */
  update() {
    this.frameId++
    // 难易度控制，方块越少越简单
    if (this.frameId < this.level && this.frameId % 6 === 0 ) {
      this.world.next()
    }
    // if( this.frameId % 180 === 0 ) {
    //   this.world.next()
    // }
  }
  loop() {
    this.update()
    TWEEN.update()
    this.renderer.render(this.scene, this.camera2)
    // this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.loop.bind(this), canvas)
  }
}

/**
 * 游戏主函数(微信小游戏官方示例，面向对象的架构)
 */
class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    this.restart()
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()

    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 30 === 0) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        let enemy = databus.enemys[i]

        if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score += 1

          break
        }
      }
    })

    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      let enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {
        databus.gameOver = true

        break
      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY)
      this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.drawToCanvas(ctx)
      })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver)
      return;

    this.bg.update()

    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.update()
      })

    this.enemyGenerate()

    this.collisionDetection()

    if (databus.frame % 20 === 0) {
      this.player.shoot()
      this.music.playShoot()
    }
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}