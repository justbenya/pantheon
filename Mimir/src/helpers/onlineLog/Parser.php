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

require_once __DIR__ . '/../../exceptions/Parser.php';
require_once __DIR__ . '/../../helpers/YakuMap.php';
require_once __DIR__ . '/../../FreyClient.php';
require_once __DIR__ . '/../../primitives/Round.php';
require_once __DIR__ . '/../../primitives/PlayerHistory.php';

class OnlineParser
{
    protected $_checkScores = [];
    protected $_roundData = [];
    /**
     * (username => PlayerPrimitive)
     * @var PlayerPrimitive[]
     */
    protected $_players = [];
    protected $_ds;
    protected $_riichi = [];

    protected $_lastTokenIsAgari = false;

    public function __construct(DataSource $ds)
    {
        $this->_ds = $ds;
    }

    /**
     * @param SessionPrimitive $session
     * @param string $content game log xml string
     * @throws \Exception
     * @return array parsed score
     */
    public function parseToSession(SessionPrimitive $session, $content, $withChips = false)
    {
        $reader = new \XMLReader();
        $reader->XML($content);

        while ($reader->read()) {
            if ($reader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if (is_callable([$this, '_token' . $reader->localName])) {
                $method = '_token' . $reader->localName;
                $this->$method($reader, $session);
            }
        }

        // It is vital to save session and assign session id here,
        // otherwise online game processing will fail in some cases.
        // More details you can find here: https://pantheon.myjetbrains.com/youtrack/issue/PNTN-233
        $success = $session->save();

        $scores = [];
        $rounds = [];
        foreach ($this->_roundData as $round) {
            $savedRound = RoundPrimitive::createFromData($this->_ds, $session, $round);
            $rounds []= $savedRound;
            $success = $success && $session->updateCurrentState($savedRound);
            $scores []= $session->getCurrentState()->getScores();
        }

        $debug = [];
        for ($i = 0; $i < count($this->_checkScores); $i++) {
            $debug[]= "Expected\t"
                . implode("\t", $this->_checkScores[$i])
                . "\t:: Got\t"
                . implode("\t", $scores[$i]);
        }

        if ($withChips) {
            $session->setChips($this->_parseChipsOutcome($content));
        }

        return [$success, $this->_parseOutcome($content), $rounds, $debug];
    }

    /**
     * Much simpler to get final scores by regex :)
     *
     * @param $content
     * @return array (player id => score)
     */
    protected function _parseOutcome($content)
    {
        $regex = "#owari=\"([^\"]*)\"#";
        $matches = [];

        if (preg_match($regex, $content, $matches)) {
            $parts = explode(',', $matches[1]);
            return array_combine(
                array_map(function (PlayerPrimitive $p) {
                    return $p->getId();
                }, $this->_players),
                [
                    intval($parts[0] . '00'),
                    intval($parts[2] . '00'),
                    intval($parts[4] . '00'),
                    intval($parts[6] . '00')
                ]
            );
        }

        return [];
    }

    /**
     * @param $content
     * @return array (player id => chips)
     */
    protected function _parseChipsOutcome($content)
    {
        $regex = "#owari=\"([^\"]*)\"#";
        $matches = [];

        if (preg_match($regex, $content, $matches)) {
            $parts = explode(',', $matches[1]);
            return array_combine(
                array_map(function (PlayerPrimitive $p) {
                    return $p->getId();
                }, $this->_players),
                [
                    intval($parts[8]),
                    intval($parts[10]),
                    intval($parts[12]),
                    intval($parts[14])
                ]
            );
        }

        return [];
    }

    /**
     * Get nagashi scores
     *
     * @param $content
     * @return string comma-separated player ids
     */
    protected function _parseNagashi($content): string
    {
        list(
            /* score1 */, $delta1,
            /* score2 */, $delta2,
            /* score3 */, $delta3,
            /* score4 */, $delta4
        ) = array_map('intval', explode(',', $content));

        $ids = [];
        foreach ([$delta1, $delta2, $delta3, $delta4] as $idx => $val) {
            if ($val > 0) {
                $ids []= array_values($this->_players)[$idx]->getId();
            }
        }

        return implode(',', $ids);
    }

    protected function _getRiichi(): string
    {
        $riichis = $this->_riichi;
        $this->_riichi = [];
        return implode(',', $riichis);
    }

    /**
     * @param null|string $str
     *
     * @return string[]
     *
     * @psalm-return array{0: string, 1: string, 2: string, 3: string}
     */
    protected function _makeScores(?string $str): array
    {
        $parts = explode(',', $str);
        return [
            ($parts[0] + $parts[1]) . '00',
            ($parts[2] + $parts[3]) . '00',
            ($parts[4] + $parts[5]) . '00',
            ($parts[6] + $parts[7]) . '00'
        ];
    }

    /**
     * This actually should be called first, before any round.
     * If game format is not changed, this won't break.
     *
     * @param \XMLReader $reader
     * @param SessionPrimitive $session
     *
     * @throws ParseException
     * @throws \Exception
     *
     * @return void
     */
    protected function _tokenUN(\XMLReader $reader, SessionPrimitive $session): void
    {
        if (count($this->_players) == 0) {
            $this->_players = [
                rawurldecode($reader->getAttribute('n0')) => 1,
                rawurldecode($reader->getAttribute('n1')) => 1,
                rawurldecode($reader->getAttribute('n2')) => 1,
                rawurldecode($reader->getAttribute('n3')) => 1
            ];

            if (!empty($this->_players['NoName'])) {
                throw new ParseException('"NoName" players are not allowed in replays');
            }

            $players = PlayerPrimitive::findByTenhouId($this->_ds, array_keys($this->_players));

            if (count($players) !== count($this->_players)) {
                $registeredPlayers = array_map(function (PlayerPrimitive $p) {
                    return $p->getTenhouId();
                }, $players);
                $missedPlayers = array_diff(array_keys($this->_players), $registeredPlayers);
                $missedPlayers = join(', ', $missedPlayers);
                throw new ParseException('Not all tenhou nicknames were registered in the system: ' . $missedPlayers);
            }

            if ($session->getEvent()->getAllowPlayerAppend()) {
                foreach ($players as $player) {
                    // it is ok to re-register every time, it just will do nothing in db if record exists
                    (new PlayerRegistrationPrimitive($this->_ds))
                        ->setReg($player, $session->getEvent())
                        ->save();
                }
            }

            $session->setPlayers($players);
            $this->_players = array_combine(array_keys($this->_players), $players); // players order should persist
        }
    }

    protected function _tokenAGARI(\XMLReader $reader): void
    {
        $winner = array_keys($this->_players)[$reader->getAttribute('who')];
        $loser = array_keys($this->_players)[$reader->getAttribute('fromWho')];
        $paoPlayer = $reader->getAttribute('paoWho')
            ? array_keys($this->_players)[$reader->getAttribute('paoWho')]
            : null;
        $openHand = $reader->getAttribute('m') ? 1 : 0;
        $outcomeType = ($winner == $loser ? 'tsumo' : 'ron');

        list($fu) = explode(',', $reader->getAttribute('ten'));
        $yakuList = $reader->getAttribute('yaku');
        $yakumanList = $reader->getAttribute('yakuman');

        $yakuData = YakuMap::fromTenhou($yakuList, $yakumanList);

        if (!$this->_lastTokenIsAgari) { // single ron, or first ron in sequence
            $riichi = $this->_getRiichi();
            $this->_roundData [] = [
                'outcome' => $outcomeType,
                'winner_id' => $this->_players[$winner]->getId(),
                'loser_id' => $outcomeType === 'ron' ? $this->_players[$loser]->getId() : null,
                'pao_player_id' => $paoPlayer ? $this->_players[$paoPlayer]->getId() : null,
                'han' => $yakuData['han'],
                'fu' => $fu,
                'multi_ron' => false,
                'dora' => $yakuData['dora'],
                'uradora' => 0,
                'kandora' => 0,
                'kanuradora' => 0,
                'yaku' => implode(',', $yakuData['yaku']),
                'riichi' => $riichi,
                'open_hand' => $openHand
            ];

            $this->_checkScores []= $this->_makeScores($reader->getAttribute('sc'));
        } else {
            // double or triple ron, previous round record should be modified
            $roundRecord = array_pop($this->_roundData);

            if ($roundRecord['outcome'] === 'ron') {
                $roundRecord = [
                    'outcome' => 'multiron',
                    'multi_ron' => 1,
                    'loser_id' => $this->_players[$loser]->getId(),
                    'wins' => [[
                        'winner_id' => $roundRecord['winner_id'],
                        'pao_player_id' => $roundRecord['pao_player_id'],
                        'han' => $roundRecord['han'],
                        'fu' => $roundRecord['fu'],
                        'dora' => $roundRecord['dora'],
                        'uradora' => $roundRecord['uradora'],
                        'kandora' => $roundRecord['kandora'],
                        'kanuradora' => $roundRecord['kanuradora'],
                        'yaku' => $roundRecord['yaku'],
                        'riichi' => $roundRecord['riichi'],
                        'open_hand' => $roundRecord['open_hand']
                    ]]
                ];
            }

            $roundRecord['multi_ron'] ++;
            $roundRecord['wins'] []= [
                'winner_id' => $this->_players[$winner]->getId(),
                'pao_player_id' => $paoPlayer ? $this->_players[$paoPlayer]->getId() : null,
                'han' => $yakuData['han'],
                'fu' => $fu,
                'dora' => $yakuData['dora'],
                'uradora' => 0,
                'kandora' => 0,
                'kanuradora' => 0,
                'yaku' => implode(',', $yakuData['yaku']),
                'riichi' => $this->_getRiichi(),
                'open_hand' => $openHand
            ];

            $this->_roundData []= $roundRecord;

            array_pop($this->_checkScores);
            $this->_checkScores []= $this->_makeScores($reader->getAttribute('sc'));
        }

        $this->_lastTokenIsAgari = true;
    }

    // round start, reset all needed things
    protected function _tokenINIT(): void
    {
        $this->_lastTokenIsAgari = false; // resets double/triple ron sequence
    }

    /**
     * @return void
     */
    protected function _tokenRYUUKYOKU(\XMLReader $reader)
    {
        $rkType = $reader->getAttribute('type');
        $scoreString = $reader->getAttribute('sc');
        $this->_checkScores []= $this->_makeScores($scoreString);

        if ($rkType && $rkType != 'nm') { // abortive draw
            $this->_roundData []= [
                'outcome'   => 'abort',
                'riichi'    => $this->_getRiichi(),
            ];

            return;
        }

        // form array in form of [int 'player id' => bool 'tempai?']
        $tempai = array_filter(
            array_combine(
                array_map(
                    function (PlayerPrimitive $el) {
                        return $el->getId();
                    },
                    $this->_players
                ),
                [
                    !!$reader->getAttribute('hai0'),
                    !!$reader->getAttribute('hai1'),
                    !!$reader->getAttribute('hai2'),
                    !!$reader->getAttribute('hai3'),
                ]
            )
        );

        // Special case for nagashi
        if ($rkType && $rkType == 'nm') {
            $this->_roundData []= [
                'outcome'   => 'nagashi',
                'riichi'    => $this->_getRiichi(),
                'nagashi'   => $this->_parseNagashi($scoreString),
                'tempai'  => implode(',', array_keys($tempai)),
            ];

            return;
        }

        $this->_roundData []= [
            'outcome' => 'draw',
            'tempai'  => implode(',', array_keys($tempai)),
            'riichi'  => $this->_getRiichi(),
        ];
    }

    /**
     * @return void
     */
    protected function _tokenREACH(\XMLReader $reader)
    {
        $player = $reader->getAttribute('who');
        if ($reader->getAttribute('step') == '1') {
            // this is unconfirmed riichi. Confirmed one has step=2.
            // We don't count unconfirmed riichi (e.g. ron on riichi should return bet), so return here.
            return;
        }

        $this->_riichi []= $this->_players[array_keys($this->_players)[$player]]->getId();
    }

    /**
     * @param \XMLReader $reader
     * @param SessionPrimitive $session
     *
     * @throws EntityNotFoundException
     * @throws ParseException
     * @throws \Exception
     *
     * @return void
     */
    protected function _tokenGO(\XMLReader $reader, SessionPrimitive $session): void
    {
        $eventLobby = $session->getEvent()->getLobbyId();

        $lobby = $reader->getAttribute('lobby');
        if ($eventLobby != $lobby) {
            throw new ParseException('Provided replay doesn\'t belong to the event lobby ' . $eventLobby);
        }
    }
}
