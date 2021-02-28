const app = new Vue({
    el: ('#durakapp'),
    data: {
        settings: [],
        numberOfChairs: 4,
        playerData: [],
        games: []
    },
    computed: {
        playersIdle () {
            return this.playerData.filter(player => player.currentlyPlaying === '0')
        },
        playersPlaying () {
            return this.playerData.filter(player => player.currentlyPlaying === '1')
        }
    },
    created() {
        //Get player-data
        axios.get('/api/player/read.php')
            .then(function (response) {
                app.playerData =  response.data.records;
                console.log(app.playerData)
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
        startDrag: (evt, player) => {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('playerID', player.id)
        },
        onDrop (evt, list) {
            console.log(evt)
            const playerID = evt.dataTransfer.getData('playerID')
            const player = this.playerData.find(player => player.id === playerID)
            player.currentlyPlaying = list
            evt.target.classList.toggle("chair-empty")
        }
    }
})