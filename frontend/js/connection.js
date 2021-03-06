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

var connection;

function connectToServer(conn) {

  conn = new WebSocket('ws://localhost:8080');
  // conn = new WebSocket('wss://tic.nilsramstoeck.net/ws/');

  conn.sendJSON = function(json){
    var strData = JSON.stringify(json);
    connection.send(strData);
    console.log("CLIENT: " + strData);
  }

  conn.sendChatMessage = function(msg){
    var data = {
      action: "msg_global",
      msg: {
        user_id: user_id,
        room_code: room_code,
        text: msg
      }
    }
    conn.sendJSON(data);
  }

  conn.onopen = function () {
    //INIT CONNECTION
    var data = {
      action: "init",
      username: client_username,
      user_id: user_id,
      room_code: room_code
    };
    conn.sendJSON(data);
  };

  // Log errors
  conn.onerror = function (error) {
    console.log('WebSocket Error ' + error);
  };

  // Log messages from the server
  conn.onmessage = function (e) {
    let data = JSON.parse(e.data);
    console.log(data);
    switch (data.action) {
      case "start_game":
      $("#menu-modal").modal("hide");
      break;
      case "update_board":
      updateBoard(data.data);
      break;
      case 'undo_response':
      $("#" + data.card_id + "_card").replaceWith(getCardHTML(data, data.card_id));
      $("#" + data.card_id + "_card").addClass("tic_undone_card");
      enableCards();
      state.busy = false;
      $("#" + data.card_id + "_card").click();
      break;
      case 'team_select':
      if(data.type == "request"){
        // $('#menu').css("display", "");
      } else if(data.type == "response"){
        if(data.response == "true"){
          //YAAAAY
        } else {
          //NAAAAY
        }
      }
      break;
      case "start_turn":
      checkPlayability();
      enableCards();
      if(data.done){
        playingAs = (player_id + 2) % 4;
      } else {
        playingAs = player_id;
      }
      break;
      case 'player_info':
      data.players.forEach((player) => {
        startAreas.forEach((h) => {
          if(h.id.split("_")[1] == player.player_id){
            h.owner = player.username;
            if(player.user_id == user_id){
              player_id = player.player_id;
              updateBoardRotation();
            }
          }
        });
      });
      break;
      case "start_round":
      disableCards();
      enableSwap();
      break;
      case "swap_card_response":
      if(data.result){
        disableSwap();
        state.busy = false;
      }
      break;
      case 'team_update':
      $(".team_members").html("");
      data.players.forEach((p) => {
        var team = parseInt(p.team) + 1;
        $("#" + team + "_team_members").append(`<span class="team_member">${p.username}<span><br>`)
      });

      break;
      case 'move_response':
      if(data.result){
        $("#" + data.card_id + "_card").remove();
        $(".tic_card").removeClass("tic_unplayable");
      } else {
        enableCards();
      }
      if(data.done){
        playingAs = (player_id + 2) % 4;
      } else {
        playingAs = player_id;
      }
      state.busy = false;
      break;
      case 'playability':
      var throwaway = true;
      data.cards.forEach((c) => {
        var card = $("#" + c.id + "_card");
        if(c.playable){
          throwaway = false;
          card.removeClass("tic_unplayable");
        } else {
          card.addClass("tic_unplayable");
        }
      });
      if(throwaway){
        disableCards();
        enableThrowaway();
      }
      break;
      case 'deal':{
        $("#hand_cards").html("");
        data.cards.forEach((c) => {
          $("#hand_cards").append(getCardHTML(c, $('.tic_card').length));
        });

      }
    }
  };
  return conn;
}

function selectTeam(team) {
  var data = {
    user_id: user_id,
    room_code: room_code,
    action: "team_select",
    team_id: team-1
  };
  connection.sendJSON(data);
}

$(".team-card").on("click", function(){
  $('.team-card').css("color", "Silver").addClass("unselected");
  $(this).css("color", "Black").removeClass("unselected");
  selectTeam(parseInt($(this).prop("id").split()[0]));
});
