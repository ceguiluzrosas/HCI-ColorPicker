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
        this.submittedColor = [];
        this.numberOfGridClicks = 0;
        this.numberOfBlockClicks = 0;
        this.numberOfStripClicks = 0;
        this.time = null;
    }

    set_time(time) {
        this.time = time / 1000;
    }

    set_submittedColor(color){
        let [r,g,b,,] = color;
        this.submittedColor = [r,g,b];
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

    start_round(stage, test, color){
        this.reset_values();
        this.currentStage = stage;
        this.currentTest = test;
        this.targetColor = color;
    }

    stop_round(){
        this.update_data();
    }
    
    /*
    {
        target-color-r: int,
        target-color-g: int,
        target-color-b: int,
        submitted-color-r: int,
        submitted-color-g: int,
        submitted-color-b: int,
        number-of-grid-clicks: int,
        number-of-block-clicks: int,
        number-of-strip-clicks: int,
        time: int,
        display-mode: [custom or adobe],
    }
    */

    add_headers(){
        let string = "";
        string += "t-R,t-B,t-G,";
        string += "s-R,s-B,s-G,";
        string += "grid-c,block-c,strip-c,";
        string += "start-t,";
        string += "end-t,";
        string += "display,";
        return string + "\r\n";
    }

    update_data(){
        this.data.push([
            this.targetColor[0], this.targetColor[1], this.targetColor[2],
            this.submittedColor[1], this.submittedColor[1], this.submittedColor[2],
            this.numberOfGridClicks,
            this.numberOfBlockClicks,
            this.numberOfStripClicks,
            this.time,
            this.stages[this.currentStage]["display"],
        ]);
    }

    create_file(){
        let csvContent = "data:text/csv;charset=utf-8," + this.add_headers();
        this.data.forEach(function(round){
            let row = round.join(",");
            csvContent += row + "\r\n";
        });
        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }
}
