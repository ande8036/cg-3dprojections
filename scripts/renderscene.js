let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
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

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    // window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    console.log(scene);
    
    // TODO: implement drawing here!
    // For each model, for each edge
    //  * transform to canonical view volume
    //  * clip in 3D
    //  * project to 2D
    //  * draw line
    
    let n = scene.view.prp.subtract(scene.view.srp);

    n.normalize();
    console.log("n: " + JSON.stringify(n));

    let u = scene.view.vup;
    console.log(u);

    u = u.cross(n);
    console.log(u.cross(n));
    u.normalize();
    console.log("u: " + JSON.stringify(u));

    let v = n.cross(u);
    console.log("v: " + JSON.stringify(v));

    console.log("translate Matrix: " + JSON.stringify(mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip)));
    console.log(mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip));

    let prpvector4 = Vector4(scene.view.prp.x, scene.view.prp.y, scene.view.prp.z, 1);

    //change prp to perspective

    let transform = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
    let originalPrp = prpvector4;
    
    prpvector4 = transform.mult(prpvector4);
    prpvector4 = Vector4(prpvector4.values[0][0], prpvector4.values[1][0], prpvector4.values[2][0], prpvector4.values[3][0]);
    let newPrp = Vector3(((prpvector4.x - originalPrp.x) / prpvector4.w) + originalPrp.x, ((prpvector4.y - originalPrp.y) / prpvector4.w) + originalPrp.y, ((prpvector4.z - originalPrp.z) / prpvector4.w) + originalPrp.z);


    /*let newN = newPrp.subtract(scene.view.srp);

    newN.normalize();
    console.log("newN: " + JSON.stringify(newN));

    let newU = scene.view.vup;
    console.log(newU);

    newU = newU.cross(newN);
    console.log(newU.cross(newN));
    newU.normalize();
    console.log("newU: " + JSON.stringify(newU));

    let newV = newN.cross(newU);
    console.log("newV: " + JSON.stringify(newV));*/

    //console.log(scene.models[0].edges);

    for(i in scene.models[0].vertices) {
        //loop through every vertex
        //transform each point
        originalVertex = scene.models[0].vertices[i];
        let newVertex = transform.mult(scene.models[0].vertices[i]);
        newVertex = Vector4(newVertex.values[0][0], newVertex.values[1][0], newVertex.values[2][0], newVertex.values[3][0]);
        scene.models[0].vertices[i] = Vector3(((newVertex.x - originalVertex.x) / newVertex.w) + originalVertex.x, ((newVertex.y - originalVertex.y) / newVertex.w) + originalVertex.y, ((newVertex.z - originalVertex.z) / newVertex.w) + originalVertex.z);;

    }

    


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
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (0.0 + FLOAT_EPSILON)) {
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
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (z_min + FLOAT_EPSILON)) {
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
    
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    let t = 0;
    let x = 0;
    let y = 0;
    let z = 0;

    let outCheck = out0||out1;
    //case 1, both inside
    if(outcheck == 0){
        return line;
    }

    //case 2 both outside
    if((out0 && out1) != 0){
        return result;
    }

    //case 3 0 inside 1 out
    if((out0 && LEFT != LEFT) && (out1 && LEFT) == LEFT){ //out0 is not outside of left and out1 is
        t = (-line.pt0.x + line.pt0.z)/(-(line.pt1.x/line.pt0.x) - (line.pt1.z/ line.pt0.z));
        line.pt1.y = (1-t)*line.pt0.y + t*line.pt1.y;
        line.pt1.z = (1-t)*line.pt0.z + t*line.pt1.z;
        line.pt1.x = 0;
    } 

    if((out0 && RIGHT != RIGHT) && (out1 && RIGHT) == RIGHT){ //out0 is not outside of left and out1 is
        t = (line.pt0.x + line.pt0.z)/(-(line.pt1.x/line.pt0.x) - (line.pt1.z/ line.pt0.z));
        line.pt1.y = (1-t)*line.pt0.y + t*line.pt1.y;
        line.pt1.z = (1-t)*line.pt0.z + t*line.pt1.z;
        line.pt1.x = view.width;
    } 

    if((out0 && BOTTOM != BOTTOM) && (out1 && BOTTOM) == BOTTOM){ //out0 is not outside of left and out1 is
        t = (line.pt0.y + line.pt0.z)/((line.pt1.y/line.pt0.y) - (line.pt1.z/ line.pt0.z));
        line.pt1.y = 0;
        line.pt1.z = (1-t)*line.pt0.z + t*line.pt1.z;
        line.pt1.x = (1-t)*line.pt0.x + t*line.pt1.x;
    } 

    if((out0 && TOP != TOP) && (out1 && TOP) == TOP){ //out0 is not outside of left and out1 is
        t = (line.pt0.y + line.pt0.z)/(-(line.pt1.y/line.pt0.y) - (line.pt1.z/ line.pt0.z));
        line.pt1.y = view.height;
        line.pt1.z = (1-t)*line.pt0.z + t*line.pt1.z;
        line.pt1.x = (1-t)*line.pt0.x + t*line.pt1.x;
    } 

    if((out0 && NEAR != NEAR) && (out1 && NEAR) == NEAR){ //out0 is not outside of left and out1 is
        t = (line.pt0.z - z_min)/(-(line.pt1.z/ line.pt0.z));
        line.pt1.y = (1-t)*line.pt0.y + t*line.pt1.y;
        line.pt1.z = (1-t)*line.pt0.z + t*line.pt1.z;
        line.pt1.x = (1-t)*line.pt0.x + t*line.pt1.x;
    } 

    if((out0 && FAR != FAR) && (out1 && FAR) == FAR){ //out0 is not outside of left and out1 is
        t = (line.pt0.y + line.pt0.z)/(-(line.pt1.y/line.pt0.y) - (line.pt1.z/ line.pt0.z));
        line.pt1.y = line.pt1.y = (1-t)*line.pt0.y + t*line.pt1.y;
        line.pt1.z = (1-t)*line.pt0.z + t*line.pt1.z;
        line.pt1.x = (1-t)*line.pt0.x + t*line.pt1.x;
    } 

    //case 4 0 out 1 in


    
    /*if(outCheck != 0){
        if(out0 && LEFT == LEFT) {
            t = (0 - line.pt0.x)/(line.pt1.x - line.pt0.x);
            y = (1-t)*line.pt0.y + t*line.pt1.y;
        }
        if((out0 && LEFT == LEFT) && ) {
            t = (0 - line.pt0.x)/(line.pt1.x - line.pt0.x);
            y = (1-t)*line.pt0.y + t*line.pt1.y;
        }
        
    }*/
    
    // TODO: implement clipping here!
    // t = (x -x0)/(x1-x0)
    // L < x=0

    //T > height
    //R > width
    //B < 0
    //N < zmin
    //F > zmax
    return line;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
            console.log("A");
            break;
        case 68: // D key
            console.log("D");
            break;
        case 83: // S key
            console.log("S");
            break;
        case 87: // W key
            console.log("W");
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
