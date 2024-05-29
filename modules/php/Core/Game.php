<?php
namespace AGestOfRobinHood\Core;
use agestofrobinhood;

/*
 * Game: a wrapper over table object to allow more generic modules
 */
class Game
{
  public static function get()
  {
    return agestofrobinhood::get();
  }
}
