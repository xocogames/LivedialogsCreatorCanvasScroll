let canvasController = null;
let ctx = null;

let icon = null;

class CanvasController {

    canvas = null;
    ctx = null;
    rect = null;

    scaleRatio = 1;

    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.rectInit = this.ctx.canvas.getBoundingClientRect();
        this.rect = this.rectInit;

        this.offset = {
            xx: 0,
            yy: 0
        }

        this.scaleRatio = 1;

        this.fillColor = "#DDF1FF";
        this.clear();
    }

    getCanvasLeft() {
        return this.rect.left;
    }

    getCanvasTop() {
        return this.rect.top;
    }

    /*
    updateRect() {
        this.rect = this.ctx.canvas.getBoundingClientRect();
        // console.log("RECT: minX = " + this.rect.left + " | maxX = " + this.rect.right);
    }
    */

    translate(xoffset, yoffset) {
        this.ctx.translate(xoffset, yoffset);
        this.offset = {
            xx: this.offset.xx + xoffset,
            yy: this.offset.yy + yoffset
        }
    }

    scale(scaleRatio) {
        this.scaleRatio = scaleRatio;
        this.ctx.scale(scaleRatio, scaleRatio);
    }

    clear() {
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.fillColor;
        this.ctx.fillRect(-1000, -1000, this.canvas.width + 2000, this.canvas.height + 2000);
    }

    dragDown(x, y) {
        this.dragStart = {
            xx: x,
            yy: y
        }

        this.drag = true;
    }

    dragUp() {
        this.drag = false;
        this.dragEnd = this.dragActual;
    }

    dragMove(x, y) {
        if (this.drag) {
            /*
            this.dragActual = {
                xx: x - this.canvas.offsetLeft,
                yy: y - this.canvas.offsetTop
            }
            */
            this.clear();
            this.translate(x - this.dragStart.xx, y - this.dragStart.yy);
            // this.dragStart.xx = x;
            // this.dragStart.yy = y;
            // this.ctx.translate(this.dragActual.xx - this.dragStart.xx, this.dragActual.yy - this.dragStart.yy);
            // this.dragStart = this.dragActual;
            drawCanvas();
        }
    }

    get xOffset() {
        // console.log("xOffset: dragEnd.xx = " + this.dragEnd.xx + " | dragInit.xx = " + this.dragInit.xx);
        return this.offset.xx;
    }
    get yOffset() { return this.offset.yy; }
}

class CanvasElem {
    get minX() { return 0; }
    get maxX() { return 0; }
    get minY() { return 0; }
    get maxY() { return 0; }
}

class CanvasCircle extends CanvasElem {
    constructor(radius, color = "#00FF00") {
        super();
        this.radius = radius;
        this.color = color;
    }

