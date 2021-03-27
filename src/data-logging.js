var customColors = [],
    adobeColors = [],
    customOrder = [0,1,2,3,4],
    adobeOrder = [0,1,2,3,4]

function shuffle_array(arr){
    arr.sort(() => Math.random() - 0.5);
    return arr;
}

function sort_colors(colors, order){
    let arr = [];
    order.forEach(function(index){
        arr.push(colors[index]);
    });
    return arr;
}

class Logger {

    constructor(){
        this.number_of_tests = 10;
        this.current_test_num = 0;
        this.data = [];
        this.targetColor = [];
        this.submittedColor = [];
        this.numberOfGridClicks = 0;
        this.numberOfBlockClicks = 0;
        this.numberOfStripClicks = 0;
        this.numberOfBackClicks = 0;
        this.time = null;
        this.displayMode = "custom";

        // colors - going to uncomment for now
        this.customOrder = shuffle_array(customOrder);
        this.customColors = sort_colors(customColors, this.customOrder);
        this.adobeOrder = shuffle_array(adobeOrder);
        this.adobeColors = sort_colors(adobeColors, this.adobeOrder);
    }

    all_done(){
        return this.number_of_tests == this.current_test_num;
    }

    set_time(time) {
        this.time = time / 1000;
    }

    set_targetColor(color){
        this.targetColor = color;
    }

    set_submittedColor(color){
        let [r,g,b,,] = color;
        this.submittedColor = [r,g,b];
    }

    set_displayMode(mode){
        this.displayMode = mode;
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

    clicked_back(){
        this.numberOfBackClicks += 1;
    }

    start_round(){
        this.new_round();
        this.current_test_num += 1;
    }

    stop_round(){
        this.update_data();
    }

    new_round(){
        this.targetColor = [];
        this.submittedColor = [];
        this.numberOfGridClicks = 0;
        this.numberOfBlockClicks = 0;
        this.numberOfStripClicks = 0;
        this.numberOfBackClicks = 0;
        this.time = null;
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
        number-of-back-clicks: int,
        time: int,
        display-mode: [custom or adobe],
    }
    */

    add_headers(){
        let string = "";
        string += "t-R,t-B,t-G,";
        string += "s-R,s-B,s-G,";
        string += "grid-c,block-c,strip-c,back-c,";
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
            this.numberOfBackClicks,
            this.time,
            this.displayMode,
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
