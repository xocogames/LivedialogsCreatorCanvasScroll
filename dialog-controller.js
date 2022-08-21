let dialogController = null;

class DialogController {
    constructor(canvasController) {
        this.canvasController = canvasController;

        this.mapActorIcons = new Map();
        this.mapTreeDialog = new Map();
        this.listRootDialogs = [];
        this.listAllDialogsIds = [];
    }

    setActorIcon(refActor, imgActor) {
        this.mapActorIcons.set(refActor, imgActor);
    }

    getActorIcon(refActor) {
        return this.mapActorIcons.get(refActor);
    }

    getReplyActor(refActor) {
        var iterActors = this.mapActorIcons.keys();
        var firstActor = iterActors.next().value;
        var nextActor = iterActors.next().value;
        if (refActor == firstActor) return nextActor;
        return firstActor;
    }

    getDialogNode(idDialogNode) {
        return this.mapTreeDialog.get(idDialogNode);
    }

    createRootDialog(idDialogNode, refActor) {
        var dialogNode = new DialogNode(idDialogNode, this.getActorIcon(refActor));
        this.mapTreeDialog.set(idDialogNode, dialogNode);
        this.listRootDialogs.push(dialogNode);
        this.listAllDialogsIds.push(idDialogNode);
        return dialogNode;
    }

    onClick(x, y) {
        if (this.listAllDialogsIds.length == 0) return false;
        for (var i = this.listAllDialogsIds.length - 1; i >= 0; i--) {
            var dialogNode = this.getDialogNode(this.listAllDialogsIds[i]);
            if (dialogNode != null) {
                var isClicked = dialogNode.onClick(x, y);
                if (isClicked) return true;
            }
        }
        return false;
    }
}

class DialogNode extends CanvasElem {

    constructor(id, img) {
        super();
        this.idDialogNode = id;
        this.iconActor = img;

        this.width = 300;
        this.height = 80;
        this.heightSpace = 16;
        this.radius = 15;

        this.strokeColor = '#000000';
        this.fillColor = '#DBF9FF';

        this.textColor = 'black';
        this.textColorSpecial = '#0000ff';
        this.textFontTitle = 'bold 16px verdana';
        this.textFontDescr = '11px verdana';
        this.textFontDescrSpecial = 'bold 14px verdana';

        this.bulletLeft = new CanvasCircle(5);
        this.bulletRight = new CanvasCircle(5);
        this.iconActor = new CanvasIcon(img, 35, 35);
        this.iconReply = new CanvasIcon("icon-reply.svg", 25, 25);

        this.textDialog = "(none)";

        this.hasInput = false;
    }

    draw(x, y) {
        this.x = x;
        this.y = y;

        ctx.strokeStyle = this.strokeColor;
        ctx.beginPath();
        ctx.moveTo(x, y + this.radius);
        ctx.arcTo(x, y + this.height, x + this.radius, y + this.height, this.radius);
        ctx.arcTo(x + this.width, y + this.height, x + this.width, y + this.height - this.radius, this.radius);
        ctx.arcTo(x + this.width, y, x + this.width - this.radius, y, this.radius);
        ctx.arcTo(x, y, x, y + this.radius, this.radius);
        ctx.stroke();
        ctx.fillStyle = this.fillColor;
        ctx.fill();

        this.bulletLeft.draw(x, y + this.height / 2);
        this.bulletLeft.draw(x + this.width, y + this.height / 2);
        this.iconActor.draw(x + 5, y + 5);
        this.iconReply.draw(this.x + this.width - this.iconReply.width - 5, this.maxY - this.iconReply.height - 5);

        this.drawTextComplete(this.textDialog, this.iconActor.maxX + 10, y + 20)
    }

    drawText(text, maxLen, x, y) {
        text = this.cutText(text, maxLen);

        var words = text.split(' ');

        var xWord = x;
        for (var n = 0; n < words.length; n++) {
            var word = words[n];

            // console.log('word: |' + word + '|');
            if (word.charAt(0) == '@') {
                // console.log('SPECIAAAAALLLLLLLLLLLLLLLLL!');
                ctx.fillStyle = this.textColorSpecial;
                ctx.font = this.textFontDescrSpecial;

            } else {
                ctx.fillStyle = this.textColor;
                ctx.font = this.textFontDescr;
            }

            var metrics = ctx.measureText(word + ' ');
            ctx.fillText(word + ' ', xWord, y);
            xWord += metrics.width;
        }
    }

    drawTextComplete(text, x, y) {
        var words = text.split(' ');

        var xText = x;
        var yText = y;
        var xWord = xText;
        var idxWord = 0;
        for (; idxWord < words.length; idxWord++) {
            var word = words[idxWord];

            var metrics = ctx.measureText(word + ' ').width;
            if (xWord + metrics > this.maxX - 25) {
                xWord = xText;
                yText += ctx.measureText('O').width * 1.5;
                if (yText > this.maxY - 15) {
                    this.drawTextWord("...", xWord, yText);
                    break;
                }
            }
            this.drawTextWord(word + " ", xWord, yText);
            xWord += metrics;
        }
    }

    drawTextWord(word, x, y) {
        if (word.charAt(0) == '@') {
            ctx.fillStyle = this.textColorSpecial;
            ctx.font = this.textFontDescrSpecial;

        } else {
            ctx.fillStyle = this.textColor;
            ctx.font = this.textFontDescr;
        }
        ctx.fillText(word + ' ', x, y);
    }

