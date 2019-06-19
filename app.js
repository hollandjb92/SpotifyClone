// Client ID ae26b1906ba7498bb7dbfaea08485622
// Client Secret 421ab48747c74f62b1c97ce1d2e0b458


//ADD DELAY TO SEARCH AJAX CALL
//MAKE NO MATCHES FOUND TEXT LARGER AND CENTERED
//STYLE THE SEARCH RESULT DIVS
//CORRECT SEARCH BAR FUNCTIONALITY AFTER USING ONCE
//ADD PLAY BUTTON/ARTIST PAGE DIV
//Authentication for tokens

$(document).ready(function () {

  let token =
    "BQCjLdwTAOsylhOrIb-2EE8IqLtH7aGifVpdD0Y7sRIoBY10mNpTPipZBVeN2PFTyR5-5MOdc2z26P4C7BTaSdlR9uW-2kGjln6uLjXdPY3WSzQWF4CgcNICG5fMpofHs3ax5oasKbl-GZVubvkQSBEKWj6QKUsYSdODw54";

  const app = new Vue({
    el: "#app",
    data() {
      return {
        client_id: "ae26b1906ba7498bb7dbfaea08485622",
        scopes: "streaming user-modify-playback-state user-read-birthdate user-read-private user-read-email user-read-currently-playing user-read-playback-state user-library-read user-library-modify",
        redirect_uri: "https://hollandjb92.github.io/SpotifyClone/",
        me: null
      }
    },
    methods: {
      login() {
        let popup = window.open(`https://accounts.spotify.com/authorize?client_id=${this.client_id}&response_type=token&redirect_uri=${this.redirect_uri}&scope=${this.scopes}&show_dialog=true&state=123`, 'Login with Spotify', 'width=800,height=600')

        window.spotifyCallback = (payload) => {
          console.log(payload);
          popup.close()

          $.ajax({
            url: "https://api.spotify.com/v1/me",
            type: "GET",
            headers: {
              Authorization: "Bearer " + token
            }
          }).then(response => {
            return JSON.parse(response) //.json()
          }).then(data => {
            this.me = data
          })
          // fetch("https://api.spotify.com/v1/me", {
          //   headers: {
          //     "Authorization": "Bearer ${payload}"
          //   }
          // }).then(response => {
          //   return response.json()
          // }).then(data => {
          //   this.me = data
          // })
        }
      }
    },
    mounted() {
      this.token = window.location.hash.substr(1).split("&")[0].split("=")[1]
      if (this.token) {
        window.opener.spotifyCallback(this.token)
      }
    }
  })




  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: "Web Playback SDK Quick Start Player",
      getOAuthToken: cb => {
        cb(token);
      }
    });

    // Error handling
    player.addListener("initialization_error", ({
      message
    }) => {
      console.error(message);
    });
    player.addListener("authentication_error", ({
      message
    }) => {
      console.error(message);
    });
    player.addListener("account_error", ({
      message
    }) => {
      console.error(message);
    });
    player.addListener("playback_error", ({
      message
    }) => {
      console.error(message);
    });

    // Playback status updates
    player.addListener("player_state_changed", state => {
      console.log(state);
    });

    // Ready
    player.addListener("ready", ({
      device_id
    }) => {
      console.log("Ready with Device ID", device_id);
    });

    // Not Ready
    player.addListener("not_ready", ({
      device_id
    }) => {
      console.log("Device ID has gone offline", device_id);
    });

    // Connect to the player!
    player.connect();

    $(".play").on("click", function () {
      player.resume().then(() => {
        console.log('Resumed!');
      });
    });

    $(".pause").on("click", function () {
      player.pause().then(() => {
        console.log('Paused!');
      });
    });

    $(".next").on("click", function () {
      player.nextTrack().then(() => {
        console.log('Skipped to next track!');
      });
    })

    $(".previous").on("click", function () {
      player.previousTrack().then(() => {
        console.log('Set to previous track!');
      });
    })

    $(".shuffle").on("click", function () {
      player.getCurrentState().then(state => {
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK');
          return;
        } else {
          console.log(state.shuffle);
          let shuffleState = state.shuffle;

          if (shuffleState === false) {
            console.log("I am here");
            $.ajax({
              url: "https://api.spotify.com/v1/me/player/shuffle?state=true",
              type: "PUT",
              dataType: "json",
              contentType: "application/json",
              headers: {
                Authorization: "Bearer " + token
              }
            })
          } else if (shuffleState === true) {
            $.ajax({
              url: "https://api.spotify.com/v1/me/player/shuffle?state=false",
              type: "PUT",
              dataType: "json",
              contentType: "application/json",
              headers: {
                Authorization: "Bearer " + token
              }
            })
          }
        }
      })
    })


    $(".repeat").on("click", function () {
      player.getCurrentState().then(state => {
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK');
          return;
        }
        console.log(state.repeat_mode);
        let repeatMode = state.repeat_mode;

        if (repeatMode === 0) {
          $.ajax({
            url: "https://api.spotify.com/v1/me/player/repeat?state=track",
            type: "PUT",
            headers: {
              Authorization: "Bearer " + token
            }
          })
          //repeat current song does NOT work properly
        } else if (repeatMode === 1) {

          $.ajax({
            url: "https://api.spotify.com/v1/me/player/repeat?state=context",
            type: "PUT",
            headers: {
              Authorization: "Bearer " + token
            }
          })
        } else if (repeatMode === 2) {

          $.ajax({
            url: "https://api.spotify.com/v1/me/player/repeat?state=off",
            type: "PUT",
            headers: {
              Authorization: "Bearer " + token
            }
          })

        }
      });

    });


  };


  $(document).on("click", "#searchButton", function () {
    $("#musicContent").empty();
    $(".coverArt").empty();
    let newDiv = $("<div>").attr("id", "searchBar")
    let searchBar = $("<input/>", {
      type: "text",
      id: "searchItem",
      class: "form-control",
      autocomplete: "off",
      name: "query",
      placeholder: "Type Here..."
    });
    newDiv.append(searchBar).addClass("animate fadeInUp")
    $("#musicContent").append(newDiv);
  });


  $(document).on("keyup", "#searchItem", function (event) {

    let query = event.target.value;

    $.ajax({
      type: "GET",
      url: "https://api.spotify.com/v1/search?q=" + query + "&type=artist,album,track&limit=3",
      headers: {
        Authorization: "Bearer " + token
      }
    }).done(function (response) {
      $(".coverArt").empty();
      $(".trackInfo").empty();
      $(".playButton").empty();
      console.log(response);
      if (response.albums.total == 0 && response.artists.total == 0 && response.tracks.total == 0) {
        //CENTER AND ENLARGE THIS TEXT
        $("#musicContainer").text("No matches found")
      }


      for (i = 0; i < 9; i++) {
        let musicDiv = $("<div>").attr("id", "musicDiv" + i);
        let coverArt = $("<div>").attr("id", "coverArt" + i).addClass("coverArt ");
        let trackInfo = $("<div>").attr("id", "trackInfo" + i).addClass("trackInfo");
        let playButton = $("<div>").attr("id", "playButton" + i).addClass("playButton");

        $(musicDiv).append(coverArt, trackInfo, playButton).addClass("animate fadeInUp");
        $("#musicContainer").append(musicDiv);
      }

      //tracks
      $("#coverArt0").append("<img src='" + response.tracks.items[0].album.images[2].url + "'>");
      $("#coverArt1").append("<img src='" + response.tracks.items[1].album.images[2].url + "'>");
      $("#coverArt2").append("<img src='" + response.tracks.items[2].album.images[2].url + "'>");
      //artists
      $("#coverArt3").append("<img src='" + response.artists.items[0].images[2].url + "'>");
      $("#coverArt4").append("<img src='" + response.artists.items[1].images[2].url + "'>");
      $("#coverArt5").append("<img src='" + response.artists.items[2].images[2].url + "'>");
      //albums
      $("#coverArt6").append("<img src='" + response.albums.items[0].images[2].url + "'>");
      $("#coverArt7").append("<img src='" + response.albums.items[1].images[2].url + "'>");
      $("#coverArt8").append("<img src='" + response.albums.items[2].images[2].url + "'>");

      //tracks
      $("#trackInfo0").empty().prepend("<span>" + response.tracks.items[0].name + "</span>").append("<span>" + response.tracks.items[0].artists[0].name + "</>");
      $("#trackInfo1").empty().prepend("<span>" + response.tracks.items[1].name + "</span>").append("<span>" + response.tracks.items[1].artists[0].name + "</>");
      $("#trackInfo2").empty().prepend("<span>" + response.tracks.items[2].name + "</span>").append("<span>" + response.tracks.items[2].artists[0].name + "</>");
      //ARTISTS
      $("#trackInfo3").empty().append("<span>" + response.artists.items[0].name + "</span>");
      $("#trackInfo4").empty().prepend("<span>" + response.artists.items[1].name + "</span>");
      $("#trackInfo5").empty().prepend("<span>" + response.artists.items[2].name + "</span>");
      //ALBUMS
      $("#trackInfo6").empty().append("<span>" + response.albums.items[0].name + "</span>");
      $("#trackInfo7").empty().prepend("<span>" + response.albums.items[1].name + "</span>");
      $("#trackInfo8").empty().prepend("<span>" + response.albums.items[2].name + "</span>");

    })
  })


});

