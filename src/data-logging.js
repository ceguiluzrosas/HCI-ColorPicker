class Logger {

    constructor(stages){
        this.data = [];
        this.stages = stages;
        
        this.nStages = stages.length;
        this.nTests = stages[0]["colors"].length;

        this.currentTest = 0;
        this.currentStage = 0;

        // Initialize data point values for each round
        this.reset_values();
    }

    reset_values() {
        this.selectedColors = [];
        this.submittedColor = null;
        this.numberOfGridClicks = 0;
        this.numberOfBlockClicks = 0;
        this.numberOfStripClicks = 0;
        this.numberOfCompareClicks = 0;
        this.time = null;
    }

    set_time(time) {
        this.time = time / 1000;
    }

    selected_color(color){
        if (!this.submittedColor) {
            let [r,g,b,,] = color;
            this.selectedColors.push(`(${r},${g},${b})`);
        }
    }

    set_submittedColor(color){
        let [r,g,b,,] = color;
        this.submittedColor = `(${r},${g},${b})`;
    }

    clicked_grid(){
        this.numberOfGridClicks += 1;
    }

    clicked_block(){
        this.numberOfBlockClicks += 1;
    }

    clicked_strip(){
        this.numberOfStripClicks += 1;
    }

    clicked_compare(){
        this.numberOfCompareClicks += 1;
    }

    start_round(stage, test, color){
        this.reset_values();
        this.currentStage = stage;
        this.currentTest = test;
        this.targetColor = `(${color.join(",")})`;
    }

    stop_round(){
        this.update_data();
    }
    
    /*
    {
        display mode: [custom or adobe],
        stage: int,
        test: int,
        target color: (r,g,b),
        submitted color: (r,g,b),
        selected colors: [(r,g,b)],
        grid clicks: int,
        block clicks: int,
        strip clicks: int,
        compare clicks: int,
        time: int,
    }
    */

    update_data(){
        this.data.push({
            "display mode": this.stages[this.currentStage]["display"],
            "stage": this.currentStage,
            "test": this.currentTest,
            "target color": this.targetColor,
            "submitted color": this.submittedColor,
            "selected colors": this.selectedColors,
            "grid clicks": this.numberOfGridClicks,
            "block clicks": this.numberOfBlockClicks,
            "strip clicks": this.numberOfStripClicks,
            "compare clicks": this.numberOfCompareClicks,
            "time": this.time,
        });
    }

    create_file(){
        let encodedUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data));
        $("#results").attr("href", encodedUri);
        $("#results").css("visibility", "visible");
    }
}
