let THREE = require('../libs/three.min.js')
/**
 * 游戏世界
 */
export default class World extends THREE.Group {
  constructor() {
    super()
    var geometry = new THREE.PlaneGeometry(15.5, 15.5);
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 });
    material.color.setHSL(0.095, 1, 0.75);
    var plane = new THREE.Mesh(geometry, material);
    plane.rotateX(Math.PI / -2)
    plane.translateZ(-.5)
    plane.receiveShadow = true
    this.add(plane);


    // LIGHTS
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    this.add(hemiLight);

    //
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    this.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    var d = 5;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
  }
}