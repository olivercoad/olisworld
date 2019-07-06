var music = function(p) {
  p.windowResized = function() {
    let div = document.getElementById("musiccanvas");
    p.resizeCanvas(div.clientWidth, div.clientHeight);
    p.colorMode(p.HSB, p.height, p.width, p.width);
    vals = [];
    notes = [];
    t = 0;
    p.frameCount = 0;
  }

  p.setup = function() {
    p.createCanvas(400, 400);
    p.windowResized();
  }
  
  let vals = [];
  let notes = [];
  let hueLerp = 0;
  let t = 0;
  
  p.draw = function() {
    p.background(0, 0, 20 / 100 * p.width);
    p.stroke(0, 0, p.width);
    let numNotes = p.floor(p.map(p.width, 400, 800, 20, 40));
    while(t < p.frameCount + p.width + 50) {
      let o1 = p.noise(1000 + t / 2); //short peaks
      let o2 = p.noise(t / 20); //waveform shape
      hueLerp = p.lerp(hueLerp, p.mouseY, 0.02);
      vals.push({hue: hueLerp, val: p.height * p.abs(0.1 * o1 + 0.5 * o2 - 0.15)});
      
      let isNote = t % (p.width / numNotes) < 1;
      let isBarline = t % (p.width / numNotes * 9) < 1;
      
      notes.push({ isNote, isBarline, n: o2, hueLerp });
      // notes.push({ isNote, isBarline, n: ((t / 2) % width / width) });
      
      
      
      t++;    
    }
  
    if(vals.length > p.width + 50) {
      vals.shift();
    }
    if(notes.length > p.width + 50) {
      notes.shift();
    }
    p.translate(0, p.height / 3);
    
    for(let x = 0; x < vals.length; x++) {
      let nearMouse = p.abs(p.mouseX + x - p.width) / 10;
      let mousePop = p.max(1, 2 - nearMouse);
      let lineHeight = vals[x].val * mousePop * 0.7;
      p.stroke(vals[x].hue, p.width, p.width);
      p.line(p.width - x, -lineHeight, p.width - x, lineHeight);
    }

    let spacing = 7;
    p.translate(0, 1.5 * p.height / 3 - spacing * 10);
    p.stroke(0);
    p.strokeWeight(2);
    p.fill(0);
    
    for(let i = 0; i < 13; i++) {
      if(i >= 5 && i < 8) continue;
      let y = 0 + i * spacing;
      p.line(0, y, p.width, y);
    }
    
    p.translate(- p.width / numNotes, 0);
    
    let sinceBarline = 0;
    for(let x = notes.length - 1; x >= 0; x--) {
      if(notes[x].isBarline) {
        sinceBarline = 8;
      }
      else if(notes[x].isNote) {
        sinceBarline--; 
      }
    }
    let prevPx = 0;
    let prevPy = 0;
    let prevUp = false;
    for(let x = 0; x < notes.length; x++) {
      let note = notes[x];
      if(note.isBarline) {
        p.line(x, 0, x, 4 * spacing);
        p.line(x, 8 * spacing, x, 12 * spacing);
        sinceBarline = 0;
      }
      else if(note.isNote) {
        let n = p.floor(p.map(notes[x].n, 0, 1, -5, 26)) * 0.5;
        let isLedger = false;
        if(n > 4.5) {
          n += 1.5;
        }
        let up = true;
        if(n < 1.5) up = false;
        else if(n > 6 && n < 10) up = false;
        p.ellipseMode(p.CORNER);
        
        let pX = x;
        let pY = 0;
        let y = 0;
        if(sinceBarline % 2 == 1) {
          up = prevUp;
        }
        prevUp = up;
        
        if(up) {
          pY = n * spacing - spacing * 3.25;
          y = n * spacing;
        }
        else {
          pY = n * spacing + spacing * 4.25;
          y = n * spacing + spacing;
          pX -= spacing;
        }
        let doNote = true;
        if(sinceBarline % 2 == 1) {
          if(p.abs(pY - prevPy) < spacing * 4.5) {
            p.line(pX, pY, prevPx, prevPy);
          }
          else doNote = false;
        }
        if(doNote) {
          p.ellipse(x - spacing, n * spacing, spacing);
          p.line(pX, y, pX, pY);
        }
        prevPx = pX;
        prevPy = pY;
        sinceBarline++;
      }
    }
  }

  
}

var musicp5 = new p5(music, "musiccanvas");
document.getElementById("musiccard").classList.add("hidep");