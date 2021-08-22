interface VectorI {
    x: number,
    y: number
};

class Program {

    public author: string;
    private samples: VectorI[];
    private standardError: number = -Infinity;
    private conclusion: string = "";

    constructor() {
        this.author = "github.com/RuntimeTerror418";
        this.samples = [];
    }

    public start(ctx: CanvasRenderingContext2D, DOM: any) {

        window.addEventListener("mousedown", e => {
            this.addSample({x: e.clientX, y: e.clientY});
        });

        window.addEventListener("touchstart", e => {
            this.addSample({x: e.touches[0].pageX, y: e.touches[0].pageY});
        });

        const animate = (timeStamp: number) : void => {
            this.update(ctx, DOM);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    public addSample(sample: VectorI) : void {
        this.samples.push(sample);
    }

    private update(ctx: CanvasRenderingContext2D, DOM: any): void {
        let grouped = this.groupedSample();
        let model = this.fitModel(grouped);
        this.drawModel(ctx, model.slope, model.constant);

        if(model.correlation == 1) 
            this.conclusion = "Perfect Positive linear and direct relationship";
        else if(model.correlation == -1)
            this.conclusion = "Perfect Negative linear but indirect relationship";
        else if(-1 < model.correlation && model.correlation < -0.5) 
            this.conclusion = "Strong negative linear relationship";
        else if(-0.5 < model.correlation && model.correlation < 0) 
            this.conclusion = "weak Negative linear relationship";
        else if(0 < model.correlation && model.correlation < 0.5)
            this.conclusion = "weak Positive linear relationship";
        else if(0.5 < model.correlation && model.correlation < 1)
            this.conclusion = "Strong positive linear relationship";
        else if(model.correlation == 0) 
            this.conclusion = "No relationship";


        DOM.equation.innerHTML = `<b style="color:teal">Equation:</b> ${model.equation}`;
        DOM.correlation.innerHTML = `<b style="color:yellow">Correlation:</b> ${
            model.correlation.toFixed(4)}`;
        DOM.error.innerHTML = `<b style="color:tomato">Standard Error:</b> ${
            this.standardError.toFixed(4)}`;
        DOM.conclusion.innerHTML = `<b style="color:teal">Conclusion:</b> There is ${
            this.conclusion} in the sample`;
    }

    private groupedSample(): any  {
        const grouped: any = {
            x:[], 
            y:[], 
            xy:[],
            xi2: [],
            yi2: []
        };
        this.samples.forEach(sample => {
            grouped.x.push(sample.x);
            grouped.y.push(sample.y);
            grouped.xy.push(sample.x * sample.y);
            grouped.xi2.push(sample.x * sample.x);
            grouped.yi2.push(sample.y * sample.y);
        });
        return grouped;
    }

    private fitModel(grouped: any): any {
        const length: number = grouped.x.length;
        const sumX: number = grouped.x.reduce((a: number, b: number) => a + b);
        const sumY: number = grouped.y.reduce((a: number, b: number) => a + b);
        const sumXY: number = grouped.xy.reduce((a: number, b: number) => a + b);
        const sumXi2: number = grouped.xi2.reduce((a: number, b: number) => a + b);
        const sumYi2: number = grouped.yi2.reduce((a: number, b: number) => a + b);
        const dUp: number = (length * sumXY - sumX * sumY);
        const dDownX: number = (length * sumXi2 - sumX * sumX);
        const dDownY: number = (length * sumYi2 - sumY * sumY);
        const slope: number =  dUp / dDownX;
        const lineConstant = (sumY - slope * sumX) / length;
        const equation: string = `Y = ${slope.toFixed(4)}X + ${lineConstant.toFixed(4)}`;
        let correlation: number = dUp / Math.sqrt(dDownX * dDownY);
        if(isNaN(correlation)) correlation = 0;
        return {slope, constant: lineConstant, correlation, equation};
    }

    private drawModel(ctx: CanvasRenderingContext2D, slope: number, constant: number): void {
        let Es: number[] = [];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = "teal";
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        for(let x: number = -2, i=0; x < ctx.canvas.width; x++, i++) {
            let y: number = slope * x + constant;
            if(i < this.samples.length) {
                let e = this.samples[i].y - y;
                Es.push(e * e);
            };
            ctx.lineTo(x, y);
        };
        ctx.stroke();

        this.standardError = Math.sqrt((Es.reduce((a, b) => a + b)) / (this.samples.length - 2));
        Es = [];

        ctx.fillStyle = "red";
        this.samples.forEach((sample, i) => {
            ctx.beginPath();
            ctx.arc(sample.x, sample.y, 3.5, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
        });
    }

};

const $ = (id: string): HTMLElement | null => document.getElementById(id);


const main = () : void => {
    
    const DOM: any = {
        canvas: <HTMLCanvasElement>$("canvas"),
        info: <HTMLElement>$("info"),
        equation: <HTMLElement>$("equation"),
        correlation: <HTMLElement>$("correlation"),
        error: <HTMLElement>$("error"),
        conclusion: <HTMLElement>$("conclusion")
    };
    DOM.canvas.width = innerWidth;
    DOM.canvas.height = innerHeight;
    DOM.canvas.style.backgroundColor = "#000";
    const ctx = <CanvasRenderingContext2D>DOM.canvas.getContext("2d");

    const regressionCalc = new Program();
    regressionCalc.start(ctx, DOM);
};

window.addEventListener("load", main);