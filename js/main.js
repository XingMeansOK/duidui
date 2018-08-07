
// import Player from './player/index'
// import Enemy from './npc/enemy'
// import BackGround from './runtime/background'
// import GameInfo from './runtime/gameinfo'
// import Music from './runtime/music'
// import DataBus from './databus'
// import THREE from './libs/three.min.js'
let THREE = require('./libs/three.min.js')
// let ctx = canvas.getContext('2d')
// let databus = new DataBus()

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


/**
 * 游戏主函数
 */
export default class _3D {

  constructor() {
    var camera, scene, renderer, dirLight, dirLightHeper, hemiLight, hemiLightHelper;

    // 摄像机目标点的y值，xz为0
    this.lookAtY = 100
    this.cameraHeight = this.lookAtY + 100 
    this.cameraDistanceToY = 500
    // 摄像机旋转的总角度
    this.cameraRotation = Math.PI / 4

    // 摄像机
    // 正射摄像头
    let aspect = window.innerWidth / window.innerHeight
    let k = 200
    camera = new THREE.OrthographicCamera( - k * aspect, k * aspect, k, - k, 0.1, 10000);
    // camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(this.cameraDistanceToY / Math.sqrt(2), this.cameraHeight, this.cameraDistanceToY / Math.sqrt(2))
    camera.lookAt(0, this.lookAtY, 0)
    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);

    // LIGHTS
    // 半球光
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    scene.add(hemiLightHelper);
    
    // 平行光
    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    var d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
    dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
    scene.add(dirLightHeper);

    // GROUND
    var groundGeo = new THREE.PlaneBufferGeometry(4000, 4000);
    var groundMat = new THREE.MeshPhongMaterial({ color: 0xff00f0, specular: 0x050505 }); 
    groundMat.color.setHSL(0.095, 1, 0.75);
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -33;
    scene.add(ground);
    ground.receiveShadow = true;

    // 渲染天空的着色器
    var vertexShader = `varying vec3 vWorldPosition;
			void main() {
				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vWorldPosition = worldPosition.xyz;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`;
    var fragmentShader = `
    			uniform vec3 topColor;
			uniform vec3 bottomColor;
			uniform float offset;
			uniform float exponent;
			varying vec3 vWorldPosition;
			void main() {
				float h = normalize( vWorldPosition + offset ).y;
				gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
			}
    `;
    var uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    uniforms.topColor.value.copy(hemiLight.color);
    scene.fog.color.copy(uniforms.bottomColor.value);
    var skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide });
    var sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);


    var geometry = new THREE.CubeGeometry(40, 10, 40)
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    this.cube = new THREE.Mesh(geometry, material)
    this.cube.castShadow = true
    this.cube.position.y = -28
    scene.add(this.cube)

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    // 场景控制
    let x, y
    let move = (e) => {
      e.preventDefault()

      let _x = e.touches[0].clientX
      let _y = e.touches[0].clientY

      let d = _x - x
      // 摄像机要旋转的圆心角
      let r = - d / window.innerWidth * Math.PI / 2
      this.cameraRotation += r
      this.cameraRotation %= (2 * Math.PI)  
      // 由于摄像机半径比较大，旋转角度很小摄像机移动的也很快
      this.camera.position.z = 500 * Math.cos(this.cameraRotation);
      this.camera.position.x = 500 * Math.sin(this.cameraRotation);
      // 每次移动都要有这句话，不然就瞄歪了
      this.camera.lookAt(0, this.lookAtY, 0)
    }
    let end = (e) => {
      e.preventDefault()
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)
    }
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      x = e.touches[0].clientX
      y = e.touches[0].clientY

      canvas.addEventListener('touchmove', move)
      canvas.addEventListener('touchend', end)

    }).bind(this))

    this.scene = scene
    this.camera = camera
    this.renderer = renderer



    window.requestAnimationFrame(this.loop.bind(this), canvas)
  }

  update() {
    // System.rotation(this.rotation)
  }
  loop() {
    this.update()
    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.loop.bind(this), canvas)
  }
}