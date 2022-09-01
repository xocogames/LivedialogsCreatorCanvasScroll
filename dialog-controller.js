let dialogController = null;

class DialogController {
    constructor(canvasController) {
        this.canvasController = canvasController;

        this.mapActorIcons = new Map();
        this.mapActorColors = new Map();

        this.mapTreeDialog = new Map();
        this.listRootDialogs = [];
        this.listAllDialogsIds = [];

        this.dragDialog = null;
        this.editDialog = null;
    }

    setActorSkin(refActor, imgActor, dialogColor = "#DBF9FF") {
            this.mapActorIcons.set(refActor, imgActor);
            this.mapActorColors.set(refActor, dialogColor);
        }
        /*
            setActorIcon(refActor, imgActor) {
                this.mapActorIcons.set(refActor, imgActor);
            }
        */
    getActorIcon(refActor) {
        return this.mapActorIcons.get(refActor);
    }

    getActorColor(refActor) {
        return this.mapActorColors.get(refActor);
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
        var dialogNode = new DialogNode(idDialogNode, refActor, this.getActorIcon(refActor));

        this.mapTreeDialog.set(idDialogNode, dialogNode);
        this.listRootDialogs.push(dialogNode);
        this.listAllDialogsIds.push(idDialogNode);
        return dialogNode;
    }

    startEditDialog(dialogNode) {
        if (this.editDialog != null && this.editDialog != dialogNode) this.cancelEditDialog(this.editDialog);
        this.editDialog = dialogNode;
    }

    cancelEditDialog() {
        if (this.editDialog != null) this.editDialog.escapeEdit();
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

    onDragDown(x, y) {
        var dragDialog = this.getDragDialogAt(x, y);
        if (this.dragDialog != null && (dragDialog == null || dragDialog != this.dragDialog)) this.dragDialog.escapeEdit();
        if (this.dragDialog == null && dragDialog != null) {
            dialogController.cancelEditDialog();
            this.dragDialog = dragDialog;
            this.dragDialog.onDragDown(x, y);
            return true;
        }
        return false;
    }

    onDragUp() {
        if (this.dragDialog != null) {
            this.dragDialog.onDragUp();
            this.dragDialog = null;
            return true;
        }
        return false;
    }

    onDragMove(x, y) {
        if (this.dragDialog != null) {
            this.dragDialog.onDragMove(x, y);
            this.canvasController.clear();
            drawCanvas();
            return true;
        }
        return false;
    }

    getDragDialogAt(x, y) {
        if (this.listAllDialogsIds.length == 0) return false;
        for (var i = this.listAllDialogsIds.length - 1; i >= 0; i--) {
            var dialogNode = this.getDialogNode(this.listAllDialogsIds[i]);
            if (dialogNode != null) {
                var isClicked = dialogNode.isInDragArea(x, y);
                if (isClicked) return dialogNode;
            }
        }
        return null;
    }

    createReplyDialog(dialogParent) {
        var idDialogNode = uuid();
        var refActorReply = this.getReplyActor(dialogParent.refActor);
        console.log("createReply: refActorReply: " + refActorReply + " / parent = " + dialogParent.refActor);

        var dialogNode = this.createRootDialog(idDialogNode, refActorReply);
        dialogNode.textDialog = "(texto de réplica)";

        var xDialog = dialogParent.maxX + 50;
        var yDialog = dialogParent.minY;

        dialogNode.at(xDialog, yDialog);
        this.drawDialogs();
    }

    drawDialogs() {
        for (var i = 0; i < this.listAllDialogsIds.length; i++) {
            var dialogNode = this.getDialogNode(this.listAllDialogsIds[i]);
            console.log("draw: [" + i + "]: idDialog = " + dialogNode.idDialogNode);
            if (dialogNode != null) {
                dialogNode.drawSimple();
            }
        }
    }
}

class DialogNode extends CanvasElem {

    constructor(id, refActor, icon) {
        super();
        this.idDialogNode = id;
        this.refActor = refActor;
        this.refActorIcon = icon;

        this.width = 300;
        this.height = 80;
        this.heightSpace = 16;
        this.radius = 15;

        this.strokeColor = '#000000';
        this.fillColor = '#DBF9FF';
        this.fillColor = dialogController.getActorColor(refActor);

        this.textColor = 'black';
        this.textColorSpecial = '#0000ff';
        this.textFontFamily = 'verdana';
        this.textFontTitle = 'bold 16px verdana';
        this.textFontDescr = '11px verdana';
        this.textFontDescrSpecial = 'bold 14px verdana';

        this.bulletLeft = new CanvasCircle(5);
        this.bulletRight = new CanvasCircle(5);
        this.iconActor = new CanvasIcon(this.refActorIcon, 35, 35);
        this.iconReply = new CanvasIcon("icon-reply.svg", 25, 25);
        this.iconDrag = new CanvasIcon("icon-drag.png", 25, 25);

        this.textDialog = "(none)";

        this.hasInput = false;
    }

    at(x, y) {
        this.x = x;
        this.y = y;
    }

    drawSimple() {
        console.log("draw(): idDialog = " + this.idDialogNode + ". // x = " + this.x + " // y = " + this.y);
        this.draw(this.x, this.y);
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
        this.iconDrag.draw(this.x + this.width - this.iconReply.width - 5, this.minY + 5);

        this.drawTextComplete(this.textDialog, this.minTextX, this.minTextY)
    }

