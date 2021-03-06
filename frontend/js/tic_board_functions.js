/* Tic Online is an online multiplayer board game.
Copyright (C) 2021  Nils Ramstöck

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */


function createHomeAreas(arr) {
  //positions of the home areas
  let positions = [
    {x:0, y:height*0.25},
    {x:-width*0.25,y:0},
    {x:0, y:-height*0.25},
    {x:width*0.25,y:0},
  ]
  //create the home areas
  for(let i = 0; i < 4; i++){
    let home = new Area("homeArea_" + i);
    let x = positions[i].x;
    let y = positions[i].y;
    createFieldsArc(x, y, width*0.075, 4, home.fields, 240, 90*(i+2));
    arr.push(home);
  }
}

function createStartAreas(arr){
  //start area positions
  let positions = [
    {x:width*0.4, y:height*0.4},
    {x:-width*0.4,y:height*0.4},
    {x:-width*0.4, y:-height*0.4},
    {x:width*0.4,y:-height*0.4},
  ]

  //create start areas
  for(let i = 0; i < 4; i++){
    let start = new Area("startArea_" + i);
    let x = positions[i].x;
    let y = positions[i].y;
    createFieldsArc(x, y, width*0.05, 4, start.fields, 360, 45);
    arr.push(start);
  }
}

function updateBoard(data){
  resetFields(); //empty all fields

  //place all new marbles at their correct places
  for(marble of data){
    switch (marble.pos.area.split("_")[0]) {
      case "playingArea":
      playingArea.place(marble);
      break;
      case "startArea":
      startAreas.forEach((area) => {
        if(area.id == marble.pos.area){
          area.place(marble);
        }
      });
      break;
      case "homeArea":
      homeAreas.forEach((area) => {
        if(area.id == marble.pos.area){
          area.place(marble);
        }
      });
      break;
    }
  }
  loop();
}

function updateBoardRotation(){
  board_rotation = player_id * -PI/2;
}

//creates and arc of fields at x,y with r radius, amt amount of fields
//rotate by offset in array arr that has an angle of the specified angle
function createFieldsArc(x, y, r, amt, arr,  angle=360, angleOff=0){
  for(let i = 0; i < amt; i++){
    let xpos = x + r * cos(radians((i/amt)*angle)+radians(angleOff));
    let ypos = y + r * sin(radians((i/amt)*angle)+radians(angleOff));
    arr.push(new FieldObject(i, xpos, ypos));
  }
}

//returns an area from its ID
function getArea(area){
  switch (area.split("_"[0])) {
    case 'playingArea':
    return playingArea;
    break;
    default:
    let area;
    homeAreas.forEach((a) => {
      if(a.id == area){
        area = a;
      }
    });
    homeAreas.forEach((a) => {
      if(a.id == area){
        area = a;
      }
    });
    return area;
  }
}

function resetFields(){
  ///CLEARING///
  Field.clear(playingArea.fields);
  homeAreas.forEach((h) => {
    Field.clear(h.fields)
  });
  startAreas.forEach((h) => {
    Field.clear(h.fields)
  });

}

function calc_canvas_size(){
  return $("#board_col").width() * 0.75;
}

window.addEventListener('resize', updateCanvasSize); //add resize event

//updates canvas size and recalculates field positions
function updateCanvasSize(){
  let c_size = calc_canvas_size();
  resizeCanvas(c_size, c_size);
  Field.radius = width * 0.038;

  let newArea = new Area(playingArea.id);
  createFieldsArc(0, 0, width*0.415, 60, newArea.fields, 360, 90);

  newArea.fields.forEach((f, i) => {
    playingArea.fields[i].pos = f.pos;
  });


  let newAreas = [];
  //HOME AREAS
  createHomeAreas(newAreas);
  homeAreas.forEach((area, i) => {
    newAreas[i].fields.forEach((f, j) => {
      area.fields[j].pos = f.pos;
    });
  });

  newAreas = [];
  createStartAreas(newAreas);
  startAreas.forEach((area, i) => {
    newAreas[i].fields.forEach((f, j) => {
      area.fields[j].pos = f.pos;
    });
  });

  loop();
}
