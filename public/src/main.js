const app = new Vue({
    el: ('#durakapp'),
    data: {
        settings: [],
        numberOfChairs: 4,
        playersIdle: [],
        games: [],
        playersPlaying: [],
        currentlyPlayingClass: "currentlyPlaying"
    },
    computed: {
    },
    created() {
        //Get player-data
        axios.get('/api/player/read.php')
            .then(function (response) {
                console.log(response.data.records)
                app.playersIdle = response.data.records;
                app.playersPlaying = response.data.records.filter (
                    player => player.currentlyPlaying === true
                )
            })
            .catch(function(error) {
                console.error(error)
            });
        //Get games-data
        axios.get('/api/game/read.php')
            .then(function (response) {
                app.games =  response.data.records;
            })
            .catch(function(error) {
                console.error(error)
            });
    },
    methods: {
        startDrag (evt, player) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('playerID', player.id)
        },
        onDrop (evt, isPlayingList) {
            const playerID = evt.dataTransfer.getData('playerID')
            const player = this.playersIdle.find(player => player.id === playerID)
            if(isPlayingList && !player.currentlyPlaying) {
                this.playersPlaying.push(player);
            } else if(!isPlayingList) {
                const index = this.playersPlaying.indexOf(player);
                if (index > -1) {
                    this.playersPlaying.splice(index, 1);
                }
            }
            player.currentlyPlaying = isPlayingList
        },
        submitDraw (evt, player) {
            const playerID = evt.dataTransfer.getData('playerID')
            const playerDragged = this.playersIdle.find(player => player.id === playerID)
            if(playerDragged.currentlyPlaying && playerDragged !== player) {
                console.log(playerDragged.name + " was dropped onto " + player.name)
                this.createGame(playerDragged.id, player.id);
            }
        },
        submitLose (player) {
            this.createGame(player.id, -1);
        },
        getPlayersPlaying() {
            let players = ''
            for(let i = 0; i < this.playersPlaying.length; i++) {
                i === this.playersPlaying.length - 1
                    ? players += this.playersPlaying[i].id
                    : players += this.playersPlaying[i].id + ','
            }
            return players
        },
        createGame(loserId, loser_2Id) {
            let players = this.getPlayersPlaying();
            axios.post('/api/game/create.php', {
                loser: loserId,
                loser_2: loser_2Id,
                players: players,
                session_id: 1
            })
                .then(function (response) {
                    console.log(response)
                })
                .catch(function(error) {
                    console.error(error)
                });
        }
    }
})