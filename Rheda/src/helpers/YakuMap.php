<?php
/*  Rheda: visualizer and control panel
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
namespace Rheda;

class Yaku
{
    /**
     * @return array
     *
     * @psalm-return array{34: mixed, 19: mixed, 21: mixed, 25: mixed, 9: mixed, 35: mixed, 12: mixed, 32: mixed, 36: mixed, 8: mixed, 43: mixed, 33: mixed, 38: mixed, 30: mixed, 10: mixed, 3: mixed, 5: mixed, 11: mixed, 4: mixed, 7: mixed, 6: mixed, 23: mixed, 39: mixed, 1: mixed, 37: mixed, 27: mixed, 2: mixed, 41: mixed, 22: mixed, 42: mixed, 24: mixed, 31: mixed, 28: mixed, 26: mixed, 40: mixed, 29: mixed, 18: mixed, 20: mixed, 13: mixed, 14: mixed, 15: mixed, 16: mixed, 17: mixed, 44: mixed}
     */
    public static function getMap(): array
    {
        return [
            34 => _t("Daburu riichi"),
            19 => _t("Dai sangen"),
            21 => _t("Dai suushii"),
            25 => _t("Junchan"),
            9  => _t("Iipeikou"),
            35 => _t("Ippatsu"),
            12 => _t("Itsu"),
            32 => _t("Kokushi musou"),
            36 => _t("Menzen tsumo"),
            8  => _t("Pinfu"),
            43 => _t("Renhou"),
            33 => _t("Riichi"),
            38 => _t("Rinshan kaihou"),
            30 => _t("Ryuu iisou"),
            10 => _t("Ryan peikou"),
            3  => _t("San ankou"),
            5  => _t("San kantsu"),
            11 => _t("Sanshoku"),
            4  => _t("Sanshoku dokou"),
            7  => _t("Suu ankou"),
            6  => _t("Suu kantsu"),
            23 => _t("Tanyao"),
            39 => _t("Tenhou"),
            1  => _t("Toi-toi"),
            37 => _t("Haitei"),
            27 => _t("Honitsu"),
            2  => _t("Honroutou"),
            41 => _t("Houtei"),
            22 => _t("Tsuu iisou"),
            42 => _t("Chan kan"),
            24 => _t("Chanta"),
            31 => _t("Chiitoitsu"),
            28 => _t("Chinitsu"),
            26 => _t("Chinroutou"),
            40 => _t("Chihou"),
            29 => _t("Chuuren pooto"),
            18 => _t("Shou sangen"),
            20 => _t("Shou suushii"),
            13 => _t("Yakuhai x1"),
            14 => _t("Yakuhai x2"),
            15 => _t("Yakuhai x3"),
            16 => _t("Yakuhai x4"),
            17 => _t("Yakuhai x5"),
            44 => _t("Open riichi")
        ];
    }
}