    addInput(x, y) {

        var input = document.createElement('input');

        input.type = 'text';
        input.style.position = 'fixed';
        input.style.left = (x - 4) + 'px';
        input.style.top = (y - 4) + 'px';

        input.dialogNode = this;
        input.onkeydown = this.handleEnter;

        document.body.appendChild(input);

        input.focus();

        this.hasInput = true;
    }

    handleEnter(e) {
        var keyCode = e.keyCode;
        if (keyCode === 13) {
            var dialogNode = this.dialogNode;
            dialogNode.textDialog = this.value;

            // dialogNode.drawTextComplete(dialogNode.textDialog, dialogNode.minX + 10, dialogNode.minY + 10);
            dialogNode.draw(dialogNode.minX, dialogNode.minY);

            document.body.removeChild(this);
            dialogNode.hasInput = false;
        }
    }

    onClick(x, y) {
        // console.log('Click dialog?');
        var isCollision = isInRect(x, y, this.x, this.y, this.width, this.height);
        if (isCollision) console.log('Click in dialog.');
        if (isCollision) {
            var pointinput = pointCanvasToScreen(this.minX, this.minY);
            // this.addInput(this.minX + canvasController.xOffset, this.minY);
            this.addInput(pointinput.x, pointinput.y);
        }
        return isCollision;
    }

    cutText(text, maxLen) {
        var textExt = text;
        do {
            var metrics = ctx.measureText(textExt);
            if (metrics.width < maxLen) return textExt;

            text = text.substring(0, text.length - 1);
            textExt = text + '...';
        } while (text.length > 0);
        return '';
    }

    get minX() { return this.x; }
    get maxX() { return this.x + this.width; }
    get minY() { return this.y; }
    get maxY() { return this.y + this.height; }
}

let dialogNode = null;

function drawCanvas() {
    if (canvasController == null) {
        canvasController = new CanvasController();
        ctx = canvasController.ctx;

        console.log('Canvas. left = ' + canvasController.getCanvasLeft() + " / top = " + canvasController.getCanvasTop());
        canvasController.translate(100, 10);
        canvasController.scale(2);

        canvas.addEventListener('click', onMouseClick, false);
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);


        dialogController = new DialogController(canvasController);
        dialogController.setActorIcon("elvira", 'girl.png');
        dialogController.setActorIcon("ramoncin", 'icons8-kuroo.svg');

        dialogNode = dialogController.createRootDialog("1", "elvira");
    }

    // console.log('Canvas. left = ' + canvasController.getCanvasLeft() + " / top = " + canvasController.getCanvasTop());

    // var dialogNode = new DialogNode('icons8-kuroo.svg');
    dialogNode.textDialog = "¿Y tú quien diablos eres?, enano de mierda que estas todo el día tocándome los cojones, mamón. Vete a la mierda grandisimo hijo de tu madre que te parió, aborto de pájaro...";
    dialogNode.draw(50, 25);

    var dot = new CanvasCircle(5);
    dot.draw(50, 25);
    // console.log("Circle minX: " + dot.minX);

    var rect = new CanvasRect(10, 10, "#0000FF");
    rect.draw(50, 25);
    // console.log("Rect minX: " + rect.minX);

    var rect = new CanvasRect(60, 60, "#0F010F");
    rect.draw(80, -30);

    var rect = new CanvasRect(10, 10);
    rect.draw(0, 0);

    if (icon == null) icon = new CanvasIcon('icons8-kuroo.svg', 40, 40);
    icon.draw(120, 120);

    drawCanvasArrow(ctx, 50, 25, 120, 120);


    function onMouseClick(event) {
        /*
        console.log('Canvas. left = ' + canvasController.getCanvasLeft() + " / top = " + canvasController.getCanvasTop());
        var xOffset = event.clientX - canvasController.getCanvasLeft() - canvasController.xOffset;
        var yOffset = event.clientY - canvasController.getCanvasTop() - canvasController.yOffset;
        var xScale = (event.clientX - canvasController.getCanvasLeft()) / canvasController.scaleRatio - canvasController.xOffset / canvasController.scaleRatio;
        var yScale = (event.clientY - canvasController.getCanvasTop()) / canvasController.scaleRatio - canvasController.yOffset / canvasController.scaleRatio;
        console.log('Click. x = ' + event.clientX + " / y = " + event.clientY + " /// xOffset = " + xOffset + " / yOffset = " + yOffset + " /// xScale = " + xScale + " / yScale = " + yScale);
        dialogController.onClick(xScale, yScale);
        */

        console.log("Click");

        var point = pointEventToCanvas(event.clientX, event.clientY, true);
        dialogController.onClick(point.x, point.y);

        // dot.onClick(xScale, yScale);
        // icon.onClick(xScale, yScale);

        // canvasController.clear();
        // canvasController.translate(0, 30 * 2.5);
        // drawCanvas();
        return true;
    }
}

function onMouseMove(event) {
    var point = pointEventToCanvas(event.clientX, event.clientY);
    // console.log('Mouse move. x = ' + event.clientX + " / y = " + event.clientY + " /// canvas. x = " + point.x + " y = " + point.y);

    /*
    var dragMove = canvasController.dragPosition(point.x, point.y);
    if (dragMove != null) {
        console.log('DRAG trasnlate. x = ' + event.clientX + " / y = " + event.clientY + " /// move. x = " + dragMove.x + " y = " + dragMove.y);
        canvasController.clear();
        canvasController.translate(dragMove.x, dragMove.y);
        drawCanvas();
    }
    */

    canvasController.dragMove(point.x, point.y);
}