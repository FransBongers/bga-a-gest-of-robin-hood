<?php

namespace AGestOfRobinHood\Helpers;

abstract class Locations extends \APP_DbObject
{

  public static function cardPool()
  {
    return 'cardPool';
  }

  public static function discard()
  {
    return 'discard';
  }

}
