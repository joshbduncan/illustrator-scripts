// example progress dialog

var progress = new Window("palette");
progress.text = "Progress";

progress.msg = progress.add("statictext");
progress.msg.preferredSize.width = 450;

progress.bar = progress.add("progressbar");
progress.bar.preferredSize.width = 450;

progress.set = function (steps) {
    this.bar.value = 0;
    this.bar.minvalue = 0;
    this.bar.maxvalue = steps;
};

progress.display = function (message) {
    message && (this.msg.text = message);
    this.update();
};

progress.increment = function () {
    this.bar.value++;
    this.update();
};

var iterations = 100;
progress.set(iterations);
progress.show();
progress.display("Processing...");

for (var i = 0; i < iterations; i++) {
    progress.increment();
    progress.display("Processing " + (i + 1).toString() + " of " + iterations + "...");
}

progress.display("Completed processing " + iterations + " items!");
