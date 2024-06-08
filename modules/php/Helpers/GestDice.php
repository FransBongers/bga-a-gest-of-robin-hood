<?php

namespace AGestOfRobinHood\Helpers;

class GestDice extends \APP_DbObject
{
  public static function rollGreenDie() {
    $result = bga_rand(0,5);
    return GREEN_DIE_FACES[$result];
  }

  public static function rollWhiteDie() {
    $result = bga_rand(0,5);
    return WHITE_DIE_FACES[$result];
  }
}
