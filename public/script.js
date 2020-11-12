// HELPERS with image data
const imageDataWidth = 200, imageDataHeight = 200
const numSpheres = 100

function getImageData(image) {
    let canvas = document.createElement( 'canvas' );
    canvas.width = imageDataWidth;
    canvas.height = imageDataHeight;

    let context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0, imageDataWidth, imageDataHeight );

    return context.getImageData( 0, 0, imageDataWidth, imageDataHeight );
}

function getPixel(imagedata, x, y) {
    let position = (x + imagedata.width * y) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };
}

// INIT functions
function startWithUploadFile(event) {
    console.log('starting with uploadfile')
    const audioElement = document.getElementById('audioElement')
    audioElement.src = URL.createObjectURL(event.currentTarget.files[0])

    document.getElementById('page').style.display = 'none'
    const app = new App()
    app.draw()
}

function startWithMicrophone() {
    console.log('starting with microphone')
    document.getElementById('page').style.display = 'none'
    const app = new App(true)
    app.draw()
}

class App {
    constructor(useMic) {
        this.shouldUpdateAudio = false
        this.shouldUpdateScene = false
        this.audio = new Audio(this.loadFractal.bind(this), useMic)
        this.scene = new Scene()
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this))
        if (this.shouldUpdateAudio) this.audio.update()
        if (this.shouldUpdateScene) this.scene.update(this.audio.fDataArray, this.audio.tDataArray)
    }

    loadFractal() {
        this.shouldUpdateAudio = true
        this.shouldUpdateScene = true

        setTimeout(() => {
            const par = this.audio.getFractalSeedInfo(5)
            let params = ''
            for (let i = 0; i < par.weights.length; i++) {
                params += `w${i}=${par.weights[i]}&`
            }
            for (let i = 0; i < par.moves.length; i++) {
                params += `m${i}=${par.moves[i]}&`
            }
            // fetch(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/pub/MusicFractalBot?${params}`, {method:'GET', headers:{'x-api-key':'tRDEaRkO7aaWyzl67ZAV55UUkN0p1BfD8FEpkMkY'}}).then(res => res.blob()).then(data => {
            fetch(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/default/MusicFractalBot?${params}`).then(res => res.blob()).then(data => {
                let img = new Image()
                img.onload = () => {
                    let imgData = getImageData(img)
                    URL.revokeObjectURL(img.src)
    
                    this.scene.startAnimation()
                    this.scene.setImageData(imgData)
                }
                img.src = URL.createObjectURL(data)
            })
        }, 10000)
    }
}

class Scene {
    constructor() {
        this.animateFractal = false

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(/* FOV */ 75, window.innerWidth / window.innerHeight, /* near */ 0.1, /* far */ 1000)
        this.scene.add(this.camera)

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        window.addEventListener('resize', this.onWindowResize)

        this.currHue1 = 260.66
        this.currSpeed1 = 0.02
        this.changingColor1 = new THREE.Color()

        this.currHue2 = 38.82
        this.currSpeed2 = 0.03
        this.changingColor2 = new THREE.Color()

        this.changingLight1 = this.addLight(0xB19CD9, 50, 20, 5)
        this.changingLight2 = this.addLight(0xFFA500, -50, 4, 10)
        this.camera.position.set(0, 0, 100)

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target = new THREE.Vector3(0, 0, 0)
        this.controls.zoomSpeed = 0.2
        this.controls.rotateSpeed = 0.8

        this.spheres = []
        this.originalSpheres = []
        this.chaos = 0
        for (let i = 0; i < numSpheres; i++) {
            this.addSphere(this.originalSpheres, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, Math.random() * 10)
        }
    }

    getColor1 = () => {
        if (this.currHue1 > 261 || this.currHue1 < 219) {
            this.currSpeed1 *= -1
        }
        this.currHue1 += this.currSpeed1
        this.changingColor1.setHSL(this.currHue1 / 360, 0.4453, 0.7314)
        return this.changingColor1
    }

    getColor2 = () => {
        if (this.currHue2 > 39 || this.currHue2 < 5) {
            this.currSpeed2 *= -1
        }
        this.currHue2 += this.currSpeed2
        this.changingColor2.setHSL(this.currHue2 / 360, 1.0, 0.5)
        return this.changingColor2
    }

    startAnimation = () => {
        this.animateFractal = true
        this.controls.zoomSpeed = 0.05
    }

    setImageData = (imgData) => {
        const fractalImageData = imgData
        for (let i = 0; i < imageDataWidth; i++) {
            for (let j = 0; j < imageDataHeight; j++) {
                let colorValue = getPixel(fractalImageData, i, j).r

                if (colorValue > 30) {
                    this.addSphere(this.spheres, i - (imageDataWidth / 2), j - (imageDataHeight / 2), colorValue / 10)
                }
            }
        }
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
    }

    addSphere = (s, x, y, z) => {
        const geometry = new THREE.OctahedronBufferGeometry(1)
        const material = new THREE.MeshPhongMaterial( { color: 0xffcfdc, opacity: 0.08 * Math.abs(z), transparent: true } )

        const sphere = new THREE.Mesh( geometry, material )
        this.scene.add(sphere)

        sphere.position.set(x, y, z)
        sphere.rotation.set(Math.random() * 180, Math.random() * 180, Math.random() * 180)

        s.push({ shape: sphere, x, y, z, randomSeed: Math.random() })
    }

    addLight = (color, x, y, z) => {
        const light = new THREE.DirectionalLight(color, 1)
        light.position.set(x, y, z)
        this.scene.add(light)
        return light
    }

    update = (fft, timeDomain) => {
        for (let s = 0; s < this.originalSpheres.length; s++) {
            const sphere = this.originalSpheres[s]
            sphere.shape.rotation.x += 0.01 * sphere.randomSeed
            sphere.shape.rotation.y += 0.01 * sphere.randomSeed
            sphere.shape.rotation.z += 0.01 * sphere.randomSeed

            if (this.animateFractal) {
                sphere.shape.position.x *= (sphere.randomSeed + 1.2)
                sphere.shape.position.y *= (sphere.randomSeed + 1.2)
                sphere.shape.position.z *= (sphere.randomSeed + 1.2)
            }
        }

        for (let s = 0; s < this.spheres.length; s++) {
            const sphere = this.spheres[s]
            sphere.shape.rotation.x += 0.01 * sphere.randomSeed
            sphere.shape.rotation.y += 0.01 * sphere.randomSeed
            sphere.shape.rotation.z += 0.01 * sphere.randomSeed

            if (this.animateFractal) {
                const angle = Math.abs(Math.atan2(sphere.x, sphere.y) - Math.PI)
                const index = Math.round((angle / Math.PI) * fft.length / 10)
                let value = fft[index]
                if (this.prevFft) {
                    value = value * 0.01 + this.prevFft[index] * 0.99
                }
                sphere.shape.position.z = sphere.z * (value * 0.01 + 0.6)

                sphere.shape.position.x = sphere.x + this.chaos * (sphere.randomSeed + 0.5)
                sphere.shape.position.y = sphere.y + this.chaos * (sphere.randomSeed + 0.5)
            }
        }
        this.prevFft = fft
        if (this.chaos > 0) console.log(this.chaos)
        let total = 0
        for (let d of timeDomain) {
            total += d
        }
        if (this.prevTotal) {
            const newTotal = total * 0.1 + this.prevTotal * 0.9

            const diff = Math.abs(newTotal - this.prevTotal) / this.prevTotal
            this.chaos = diff * 0.1 + this.chaos * 0.9
            this.chaos = Math.round(this.chaos * 100000) / 100000; 

            if (newTotal > this.prevTotal) {
                this.controls.dollyOut()
                this.controls.rotateSpeed *= 0.9
            }
            if (newTotal < this.prevTotal) {
                this.controls.dollyIn()
                this.controls.rotateSpeed *= 1.01
            }
            this.prevTotal = newTotal
            // this.chaos = Math.max(0, this.chaos)
        } else {
            this.prevTotal = total
        }

        this.changingLight1.color = this.getColor1()
        this.changingLight2.color = this.getColor2()

        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
}