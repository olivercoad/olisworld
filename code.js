let code = function (p) {
    let codeFiles = [
        "https://raw.githubusercontent.com/olivercoad/wcat/master/src/Server/Server.fs",
        "https://raw.githubusercontent.com/olivercoad/wcat/master/src/wcat/main.go",
        "https://raw.githubusercontent.com/olivercoad/olisworld/master/style.css",
        "https://raw.githubusercontent.com/olivercoad/olisworld/master/code.js"
    ]

    let code = [];

    p.preload = function() {
        p.shuffle(codeFiles, true);
        code.push(p.loadStrings(codeFiles[0]));
    }

    let currentLine = 0;
    let currentColumn = 0;
    let charsize = 20;
    let speed = 3;
    let fileIndex = 0;
    let thinking = 0;
    let thinkingSlow = 3;
    let matrixCols = [];

    p.windowResized = function() {
        let div = document.getElementById("codecanvas");
        p.resizeCanvas(div.clientWidth, div.clientHeight);
    }

    p.setup = function() {
        p.createCanvas(400, 400);
        p.windowResized();
        for (let i = 1; i < codeFiles.length; i++) {
            p.loadStrings(codeFiles[i], result => code.push(result));
        }
    }

    p.draw = function() {
        p.background(51, 51, 51, 50);
        p.textSize(charsize);
        p.fill(100, 220, 100);
        p.textFont("Courier")


        let lastLine = code[fileIndex][currentLine].substring(0, currentColumn);
        let currentSpeed = speed;
        if (thinking > 0) {
            thinking--;
            speed = thinking % thinkingSlow == 0 ? 1 : 0;
        }
        else {
            if (p.random(1) < 0.02) {
                thinking = 10 + p.round(p.random(40));
                thinkingSlow = p.round(p.random(10)) + 2;
            }
        }
        currentColumn += speed;

        drawScreen(lastLine);



        if (currentColumn >= p.min(p.width * 2 / charsize, code[fileIndex][currentLine].length)) {
            currentLine++;
            currentColumn = 0;
        }
        if (currentLine >= code[fileIndex].length) {
            fileIndex = (fileIndex + 1) % code.length;
            currentLine = 0;
            currentColumn = 0;
        }


        if (p.random(1) < 0.01) {
            let pos = p.mouseX;
            let tries = 0;
            while (p.abs(pos - p.mouseX) < charsize * 4.5 && tries < 10) {
                pos = p.random(p.width);
                tries++;
            }
            matrixCols.push(new matrixColumn(p.round(pos / charsize)));
        }
        if (p.random(1) < 0.2) {
            matrixCols.push(new matrixColumn(p.round(p.mouseX / charsize + p.random(-1, 1)), true));
        }


        matrixCols = matrixCols.filter(col => col.update());
    }

    function drawScreen(lastLine) {
        p.push();
        p.fill(180, 180, 180);
        if (currentLine * charsize > p.height - charsize - 5) {
            p.translate(0, p.height - (currentLine + 1) * charsize - 5);
        }
        for (let i = 0; i < currentLine; i++) {
            renderLine(i, code[fileIndex][i]);
        }

        renderLine(currentLine, lastLine);
        p.pop();


        p.fill(70, 200, 70);
        matrixCols.filter(col => !col.isSmall).forEach(col => col.render());
        p.fill(70, 200, 70, 100);
        matrixCols.filter(col => col.isSmall).forEach(col => col.render());
        p.fill(150, 255, 150);
        matrixCols.filter(col => !col.isSmall).forEach(col => col.renderLightHead());
        p.fill(150, 255, 150, 150);
        matrixCols.filter(col => col.isSmall).forEach(col => col.renderLightHead());


    }

    function renderLine(i, line) {
        let y = (i + 1) * charsize;
        p.text(i + 1, 0, y);
        p.text(line, charsize * 2, y);
    }

    function randomMatrixChar() {
        return String.fromCharCode(0x30A0 + p.round(p.random(0, 96)))
    }

    function matrixColumn(colIndex, isSmall) {
        this.symbols = [];
        this.isSmall = isSmall;
        let numSymbols = isSmall ? 1 : p.round(p.random(4, 12));
        this.ypos = p.random(-numSymbols * charsize * 2, 0);
        this.hasLightHead = p.random(1) < 0.1;
        if (isSmall)
            this.speed = p.random(0.3 * charsize, 0.3 * charsize);
        else
            this.speed = p.random(0.04 * charsize, 0.25 * charsize);
        for (let i = 0; i < numSymbols; i++) {
            this.symbols.push(randomMatrixChar());
        }
        this.render = function () {
            this.symbols.forEach((symbol, i) =>
                p.text(symbol, charsize * colIndex, i * charsize + this.ypos));
        }

        this.renderLightHead = function () {
            if (this.hasLightHead) {
                p.text(this.symbols[numSymbols - 1],
                    charsize * colIndex,
                    (numSymbols - 1) * charsize + this.ypos);
            }
        }

        this.update = function () {
            this.ypos = this.ypos + this.speed;
            if (this.ypos > p.height * 1.5 + numSymbols * charsize) {
                return false;
            }

            for (let i = 0; i < numSymbols; i++) {
                if (p.random(1) < 0.1) this.symbols[i] = randomMatrixChar();
            }

            return true;
        }
    }
}

var codep5 = new p5(code, "codecanvas");
document.getElementById("codecard").classList.add("hidep");
