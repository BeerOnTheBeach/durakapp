const edit = new Vue({
    el: ('#edit'),
    data: {
        players: [],
        form: {
            name: '',
            losses: '0',
            draws: '0',
            elo: 1500,
            color: '#198754',
            currentlyPlaying: '0'
        },
        alert: {
            playerCreate: {
                success: {
                    message: "",
                    show: false
                },
                failed: {
                    message: "",
                    show: false
                }
            }
        }
    },
    created() {
        //Get player-data
        axios.get('/api/player/read.php')
            .then(function (response) {
                edit.players = response.data.records;
            })
            .catch(function (error) {
                console.error(error)
            });
    },
    methods: {
        createPlayer() {
            //Hide previous alerts
            this.hideAlerts();

            //Check if player with that name already exists
            if(!this.playerAlreadyExists(this.form.name)) {
                axios.post('/api/player/create.php', this.form)
                    .then((res) => {
                        this.alert.playerCreate.success.message = "Spieler '" + this.form.name + "' wurde hinzugefügt."
                        this.alert.playerCreate.success.show = true
                        //Push player to players-array, so we dont have to call the api again (would work too)
                        this.players.push(this.form)
                    })
                    .catch((error) => {
                        console.log(error)
                    });
            } else {
                this.alert.playerCreate.failed.message = "Spieler mit Name '" + this.form.name + "' existiert bereits."
                this.alert.playerCreate.failed.show = true
            }
        },
        playerAlreadyExists(formName) {
            for (let i = 0; i < this.players.length; i++) {
                if(formName === this.players[i].name) {
                    return true;
                }
            }
            return false;
        },
        hideAlerts() {
            this.alert.playerCreate.success.show = false
            this.alert.playerCreate.failed.show = false
        }
    }
})