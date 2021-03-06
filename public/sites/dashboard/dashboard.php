<!doctype html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Bearbeiten (Admin-Mode)</title>

    <link href="../../src/assets/lib/bootstrap/css/bootstrap.css" rel="stylesheet"/>
    <link href="../../src/assets/common/css/dashboard.css" rel="stylesheet"/>
    <script src="../../src/assets/lib/bootstrap/js/bootstrap.bundle.js"></script>
    <script src="../../src/assets/lib/vue/vue.js"></script>
    <script src="../../src/assets/lib/vue/axois.js"></script>
</head>
<body>
<div id="dashboard" class="container">
    <!--Spieler dashboard Content-->
    <div class="player-container">
        <template v-for="player in players">
            <div class="player player-add">
                <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" :fill="player.color"
                     class="bi bi-person-circle" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path fill-rule="evenodd"
                          d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
                <div class="caption text-center">{{player.name}}</div>
            </div>
        </template>
    </div>
    <div class="games-played">
        <div class="games-container">
        <h1 class="text-center">Spiele</h1>
        <template v-for="(game, index) in games">
            <div v-if="game.loser_2 === '-1'" class="game">
                <div class="game-player">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" :fill="game.loserColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    <div class="game-loser-name text-center">{{game.loser}}</div>
                </div>
                <div class="game-timestamp text-center">
                    {{game.modified}}
                </div>
            </div>
            <div v-else class="game game-draw">
                <div class="game-player">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" :fill="game.loserColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    <div class="game-loser-name text-center">{{game.loser}}</div>
                </div>
                <div class="game-player">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" :fill="game.loser2Color" class="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    <div class="game-loser-name text-center">{{game.loser_2}}</div>
                </div>
                <div class="game-timestamp text-center">
                    {{game.modified}}
                </div>
            </div>
        </template>
    </div>
    </div>

</div>
<script src="dashboard.js"></script>
</body>
</html>

<?php
