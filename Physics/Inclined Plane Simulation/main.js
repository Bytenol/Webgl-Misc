let canvas, ctx, lastTime, ball, floor, range;

const { cos, sin, hypot, atan2, PI, min } = Math;

let g = 10;    // acceleration due to gravity
let ck = 0.2;   // coefficient of dynamic friction
const cs = 0.25;    // coefficient of static friction
let mass = 5;  // mass of the object

const Force = {

    weight(m, g) { return new Vector(0, m * g); },

    normal(a, m, g) {
        return Vector.fromAngle(a - PI * 0.5, m * g * cos(a));
    },

    friction(normal, a, m, g){
        const gX = m * g * sin(a);
        const fMag = ball.vel.x <= 1e-6 ? 
            min(gX, cs * normal.length): ck * normal.length;
        const friction = normal.perp();
        friction.x *= fMag;
        friction.y *= fMag;
        return friction;
    },

    all: []
};

const degToRad = d => d * PI / 180;

const update = dt => {  

    // velocity integration
    ball.pos.x += ball.vel.x * dt;
    ball.pos.y += ball.vel.y * dt;

    // boundary clamping
    if(ball.pos.x > floor.end.x + ball.radius) {
        ball.pos.x = floor.start.x; 
        ball.pos.y = floor.start.y - ball.radius;
    }

    const a = atan2(floor.end.y - floor.start.y, floor.end.x - floor.start.x);
    const weight = Force.weight(mass, g);
    const normal = Force.normal(a, mass, g);
    const friction = Force.friction(normal, a, mass, g);

    // the net force on the ball
    const force = weight.add(normal).add(friction);
    Force.all = [];
    Force.all.push({f: weight, c: "#ff0000"});
    Force.all.push({f: normal, c: "#00ff00"});
    Force.all.push({f: friction, c: "34a300"});

    // the acceleration from the force
    const acc = new Vector(force.x / mass, force.y / mass);

    // velocity integration
    ball.vel.x += acc.x * dt;
    ball.vel.y += acc.y * dt;

    document.getElementById("velInfo").innerHTML = `
    <b>Velocity: </b>${ball.vel.length.toPrecision(4)}<br>
    `;
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f';
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * PI);
    ctx.closePath();
    ctx.fill();
    drawLine(floor.start, floor.end);
    const o = {x: ball.pos.x, y: ball.pos.y};
    Force.all.forEach(v => drawLine({x: o.x, y: o.y}, {x: o.x + v.f.x, y: o.y + v.f.y}, v.c));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(o.x, o.y, 3, 0, 2 * PI);
    ctx.closePath();
    ctx.fill();
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

    range.min = canvas.height * 0.3;
    range.max = canvas.height * 0.8;

    floor = {};
    floor.start = new Vector(canvas.width * 0.1, canvas.height * 0.3);
    floor.end = new Vector(canvas.width * 0.9, canvas.height * 0.8);

    ball = {};
    ball.radius = 20;
    ball.pos = new Vector(floor.start.x, floor.start.y - ball.radius);
    ball.vel = new Vector(0, 0);

    lastTime = Date.now();
    requestAnimationFrame(animate);

    range.addEventListener("change", e => {
        floor.start.y = range.value;
        ball.pos = new Vector(floor.start.x, floor.start.y - ball.radius);
        ball.vel = new Vector(0, 0);
    });
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

    static fromAngle(a, mag = 1){ 
        return new Vector(cos(a) * mag, sin(a) * mag);
    }
};
