let song;
let fft;
let particles = [];
let img;

function preload() {
    song = loadSound("audio/sample-visualisation.mp3")
    img = loadImage("https://cdn.pixabay.com/photo/2016/02/13/12/26/aurora-1197753_1280.jpg")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES)
  imageMode(CENTER)
  rectMode(CENTER)
  fft = new p5.FFT();
// Add the song (sample) into the FFT's input
  song.connect(fft);
  noLoop()
}

function draw() {
// Give the user a hint on how to interact with the sketch
if (getAudioContext().state !== 'running') {
    background(220);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('Tap here to play some sound!', windowWidth / 2, windowHeight / 2);
    // Early exit of the draw loop
    return;
}

    background(0)
    translate(width/2, height/2)

    fft.analyze()
    amp = fft.getEnergy(20, 200)

    push()
    if(amp > 230) {
        rotate(random(-1, 1))
    }
    image(img, 0, 0, width + 100, height + 100)
    pop()

    let alpha = map(amp, 0, 255, 100, 150)
    fill(20, alpha)
    noStroke()
    rect(0, 0, width, height)

    // stroke color of ring
    stroke(96, 196, 209)
    strokeWeight(3)
    noFill()

    let wave = fft.waveform()

    for(let t = -1; t <= 1; t += 2) {
      beginShape()
      for(let i = 0; i <= 180; i += 0.5) {
          let index = floor(map(i,0,180,0,wave.length-1))
          let r = map(wave[index], -1, 1, 90, 350)
          let x = r * sin(i) * t
          let y = r * cos(i)
          vertex(x,y)
      }
      endShape()
    }

    let p = new Particle()
    particles.push(p)

    for(let i = particles.length - 1; i >= 0; i--) {
      if(!particles[i].edges()) {
          particles[i].update(amp > 230)
          particles[i].show()
      } else {
          particles.splice(i, 1)
      }  
    }

    // Extract the spectral centroid
    // Get the centroid
    let spectralCentroid = fft.getCentroid();

    // Use a log scale to match the energy per octave in the FFT display
    let centroidplot = map(spectralCentroid, 20, 20000, -width / 2, width / 2);

    // Draw a line at the spectral centroid position
    stroke(255, 0, 0); // Set the line color to red (you can change the color)
    line(centroidplot, -height / 2, centroidplot, height / 2);

    noStroke();
    fill(255, 255, 255); // Text color is white
    text('Spectral Centroid: ', 10, 20);
    text(round(spectralCentroid) + ' Hz', 10, 40);
}

function mouseClicked() {
    if(song.isPlaying()) {
        song.pause()
        noLoop()
    } else {
        song.play()
        loop()
    }
}

class Particle{
    constructor() {
        this.pos = p5.Vector.random2D().mult(250)
        this.vel = createVector(0,0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

        this.w = random(3, 5)
        this.color = [random(100,255), random(200,255), random(100,255)]
    }
    update(cond) {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        if(cond) {
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
    }
    edges() {
      if(this.pos.x < -width/2 || 
        this.pos.x > width/2 || 
        this.pos.y < -height/2 || 
        this.pos.y > height/2) {
          return true
      } else {
          return false
      }
    }
    show() {
        noStroke()
        fill(this.color)
        ellipse(this.pos.x, this.pos.y, this.w)
    }
}