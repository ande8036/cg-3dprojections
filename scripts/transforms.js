// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. translate near clipping plane to origin
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])

    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    //clip: [-19, 5, -10, 8, 12, 100]
    //        l   r   b   t   n   f
    let cw = [(clip[0] + clip[1])/2, (clip[2] + clip[3])/2, (-1 * clip[4])];
    let dop = [cw[0] - prp.x, cw[1] - prp.y, cw[2] - prp.z];
    
    
    // 1. translate PRP to origin
    let prpvector4 = Vector4(prp.x, prp.y, prp.z, 1);
    //console.log("test: " + JSON.stringify(prpvector4));
    let transMatrix =  Mat4x4Translate(prpvector4, prp.x * -1, prp.y * -1, prp.z * -1);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let n = prp.subtract(srp);
    n.normalize();

    let u = vup;
    u = u.cross(n);
    u.normalize();
    //console.log(u);

    let v = n.cross(u);

    let rotateMatrix = Mat4x4Rotate(prpvector4, u, v, n);

    // 3. shear such that CW is on the z-axis
    
    let shx = (-1 * dop[0])/dop[2];
    let shy = (-1 * dop[1])/dop[2];
    let shearMatrix = Mat4x4ShearXY(prpvector4, shx, shy); 
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    
    let sperx = (2 * clip[4])/((clip[1] - clip[0]) * clip[5]);
    let spery = (2 * clip[4])/((clip[3] - clip[2]) * clip[5]);
    let sperz = 1/clip[5];

    let scaleMatrix = Mat4x4Scale(prpvector4, sperx, spery, sperz);
    
    //console.log(transMatrix);

    //let transform = Matrix.multiply([transMatrix, rotateMatrix, shearMatrix, scaleMatrix, mat4x4MPer()]);
    let transform = Matrix.multiply([transMatrix, rotateMatrix, shearMatrix, scaleMatrix]);
    return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    // mpar.values = ...;
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, -1, 0]];
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    let translateMat4x4 = new Matrix(4, 4);
    translateMat4x4.values = [[1, 0, 0, tx],
                              [0, 1, 0, ty],
                              [0, 0, 1, tz],
                              [0, 0, 0, 1]];
    //console.log("test1: " + JSON.stringify(mat4x4));
    return translateMat4x4;
    
}

// set values of existing 4x4 matrix to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    let scaleMat4x4 = new Matrix(4, 4);
    scaleMat4x4.values = [[sx, 0, 0, 0],
                          [0, sy, 0, 0],
                          [0, 0, sz, 0],
                          [0, 0, 0, 1]];
    //console.log("test: " + scaleMat4x4.mult(mat4x4));
    return scaleMat4x4;
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    let rotatexMat4x4 = new Matrix(4, 4);
    rotatexMat4x4.values = [[1, 0, 0, 0],
                          [0, Math.cos(theta), (-1 * Math.sin(theta)), 0],
                          [0, Math.sin(theta), Math.cos(theta), 0],
                          [0, 0, 0, 1]];
    //console.log("test: " + rotatexMat4x4.mult(mat4x4));
    return rotatexMat4x4;
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    let rotateyMat4x4 = new Matrix(4, 4);
    rotateyMat4x4.values = [[Math.cos(theta), 0, Math.sin(theta), 0],
                          [0, 1, 0, 0],
                          [(-1 * Math.sin(theta)), 0, Math.cos(theta), 0],
                          [0, 0, 0, 1]];
    //console.log("test: " + rotateyMat4x4.mult(mat4x4));
    return rotateyMat4x4;
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    let rotatezMat4x4 = new Matrix(4, 4);
    rotatezMat4x4.values = [[Math.cos(theta), (-1 * Math.sin(theta)), 0, 0],
                          [Math.sin(theta), Math.cos(theta), 0, 0],
                          [0, 0, 1, 0],
                          [0, 0, 0, 1]];
    //console.log("test: " + rotatezMat4x4.mult(mat4x4));
    return rotatezMat4x4;
}

// set values of existing 4x4 matrix to the rotate about
function Mat4x4Rotate(mat4x4, u, v, n) {
    let rotateMat4x4 = new Matrix(4, 4);
    rotateMat4x4.values = [[u.x, u.y, u.z, 0],
                          [v.x, v.y, v.z, 0],
                          [n.x, n.y, n.z, 0],
                          [0, 0, 0, 1]];
    //console.log("test: " + rotatezMat4x4.mult(mat4x4));
    return rotateMat4x4;
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    let shearMat4x4 = new Matrix(4, 4);
    shearMat4x4.values = [[1, 0, shx, 0],
                          [0, 1, shy, 0],
                          [0, 0, 1, 0],
                          [0, 0, 0, 1]];
    //console.log("test: " + shearMat4x4.mult(mat4x4));
    return shearMat4x4;
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