//old code - use later?

// 


// $(".repeat").on("click", function () {

//   if (repeatState = "off") {
//     $.ajax({
//       url: "https://api.spotify.com/v1/me/player/repeat?state=" + repeatState,
//       type: "PUT",
//       headers: {
//         Authorization: "Bearer " + token
//       }
//     }).then(function () {
//       repeatState = "track";
//     })
//   }

//   if (repeatState = "track") {
//     $.ajax({
//       url: "https://api.spotify.com/v1/me/player/repeat?state=" + repeatState,
//       type: "PUT",
//       headers: {
//         Authorization: "Bearer " + token
//       }
//     }).then(function () {
//       repeatState = "context";
//     })
//   }

//   if (repeatState = "context") {
//     $.ajax({
//       url: "https://api.spotify.com/v1/me/player/repeat?state=" + repeatState,
//       type: "PUT",
//       headers: {
//         Authorization: "Bearer " + token
//       }
//     }).then(function () {
//       repeatState = "off";
//     })
//   }

// })


// makes a call and grabs Sunflower object - WORKS
// $.ajax({
//   method: "GET",
//   url:
//     "https://api.spotify.com/v1/search?q=track:never really over&type=track",
//   headers: {
//     Authorization: "Bearer " + token
//   }
// }).then(function(response) {
//   console.log(response);
// });



// $.ajax({
//   url: "https://api.spotify.com/v1/me/player/play",
//   type: "PUT",
//   headers: {
//     Authorization: "Bearer " + token
//   },
//   dataType: "json",
//   contentType: "application/json"
// data: JSON.stringify({
//   "uris": [`spotify:track:${apiData.item.id}`],
//   "position_ms": apiData.progress_ms
// })
// })

// $.ajax({
//   url: "https://api.spotify.com/v1/me/player/pause",
//   type: "PUT",
//   headers: {
//     Authorization: "Bearer " + token
//   }
// });