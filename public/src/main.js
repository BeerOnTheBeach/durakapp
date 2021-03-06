const app = new Vue({
    el: ('#durakapp'),
    data: {
        settings: [],
        playersIdle: [],
        games: [],
        playersPlaying: [],
        currentlyPlayingClass: "currentlyPlaying",
        dragTimeout: true,
        touchPositionX: 0,
        touchPositionY: 0,
    },
    computed: {
        gamesThisSession() {
            let filteredBySession = this.games.filter(
                game => game.session_id === this.settings.id
            )
            let lastGames = [];
            for (let i = 0; i < filteredBySession.length; i++) {
                let loser = this.playersIdle.find(player => player.id === filteredBySession[i].loser)
                let loser2 = this.playersIdle.find(player => player.id === filteredBySession[i].loser_2)
                //Add loser
                lastGames[i] = {
                    loser: loser.name,
                    loserColor: loser.color,
                    loser_2: loser2 ? loser2.name : -1,
                    loser2Color: loser2 ? loser2.color : "#212529",
                    players: filteredBySession[i].players,
                    modified: filteredBySession[i].modified,
                    session_id: this.settings.currentSessionId
                }
            }
            //Return games reversed, so last game is displayed first (you could also do this in vue-html i think)
            return lastGames.reverse();
        }
    },
    created() {
        //Get settings
        axios.get('./api/settings/read.php')
            .then(function (response) {
                app.settings = response.data.records[0];
            })
            .catch(function (error) {
                console.error(error)
            });

        //Get player-data
        axios.get('./api/player/read.php')
            .then(function (response) {
                app.playersIdle = response.data.records;
                app.playersPlaying = response.data.records.filter(
                    player => player.currentlyPlaying === true
                )
            })
            .catch(function (error) {
                console.error(error)
            });

        //Get games-data
        this.getGameData()
    },
    methods: {
        startDrag(evt, player) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('playerID', player.id)
        },
        onTouchStart(evt) {
            //set timer here, so it wont overwrite the click-event on a single-click
            this.dragTimeout = Date.now();
            //disable swipe-down-reload
            document.getElementsByTagName('body')[0].classList.add("anti-reload")
            document.getElementsByTagName('html')[0].classList.add("anti-reload")
            //disable scrolling
            document.getElementsByTagName('body')[0].classList.add("anti-scroll")
            document.getElementsByTagName('html')[0].classList.add("anti-scroll")

        },
        onTouchMove(evt) {
            //check this timer here
            if (this.dragTimeout + 250 <= Date.now()) {
                let playerAvatar = evt.target.closest(".player")
                let touchLocation = evt.targetTouches[0]
                playerAvatar.style.position = "fixed";
                //get margin to fix offset set by it
                let playerAvatarMargin = getComputedStyle(playerAvatar).margin.replace('px', '')
                //get element height/width, half it and subtract that too, cause of 'offset' made by element
                //TODO: dont hardcode that...
                let playerAvatarOffset = 50;
                playerAvatar.style.left = touchLocation.pageX - playerAvatarMargin - playerAvatarOffset + 'px';
                playerAvatar.style.top = touchLocation.pageY - playerAvatarMargin - playerAvatarOffset + 'px';
                this.touchPositionX = evt.targetTouches[0].pageX
                this.touchPositionY = evt.targetTouches[0].pageY
            }
        },
        onTouchEnd(evt, player) {
            //check timer here again
            if (this.dragTimeout + 250 <= Date.now()) {
                let playerAvatar = evt.target.closest(".player")
                //get margin to fix offset set by it
                let playerAvatarMargin = getComputedStyle(playerAvatar).margin.replace('px', '')
                //get element height/width, half it and subtract that too, cause of 'offset' made by element
                //TODO: dont hardcode that...
                let playerAvatarOffset = 50;
                let elementPositionX = playerAvatar.style.left.replace('px', '')
                let elementPositionY = playerAvatar.style.top.replace('px', '')
                //Get gameTable and bench rectangles
                let gameTableRect = document.getElementById("game-table").getBoundingClientRect()
                let benchRect = document.getElementById("player-container").getBoundingClientRect()
                //Check where the player was dropped and add it to corresponding array
                if (this.wasDroppedOn(this.touchPositionX, this.touchPositionY, gameTableRect)
                    && !player.currentlyPlaying && this.playersPlaying.length < 6) {
                    console.log("was dropped in table");
                    this.playersPlaying.push(player);
                    player.currentlyPlaying = 1;
                    this.updatePlayer(player)
                } else if(this.wasDroppedOn(this.touchPositionX, this.touchPositionY, benchRect)) {
                    const index = this.playersPlaying.indexOf(player);
                    if (index > -1) {
                        console.log("was dropped on bench");
                        player.currentlyPlaying = 0
                        this.updatePlayer(player)
                        this.playersPlaying.splice(index, 1);
                    }
                } else if(player.currentlyPlaying) {
                    this.playersPlaying.forEach(function (playerDroppedOn) {
                        //Get player rect
                        let playerRect = document.getElementById(playerDroppedOn.name).getBoundingClientRect()
                        //check if it was dropped on player
                        if(app.wasDroppedOn(app.touchPositionX, app.touchPositionY, playerRect) && player !== playerDroppedOn) {
                            //submit draw
                            console.log("was dropped on: " + playerDroppedOn.name)
                            app.createGame(playerDroppedOn.id, player.id);
                            //update players
                            app.playersPlaying.forEach(function (_player) {
                                if (_player === playerDroppedOn || _player === player) {
                                    _player.draws++;
                                }
                                _player.gamescount++
                                app.updatePlayer(_player)
                            })
                            return true;
                        }
                    })
                }
                playerAvatar.style.position = "unset";
                playerAvatar.style.left = "unset";
                playerAvatar.style.top = "unset";
            }
            //enable swipe-down-reload for android-chrome
            document.getElementsByTagName('body')[0].classList.remove("anti-reload")
            document.getElementsByTagName('html')[0].classList.remove("anti-reload")
            document.getElementsByTagName('body')[0].classList.remove("anti-scroll")
            document.getElementsByTagName('html')[0].classList.remove("anti-scroll")
        },
        wasDroppedOn(elementPositionX, elementPositionY, rect) {
            if ((elementPositionX >= rect.x && elementPositionX <= rect.x + rect.width)
                &&
                (elementPositionY >= rect.y && elementPositionY <= rect.y + rect.height)) {
                return true;
            }
        },
        onDrop(evt, isPlayingList) {
            const playerID = evt.dataTransfer.getData('playerID')
            const player = this.playersIdle.find(player => player.id === playerID)
            if (isPlayingList && !player.currentlyPlaying && this.playersPlaying.length < 6) {
                this.playersPlaying.push(player);
                player.currentlyPlaying = isPlayingList
                this.updatePlayer(player)
            } else if (!isPlayingList) {
                console.log("Player dropped on bench")
                const index = this.playersPlaying.indexOf(player);
                if (index > -1) {
                    player.currentlyPlaying = isPlayingList
                    this.updatePlayer(player)
                    this.playersPlaying.splice(index, 1);
                }
            }
        },
        submitDraw(evt, player) {
            let playerID = evt.dataTransfer.getData('playerID')
            let playerDragged = this.playersIdle.find(player => player.id === playerID)
            if (playerDragged.currentlyPlaying && playerDragged !== player) {
                this.createGame(playerDragged.id, player.id);
                //Update player-data
                let players = this.playersPlaying;
                for (let i = 0; i < players.length; i++) {
                    if (players[i] === playerDragged || players[i] === player) {
                        players[i].draws++;
                    }
                    players[i].gamescount++
                    this.updatePlayer(players[i])
                }
            }
        },
        submitLose(loser) {
            console.log("click event")
            //Can't play alone :<
            if (this.playersPlaying.length >= 2) {
                //Save game to db
                this.createGame(loser.id, -1);
                //Update player-data
                let players = this.playersPlaying;
                for (let i = 0; i < players.length; i++) {
                    if (players[i] === loser) {
                        players[i].losses++;
                    }
                    players[i].gamescount++
                    this.updatePlayer(players[i])
                }
            } else {
                //TODO: Add alert-message
            }

        },
        getPlayersPlaying() {
            let players = ''
            for (let i = 0; i < this.playersPlaying.length; i++) {
                i === this.playersPlaying.length - 1
                    ? players += this.playersPlaying[i].id
                    : players += this.playersPlaying[i].id + ','
            }
            return players
        },
        createGame(loserId, loser_2Id) {
            let players = this.getPlayersPlaying();
            axios.post('./api/game/create.php', {
                loser: loserId,
                loser_2: loser_2Id,
                players: players,
                session_id: this.settings.id
            })
                .then(function (response) {
                    app.getGameData()
                    return true
                })
                .catch(function (error) {
                    console.error(error)
                });
        },
        updatePlayer(player) {
            axios.post('./api/player/update.php', player)
                .then(function (response) {
                    console.log(response.data.message)
                })
                .catch(function (error) {
                    console.error(error)
                });
        },
        getGameData() {
            //Get games-data
            axios.get('./api/game/read.php')
                .then(function (response) {
                    app.games = response.data.records;
                    app.setSettings();
                })
                .catch(function (error) {
                    console.error(error)
                });
            //Get Settings again
            axios.get('./api/settings/read.php')
                .then(function (response) {
                    app.settings = response.data.records[0];
                })
                .catch(function (error) {
                    console.error(error)
                });
        },
        setSettings() {
            //New Session if last game is more than 24h away
            let lastGame = app.games[app.games.length - 1];
            let lastGameDate = Math.round(new Date(Date.parse(lastGame.modified)).getTime() / 1000)
            let currentDate = Math.round(new Date().getTime() / 1000);
            if ((currentDate - lastGameDate) / 8 / 60 / 60 >= 1) {
                axios.post('./api/settings/update.php', {
                    id: ++this.settings.id
                })
                    .then(function (response) {
                        console.log(response.data.message)
                    })
                    .catch(function (error) {
                        console.error(error)
                    });
            }
        }
    }
})