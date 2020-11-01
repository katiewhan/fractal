// DRAW FFT VIZ

// const WIDTH = 1200, HEIGHT = 500
// const canvas = document.getElementById('canvas')
// canvas.width = WIDTH
// canvas.height = HEIGHT
// const ctx = canvas.getContext('2d')
// ctx.clearRect(0, 0, WIDTH, HEIGHT);

// function draw() {
//     requestAnimationFrame(draw)

//     ctx.fillStyle = 'rgb(200, 200, 200)';
//     ctx.fillRect(0, 0, WIDTH, HEIGHT);
//     audioAnalyser.getByteTimeDomainData(dataArray)

//     ctx.fillStyle = 'rgb(0, 100, 100)';
//     ctx.beginPath();

//     let x = 0
//     let xWidth = WIDTH / bufferLength
//     for (let i = 0; i < bufferLength; i++) {
//         let value = dataArray[i] * (HEIGHT / 128.0)

//         ctx.fillRect(x, HEIGHT - (value / 2), xWidth, value)
//         x += xWidth
//     }
// }

// draw()
function getImageData(image, width, height) {

    let canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    let context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0, width, height);

    return context.getImageData( 0, 0, width, height );

}

function getPixel(imagedata, x, y) {

    let position = (x + imagedata.width * y) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}
const w = 150, h = 150

class App {
    constructor() {
        this.audio = new Audio(this.loadFractal)
        this.scene = new Scene()
        this.shouldUpdateAudio = false
        this.shouldUpdateScene = false
    }

    draw = () => {
        requestAnimationFrame(this.draw)
        if (this.shouldUpdateAudio) this.audio.update()
        if (this.shouldUpdateScene) this.scene.update(this.audio.dataArray)
    }

    loadFractal = () => {
        this.shouldUpdateAudio = true
        // this.audio = new Audio()
        // this.draw()

        // TODO: this should be after microphone granted
        setTimeout(() => {
            const par = this.audio.getFractalSeedInfo()
            let params = ''
            for (let i = 0; i < par.weights.length; i++) {
                params += `w${i}=${par.weights[i]}&`
            }
            for (let i = 0; i < par.moves.length; i++) {
                params += `m${i}=${par.moves[i]}&`
            }
//            fetch(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/pub/MusicFractalBot?${params}`, {method:'GET', headers:{'x-api-key':'tRDEaRkO7aaWyzl67ZAV55UUkN0p1BfD8FEpkMkY'}}).then(res => res.blob()).then(data => {
            fetch(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/default/MusicFractalBot?${params}`).then(res => res.blob()).then(data => {
                let img = new Image();
                img.onload = () => {
                    let imgData = getImageData(img, w, h); // mark our image as origin clean
                    URL.revokeObjectURL(img.src);
    
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
        const WIDTH = window.innerWidth, HEIGHT = window.innerHeight
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(/* FOV */ 75, WIDTH / HEIGHT, /* near */ 0.1, /* far */ 1000)

        this.scene.add(this.camera)

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(WIDTH, HEIGHT)
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.onWindowResize)

        // GUI controls
        // this.controls = {
        //     meshWidth: 20,
        //     meshHeight: 20,
        //     meshWidthSegs: 20,
        //     meshHeightSegs: 20,
        // }
        // this.gui = new dat.GUI()
        // this.gui.add(this.controls, 'meshWidth', 0, 100)
        // this.gui.add(this.controls, 'meshHeight', 0, 100)
        // this.gui.add(this.controls, 'meshWidthSegs', 0, 100)
        // this.gui.add(this.controls, 'meshHeightSegs', 0, 100)

        this.addLight(0xB19CD9, 50, 20, 5)
        this.addLight(0xFFA500, -50, 4, 10)

        this.spheres = []
        // this.addMesh()

        this.camera.position.set(w / 2, h / 2, 100);

        
    }

    setImageData = (imgData) => {

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target = new THREE.Vector3(w / 2, h / 2, 0);
        // const fractalImage = document.getElementById('testImg')
        // const fractalImageData = getImageData( fractalImage, w, h )
        const fractalImageData = imgData
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let colorValue = getPixel(fractalImageData, i, j).r

                if (colorValue > 0) {
                    this.addSphere(i , j , colorValue / 10)
                }
            }
        }
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
    }

    addMesh = () => {
        const geometry = new THREE.PlaneGeometry(this.controls.meshWidth, this.controls.meshHeight, this.controls.meshWidthSegs, this.controls.meshHeightSegs);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                tex0 : { value: THREE.ImageUtils.loadTexture('static/test.png') }
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
        })
        material.transparent = true
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide })
        const plane = new THREE.Mesh(geometry, material)
        this.scene.add(plane)
    }

    addSphere = (x, y, z) => {
        const geometry = new THREE.OctahedronBufferGeometry(1)
        const material = new THREE.MeshPhongMaterial( { color: 0xffcfdc, opacity: 0.05 * Math.abs(z), transparent: true } )

        const sphere = new THREE.Mesh( geometry, material )
        this.scene.add( sphere )
        sphere.position.set(x, y, z)
        sphere.rotation.set(Math.random() * 180, Math.random() * 180, Math.random() * 180)
        this.spheres.push({ shape: sphere, x, y, z, rand: Math.random() })
    }

    addLight = (color, x, y, z) => {
        const light = new THREE.DirectionalLight(color, 1)
        light.position.set(x, y, z)
        this.scene.add(light)
    }

    update = (fft) => {
        // this.camera.position.z -= 0.1
        // this.camera.rotat
        for (let s = 0; s < this.spheres.length; s++) {
            this.spheres[s].shape.rotation.x += 0.001 * this.spheres[s].rand
            this.spheres[s].shape.rotation.y += 0.003 * this.spheres[s].rand
            this.spheres[s].shape.rotation.z += 0.008 * this.spheres[s].rand

            const index = Math.round(Math.atan2(this.spheres[s].x, this.spheres[s].y) * 200)
            let value = fft[index]
            if (this.prevFft) {
                value = value * 0.01 + this.prevFft[index] * 0.99
            }
            this.spheres[s].shape.position.z = this.spheres[s].z * value* 0.013
        }
        this.prevFft = fft
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
    
}

const app = new App()
app.draw()
