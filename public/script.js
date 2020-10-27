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
    }

    draw = () => {
        requestAnimationFrame(this.draw)
        this.audio.update()
        this.scene.update(this.audio.dataArray)
    }

    loadFractal = () => {
        fetch('https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/default/MusicFractalBot?w1=0.2&w2=0.3&w3=0.5&w4=0.4').then(res => res.blob()).then(data => {
            let img = new Image();
            img.onload = () => {
              let imgData = getImageData(img, w, h); // mark our image as origin clean
              URL.revokeObjectURL(img.src);

                this.scene = new Scene(imgData)
                this.audio = new Audio()
                this.draw()
            }
            img.src = URL.createObjectURL(data)
        });
    }
}

class Scene {
    constructor(imgData) {
        const WIDTH = window.innerWidth, HEIGHT = window.innerHeight
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(/* FOV */ 75, WIDTH / HEIGHT, /* near */ 0.1, /* far */ 1000)

        this.scene.add(this.camera)

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(WIDTH, HEIGHT)
        document.body.appendChild(this.renderer.domElement);

        // GUI controls
        // this.controls = {
        //     meshWidth: 20,
        //     meshHeight: 20,
        //     meshWidthSegs: 20,
        //     meshHeightSegs: 20,
        // }
        this.gui = new dat.GUI()
        // this.gui.add(this.controls, 'meshWidth', 0, 100)
        // this.gui.add(this.controls, 'meshHeight', 0, 100)
        // this.gui.add(this.controls, 'meshWidthSegs', 0, 100)
        // this.gui.add(this.controls, 'meshHeightSegs', 0, 100)

        this.addLight(0xB19CD9, 50, 20, 5)
        this.addLight(0xFFA500, -50, 4, 10)

        this.spheres = []
        // this.addMesh()

        this.camera.position.set(w / 2, h / 2, 80);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target = new THREE.Vector3(w / 2, h / 2, 0);

        // const fractalImage = document.getElementById('testImg')
        // const fractalImageData = getImageData( fractalImage, w, h )
        const fractalImageData = imgData
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let colorValue = getPixel(fractalImageData, i, j).r

                if (colorValue > 0) {
                    this.addSphere(i , j , colorValue / 6)
                }
            }
        }
        
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
        this.spheres.push({ shape: sphere, x, y, z })
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
            this.spheres[s].shape.position.z = this.spheres[s].z * (fft[Math.round(Math.atan2(this.spheres[s].x, this.spheres[s].y) * 100)] / 180)
        }
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
    
}

class Audio {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.audioAnalyser = this.audioContext.createAnalyser()
        
        this.connectAudioSource(document.getElementById('inputAudio'))

        // Allocate dataArray which will contain FFT data of audio
        this.bufferLength = this.audioAnalyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
    }

    connectAudioSource = (audioElement) => {
        const track = this.audioContext.createMediaElementSource(audioElement)
        track.connect(this.audioAnalyser)
        this.audioAnalyser.connect(this.audioContext.destination)

        this.isAudioPlaying = false
        document.getElementById('playButton').addEventListener('click', () => {
            if (this.audioContext.state == 'suspended') {
                this.audioContext.resume()
            }

            if (this.isAudioPlaying) {
                audioElement.pause()
            } else {
                audioElement.play()
            }
            this.isAudioPlaying = !this.isAudioPlaying
        })
    }

    update = () => {
        this.audioAnalyser.getByteTimeDomainData(this.dataArray)
    }
}

const app = new App()
app.loadFractal()