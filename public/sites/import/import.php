<?php
// include database and object files
include_once '../../api/config/database.php';
include_once '../../api/objects/player.php';
include_once '../../api/objects/game.php';

// file name
$fileName = $_FILES['durak_csv']['tmp_name'];

$row = 1;
if (($handle = fopen($fileName, "r")) !== FALSE) {
    $playerIdsSorted = [];
    $lastRowDate = '';
    while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
        $num = count($data);

        if ($row === 1) {
            //Create player if doesnt exist
            createNonExistingPlayer($data);
            //Map players to cols by index
            $playerIdsSorted = getPlayerIdsSorted($data);
        } else {
            importGame($data, $playerIdsSorted, $lastRowDate);
            $lastRowDate = $data[0];
        }
        $row++;
    }
    fclose($handle);
}

function importGame(array $gameRow, array $playerIdsSorted, string $lastRowDate) {
    $database = new Database();
    $db = $database->getConnection();

    $game = new Game($db);

    // set product property values
    if($lastRowDate !== '' && $gameRow[0]) {
        $game->session_id = 0;
    }
    $game->created = formatDate($gameRow[0]);


    $participants = '';
    $game->loser = '';

    foreach ($gameRow as $key => $gameField) {
        if ($key == 0 || $key == 1) continue;
        if($key >= count($playerIdsSorted)) break;
        // To $key must be minus 2, because there are 'date' and 'anzahl' cols missing

        $playerId = $playerIdsSorted[$key];
        // '1' in CSV is defined as the loser of the game
        if($gameField === '1') {
            $game->loser = $playerId;
            $participants .= "$playerId,";
        }
        // '0' in CSV is defined as participant whom didn't lose
        if($gameField === '0') {
            $participants .= "$playerId,";
        }
        // '2' in CSV is defined as draw. There have to be 2 draw
        // 3.1.;5;0;0;;2;2;;;;;;;;;;;;;;;;
        if($gameField === '2') {
            if($game->loser === '') {
                $game->loser = $playerId;
            } else {
                $game->loser_2 = $playerId;
            }
            $participants .= "$playerId,";

        }
    }
    //Remove last comma from $participants
    $game->players = substr($participants, 0, -1);
    if ($game->create()) {
        echo "Game was successfully created";
    } else {
        echo "Game couldn't be created";
    }
}

function formatDate($date) : string {
    //Date is in format 'd.m', TODO: has to be in 'Y-m-d H:i:s'
    return $date;
}

function getPlayerIdsSorted(array $playersCSV) : array {
    $playerIdsSorted = [];
    //Remove first two cols: '' (empty in csv, should be 'Datum') and 'Anzahl'
    array_splice($playersCSV, 0, 2);
    $playerNamesSorted = spliceEmptyFields($playersCSV);
    $playersDB = getPlayersFromDb();;

    foreach ($playersDB as $playerDB) {
        foreach ($playerNamesSorted as $playerCSV) {
            if ($playerDB['name'] === $playerCSV) {
                //Create non existing players
                $exists = true;
                break;
            } else {
                $exists = false;
            }
        }
        if ($exists) {
            $playerIdsSorted[] = $playerDB['id'];
        }
    }

    return $playerIdsSorted;
}

function createNonExistingPlayer(array $playersCSV) {
    //Remove first two cols: '' (empty in csv, should be 'Datum') and 'Anzahl'
    array_splice($playersCSV, 0, 2);
    $playersCSV = spliceEmptyFields($playersCSV);

    //Get players from db-table
    $existingPlayer = getPlayersFromDb();

    foreach ($playersCSV as $playerName) {
        foreach ($existingPlayer as $playerRow) {
            //Check for existing player (by name)
            if ($playerRow['name'] === $playerName) {
                //Create non existing players
                $exists = true;
                break;
            } else {
                $exists = false;
            }
        }
        if(!$exists) {
            echo "Player $playerName doesnt exists in db. Creating..<br>";
            createNewPlayer($playerName);
        }
    }
}

function createNewPlayer($playerName) {
    // instantiate database and product object
    $database = new Database();
    $db = $database->getConnection();

    // initialize object
    $player = new Player($db);

    // set product property values
    $player->name = $playerName;
    $player->losses = 0;
    $player->draws = 0;
    $player->gamescount = 0;
    $player->elo = 1500;
    $player->color = "#198754";
    $player->currentlyPlaying = 0;
    $player->created = date('Y-m-d H:i:s');

    // create Player
    if($player->create()){
        // success
        echo "Player '$playerName' was created<br>";
    } else {
        // failed
        echo "Could not create player '$playerName'<br>";
    }
}

function getPlayersFromDb() : array {
    // instantiate database and product object
    $database = new Database();
    $db = $database->getConnection();

    // initialize object
    $player = new Player($db);

    // query products
    $stmt = $player->read();
    $num = $stmt->rowCount();

    if($num>0) {
        // players array
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    else return [];
}

//Helper functions
function printArr(array $arr) {
    foreach ($arr as $key => $col) {
        echo "arr[$key]: $col<br>";
    }
}

function spliceEmptyFields(array $arr) :array {
    //Remove empty 'cols'
    for ($i = 0; $i < count($arr); $i++) {
        //Splice if empty
        if(trim($arr[$i]) === '') {
            array_splice($arr, $i, 1);
            //array-elements are renumbered after the splice-operation, so adjust the loop-variable
            $i--;
        }
    }
    return $arr;
}

?>