    draw(x, y) {
        this.x = x;
        this.y = y;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    onClick(x, y) {
        console.log("Click in circle?");
        var isCollision = isInRect(x, y, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        if (isCollision) console.log('Click in circle.');
        return isCollision;
    }

    get minX() { return this.x - this.radius; }
    get maxX() { return this.x + this.radius; }
    get minY() { return this.y - this.radius; }
    get maxY() { return this.y + this.radius; }
}

class CanvasRect extends CanvasElem {
    constructor(width, height, color = "#000000") {
        super();
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(x, y) {
        this.x = x;
        this.y = y;

        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.rect(x, y, this.width, this.height);
        ctx.stroke();
    }

    onClick(x, y) {
        console.log("Click in rect?");
        var isCollision = isInRect(x, y, this.x, this.y, this.width, this.height);
        if (isCollision) console.log('Click in rect.');
        return isCollision;
    }

    get minX() { return this.x; }
    get maxX() { return this.x + this.width; }
    get minY() { return this.y; }
    get maxY() { return this.y + this.height; }
}

class CanvasIcon extends CanvasElem {
    constructor(img, width, height) {
        super();
        this.img = img;
        this.width = width;
        this.height = height;

        // this.load();
    }

    onLoadDraw(x, y) {
        var width = this.width;
        var height = this.height;

        var icon = new Image();
        icon.onload = function() {
            ctx.drawImage(icon, x, y, width, height);
        }
        icon.src = this.img;
        this.icon = icon;
    }

    draw(x, y) {
        this.x = x;
        this.y = y;

        if (this.icon == null) this.onLoadDraw(x, y);
        else ctx.drawImage(this.icon, x, y, this.width, this.height);
    }

    onClick(x, y) {
        console.log('Click icon?');
        var isCollision = isInRect(x, y, this.x, this.y, this.width, this.height);
        if (isCollision) console.log('Click in icon.');
        return isCollision;
    }

    get minX() { return this.x; }
    get maxX() { return this.x + this.width; }
    get minY() { return this.y; }
    get maxY() { return this.y + this.height; }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function drawCanvasArrow(ctx, fromx, fromy, tox, toy, color = "#FF0000") {
    // console.log('drawArrow: fromx=' + fromx + ' / fromy=' + fromy + ' / tox=' + tox + ' / toy=' + toy);
    var headlen = 8; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function isInRect(x, y, xRect, yRect, widthRect, heightRect) {
    var isCollision = false;
    // console.log('isInRect: x=' + x + ' / y=' + y + ' / xRect=' + xRect + ' / yRect=' + yRect + ' / widthRect=' + widthRect + ' / heightRect=' + heightRect);
    if (xRect <= x &&
        xRect + widthRect > x &&
        yRect <= y &&
        yRect + heightRect > y) {

        isCollision = true;
    }
    return isCollision;
}

function pointEventToCanvas(x, y, debug = false) {
    // var xOffset = x - canvasController.getCanvasLeft() - canvasController.xOffset;
    // var yOffset = y - canvasController.getCanvasTop() - canvasController.yOffset;
    var xScale = (x - canvasController.getCanvasLeft()) / canvasController.scaleRatio - canvasController.xOffset / canvasController.scaleRatio;
    if (debug) console.log("pointEventToCanvas. x = " + x + " | xOffset = " + canvasController.xOffset + " | scaleRatio = " + canvasController.scaleRatio + " | canvasLeft = " + canvasController.getCanvasLeft() + " | RESULT x = " + xScale);
    var yScale = (y - canvasController.getCanvasTop()) / canvasController.scaleRatio - canvasController.yOffset / canvasController.scaleRatio;
    return new Vector(xScale, yScale);
}

function pointCanvasToScreen(x, y) {
    // var xScale = canvasController.xOffset + (x * canvasController.scaleRatio + canvasController.getCanvasLeft());
    // var xScale = (x * canvasController.scaleRatio + canvasController.getCanvasLeft());
    var xScale = (x + canvasController.xOffset) * canvasController.scaleRatio + canvasController.getCanvasLeft();
    console.log("pointCanvasToScreen. x = " + x + " | xOffset = " + canvasController.xOffset + " | scaleRatio = " + canvasController.scaleRatio + " | canvasLeft = " + canvasController.getCanvasLeft() + " | RESULT x = " + xScale);
    var yScale = canvasController.yOffset + (y * canvasController.scaleRatio + canvasController.getCanvasTop());
    return new Vector(xScale, yScale);
}

function onMouseDown(event) {
    var point = pointEventToCanvas(event.clientX, event.clientY);
    // console.log('Mouse down. x = ' + event.clientX + " / y = " + event.clientY + " /// canvas. x = " + point.x + " y = " + point.y);

    // canvasController.dragStart(point.x, point.y);

    canvasController.dragDown(point.x, point.y);
}

function onMouseUp(event) {
    var point = pointEventToCanvas(event.clientX, event.clientY);

    // console.log('Mouse up. x = ' + event.clientX + " / y = " + event.clientY + " /// canvas. x = " + point.x + " y = " + point.y);
    // canvasController.dragStop();

    canvasController.dragUp();
}

function scrollCanvas() {
    // canvasController.updateRect();
    // console.log('Canvas. left = ' + canvasController.getCanvasLeft() + " / top = " + canvasController.getCanvasTop());
}