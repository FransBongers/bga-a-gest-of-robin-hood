<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * agestofrobinhood implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * agestofrobinhood.action.php
 *
 * agestofrobinhood main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/agestofrobinhood/agestofrobinhood/myAction.html", ...)
 *
 */

use AGestOfRobinHood\Helpers\Utils;

class action_agestofrobinhood extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if (self::isArg('notifwindow')) {
      $this->view = "common_notifwindow";
      $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
    } else {
      $this->view = "agestofrobinhood_agestofrobinhood";
      self::trace("Complete reinitialization of board game");
    }
  }

  /*************************
   **** GENERIC METHODS ****
   *************************/

  // public function restart()
  // {
  //   self::setAjaxMode();
  //   $result = $this->game->restart();
  //   self::ajaxResponse();
  // }

  // public function passTurn()
  // {
  //   self::setAjaxMode();
  //   $result = $this->game->passTurn();
  //   self::ajaxResponse();
  // }

  // public function endGame()
  // {
  //   self::setAjaxMode();
  //   $result = $this->game->endGame();
  //   self::ajaxResponse();
  // }

  public function actConfirmTurn()
  {
    self::setAjaxMode();
    $this->game->actConfirmTurn();
    self::ajaxResponse();
  }

  public function actConfirmPartialTurn()
  {
    self::setAjaxMode();
    $this->game->actConfirmPartialTurn();
    self::ajaxResponse();
  }

  public function actPassOptionalAction()
  {
    self::setAjaxMode();
    $result = $this->game->actPassOptionalAction();
    self::ajaxResponse();
  }

  public function actRestart()
  {
    self::setAjaxMode();
    $this->game->actRestart();
    self::ajaxResponse();
  }

  public function actUndoToStep()
  {
    self::setAjaxMode();
    $args = self::getArg('args', AT_json, true);
    Utils::validateJSonAlphaNum($args, 'args');
    $stepId = $args['stepId'];
    $this->game->actUndoToStep($stepId);
    self::ajaxResponse();
  }

  public function actTakeAtomicAction()
  {
    self::setAjaxMode();
    $action = self::getArg('actionName', AT_alphanum, true);
    $args = self::getArg('args', AT_json, true);
    Utils::validateJSonAlphaNum($args, 'args');
    $this->game->actTakeAtomicAction($action, $args);
    self::ajaxResponse();
  }
}
