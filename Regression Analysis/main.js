const Program = /** @class */ (function () {
    function Program() {
        this.standardError = -Infinity;
        this.conclusion = "";
        this.author = "github.com/RuntimeTerror418";
        this.samples = [];
    }
    Program.prototype.start = function (ctx, DOM) {
        var _this = this;
        window.addEventListener("mousedown", function (e) {
            _this.addSample({ x: e.clientX, y: e.clientY });
        });
        window.addEventListener("touchstart", function (e) {
            _this.addSample({ x: e.touches[0].pageX, y: e.touches[0].pageY });
        });
        var animate = function (timeStamp) {
            if(_this.samples.length)
                _this.update(ctx, DOM);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };
    Program.prototype.addSample = function (sample) {
        this.samples.push(sample);
    };
    Program.prototype.update = function (ctx, DOM) {
        var grouped = this.groupedSample();
        var model = this.fitModel(grouped);
        this.drawModel(ctx, model.slope, model.constant);
        if (model.correlation == 1)
            this.conclusion = "Perfect Positive linear and direct relationship";
        else if (model.correlation == -1)
            this.conclusion = "Perfect Negative linear but indirect relationship";
        else if (-1 < model.correlation && model.correlation < -0.5)
            this.conclusion = "Strong negative linear relationship";
        else if (-0.5 < model.correlation && model.correlation < 0)
            this.conclusion = "weak Negative linear relationship";
        else if (0 < model.correlation && model.correlation < 0.5)
            this.conclusion = "weak Positive linear relationship";
        else if (0.5 < model.correlation && model.correlation < 1)
            this.conclusion = "Strong positive linear relationship";
        else if (model.correlation == 0)
            this.conclusion = "No relationship";
        DOM.equation.innerHTML = "<b style=\"color:teal\">Equation:</b> " + model.equation;
        DOM.correlation.innerHTML = "<b style=\"color:yellow\">Correlation:</b> " + model.correlation.toFixed(4);
        DOM.error.innerHTML = "<b style=\"color:tomato\">Standard Error:</b> " + this.standardError.toFixed(4);
        DOM.conclusion.innerHTML = "<b style=\"color:teal\">Conclusion:</b> There is " + this.conclusion + " in the sample";
    };
    Program.prototype.groupedSample = function () {
        var grouped = {
            x: [],
            y: [],
            xy: [],
            xi2: [],
            yi2: []
        };
        this.samples.forEach(function (sample) {
            grouped.x.push(sample.x);
            grouped.y.push(sample.y);
            grouped.xy.push(sample.x * sample.y);
            grouped.xi2.push(sample.x * sample.x);
            grouped.yi2.push(sample.y * sample.y);
        });
        return grouped;
    };
    Program.prototype.fitModel = function (grouped) {
        var length = grouped.x.length;
        var sumX = grouped.x.reduce(function (a, b) { return a + b; });
        var sumY = grouped.y.reduce(function (a, b) { return a + b; });
        var sumXY = grouped.xy.reduce(function (a, b) { return a + b; });
        var sumXi2 = grouped.xi2.reduce(function (a, b) { return a + b; });
        var sumYi2 = grouped.yi2.reduce(function (a, b) { return a + b; });
        var dUp = (length * sumXY - sumX * sumY);
        var dDownX = (length * sumXi2 - sumX * sumX);
        var dDownY = (length * sumYi2 - sumY * sumY);
        var slope = dUp / dDownX;
        var lineConstant = (sumY - slope * sumX) / length;
        var equation = "Y = " + slope.toFixed(4) + "X + " + lineConstant.toFixed(4);
        var correlation = dUp / Math.sqrt(dDownX * dDownY);
        if (isNaN(correlation))
            correlation = 0;
        return { slope: slope, constant: lineConstant, correlation: correlation, equation: equation };
    };
    Program.prototype.drawModel = function (ctx, slope, constant) {
        var Es = [];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = "teal";
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        for (var x = -2, i = 0; x < ctx.canvas.width; x++, i++) {
            var y = slope * x + constant;
            if (i < this.samples.length) {
                var e = this.samples[i].y - y;
                Es.push(e * e);
            }
            ;
            ctx.lineTo(x, y);
        }
        ;
        ctx.stroke();
        this.standardError = Math.sqrt((Es.reduce(function (a, b) { return a + b; })) / (this.samples.length - 2));
        Es = [];
        ctx.fillStyle = "red";
        this.samples.forEach(function (sample, i) {
            ctx.beginPath();
            ctx.arc(sample.x, sample.y, 3.5, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        });
    };
    return Program;
}());
;
var $ = function (id) { return document.getElementById(id); };
var main = function () {
    var DOM = {
        canvas: $("canvas"),
        info: $("info"),
        equation: $("equation"),
        correlation: $("correlation"),
        error: $("error"),
        conclusion: $("conclusion")
    };
    DOM.canvas.width = innerWidth;
    DOM.canvas.height = innerHeight;
    DOM.canvas.style.backgroundColor = "#000";
    var ctx = DOM.canvas.getContext("2d");
    var regressionCalc = new Program();
    regressionCalc.start(ctx, DOM);
};
window.addEventListener("load", main);