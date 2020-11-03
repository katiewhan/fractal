// HELPERS with image data
const imageDataWidth = 150, imageDataHeight = 150

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

}

class App {
    constructor() {
        this.shouldUpdateAudio = false
        this.shouldUpdateScene = false
        this.audio = new Audio(this.loadFractal.bind(this))
        this.scene = new Scene()
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this))
        if (this.shouldUpdateAudio) this.audio.update()
        if (this.shouldUpdateScene) this.scene.update(this.audio.dataArray)
    }

    loadFractal() {
        this.shouldUpdateAudio = true

        setTimeout(() => {
            const weights = this.audio.getFractalSeedInfo()
            let params = ''
            for (let i = 0; i < weights.length; i++) {
                params += `w${i}=${weights[i]}&`
            }
            // fetch(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/pub/MusicFractalBot?${params}`, {method:'GET', headers:{'x-api-key':'tRDEaRkO7aaWyzl67ZAV55UUkN0p1BfD8FEpkMkY'}}).then(res => res.blob()).then(data => {
            fetch(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/default/MusicFractalBot?${params}`).then(res => res.blob()).then(data => {
                let img = new Image()
                img.onload = () => {
                    let imgData = getImageData(img)
                    URL.revokeObjectURL(img.src)
    
                    this.scene.setImageData(imgData)
                    this.shouldUpdateScene = true
                }
                img.src = URL.createObjectURL(data)
            })
        }, 8000)
    }
}

class Scene {
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(/* FOV */ 75, window.innerWidth / window.innerHeight, /* near */ 0.1, /* far */ 1000)
        this.scene.add(this.camera)

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        window.addEventListener('resize', this.onWindowResize)

        this.addLight(0xB19CD9, 50, 20, 5)
        this.addLight(0xFFA500, -50, 4, 10)
        this.camera.position.set(imageDataWidth / 2, imageDataHeight / 2, 100)

        this.spheres = []
    }

    setImageData = (imgData) => {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target = new THREE.Vector3(imageDataWidth / 2, imageDataHeight / 2, 0)

        const fractalImageData = imgData
        for (let i = 0; i < imageDataWidth; i++) {
            for (let j = 0; j < imageDataHeight; j++) {
                let colorValue = getPixel(fractalImageData, i, j).r

                if (colorValue > 0) {
                    this.addSphere(i, j, colorValue / 10)
                }
            }
        }
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
    }

    addSphere = (x, y, z) => {
        const geometry = new THREE.OctahedronBufferGeometry(1)
        const material = new THREE.MeshPhongMaterial( { color: 0xffcfdc, opacity: 0.05 * Math.abs(z), transparent: true } )

        const sphere = new THREE.Mesh( geometry, material )
        this.scene.add(sphere)

        sphere.position.set(x, y, z)
        sphere.rotation.set(Math.random() * 180, Math.random() * 180, Math.random() * 180)

        this.spheres.push({ shape: sphere, x, y, z, randomSeed: Math.random() })
    }

    addLight = (color, x, y, z) => {
        const light = new THREE.DirectionalLight(color, 1)
        light.position.set(x, y, z)
        this.scene.add(light)
    }

    update = (fft) => {
        for (let s = 0; s < this.spheres.length; s++) {
            const sphere = this.spheres[s]
            sphere.shape.rotation.x += 0.001 * sphere.randomSeed
            sphere.shape.rotation.y += 0.003 * sphere.randomSeed
            sphere.shape.rotation.z += 0.008 * sphere.randomSeed

            const index = Math.round(Math.atan2(sphere.x, sphere.y) * 200)
            let value = fft[index]
            if (this.prevFft) {
                value = value * 0.01 + this.prevFft[index] * 0.99
            }
            sphere.shape.position.z = sphere.z * value* 0.013
        }
        this.prevFft = fft
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
}