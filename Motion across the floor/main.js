let canvas, ctx, lastTime, box, floor, range;

const { cos, sin, hypot, atan2, abs, PI, min } = Math;

let g = 9.8;    // acceleration due to gravity
let ck = 0.3;   // kinetic friction coefficient
let mass = 5;  // mass of the object

const Force = {

    weight(m, g) { return new Vector(0, m * g); },

    normal(m, g){ return new Vector(0, m * -g); },

    friction(normal){
        let dir, mag;
        if(box.vel.length <= 0.1) {
            mag = 0;
            dir = 1;
        } else {
            mag = ck * normal.length;
            // dir make sure friction opposes motion
            dir = box.vel.x / abs(box.vel.x); 
        }
        const friction = normal.perp();
        friction.x *= dir * mag;
        return friction;
    },

    all: []
};

const update = dt => {  
    // displacement integration
    box.pos.x += box.vel.x * dt;
    box.pos.y += box.vel.y * dt;

    // boundary clamping
    if(box.size.x + box.pos.x > canvas.width)
        box.pos.x = 0;
    if(box.pos.x < -box.size.x)
        box.pos.x = canvas.width - box.size.x;

    const weight = Force.weight(mass, g);
    const normal = Force.normal(mass, g);
    const friction = Force.friction(normal);

    const force = weight.add(normal).add(friction);
    Force.all = [];
    Force.all.push({f: weight, c: "#ff0000"});
    Force.all.push({f: normal, c: "#00ff00"});
    Force.all.push({f: friction, c: "#0000ff"});

    const acc = new Vector(force.x / mass, force.y / mass);

    box.vel.x += acc.x * dt;
    box.vel.y += acc.y * dt;
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLine(floor.start, floor.end);
    const o = {x: canvas.width * 0.5, y: 100};
    Force.all.forEach(v => drawLine({x: o.x, y: o.y}, {x: o.x + v.f.x, y: o.y + v.f.y}, v.c));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(o.x, o.y, 5, 0, 2 * PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0000af";
    ctx.fillRect(box.pos.x, box.pos.y, box.size.x, box.size.y);

    document.getElementById("velInfo").textContent = `u(${range.value * 10} p/s)`
}

const animate = () => {
    const now = Date.now();
    const dt = (now - lastTime) * 0.001;
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(animate);
}

const drawLine = (p1, p2, color = "#ffffff") => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

const $ = s => document.querySelector(s);

const getCSS = (el, prop) => getComputedStyle(el).getPropertyValue(prop);

const main = () => {
    canvas = document.getElementById("cvs");
    canvas.style.background = "#000";

    // setup window dimension/orientation
    const main = $("main");
    if(parseInt(getCSS(main, "width")) < parseInt(getCSS(main, "height")))
        main.classList.add("landScape");    

    canvas.width = parseFloat(getCSS(canvas, "width"));
    canvas.height = parseFloat(getCSS(canvas, "height"));

    range = document.getElementById("ctrl");

    ctx = canvas.getContext("2d");

    floor = {};
    floor.start = new Vector(0, canvas.height - canvas.height * 0.1);
    floor.end = new Vector(canvas.width, floor.start.y);

    box = {};
    box.size = new Vector(50, 50);
    box.vel = new Vector(0, 0);
    box.pos = new Vector(box.size.x + canvas.width * 0.03, floor.start.y - box.size.y);

    lastTime = Date.now();
    requestAnimationFrame(animate);

    range.addEventListener("change", e => {
        box.vel.x = range.value * 10;
    })
}

addEventListener("load", main);


class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get angle(){ return atan2(this.y, this.x); }

    get length(){ return hypot(this.x, this.y); }

    add(v){ return new Vector(this.x + v.x, this.y + v.y) }

    perp(){ return new Vector(this.y / this.length, -this.x / this.length); }
};
