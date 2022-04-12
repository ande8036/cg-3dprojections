let view;
let ctx;
let scene;
let start_time;
let w = 800;
let h = 600;
let lines = [];
let direction1 = "none";
let originalVertices;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
            /*
            type: 'parallel',
            prp: Vector3(10, 10, 5),
            srp: Vector3(10, 10, -30),
            vup: Vector3(0, 1, 0),
            clip: [-11, 11, -11, 11, 5, 100]
            */
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };
    originalVertices = scene.models[0].vertices;

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);

    document.getElementById("none").onclick = function() {
        scene.models[0].vertices = originalVertices;
        animate(performance.now(), "none");
    };
    document.getElementById("x").onclick = function() {animate(performance.now(), "x") };
    document.getElementById("y").onclick = function() {animate(performance.now(), "y") };   
    document.getElementById("z").onclick = function() {animate(performance.now(), "z") };
    
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp, direction) {
    // step 1: calculate time (time since start)
    timestamp = performance.now();
    let time = start_time - timestamp;
    //console.log(time);
    //console.log("direction: ", direction1);
    if(direction != undefined) {
        direction1 = direction;
    }



    // step 2: transform models based on time
    // TODO: implement this!
    if(direction1 == "none"){
        drawScene();
    }
    
    
    else {
        if(direction1 == "x"){
            for(i in scene.models[0].vertices) {
                //loop through every vertex
                //transform each point
                let originalVertex = scene.models[0].vertices[i];
                let newVertex = Matrix.multiply([Mat4x4RotateX((time / 1000000) % 3), originalVertex]); //create transformed verticies by multiplying by all initial matricies
                scene.models[0].vertices[i] = newVertex;
                //console.log(originalVertex);
                //console.log(newVertex);
            }
        }
        if(direction1 == "y"){
            for(i in scene.models[0].vertices) {
                //loop through every vertex
                //transform each point
                let originalVertex = scene.models[0].vertices[i];
                let newVertex = Matrix.multiply([Mat4x4RotateY((time / 1000000) % 3), originalVertex]); //create transformed verticies by multiplying by all initial matricies
                scene.models[0].vertices[i] = newVertex;
                //console.log(originalVertex);
                //console.log(newVertex);
            }
        }
        if(direction1 == "z"){
            for(i in scene.models[0].vertices) {
                //loop through every vertex
                //transform each point
                let originalVertex = scene.models[0].vertices[i];
                let newVertex = Matrix.multiply([Mat4x4RotateZ((time / 1000000) % 3), originalVertex]); //create transformed verticies by multiplying by all initial matricies
                scene.models[0].vertices[i] = newVertex;
                //console.log(originalVertex);
                //console.log(newVertex);
            }
        }
        drawScene();
    }
    
    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)

    

    setTimeout(() => {
        window.requestAnimationFrame(animate, direction);
    }, 100);
    
    
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    //console.log(scene);
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, view.width, view.height);
    
    // TODO: implement drawing here!
    // For each model, for each edge
    //  * transform to canonical view volume
    //  * clip in 3D
    //  * project to 2D
    //  * draw line

    //change prp to perspective
    let transform;

    if(scene.view.type == 'parallel'){
        transform = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
    }
    else{
        transform = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
    }

    let transformedVerts = [];

    for(i in scene.models[0].vertices) {
        //loop through every vertex
        //transform each point
        let originalVertex = scene.models[0].vertices[i];
        let newVertex = Matrix.multiply([transform, originalVertex]); //create transformed verticies by multiplying by all initial matricies
        transformedVerts.push(newVertex);
        //console.log(originalVertex);
        //console.log(newVertex);
    }

    lines = [];

    for(let i = 0; i < scene.models[0].edges.length; i++){ //store them in a  new array
        for(let j = 0; j < scene.models[0].edges[i].length - 1; j++){
                lines.push([
                    transformedVerts[scene.models[0].edges[i][j]],
                    transformedVerts[scene.models[0].edges[i][j+1]]
                ]);
        }
    }
    for(i in lines){
        let z_min = -1 * (scene.view.clip[4]/scene.view.clip[5]);
        let line = {pt0: lines[i][0], pt1: lines[i][1]};
        if(scene.view.type == 'parallel'){
            //lines[i] = clipLineParallel(line);
            lines[i]=line; //comment out when clip works
            if(lines[i] != null) {
                let p02d = Matrix.multiply([mat4x4ViewPort(view.width, view.height), mat4x4MPar(), lines[i].pt0]); //transform each point
                let p12d = Matrix.multiply([mat4x4ViewPort(view.width, view.height), mat4x4MPar(), lines[i].pt1]); //in homogeneous points
                drawLine(p02d.x/p02d.w, p02d.y/p02d.w, p12d.x/p12d.w, p12d.y/p12d.w); //convert to cartesian and draw line
            }
        }
        else{
            lines[i] = clipLinePerspective(line, z_min); //put back once clipping is working
            lines[i]=line; //comment out when clip works
            if(lines[i] != null) {
                let p02d = Matrix.multiply([mat4x4ViewPort(view.width, view.height), mat4x4MPer(), lines[i].pt0]); //transform each point
                let p12d = Matrix.multiply([mat4x4ViewPort(view.width, view.height), mat4x4MPer(), lines[i].pt1]); //in homogeneous points
                drawLine(p02d.x/p02d.w, p02d.y/p02d.w, p12d.x/p12d.w, p12d.y/p12d.w); //convert to cartesian and draw line
            }
        }
        
    }
    //console.log(lines);
}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);
    
    // TODO: implement clipping here!
    let outCheck = out0|out1;
    if(outCheck == 0){
        return line;
    }

    //case 2 both outside
    else if((out0 & LEFT) && (out1 & LEFT)){
        return result;
    }
    else if((out0 & RIGHT) && (out1 & RIGHT)){
        return result;
    }
    else if((out0 & BOTTOM) && (out1 & BOTTOM)){
        return result;
    }
    else if((out0 & TOP) && (out1 & TOP)){
        return result;
    }
    else if((out0 & NEAR) && (out1 & NEAR)){
        return result;
    }
    else if((out0 & FAR) && (out1 & FAR)){
        return result;
    }

    //case 3 0 inside 1 out
    else if(out1 != 0) { //if out1 is out // t = (x -x0)/(x1-x0)
        if((out0 & LEFT != LEFT) && ((out1 & LEFT)) == LEFT){ //out0 is not outside of left and out1 is
            t = (0 - line.pt0.x)/(line.pt1.x -line.pt0.x);
        } 
    
        if((out0 & RIGHT != RIGHT) && ((out1 & RIGHT)) == RIGHT){ 
            t = (canvas.width - line.pt0.x )/(line.pt1.x -line.pt0.x);
        } 
    
        if((out0 & BOTTOM != BOTTOM) && ((out1 & BOTTOM)) == BOTTOM){ 
            t = (0 - line.pt0.y)/(line.pt1.y -line.pt0.y);
        } 
    
        if((out0 & TOP != TOP) && ((out1 & TOP)) == TOP){
            t = (canvas.height - line.pt0.y)/(line.pt1.y -line.pt0.y);
        } 
        p1 = ((1-t)*line.pt0.x) + (t*line.pt1.x);
        p1 = ((1-t)*line.pt0.y) + (t*line.pt1.y);
    }

    //case 4 0 out 1 in
    else if(out0 != 0){ //if out0 is outside
        if((out1 & LEFT != LEFT) && ((out0 & LEFT) == LEFT)){ 
            t = (0 - line.pt0.x)/(line.pt1.x -line.pt0.x);
        } 
    
        if((out1 & RIGHT != RIGHT) && ((out0 & RIGHT) == RIGHT)){ 
            t = (canvas.width - line.pt0.x )/(line.pt1.x -line.pt0.x);
        } 
    
        if((out1 & BOTTOM != BOTTOM) && ((out0 & BOTTOM) == BOTTOM)){
            t = (0 - line.pt0.y)/(line.pt1.y -line.pt0.y);
        } 
    
        if((out1 & TOP != TOP) && ((out0 & TOP) == TOP)){ 
            t = (canvas.height - line.pt0.y)/(line.pt1.y -line.pt0.y);
        } 
        p0 = ((1-t)*line.pt0.x) + (t*line.pt1.x);
        p0 = ((1-t)*line.pt0.y) + (t*line.pt1.y);
    }
    line = [[p0],[p1]];
    return line;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); //use p0 to change line
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    let t = 0;

    // TODO: implement clipping here!

    let outCheck = out0|out1;
    //case 1, both inside
    if(outCheck == 0){
        return line;
    }

    //case 2 both outside
    else if((out0 & LEFT) && (out1 & LEFT)){
        return result;
    }
    else if((out0 & RIGHT) && (out1 & RIGHT)){
        return result;
    }
    else if((out0 & BOTTOM) && (out1 & BOTTOM)){
        return result;
    }
    else if((out0 & TOP) && (out1 & TOP)){
        return result;
    }
    else if((out0 & NEAR) && (out1 & NEAR)){
        return result;
    }
    else if((out0 & FAR) && (out1 & FAR)){
        return result;
    }

    //case 3 0 inside 1 out
    else if(out1 != 0) { //if out1 is out
        if((out0 & LEFT != LEFT) && ((out1 & LEFT)) == LEFT){ //out0 is not outside of left and out1 is
            t = (-line.pt0.x + line.pt0.z)/((line.pt0.x/line.pt1.x) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out0 & RIGHT != RIGHT) && ((out1 & RIGHT)) == RIGHT){ 
            t = (line.pt0.x + line.pt0.z)/(-(line.pt0.x/line.pt1.x) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out0 & BOTTOM != BOTTOM) && ((out1 & BOTTOM)) == BOTTOM){ 
            t = (-line.pt0.y + line.pt0.z)/((line.pt0.y/line.pt1.y) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out0 & TOP != TOP) && ((out1 & TOP)) == TOP){
            t = (line.pt0.y + line.pt0.z)/(-(line.pt0.y/line.pt1.y) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out0 & NEAR != NEAR) && ((out1 & NEAR)) == NEAR){ 
            t = (line.pt0.z - z_min)/(-(line.pt0.z/ line.pt1.z));
        } 
    
        if((out0 & FAR != FAR) && ((out1 & FAR) == FAR)){ 
            t = (-line.pt0.z - 1)/((line.pt0.z/ line.pt1.z));
        } 
        p1 = ((1-t)*line.pt0.x) + (t*line.pt1.x);
        p1 = ((1-t)*line.pt0.y) + (t*line.pt1.y);
        p1 = ((1-t)*line.pt0.z) + (t*line.pt1.z);
    }

    //case 4 0 out 1 in
    else if(out0 != 0){ //if out0 is outside
        if((out1 & LEFT != LEFT) && ((out0 & LEFT) == LEFT)){ 
            t = (-line.pt0.x + line.pt0.z)/((line.pt0.x/line.pt1.x) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out1 & RIGHT != RIGHT) && ((out0 & RIGHT) == RIGHT)){ 
            t = (line.pt0.x + line.pt0.z)/(-(line.pt0.x/line.pt1.x) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out1 & BOTTOM != BOTTOM) && ((out0 & BOTTOM) == BOTTOM)){
            t = (-line.pt0.y + line.pt0.z)/((line.pt0.y/line.pt1.y) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out1 & TOP != TOP) && ((out0 & TOP) == TOP)){ 
            t = (line.pt0.y + line.pt0.z)/(-(line.pt0.y/line.pt1.y) - (line.pt0.z/ line.pt1.z));
        } 
    
        if((out1 & NEAR != NEAR) && ((out0 & NEAR) == NEAR)){ 
            t = (line.pt0.z - z_min)/(-(line.pt0.z/ line.pt1.z));
        } 
    
        if((out1 & FAR != FAR) && ((out0 & FAR) == FAR)){ 
            t = (-line.pt0.z - 1)/((line.pt0.z/ line.pt1.z));
        } 
        p0 = ((1-t)*line.pt0.x) + (t*line.pt1.x);
        p0 = ((1-t)*line.pt0.y) + (t*line.pt1.y);
        p0 = ((1-t)*line.pt0.z) + (t*line.pt1.z);
    }
    line = [[p0],[p1]];
    return line;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {

    let n = scene.view.prp.subtract(scene.view.srp);

    n.normalize();
    //console.log("n: " + JSON.stringify(n));

    let u = scene.view.vup;
    //console.log(u);a

    u = u.cross(n);
    //console.log(u.cross(n));
    u.normalize();

    let prp = scene.view.prp;

    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
            console.log("A");

            //prp.scale(10);

            u = u.add(prp);
            scene.view.prp = u;

            //console.log(scene.view.prp);

            drawScene();
            
            break;
        case 68: // D key
            console.log("D");

            //prp.scale(10);

            prp = prp.subtract(u);
            scene.view.prp = prp;

            drawScene();
            
            break;
        case 83: // S key
            console.log("S");

            //prp.scale(10);

            n = n.add(prp);
            scene.view.prp = n;

            drawScene();
            break;
        case 87: // W key
            console.log("W");

            //prp.scale(10);

            prp = prp.subtract(n);
            scene.view.prp = prp;

            

            //console.log(scene.view.prp);

            drawScene();
            break;
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
