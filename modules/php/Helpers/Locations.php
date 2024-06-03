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

  public static function justiceTrack($value)
  {
    return 'justiceTrack_' . $value;
  }

  public static function orderTrack($value)
  {
    return 'orderTrack_' . $value;
  }

  public static function royalFavourTrack($direction, $value)
  {
    return implode('_', [$direction . 'Track', $value]);
  }

  public static function royalInspectionTrack($spot)
  {
    return 'royalInspectionTrack_' . $spot;
  }

  public static function initiativeTrack($spot)
  {
    return 'initiativeTrack_' . $spot;
  }

  public static function usedCarriages()
  {
    return 'usedCarriages';
  }
}
