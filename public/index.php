<!doctype html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Durak App</title>

    <link href="/src/assets/lib/bootstrap/css/bootstrap.css" rel="stylesheet"/>
    <link href="/src/assets/common/css/main.css" rel="stylesheet"/>
    <script src="/src/assets/lib/bootstrap/js/bootstrap.bundle.js"></script>
    <script src="/src/assets/lib/vue/vue.js"></script>
    <script src="/src/assets/lib/vue/axois.js"></script>
</head>
<body>

<div id="durakapp" class="">
    <div class="player-container" @drop="onDrop($event, false)" @dragover.prevent @dragenter.prevent>
        <template v-for="player in playersIdle">
            <div @dragstart='startDrag($event, player)' @dragover.prevent @dragenter.prevent
                 :draggable="!player.currentlyPlaying" :class="player.currentlyPlaying ? currentlyPlayingClass : ''" class="player">
                <img draggable="false" src="/src/assets/common/avatars/default.svg"
                     class="rounded-circle player-avatar">
                <div class="caption text-center">{{player.name}}</div>
            </div>
        </template>
    </div>
    <div class="game-table-container">
        <h1 class="text-center">Spielertisch</h1>
        <div @dragover.prevent @dragenter.prevent @drop="onDrop($event, true)" class="game-table">
            <template v-for="(player, index) in playersPlaying">
                <div @click="submitLose(player)" @dragstart='startDrag($event, player)' @dragover.prevent @dragenter.prevent
                     draggable="true" @drop="submitDraw($event, player)" class="player player-playing">
                    <img draggable="false" src="/src/assets/common/avatars/default.svg"
                         class="rounded-circle player-avatar">
                    <div class="caption text-center">{{player.name}}</div>
            </template>
        </div>
    </div>
</div>

<script src="/src/main.js"></script>
</body>
</html>