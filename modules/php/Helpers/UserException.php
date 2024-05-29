<?php
namespace AGestOfRobinHood\Helpers;
use AGestOfRobinHood\Core\Game;

class UserException extends \BgaUserException
{
  public function __construct($str)
  {
    parent::__construct(Game::get()::translate($str));
  }
}
?>
