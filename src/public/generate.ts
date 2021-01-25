// class LSystem {
//     constructor() {
//         const canvas = document.getElementById('canvas');
//         canvas.width  = window.innerWidth;
//         canvas.height = window.innerHeight;
//         this.ctx = canvas.getContext('2d');
//         this.image = document.getElementById('source');

//         // this.app = new App()
//         // this.app.draw()

//         this.distance = 20
//         this.angle = 90
//         this.rules = { 'F' : 'FF+F+F+F+F+F-F' } //{ 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' } //{ 'X': 'X+YF+', 'Y': '-FX-Y' }
//         this.axiom = 'F+F+F+F'
//         this.path = this.iterate(4)
//         this.generate()
//     }

//     iterate = (iterations) => {
//         let current = this.axiom
//         for (let i = 0; i < iterations; i++) {
//             let next = ''
//             for (const c of current) {
//                 if (this.rules[c]) {
//                     next += this.rules[c]
//                 } else {
//                     next += c
//                 }
//             }
//             current = next
//         }

//         return current
//     }

//     generate = () => {
//         let states = [{ x: 600, y: 0, direction: 0 }]

//         for (let p of this.path) {
//             let currentState = states[states.length - 1]

//             switch (p) {
//                 case 'F':
//                     let directionRad = currentState.direction * Math.PI / 180
//                     currentState.x += this.distance * Math.cos(directionRad)
//                     currentState.y += this.distance * Math.sin(directionRad)

//                     console.log(states)
//                     this.ctx.beginPath();
//                     this.ctx.strokeStyle = "red";
//                     this.ctx.save()
//                     this.ctx.translate(currentState.x, currentState.y)
//                     this.ctx.rotate(directionRad)
//                     // this.ctx.rect(0, 0, 50, 50)
//                     // this.ctx.stroke();
//                     this.ctx.drawImage(this.image, 0, 0, 30, 30)
//                     this.ctx.restore()

//                     // this.app.scene.addImage(currentState.x, currentState.y, directionRad)

//                     break
//                 case 'f':
//                     break
//                 case '+':
//                     currentState.direction += this.angle
//                     break
//                 case '-':
//                     currentState.direction -= this.angle
//                     break
//                 case '[':
//                     states.push({ x: currentState.x, y: currentState.y, direction: currentState.direction })
//                     break
//                 case ']':
//                     states.pop()
//                     break

//             }
//         }
//     }
// }

// new LSystem()