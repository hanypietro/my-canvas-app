const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const brushColorInput = document.getElementById('brushColor');
const clearCanvasButton = document.getElementById('clearCanvas');
const saveDrawingButton = document.getElementById('saveDrawing');
const saveDrawingJPEGButton = document.getElementById('saveDrawingJPEG');
const fillCanvasButton = document.getElementById('fillCanvas');
const eraserToolButton = document.getElementById('eraserTool');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const shareDrawingButton = document.getElementById('shareDrawing');

let drawing = false;
let brushSize = 5;
let brushColor = '#000000';
let isEraser = false;
let undoStack = [];
let redoStack = [];

canvas.addEventListener('mousedown', () => { drawing = true; saveState(); });
canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', draw);
clearCanvasButton.addEventListener('click', clearCanvas);
saveDrawingButton.addEventListener('click', () => saveDrawing('image/png'));
saveDrawingJPEGButton.addEventListener('click', () => saveDrawing('image/jpeg'));
fillCanvasButton.addEventListener('click', fillCanvas);
eraserToolButton.addEventListener('click', () => { isEraser = true; });
undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
shareDrawingButton.addEventListener('click', shareDrawing);

function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#fff' : brushColor;
    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveDrawing(format) {
    const dataURL = canvas.toDataURL(format);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `drawing.${format.split('/')[1]}`;
    a.click();
}

function fillCanvas() {
    ctx.fillStyle = brushColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
}

function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = [];
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL());
        const imgData = undoStack.pop();
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(canvas.toDataURL());
        const imgData = redoStack.pop();
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }
    }
}

function shareDrawing() {
    const dataURL = canvas.toDataURL('image/png');
    const shareData = {
        title: 'My Drawing',
        text: 'Check out my drawing!',
        url: dataURL,
    };

    if (navigator.share) {
        navigator.share(shareData).then(() => {
            console.log('Drawing shared successfully!');
        }).catch((error) => {
            console.error('Error sharing drawing:', error);
        });
    } else {
        const shareURL = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}%0D%0A${encodeURIComponent(shareData.url)}`;
        window.location.href = shareURL;
    }
}
