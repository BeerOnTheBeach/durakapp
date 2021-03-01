const app = new Vue({
    el: ('#durakapp'),
    data: {
        settings:
            {
                currentSessionId: "2",
                dateFormat: {year: 'numeric', month: 'numeric', day: 'numeric'}
            },
        playersIdle: [],
        games: [],
        playersPlaying: [],
        currentlyPlayingClass: "currentlyPlaying",
    },
    computed: {
        gamesThisSession() {
            let filteredBySession = this.games.filter(
                game => game.session_id === this.settings.currentSessionId
            )
            let lastGames = [];
            for (let i = 0; i < filteredBySession.length; i++) {
                let loserName = this.playersIdle.find(player => player.id === filteredBySession[i].loser)
                let loser2Name = this.playersIdle.find(player => player.id === filteredBySession[i].loser_2)
                lastGames[i] = {
                    loser: loserName.name,
                    loser_2: loser2Name ? loser2Name.name : -1,
                    players: filteredBySession[i].players,
                    modified: filteredBySession[i].modified,
                    session_id: this.settings.currentSessionId
                }
            }
            return lastGames.reverse();
        }
    },
    created() {
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
        onDrop(evt, isPlayingList) {
            const playerID = evt.dataTransfer.getData('playerID')
            const player = this.playersIdle.find(player => player.id === playerID)
            if (isPlayingList && !player.currentlyPlaying) {
                this.playersPlaying.push(player);
                axios.post('./api/player/update.php', {
                    id: player.id,
                    name: player.name,
                    losses: player.losses,
                    draws: player.draws,
                    color: player.color,
                    currentlyPlaying: 1
                })
                    .then(function (response) {
                        console.log(response.data.message)
                    })
                    .catch(function (error) {
                        console.error(error)
                    });
            } else if (!isPlayingList) {
                const index = this.playersPlaying.indexOf(player);
                if (index > -1) {
                    axios.post('./api/player/update.php', {
                        id: player.id,
                        name: player.name,
                        losses: player.losses,
                        draws: player.draws,
                        color: player.color,
                        currentlyPlaying: 0
                    })
                        .then(function (response) {
                            console.log(response.data.message)
                        })
                        .catch(function (error) {
                            console.error(error)
                        });
                    this.playersPlaying.splice(index, 1);
                }
            }
            player.currentlyPlaying = isPlayingList
        },
        submitDraw(evt, player) {
            const playerID = evt.dataTransfer.getData('playerID')
            const playerDragged = this.playersIdle.find(player => player.id === playerID)
            if (playerDragged.currentlyPlaying && playerDragged !== player) {
                this.createGame(playerDragged.id, player.id);
            }
        },
        submitLose(player) {
            this.createGame(player.id, -1);
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
                session_id: this.settings.currentSessionId
            })
                .then(function (response) {
                    console.log(response.data.message)
                    app.getGameData()
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
        },
        setSettings() {
            //New Session if last game is more than 24h away
            let lastGame = app.games[app.games.length - 1];
            let lastGameDate = Math.round(new Date(Date.parse(lastGame.modified)).getTime()/1000)
            let currentDate = Math.round(new Date().getTime()/1000);
            if((currentDate - lastGameDate) / 24 / 60 / 60 >= 1) {
                //TODO: Settings-Ajax to set current session (also add db-table..)
            }
        }
    },
})