const colorPresets = [
    'rgb(0, 255, 70)',      // #00FF46
    'rgb(125, 52, 253)',    // #7d34fd
];

/** the characters */
const characterSets = [
    /* binary */
    "01",
    /* gurmukhi */
    '੧੨੩੪੫੬੭੮੯੦ੳਅਰਤਯਪਸਦਗਹਜਕਲਙੜਚਵਬਨਮੲਥਫਸ਼ਧਘਝਖਲ਼ੜ੍ਹਛਭਣ',
    /* sanskrit */
    '१२३४५६७८९अरतयपसदगहजकलङषचवबनमआथय़फशधघझखळक्षछभणऒ',
    /* konkani */
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレワヰヱヲンヺ・ーヽ',
    /* katakana */
    '゠クタハムヰアケチヒモヲィコッャンイツヤウゥサフュヵテユヶェショワエトヘヨォスラヱオナリカセニホル・ヌレーキソネロヽノマヮミ',
];

const controls = {
    'matrixCharacters': val => setCharacterList(val),
    'fontSize': val => setFont(val),
    'matrixColorPresets': val => {
        pickedColor = colorPresets[val];
        !useCustomColor && (color = pickedColor);
    },
    'useCustomColor': val => {
        useCustomColor = val;
        color = val ? customColor : pickedColor;
    },
    'customMatrixColor': val => {
        customColor = hexToRGB(val);
        useCustomColor && (color = customColor);
    },
    'matrixFadingSpeed': val => colorFadingSpeed = getColorFading(val),
    'fps': val => setFPS(val),
};


var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

// making the canvas full screen
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

// initial value
var color = colorPresets[0];
var pickedColor = colorPresets[0];
var customColor = colorPresets[0];
var useCustomColor = false;

var colorFadingSpeed = getColorFading(8);
var fontSize;
var characters;
/** Number of columns for the rain */
var columns;

// Controlling the Frame Rate with requestAnimationFrame
// https://gist.github.com/elundmark/38d3596a883521cb24f5
let fps;
let now;
let then = Date.now();
let interval;
let delta;

// an array of drops - one per column
let drops = [];

setCharacterList(0);
setFont(17);
setFPS(40);
initDrops();


/** 
 * drawing the characters 
 * @see {@link https://github.com/bad1dea/lively_matrix bad1dea/lively_matrix}
*/
function draw() {
    requestAnimationFrame(draw);

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
        // update time stuffs

        // Just `then = now` is not enough.
        // Lets say we set fps at 10 which means
        // each frame must take 100ms
        // Now frame executes in 16ms (60fps) so
        // the loop iterates 7 times (16*7 = 112ms) until
        // delta > interval === true
        // Eventually this lowers down the FPS as
        // 112*10 = 1120ms (NOT 1000ms).
        // So we have to get rid of that extra 12ms
        // by subtracting delta (112) % interval (100).
        // Hope that makes sense.

        then = now - (delta % interval);

        // Drawing the Frame
        // background color → fading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // looping over drops
        for (let i = 0; i < drops.length; i++) {
            // a random character to print
            let text = characters[Math.floor(Math.random() * characters.length)];

            // background color of the text
            ctx.fillStyle = colorFadingSpeed;
            ctx.fillRect(i * fontSize, drops[i] * fontSize, fontSize, fontSize);

            // char color
            ctx.fillStyle = color;
            // fillText: x = i * font_size, y = value of drops[i] * font_size
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Incrementing Y coordinate
            drops[i]++;
            
            // sending the drop back to the top randomly after it has crossed the screen
            // adding randomness to the reset to make the drops scattered on the Y axis
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
                drops[i] = 0;
        }
    }
}

draw();

/** Called once when page is loaded to initialize webpage based on the `value` field in `LivelyProperties.json` */
function livelyPropertyListener(name, val) {
    controls[name](val);

    if (name != 'matrixSpeed') {
        initDrops();
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
}

function initDrops() {
    // x below is the x coordinate
    // after the = is the y-coordinate of the drop
    for (var x = 0; x < columns; x++)
        drops[x] = Math.floor(Math.random() * 61) - 60;
}

/**
 * Convert color in hex format to rgb format
 * @param {String} hex
 */
function hexToRGB (hex) {
    const [r, g, b] = hex.match(/[A-Za-z0-9]{2}/g).map(v => parseInt(`0x${v}`));
    return `rgb(${r}, ${g}, ${b})`;
}

function getColorFading(alpha) {
    return `rgba(8, 8, 8, ${alpha / 10})`; // dark gray
}

function setFont(size) {
    fontSize = size;
    ctx.font = `${size}px ${characters.length == 2 ? 'monospace' : 'arial'}`;
    columns = canvas.width / size;
}

/** converting the string into an array of single characters */
function setCharacterList(index) {
    characters = characterSets[index].split("");
}

function setFPS(val) {
    fps = val;
    interval = 1000 / val;
}