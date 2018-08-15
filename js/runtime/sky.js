const THREE = require('../libs/three.min.js')

/**
 * 给场景添加光照和背景
 * 这些不会旋转
 * @param [THREE.Scene] scene 三维场景对象
 */
export default function sky( scene, themeBg ) {
  var dirLight, dirLightHeper, hemiLight, hemiLightHelper;
  // LIGHTS
  // 半球光
  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);
  // hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
  // scene.add(hemiLightHelper);

  // 平行光
  dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.color.setHSL(0.1, 1, 0.95)
  dirLight.position.set(-1, 1.75, 0)
  dirLight.position.multiplyScalar(30)
  scene.add(dirLight)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048
  var d = 200
  dirLight.shadow.camera.left = -d
  dirLight.shadow.camera.right = d
  dirLight.shadow.camera.top = d
  dirLight.shadow.camera.bottom = -d
  dirLight.shadow.camera.far = 3500
  dirLight.shadow.bias = -0.0001
  // dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10)
  // scene.add(dirLightHeper)

  // 渲染天空的着色器
  var vertexShader = `varying vec3 vWorldPosition;
			void main() {
				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vWorldPosition = worldPosition.xyz;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`
  var fragmentShader = `uniform vec3 topColor;
			uniform vec3 bottomColor;
			uniform float offset;
			uniform float exponent;
			varying vec3 vWorldPosition;
			void main() {
				float h = normalize( vWorldPosition + offset ).y;
				gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
			}`
  var uniforms = {
    topColor: { value: new THREE.Color(0xffffff) },
    // bottomColor: { value: new THREE.Color(0x9fffff) },
    bottomColor: { value: new THREE.Color(themeBg) },
    offset: { value: 330 },
    exponent: { value: 0.6 }
  };
  // uniforms.topColor.value.copy(hemiLight.color);
  scene.fog.color.copy(uniforms.bottomColor.value);
  var skyGeo = new THREE.SphereBufferGeometry(500, 32, 15);
  var skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide })
  var sky = new THREE.Mesh(skyGeo, skyMat)
  scene.add(sky);
}