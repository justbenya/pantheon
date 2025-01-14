<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace Mimir;

require_once __DIR__ . '/../../src/rulesets/Ruleset.php';
require_once __DIR__ . '/../../src/helpers/YakuMap.php';

class MockRuleset extends Ruleset
{
    public $_title = 'mock';
    protected $_ruleset = [];

    /**
     * @var array
     */
    public static $defaultRuleset = [
        'tenboDivider'          => 1,
        'ratingDivider'         => 1,
        'startRating'           => 0,
        'oka'                   => 0,
        'startPoints'           => 30000,
        'goalPoints'            => 0,
        'playAdditionalRounds'  => false,
        'riichiGoesToWinner'    => true,
        'extraChomboPayments'   => false,
        'chomboPenalty'         => 20000,
        'withAtamahane'         => false,
        'withAbortives'         => false,
        'withKuitan'            => true,
        'withKazoe'             => false,
        'withButtobi'           => false,
        'withMultiYakumans'     => false,
        'withOpenRiichi'        => false,
        'withNagashiMangan'     => false,
        'withKiriageMangan'     => false,
        'tonpuusen'             => false,
        'gameExpirationTime'    => false,
        'withLeadingDealerGameOver' => false,
        'uma' => [
            1 => 15000,
            2 => 5000,
            3 => -5000,
            4 => -15000
        ],
    ];

    public function allowedYaku()
    {
        return YakuMap::allYaku();
    }

    /**
     * @param string $name
     * @param mixed $value
     * @return void
     */
    public function setRule($name, $value)
    {
        $this->_ruleset[$name] = $value;
    }

    /**
     * @param int|float $currentRating
     * @param int $place
     * @param int $points
     * @param array $allScores
     * @return float|int
     */
    public function calcRating($currentRating, $place, $points, $allScores)
    {
        return $currentRating + (
            ($points + $this->uma()[$place]) / (float)$this->ratingDivider()
        );
    }
}
