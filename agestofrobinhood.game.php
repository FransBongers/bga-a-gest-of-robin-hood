<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * agestofrobinhood implementation : © <Your name here> <Your email address here>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * agestofrobinhood.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

$swdNamespaceAutoload = function ($class) {
    $classParts = explode('\\', $class);
    if ($classParts[0] == 'AGestOfRobinHood') {
        array_shift($classParts);
        $file = dirname(__FILE__) . '/modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
        if (file_exists($file)) {
            require_once $file;
        } else {
            die('Cannot find file : ' . $file);
        }
    }
};
spl_autoload_register($swdNamespaceAutoload, true, true);


require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');

// Generic
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Preferences;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Log;
use AGestOfRobinHood\Managers\Players;

// Game specific
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Spaces;

class agestofrobinhood extends Table
{
    use AGestOfRobinHood\DebugTrait;
    use AGestOfRobinHood\States\EngineTrait;
    use AGestOfRobinHood\States\TurnTrait;

    // Declare objects from material.inc.php to remove IntelliSense errors
    
    public static $instance = null;
    function __construct()
    {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        self::$instance = $this;
        self::initGameStateLabels(array(
            'logging' => 10,
        ));
        Engine::boot();
        Stats::checkExistence();
    }

    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "agestofrobinhood";
    }


    public function getGameOptionValue($optionId)
    {
        $query = new AGestOfRobinHood\Helpers\QueryBuilder('global', null, 'global_id');
        $val = $query
            ->where('global_id', $optionId)
            ->get()
            ->first();
        return is_null($val) ? null : $val['global_value'];
    }

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        Globals::setupNewGame($players, $options);
        Preferences::setupNewGame($players, $options);
        Players::setupNewGame($players, $options);
        Stats::checkExistence();
        Globals::setTest($options);
        Spaces::setupNewGame();
        Cards::setupNewGame();

        $this->setGameStateInitialValue('logging', false);

        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
    */
    public function getAllDatas($pId = null)
    {
        $pId = $pId ?? Players::getCurrentId();

        $data = [
            'canceledNotifIds' => Log::getCanceledNotifIds(),
            'playerOrder' => Players::getPlayerOrder(),
            'players' => Players::getUiData($pId),
            'spaces' => Spaces::getAll(),
        ];

        return $data;
    }

    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


    public static function get()
    {
        return self::$instance;
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ////////////   Custom Turn Order   ////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    public function initCustomTurnOrder($key, $order, $callback, $endCallback, $loop = false, $autoNext = true, $args = [])
    {
        $turnOrders = Globals::getCustomTurnOrders();
        $turnOrders[$key] = [
            'order' => $order ?? Players::getTurnOrder(),
            'index' => -1,
            'callback' => $callback,
            'args' => $args, // Useful mostly for auto card listeners
            'endCallback' => $endCallback,
            'loop' => $loop,
        ];
        Globals::setCustomTurnOrders($turnOrders);

        if ($autoNext) {
            $this->nextPlayerCustomOrder($key);
        }
    }

    public function initCustomDefaultTurnOrder($key, $callback, $endCallback, $loop = false, $autoNext = true)
    {
        $this->initCustomTurnOrder($key, null, $callback, $endCallback, $loop, $autoNext);
    }

    public function nextPlayerCustomOrder($key)
    {
        $turnOrders = Globals::getCustomTurnOrders();
        if (!isset($turnOrders[$key])) {
            throw new BgaVisibleSystemException('Asking for the next player of a custom turn order not initialized : ' . $key);
        }

        // Increase index and save
        $o = $turnOrders[$key];
        $i = $o['index'] + 1;
        if ($i == count($o['order']) && $o['loop']) {
            $i = 0;
        }
        $turnOrders[$key]['index'] = $i;
        Globals::setCustomTurnOrders($turnOrders);

        if ($i < count($o['order'])) {
            $this->gamestate->jumpToState(ST_GENERIC_NEXT_PLAYER);
            $this->gamestate->changeActivePlayer($o['order'][$i]);
            $this->jumpToOrCall($o['callback'], $o['args']);
        } else {
            $this->endCustomOrder($key);
        }
    }

    public function endCustomOrder($key)
    {
        $turnOrders = Globals::getCustomTurnOrders();
        if (!isset($turnOrders[$key])) {
            throw new BgaVisibleSystemException('Asking for ending a custom turn order not initialized : ' . $key);
        }

        $o = $turnOrders[$key];
        $turnOrders[$key]['index'] = count($o['order']);
        Globals::setCustomTurnOrders($turnOrders);
        $callback = $o['endCallback'];
        $this->jumpToOrCall($callback);
    }

    public function jumpToOrCall($mixed, $args = [])
    {
        if (is_int($mixed) && array_key_exists($mixed, $this->gamestate->states)) {
            $this->gamestate->jumpToState($mixed);
        } elseif (method_exists($this, $mixed)) {
            $method = $mixed;
            $this->$method($args);
        } else {
            throw new BgaVisibleSystemException('Failing to jumpToOrCall  : ' . $mixed);
        }
    }


    /////////////////////////////////////////////////////////////
    // Exposing protected methods, please use at your own risk //
    /////////////////////////////////////////////////////////////

    // Exposing protected method getCurrentPlayerId
    public function getCurrentPId()
    {
        return $this->getCurrentPlayerId();
    }

    // Exposing protected method translation
    public static function translate($text)
    {
        return self::_($text);
    }




    // .########..#######..##.....##.########..####.########
    // ......##..##.....##.###...###.##.....##..##..##......
    // .....##...##.....##.####.####.##.....##..##..##......
    // ....##....##.....##.##.###.##.########...##..######..
    // ...##.....##.....##.##.....##.##.....##..##..##......
    // ..##......##.....##.##.....##.##.....##..##..##......
    // .########..#######..##.....##.########..####.########

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    public function zombieTurn($state, $activePlayer)
    {
        $stateName = $state['name'];
        if ($state['type'] == 'activeplayer') {
            if ($stateName == 'confirmTurn') {
                $this->actConfirmTurn(true);
            } else if ($stateName == 'confirmPartialTurn') {
                $this->actConfirmPartialTurn(true);
            }
            // Clear all node of player
            else if (Engine::getNextUnresolved() != null) {
                Engine::clearZombieNodes($activePlayer);
                Engine::proceed();
            } else {
                // TODO: check if we need this
                $this->gamestate->nextState('zombiePass');
            }
        } else if ($state['type'] == 'multipleactiveplayer') {
            $this->gamestate->setPlayerNonMultiactive($activePlayer, 'zombiePass');
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */

    function upgradeTableDb($from_version)
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //


    }
}