    drawText(text, maxLen, x, y) {
        text = this.cutText(text, maxLen);

        var words = text.split(' ');

        var xWord = x;
        for (var n = 0; n < words.length; n++) {
            var word = words[n];

            // console.log('word: |' + word + '|');
            if (word.charAt(0) == '@') {
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
        var yText = y + 10;
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

        var input = document.createElement('textarea');
        input.cols = 35;
        input.rows = 5;

        input.value = this.textDialog;
        input.style.fontSize = 10 * canvasController.scaleRatio;
        input.style.fontFamily = this.textFontFamily;

        input.style.position = 'fixed';
        input.style.left = (x - 4) + 'px';
        input.style.top = (y - 4) + 'px';

        input.dialogNode = this;
        input.onkeydown = this.handleEnter;

        this.input = input;
        document.body.appendChild(input);

        input.focus();

        this.hasInput = true;
    }

    handleEnter(e) {
        var keyCode = e.keyCode;
        var dialogNode = this.dialogNode;

        console.log("ctrlkey = " + e.ctrlKey + " // metalkey = " + e.metakey + " // keycode = " + keyCode);
        if (keyCode === 13) {
            if (e.ctrlKey == false) { // Se guarda el contenido y se cierra el textarea
                dialogNode.textDialog = this.value;

                dialogNode.draw(dialogNode.minX, dialogNode.minY);

                document.body.removeChild(this);
                dialogNode.hasInput = false;
            } else { // Se inserta una nueva linea
                var position = this.selectionEnd;
                this.value = this.value.substring(0, position) + '\n' + this.value.substring(position);
                this.selectionEnd = position;
            }
        }
        if (keyCode === 27) {
            dialogNode.escapeEdit();
        }
    }

    escapeEdit() {
        if (this.hasInput) {
            document.body.removeChild(this.input);
            this.hasInput = false;
            this.draw(this.minX, this.minY);
        }
    }

    onClick(x, y) {
        var isCollision = isInRect(x, y, this.x, this.y, this.width, this.height);
        if (isCollision) console.log('Click in dialog.');
        if (isCollision) {

            if (this.iconReply.onClick(x, y)) {
                dialogController.createReplyDialog(this);
            } else {

                if (isInRect(x, y, this.minTextX, this.minTextY, this.maxTextX - this.minTextX, this.maxTextY - this.minTextY)) {
                    var pointinput = pointCanvasToScreen(this.minTextX, this.minTextY);
                    this.addInput(pointinput.x, pointinput.y);
                    dialogController.startEditDialog(this);
                }
            }
        }
        return isCollision;
    }

    isInArea(x, y) {
        return isInRect(x, y, this.x, this.y, this.width, this.height);
    }

    isInDragArea(x, y) {
        return isInRect(x, y, this.iconDrag.x, this.iconDrag.y, this.iconDrag.width, this.iconDrag.height);
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

    get minTextX() { return this.iconActor.maxX + 10 }
    get minTextY() { return this.y + 10 }
    get maxTextX() { return this.maxX - 20 }
    get maxTextY() { return this.maxY - 20 }
}

// let dialogNode = null;

function drawCanvas() {
    if (canvasController == null) {
        canvasController = new CanvasController();
        ctx = canvasController.ctx;

        console.log('Canvas. left = ' + canvasController.getCanvasLeft() + " / top = " + canvasController.getCanvasTop());
        canvasController.scale(1);
        canvasController.translate(100, 10);

        canvas.addEventListener('click', onMouseClick, false);
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener("keydown", onKeyDown, false);


        dialogController = new DialogController(canvasController);
        dialogController.setActorSkin("elvira", 'girl.png');
        dialogController.setActorSkin("ramoncin", 'icons8-kuroo.svg', "#CEFFDA");

        var dialogNode = dialogController.createRootDialog("1", "elvira");
        dialogNode.textDialog = "¿Y tú quien diablos eres?, enano de mierda que estas todo el día tocándome los cojones, mamón. Vete a la mierda grandisimo hijo de tu madre que te parió, aborto de pájaro...";
        dialogNode.draw(50, 25);
    }

    // console.log('Canvas. left = ' + canvasController.getCanvasLeft() + " / top = " + canvasController.getCanvasTop());

    // var dialogNode = new DialogNode('icons8-kuroo.svg');

    // dialogNode.drawSimple();
    dialogController.drawDialogs();

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
        console.log("Click");

        var point = pointEventToCanvas(event.clientX, event.clientY, true);
        dialogController.onClick(point.x, point.y);
        return true;
    }
}

function onMouseDown(event) {
    var point = pointEventToCanvas(event.clientX, event.clientY);
    // console.log('Mouse down. x = ' + event.clientX + " / y = " + event.clientY + " /// canvas. x = " + point.x + " y = " + point.y);
    var isDragDialog = dialogController.onDragDown(point.x, point.y);
    if (!isDragDialog) {
        dialogController.cancelEditDialog();
        canvasController.dragDown(point.x, point.y);
    }
}

function onMouseUp(event) {
    var point = pointEventToCanvas(event.clientX, event.clientY);
    // console.log('Mouse up. x = ' + event.clientX + " / y = " + event.clientY + " /// canvas. x = " + point.x + " y = " + point.y);
    var isDragDialog = dialogController.onDragUp();
    if (!isDragDialog) {
        canvasController.dragUp();
    }
}

function onMouseMove(event) {
    var point = pointEventToCanvas(event.clientX, event.clientY);
    // console.log('Mouse move. x = ' + event.clientX + " / y = " + event.clientY + " /// canvas. x = " + point.x + " y = " + point.y);
    var isDragDialog = dialogController.onDragMove(point.x, point.y);
    if (!isDragDialog) {
        canvasController.dragMove(point.x, point.y);
    }
}

function onKeyDown(event) {

}