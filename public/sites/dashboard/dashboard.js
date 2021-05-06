const dashboard = new Vue({
    el: ('#dashboard'),
    data: {
        settings: '',
        players: {
            isActive: false
        },
        profile: {
            player: '',
            show: false
        },
        games: ''
    },
    created() {
        //Get player-data
        this.readPlayerData()
        //Get game-data
        this.getGameData()
    },
    methods: {
        showProfile(player) {
            //set active class for profile selected
            for (let i = 0; i < this.players.length; i++) {
                console.log(this.players[i].isActive)
                this.players[i].isActive = false;
            }
            player.isActive = true;

            //set player to be shown
            this.profile.player = player;
            this.profile.show = true;
        },
        readPlayerData() {
            axios.get('../../api/player/read.php')
                .then(function (response) {
                    //Init players
                    dashboard.players = response.data.records;
                    //Add active-class to every player after api-call so it wont be overwritten
                    for (let i = 0; i < dashboard.players.length; i++) {
                        dashboard.$set(dashboard.players[i], 'isActive', false)
                    }
                })
                .catch(function (error) {
                    console.error(error)
                });
        },
        getGameData() {
            //Get games-data
            axios.get('../../api/game/read.php')
                .then(function (response) {
                    dashboard.games = response.data.records;
                })
                .catch(function (error) {
                    console.error(error)
                });
            //Get Settings
            axios.get('../../api/settings/read.php')
                .then(function (response) {
                    dashboard.settings = response.data.records[0];
                })
                .catch(function (error) {
                    console.error(error)
                });
        },
    }
})